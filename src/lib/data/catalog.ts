"use server"

import { sdk } from "@lib/config"
import { HOME_DEAL_HANDLES, pickProducts } from "@lib/mock/home"
import { isMockMode } from "@lib/mock/mode"
import {
  filterCatalog,
  ListingParams,
  Page,
  paginate,
  SortKey,
  sortCatalog,
  toPage,
} from "@lib/util/catalog"
import { salePercent } from "@lib/util/price"
import { toProductVM } from "@lib/viewmodels/product"
import { HttpTypes } from "@medusajs/types"
import type { ProductVM } from "types/viewmodels"
import { getAuthHeaders } from "./cookies"
import { listProducts } from "./products"
import { getRegion } from "./regions"

type ListingInput = {
  countryCode: string
  params: ListingParams
  /** Set on /categories/[handle]. `name` is what the search index stores. */
  category?: { handle: string; name: string }
  /** All categories, to count the products in each one for the sidebar. */
  categories: { handle: string; name: string }[]
  pageSize: number
}

export type Listing = {
  page: Page<ProductVM>
  /** Products in the whole catalog, ignoring every filter. */
  totalAll: number
  /** Products per category handle, ignoring the other filters. */
  categoryCounts: Record<string, number>
  /**
   * Subcategories of the current result ("Rau lá", "Nấm các loại") with their
   * product counts, ignoring the subcategory filter itself so the shopper can
   * switch between them. Empty on the whole catalog without a search (too many
   * to list) and when the search index has no subcategory field yet.
   */
  subcategories: { value: string; count: number }[]
}

// "popular" has no order: the search keeps its own order. Prices are indexed
// as min_price_vnd (backend plan API-2).
const SORT_ORDER: Partial<Record<SortKey, Record<string, "ASC" | "DESC">>> = {
  "price-asc": { min_price_vnd: "ASC" },
  "price-desc": { min_price_vnd: "DESC" },
  newest: { created_at: "DESC" },
}

// Same fields as listProducts, plus the category handle the cards link by.
const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+categories.handle"

type SearchResponse = {
  results: {
    hits: { id: string }[]
    metadata: { count: number }
    facets?: Record<string, { values?: { value: string; count: number }[] }>
  }[]
}

/**
 * Data of the product list page (/store and /categories/[handle]).
 *
 * Mock mode filters the 23 sample products in memory. With the real backend
 * the catalog has thousands of products, so filtering, sorting, paging and
 * counting are done by POST /store/search, and only the products on the
 * current page are read in full from GET /store/products.
 */
export async function getListing({
  countryCode,
  params,
  category,
  categories,
  pageSize,
}: ListingInput): Promise<Listing> {
  if (isMockMode()) {
    const { response } = await listProducts({
      countryCode,
      queryParams: { limit: 100 },
    })
    const catalog = response.products.map(toProductVM)
    const matched = sortCatalog(
      filterCatalog(catalog, {
        category: category?.handle,
        q: params.q,
        inStock: params.inStock,
        onSale: params.onSale,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      }),
      params.sort
    )
    return {
      page: paginate(matched, params.page, pageSize),
      totalAll: catalog.length,
      categoryCounts: Object.fromEntries(
        categories.map((c) => [
          c.handle,
          catalog.filter((p) => p.categoryHandle === c.handle).length,
        ])
      ),
      // The mock catalog has no subcategories.
      subcategories: [],
    }
  }

  const region = await getRegion(countryCode)
  if (!region) {
    return { page: toPage([], 0, 1, pageSize), totalAll: 0, categoryCounts: {}, subcategories: [] }
  }

  // Only filters the user turned on are sent: an undefined value is dropped
  // by JSON.stringify.
  const price =
    params.minPrice || params.maxPrice
      ? { $gte: params.minPrice, $lte: params.maxPrice }
      : undefined
  const baseFilters = {
    q: params.q,
    category: category?.name,
    in_stock: params.inStock || undefined,
    on_sale_vnd: params.onSale || undefined,
    min_price_vnd: price,
  }
  const filters = { ...baseFilters, subcategory: params.sub }
  const mainQuery = (pageNumber: number) => ({
    entity: "product",
    filters,
    pagination: {
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: SORT_ORDER[params.sort],
    },
  })
  // `take: 1` because only metadata.count is read from these.
  const countQuery = (countFilters?: { category: string }) => ({
    entity: "product",
    filters: countFilters,
    pagination: { take: 1 },
  })

  // One request: the page, the whole-catalog count, one count per category.
  // The search API accepts up to 20 queries per request.
  const countedCategories = categories.slice(0, 18)
  const { results } = await search({
    queries: [
      mainQuery(params.page),
      countQuery(),
      ...countedCategories.map((c) => countQuery({ category: c.name })),
    ],
  })
  let [main, ...counts] = results
  const total = main.metadata.count
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // A page past the end (e.g. a stale ?page=9 link): read the last page.
  if (params.page > totalPages) {
    main = (await search({ queries: [mainQuery(totalPages)] })).results[0]
  }

  const ids = main.hits.map((hit) => hit.id)
  const [products, subcategories] = await Promise.all([
    readProducts(ids, region.id),
    // Only inside a category or a search: the whole catalog has about 90 subcategories.
    category || params.q ? listSubcategories(baseFilters) : Promise.resolve([]),
  ])

  return {
    page: toPage(products.map(toProductVM), total, params.page, pageSize),
    totalAll: counts[0].metadata.count,
    categoryCounts: Object.fromEntries(
      countedCategories.map((c, i) => [c.handle, counts[i + 1].metadata.count])
    ),
    subcategories,
  }
}

/**
 * Subcategory counts for the given filters (the subcategory filter left out).
 * A request of its own, so a backend whose index lacks the `subcategory`
 * field (not migrated yet) only loses this list, not the whole page.
 */
async function listSubcategories(filters: object) {
  try {
    const { results } = await search({
      queries: [
        {
          entity: "product",
          filters,
          pagination: { take: 0 },
          search_options: { facets: [{ field: "subcategory", limit: 30 }] },
        },
      ],
    })
    return results[0].facets?.subcategory?.values ?? []
  } catch {
    return []
  }
}

/**
 * "Ưu đãi hôm nay" on the home page: products on sale, biggest discount
 * first. Mock mode keeps the fixed sample list of the design.
 */
export async function listDeals(countryCode: string): Promise<ProductVM[]> {
  if (isMockMode()) {
    const { response } = await listProducts({
      countryCode,
      queryParams: { limit: 100 },
    })
    return pickProducts(response.products.map(toProductVM), HOME_DEAL_HANDLES)
  }

  const region = await getRegion(countryCode)
  if (!region) {
    return []
  }

  // The search has no "discount percent" field, so read every product on
  // sale (a few dozen) and sort them here.
  const { results } = await search({
    queries: [
      {
        entity: "product",
        filters: { on_sale_vnd: true, in_stock: true },
        pagination: { take: 50 },
      },
    ],
  })
  const products = await readProducts(
    results[0].hits.map((hit) => hit.id),
    region.id
  )
  const percent = (p: ProductVM) => salePercent(p.originalPrice, p.price) ?? 0
  return products.map(toProductVM).sort((a, b) => percent(b) - percent(a))
}

// no-store: stock and the "in stock" filter must agree, so neither is cached.
function search(body: object) {
  return sdk.client.fetch<SearchResponse>("/store/search", {
    method: "POST",
    body,
    cache: "no-store",
  })
}

/** Full products for the given ids, in the same order as the ids. */
async function readProducts(ids: string[], regionId: string) {
  if (!ids.length) {
    return []
  }

  const { products } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
  }>("/store/products", {
    method: "GET",
    query: { id: ids, limit: ids.length, region_id: regionId, fields: PRODUCT_FIELDS },
    headers: { ...(await getAuthHeaders()) },
    cache: "no-store",
  })

  // The API does not promise the order of `id`; the search order is the one
  // the user asked for (price, newest...).
  const byId = new Map(products.map((p) => [p.id, p]))
  return ids.map((id) => byId.get(id)).filter((p): p is HttpTypes.StoreProduct => !!p)
}

/**
 * A short row of products: search suggestions, home page rows, "cùng danh
 * mục". One search query, no counts, so it is much lighter than getListing.
 * Products that are out of stock are left out: a short row should only show
 * what can be bought. Returns [] on any error, so the caller's page still renders.
 */
export async function listShortRow({
  countryCode,
  q,
  category,
  take,
}: {
  countryCode: string
  q?: string
  /** `handle` filters the mock catalog, `name` is what the search index stores. */
  category?: { handle: string; name: string }
  take: number
}): Promise<ProductVM[]> {
  try {
    if (isMockMode()) {
      const { response } = await listProducts({ countryCode, queryParams: { limit: 100 } })
      const catalog = response.products.map(toProductVM)
      return filterCatalog(catalog, { category: category?.handle, q, inStock: true, onSale: false }).slice(0, take)
    }
    const region = await getRegion(countryCode)
    if (!region) {
      return []
    }
    const { results } = await search({
      queries: [{ entity: "product", filters: { q, category: category?.name, in_stock: true }, pagination: { take } }],
    })
    const products = await readProducts(results[0].hits.map((hit) => hit.id), region.id)
    return products.map(toProductVM)
  } catch {
    return []
  }
}

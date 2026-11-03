"use server"

import { sdk } from "@lib/config"
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
  results: { hits: { id: string }[]; metadata: { count: number } }[]
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
    }
  }

  const region = await getRegion(countryCode)
  if (!region) {
    return { page: toPage([], 0, 1, pageSize), totalAll: 0, categoryCounts: {} }
  }

  // Only filters the user turned on are sent: an undefined value is dropped
  // by JSON.stringify.
  const filters = {
    q: params.q,
    category: category?.name,
    in_stock: params.inStock || undefined,
    on_sale_vnd: params.onSale || undefined,
  }
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
  const products = await readProducts(ids, region.id)

  return {
    page: toPage(products.map(toProductVM), total, params.page, pageSize),
    totalAll: counts[0].metadata.count,
    categoryCounts: Object.fromEntries(
      countedCategories.map((c, i) => [c.handle, counts[i + 1].metadata.count])
    ),
  }
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

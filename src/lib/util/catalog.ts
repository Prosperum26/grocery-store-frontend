import type { ProductVM } from "types/viewmodels"

// Filtering, sorting and paging of the product list (PLP). Pure functions so
// they can be tested; the page reads the query from the URL and passes it in.

export const SORT_KEYS = ["popular", "price-asc", "price-desc", "newest"] as const
export type SortKey = (typeof SORT_KEYS)[number]

export const SORT_LABELS: Record<SortKey, string> = {
  popular: "Phổ biến",
  "price-asc": "Giá tăng dần",
  "price-desc": "Giá giảm dần",
  newest: "Mới nhất",
}

export type CatalogQuery = {
  /** Category handle, e.g. "rau-cu". Empty means all categories. */
  category?: string
  /** Free text, matched against the product name without accents. */
  q?: string
  /** "Chỉ hiện còn hàng". */
  inStock?: boolean
  /** "Đang giảm giá". */
  onSale?: boolean
  sort?: SortKey
}

/** Unknown or missing values fall back to the default order. */
export function parseSort(value: unknown): SortKey {
  return SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : "popular"
}

/** Lower case, accents removed, "đ" folded to "d": "Cà rốt" matches "ca rot". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
}

export function filterCatalog(products: ProductVM[], query: CatalogQuery): ProductVM[] {
  const term = query.q ? normalizeText(query.q) : ""
  return products.filter(
    (p) =>
      (!query.category || p.categoryHandle === query.category) &&
      (!query.inStock || p.stockQty > 0) &&
      (!query.onSale || p.originalPrice !== undefined) &&
      (!term || normalizeText(p.title).includes(term))
  )
}

/** Returns a new array; "popular" keeps the catalog order. */
export function sortCatalog(products: ProductVM[], sort: SortKey = "popular"): ProductVM[] {
  const list = [...products]
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price)
    case "price-desc":
      return list.sort((a, b) => b.price - a.price)
    case "newest":
      // ISO dates compare correctly as strings.
      return list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    default:
      return list
  }
}

/** Everything the listing reads from the URL. */
export type ListingParams = {
  q?: string
  inStock: boolean
  onSale: boolean
  sort: SortKey
  page: number
}

type RawSearchParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Reads ?q=&stock=1&sale=1&sort=&page= . Anything unreadable gets its default. */
export function parseListingParams(raw: RawSearchParams): ListingParams {
  const q = first(raw.q)?.trim()
  const page = Number.parseInt(first(raw.page) ?? "1", 10)
  return {
    q: q || undefined,
    inStock: first(raw.stock) === "1",
    onSale: first(raw.sale) === "1",
    sort: parseSort(first(raw.sort)),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

/**
 * Link to the listing with the given state. Defaults are left out of the URL
 * so the plain path stays clean and shareable.
 */
export function listingHref(basePath: string, params: Partial<ListingParams>): string {
  const search = new URLSearchParams()
  if (params.q) search.set("q", params.q)
  if (params.inStock) search.set("stock", "1")
  if (params.onSale) search.set("sale", "1")
  if (params.sort && params.sort !== "popular") search.set("sort", params.sort)
  if (params.page && params.page > 1) search.set("page", String(params.page))
  const qs = search.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

/**
 * Page numbers to show: all of them when there are few, otherwise the first,
 * the last, and the current page with its neighbours. Gaps are "…".
 */
export function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const shown = [1, total, current - 1, current, current + 1]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
    .filter((p, i, arr) => arr.indexOf(p) === i)
  const out: (number | "…")[] = []
  let prev = 0
  for (const p of shown) {
    if (p - prev === 2) out.push(prev + 1)
    else if (p - prev > 2) out.push("…")
    out.push(p)
    prev = p
  }
  return out
}

export type Page<T> = {
  items: T[]
  /** The page actually shown, clamped to 1..totalPages. */
  page: number
  totalPages: number
  /** 1-based index of the first and last item on this page; 0 when empty. */
  from: number
  to: number
  total: number
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages)
  const start = (current - 1) * pageSize
  const slice = items.slice(start, start + pageSize)
  return {
    items: slice,
    page: current,
    totalPages,
    from: slice.length ? start + 1 : 0,
    to: start + slice.length,
    total: items.length,
  }
}

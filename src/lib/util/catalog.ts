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
  /** Price range in VND, both ends included. */
  minPrice?: number
  maxPrice?: number
  sort?: SortKey
}

/** Quick price ranges of the sidebar. `max` undefined means no upper end. */
export const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "Dưới 20.000đ", max: 20000 },
  { label: "20.000đ – 50.000đ", min: 20000, max: 50000 },
  { label: "50.000đ – 100.000đ", min: 50000, max: 100000 },
  { label: "Trên 100.000đ", min: 100000 },
]

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
      (query.minPrice === undefined || p.price >= query.minPrice) &&
      (query.maxPrice === undefined || p.price <= query.maxPrice) &&
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
  /** Price range in VND (?min=&max=). */
  minPrice?: number
  maxPrice?: number
  /** Subcategory inside the category, e.g. "Rau lá" (?loai=). */
  sub?: string
  sort: SortKey
  page: number
}

type RawSearchParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** A whole number of đồng above 0, or undefined for anything else ("", "abc", "-5"). */
function parsePrice(v: string | string[] | undefined): number | undefined {
  const n = Number.parseInt(first(v) ?? "", 10)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** Reads ?q=&stock=1&sale=1&min=&max=&loai=&sort=&page= . Anything unreadable gets its default. */
export function parseListingParams(raw: RawSearchParams): ListingParams {
  const q = first(raw.q)?.trim()
  const sub = first(raw.loai)?.trim()
  const page = Number.parseInt(first(raw.page) ?? "1", 10)
  let minPrice = parsePrice(raw.min)
  let maxPrice = parsePrice(raw.max)
  // "từ 50.000 đến 20.000" is read as the range the shopper meant.
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    ;[minPrice, maxPrice] = [maxPrice, minPrice]
  }
  return {
    q: q || undefined,
    inStock: first(raw.stock) === "1",
    onSale: first(raw.sale) === "1",
    minPrice,
    maxPrice,
    sub: sub || undefined,
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
  if (params.minPrice) search.set("min", String(params.minPrice))
  if (params.maxPrice) search.set("max", String(params.maxPrice))
  if (params.sub) search.set("loai", params.sub)
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

/**
 * Describes one page when `items` is already that page's slice and `total` is
 * the size of the whole result (the backend search pages on the server).
 */
export function toPage<T>(items: T[], total: number, page: number, pageSize: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages)
  const start = (current - 1) * pageSize
  return {
    items,
    page: current,
    totalPages,
    from: items.length ? start + 1 : 0,
    to: start + items.length,
    total,
  }
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const { page: current } = toPage([], items.length, page, pageSize)
  const start = (current - 1) * pageSize
  return toPage(items.slice(start, start + pageSize), items.length, current, pageSize)
}

/** True when any filter narrows the list (sorting and paging do not count). */
export function hasListingFilters(params: ListingParams): boolean {
  return Boolean(
    params.q || params.inStock || params.onSale || params.minPrice || params.maxPrice || params.sub
  )
}

// Syllables too common in product names to say anything as a pair ("gói 200g", "loại 1").
const RELATED_STOP = new Set([
  "goi", "hop", "chai", "lon", "tui", "khay", "vi", "bich", "thung", "loc", "ly", "hu",
  "va", "voi", "cho", "cua", "loai", "con", "trai", "bo", "kg", "g", "ml", "l",
])

/**
 * Two-word phrases that come up in several product names of the list, most
 * frequent first ("đà lạt", "hữu cơ", "rau muống"). The sidebar offers them as
 * extra keywords. Words already in the query are left out.
 */
export function relatedWords(titles: string[], query = "", limit = 6): string[] {
  const asked = new Set(normalizeText(query).split(/\s+/).filter(Boolean))
  const counts = new Map<string, { label: string; n: number }>()
  for (const title of titles) {
    // Words with a digit ("200g", "1kg") are sizes, not keywords.
    const words = title
      .toLowerCase()
      .split(/[\s,.;:()/+&%-]+/)
      .filter((w) => w && !/\d/.test(w))
    const seen = new Set<string>()
    for (let i = 0; i + 1 < words.length; i++) {
      const pair = [words[i], words[i + 1]]
      const keys = pair.map(normalizeText)
      if (keys.some((k) => k.length < 2 || RELATED_STOP.has(k) || asked.has(k))) continue
      const key = keys.join(" ")
      if (seen.has(key)) continue // a title counts once per phrase
      seen.add(key)
      const entry = counts.get(key) ?? { label: pair.join(" "), n: 0 }
      entry.n++
      counts.set(key, entry)
    }
  }
  return Array.from(counts.values())
    .filter((e) => e.n >= 2)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((e) => e.label)
}

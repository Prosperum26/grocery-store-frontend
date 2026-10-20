import { describe, expect, it } from "vitest"
import type { ProductVM } from "types/viewmodels"

import {
  filterCatalog,
  listingHref,
  normalizeText,
  pageWindow,
  paginate,
  parseListingParams,
  parseSort,
  sortCatalog,
} from "./catalog"

function product(over: Partial<ProductVM> & { handle: string }): ProductVM {
  return {
    id: `id_${over.handle}`,
    title: over.handle,
    unitLabel: "1 kg",
    price: 10000,
    stockQty: 5,
    stockUnit: "kg",
    lowStock: 10,
    tint: "green",
    variants: [],
    ...over,
  }
}

const CATALOG: ProductVM[] = [
  product({ handle: "ca-chua", title: "Cà chua Đà Lạt", categoryHandle: "rau-cu", price: 32000, createdAt: "2026-10-01T00:00:00Z" }),
  product({ handle: "bong-cai", title: "Bông cải xanh", categoryHandle: "rau-cu", price: 35000, originalPrice: 42000, stockQty: 23, createdAt: "2026-10-03T00:00:00Z" }),
  product({ handle: "tom", title: "Tôm thẻ tươi", categoryHandle: "hai-san", price: 99000, stockQty: 0, createdAt: "2026-10-02T00:00:00Z" }),
  product({ handle: "gao", title: "Gạo ST25", categoryHandle: "gao-do-kho", price: 185000, createdAt: "2026-10-04T00:00:00Z" }),
]

describe("normalizeText", () => {
  it("drops accents and folds đ so search ignores diacritics", () => {
    expect(normalizeText("Cà Rốt Đà Lạt")).toBe("ca rot da lat")
  })
})

describe("filterCatalog", () => {
  it("keeps everything with an empty query", () => {
    expect(filterCatalog(CATALOG, {})).toHaveLength(4)
  })

  it("filters by category handle", () => {
    expect(filterCatalog(CATALOG, { category: "rau-cu" }).map((p) => p.handle)).toEqual(["ca-chua", "bong-cai"])
  })

  it("hides out-of-stock products when inStock is on", () => {
    expect(filterCatalog(CATALOG, { inStock: true }).map((p) => p.handle)).not.toContain("tom")
  })

  it("keeps only discounted products when onSale is on", () => {
    expect(filterCatalog(CATALOG, { onSale: true }).map((p) => p.handle)).toEqual(["bong-cai"])
  })

  it("matches the name without accents", () => {
    expect(filterCatalog(CATALOG, { q: "ca chua" }).map((p) => p.handle)).toEqual(["ca-chua"])
    expect(filterCatalog(CATALOG, { q: "TÔM" }).map((p) => p.handle)).toEqual(["tom"])
  })

  it("combines filters", () => {
    expect(filterCatalog(CATALOG, { category: "rau-cu", inStock: true }).map((p) => p.handle)).toEqual(["ca-chua", "bong-cai"])
    expect(filterCatalog(CATALOG, { category: "hai-san", inStock: true })).toEqual([])
  })
})

describe("sortCatalog", () => {
  it("keeps catalog order for popular and does not mutate the input", () => {
    const before = CATALOG.map((p) => p.handle)
    expect(sortCatalog(CATALOG, "popular").map((p) => p.handle)).toEqual(before)
    expect(CATALOG.map((p) => p.handle)).toEqual(before)
  })

  it("sorts by price both ways", () => {
    expect(sortCatalog(CATALOG, "price-asc")[0].handle).toBe("ca-chua")
    expect(sortCatalog(CATALOG, "price-desc")[0].handle).toBe("gao")
  })

  it("sorts newest first", () => {
    expect(sortCatalog(CATALOG, "newest").map((p) => p.handle)).toEqual(["gao", "bong-cai", "tom", "ca-chua"])
  })
})

describe("parseSort", () => {
  it("accepts known keys and falls back to popular", () => {
    expect(parseSort("price-asc")).toBe("price-asc")
    expect(parseSort("bogus")).toBe("popular")
    expect(parseSort(undefined)).toBe("popular")
  })
})

describe("parseListingParams and listingHref", () => {
  it("reads the URL with defaults for anything missing or broken", () => {
    expect(parseListingParams({})).toEqual({ q: undefined, inStock: false, onSale: false, sort: "popular", page: 1 })
    expect(parseListingParams({ stock: "1", sale: "0", sort: "nope", page: "-3", q: "  ca  " })).toEqual({
      q: "ca",
      inStock: true,
      onSale: false,
      sort: "popular",
      page: 1,
    })
    expect(parseListingParams({ page: ["4", "9"] }).page).toBe(4)
  })

  it("builds links without default values", () => {
    expect(listingHref("/vn/store", {})).toBe("/vn/store")
    expect(listingHref("/vn/store", { inStock: true, sort: "price-asc", page: 2 })).toBe(
      "/vn/store?stock=1&sort=price-asc&page=2"
    )
    expect(listingHref("/vn/store", { q: "ca chua", onSale: true })).toBe("/vn/store?q=ca+chua&sale=1")
  })

  it("round-trips through the URL", () => {
    const href = listingHref("/vn/store", { q: "tôm", inStock: true, onSale: true, sort: "newest", page: 3 })
    const search = new URL(href, "http://x").searchParams
    expect(parseListingParams(Object.fromEntries(search))).toEqual({
      q: "tôm",
      inStock: true,
      onSale: true,
      sort: "newest",
      page: 3,
    })
  })
})

describe("pageWindow", () => {
  it("lists every page when there are seven or fewer", () => {
    expect(pageWindow(3, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pageWindow(1, 1)).toEqual([1])
  })

  it("shows the ends, the neighbours of the current page and gaps", () => {
    expect(pageWindow(1, 14)).toEqual([1, 2, "…", 14])
    expect(pageWindow(7, 14)).toEqual([1, "…", 6, 7, 8, "…", 14])
    expect(pageWindow(14, 14)).toEqual([1, "…", 13, 14])
  })

  it("fills a single-page gap instead of showing an ellipsis for it", () => {
    expect(pageWindow(4, 10)).toEqual([1, 2, 3, 4, 5, "…", 10])
  })
})

describe("paginate", () => {
  const nums = Array.from({ length: 23 }, (_, i) => i + 1)

  it("slices pages of the given size and reports the range", () => {
    const p = paginate(nums, 2, 9)
    expect(p.items[0]).toBe(10)
    expect(p.items).toHaveLength(9)
    expect(p.from).toBe(10)
    expect(p.to).toBe(18)
    expect(p.totalPages).toBe(3)
  })

  it("clamps out-of-range pages", () => {
    expect(paginate(nums, 99, 9).page).toBe(3)
    expect(paginate(nums, -4, 9).page).toBe(1)
    expect(paginate(nums, Number.NaN, 9).page).toBe(1)
  })

  it("handles an empty list as one empty page", () => {
    const p = paginate([], 1, 9)
    expect(p).toMatchObject({ items: [], page: 1, totalPages: 1, from: 0, to: 0, total: 0 })
  })
})

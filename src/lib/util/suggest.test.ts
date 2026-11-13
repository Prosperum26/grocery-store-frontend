import { describe, expect, it } from "vitest"
import type { RawKitchenItem } from "./kitchen"
import { addLinesOf, cartSignature, formatMissing, introNames, introText, recipeMeta, thumbnailsOf, type RawSuggestion } from "./suggest"

const variant = (id: string, price: number, thumbnail: string | null = null, available = 5) => ({
  variant_id: id, product_id: `p-${id}`, handle: id, thumbnail, title: id, unit_label: "gói", unit_price: price, available, purchasable: available > 0,
})
const item = (catalogId: string, price: number, extra: Partial<RawKitchenItem> = {}, thumb: string | null = null): RawKitchenItem => ({
  ingredient: `nl ${catalogId}`, kind: "core", raw_text: catalogId, derived: false, default_qty: 1, pack_hint: null, need: null,
  product: { catalog_id: catalogId, name: catalogId }, variant: variant(`v-${catalogId}`, price, thumb), alternatives: [], ...extra,
})
const suggestion = (names: string[], buy: RawKitchenItem[] = []): RawSuggestion => ({
  recipe: { id: "r", name: "Canh chua", family: null, servings: 4, time_minutes: 35, difficulty: null, description: null, image_url: null, source_url: "u" },
  matched: names.map((n, i) => ({ catalog_id: `C${i}`, name: n })), new_count: null, familiar_count: null,
  missing_count: buy.length, missing_total: 0, basket: { buy, maybe_have: [] },
})

describe("cartSignature", () => {
  it("does not depend on order or repeats", () => {
    expect(cartSignature(["b", "a", "b"])).toBe(cartSignature(["a", "b"]))
    expect(cartSignature(["a"])).not.toBe(cartSignature(["a", "b"]))
  })
})

describe("intro", () => {
  it("names at most two ingredients, lower case, and counts the rest", () => {
    const names = introNames([suggestion(["Cá lóc", "Cà chua"]), suggestion(["Cà chua", "Me", "Dứa"])])
    expect(names).toEqual({ shown: ["cá lóc", "cà chua"], more: 2 })
    expect(introText(names)).toBe("Mình thấy bạn có cá lóc, cà chua và 2 nguyên liệu khác trong giỏ.")
  })

  it("is empty when nothing matched", () => {
    expect(introText(introNames([suggestion([])]))).toBe("")
  })

  it("has no tail when there is no more", () => {
    expect(introText({ shown: ["cá lóc"], more: 0 })).toBe("Mình thấy bạn có cá lóc trong giỏ.")
  })
})

describe("formatMissing", () => {
  it("says the recipe is covered when nothing is missing", () => {
    expect(formatMissing(0, 0)).toBe("Đã đủ nguyên liệu")
  })
  it("shows the count and the price", () => {
    expect(formatMissing(4, 96500)).toBe("Cần thêm 4 nguyên liệu · +96.500đ")
  })
})

describe("addLinesOf", () => {
  it("adds only the missing lines, packs like the recipe page", () => {
    const s = suggestion(["x"], [item("A", 10000), item("B", 5000, { pack_hint: 3 })])
    expect(addLinesOf(s)).toEqual([
      { variantId: "v-A", quantity: 1, unitPrice: 10000 },
      { variantId: "v-B", quantity: 3, unitPrice: 5000 },
    ])
  })
  it("has nothing to add when the cart already covers the recipe", () => {
    expect(addLinesOf(suggestion(["x"], []))).toEqual([])
  })
})

describe("thumbnailsOf", () => {
  it("keeps up to four distinct photos and skips lines without one", () => {
    const buy = [item("A", 1, {}, "a.jpg"), item("B", 1, {}, null), item("C", 1, {}, "a.jpg"), item("D", 1, {}, "d.jpg")]
    expect(thumbnailsOf(suggestion([], buy))).toEqual(["a.jpg", "d.jpg"])
    const many = ["1", "2", "3", "4", "5"].map((n) => item(n, 1, {}, `${n}.jpg`))
    expect(thumbnailsOf(suggestion([], many))).toHaveLength(4)
  })
})

describe("recipeMeta", () => {
  it("joins servings and time, skipping a missing time", () => {
    expect(recipeMeta({ servings: 4, time_minutes: 35 })).toBe("4 người · 35 phút")
    expect(recipeMeta({ servings: 2, time_minutes: null })).toBe("2 người")
  })
})

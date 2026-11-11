import { describe, expect, it } from "vitest"

import { cardBadges, perKgLabel } from "./product-card"

const variant = (weightGrams?: number) => ({ id: "v", label: "x", price: 0, stockQty: 1, weightGrams })

describe("cardBadges", () => {
  it("shows nothing for a normal product with plenty of stock", () => {
    expect(cardBadges({ price: 10000, stockQty: 40, lowStock: 5 })).toEqual([])
  })

  it("shows the discount and, when few are left, how many", () => {
    expect(cardBadges({ price: 8000, originalPrice: 10000, stockQty: 40, lowStock: 5 })).toEqual([{ kind: "sale", percent: 20 }])
    expect(cardBadges({ price: 8000, originalPrice: 10000, stockQty: 3, lowStock: 5 })).toEqual([
      { kind: "sale", percent: 20 },
      { kind: "low", left: 3 },
    ])
  })

  it("uses 5 as the low-stock line when the product has none", () => {
    expect(cardBadges({ price: 1, stockQty: 5, lowStock: 0 })).toEqual([{ kind: "low", left: 5 }])
    expect(cardBadges({ price: 1, stockQty: 6, lowStock: 0 })).toEqual([])
  })

  it("shows only 'out' when nothing is left, even on sale", () => {
    expect(cardBadges({ price: 8000, originalPrice: 10000, stockQty: 0, lowStock: 5 })).toEqual([{ kind: "out" }])
  })
})

describe("perKgLabel", () => {
  it("gives the price per kilogram for packs sold by weight", () => {
    expect(perKgLabel({ price: 5500, variants: [variant(250)] })).toBe("22.000đ/kg")
  })

  it("is empty when the weight is unknown or the pack is exactly 1 kg", () => {
    expect(perKgLabel({ price: 5500, variants: [variant()] })).toBeNull()
    expect(perKgLabel({ price: 22000, variants: [variant(1000)] })).toBeNull()
    expect(perKgLabel({ price: 22000, variants: [] })).toBeNull()
  })
})

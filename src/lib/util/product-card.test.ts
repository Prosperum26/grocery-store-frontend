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
    expect(perKgLabel({ price: 5500, unitLabel: "túi 250g", variants: [variant(250)] })).toBe("22.000đ/kg")
    expect(perKgLabel({ price: 12700, unitLabel: "65g", variants: [variant(65)] })).toBe("195.400đ/kg")   // rounded to 100đ
  })

  it("is empty when the weight is unknown or the pack is exactly 1 kg", () => {
    expect(perKgLabel({ price: 5500, unitLabel: "gói", variants: [variant()] })).toBeNull()
    expect(perKgLabel({ price: 22000, unitLabel: "1 kg", variants: [variant(1000)] })).toBeNull()
    expect(perKgLabel({ price: 22000, unitLabel: "1 trái", variants: [] })).toBeNull()
  })

  it("is empty for packs sold by volume", () => {
    expect(perKgLabel({ price: 4000, unitLabel: "110ml", variants: [variant(110)] })).toBeNull()
    expect(perKgLabel({ price: 86500, unitLabel: "1 lít", variants: [variant(900)] })).toBeNull()
    expect(perKgLabel({ price: 45000, unitLabel: "chai 500 ml", variants: [variant(500)] })).toBeNull()
  })
})

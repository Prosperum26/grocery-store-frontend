import { describe, expect, it } from "vitest"
import { formatVnd, pricePerKg, salePercent } from "./price"

describe("salePercent", () => {
  it("rounds the discount to a whole percent", () => {
    expect(salePercent(105000, 92000)).toBe(12)
  })
  it("returns null when there is no discount", () => {
    expect(salePercent(92000, 92000)).toBeNull()
  })
  it("returns null when the original price is missing", () => {
    expect(salePercent(undefined, 92000)).toBeNull()
  })
})

describe("pricePerKg", () => {
  it("scales the price of a 500 g pack to one kilogram", () => {
    expect(pricePerKg(85000, 500)).toBe(170000)
  })
  it("returns null without a weight", () => {
    expect(pricePerKg(85000, undefined)).toBeNull()
  })
})

describe("formatVnd", () => {
  it("uses dots as thousand separators and a trailing đ", () => {
    expect(formatVnd(395000)).toBe("395.000đ")
  })
  it("formats small amounts without a separator", () => {
    expect(formatVnd(5000)).toBe("5.000đ")
    expect(formatVnd(900)).toBe("900đ")
  })
})

import { describe, expect, it } from "vitest"
import { MOCK_CART_LINES, mockCartTotals } from "./cart"
import { MOCK_CATEGORIES } from "./categories"
import { MOCK_PRODUCTS, findMockProduct } from "./products"
import { MOCK_ORDERS } from "./orders"

// Numbers below are the ones the v2 design prints (shared.js verify()).
describe("mock catalog", () => {
  it("has the 22 products of the design data", () => {
    expect(MOCK_PRODUCTS).toHaveLength(22)
  })
  it("has 8 categories with fixed handles", () => {
    expect(MOCK_CATEGORIES.map((c) => c.handle)).toEqual([
      "rau-cu",
      "trai-cay",
      "thit",
      "hai-san",
      "trung-sua",
      "gao-do-kho",
      "gia-vi",
      "do-uong",
    ])
  })
  it("prices pork at 92.000đ down from 105.000đ", () => {
    const v = findMockProduct("thit-ba-roi-heo")!.variants![0] as any
    expect(v.calculated_price.calculated_amount).toBe(92000)
    expect(v.calculated_price.original_amount).toBe(105000)
  })
  it("has shrimp out of stock", () => {
    const v = findMockProduct("tom-the-tuoi")!.variants![0]
    expect(v.inventory_quantity).toBe(0)
  })
})

describe("mock cart", () => {
  it("adds up to the design totals", () => {
    expect(mockCartTotals(MOCK_CART_LINES)).toEqual({
      itemCount: 9,
      subtotal: 395000,
      shipping: 15000,
      discount: 20000,
      total: 390000,
    })
  })
})

describe("mock orders", () => {
  it("has the 5 orders of the account page, newest first", () => {
    expect(MOCK_ORDERS.map((o) => o.code)).toEqual([
      "C4F-261007-0142",
      "C4F-261003-0098",
      "C4F-260928-0311",
      "C4F-260924-0207",
      "C4F-260919-0150",
    ])
  })
})

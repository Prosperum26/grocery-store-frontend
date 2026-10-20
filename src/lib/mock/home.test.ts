import { describe, expect, it } from "vitest"
import { toProductVM } from "../viewmodels/product"
import { MOCK_BUY_AGAIN, MOCK_RECIPE, basketTotal, pickProducts } from "./home"
import { MOCK_PRODUCTS } from "./products"

const catalog = MOCK_PRODUCTS.map(toProductVM)

// Totals printed on the v2 home page.
describe("home blocks", () => {
  it("buy-again list adds up to 343.000đ", () => {
    expect(basketTotal(MOCK_BUY_AGAIN, catalog)).toBe(343000)
  })
  it("canh chua recipe needs 6 ingredients for 161.000đ", () => {
    expect(MOCK_RECIPE.ingredients).toHaveLength(6)
    expect(basketTotal(MOCK_RECIPE.ingredients, catalog)).toBe(161000)
  })
})

describe("pickProducts", () => {
  it("keeps the requested order", () => {
    expect(pickProducts(catalog, ["tom-the-tuoi", "ca-loc-phi-le"]).map((p) => p.handle)).toEqual([
      "tom-the-tuoi",
      "ca-loc-phi-le",
    ])
  })
  it("skips handles the catalog does not have", () => {
    expect(pickProducts(catalog, ["khong-co", "gao-st25"]).map((p) => p.handle)).toEqual(["gao-st25"])
  })
})

describe("basketTotal", () => {
  it("ignores lines whose product is missing", () => {
    expect(basketTotal([{ handle: "khong-co", quantity: 3 }], catalog)).toBe(0)
  })
})

import { describe, expect, it } from "vitest"
import { toProductVM } from "../viewmodels/product"
import { pickProducts } from "./home"
import { MOCK_PRODUCTS } from "./products"

const catalog = MOCK_PRODUCTS.map(toProductVM)

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

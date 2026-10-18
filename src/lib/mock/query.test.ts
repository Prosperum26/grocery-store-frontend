import { describe, expect, it } from "vitest"
import { queryMockProducts } from "./query"

describe("queryMockProducts", () => {
  it("pages with limit and offset and reports the full count", () => {
    const { products, count } = queryMockProducts({ limit: 4, offset: 4 })
    expect(products).toHaveLength(4)
    expect(count).toBe(22)
    expect(products[0].handle).toBe("bong-cai-xanh")
  })
  it("filters by handle", () => {
    const { products } = queryMockProducts({ handle: "ca-loc-phi-le" })
    expect(products.map((p) => p.handle)).toEqual(["ca-loc-phi-le"])
  })
  it("filters by category id", () => {
    const { products } = queryMockProducts({ category_id: ["pcat_mock_hai-san"] })
    expect(products.map((p) => p.handle)).toEqual(["ca-loc-phi-le", "tom-the-tuoi"])
  })
  it("filters by product ids", () => {
    const { products } = queryMockProducts({ id: ["prod_mock_1"] })
    expect(products).toHaveLength(1)
  })
  it("orders newest first with -created_at", () => {
    const { products } = queryMockProducts({ order: "-created_at", limit: 1 })
    expect(products[0].handle).toBe("nuoc-mam-ca-com")
  })
  it("returns only discounted products with on_sale", () => {
    const { products } = queryMockProducts({ on_sale: true })
    expect(products.map((p) => p.handle).sort()).toEqual(["bong-cai-xanh", "thit-ba-roi-heo"])
  })
})

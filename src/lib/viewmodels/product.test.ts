import { describe, expect, it } from "vitest"
import { findMockProduct } from "../mock/products"
import { toProductVM } from "./product"

describe("toProductVM", () => {
  it("uses the default variant for price and stock", () => {
    const vm = toProductVM(findMockProduct("ca-loc-phi-le")!)
    expect(vm.price).toBe(85000)
    expect(vm.unitLabel).toBe("Khay 500g")
    expect(vm.stockQty).toBe(3)
    expect(vm.stockUnit).toBe("khay")
    expect(vm.lowStock).toBe(5)
    expect(vm.variants).toHaveLength(3)
  })
  it("keeps the original price only when the product is on sale", () => {
    expect(toProductVM(findMockProduct("thit-ba-roi-heo")!).originalPrice).toBe(105000)
    expect(toProductVM(findMockProduct("ca-chua-da-lat")!).originalPrice).toBeUndefined()
  })
  it("reads art, tint and origin from metadata", () => {
    const vm = toProductVM(findMockProduct("ca-chua-da-lat")!)
    expect(vm).toMatchObject({ art: "tomato", tint: "red", origin: "Đà Lạt", categoryHandle: "rau-cu" })
  })
  it("falls back to safe defaults when metadata is missing", () => {
    const vm = toProductVM({ id: "p1", handle: "x", title: "X", variants: [] } as any)
    expect(vm).toMatchObject({ price: 0, stockQty: 0, stockUnit: "phần", lowStock: 10, tint: "green" })
  })
})

import { describe, expect, it } from "vitest"
import { stockLabel } from "./stock"

describe("stockLabel", () => {
  it("says nothing while stock is above the low-stock threshold", () => {
    expect(stockLabel(86, 10, "kg")).toBeNull()
  })
  it("warns with the remaining count at or below the threshold", () => {
    expect(stockLabel(3, 5, "khay")).toEqual({ state: "low", text: "Còn 3 khay" })
    expect(stockLabel(5, 5, "khay")).toEqual({ state: "low", text: "Còn 5 khay" })
  })
  it("says out of stock at zero", () => {
    expect(stockLabel(0, 10, "khay")).toEqual({ state: "out", text: "Hết hàng" })
  })
})

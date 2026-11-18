import { describe, expect, it } from "vitest"
import { applyStockUpdate, mergeStock, stockLabel, toLiveStock } from "./stock"

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

describe("live stock (backend API-15, API-16)", () => {
  it("toLiveStock keeps managed variants by id, clamps negatives", () => {
    expect(
      toLiveStock([
        { variant_id: "v1", inventory_item_id: "i1", available: 3, held_by_cart: 2 },
        { variant_id: "v2", inventory_item_id: null, available: null, held_by_cart: 0 },
        { variant_id: "v3", inventory_item_id: "i3", available: -1 },
      ])
    ).toEqual({
      v1: { available: 3, inventoryItemId: "i1", heldByCart: 2 },
      v3: { available: 0, inventoryItemId: "i3", heldByCart: 0 },
    })
  })

  it("mergeStock prefers the held-aware number and keeps Medusa's for the rest", () => {
    expect(mergeStock({ v1: 5, v2: 7 }, { v1: { available: 3, inventoryItemId: "i1", heldByCart: 0 } })).toEqual({ v1: 3, v2: 7 })
  })

  it("applyStockUpdate adds this cart's hold back and ignores items not on screen", () => {
    const state = { v1: { available: 3, inventoryItemId: "i1", heldByCart: 2 } }
    expect(applyStockUpdate(state, { inventory_item_id: "i1", available: 0 })).toEqual({ v1: { available: 2, inventoryItemId: "i1", heldByCart: 2 } })
    expect(applyStockUpdate(state, { inventory_item_id: "other", available: 9 })).toBe(state)
  })
})

import { describe, expect, it } from "vitest"
import { buildOrderReceipt, formatPlacedAt } from "./order-receipt"

describe("formatPlacedAt", () => {
  it("shows Vietnam time", () => {
    expect(formatPlacedAt("2026-11-03T05:26:59.803Z")).toBe("03.11.2026 · 12:26")
    expect(formatPlacedAt(null)).toBe("")
    expect(formatPlacedAt("not a date")).toBe("")
  })
})

describe("buildOrderReceipt", () => {
  const order = {
    display_id: 8,
    created_at: "2026-11-03T05:26:59.803Z",
    item_subtotal: 90000,
    shipping_total: 15000,
    discount_total: 0,
    total: 105000,
    items: [{ quantity: 2 }, { quantity: 1 }],
    metadata: {
      delivery_note: "Gọi cửa",
      slot: { label: "15:00–17:00", startsAt: "2026-11-03T15:00:00+07:00" },
    },
  }

  it("reads totals, count, slot and note", () => {
    expect(buildOrderReceipt(order)).toEqual({
      code: "#8",
      placedAt: "03.11.2026 · 12:26",
      slot: "03.11 · 15:00–17:00",
      note: "Gọi cửa",
      count: 3,
      subtotal: 90000,
      shipping: 15000,
      discount: 0,
      total: 105000,
    })
  })

  it("prefers the order's own code", () => {
    expect(buildOrderReceipt({ ...order, metadata: { code: "C4F-261103-0008" } }).code).toBe("C4F-261103-0008")
  })

  it("copes with a bare order", () => {
    expect(buildOrderReceipt({})).toMatchObject({ code: "#", slot: "", note: "", count: 0, total: 0 })
  })
})

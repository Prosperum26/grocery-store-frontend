import { describe, expect, it } from "vitest"
import { MOCK_ORDERS } from "@lib/mock/orders"
import { buildOrderView, fromMockOrder, readStage, type RawMyOrder } from "./order-view"

const order: RawMyOrder = {
  id: "order_1",
  display_id: 8,
  created_at: "2026-11-03T05:26:59.803Z",
  total: 105000,
  subtotal: 90000,
  shipping_total: 15000,
  discount_total: 0,
  items: [
    { id: "i1", title: "Nước mắm 500ml", product_title: "Nước mắm", variant_title: "chai 500ml", variant_id: "var_1", quantity: 2, unit_price: 45000 },
  ],
  shipping_address: { first_name: "Thư", last_name: "Trần Minh", phone: "0903412588", address_1: "12 Nguyễn Văn Linh", city: "Q.7" },
  metadata: {
    stage: "SHIPPING",
    delivery_note: "Gọi cửa",
    slot: { label: "15:00–17:00", startsAt: "2026-11-03T15:00:00+07:00" },
    delivery: { driver_name: "Nguyễn Văn Đức", plate: "59-X3 482.17", distance_km: 3.2, eta_at: "2026-11-03T10:30:00.000Z" },
  },
}

describe("buildOrderView", () => {
  it("reads totals, items, slot, address and delivery", () => {
    expect(buildOrderView(order)).toMatchObject({
      code: "#8",
      date: "03.11.2026",
      itemCount: 2,
      total: 105000,
      stage: "SHIPPING",
      slot: "03.11 · 15:00–17:00",
      note: "Gọi cửa",
      address: "Trần Minh Thư · 0903412588 · 12 Nguyễn Văn Linh, Q.7",
      items: [{ key: "i1", title: "Nước mắm", variantLabel: "chai 500ml", quantity: 2, lineTotal: 90000, variantId: "var_1" }],
      delivery: { driverName: "Nguyễn Văn Đức", plate: "59-X3 482.17", distanceKm: 3.2, etaTime: "17:30" },
    })
  })

  it("has no delivery before the order is on its way", () => {
    expect(buildOrderView({ ...order, metadata: { stage: "PREPARING" } }).delivery).toBeNull()
  })

  it("copes with a bare order", () => {
    expect(buildOrderView({ id: "o" })).toMatchObject({ code: "#", itemCount: 0, stage: "PENDING", items: [], address: "" })
  })
})

describe("readStage", () => {
  it("takes the backend stage as is and defaults to PENDING", () => {
    expect(readStage("CANCELLED")).toBe("CANCELLED")
    expect(readStage("nonsense")).toBe("PENDING")
    expect(readStage(undefined)).toBe("PENDING")
  })
})

describe("fromMockOrder", () => {
  it("gives only the on-the-way sample order a driver", () => {
    const views = MOCK_ORDERS.map(fromMockOrder)
    expect(views.filter((v) => v.delivery)).toHaveLength(1)
    expect(views[0].delivery?.driverName).toBe("Nguyễn Văn Đức")
  })
})

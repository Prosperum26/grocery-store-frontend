import { describe, expect, it } from "vitest"
import { ORDER_STAGES, stageLabel, TRACKING_STEPS, trackingIndex } from "./stage"

describe("stageLabel", () => {
  it("labels every order stage in Vietnamese", () => {
    expect(ORDER_STAGES.map(stageLabel)).toEqual([
      "Chờ xác nhận",
      "Đã xác nhận",
      "Đang chuẩn bị",
      "Đang giao",
      "Đã giao",
      "Đã hủy",
    ])
  })
  it("puts a new paid order at the shop-confirmation step, after ordered and paid", () => {
    expect(TRACKING_STEPS.map((s) => s.label).slice(0, trackingIndex("PENDING") + 1)).toEqual([
      "Đã đặt hàng",
      "Đã thanh toán",
      "Cửa hàng xác nhận",
    ])
  })
  it("moves along the steps and has no step for a cancelled order", () => {
    expect(["CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED"].map((s) => trackingIndex(s as never))).toEqual([2, 3, 4, 5])
    expect(trackingIndex("CANCELLED")).toBe(-1)
  })
  it("labels SHIPPING as Đang giao", () => {
    expect(stageLabel("SHIPPING")).toBe("Đang giao")
  })
})

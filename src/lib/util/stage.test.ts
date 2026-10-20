import { describe, expect, it } from "vitest"
import { ORDER_STAGES, stageLabel } from "./stage"

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
  it("labels SHIPPING as Đang giao", () => {
    expect(stageLabel("SHIPPING")).toBe("Đang giao")
  })
})

import { describe, expect, it } from "vitest"

import { buildScheduleView, daysLeftLabel, EMPTY_SCHEDULE } from "./reorder-schedule"

const item = (id: string, in_stock = true) => ({
  variant_id: id,
  product_id: `p_${id}`,
  handle: id,
  title: id,
  unit_label: "Hộp",
  art: null,
  tint: null,
  quantity: 2,
  unit_price: 1000,
  in_stock,
})

describe("daysLeftLabel", () => {
  it("names due items and counts the rest", () => {
    expect(daysLeftLabel(0)).toBe("Đã đến lúc mua lại")
    expect(daysLeftLabel(3)).toBe("Còn khoảng 3 ngày")
  })
})

describe("buildScheduleView", () => {
  it("is empty without a ready schedule", () => {
    expect(buildScheduleView(null)).toBe(EMPTY_SCHEDULE)
    expect(buildScheduleView({ status: "empty", today: [], upcoming: [], total: 0 })).toBe(EMPTY_SCHEDULE)
  })

  it("keeps each upcoming item with its own days", () => {
    const view = buildScheduleView({
      status: "ready",
      today: [item("a"), item("b", false)],
      upcoming: [{ ...item("c"), days_left: 0 }, { ...item("d"), days_left: 4 }],
      total: 2000,
    })
    expect(view.today.map((i) => i.variantId)).toEqual(["a", "b"])
    expect(view.addableCount).toBe(1)
    expect(view.total).toBe(2000)
    expect(view.upcoming.map((i) => [i.variantId, i.daysLabel])).toEqual([
      ["c", "Đã đến lúc mua lại"],
      ["d", "Còn khoảng 4 ngày"],
    ])
  })
})

import { describe, expect, it } from "vitest"
import { isEmail, slotDayLabel, splitName, toSlotOptions } from "./checkout"

// 2026-11-03 12:30 in Vietnam = 05:30 UTC
const NOW = Date.parse("2026-11-03T05:30:00Z")

describe("slotDayLabel", () => {
  it("names today and tomorrow, otherwise gives dd/mm", () => {
    expect(slotDayLabel("2026-11-03T15", NOW)).toBe("Hôm nay")
    expect(slotDayLabel("2026-11-04T07", NOW)).toBe("Ngày mai")
    expect(slotDayLabel("2026-11-09T07", NOW)).toBe("09/11")
  })

  it("uses the Vietnam date even when the server clock is still on the day before", () => {
    // 2026-11-03 18:30 UTC is already 04.11 01:30 in Vietnam
    const late = Date.parse("2026-11-03T18:30:00Z")
    expect(slotDayLabel("2026-11-04T07", late)).toBe("Hôm nay")
  })
})

describe("toSlotOptions", () => {
  it("maps the backend slots", () => {
    expect(
      toSlotOptions([{ id: "2026-11-03T15", label: "15:00–17:00", available: false }], NOW)
    ).toEqual([{ id: "2026-11-03T15", day: "Hôm nay", time: "15:00–17:00", open: false }])
  })
})

describe("splitName", () => {
  it("puts the last word in first_name, as Vietnamese names go", () => {
    expect(splitName("Trần Minh Thư")).toEqual({ first_name: "Thư", last_name: "Trần Minh" })
    expect(splitName("  Thư ")).toEqual({ first_name: "Thư", last_name: "" })
  })
})

describe("isEmail", () => {
  it("accepts an address and rejects obvious mistakes", () => {
    expect(isEmail("khach@example.com")).toBe(true)
    expect(isEmail("khach@example")).toBe(false)
    expect(isEmail("khach example.com")).toBe(false)
  })
})

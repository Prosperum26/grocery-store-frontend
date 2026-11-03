import { describe, expect, it } from "vitest"
import { isEmail, slotDayLabel, splitName, toSavedAddress, toSlotOptions } from "./checkout"

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

describe("toSavedAddress", () => {
  it("joins the pieces of a Medusa address the way the checkout shows them", () => {
    expect(
      toSavedAddress({
        id: "caddr_1",
        address_name: "Nhà riêng",
        first_name: "Thư",
        last_name: "Trần Minh",
        phone: "0903412588",
        address_1: "12 Nguyễn Văn Linh",
        address_2: "Tháp B",
        city: "P. Tân Phong",
        province: "TP.HCM",
        is_default_shipping: true,
      })
    ).toEqual({
      id: "caddr_1",
      label: "Nhà riêng",
      name: "Trần Minh Thư",
      phone: "0903412588",
      line: "12 Nguyễn Văn Linh, Tháp B",
      ward: "P. Tân Phong, TP.HCM",
      isDefault: true,
    })
  })

  it("names an unnamed address by whether it is the default", () => {
    expect(toSavedAddress({ id: "a", is_default_shipping: true }).label).toBe("Mặc định")
    expect(toSavedAddress({ id: "b" }).label).toBe("Đã lưu")
  })
})

describe("isEmail", () => {
  it("accepts an address and rejects obvious mistakes", () => {
    expect(isEmail("khach@example.com")).toBe(true)
    expect(isEmail("khach@example")).toBe(false)
    expect(isEmail("khach example.com")).toBe(false)
  })
})

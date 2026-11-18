import { describe, expect, it } from "vitest"
import { isEmail, refundNotice, reserveOutcome, slotDayLabel, soldOutMessage, splitName, toSavedAddress, toSlotOptions } from "./checkout"

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

describe("reserveOutcome", () => {
  const titles: Record<string, string> = { v1: "Cà chua", v2: "Dâu tây" }
  const titleOf = (id: string) => titles[id]

  it("2xx: the cart is held", () => {
    expect(reserveOutcome(200, { hold: { status: "HELD" } }, titleOf)).toEqual({ ok: true })
  })

  it("409 OUT_OF_STOCK: names every short line from the cart", () => {
    const result = reserveOutcome(
      409,
      { code: "OUT_OF_STOCK", items: [{ variant_id: "v1", requested: 2, available: 0 }, { variant_id: "v2", requested: 3, available: 2 }] },
      titleOf
    )
    expect(result).toEqual({
      ok: false,
      reason: "out_of_stock",
      items: [
        { title: "Cà chua", requested: 2, available: 0 },
        { title: "Dâu tây", requested: 3, available: 2 },
      ],
      message: "Cà chua vừa hết; Dâu tây chỉ còn 2: vừa có người đặt trước bạn. Bạn sửa giỏ hàng rồi đặt lại nhé.",
    })
  })

  it("a line missing from the cart and a negative stock still read well", () => {
    const result = reserveOutcome(409, { code: "OUT_OF_STOCK", items: [{ variant_id: "x", requested: 1, available: -3 }] }, titleOf)
    expect(result.ok === false && result.message).toBe("một món trong giỏ vừa hết: vừa có người đặt trước bạn. Bạn sửa giỏ hàng rồi đặt lại nhé.")
  })

  it("409 CART_COMPLETED and other errors are failures, not stock or slot problems", () => {
    expect(reserveOutcome(409, { code: "CART_COMPLETED" }, titleOf)).toMatchObject({ ok: false, reason: "failed" })
    expect(reserveOutcome(500, {}, titleOf)).toMatchObject({ ok: false, reason: "failed" })
    expect(reserveOutcome(409, { code: "SOMETHING_ELSE" }, titleOf)).toMatchObject({ ok: false, reason: "failed" })
  })
})

describe("refundNotice", () => {
  const titleOf = (id: string) => ({ v1: "Cà chua" } as Record<string, string>)[id]
  const started = Date.parse("2026-11-05T10:00:00Z")
  const failed = (at: string, refund: "refunded" | "failed" = "refunded") => ({
    at,
    refund,
    items: [{ variant_id: "v1", requested: 1, available: 0 }],
  })

  it("a refund of this payment: names the item and the amount", () => {
    expect(refundNotice(failed("2026-11-05T10:03:00Z"), started, 111000, titleOf)).toEqual({
      tone: "warn",
      title: "Món bạn đặt vừa hết hàng",
      description:
        "Cà chua vừa hết trong lúc bạn thanh toán. Com4Fud đã hoàn 111.000đ về tài khoản của bạn và chưa tạo đơn. Bạn sửa giỏ hàng rồi đặt lại nhé.",
    })
  })

  it("a failed refund says the shop will get in touch", () => {
    expect(refundNotice(failed("2026-11-05T10:03:00Z", "failed"), started, 111000, titleOf)).toMatchObject({ tone: "err" })
  })

  it("a refund of an earlier try on the same cart is ignored; without a start time it counts", () => {
    expect(refundNotice(failed("2026-11-05T09:30:00Z"), started, 111000, titleOf)).toBeNull()
    expect(refundNotice(failed("2026-11-05T09:59:30Z"), started, 111000, titleOf)).not.toBeNull() // clock slack
    expect(refundNotice(failed("2026-11-05T09:30:00Z"), undefined, 111000, titleOf)).not.toBeNull()
    expect(refundNotice(null, started, 111000, titleOf)).toBeNull()
  })
})

describe("soldOutMessage", () => {
  it("names the sold-out lines, at most three", () => {
    expect(soldOutMessage(["Nước mắm Nam Ngư"])).toBe("Nước mắm Nam Ngư vừa hết hàng. Quay lại giỏ để xóa trước khi đặt.")
    expect(soldOutMessage(["A", "B", "A", "C", "D", "E"])).toBe("A, B, C và 2 món khác vừa hết hàng. Quay lại giỏ để xóa trước khi đặt.")
    expect(soldOutMessage([])).toBe("Giỏ có món hết hàng. Quay lại giỏ để xóa trước khi đặt.")
  })
})

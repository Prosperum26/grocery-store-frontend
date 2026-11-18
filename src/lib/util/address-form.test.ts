import { describe, expect, it } from "vitest"
import { EMPTY_ADDRESS_INPUT, toAddressBody, toAddressInput, validateAddress } from "./address-form"

const FILLED = { label: "Nhà riêng", name: "Trần Minh Thư", phone: "0903 412 588", line: "12 Nguyễn Văn Linh", ward: "P. Tân Phong, Quận 7, TP.HCM", makeDefault: false }

describe("validateAddress", () => {
  it("accepts a full address", () => {
    expect(validateAddress(FILLED)).toEqual({})
  })

  it("asks for every empty box and a wrong phone", () => {
    expect(Object.keys(validateAddress({ ...EMPTY_ADDRESS_INPUT, phone: "123" })).sort()).toEqual(["line", "name", "phone", "ward"])
  })
})

describe("toAddressBody", () => {
  it("splits the name and puts each box in one field", () => {
    expect(toAddressBody(FILLED)).toEqual({
      address_name: "Nhà riêng",
      first_name: "Thư",
      last_name: "Trần Minh",
      phone: "0903 412 588",
      address_1: "12 Nguyễn Văn Linh",
      address_2: "",
      city: "P. Tân Phong, Quận 7, TP.HCM",
      province: "",
      country_code: "vn",
    })
  })

  it("marks the address default only when asked", () => {
    expect(toAddressBody({ ...FILLED, makeDefault: true })).toMatchObject({ is_default_shipping: true, is_default_billing: true })
    expect(toAddressBody(FILLED)).not.toHaveProperty("is_default_shipping")
  })
})

describe("toAddressInput", () => {
  it("joins the parts back into the two boxes, family name first", () => {
    expect(
      toAddressInput({ id: "a", first_name: "Thư", last_name: "Trần Minh", phone: null, address_1: "12 Nguyễn Văn Linh", address_2: "Tầng 3", city: "P. Tân Phong", province: "TP.HCM" })
    ).toEqual({ label: "", name: "Trần Minh Thư", phone: "", line: "12 Nguyễn Văn Linh, Tầng 3", ward: "P. Tân Phong, TP.HCM", makeDefault: false })
  })
})

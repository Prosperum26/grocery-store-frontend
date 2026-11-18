import { isVietnamesePhone } from "@lib/mock/checkout"
import { splitName, type RawCustomerAddress } from "./checkout"

/**
 * The address form of the account page. It has the same boxes as the checkout
 * (full name, phone, "số nhà, đường", one "phường, quận, tỉnh/thành" box), so
 * an address saved here fills the checkout the same way it was typed.
 */
export type AddressInput = {
  label: string
  name: string
  phone: string
  line: string
  ward: string
  makeDefault: boolean
}

export type AddressErrors = Partial<Record<"name" | "phone" | "line" | "ward", string>>

export const EMPTY_ADDRESS_INPUT: AddressInput = { label: "", name: "", phone: "", line: "", ward: "", makeDefault: false }

/** Fills the form from a saved address (the two boxes are the joined parts, as in the checkout). */
export function toAddressInput(a: RawCustomerAddress): AddressInput {
  return {
    label: a.address_name ?? "",
    // Vietnamese order: family name first, given name last.
    name: [a.last_name, a.first_name].filter(Boolean).join(" "),
    phone: a.phone ?? "",
    line: [a.address_1, a.address_2].filter(Boolean).join(", "),
    ward: [a.city, a.province].filter(Boolean).join(", "),
    makeDefault: false,
  }
}

export function validateAddress(input: AddressInput): AddressErrors {
  const errors: AddressErrors = {}
  if (!input.name.trim()) errors.name = "Nhập họ và tên người nhận"
  if (!isVietnamesePhone(input.phone)) errors.phone = "Số điện thoại chưa đúng, ví dụ 0903 412 588"
  if (!input.line.trim()) errors.line = "Nhập số nhà và tên đường"
  if (!input.ward.trim()) errors.ward = "Nhập phường, quận, tỉnh/thành"
  return errors
}

/**
 * The body Medusa saves. address_2 and province are sent empty because the
 * form shows them joined into the two boxes above: an old address that had
 * them separate ends up whole in "line" and "ward".
 */
export function toAddressBody(input: AddressInput) {
  return {
    address_name: input.label.trim(),
    ...splitName(input.name),
    phone: input.phone.trim(),
    address_1: input.line.trim(),
    address_2: "",
    city: input.ward.trim(),
    province: "",
    country_code: "vn",
    ...(input.makeDefault ? { is_default_shipping: true, is_default_billing: true } : {}),
  }
}

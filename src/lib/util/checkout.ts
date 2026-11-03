/**
 * Small pure helpers of the real checkout, kept apart from the server
 * actions so they can be tested without a backend.
 */

/** A delivery slot as the checkout page shows it (same shape in mock mode). */
export type SlotOption = {
  id: string
  /** "Hôm nay", "Ngày mai" or a date. */
  day: string
  /** "17:00–19:00" */
  time: string
  open: boolean
}

/** What the backend returns for one slot (GET /store/delivery-slots). */
export type RawSlot = {
  id: string
  label: string
  available: boolean
}

const VN_OFFSET_MS = 7 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/** "yyyy-mm-dd" of a moment in Vietnam time (UTC+7), whatever the server's own zone. */
function vnDate(ms: number): string {
  return new Date(ms + VN_OFFSET_MS).toISOString().slice(0, 10)
}

/**
 * "Hôm nay" / "Ngày mai" / "dd/mm" for a slot id such as "2026-11-03T15"
 * (the date part is already Vietnam time).
 */
export function slotDayLabel(slotId: string, nowMs: number): string {
  const date = slotId.slice(0, 10)
  if (date === vnDate(nowMs)) return "Hôm nay"
  if (date === vnDate(nowMs + DAY_MS)) return "Ngày mai"
  const [, month, day] = date.split("-")
  return `${day}/${month}`
}

export function toSlotOptions(slots: RawSlot[], nowMs: number): SlotOption[] {
  return slots.map((slot) => ({
    id: slot.id,
    day: slotDayLabel(slot.id, nowMs),
    time: slot.label,
    open: slot.available,
  }))
}

/** The part of a saved Medusa customer address the checkout reads. */
export type RawCustomerAddress = {
  id: string
  address_name?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  is_default_shipping?: boolean | null
}

/** A saved address as the checkout lists it (same shape as the mock addresses). */
export type SavedAddress = {
  id: string
  label: string
  name: string
  phone: string
  line: string
  ward: string
  isDefault: boolean
}

export function toSavedAddress(a: RawCustomerAddress): SavedAddress {
  const isDefault = !!a.is_default_shipping
  return {
    id: a.id,
    label: a.address_name || (isDefault ? "Mặc định" : "Đã lưu"),
    // Vietnamese order: family name first, given name last.
    name: [a.last_name, a.first_name].filter(Boolean).join(" "),
    phone: a.phone ?? "",
    line: [a.address_1, a.address_2].filter(Boolean).join(", "),
    ward: [a.city, a.province].filter(Boolean).join(", "),
    isDefault,
  }
}

/**
 * Medusa wants first and last name. A Vietnamese name ends with the given
 * name ("Trần Minh Thư" → first "Thư", last "Trần Minh"), the same split the
 * demo customer uses.
 */
export function splitName(fullName: string): { first_name: string; last_name: string } {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  const first = words.pop() ?? ""
  return { first_name: first, last_name: words.join(" ") }
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

import { formatVnd } from "./price"

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

/** One line of `409 OUT_OF_STOCK` from the stock hold (backend API-14). */
export type RawShortage = { variant_id: string; requested: number; available: number }

/** A line that could not be held, named for the customer. */
export type Shortage = { title: string; requested: number; available: number }

export type ReserveOutcome =
  | { ok: true }
  | { ok: false; reason: "out_of_stock"; message: string; items: Shortage[] }
  | { ok: false; reason: "failed"; message: string }

const UNKNOWN_LINE = "một món trong giỏ"

/** "Cà chua vừa hết; Dâu tây chỉ còn 2" */
export function shortageText(items: Shortage[]): string {
  return items.map((item) => (item.available > 0 ? `${item.title} chỉ còn ${item.available}` : `${item.title} vừa hết`)).join("; ")
}

/**
 * Reads the answer of `POST /store/carts/:id/reserve` (backend API-14): the
 * whole cart is held for 15 minutes before going to VNPAY, or nothing is.
 * `titleOf` names a variant from the cart lines.
 */
export function reserveOutcome(status: number, body: unknown, titleOf: (variantId: string) => string | undefined): ReserveOutcome {
  if (status >= 200 && status < 300) {
    return { ok: true }
  }
  const data = (body ?? {}) as { code?: string; items?: RawShortage[] }
  if (status === 409 && data.code === "OUT_OF_STOCK") {
    const items = (Array.isArray(data.items) ? data.items : []).map((item) => ({
      title: titleOf(item.variant_id) ?? UNKNOWN_LINE,
      requested: Number(item.requested),
      available: Math.max(0, Number(item.available)),
    }))
    const what = items.length ? shortageText(items) : "Có món vừa hết hàng"
    return {
      ok: false,
      reason: "out_of_stock",
      items,
      message: `${what}: vừa có người đặt trước bạn. Bạn sửa giỏ hàng rồi đặt lại nhé.`,
    }
  }
  if (status === 409 && data.code === "CART_COMPLETED") {
    return { ok: false, reason: "failed", message: "Giỏ hàng này đã thành đơn. Bạn xem trong mục Đơn hàng nhé." }
  }
  return { ok: false, reason: "failed", message: "Không giữ được hàng cho giỏ lúc này. Giỏ hàng của bạn vẫn còn, bạn thử lại nhé." }
}

/** `cart.metadata.stock_failed`: paid, but out of stock when VNPAY confirmed, so refunded (backend API-12). */
export type RawStockFailed = { at?: string; refund?: "refunded" | "failed"; items?: RawShortage[] }

export type RefundNotice = { tone: "warn" | "err"; title: string; description: string }

// The backend and this server may disagree on the clock by a little.
const CLOCK_SLACK_MS = 60 * 1000

/**
 * The refund notice for the payment the customer just made, or null. A
 * `stock_failed` older than this payment belongs to an earlier try on the
 * same cart. Without the start time (another browser) any refund counts.
 */
export function refundNotice(
  stockFailed: RawStockFailed | null | undefined,
  payStartedAt: number | undefined,
  amountVnd: number,
  titleOf: (variantId: string) => string | undefined
): RefundNotice | null {
  if (!stockFailed?.at) return null
  if (payStartedAt && Date.parse(stockFailed.at) < payStartedAt - CLOCK_SLACK_MS) return null

  const names = (stockFailed.items ?? []).map((item) => titleOf(item.variant_id) ?? UNKNOWN_LINE)
  const what = names.length ? names.filter((name, i) => names.indexOf(name) === i).join(", ") : "Một món trong giỏ"
  const amount = amountVnd > 0 ? ` ${formatVnd(amountVnd)}` : ""
  if (stockFailed.refund === "refunded") {
    return {
      tone: "warn",
      title: "Món bạn đặt vừa hết hàng",
      description: `${what} vừa hết trong lúc bạn thanh toán. Com4Fud đã hoàn${amount} về tài khoản của bạn và chưa tạo đơn. Bạn sửa giỏ hàng rồi đặt lại nhé.`,
    }
  }
  return {
    tone: "err",
    title: "Món bạn đặt vừa hết hàng",
    description: `${what} vừa hết trong lúc bạn thanh toán, đơn chưa được tạo. Com4Fud chưa hoàn tiền tự động được và sẽ liên hệ với bạn để hoàn${amount}.`,
  }
}

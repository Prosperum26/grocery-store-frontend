/**
 * The receipt of the confirmation page, built from a Medusa order. Pure, so
 * it can be tested without a backend.
 */

export type OrderReceipt = {
  /** The order's own code when the backend gives one (C4F-...), else #display_id. */
  code: string
  placedAt: string
  slot: string
  note: string
  count: number
  subtotal: number
  shipping: number
  discount: number
  total: number
}

/** The part of a Medusa order this file reads. */
export type RawOrder = {
  display_id?: number | null
  created_at?: string | null
  subtotal?: number | null
  shipping_total?: number | null
  discount_total?: number | null
  total?: number | null
  items?: { quantity: number }[] | null
  metadata?: {
    code?: unknown
    delivery_note?: unknown
    slot?: { label?: unknown; startsAt?: unknown } | null
  } | null
}

/** "03.11.2026 · 12:27" in Vietnam time. */
export function formatPlacedAt(iso: string | null | undefined): string {
  if (!iso) return ""
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return ""
  const [date, time] = new Date(ms + 7 * 60 * 60 * 1000).toISOString().split("T")
  const [y, m, d] = date.split("-")
  return `${d}.${m}.${y} · ${time.slice(0, 5)}`
}

/** The slot day and time, e.g. "03.11 · 17:00–19:00". */
function slotText(slot: NonNullable<RawOrder["metadata"]>["slot"]): string {
  if (!slot || typeof slot.label !== "string") return ""
  const starts = typeof slot.startsAt === "string" ? slot.startsAt.slice(0, 10) : ""
  if (!starts) return slot.label
  const [, m, d] = starts.split("-")
  return `${d}.${m} · ${slot.label}`
}

export function buildOrderReceipt(order: RawOrder): OrderReceipt {
  const meta = order.metadata ?? {}
  return {
    code: typeof meta.code === "string" ? meta.code : `#${order.display_id ?? ""}`,
    placedAt: formatPlacedAt(order.created_at),
    slot: slotText(meta.slot),
    note: typeof meta.delivery_note === "string" ? meta.delivery_note : "",
    count: (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    subtotal: order.subtotal ?? 0,
    shipping: order.shipping_total ?? 0,
    discount: order.discount_total ?? 0,
    total: order.total ?? 0,
  }
}

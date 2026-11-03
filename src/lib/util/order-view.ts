import { DEMO_ORDER } from "@lib/mock/checkout"
import type { MockOrder } from "@lib/mock/orders"
import type { OrderStage } from "types/viewmodels"
import { formatVnDate, formatVnTime, slotText } from "./order-receipt"
import { ORDER_STAGES } from "./stage"

/**
 * What the order list and the tracking page show, for a real Medusa order
 * and for the sample orders of mock mode alike. Pure, so it can be tested
 * without a backend.
 */

export type OrderItemView = {
  key: string
  title: string
  variantLabel: string
  quantity: number
  lineTotal: number
  variantId?: string
}

export type DeliveryView = {
  driverName: string
  plate: string
  distanceKm: number | null
  /** "17:30", Vietnam time. */
  etaTime: string
}

export type OrderView = {
  id: string
  code: string
  /** "07.10.2026" */
  date: string
  itemCount: number
  total: number
  subtotal: number
  shipping: number
  discount: number
  stage: OrderStage
  /** Only the sample orders have illustrations; real items are listed by name. */
  arts: string[]
  items: OrderItemView[]
  slot: string
  note: string
  address: string
  /** Present from the moment the order is on its way (backend API-7). */
  delivery: DeliveryView | null
}

/** The part of a Medusa order this file reads. */
export type RawMyOrder = {
  id: string
  display_id?: number | null
  created_at?: string | null
  total?: number | null
  subtotal?: number | null
  shipping_total?: number | null
  discount_total?: number | null
  items?:
    | {
        id: string
        title?: string | null
        product_title?: string | null
        variant_title?: string | null
        variant_id?: string | null
        quantity: number
        unit_price: number
      }[]
    | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    address_1?: string | null
    city?: string | null
  } | null
  metadata?: {
    code?: unknown
    stage?: unknown
    delivery_note?: unknown
    slot?: { label?: unknown; startsAt?: unknown } | null
    delivery?: {
      driver_name?: unknown
      plate?: unknown
      distance_km?: unknown
      eta_at?: unknown
    } | null
  } | null
}

const asText = (value: unknown) => (typeof value === "string" ? value : "")

/**
 * The stage is read from `metadata.stage` as the backend wrote it (API-5);
 * it is not worked out from the Medusa status. An order the backend has not
 * staged yet counts as just placed.
 */
export function readStage(value: unknown): OrderStage {
  return ORDER_STAGES.includes(value as OrderStage) ? (value as OrderStage) : "PENDING"
}

function readDelivery(raw: NonNullable<RawMyOrder["metadata"]>["delivery"]): DeliveryView | null {
  if (!raw || !asText(raw.driver_name)) return null
  return {
    driverName: asText(raw.driver_name),
    plate: asText(raw.plate),
    distanceKm: typeof raw.distance_km === "number" ? raw.distance_km : null,
    etaTime: formatVnTime(asText(raw.eta_at)),
  }
}

export function buildOrderView(order: RawMyOrder): OrderView {
  const meta = order.metadata ?? {}
  const items = (order.items ?? []).map((item) => ({
    key: item.id,
    title: item.product_title || item.title || "",
    variantLabel: item.variant_title ?? "",
    quantity: item.quantity,
    lineTotal: item.unit_price * item.quantity,
    variantId: item.variant_id ?? undefined,
  }))
  const a = order.shipping_address
  // Vietnamese order: family name first, given name last.
  const who = [a?.last_name, a?.first_name].filter(Boolean).join(" ")
  const where = [a?.address_1, a?.city].filter(Boolean).join(", ")

  return {
    id: order.id,
    code: typeof meta.code === "string" ? meta.code : `#${order.display_id ?? ""}`,
    date: formatVnDate(order.created_at),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    total: order.total ?? 0,
    subtotal: order.subtotal ?? 0,
    shipping: order.shipping_total ?? 0,
    discount: order.discount_total ?? 0,
    stage: readStage(meta.stage),
    arts: [],
    items,
    slot: slotText(meta.slot),
    note: asText(meta.delivery_note),
    address: [who, a?.phone, where].filter(Boolean).join(" · "),
    delivery: readDelivery(meta.delivery),
  }
}

/** The driver of the design's sample order (shared.js ORDER). Other samples have none. */
const SAMPLE_DRIVER: DeliveryView = { driverName: "Nguyễn Văn Đức", plate: "59-X3 482.17", distanceKm: null, etaTime: "" }

/** A sample order of mock mode, shaped like a real one. */
export function fromMockOrder(order: MockOrder): OrderView {
  const onTheWay = order.code === DEMO_ORDER.code && order.stage === "SHIPPING"
  return {
    id: order.id,
    code: order.code,
    date: order.date,
    itemCount: order.itemCount,
    total: order.total,
    subtotal: order.total,
    shipping: 0,
    discount: 0,
    stage: order.stage,
    arts: order.arts,
    items: [],
    slot: "",
    note: "",
    address: "",
    delivery: onTheWay ? SAMPLE_DRIVER : null,
  }
}

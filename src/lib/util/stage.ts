import type { OrderStage } from "../../types/viewmodels"

/** Order stages in the order a delivery moves through them. */
export const ORDER_STAGES: OrderStage[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
]

const LABELS: Record<OrderStage, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
}

export function stageLabel(stage: OrderStage): string {
  return LABELS[stage]
}

/**
 * Steps of the order tracking page. An order only exists once VNPAY has
 * taken the money (the cart is completed after payment), so the first two
 * steps are done for every order. A new order waits at "Cửa hàng xác nhận".
 */
export const TRACKING_STEPS: { label: string; stage: OrderStage | null }[] = [
  { label: "Đã đặt hàng", stage: null },
  { label: "Đã thanh toán", stage: null },
  { label: "Cửa hàng xác nhận", stage: "CONFIRMED" },
  { label: "Đang chuẩn bị", stage: "PREPARING" },
  { label: "Đang giao", stage: "SHIPPING" },
  { label: "Đã giao", stage: "DELIVERED" },
]

/** The step an order is at; -1 for a cancelled order (it has no timeline). */
export function trackingIndex(stage: OrderStage): number {
  if (stage === "CANCELLED") return -1
  // PENDING: ordered and paid, waiting for the shop to confirm.
  if (stage === "PENDING") return TRACKING_STEPS.findIndex((s) => s.stage === "CONFIRMED")
  return TRACKING_STEPS.findIndex((s) => s.stage === stage)
}

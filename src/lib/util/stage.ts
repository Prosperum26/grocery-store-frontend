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

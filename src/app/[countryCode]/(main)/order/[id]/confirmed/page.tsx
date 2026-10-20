import { Metadata } from "next"
import { notFound } from "next/navigation"

import { DEMO_ORDER_ID } from "@lib/mock/checkout"
import { isMockMode } from "@lib/mock/mode"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"

type Props = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Đặt hàng thành công | Com4Fud",
  description: "Đơn hàng của bạn đã được ghi nhận.",
}

/**
 * Confirmation page. In mock mode only the sample order exists; real orders
 * come with the backend (backend plan BE-6).
 */
export default async function OrderConfirmedPage(props: Props) {
  const { id } = await props.params

  if (!isMockMode() || id !== DEMO_ORDER_ID) {
    notFound()
  }

  return <OrderCompletedTemplate />
}

import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getOrderReceipt } from "@lib/data/checkout"
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
 * Confirmation page. Mock mode shows the sample order; real mode shows the
 * order that VNPAY's payment created.
 */
export default async function OrderConfirmedPage(props: Props) {
  const { id } = await props.params

  if (isMockMode()) {
    if (id !== DEMO_ORDER_ID) notFound()
    return <OrderCompletedTemplate />
  }

  const receipt = await getOrderReceipt(id)
  if (!receipt) notFound()
  return <OrderCompletedTemplate receipt={receipt} />
}

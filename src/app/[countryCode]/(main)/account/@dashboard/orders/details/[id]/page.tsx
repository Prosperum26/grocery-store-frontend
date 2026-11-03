import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { getMyOrder } from "@lib/data/my-orders"
import { isMockMode } from "@lib/mock/mode"
import { MOCK_ORDERS } from "@lib/mock/orders"
import { fromMockOrder } from "@lib/util/order-view"
import OrderTrackingTemplate from "@modules/account/templates/order-tracking-template"

type Props = { params: Promise<{ id: string; countryCode: string }> }

export const metadata: Metadata = {
  title: "Theo dõi đơn hàng | Com4Fud",
  description: "Tiến trình giao hàng của đơn.",
}

export default async function OrderDetailsPage(props: Props) {
  const { id, countryCode } = await props.params
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    redirect(`/${countryCode}/account`)
  }
  const mockOrder = isMockMode() ? MOCK_ORDERS.find((o) => o.id === id) : undefined
  const order = isMockMode() ? (mockOrder ? fromMockOrder(mockOrder) : null) : await getMyOrder(id)
  if (!order) {
    notFound()
  }

  return <OrderTrackingTemplate order={order} />
}

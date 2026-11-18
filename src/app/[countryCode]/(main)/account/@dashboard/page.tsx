import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { loadOrders } from "@lib/data/order-list"
import OrdersTemplate from "@modules/account/templates/orders-template"

export const metadata: Metadata = {
  title: "Đơn hàng của tôi | Com4Fud",
  description: "Đơn hàng và trạng thái giao hàng của bạn.",
}

// The account home is the order list (design 07), not a separate overview.
export default async function AccountHome() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    notFound()
  }
  return <OrdersTemplate orders={await loadOrders()} />
}

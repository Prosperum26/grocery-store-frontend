import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import OrdersTemplate from "@modules/account/templates/orders-template"

export const metadata: Metadata = {
  title: "Đơn hàng của tôi | Com4Fud",
  description: "Đơn hàng và trạng thái giao hàng của bạn.",
}

export default async function OrdersPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    redirect(`/${countryCode}/account`)
  }
  return <OrdersTemplate />
}

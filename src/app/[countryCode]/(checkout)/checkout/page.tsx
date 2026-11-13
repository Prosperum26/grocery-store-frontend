import { Metadata } from "next"
import { redirect } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { isMockMode } from "@lib/mock/mode"
import { toSavedAddress } from "@lib/util/checkout"
import CheckoutTemplate from "@modules/checkout/templates"

export const metadata: Metadata = {
  title: "Thanh toán | Com4Fud",
  description: "Địa chỉ, khung giờ giao và thanh toán qua VNPAY.",
}

export default async function CheckoutPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  // A signed-in customer checks out with the email and addresses they saved.
  // Mock mode uses the design's sample addresses (inside the template).
  const customer = isMockMode() ? null : await retrieveCustomer().catch(() => null)
  // Orders need an owner: without one the shopper cannot follow, cancel or reorder it later. The cart is kept
  // (it moves to the account on sign-in) and the sign-in page sends the shopper back here.
  if (!isMockMode() && !customer) {
    redirect(`/${countryCode}/account?next=checkout`)
  }
  return (
    <CheckoutTemplate
      customerEmail={customer?.email}
      savedAddresses={customer ? (customer.addresses ?? []).map(toSavedAddress) : undefined}
    />
  )
}

import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import { isMockMode } from "@lib/mock/mode"
import { toSavedAddress } from "@lib/util/checkout"
import CheckoutTemplate from "@modules/checkout/templates"

export const metadata: Metadata = {
  title: "Thanh toán | Com4Fud",
  description: "Địa chỉ, khung giờ giao và thanh toán qua VNPAY.",
}

export default async function CheckoutPage() {
  // A signed-in customer checks out with the email and addresses they saved.
  // Mock mode uses the design's sample addresses (inside the template).
  const customer = isMockMode() ? null : await retrieveCustomer().catch(() => null)
  return (
    <CheckoutTemplate
      customerEmail={customer?.email}
      savedAddresses={customer ? (customer.addresses ?? []).map(toSavedAddress) : undefined}
    />
  )
}

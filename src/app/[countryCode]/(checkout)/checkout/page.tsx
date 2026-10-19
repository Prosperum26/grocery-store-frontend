import { Metadata } from "next"

import CheckoutTemplate from "@modules/checkout/templates"

export const metadata: Metadata = {
  title: "Thanh toán | Com4Fud",
  description: "Địa chỉ, khung giờ giao và thanh toán qua VNPAY.",
}

export default function CheckoutPage() {
  return <CheckoutTemplate />
}

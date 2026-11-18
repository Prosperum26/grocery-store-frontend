import { Metadata } from "next"

import { isMockMode } from "@lib/mock/mode"
import BuyAgainLive from "@modules/home/components/buy-again/live"
import CartTemplate from "@modules/cart/templates"

export const metadata: Metadata = {
  title: "Giỏ hàng | Com4Fud",
  description: "Giỏ hàng của bạn.",
}

/** The cart. "Mua lại" needs the backend, so mock mode shows the cart alone. */
export default async function CartPage() {
  return <CartTemplate buyAgain={isMockMode() ? undefined : <BuyAgainLive />} />
}

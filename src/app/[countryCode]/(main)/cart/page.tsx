import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { MOCK_BUY_AGAIN } from "@lib/mock/home"
import { isMockMode } from "@lib/mock/mode"
import { toProductVM } from "@lib/viewmodels/product"
import BuyAgain from "@modules/home/components/buy-again"
import BuyAgainLive from "@modules/home/components/buy-again/live"
import CartTemplate from "@modules/cart/templates"

export const metadata: Metadata = {
  title: "Giỏ hàng | Com4Fud",
  description: "Giỏ hàng của bạn.",
}

export default async function CartPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  // Mock mode shows sample products; the real backend picks the customer's own.
  if (!isMockMode()) {
    return <CartTemplate buyAgain={<BuyAgainLive />} />
  }

  const catalog = (
    await listProducts({ countryCode, queryParams: { limit: 100 } })
  ).response.products.map(toProductVM)

  return (
    <CartTemplate
      buyAgain={<BuyAgain lines={MOCK_BUY_AGAIN} catalog={catalog} />}
    />
  )
}

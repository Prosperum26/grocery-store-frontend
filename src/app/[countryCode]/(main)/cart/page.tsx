import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { MOCK_BUY_AGAIN } from "@lib/mock/home"
import { toProductVM } from "@lib/viewmodels/product"
import BuyAgain from "@modules/home/components/buy-again"
import CartTemplate from "@modules/cart/templates"

export const metadata: Metadata = {
  title: "Giỏ hàng | Com4Fud",
  description: "Giỏ hàng của bạn.",
}

export default async function CartPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  })
  const catalog = response.products.map(toProductVM)

  return (
    <CartTemplate
      buyAgain={<BuyAgain lines={MOCK_BUY_AGAIN} catalog={catalog} />}
    />
  )
}

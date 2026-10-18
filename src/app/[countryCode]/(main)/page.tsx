import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  HOME_DEAL_HANDLES,
  HOME_PROMO_HANDLE,
  MOCK_BUY_AGAIN,
  pickProducts,
} from "@lib/mock/home"
import { toProductVM } from "@lib/viewmodels/product"
import BuyAgain from "@modules/home/components/buy-again"
import CategoryGrid from "@modules/home/components/category-grid"
import Deals from "@modules/home/components/deals"
import PromoBanners from "@modules/home/components/promo-banners"
import RecipeBanner from "@modules/home/components/recipe-banner"

export const metadata: Metadata = {
  title: "Com4Fud - Đi chợ online",
  description: "Rau củ, thịt cá và hàng thiết yếu giao trong ngày tại TP.HCM.",
}

/**
 * Home page of the v2 design (01_Trang_Chu_*). Desktop order: promos,
 * categories, buy again, deals, recipe. Phone order puts deals before
 * categories (docs/07), so the deals block is rendered in both places and
 * one copy is hidden per breakpoint. That keeps reading and tab order equal
 * to the visual order, which CSS `order` would not.
 */
export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { response } = await listProducts({
    regionId: region.id,
    queryParams: { limit: 100 },
  })
  const catalog = response.products.map(toProductVM)
  const [promo] = pickProducts(catalog, [HOME_PROMO_HANDLE])
  const [spinach] = pickProducts(catalog, ["rau-muong"])
  const deals = pickProducts(catalog, HOME_DEAL_HANDLES)

  return (
    <>
      <h1 className="sr-only">Com4Fud, đi chợ online</h1>
      <div className="content-container flex flex-col gap-6 pb-28 pt-5 small:gap-11 small:pb-24 small:pt-8">
        <PromoBanners promo={promo} spinach={spinach} />
        <Deals products={deals} headingId="home-deals-phone" className="small:hidden" />
        <CategoryGrid />
        <BuyAgain lines={MOCK_BUY_AGAIN} catalog={catalog} />
        <Deals products={deals} headingId="home-deals-desktop" className="hidden small:flex" />
        <RecipeBanner catalog={catalog} />
      </div>
    </>
  )
}

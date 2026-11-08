import { Metadata } from "next"

import { listDeals } from "@lib/data/catalog"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { MOCK_BUY_AGAIN, pickProducts } from "@lib/mock/home"
import { isMockMode } from "@lib/mock/mode"
import { toProductVM } from "@lib/viewmodels/product"
import BuyAgain from "@modules/home/components/buy-again"
import BuyAgainLive from "@modules/home/components/buy-again/live"
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

  // The biggest discount is the big banner, the rest fill "Ưu đãi hôm nay".
  const deals = await listDeals(countryCode)
  const [promo] = deals

  // The mock "Mua lại" and the recipe banner are made of sample products that
  // only exist in the mock catalog. With the real backend "Mua lại" is
  // BuyAgainLive, and the recipe banner stays hidden until its feature exists.
  const catalog = isMockMode()
    ? (
        await listProducts({
          regionId: region.id,
          queryParams: { limit: 100 },
        })
      ).response.products.map(toProductVM)
    : []
  // The "Rau sáng nay" card names a bunch of spinach; no real product fits.
  const [spinach] = pickProducts(catalog, ["rau-muong"])

  return (
    <>
      <h1 className="sr-only">Com4Fud, đi chợ online</h1>
      <div className="content-container flex flex-col gap-6 pb-28 pt-5 small:gap-11 small:pb-24 small:pt-8">
        <PromoBanners promo={promo} spinach={spinach} />
        <Deals products={deals} headingId="home-deals-phone" className="small:hidden" />
        <CategoryGrid />
        {isMockMode() ? <BuyAgain lines={MOCK_BUY_AGAIN} catalog={catalog} /> : <BuyAgainLive />}
        <Deals products={deals} headingId="home-deals-desktop" className="hidden small:flex" />
        <RecipeBanner catalog={catalog} />
      </div>
    </>
  )
}

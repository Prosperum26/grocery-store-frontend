import { Metadata } from "next"

import { listDeals, listShortRow } from "@lib/data/catalog"
import { getRegion } from "@lib/data/regions"
import { isMockMode } from "@lib/mock/mode"
import BuyAgainLive from "@modules/home/components/buy-again/live"
import CategoryGrid from "@modules/home/components/category-grid"
import CookTonight from "@modules/home/components/cook-tonight"
import HomeHero from "@modules/home/components/home-hero"
import ProductRow from "@modules/home/components/product-row"
import CartRecipes from "@modules/suggestions/cart-recipes"
import TryNewRecipe from "@modules/suggestions/try-new-recipe"

export const metadata: Metadata = {
  title: "Com4Fud - Đi chợ online",
  description: "Rau củ, thịt cá và hàng thiết yếu giao trong ngày tại TP.HCM.",
}

// Fresh food first: these are the rows a shopper cooking tonight looks for.
// `name` is the category name as the search index stores it.
const CATEGORY_ROWS = [
  { handle: "rau-cu", name: "Rau củ" },
  { handle: "thit", name: "Thịt" },
  { handle: "hai-san", name: "Hải sản" },
]

/**
 * Home page. One order for every screen size: a short opening band, the
 * categories, "Mua lại" (signed-in shoppers), today's deals, the way into
 * Trợ lý Bếp, then a row of products per fresh category. Every block below
 * the band is products or a way to reach them.
 */
export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const mock = isMockMode()
  const [deals, ...rows] = await Promise.all([
    listDeals(countryCode),
    ...CATEGORY_ROWS.map((category) => listShortRow({ countryCode, category, take: 5 })),
  ])

  return (
    <>
      <h1 className="sr-only">Com4Fud, đi chợ online</h1>
      <div className="content-container flex flex-col gap-7 pb-28 pt-4 small:gap-10 small:pb-24 small:pt-6">
        <HomeHero showKitchen={!mock} />
        <CategoryGrid />
        {/* "Mua lại" and the dish search need the backend; mock mode leaves them out. */}
        {!mock && <BuyAgainLive />}
        {!mock && <CartRecipes headingId="home-cart-recipes" />}
        <ProductRow id="home-deals" title="Ưu đãi hôm nay" href="/store?sale=1" linkLabel="Xem tất cả ưu đãi" products={deals} />
        {!mock && <TryNewRecipe headingId="home-try-new" />}
        {!mock && <CookTonight countryCode={countryCode} />}
        {CATEGORY_ROWS.map((category, i) => (
          <ProductRow
            key={category.handle}
            id={`home-row-${category.handle}`}
            title={category.name}
            href={`/categories/${category.handle}`}
            linkLabel={`Xem tất cả ${category.name.toLowerCase()}`}
            products={rows[i]}
          />
        ))}
      </div>
    </>
  )
}

import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import FeaturedProducts from "@modules/home/components/featured-products"
import { ProductGridSection } from "@modules/home/components/featured-products/product-rail"
import Hero from "@modules/home/components/hero"

export const metadata: Metadata = {
  title: "SmartPantry - Đi chợ online",
  description:
    "Rau củ, thịt cá và hàng thiết yếu giao nhanh tại TP.HCM.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const [{ collections }, newest] = await Promise.all([
    listCollections({ fields: "id, handle, title" }),
    listProducts({
      regionId: region.id,
      queryParams: { limit: 8, order: "-created_at" },
    }),
  ])

  return (
    <>
      <Hero />
      {newest.response.products.length > 0 && (
        <ProductGridSection
          title="Sản phẩm mới"
          href="/store"
          products={newest.response.products}
          region={region}
        />
      )}
      <ul className="flex flex-col gap-x-6 pb-12">
        <FeaturedProducts collections={collections ?? []} region={region} />
      </ul>
    </>
  )
}

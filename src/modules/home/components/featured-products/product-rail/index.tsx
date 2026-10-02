import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

import InteractiveLink from "@modules/common/components/interactive-link"
import SectionTitle from "@modules/common/components/section-title"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <ProductGridSection
      title={collection.title}
      href={`/collections/${collection.handle}`}
      products={pricedProducts}
      region={region}
    />
  )
}

export function ProductGridSection({
  title,
  href,
  products,
  region,
}: {
  title: string
  href: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  return (
    <section className="content-container py-8 small:py-12">
      <div className="mb-10 flex items-center justify-between">
        <SectionTitle title={title} />
        <InteractiveLink href={href}>Xem tất cả</InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-2xl bg-containerbg p-4 small:grid-cols-4 small:gap-x-6 small:p-6">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </section>
  )
}

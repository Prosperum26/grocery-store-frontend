import { HttpTypes } from "@medusajs/types"
import { toProductVM } from "@lib/viewmodels/product"
import ProductCard from "@modules/products/components/product-card"

/**
 * Card for a raw Medusa product (collection pages and the real catalog).
 * Maps it to a ProductVM and reuses the v2 ProductCard, so there is a single
 * product card design.
 */
export default function ProductPreview({
  product,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region?: HttpTypes.StoreRegion
}) {
  return <ProductCard product={toProductVM(product)} />
}

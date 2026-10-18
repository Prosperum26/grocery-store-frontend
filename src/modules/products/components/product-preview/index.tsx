import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"
import { toProductVM } from "@lib/viewmodels/product"
import Image from "next/image"
import PreviewPrice from "./price"
import QuickAdd from "./quick-add"

// Montra food-card look: translucent card, product image floating over a
// warm tinted panel, title and price below, round red add-to-cart button.
export default async function ProductPreview({
  product,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const image = product.thumbnail || product.images?.[0]?.url

  return (
    <div
      className="group flex h-full flex-col rounded-xl bg-cardOverlay p-3 shadow-sm backdrop-blur-lg transition-shadow duration-150 hover:shadow-lg"
      data-testid="product-wrapper"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        // The title link right below names this product; hide this image-only
        // duplicate from screen readers and the tab order.
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-square w-full overflow-hidden rounded-lg bg-containerbg"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 576px) 280px, (max-width: 992px) 360px, 400px"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
            draggable={false}
          />
        ) : (
          <ProductArt product={toProductVM(product)} decorative />
        )}
      </LocalizedClientLink>

      <div className="mt-3 flex flex-1 items-end justify-between gap-3">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="flex min-w-0 flex-col"
        >
          <p
            className="truncate text-lg font-medium text-textColor"
            data-testid="product-title"
          >
            {product.title}
          </p>
          <div className="mt-1 flex items-center gap-x-2 text-base font-semibold text-headingColor">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </LocalizedClientLink>
        <QuickAdd product={product} />
      </div>
    </div>
  )
}

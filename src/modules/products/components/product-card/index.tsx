import { cx } from "@lib/util/cx"
import { formatVnd, salePercent } from "@lib/util/price"
import Chip from "@modules/common/components/chip"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SaleSticker from "@modules/common/components/sale-sticker"
import ProductArt from "@modules/products/components/product-art"
import type { ProductVM } from "types/viewmodels"

import AddButton from "./add-button"

/**
 * Product card of the v2 design (productCard() in ui.js): image on a tinted
 * plate with the discount sticker, name, pack size · origin, price with the
 * old price struck through, and a round "+" button. The whole name is the
 * link; the button stays a separate control.
 */
export default function ProductCard({
  product,
  compact,
  className,
}: {
  product: ProductVM
  /** Phone layout: smaller name, no origin. */
  compact?: boolean
  className?: string
}) {
  const percent = salePercent(product.originalPrice, product.price)
  const outOfStock = product.stockQty <= 0
  const href = `/products/${product.handle}`

  return (
    <article
      className={cx(
        "group relative flex h-full flex-col gap-2.5 rounded-card border border-line bg-surface p-2.5",
        className
      )}
    >
      <div className="relative aspect-[1.28] overflow-hidden rounded-btn">
        <ProductArt product={product} decorative scale={0.66} className={outOfStock ? "opacity-40" : undefined} />
        {percent && (
          <SaleSticker className="absolute left-2 top-2.5" label={`Giảm ${percent}%`}>
            −{percent}%
          </SaleSticker>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Chip tone="dark" flat>
              Hết hàng
            </Chip>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className={cx("line-clamp-2 font-sans font-semibold text-ink", compact ? "text-sm" : "text-base")}>
          {/* Stretched link: the whole card is clickable, the "+" stays on top. */}
          <LocalizedClientLink href={href} className="after:absolute after:inset-0 after:rounded-card">
            {product.title}
          </LocalizedClientLink>
        </h3>
        <p className="truncate text-xs text-ink-2">
          {product.unitLabel}
          {product.origin && !compact ? ` · ${product.origin}` : ""}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 px-1 pb-1">
        <p className="flex flex-col">
          {product.originalPrice && (
            <span className="font-mono text-xs text-ink-3 line-through">
              <span className="sr-only">Giá cũ </span>
              {formatVnd(product.originalPrice)}
            </span>
          )}
          <span className={cx("font-mono text-base font-bold", product.originalPrice ? "text-sale" : "text-ink")}>
            {product.originalPrice && <span className="sr-only">Giá mới </span>}
            {formatVnd(product.price)}
          </span>
        </p>
        <div className="relative z-10">
          <AddButton
            handle={product.handle}
            title={product.title}
            variantCount={product.variants.length}
            inStock={!outOfStock}
          />
        </div>
      </div>
    </article>
  )
}

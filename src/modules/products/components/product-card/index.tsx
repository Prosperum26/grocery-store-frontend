import { cx } from "@lib/util/cx"
import { formatVnd } from "@lib/util/price"
import { cardBadges, perKgLabel } from "@lib/util/product-card"
import Chip from "@modules/common/components/chip"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SaleSticker from "@modules/common/components/sale-sticker"
import ProductArt from "@modules/products/components/product-art"
import type { ProductVM } from "types/viewmodels"

import AddButton from "./add-button"

/**
 * Product card. Reading order follows how people scan a grocery shelf:
 * the photo (whole pack, never cropped), then the price, then the name and
 * pack size. The buy control sits on the photo's corner so it is in the same
 * place on every card and the text block below can be short.
 *
 * The whole card is a link to the product (stretched link on the name); the
 * buy control is a separate control above it.
 */
export default function ProductCard({
  product,
  className,
}: {
  product: ProductVM
  className?: string
}) {
  const badges = cardBadges(product)
  const outOfStock = badges.some((b) => b.kind === "out")
  const sale = badges.find((b) => b.kind === "sale")
  const low = badges.find((b) => b.kind === "low")
  const perKg = perKgLabel(product)

  return (
    <article
      className={cx(
        "group relative flex h-full flex-col rounded-card border border-line bg-surface transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-card">
        <ProductArt
          product={product}
          decorative
          fit="contain"
          scale={0.6}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          className={outOfStock ? "opacity-40" : undefined}
        />
        {sale && (
          <SaleSticker className="absolute left-2 top-2.5" label={`Giảm ${sale.percent}%`}>
            −{sale.percent}%
          </SaleSticker>
        )}
        {low && (
          <Chip tone="warn" flat className="absolute bottom-2 left-2">
            Còn {low.left}
          </Chip>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Chip tone="dark" flat>
              Hết hàng
            </Chip>
          </span>
        )}
        <div className="absolute bottom-2 right-2 z-10">
          <AddButton product={product} inStock={!outOfStock} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 pt-2.5">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className={cx("font-mono text-lg font-bold leading-6 small:text-xl", sale ? "text-sale" : "text-ink")}>
            {sale && <span className="sr-only">Giá mới </span>}
            {formatVnd(product.price)}
          </span>
          {product.originalPrice && sale && (
            <span className="font-mono text-xs text-ink-3 line-through">
              <span className="sr-only">Giá cũ </span>
              {formatVnd(product.originalPrice)}
            </span>
          )}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-5 text-ink">
          {/* Stretched link: the whole card is clickable, the buy control stays on top. */}
          <LocalizedClientLink href={`/products/${product.handle}`} className="after:absolute after:inset-0 after:rounded-card">
            {product.title}
          </LocalizedClientLink>
        </h3>
        <p className="mt-auto truncate pt-0.5 text-xs text-ink-2">
          {product.unitLabel}
          {perKg && <span className="text-ink-3"> ({perKg})</span>}
        </p>
      </div>
    </article>
  )
}

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import type { ProductVM } from "types/viewmodels"

/** A desktop row holds this many cards (4 between 1024px and 1280px, where the fifth is hidden). */
const ROW_SIZE = 5

/**
 * One titled row of product cards on the home page ("Ưu đãi hôm nay", "Rau
 * củ"...). Desktop: one row of the grid the listing page uses. Phones: a row
 * that scrolls sideways, so several rows fit one screen instead of a long
 * column of cards. Renders nothing when there is nothing to show.
 */
export default function ProductRow({
  id,
  title,
  href,
  linkLabel = "Xem tất cả",
  products,
}: {
  /** Used for the heading id: unique on the page. */
  id: string
  title: string
  /** Where "Xem tất cả" goes, without the country code. */
  href: string
  linkLabel?: string
  products: ProductVM[]
}) {
  if (!products.length) return null

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 small:gap-4">
      <div className="flex items-end justify-between gap-4">
        <h2 id={id} className="font-display text-xl font-bold small:text-[26px] small:leading-8">
          {title}
        </h2>
        <LocalizedClientLink href={href} className="shrink-0 text-sm font-semibold text-brand underline-offset-2 hover:underline">
          {linkLabel}
        </LocalizedClientLink>
      </div>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 small:mx-0 small:grid small:grid-cols-4 small:gap-4 small:overflow-visible small:px-0 small:pb-0 medium:grid-cols-5">
        {products.slice(0, ROW_SIZE).map((product, i) => (
          <li
            key={product.id}
            className={`flex w-[44%] shrink-0 snap-start xsmall:w-[30%] small:w-auto ${i === ROW_SIZE - 1 ? "small:hidden medium:flex" : ""}`}
          >
            <ProductCard product={product} className="w-full" />
          </li>
        ))}
      </ul>
    </section>
  )
}

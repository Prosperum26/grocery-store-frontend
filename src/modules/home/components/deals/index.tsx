import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import type { ProductVM } from "types/viewmodels"

/**
 * "Ưu đãi hôm nay": 4 cards on desktop, the first 2 on phones (as in the
 * design). On phones this block comes before the categories (docs/07).
 */
export default function Deals({
  products,
  headingId,
  className,
}: {
  products: ProductVM[]
  /** Unique per copy: the home page renders this block twice. */
  headingId: string
  className?: string
}) {
  if (!products.length) return null

  return (
    <section aria-labelledby={headingId} className={`flex flex-col gap-3 small:gap-4 ${className ?? ""}`}>
      <div className="flex items-end justify-between">
        <h2 id={headingId} className="text-lg font-bold small:text-[28px] small:leading-[34px]">
          Ưu đãi hôm nay
        </h2>
        <LocalizedClientLink href="/store" className="text-sm font-semibold text-brand underline-offset-2 hover:underline small:underline">
          Xem tất cả
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-2 gap-3 small:grid-cols-4 small:gap-6">
        {products.slice(0, 4).map((p, i) => (
          <li key={p.id} className={i >= 2 ? "hidden small:block" : undefined}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  )
}

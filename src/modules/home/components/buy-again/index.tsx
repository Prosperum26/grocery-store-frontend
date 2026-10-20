import { LuPlus, LuRepeat } from "react-icons/lu"

import { BasketLine, basketTotal } from "@lib/mock/home"
import { formatVnd } from "@lib/util/price"
import {
  ComingSoonBadge,
  ComingSoonButton,
} from "@modules/common/components/coming-soon"
import ProductArt from "@modules/products/components/product-art"
import type { ProductVM } from "types/viewmodels"

const FEATURE = "Có thể bạn cần mua lại"

function qtyLabel(p: ProductVM, quantity: number) {
  return p.unitLabel + (quantity > 1 ? ` · ×${quantity}` : "")
}

/**
 * "Có thể bạn cần mua lại" in its placeholder state (issue #11 section 3):
 * the layout of the design with sample items dimmed, a "đang phát triển"
 * badge, and buttons that open the coming-soon dialog. The real list comes
 * from GET /store/predictive/reorder-basket in phase 2 (backend plan BE-9).
 */
export default function BuyAgain({
  lines,
  catalog,
}: {
  lines: BasketLine[]
  catalog: ProductVM[]
}) {
  const items = lines
    .map((l) => ({ line: l, product: catalog.find((p) => p.handle === l.handle) }))
    .filter((x): x is { line: BasketLine; product: ProductVM } => Boolean(x.product))
  if (!items.length) return null
  const total = formatVnd(basketTotal(lines, catalog))

  return (
    <section
      aria-labelledby="home-buy-again"
      className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-4 small:gap-[18px] small:rounded-card small:p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent-soft text-accent-ink small:h-10 small:w-10 small:rounded-xl">
          <LuRepeat size={18} />
        </span>
        <h2 id="home-buy-again" className="font-sans text-base font-semibold small:font-display small:text-[28px] small:font-bold small:leading-[34px]">
          {FEATURE}
        </h2>
        <ComingSoonBadge />
        <ComingSoonButton feature={FEATURE} icon={<LuPlus />} className="ml-auto hidden small:inline-flex">
          Thêm tất cả · {total}
        </ComingSoonButton>
      </div>

      {/* Sample items, dimmed and hidden from screen readers: they are not real
          suggestions for this shopper. */}
      <div aria-hidden="true" className="opacity-80">
        <ul className="hidden grid-cols-5 gap-3.5 small:grid">
          {items.map(({ line, product }) => (
            <li key={product.id} className="flex flex-col gap-2.5 rounded-2xl border border-line p-2.5">
              <div className="aspect-[1.4] overflow-hidden rounded-btn">
                <ProductArt product={product} decorative scale={0.7} />
              </div>
              <div className="px-0.5">
                <p className="truncate text-sm font-semibold">{product.title}</p>
                <p className="truncate text-xs text-ink">{qtyLabel(product, line.quantity)}</p>
              </div>
              <p className="px-0.5 font-mono text-base font-bold">{formatVnd(product.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col divide-y divide-line small:hidden">
          {items.map(({ line, product }) => (
            <li key={product.id} className="flex items-center gap-2.5 py-2.5">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[10px]">
                <ProductArt product={product} decorative dots={false} scale={0.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{product.title}</p>
                <p className="truncate text-xs text-ink">{qtyLabel(product, line.quantity)}</p>
              </div>
              <p className="font-mono text-xs font-bold">{formatVnd(product.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
      </div>

      <ComingSoonButton feature={FEATURE} variant="deep" icon={<LuPlus />} fullWidth className="small:hidden">
        Thêm cả {items.length} món · {total}
      </ComingSoonButton>
    </section>
  )
}

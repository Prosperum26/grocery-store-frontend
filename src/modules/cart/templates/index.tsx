"use client"

import { useCart } from "@lib/context/cart-context"
import { useLiveStock } from "@lib/hooks/use-live-stock"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Banner } from "@modules/common/components/notice"
import CartLine from "@modules/cart/components/item"
import CartSummary from "@modules/cart/components/summary"
import CartRecipes from "@modules/suggestions/cart-recipes"
import TryNewRecipe from "@modules/suggestions/try-new-recipe"
import { isMockMode } from "@lib/mock/mode"
import EmptyCartMessage from "@modules/cart/components/empty-cart-message"
import type { ReactNode } from "react"
import { LuArrowLeft } from "react-icons/lu"

/**
 * Cart page of the v2 design (04_Gio_Hang_*). Lines on the left, summary on
 * the right, stacked on phones. `buyAgain` is the "Có thể bạn cần mua lại"
 * placeholder, rendered by the server page.
 */
export default function CartTemplate({ buyAgain }: { buyAgain?: ReactNode }) {
  const { view, priceNoticeDismissed, dismissPriceNotice } = useCart()
  // One live stock watch for the whole cart, not one per line.
  const live = useLiveStock(view.lines.map((l) => l.variantId))
  const changed = view.lines.find((l) => l.inStock && l.previousPrice !== undefined)

  return (
    <div className="content-container flex flex-col gap-6 pb-16 pt-6 small:pt-8">
      <nav aria-label="Đường dẫn">
        <ol className="flex items-center gap-2 text-sm text-ink-2">
          <li>
            <LocalizedClientLink href="/" className="hover:text-ink hover:underline">
              Trang chủ
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-ink">
            Giỏ hàng
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-ink small:text-[40px] small:leading-tight">
          Giỏ hàng của bạn
        </h1>
        <Button variant="secondary" href="/store" icon={<LuArrowLeft />}>
          Tiếp tục mua sắm
        </Button>
      </div>

      {changed && !priceNoticeDismissed && changed.previousPrice !== undefined && (
        <Banner
          tone="warn"
          title={`Giá ${changed.title} vừa thay đổi`}
          description={`Lúc bạn thêm vào giỏ là ${formatVnd(changed.previousPrice)}, giá hiện tại ${formatVnd(changed.unitPrice)}. Tổng tiền đã tính theo giá mới.`}
          action={
            <Button variant="secondary" size="sm" onClick={dismissPriceNotice}>
              Đã hiểu
            </Button>
          }
        />
      )}

      {view.lines.length === 0 ? (
        <>
          <EmptyCartMessage />
          {!isMockMode() && <TryNewRecipe headingId="cart-try-new" />}
        </>
      ) : (
        <div className="flex flex-col gap-6 small:flex-row small:items-start small:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <section
              aria-label="Sản phẩm trong giỏ"
              className="rounded-card border border-line bg-surface px-4 py-2 small:px-6"
            >
              <ul className="divide-y divide-line">
                {view.lines.map((line) => (
                  <CartLine key={line.key} line={line} liveQty={line.variantId ? live[line.variantId]?.available : undefined} />
                ))}
              </ul>
            </section>
            {buyAgain}
            <CartRecipes />
            {!isMockMode() && <TryNewRecipe headingId="cart-try-new" />}
          </div>
          <div className="w-full small:sticky small:top-6 small:w-[380px] small:shrink-0">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  )
}

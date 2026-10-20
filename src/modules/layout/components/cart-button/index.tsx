import { LuShoppingBag } from "react-icons/lu"

import { formatVnd } from "@lib/util/price"
import CountBadge from "@modules/common/components/count-badge"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type CartSummary = { count: number; subtotal: number }

/** Desktop cart button of the header (cartBtn() in ui.js). */
export function CartButtonDesktop({ count, subtotal }: CartSummary) {
  return (
    <LocalizedClientLink
      href="/cart"
      aria-label={`Giỏ hàng, ${count} món, ${formatVnd(subtotal)}`}
      className="flex h-12 shrink-0 items-center gap-2.5 rounded-[14px] bg-brand pl-1.5 pr-4 text-white hover:bg-brand-mid"
      data-testid="nav-cart-link"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-deep">
        <LuShoppingBag size={20} aria-hidden="true" />
        <CountBadge count={count} className="border-brand bg-accent text-ink" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-brand-bg">Giỏ hàng</span>
        <span className="font-mono text-xs font-bold">{formatVnd(subtotal)}</span>
      </span>
    </LocalizedClientLink>
  )
}

/** Icon-only cart button of the phone header. */
export function CartButtonMobile({ count }: Pick<CartSummary, "count">) {
  return (
    <LocalizedClientLink
      href="/cart"
      aria-label={`Giỏ hàng, ${count} món`}
      className="relative flex h-11 w-11 items-center justify-center rounded-btn border border-line bg-surface text-ink"
    >
      <LuShoppingBag size={20} aria-hidden="true" />
      <CountBadge count={count} className="border-surface bg-brand text-white" />
    </LocalizedClientLink>
  )
}

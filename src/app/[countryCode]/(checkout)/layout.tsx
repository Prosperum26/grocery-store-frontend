import { LuArrowLeft } from "react-icons/lu"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/layout/components/logo"

// Checkout has no store header or footer in the v2 design (pageD footer:false):
// just the logo and a way back to the cart.
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full bg-page small:min-h-screen">
      <header className="border-b border-line bg-surface">
        <nav
          aria-label="Thanh toán"
          className="content-container flex h-16 items-center justify-between"
        >
          <LocalizedClientLink
            href="/cart"
            className="flex flex-1 basis-0 items-center gap-2 text-sm font-semibold text-ink hover:text-brand"
            data-testid="back-to-cart-link"
          >
            <LuArrowLeft size={18} aria-hidden="true" />
            <span className="hidden small:inline">Quay lại giỏ hàng</span>
            <span className="small:hidden">Giỏ hàng</span>
          </LocalizedClientLink>
          <LocalizedClientLink href="/" aria-label="Com4Fud, về trang chủ" data-testid="store-link">
            <Logo size={32} />
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="relative focus:outline-none"
        data-testid="checkout-container"
      >
        {children}
      </main>
    </div>
  )
}

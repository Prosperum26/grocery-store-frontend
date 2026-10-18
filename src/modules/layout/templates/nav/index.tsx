import { LuBell, LuUser } from "react-icons/lu"

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { ComingSoonButton } from "@modules/common/components/coming-soon"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  AddressPill,
  MobileAddressRow,
} from "@modules/layout/components/address-pill"
import {
  CartButtonDesktop,
  CartButtonMobile,
} from "@modules/layout/components/cart-button"
import CategoryNav from "@modules/layout/components/category-nav"
import HeaderSearch from "@modules/layout/components/header-search"
import Logo from "@modules/layout/components/logo"
import MobileNav from "@modules/layout/components/mobile-nav"
import UtilityBar from "@modules/layout/components/utility-bar"

/**
 * Store header of the v2 design (utilityBar() + header() in ui.js on desktop,
 * mHomeTop() + the floating nav on phones). Breakpoint `small` = 1024px.
 */
export default async function Nav() {
  const [cart, customer] = await Promise.all([
    retrieveCart().catch(() => null),
    retrieveCustomer().catch(() => null),
  ])
  const count = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const subtotal = cart?.item_subtotal ?? 0
  const accountLabel = customer ? "Tài khoản của tôi" : "Đăng nhập"

  return (
    <>
      <header className="border-b border-line bg-surface">
        {/* Desktop */}
        <div className="hidden small:block">
          <UtilityBar />
          <div className="content-container flex h-20 items-center gap-5">
            <LocalizedClientLink href="/" aria-label="Com4Fud, về trang chủ" data-testid="nav-store-link">
              <Logo />
            </LocalizedClientLink>
            <HeaderSearch className="flex-1" />
            <AddressPill />
            <LocalizedClientLink
              href="/account"
              aria-label={accountLabel}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-btn border border-line text-ink hover:bg-page"
              data-testid="nav-account-link"
            >
              <LuUser size={20} aria-hidden="true" />
            </LocalizedClientLink>
            <CartButtonDesktop count={count} subtotal={subtotal} />
          </div>
          <div className="content-container">
            <CategoryNav />
          </div>
        </div>

        {/* Phone and tablet */}
        <div className="content-container flex flex-col gap-2.5 pb-3 pt-3 small:hidden">
          <div className="flex items-center justify-between">
            <LocalizedClientLink href="/" aria-label="Com4Fud, về trang chủ">
              <Logo size={32} />
            </LocalizedClientLink>
            <div className="flex items-center gap-2">
              <CartButtonMobile count={count} />
              <ComingSoonButton
                feature="Thông báo"
                variant="secondary"
                icon={<LuBell />}
                aria-label="Thông báo"
                className="!h-11 !w-11 !rounded-btn !border-line"
              />
            </div>
          </div>
          <MobileAddressRow />
          <HeaderSearch showAssistant={false} />
        </div>
      </header>
      <MobileNav cartCount={count} />
    </>
  )
}

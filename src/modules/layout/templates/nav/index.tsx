import { LuUser } from "react-icons/lu"

import { retrieveCustomer } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  LiveCartDesktop,
  LiveCartMobile,
} from "@modules/layout/components/cart-button/live"
import CategoryNav from "@modules/layout/components/category-nav"
import DeliverySlotPill from "@modules/layout/components/delivery-slot-pill"
import HeaderSearch from "@modules/layout/components/header-search"
import Logo from "@modules/layout/components/logo"
import MobileNav from "@modules/layout/components/mobile-nav"

/**
 * Store header: logo, search, delivery slot (spec R1), account, cart, then a thin row of
 * shortcuts (category menu, deals, Mua lại, Trợ lý Bếp). Phones get the same pieces stacked plus the floating bottom nav.
 * Breakpoint `small` = 1024px. Everything here leads somewhere: there is no
 * announcement strip (the delivery pill already says when the order arrives)
 * and no button for a feature that does not exist yet.
 */
export default async function Nav() {
  const customer = await retrieveCustomer().catch(() => null)
  const accountLabel = customer ? "Tài khoản của tôi" : "Đăng nhập"

  return (
    <>
      <header className="border-b border-line bg-surface">
        {/* Desktop */}
        <div className="hidden small:block">
          <div className="content-container flex h-20 items-center gap-5">
            <LocalizedClientLink href="/" aria-label="Com4Fud, về trang chủ" data-testid="nav-store-link">
              <Logo />
            </LocalizedClientLink>
            <HeaderSearch className="flex-1" />
            <DeliverySlotPill variant="desktop" />
            <LocalizedClientLink
              href="/account"
              aria-label={accountLabel}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-btn border border-line text-ink hover:bg-page"
              data-testid="nav-account-link"
            >
              <LuUser size={20} aria-hidden="true" />
            </LocalizedClientLink>
            <LiveCartDesktop />
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
            <LiveCartMobile />
          </div>
          <DeliverySlotPill variant="phone" />
          <HeaderSearch />
        </div>
      </header>
      <MobileNav />
    </>
  )
}

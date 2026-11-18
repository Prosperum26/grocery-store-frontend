"use client"

import { signout } from "@lib/data/customer"
import { clearAllDrafts } from "@lib/util/draft"
import { signOutDemo } from "@lib/data/demo-session"
import { isMockMode } from "@lib/mock/mode"
import { cx } from "@lib/util/cx"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, usePathname } from "next/navigation"
import { LuLogOut, LuMapPin, LuReceipt, LuTicket, LuUser } from "react-icons/lu"
import type { IconType } from "react-icons"

const ITEMS: { label: string; href: string; icon: IconType }[] = [
  { label: "Đơn hàng", href: "/account/orders", icon: LuReceipt },
  { label: "Địa chỉ", href: "/account/addresses", icon: LuMapPin },
  { label: "Hồ sơ", href: "/account/profile", icon: LuUser },
  { label: "Ví mã giảm giá", href: "/account/vi-ma-giam-gia", icon: LuTicket },
]

/**
 * Account menu (07 Đơn hàng của tôi, side column). `aria-current` marks the
 * page you are on. Sign-out is a button, not a link.
 */
export default function AccountNav({ name }: { name: string }) {
  const pathname = usePathname()
  const { countryCode } = useParams<{ countryCode: string }>()
  const initial = name.trim().charAt(0).toUpperCase() || "?"

  const logout = async () => {
    clearAllDrafts() // addresses and phone numbers must not outlive the session on a shared device
    if (isMockMode()) {
      await signOutDemo(countryCode)
      return
    }
    await signout(countryCode)
  }

  return (
    <nav aria-label="Tài khoản" className="small:w-[264px] small:shrink-0">
      <div className="mb-4 hidden items-center gap-3 small:flex">
        <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-display text-lg font-bold text-ink">
          {initial}
        </span>
        <p className="min-w-0 truncate font-semibold text-ink">{name}</p>
      </div>

      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 small:mx-0 small:flex-col small:gap-1 small:overflow-visible small:rounded-card small:border small:border-line small:bg-surface small:p-2">
        {ITEMS.map((item) => {
          // pathname carries the country code, e.g. /vn/account/orders.
          const active = pathname.includes(item.href)
          const Icon = item.icon
          return (
            <li key={item.href} className="shrink-0">
              <LocalizedClientLink
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex h-11 items-center gap-2.5 whitespace-nowrap rounded-btn px-3.5 text-sm font-semibold",
                  active ? "bg-brand-bg text-brand" : "text-ink hover:bg-page",
                  "small:w-full small:rounded-[10px]"
                )}
              >
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </LocalizedClientLink>
            </li>
          )
        })}
        <li className="shrink-0">
          <button
            type="button"
            onClick={logout}
            className="flex h-11 items-center gap-2.5 whitespace-nowrap rounded-btn px-3.5 text-sm font-semibold text-sale-deep hover:bg-sale-bg small:w-full small:rounded-[10px]"
          >
            <LuLogOut aria-hidden="true" size={18} />
            Đăng xuất
          </button>
        </li>
      </ul>
    </nav>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { IconType } from "react-icons"
import {
  LuChefHat,
  LuHouse,
  LuLayoutGrid,
  LuMenu,
  LuShoppingBag,
  LuUser,
  LuX,
} from "react-icons/lu"

import { cx } from "@lib/util/cx"
import CountBadge from "@modules/common/components/count-badge"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Phone navigation of the v2 design (navFab()/navOpen() in ui.js): a round
// floating button that expands into a 5-item bar. Hidden from 1024px up,
// where the header shows the same links.
const ITEMS: { label: string; href: string; icon: IconType; match: (p: string) => boolean }[] = [
  { label: "Trang chủ", href: "/", icon: LuHouse, match: (p) => p === "" },
  { label: "Danh mục", href: "/store", icon: LuLayoutGrid, match: (p) => p === "store" || p.startsWith("categories") },
  { label: "Trợ lý Bếp", href: "/tro-ly-bep", icon: LuChefHat, match: (p) => p === "tro-ly-bep" },
  { label: "Giỏ hàng", href: "/cart", icon: LuShoppingBag, match: (p) => p === "cart" },
  { label: "Tài khoản", href: "/account", icon: LuUser, match: (p) => p.startsWith("account") },
]

export default function MobileNav({ cartCount }: { cartCount: number }) {
  const [open, setOpen] = useState(false)
  const fabRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const current = pathname.split("/").slice(2).join("/")

  // Close after navigating.
  useEffect(() => setOpen(false), [pathname])

  // Move focus into the bar when it opens; Esc closes it and returns focus
  // to the floating button.
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        fabRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="small:hidden" data-surface="dark">
      <button
        ref={fabRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-bar"
        aria-label={cartCount > 0 ? `Mở điều hướng, giỏ hàng có ${cartCount} món` : "Mở điều hướng"}
        onClick={() => setOpen(true)}
        className={cx(
          "fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-deep text-white shadow-toast shadow-accent",
          open && "hidden"
        )}
      >
        <LuMenu size={24} aria-hidden="true" />
        <CountBadge count={cartCount} className="border-brand-deep bg-accent text-ink" />
      </button>

      <nav
        id="mobile-nav-bar"
        aria-label="Điều hướng chính"
        hidden={!open}
        className="fixed inset-x-4 bottom-5 z-40 rounded-full bg-brand-deep px-2 shadow-toast shadow-accent"
      >
        <ul className="flex h-16 items-center gap-0.5">
          {ITEMS.map(({ label, href, icon: Icon, match }) => {
            const active = match(current)
            return (
              <li key={href} className="flex-1">
                <LocalizedClientLink
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="flex min-h-[44px] flex-col items-center justify-center gap-0.5"
                >
                  <span
                    className={cx(
                      "relative flex h-7 w-10 items-center justify-center rounded-full",
                      active ? "bg-brand text-white" : "text-on-dark"
                    )}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {href === "/cart" && (
                      <CountBadge count={cartCount} className="border-brand-deep bg-accent text-ink" />
                    )}
                  </span>
                  <span
                    className={cx(
                      "whitespace-nowrap text-[10px] leading-[14px]",
                      active ? "font-semibold text-white" : "font-medium text-on-dark"
                    )}
                  >
                    {label}
                  </span>
                </LocalizedClientLink>
              </li>
            )
          })}
          <li>
            <button
              ref={closeRef}
              type="button"
              aria-label="Thu gọn điều hướng"
              onClick={() => {
                setOpen(false)
                fabRef.current?.focus()
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-mid text-white"
            >
              <LuX size={18} aria-hidden="true" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

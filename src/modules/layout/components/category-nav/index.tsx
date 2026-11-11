"use client"

import { usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import type { IconType } from "react-icons"
import {
  LuApple,
  LuBeef,
  LuChefHat,
  LuChevronDown,
  LuCookie,
  LuCupSoda,
  LuEgg,
  LuFish,
  LuLayoutGrid,
  LuLeaf,
  LuMilk,
  LuPercent,
  LuRepeat,
  LuSnowflake,
  LuSoup,
  LuWheat,
} from "react-icons/lu"

import { getReorderBasket } from "@lib/data/predictive"
import { isMockMode } from "@lib/mock/mode"
import { cx } from "@lib/util/cx"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Every top-level category of the catalog, fresh food first (the "Tất cả danh mục" menu).
export const CATEGORY_LINKS: { handle: string; name: string; icon: IconType }[] = [
  { handle: "rau-cu", name: "Rau củ", icon: LuLeaf },
  { handle: "trai-cay", name: "Trái cây", icon: LuApple },
  { handle: "thit", name: "Thịt", icon: LuBeef },
  { handle: "hai-san", name: "Hải sản", icon: LuFish },
  { handle: "trung-sua", name: "Trứng & Sữa", icon: LuEgg },
  { handle: "gao-do-kho", name: "Gạo & Đồ khô", icon: LuWheat },
  { handle: "gia-vi", name: "Gia vị", icon: LuMilk },
  { handle: "do-uong", name: "Đồ uống", icon: LuCupSoda },
  { handle: "mi-an-lien", name: "Mì & Đồ ăn liền", icon: LuSoup },
  { handle: "banh-keo-an-vat", name: "Bánh kẹo", icon: LuCookie },
  { handle: "dong-lanh-che-bien", name: "Đông lạnh", icon: LuSnowflake },
]

/**
 * Thin row of shortcuts under the desktop header: the category menu, today's
 * deals, "Mua lại" (only when the signed-in shopper has a basket to reorder)
 * and Trợ lý Bếp. The eleven categories live in a menu instead of a row of
 * their own: the home page and the list sidebar already show them, so the
 * header only needs one way in from every page.
 */
export default function CategoryNav() {
  const pathname = usePathname()
  // pathname is /vn/categories/rau-cu; compare without the country code.
  const current = pathname.split("/").slice(2).join("/")
  const chefActive = current === "tro-ly-bep"
  const [hasReorder, setHasReorder] = useState(false)

  // The nav outlives page changes, so check again after each one: signing in
  // or out happens while it stays mounted.
  useEffect(() => {
    if (isMockMode()) return
    let stale = false
    getReorderBasket()
      .then((basket) => {
        if (!stale) setHasReorder(basket.items.length > 0)
      })
      .catch(() => undefined)
    return () => {
      stale = true
    }
  }, [pathname])

  const shortcut = (active: boolean) =>
    cx(
      "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 text-sm",
      active ? "bg-brand-bg font-semibold text-brand-deep" : "font-medium text-ink hover:bg-page"
    )

  return (
    <nav aria-label="Lối tắt" className="flex h-12 items-center gap-1">
      <CategoryMenu current={current} />
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
      <LocalizedClientLink href="/store?sale=1" className={shortcut(false)}>
        <LuPercent size={16} aria-hidden="true" className="text-sale" />
        Ưu đãi hôm nay
      </LocalizedClientLink>
      {hasReorder && (
        <LocalizedClientLink
          href="/mua-lai"
          aria-current={current === "mua-lai" ? "page" : undefined}
          className={cx(
            "flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-sm font-semibold",
            current === "mua-lai" ? "bg-accent-ink text-white" : "bg-accent-soft text-accent-ink"
          )}
        >
          <LuRepeat size={16} aria-hidden="true" />
          Mua lại
        </LocalizedClientLink>
      )}
      <LocalizedClientLink
        href="/tro-ly-bep"
        aria-current={chefActive ? "page" : undefined}
        className={cx(
          "ml-auto flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-sm font-semibold",
          chefActive ? "bg-accent-ink text-white" : "bg-accent-soft text-accent-ink"
        )}
      >
        <LuChefHat size={16} aria-hidden="true" />
        Trợ lý Bếp
      </LocalizedClientLink>
    </nav>
  )
}

/**
 * "Tất cả danh mục": a button that opens a panel of the categories. Plain
 * links inside, so Tab walks them; Esc, a click outside or following a link
 * closes it.
 */
function CategoryMenu({ current }: { current: string }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const boxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inCategory = current.startsWith("categories/")

  // Going to another page closes the menu.
  useEffect(() => setOpen(false), [current])

  useEffect(() => {
    if (!open) return
    const onOutside = (event: MouseEvent | FocusEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", onOutside)
    document.addEventListener("focusin", onOutside)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onOutside)
      document.removeEventListener("focusin", onOutside)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={boxRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold",
          open || inCategory ? "bg-brand-bg text-brand-deep" : "text-ink hover:bg-page"
        )}
      >
        <LuLayoutGrid size={16} aria-hidden="true" />
        Tất cả danh mục
        <LuChevronDown size={16} aria-hidden="true" className={cx("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute left-0 top-[calc(100%+6px)] z-40 w-[560px] rounded-2xl border border-line bg-surface p-3 shadow-lg"
        >
          <ul className="grid grid-cols-3 gap-1">
            {CATEGORY_LINKS.map(({ handle, name, icon: Icon }) => {
              const active = current === `categories/${handle}`
              return (
                <li key={handle}>
                  <LocalizedClientLink
                    href={`/categories/${handle}`}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex h-11 items-center gap-2.5 rounded-xl px-3 text-sm",
                      active ? "bg-brand-bg font-semibold text-brand-deep" : "font-medium text-ink hover:bg-page"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-surface text-brand" : "bg-page text-ink-2"
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    {name}
                  </LocalizedClientLink>
                </li>
              )
            })}
          </ul>
          <LocalizedClientLink
            href="/store"
            className="mt-2 flex h-10 items-center justify-center rounded-xl border-t border-line text-sm font-semibold text-brand-deep hover:bg-page"
          >
            Xem tất cả sản phẩm
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}

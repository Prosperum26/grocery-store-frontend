"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import type { IconType } from "react-icons"
import {
  LuApple,
  LuBeef,
  LuChefHat,
  LuEgg,
  LuFish,
  LuLeaf,
  LuMilk,
  LuRepeat,
  LuWheat,
} from "react-icons/lu"

import { getReorderBasket } from "@lib/data/predictive"
import { isMockMode } from "@lib/mock/mode"
import { cx } from "@lib/util/cx"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Desktop category row under the header (header() in ui.js, CATS).
export const CATEGORY_LINKS: { handle: string; name: string; icon: IconType }[] = [
  { handle: "rau-cu", name: "Rau củ", icon: LuLeaf },
  { handle: "trai-cay", name: "Trái cây", icon: LuApple },
  { handle: "thit", name: "Thịt", icon: LuBeef },
  { handle: "hai-san", name: "Hải sản", icon: LuFish },
  { handle: "trung-sua", name: "Trứng & Sữa", icon: LuEgg },
  { handle: "gao-do-kho", name: "Gạo & Đồ khô", icon: LuWheat },
  { handle: "gia-vi", name: "Gia vị", icon: LuMilk },
]

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

  return (
    <nav aria-label="Danh mục sản phẩm" className="flex h-[52px] items-center justify-between gap-4">
      <ul className="flex min-w-0 items-center gap-1">
        {CATEGORY_LINKS.map(({ handle, name, icon: Icon }) => {
          const active = current === `categories/${handle}`
          return (
            <li key={handle}>
              <LocalizedClientLink
                href={`/categories/${handle}`}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-2.5 text-sm",
                  active
                    ? "bg-brand-bg font-semibold text-brand-deep"
                    : "font-medium text-ink hover:bg-page"
                )}
              >
                <Icon size={16} aria-hidden="true" className={active ? "text-brand" : "text-ink-2"} />
                {name}
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
      <div className="flex shrink-0 items-center gap-2">
        {hasReorder && (
          <LocalizedClientLink
            href="/mua-lai"
            aria-label="Mua lại"
            aria-current={current === "mua-lai" ? "page" : undefined}
            title="Mua lại"
            className={cx(
              "flex h-9 w-9 items-center justify-center rounded-[10px]",
              current === "mua-lai" ? "bg-accent-ink text-white" : "bg-accent-soft text-accent-ink"
            )}
          >
            <LuRepeat size={16} aria-hidden="true" />
          </LocalizedClientLink>
        )}
        <LocalizedClientLink
          href="/tro-ly-bep"
          aria-current={chefActive ? "page" : undefined}
          className={cx(
            "flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-sm font-semibold",
            chefActive ? "bg-accent-ink text-white" : "bg-accent-soft text-accent-ink"
          )}
        >
          <LuChefHat size={16} aria-hidden="true" />
          Trợ lý Bếp
        </LocalizedClientLink>
      </div>
    </nav>
  )
}

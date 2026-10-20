"use client"

import { usePathname } from "next/navigation"
import type { IconType } from "react-icons"
import {
  LuApple,
  LuBeef,
  LuChefHat,
  LuEgg,
  LuFish,
  LuLeaf,
  LuMilk,
  LuWheat,
} from "react-icons/lu"

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
      <LocalizedClientLink
        href="/tro-ly-bep"
        aria-current={chefActive ? "page" : undefined}
        className={cx(
          "flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-sm font-semibold",
          chefActive ? "bg-accent-ink text-white" : "bg-accent-soft text-accent-ink"
        )}
      >
        <LuChefHat size={16} aria-hidden="true" />
        Trợ lý Bếp
      </LocalizedClientLink>
    </nav>
  )
}

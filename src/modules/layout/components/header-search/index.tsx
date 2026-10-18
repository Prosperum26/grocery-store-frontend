"use client"

import { useParams } from "next/navigation"
import { LuChefHat, LuSearch } from "react-icons/lu"

import { cx } from "@lib/util/cx"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Search box of the header. A plain GET form to /store?q=..., so it works
 * without JavaScript and the results page owns the filtering (FE-6).
 */
export default function HeaderSearch({
  showAssistant = true,
  className,
}: {
  showAssistant?: boolean
  className?: string
}) {
  const { countryCode } = useParams()

  return (
    <form
      role="search"
      action={`/${countryCode}/store`}
      method="get"
      className={cx(
        "flex h-12 min-w-0 items-center gap-2.5 rounded-[14px] border border-line-2 bg-page pl-4 pr-1.5 focus-within:border-ink",
        className
      )}
    >
      <label htmlFor="header-search" className="sr-only">
        Tìm sản phẩm
      </label>
      <LuSearch size={20} aria-hidden="true" className="shrink-0 text-ink-2" />
      <input
        id="header-search"
        name="q"
        type="search"
        placeholder="Tìm “cá lóc”, “canh chua”, “rau ăn lẩu”…"
        className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none"
      />
      {showAssistant && (
        <LocalizedClientLink
          href="/tro-ly-bep"
          className="hidden h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-accent px-3 text-[13px] font-semibold text-ink medium:inline-flex"
        >
          <LuChefHat size={16} aria-hidden="true" />
          Hỏi Trợ lý Bếp
        </LocalizedClientLink>
      )}
    </form>
  )
}

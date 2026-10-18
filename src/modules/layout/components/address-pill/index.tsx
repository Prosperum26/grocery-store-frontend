"use client"

import { LuChevronDown, LuClock, LuMapPin } from "react-icons/lu"

import { cx } from "@lib/util/cx"
import { useComingSoon } from "@modules/common/components/coming-soon"

// Choosing an address and a delivery slot from the header is not built yet
// (it happens at checkout), so these open the coming-soon dialog.

export function AddressPill({ className }: { className?: string }) {
  const { open } = useComingSoon()
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => open("Chọn địa chỉ giao")}
      className={cx(
        "flex h-12 shrink-0 items-center gap-2 rounded-[14px] border border-line px-3 text-left hover:bg-page",
        className
      )}
    >
      <LuMapPin size={18} aria-hidden="true" className="text-brand" />
      <span className="flex flex-col">
        <span className="text-xs text-ink-2">Giao đến · Q.7</span>
        <span className="text-sm font-semibold text-ink">Hôm nay 17:00–19:00</span>
      </span>
      <LuChevronDown size={16} aria-hidden="true" className="text-ink-2" />
    </button>
  )
}

/** Compact version of the mobile header: address on the left, slot chip on the right. */
export function MobileAddressRow() {
  const { open } = useComingSoon()
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => open("Chọn địa chỉ giao")}
        className="relative flex min-h-[44px] min-w-0 items-center gap-1.5 text-sm text-ink"
      >
        <LuMapPin size={16} aria-hidden="true" className="shrink-0 text-brand" />
        <span className="truncate">Giao đến Sky Garden, Q.7</span>
        <LuChevronDown size={14} aria-hidden="true" className="shrink-0 text-ink-2" />
      </button>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => open("Chọn khung giờ giao")}
        aria-label="Khung giờ giao: 17:00 đến 19:00"
        className="touch-target relative inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-brand-bg px-2.5 font-mono text-xs font-bold text-brand-deep"
      >
        <LuClock size={13} aria-hidden="true" />
        17:00–19:00
      </button>
    </div>
  )
}

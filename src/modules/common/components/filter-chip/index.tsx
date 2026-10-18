"use client"

import { clx } from "@medusajs/ui"

/**
 * Selectable pill (fchip() in ui.js): ink when on, white with border when off.
 * aria-pressed tells assistive tech whether the filter is applied.
 */
export default function FilterChip({
  pressed,
  onClick,
  icon,
  count,
  size = "md",
  className,
  children,
}: {
  pressed: boolean
  onClick: () => void
  /** Icon element, e.g. icon={<LuPercent />}. */
  icon?: React.ReactNode
  count?: number
  size?: "sm" | "md"
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={clx(
        "touch-target relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors",
        size === "sm" ? "h-8" : "h-9",
        pressed
          ? "bg-ink text-white"
          : "border border-line-2 bg-surface text-ink hover:bg-page",
        className
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={clx("flex text-base", pressed ? "text-accent" : "text-ink-2")}
        >
          {icon}
        </span>
      )}
      {children}
      {count !== undefined && (
        <span
          className={clx(
            "font-mono text-xs font-bold",
            pressed ? "text-accent" : "text-ink-3"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

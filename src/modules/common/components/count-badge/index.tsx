import { clx } from "@medusajs/ui"

/**
 * Small round count (badge() in ui.js), e.g. items in the cart on top of an
 * icon. Decorative: put the count in the parent's accessible name instead.
 */
export default function CountBadge({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  if (count <= 0) {
    return null
  }
  return (
    <span
      aria-hidden="true"
      className={clx(
        "absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 px-1 font-mono text-[11px] font-bold",
        className ?? "border-surface bg-warn text-ink"
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

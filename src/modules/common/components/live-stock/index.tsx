import { clx } from "@medusajs/ui"

import { stockLabel } from "@lib/util/stock"

/**
 * Stock pill (liveStock() in ui.js): "Còn 3 khay" when stock is low,
 * "Hết hàng" at zero, nothing otherwise. Real-time updates come later
 * (Socket.io, out of scope for issue #11); this renders the current value.
 */
export default function LiveStock({
  qty,
  lowStock,
  unit,
  className,
}: {
  qty: number
  lowStock: number
  unit: string
  className?: string
}) {
  const label = stockLabel(qty, lowStock, unit)
  if (!label) {
    return null
  }
  const out = label.state === "out"
  return (
    <span
      className={clx(
        "inline-flex h-[26px] w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold",
        out ? "bg-page-2 text-ink-2" : "bg-warn-bg text-warn-ink",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={clx(
          "h-1.5 w-1.5 rounded-full",
          out ? "bg-ink-3" : "bg-warn-ink ring-[3px] ring-warn-ink/25"
        )}
      />
      {label.text}
    </span>
  )
}

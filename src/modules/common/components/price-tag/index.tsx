import { clx } from "@medusajs/ui"

import { formatVnd } from "@lib/util/price"

/**
 * Price tag of the v2 design (priceTag() in ui.js): dark notched label with
 * a punched hole, like a supermarket tag. Turns red-orange for sale prices.
 */
export default function PriceTag({
  price,
  unit,
  sale,
  large,
  className,
}: {
  price: number
  /** Printed after the price, e.g. "khay 500g" → "85.000đ/khay 500g". */
  unit?: string
  sale?: boolean
  large?: boolean
  className?: string
}) {
  return (
    <span
      className={clx(
        "ticket relative inline-flex w-fit items-baseline gap-1 whitespace-nowrap pl-6 pr-3 font-mono font-bold text-white",
        large ? "h-10 items-center text-xl" : "h-8 items-center text-base",
        sale ? "bg-sale" : "bg-ink",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-surface"
      />
      {formatVnd(price)}
      {unit && (
        <span className="text-xs font-medium text-on-dark">/{unit}</span>
      )}
    </span>
  )
}

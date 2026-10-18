import { cx as clx } from "@lib/util/cx"

/**
 * Discount sticker of the v2 design: turmeric label, ink border and shadow,
 * stuck on at -5°. Pass the visible text (e.g. "−12%"); `label` is what a
 * screen reader hears ("Giảm 12%"), since "−12%" alone reads badly.
 */
export default function SaleSticker({
  children,
  label,
  large,
  className,
}: {
  children: React.ReactNode
  label?: string
  large?: boolean
  className?: string
}) {
  return (
    <span
      className={clx(
        "inline-flex w-fit -rotate-[5deg] items-center rounded-tag border-[1.5px] border-ink bg-warn px-2 font-mono font-bold text-ink shadow-sticker shadow-ink",
        large ? "h-[30px] text-[13px]" : "h-[26px] text-xs",
        className
      )}
    >
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        children
      )}
    </span>
  )
}

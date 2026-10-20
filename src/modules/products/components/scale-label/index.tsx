import { formatVnd, pricePerKg } from "@lib/util/price"
import type { ProductVariantVM } from "types/viewmodels"

/**
 * "Tem cân" of the v2 design: the printed label of a weighed pack, with the
 * unit price, weight and total. It is the brand's signature, so it shows on
 * the product page. Plain text, no barcode, so nothing looks scanned.
 */
export default function ScaleLabel({
  variant,
  packLabel,
  className,
}: {
  variant: ProductVariantVM
  packLabel: string
  className?: string
}) {
  const perKg = pricePerKg(variant.price, variant.weightGrams)
  const rows: [string, string][] = [
    ...(perKg ? [["Đơn giá", `${formatVnd(perKg)}/kg`] as [string, string]] : []),
    ...(variant.weightGrams ? [["Khối lượng", formatWeight(variant.weightGrams)] as [string, string]] : []),
    ["Đóng gói", packLabel],
  ]

  return (
    <div
      className={`w-[260px] rotate-[-2deg] rounded-[10px] border-[1.5px] border-ink bg-surface shadow-[5px_5px_0_0_var(--tw-shadow-color)] shadow-brand-deep ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between rounded-t-[8px] bg-brand px-3 py-1.5 font-mono text-[11px] font-bold tracking-wide text-accent">
        <span>COM4FUD · TƯƠI</span>
        <span>TEM CÂN</span>
      </div>
      <dl className="flex flex-col gap-1.5 px-3 py-2.5 font-mono text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-2 border-b border-dashed border-line-2 pb-1.5 last:border-0">
            <dt className="text-ink-2">{label}</dt>
            <dd className="font-bold text-ink">{value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-2 pt-1">
          <dt className="font-semibold text-ink">Thành tiền</dt>
          <dd className="font-mono text-xl font-bold text-ink">{formatVnd(variant.price)}</dd>
        </div>
      </dl>
    </div>
  )
}

function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toString().replace(".", ",")} kg` : `${grams} g`
}

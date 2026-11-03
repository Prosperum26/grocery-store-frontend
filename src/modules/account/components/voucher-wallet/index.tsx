"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import type { VoucherView } from "@lib/data/vouchers"
import { formatVnd } from "@lib/util/price"
import { formatVnDate } from "@lib/util/order-receipt"
import Button from "@modules/common/components/button"
import { useState } from "react"

const STATUS_TEXT: Record<VoucherView["status"], string> = {
  usable: "Dùng được",
  not_eligible: "Chưa đủ điều kiện",
  expired: "Đã hết hạn",
}

/**
 * The customer's discount codes. "Dùng mã" puts the code on the cart; the
 * cart tells if it qualifies (a code can exist and still give 0đ).
 */
export default function VoucherWallet({ vouchers }: { vouchers: VoucherView[] }) {
  const { applyVoucher } = useCart()
  const { show } = useToast()
  const [busy, setBusy] = useState<string | null>(null)

  const use = async (code: string) => {
    setBusy(code)
    const result = await applyVoucher(code)
    setBusy(null)
    if (result === "ok") {
      show({ tone: "ok", title: `Đã áp dụng mã ${code}`, description: "Xem giảm giá trong giỏ hàng." })
    } else if (result === "not_eligible") {
      show({ tone: "warn", title: "Giỏ hàng chưa đủ điều kiện dùng mã này" })
    } else {
      show({ tone: "err", title: "Mã không hợp lệ hoặc đã hết hạn" })
    }
  }

  if (vouchers.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line-2 bg-surface p-6 text-sm text-ink-2">
        Bạn chưa có mã giảm giá nào.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {vouchers.map((v) => {
        const usable = v.status === "usable"
        return (
          <li
            key={v.code}
            className={
              "flex flex-col gap-3 rounded-card border bg-surface p-4 small:flex-row small:items-center small:justify-between small:p-5 " +
              (usable ? "border-line" : "border-line opacity-70")
            }
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-bold text-ink">{v.code}</span>
                <span className={"rounded-chip px-2 py-0.5 text-xs font-semibold " + (usable ? "bg-brand-bg text-brand" : "bg-page-2 text-ink-2")}>
                  {STATUS_TEXT[v.status]}
                </span>
              </div>
              <p className="font-semibold text-ink">{v.title}</p>
              <p className="text-sm text-ink-2">
                {v.description}
                {v.minSubtotal ? ` · đơn từ ${formatVnd(v.minSubtotal)}` : ""}
                {v.endsAt ? ` · hết hạn ${formatVnDate(v.endsAt)}` : ""}
              </p>
            </div>
            {v.status !== "expired" && (
              <Button variant="primary" size="md" onClick={() => use(v.code)} aria-disabled={busy !== null || undefined}>
                {busy === v.code ? "Đang áp dụng…" : "Dùng mã"}
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

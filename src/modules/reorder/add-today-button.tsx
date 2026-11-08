"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import { addReorderToday } from "@lib/data/predictive"
import Button from "@modules/common/components/button"
import { useParams } from "next/navigation"
import { useState } from "react"
import { LuPlus } from "react-icons/lu"

export default function AddTodayButton({ label }: { label: string }) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const { refresh } = useCart()
  const { show } = useToast()
  const [busy, setBusy] = useState(false)

  const addAll = async () => {
    setBusy(true)
    const { added, skipped } = await addReorderToday(countryCode)
    await refresh()
    setBusy(false)
    show(
      added > 0
        ? {
            tone: "ok",
            title: `Đã thêm ${added} món vào giỏ`,
            description: skipped > 0 ? `${skipped} món hết hàng nên chưa thêm.` : undefined,
          }
        : { tone: "warn", title: "Chưa thêm được món nào", description: "Các món này hiện đã hết hàng." }
    )
  }

  return (
    <Button variant="primary" size="md" icon={<LuPlus />} onClick={addAll} aria-disabled={busy || undefined}>
      {busy ? "Đang thêm…" : label}
    </Button>
  )
}

"use client"

import { reorderOrder } from "@lib/data/my-orders"
import { useToast } from "@lib/context/toast-context"
import { isMockMode } from "@lib/mock/mode"
import Button from "@modules/common/components/button"
import { useParams } from "next/navigation"
import { useState } from "react"

/**
 * "Mua lại": puts the items of a past order back in the cart. Mock orders
 * have no item list, so mock mode shows no button.
 */
export default function ReorderButton({ orderId }: { orderId: string }) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const { show } = useToast()
  const [busy, setBusy] = useState(false)

  if (isMockMode()) {
    return null
  }

  const onClick = async () => {
    setBusy(true)
    const { added } = await reorderOrder(orderId, countryCode)
    setBusy(false)
    if (added === 0) {
      show({ tone: "warn", title: "Chưa thêm được món nào", description: "Các món trong đơn này hiện đã hết hàng." })
      return
    }
    // A full page load, so the header badge and the cart read the new cart.
    window.location.assign(`/${countryCode}/cart`)
  }

  return (
    <Button variant="accent" size="md" onClick={onClick} aria-disabled={busy || undefined}>
      {busy ? "Đang thêm…" : "Mua lại"}
    </Button>
  )
}

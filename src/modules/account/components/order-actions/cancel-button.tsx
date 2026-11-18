"use client"

import { cancelMyOrder } from "@lib/data/my-orders"
import { useToast } from "@lib/context/toast-context"
import Button from "@modules/common/components/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

const MESSAGES = {
  not_cancellable: "Đơn này đã được xác nhận nên không hủy được nữa.",
  refund_failed: "Hoàn tiền chưa thành công nên đơn chưa được hủy. Bạn thử lại sau nhé.",
  failed: "Chưa hủy được đơn. Bạn thử lại sau nhé.",
}

/**
 * Cancel an order that is still "Chờ xác nhận". Two steps, so one stray tap
 * does not cancel and refund an order.
 */
export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { show } = useToast()
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)

  const cancel = async () => {
    setBusy(true)
    const result = await cancelMyOrder(orderId)
    setBusy(false)
    setAsking(false)
    if (!result.ok) {
      show({ tone: "err", title: "Chưa hủy được đơn", description: MESSAGES[result.reason] })
      // The order may have moved on in the meantime: show it as it is now.
      router.refresh()
      return
    }
    show({ tone: "ok", title: "Đã hủy đơn", description: "Tiền sẽ được hoàn về VNPAY." })
    // The backend sets the new stage a moment later (an event), so look again after a short wait.
    router.refresh()
    setTimeout(() => router.refresh(), 1500)
  }

  if (!asking) {
    return (
      <Button variant="secondary" size="md" onClick={() => setAsking(true)}>
        Hủy đơn
      </Button>
    )
  }

  return (
    <div role="group" aria-label="Xác nhận hủy đơn" className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-ink">Hủy đơn này và hoàn tiền?</span>
      <Button variant="danger" size="md" onClick={cancel} aria-disabled={busy || undefined}>
        {busy ? "Đang hủy…" : "Xác nhận hủy"}
      </Button>
      <Button variant="secondary" size="md" onClick={() => setAsking(false)} aria-disabled={busy || undefined}>
        Giữ đơn
      </Button>
    </div>
  )
}

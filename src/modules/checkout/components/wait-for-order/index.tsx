"use client"

import { findPaidOrder } from "@lib/data/checkout"
import type { RefundNotice } from "@lib/util/checkout"
import { useCart } from "@lib/context/cart-context"
import Button from "@modules/common/components/button"
import { Banner } from "@modules/common/components/notice"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const EVERY_MS = 1500
const MAX_TRIES = 20 // about 30 seconds

/**
 * VNPAY has told us the payment succeeded; the backend creates the order a
 * moment later (when VNPAY's IPN arrives). Ask until it is there, then show
 * the confirmation. The cart view is emptied so the header badge drops to 0.
 * If the stock ran out before the IPN arrived, the backend refunds instead of
 * making the order: say so and keep the cart.
 */
export default function WaitForOrder() {
  const { clear } = useCart()
  const router = useRouter()
  const { countryCode } = useParams<{ countryCode: string }>()
  const [gaveUp, setGaveUp] = useState(false)
  const [refund, setRefund] = useState<RefundNotice | null>(null)

  useEffect(() => {
    let stopped = false

    async function poll() {
      for (let i = 0; i < MAX_TRIES && !stopped; i++) {
        const { orderId, hasCart, refund } = await findPaidOrder().catch(() => ({ orderId: null, hasCart: true, refund: undefined }))
        if (stopped) return
        if (refund) {
          setRefund(refund)
          return
        }
        if (orderId) {
          await clear()
          router.replace(`/${countryCode}/order/${orderId}/confirmed`)
          return
        }
        // No cart cookie: this is another browser, so there is nothing to wait for here.
        if (!hasCart) break
        await new Promise((resolve) => setTimeout(resolve, EVERY_MS))
      }
      if (!stopped) setGaveUp(true)
    }

    poll()
    return () => {
      stopped = true
    }
    // The page asks once per visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (refund) {
    return (
      <>
        <div className="w-full max-w-md text-left">
          <Banner tone={refund.tone} title={refund.title} description={refund.description} />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" href="/cart">
            Về giỏ hàng
          </Button>
          <Button variant="secondary" size="lg" href="/store">
            Tiếp tục mua sắm
          </Button>
        </div>
      </>
    )
  }

  if (gaveUp) {
    return (
      <>
        <div className="w-full max-w-md text-left">
          <Banner
            tone="warn"
            title="Thanh toán thành công, đơn đang được xử lý"
            description="Chưa thấy đơn hiện lên. Bạn đừng thanh toán lại: đơn sẽ có trong mục Đơn hàng của bạn sau ít phút."
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" href="/account/orders">
            Xem đơn hàng
          </Button>
          <Button variant="secondary" size="lg" href="/store">
            Tiếp tục mua sắm
          </Button>
        </div>
      </>
    )
  }

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
      <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-4 border-line-2 border-t-brand" />
      <h1 className="font-display text-2xl font-bold text-ink">Đang xác nhận thanh toán…</h1>
      <p className="max-w-sm text-sm text-ink-2">Thanh toán đã thành công. Cửa hàng đang ghi nhận đơn của bạn, vui lòng giữ trang này.</p>
    </div>
  )
}

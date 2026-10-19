"use client"

import { useMockCart } from "@lib/context/mock-cart-context"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import VoucherInput from "@modules/cart/components/voucher-input"
import { LuArrowRight, LuShieldCheck } from "react-icons/lu"

export const OOS_NOTE_ID = "cart-oos-note"

/**
 * Order summary of the cart. Checkout is blocked while a sold-out line is in
 * the cart: the button stays focusable, is announced as disabled, and the
 * reason is linked to it.
 */
export default function CartSummary() {
  const { view } = useMockCart()
  const blocked = view.outOfStockCount > 0

  return (
    <section
      aria-labelledby="cart-summary"
      className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 small:p-6"
    >
      <h2 id="cart-summary" className="font-display text-lg font-bold text-ink">
        Tóm tắt đơn
      </h2>

      <VoucherInput />

      <dl aria-live="polite" className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-2">Tạm tính ({view.count} món)</dt>
          <dd className="font-mono font-semibold text-ink">{formatVnd(view.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-2">Phí giao hàng</dt>
          <dd className="font-mono font-semibold text-ink">{formatVnd(view.shipping)}</dd>
        </div>
        {view.discount > 0 && (
          <div className="flex justify-between gap-3 text-brand">
            <dt>Mã {view.voucher}</dt>
            <dd className="font-mono font-semibold">−{formatVnd(view.discount)}</dd>
          </div>
        )}
      </dl>

      <div className="flex items-end justify-between gap-3 border-t border-dashed border-line-2 pt-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-ink">Tổng thanh toán</span>
          <span className="text-xs text-ink-2">Giá chốt khi bạn đặt hàng</span>
        </div>
        <span className="font-mono text-2xl font-bold text-ink" aria-live="polite">
          {formatVnd(view.total)}
        </span>
      </div>

      {blocked ? (
        <>
          <Button variant="primary" size="lg" fullWidth aria-disabled="true" aria-describedby={OOS_NOTE_ID} data-testid="checkout-button">
            Tiến hành thanh toán
          </Button>
          <p id={OOS_NOTE_ID} className="text-sm text-sale-deep">
            Xóa {view.outOfStockCount} món hết hàng để tiếp tục thanh toán.
          </p>
        </>
      ) : (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          href="/checkout"
          iconRight={<LuArrowRight />}
          data-testid="checkout-button"
        >
          Tiến hành thanh toán
        </Button>
      )}

      <p className="flex gap-2 text-xs text-ink-2">
        <LuShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={16} />
        Thanh toán qua VNPAY sau bước đặt hàng.
      </p>
    </section>
  )
}

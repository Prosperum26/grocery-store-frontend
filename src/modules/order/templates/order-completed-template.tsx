import { DEMO_ORDER } from "@lib/mock/checkout"
import { formatVnd } from "@lib/util/price"
import type { OrderReceipt } from "@lib/util/order-receipt"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Banner } from "@modules/common/components/notice"
import { LuCircleCheck, LuTruck } from "react-icons/lu"

/**
 * Confirmation of the v2 design (06_Dat_Hang_Thanh_Cong_*): a check, a
 * short thank-you, the receipt as a ticket, and two ways forward. Without a
 * `receipt` (mock mode) it shows the sample order of the design and a notice
 * says so.
 */
export default function OrderCompletedTemplate({ receipt }: { receipt?: OrderReceipt }) {
  const r = receipt ?? {
    code: DEMO_ORDER.code,
    placedAt: DEMO_ORDER.placed,
    slot: DEMO_ORDER.slot,
    note: "",
    count: DEMO_ORDER.count,
    subtotal: DEMO_ORDER.subtotal,
    shipping: DEMO_ORDER.shipping,
    discount: DEMO_ORDER.discount,
    total: DEMO_ORDER.total,
  }
  const discountLabel = receipt ? "Giảm giá" : `Mã ${DEMO_ORDER.voucher}`
  return (
    <div className="content-container flex flex-col items-center gap-8 py-10 small:py-14">
      <div className="flex w-full max-w-2xl flex-col items-center gap-4 text-center">
        <LuCircleCheck aria-hidden="true" size={72} className="text-brand" />
        <h1 className="font-display text-3xl font-bold text-ink small:text-[40px] small:leading-tight">
          Đặt hàng thành công
        </h1>
        <p className="max-w-md text-base text-ink-2">Cảm ơn bạn đã đặt hàng. Đơn của bạn đang được cửa hàng xử lý.</p>
      </div>

      {!receipt && (
        <div className="w-full max-w-2xl">
          <Banner
            tone="info"
            title="Đây là đơn mẫu của bản giao diện"
            description="Chưa có đơn thật được tạo. Khi nối với hệ thống đơn hàng, trang này sẽ hiển thị đơn vừa đặt."
          />
        </div>
      )}

      <section
        aria-labelledby="order-receipt-title"
        className="w-full max-w-md rounded-[10px] border-[1.5px] border-ink bg-surface shadow-[6px_6px_0_0_var(--tw-shadow-color)] shadow-accent"
      >
        <h2
          id="order-receipt-title"
          className="flex items-center justify-between rounded-t-[8px] bg-brand px-4 py-2.5 font-mono text-xs font-bold tracking-wide text-accent"
        >
          <span>COM4FUD · PHIẾU ĐẶT HÀNG</span>
          <span>ĐÃ NHẬN</span>
        </h2>
        <dl className="flex flex-col gap-2.5 px-5 py-4 text-sm">
          <Row label="Mã đơn" value={r.code} mono />
          <Row label="Đặt lúc" value={r.placedAt} mono />
          <Row label="Giao" value={r.slot} />
          {r.note && <Row label="Ghi chú" value={r.note} />}
          <Row label="Thanh toán" value={DEMO_ORDER.payment} />
        </dl>
        <div aria-hidden="true" className="mx-5 border-t border-dashed border-ink-3" />
        <dl className="flex flex-col gap-2 px-5 py-4 text-sm">
          <Row label={`Tạm tính (${r.count} món)`} value={formatVnd(r.subtotal)} mono />
          <Row label="Phí giao hàng" value={formatVnd(r.shipping)} mono />
          {r.discount > 0 && <Row label={discountLabel} value={`−${formatVnd(r.discount)}`} mono />}
          <div className="flex items-end justify-between pt-2">
            <dt className="font-semibold text-ink">Tổng thanh toán</dt>
            <dd className="font-mono text-xl font-bold text-ink">{formatVnd(r.total)}</dd>
          </div>
        </dl>
        <div aria-hidden="true" className="flex h-10 items-end gap-[2px] px-5 pb-4 opacity-70">
          {Array.from({ length: 48 }, (_, i) => (
            <span
              key={i}
              className="bg-ink"
              style={{ width: i % 3 === 0 ? 3 : 1.5, height: i % 5 === 0 ? "100%" : "70%" }}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="lg" href="/account/orders" icon={<LuTruck />}>
          Theo dõi đơn
        </Button>
        <Button variant="secondary" size="lg" href="/store">
          Tiếp tục mua sắm
        </Button>
      </div>
      <LocalizedClientLink href="/" className="text-sm text-ink-2 underline-offset-2 hover:underline">
        Về trang chủ
      </LocalizedClientLink>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd className={mono ? "font-mono font-semibold text-ink" : "font-semibold text-ink"}>{value}</dd>
    </div>
  )
}

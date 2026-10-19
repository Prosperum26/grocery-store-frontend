import { DEMO_ORDER } from "@lib/mock/checkout"
import type { MockOrder } from "@lib/mock/orders"
import { formatVnd } from "@lib/util/price"
import { ComingSoonBadge } from "@modules/common/components/coming-soon"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderStatusChip from "@modules/common/components/order-status-chip"
import ProductArt from "@modules/products/components/product-art"
import type { OrderStage } from "types/viewmodels"
import { LuCheck, LuChevronLeft, LuTruck } from "react-icons/lu"

// The steps of a delivery, in order. Each stage maps to one step.
const STEPS: { label: string; stage: OrderStage }[] = [
  { label: "Đã đặt hàng", stage: "PENDING" },
  { label: "Đã thanh toán", stage: "CONFIRMED" },
  { label: "Đang chuẩn bị", stage: "PREPARING" },
  { label: "Đang giao", stage: "SHIPPING" },
  { label: "Đã giao", stage: "DELIVERED" },
]

/** Driver of the sample order (shared.js ORDER). Other orders have none. */
const SAMPLE_DRIVER = { name: "Nguyễn Văn Đức", plate: "59-X3 482.17" }

/**
 * Order tracking (08_Theo_Doi_Don_Hang). The timeline is static: it shows
 * the stage the order is in, not a live position (no map, phase 2). The
 * arrival time is a placeholder until live tracking exists.
 */
export default function OrderTrackingTemplate({ order }: { order: MockOrder }) {
  const currentIndex = STEPS.findIndex((s) => s.stage === order.stage)
  const cancelled = order.stage === "CANCELLED"
  const driver = order.code === DEMO_ORDER.code && order.stage === "SHIPPING" ? SAMPLE_DRIVER : null

  return (
    <div className="flex flex-col gap-6">
      <LocalizedClientLink
        href="/account/orders"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
      >
        <LuChevronLeft aria-hidden="true" />
        Đơn hàng của tôi
      </LocalizedClientLink>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-2">Mã đơn</p>
          <h1 className="font-mono text-xl font-bold text-ink small:text-2xl">{order.code}</h1>
        </div>
        <OrderStatusChip stage={order.stage} large />
      </div>

      {cancelled ? (
        <p className="rounded-btn border-[1.2px] border-l-8 border-sale bg-sale-bg px-4 py-3 text-sm text-sale-deep">
          Đơn này đã được hủy. Không có bước giao nào được thực hiện.
        </p>
      ) : (
        <div className="grid gap-5 small:grid-cols-[minmax(0,1fr)_280px]">
          <section aria-labelledby="tracking-steps" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 small:p-6">
            <h2 id="tracking-steps" className="font-display text-lg font-bold text-ink">
              Tiến trình đơn
            </h2>
            <ol className="flex flex-col">
              {STEPS.map((step, i) => {
                const done = i < currentIndex
                const current = i === currentIndex
                return (
                  <li key={step.stage} aria-current={current ? "step" : undefined} className="flex gap-4 pb-5 last:pb-0">
                    <span className="flex flex-col items-center">
                      <span
                        aria-hidden="true"
                        className={
                          done
                            ? "flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white"
                            : current
                              ? "flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-accent text-ink"
                              : "flex h-8 w-8 items-center justify-center rounded-full border-2 border-line-2 bg-surface text-ink-3"
                        }
                      >
                        {done ? <LuCheck size={16} /> : i + 1}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span aria-hidden="true" className={done ? "mt-1 h-full w-0.5 bg-brand" : "mt-1 h-full w-0.5 bg-line-2"} />
                      )}
                    </span>
                    <span className="flex flex-col pt-1">
                      <span className={current ? "font-semibold text-ink" : done ? "text-ink" : "text-ink-3"}>
                        {step.label}
                        {current && <span className="ml-2 text-xs font-semibold text-brand">Đang ở bước này</span>}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </section>

          <aside className="flex flex-col gap-4">
            <section aria-labelledby="tracking-eta" className="flex flex-col gap-3 rounded-card border border-dashed border-line-2 bg-surface p-5">
              <h2 id="tracking-eta" className="text-sm font-semibold text-ink">
                Dự kiến tới lúc
              </h2>
              <ComingSoonBadge className="self-start" />
              <p className="text-sm text-ink-2">Thời gian tới dự kiến sẽ hiện ở đây khi có theo dõi trực tiếp.</p>
            </section>

            {driver && (
              <section aria-labelledby="tracking-driver" className="flex items-center gap-3 rounded-card border border-line bg-surface p-5">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg text-brand">
                  <LuTruck />
                </span>
                <div className="flex min-w-0 flex-col">
                  <h2 id="tracking-driver" className="text-sm font-semibold text-ink">
                    Người giao: {driver.name}
                  </h2>
                  <p className="font-mono text-xs text-ink-2">Biển số {driver.plate}</p>
                </div>
              </section>
            )}
          </aside>
        </div>
      )}

      <section aria-labelledby="tracking-items" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 small:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="tracking-items" className="font-display text-lg font-bold text-ink">
            {order.itemCount} món · {order.date}
          </h2>
          <p className="text-sm text-ink-2">
            Thanh toán VNPAY · <span className="font-mono font-semibold text-ink">{formatVnd(order.total)}</span>
          </p>
        </div>
        <ul aria-label="Các món trong đơn" className="flex flex-wrap gap-2">
          {order.arts.map((art, i) => (
            <li key={`${art}-${i}`} className="flex h-14 w-14 overflow-hidden rounded-btn border border-line bg-page-2">
              <ProductArt product={{ title: art, art, tint: "cream" }} decorative dots={false} scale={0.8} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

import type { OrderView } from "@lib/util/order-view"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import CancelOrderButton from "@modules/account/components/order-actions/cancel-button"
import ReorderButton from "@modules/account/components/order-actions/reorder-button"
import OrderStatusChip from "@modules/common/components/order-status-chip"
import ProductArt from "@modules/products/components/product-art"

/**
 * "Đơn hàng của tôi" (07_Don_Hang_Cua_Toi). Each order is a card with its
 * status ticket and the action that fits its stage. The orders are the
 * customer's own (real mode) or the design's five samples (mock mode).
 */
export default function OrdersTemplate({ orders }: { orders: OrderView[] }) {
  return (
    <section aria-labelledby="orders-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 id="orders-title" className="font-display text-2xl font-bold text-ink small:text-[32px] small:leading-tight">
          Đơn hàng của tôi
        </h1>
        <p className="text-sm text-ink-2">{orders.length} đơn</p>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-card border border-dashed border-line-2 bg-surface p-6 text-sm text-ink-2">
          Bạn chưa có đơn hàng nào.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function OrderCard({ order }: { order: OrderView }) {
  const detailsHref = `/account/orders/details/${order.id}`

  return (
    <article
      aria-labelledby={`order-${order.id}`}
      className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 small:flex-row small:items-center small:gap-6 small:p-5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id={`order-${order.id}`} className="font-mono text-sm font-bold text-ink">
            {order.code}
          </h2>
          <OrderStatusChip stage={order.stage} />
        </div>
        <p className="text-sm text-ink-2">
          {order.date} · {order.itemCount} món ·{" "}
          <span className="font-mono font-semibold text-ink">{formatVnd(order.total)}</span>
        </p>
        {order.arts.length > 0 ? (
          <ul aria-label="Một số món trong đơn" className="flex items-center">
            {order.arts.slice(0, 4).map((art, i) => (
              <li key={`${art}-${i}`} className={i ? "-ml-2" : undefined}>
                <span className="flex h-10 w-10 overflow-hidden rounded-full border-2 border-surface bg-page-2">
                  <ProductArt product={{ title: art, art, tint: "cream" }} decorative dots={false} scale={0.8} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="truncate text-sm text-ink">{order.items.map((i) => i.title).join(", ")}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 small:justify-end">
        {order.stage === "SHIPPING" && (
          <Button variant="primary" size="md" href={detailsHref}>
            Theo dõi đơn
          </Button>
        )}
        {order.stage === "PENDING" && <CancelOrderButton orderId={order.id} />}
        {order.stage === "DELIVERED" && <ReorderButton orderId={order.id} />}
        <Button variant="secondary" size="md" href={detailsHref}>
          Chi tiết
        </Button>
      </div>
    </article>
  )
}

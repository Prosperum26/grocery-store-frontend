"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import { cx } from "@lib/util/cx"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import LiveStock from "@modules/common/components/live-stock"
import Stepper from "@modules/common/components/stepper"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"
import { LuCircleAlert, LuTrendingUp, LuTrash2 } from "react-icons/lu"
import type { CartLineView } from "@lib/mock/cart"

/**
 * One line of the cart (CartLine in the design). Sold-out lines keep their
 * place with a red note and a delete button; they do not count in the total.
 * A changed price shows the old price struck through. `liveQty` is the stock
 * kept current over Socket.io (net of other customers' holds), when known.
 */
export default function CartLine({ line, liveQty }: { line: CartLineView; liveQty?: number }) {
  const { setQuantity, remove, restore } = useCart()
  const { show } = useToast()
  const name = line.variantLabel ? `${line.title} (${line.variantLabel})` : line.title

  const onRemove = async () => {
    const removed = await remove(line.key)
    if (!removed) return
    show({
      tone: "ok",
      title: `Đã xóa ${line.title} khỏi giỏ`,
      action: { label: "Hoàn tác", onAction: () => restore(removed) },
    })
  }

  const note = !line.inStock ? (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-sale-deep">
      <LuCircleAlert aria-hidden="true" />
      Vừa hết hàng, không tính vào đơn
    </p>
  ) : line.previousPrice !== undefined ? (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-sale-deep">
      <LuTrendingUp aria-hidden="true" />
      Giá vừa đổi {formatVnd(line.previousPrice)} lên {formatVnd(line.unitPrice)}
    </p>
  ) : (liveQty ?? line.stockQty) <= line.lowStock ? (
    <LiveStock qty={liveQty ?? line.stockQty} lowStock={line.lowStock} unit={line.stockUnit} />
  ) : null

  return (
    <li
      className={cx(
        "flex gap-4 py-4",
        !line.inStock && "rounded-btn border border-sale-line bg-sale-bg p-3.5"
      )}
      data-testid="cart-line"
    >
      <LocalizedClientLink
        href={`/products/${line.handle}`}
        tabIndex={-1}
        aria-hidden="true"
        className={cx("relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px]", !line.inStock && "opacity-50")}
      >
        <ProductArt product={line} decorative dots={false} scale={0.7} fit="contain" sizes="80px" />
      </LocalizedClientLink>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <LocalizedClientLink
          href={`/products/${line.handle}`}
          className={cx("truncate text-base font-semibold hover:underline", line.inStock ? "text-ink" : "text-ink-2")}
        >
          {name}
        </LocalizedClientLink>
        {note}

        {line.inStock && (
          <div className="mt-1 flex items-center gap-3">
            <Stepper
              size="sm"
              value={line.quantity}
              min={1}
              max={line.stockQty}
              label={`Số lượng ${line.title}`}
              removeAtMin
              onRemove={onRemove}
              onChange={(next) => setQuantity(line.key, next)}
            />
            {line.quantity >= line.stockQty && (
              <span className="text-xs text-ink-2">Đã lấy hết số còn trong kho</span>
            )}
          </div>
        )}
        {!line.inStock && (
          <div className="mt-1">
            <Button variant="danger" size="sm" icon={<LuTrash2 />} onClick={onRemove}>
              Xóa khỏi giỏ
            </Button>
          </div>
        )}
      </div>

      {line.inStock && (
        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          {line.previousPrice !== undefined && (
            <span className="font-mono text-xs text-ink-3 line-through">
              <span className="sr-only">Giá cũ </span>
              {formatVnd(line.previousPrice * line.quantity)}
            </span>
          )}
          <span className={cx("font-mono text-base font-bold", line.previousPrice !== undefined ? "text-sale" : "text-ink")}>
            <span className="sr-only">Thành tiền </span>
            {formatVnd(line.lineTotal)}
          </span>
          {line.quantity > 1 && (
            <span className="font-mono text-xs text-ink-2">
              {formatVnd(line.unitPrice)} × {line.quantity}
            </span>
          )}
        </div>
      )}
    </li>
  )
}

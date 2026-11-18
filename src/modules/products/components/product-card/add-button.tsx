"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import Button from "@modules/common/components/button"
import Stepper from "@modules/common/components/stepper"
import { LuPlus } from "react-icons/lu"
import { useState } from "react"
import type { ProductVM } from "types/viewmodels"

/**
 * Buy control of a product card. It starts as a "+"; once the product is in
 * the cart it becomes "− 2 +", so the shopper changes the quantity where they
 * are instead of opening the cart. The number comes from the cart itself, so
 * every card of the same product (and the cart page) shows the same value.
 *
 * Products with several pack sizes open the product page so the shopper picks
 * one; out-of-stock products get a disabled button that still says why.
 */
export default function AddButton({
  product,
  inStock,
}: {
  product: ProductVM
  inStock: boolean
}) {
  const { handle, title } = product
  const { view, add, setQuantity, remove } = useCart()
  const { show } = useToast()
  // Adding and removing wait for the server before the control changes shape, so a second tap meanwhile
  // is ignored. Quantity taps are not: the cart shows the new number at once and saves the taps in order.
  const [busy, setBusy] = useState(false)

  if (!inStock) {
    return (
      <Button size="sm" variant="secondary" icon={<LuPlus />} aria-disabled aria-label={`${title} đã hết hàng`} />
    )
  }

  if (product.variants.length > 1) {
    return (
      <Button size="sm" href={`/products/${handle}`} icon={<LuPlus />} aria-label={`Chọn quy cách ${title}`} />
    )
  }

  // Single-pack product: its cart line, if any, is the one with this handle.
  const line = view.lines.find((l) => l.handle === handle)

  const failed = () => show({ tone: "err", title: "Chưa cập nhật được giỏ", description: "Bạn thử lại nhé." })

  const run = async (change: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true)
    try {
      await change()
    } catch {
      failed()
    } finally {
      setBusy(false)
    }
  }

  if (!line) {
    return (
      <Button
        size="sm"
        icon={<LuPlus />}
        aria-label={`Thêm ${title} vào giỏ`}
        aria-disabled={busy || undefined}
        onClick={() =>
          run(async () => {
            const result = await add(product)
            if (!result.ok) {
              show({ tone: "warn", title: `${title} đã đủ số lượng trong kho` })
            }
          })
        }
        data-testid="quick-add-button"
      />
    )
  }

  return (
    <Stepper
      size="sm"
      label={title}
      value={line.quantity}
      max={line.stockQty}
      removeAtMin
      onChange={(next) => void setQuantity(line.key, next).catch(failed)}
      onRemove={() => run(() => remove(line.key))}
      className={busy ? "opacity-60" : undefined}
    />
  )
}

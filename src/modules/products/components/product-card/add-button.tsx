"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import Button from "@modules/common/components/button"
import { LuCheck, LuPlus } from "react-icons/lu"
import { useState } from "react"
import type { ProductVM } from "types/viewmodels"

/**
 * The "+" of a product card. Products with several pack sizes open the
 * product page so the shopper picks one; out-of-stock products get a
 * disabled button that still says why. Otherwise it adds the default pack to
 * the cart and confirms with a toast.
 */
export default function AddButton({
  product,
  inStock,
}: {
  product: ProductVM
  inStock: boolean
}) {
  const { handle, title } = product
  const variantCount = product.variants.length
  const { add } = useCart()
  const { show } = useToast()
  const [added, setAdded] = useState(false)

  if (!inStock) {
    return (
      <Button size="sm" variant="secondary" icon={<LuPlus />} aria-disabled aria-label={`${title} đã hết hàng`} />
    )
  }

  if (variantCount > 1) {
    return (
      <Button size="sm" href={`/products/${handle}`} icon={<LuPlus />} aria-label={`Chọn quy cách ${title}`} />
    )
  }

  const onAdd = async () => {
    const result = await add(product)
    if (!result.ok) {
      show({ tone: "warn", title: `${title} đã đủ số lượng trong kho` })
      return
    }
    show({ tone: "ok", title: `Đã thêm ${title} vào giỏ` })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Button
      size="sm"
      icon={added ? <LuCheck /> : <LuPlus />}
      aria-label={`Thêm ${title} vào giỏ`}
      onClick={onAdd}
      data-testid="quick-add-button"
    />
  )
}

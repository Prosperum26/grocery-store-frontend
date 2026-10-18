"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { LuCheck, LuPlus } from "react-icons/lu"

import { addToCart } from "@lib/data/cart"
import { isMockMode } from "@lib/mock/mode"
import { useComingSoon } from "@modules/common/components/coming-soon"
import Button from "@modules/common/components/button"

/**
 * The "+" of a product card. Products with several pack sizes open the
 * product page so the shopper picks one; out-of-stock products get a
 * disabled button that still says why. In mock mode there is no cart yet
 * (the in-browser cart comes in FE-8), so the button opens the coming-soon
 * dialog instead of pretending the item was added.
 */
export default function AddButton({
  handle,
  title,
  variantId,
  variantCount,
  inStock,
}: {
  handle: string
  title: string
  variantId?: string
  variantCount: number
  inStock: boolean
}) {
  const { countryCode } = useParams() as { countryCode: string }
  const [state, setState] = useState<"idle" | "adding" | "added">("idle")
  const { open } = useComingSoon()

  if (!inStock) {
    return (
      <Button size="sm" variant="secondary" icon={<LuPlus />} aria-disabled aria-label={`${title} đã hết hàng`} />
    )
  }

  if (variantCount > 1 || !variantId) {
    return (
      <Button size="sm" href={`/products/${handle}`} icon={<LuPlus />} aria-label={`Chọn quy cách ${title}`} />
    )
  }

  const add = async () => {
    if (isMockMode()) {
      open("Giỏ hàng")
      return
    }
    setState("adding")
    try {
      await addToCart({ variantId, quantity: 1, countryCode })
      setState("added")
      setTimeout(() => setState("idle"), 1500)
    } catch {
      setState("idle")
    }
  }

  return (
    <>
      <Button
        size="sm"
        icon={state === "added" ? <LuCheck /> : <LuPlus />}
        aria-label={`Thêm ${title} vào giỏ`}
        aria-disabled={state === "adding"}
        onClick={add}
        data-testid="quick-add-button"
      />
      <span role="status" className="sr-only">
        {state === "added" ? `Đã thêm ${title} vào giỏ` : ""}
      </span>
    </>
  )
}

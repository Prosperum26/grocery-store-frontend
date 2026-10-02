"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import { useState } from "react"
import { MdAddShoppingCart } from "react-icons/md"

const buttonClass =
  "flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md disabled:opacity-60"

// Montra's round "add to cart" button. Products with a single variant are added
// directly; products with options open the product page to pick a variant.
export default function QuickAdd({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { countryCode } = useParams() as { countryCode: string }
  const [isAdding, setIsAdding] = useState(false)

  const variants = product.variants ?? []

  if (variants.length !== 1) {
    return (
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className={buttonClass}
        aria-label="Chọn loại sản phẩm"
      >
        <MdAddShoppingCart className="text-xl" />
      </LocalizedClientLink>
    )
  }

  const handleAdd = async () => {
    setIsAdding(true)
    try {
      await addToCart({ variantId: variants[0].id, quantity: 1, countryCode })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleAdd}
      disabled={isAdding}
      className={buttonClass}
      aria-label="Thêm vào giỏ"
      data-testid="quick-add-button"
    >
      <MdAddShoppingCart className="text-xl" />
    </motion.button>
  )
}

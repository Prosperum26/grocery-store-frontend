"use client"

import { useCart } from "@lib/context/cart-context"

import { CartButtonDesktop, CartButtonMobile } from "./index"

/** The header cart buttons, reading the live browser cart. */
export function LiveCartDesktop() {
  const { view } = useCart()
  return <CartButtonDesktop count={view.count} subtotal={view.subtotal} />
}

export function LiveCartMobile() {
  const { view } = useCart()
  return <CartButtonMobile count={view.count} />
}

export function useLiveCartCount(): number {
  return useCart().view.count
}

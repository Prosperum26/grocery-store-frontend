"use client"

import { useMockCart } from "@lib/context/mock-cart-context"

import { CartButtonDesktop, CartButtonMobile } from "./index"

/** The header cart buttons, reading the live browser cart. */
export function LiveCartDesktop() {
  const { view } = useMockCart()
  return <CartButtonDesktop count={view.count} subtotal={view.subtotal} />
}

export function LiveCartMobile() {
  const { view } = useMockCart()
  return <CartButtonMobile count={view.count} />
}

export function useLiveCartCount(): number {
  return useMockCart().view.count
}

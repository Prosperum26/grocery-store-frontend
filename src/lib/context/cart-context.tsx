"use client"

import type { CartSeedLine, CartView } from "@lib/mock/cart"
import { createContext, useContext } from "react"
import type { ProductVM } from "types/viewmodels"

/*
 * What the screens use to read and change the cart. Two providers implement
 * it: MockCartProvider (browser state, mock mode) and RealCartProvider (the
 * Medusa cart, through server actions). Every change is async because the
 * real cart saves on the server; the mock one just resolves at once.
 */

/** Result of adding a pack to the cart. */
export type AddResult =
  | {
      ok: true
      /** Key of the line that now holds the pack (for undo). */
      key: string
      /** Quantity the line had before this add; 0 when the line is new. */
      before: number
    }
  | { ok: false }

/**
 * "ok": the code works. "invalid": the code does not exist or is expired.
 * "not_eligible": the code exists but this cart does not qualify (e.g. below
 * the minimum), so nothing is discounted.
 */
export type VoucherResult = "ok" | "invalid" | "not_eligible"

export type CartApi = {
  view: CartView
  /** Adds one pack (or raises the quantity). `ok: false` when stock is full. */
  add: (
    product: ProductVM,
    opts?: { variant?: string; quantity?: number }
  ) => Promise<AddResult>
  setQuantity: (key: string, quantity: number) => Promise<void>
  /** Removes a line and returns it, so the caller can offer "Hoàn tác". */
  remove: (key: string) => Promise<CartSeedLine | null>
  /** Puts back a removed line. */
  restore: (line: CartSeedLine) => Promise<void>
  applyVoucher: (code: string) => Promise<VoucherResult>
  removeVoucher: () => Promise<void>
  /** Empties the cart, e.g. after an order is placed. */
  clear: () => Promise<void>
  /** Hides the "giá vừa đổi" notice for this session. */
  dismissPriceNotice: () => void
  priceNoticeDismissed: boolean
  /** True while a change is being saved on the server. */
  pending: boolean
}

export const CartContext = createContext<CartApi | null>(null)

export function useCart(): CartApi {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used inside a cart provider")
  }
  return ctx
}

import type { CartLineView, CartView } from "@lib/mock/cart"
import type { Tint } from "types/viewmodels"

/**
 * Turns a Medusa cart into what the cart page shows (the same CartView the
 * mock cart builds). Pure, so it can be tested without a backend.
 */

/** Fixed delivery fee, the same for every time slot (backend plan API-4). */
export const DELIVERY_FEE = 15000

const TINTS: Tint[] = ["red", "orange", "green", "cream", "blue", "yellow", "brown", "pink"]

/** The part of a Medusa cart line this file reads. */
export type RawCartLine = {
  id: string
  quantity: number
  unit_price: number
  variant_id?: string | null
  variant_title?: string | null
  product_title?: string | null
  product_handle?: string | null
  /** Written by the storefront when the line is added. */
  metadata?: { price_at_add?: unknown } | null
  /** Photo of the product (Medusa copies it onto the line). */
  thumbnail?: string | null
  product?: { metadata?: Record<string, any> | null; categories?: { handle?: string | null }[] | null } | null
}

/** The part of a Medusa cart this file reads. */
export type RawCart = {
  items?: RawCartLine[] | null
  discount_total?: number | null
  promotions?: { code?: string | null }[] | null
}

export const EMPTY_CART_VIEW: CartView = {
  lines: [],
  count: 0,
  subtotal: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  voucher: null,
  outOfStockCount: 0,
  priceChangedCount: 0,
}

/**
 * @param stock units in stock per variant id. Medusa does not put the stock
 *   on cart lines, so it is read from the products and passed in. A variant
 *   missing from the map counts as out of stock.
 */
export function buildCartViewFromMedusa(
  cart: RawCart | null | undefined,
  stock: Record<string, number>
): CartView {
  const lines: CartLineView[] = []

  for (const item of cart?.items ?? []) {
    const meta = item.product?.metadata ?? {}
    const stockQty = (item.variant_id && stock[item.variant_id]) || 0
    const inStock = stockQty > 0
    const paid =
      typeof item.metadata?.price_at_add === "number"
        ? item.metadata.price_at_add
        : undefined

    lines.push({
      key: item.id,
      handle: item.product_handle ?? "",
      title: item.product_title ?? "",
      art: typeof meta.art === "string" ? meta.art : undefined,
      thumbnail: item.thumbnail ?? undefined,
      categoryHandle: item.product?.categories?.[0]?.handle ?? undefined,
      tint: TINTS.includes(meta.tint) ? meta.tint : "green",
      variantLabel: item.variant_title ?? "",
      unitPrice: item.unit_price,
      previousPrice: paid !== undefined && paid !== item.unit_price ? paid : undefined,
      quantity: item.quantity,
      stockQty,
      stockUnit: typeof meta.stock_unit === "string" ? meta.stock_unit : "phần",
      lowStock: typeof meta.low_stock === "number" ? meta.low_stock : 10,
      inStock,
      lineTotal: inStock ? item.unit_price * item.quantity : 0,
      variantId: item.variant_id ?? undefined,
      pricePaid: paid,
    })
  }

  // Out-of-stock lines stay on screen but are not bought, so they are not
  // counted (same rule as the mock cart).
  const buyable = lines.filter((l) => l.inStock)
  const subtotal = buyable.reduce((sum, l) => sum + l.lineTotal, 0)
  const shipping = buyable.length ? DELIVERY_FEE : 0

  // Medusa keeps a code on the cart even when the cart does not qualify for
  // it (e.g. below the minimum): then discount_total is 0 and no code shows.
  const discount = Math.min(cart?.discount_total ?? 0, subtotal)
  const code = cart?.promotions?.[0]?.code ?? null

  return {
    lines,
    count: buyable.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    shipping,
    discount,
    total: Math.max(0, subtotal + shipping - discount),
    voucher: discount > 0 ? code : null,
    outOfStockCount: lines.length - buyable.length,
    priceChangedCount: buyable.filter((l) => l.previousPrice !== undefined).length,
  }
}

/**
 * The view as it will be once `key` has `quantity`, worked out on the screen
 * so a tap on "+" shows at once (the server answer replaces it). The discount
 * is kept but never exceeds the subtotal; the server decides if the code still
 * qualifies.
 */
export function withQuantity(view: CartView, key: string, quantity: number): CartView {
  const lines = view.lines.map((l) =>
    l.key === key
      ? { ...l, quantity, lineTotal: l.inStock ? l.unitPrice * quantity : 0 }
      : l
  )
  const buyable = lines.filter((l) => l.inStock)
  const subtotal = buyable.reduce((sum, l) => sum + l.lineTotal, 0)
  const shipping = buyable.length ? DELIVERY_FEE : 0
  const discount = Math.min(view.discount, subtotal)
  return {
    ...view,
    lines,
    count: buyable.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    shipping,
    discount,
    total: Math.max(0, subtotal + shipping - discount),
    voucher: discount > 0 ? view.voucher : null,
  }
}

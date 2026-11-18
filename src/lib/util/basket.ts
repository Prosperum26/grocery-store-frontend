import type { Tint } from "types/viewmodels"

/**
 * The "Có thể bạn cần mua lại" basket of the backend (API-3), as the home
 * page shows it. Pure, so it can be tested without a backend.
 */

/** One item as GET /store/predictive/reorder-basket returns it. */
export type RawBasketItem = {
  variant_id: string
  product_id: string
  handle: string
  title: string
  unit_label: string
  art: string | null
  tint: string | null
  thumbnail?: string | null
  quantity: number
  unit_price: number
  in_stock: boolean
}

export type RawBasket = {
  status: "ready" | "warming" | "empty"
  items: RawBasketItem[]
  total: number
  /** model: picked from the customer's own orders. popular: not enough history yet, best sellers instead. */
  source?: "model" | "popular"
}

export type BasketItemView = {
  variantId: string
  handle: string
  title: string
  /** "Hộp 10 quả · ×2" */
  quantityLabel: string
  art: string | undefined
  tint: Tint
  thumbnail: string | undefined
  /** Price of the whole line. */
  linePrice: number
  inStock: boolean
}

export type BasketView = {
  items: BasketItemView[]
  /** What the "Thêm tất cả" button adds: only items that are in stock. */
  total: number
  addableCount: number
  /** True when these are the shop's best sellers, not a reorder of the customer's own items. */
  popular: boolean
}

export const EMPTY_BASKET: BasketView = { items: [], total: 0, addableCount: 0, popular: false }

const TINTS: Tint[] = ["red", "orange", "green", "cream", "blue", "yellow", "brown", "pink"]

export function buildBasketView(raw: RawBasket | null | undefined): BasketView {
  if (!raw || raw.status !== "ready" || !raw.items?.length) {
    return EMPTY_BASKET
  }
  const items = raw.items.map((item) => ({
    variantId: item.variant_id,
    handle: item.handle,
    title: item.title,
    quantityLabel: item.unit_label + (item.quantity > 1 ? ` · ×${item.quantity}` : ""),
    art: item.art ?? undefined,
    thumbnail: item.thumbnail ?? undefined,
    tint: TINTS.includes(item.tint as Tint) ? (item.tint as Tint) : "green",
    linePrice: item.unit_price * item.quantity,
    inStock: item.in_stock,
  }))
  return {
    items,
    // The backend already sums only the items in stock.
    total: raw.total,
    addableCount: items.filter((i) => i.inStock).length,
    popular: raw.source === "popular",
  }
}

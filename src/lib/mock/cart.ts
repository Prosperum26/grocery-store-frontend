import { findMockProduct } from "./products"

// The cart of screen 04/05 (shared.js CART): 9 items over 7 lines.
// Shrimp is shown as "vừa hết hàng" and is not counted (CART_OOS in the design).
export const MOCK_CART_LINES = [
  { handle: "ca-loc-phi-le", quantity: 1 },
  { handle: "ca-chua-da-lat", quantity: 1 },
  { handle: "dua-tien-giang", quantity: 1 },
  { handle: "gia-do", quantity: 1 },
  { handle: "trung-ga-ta", quantity: 2 },
  { handle: "sua-tuoi-khong-duong", quantity: 2 },
  { handle: "thit-ba-roi-heo", quantity: 1 },
]

export const MOCK_CART_OUT_OF_STOCK = { handle: "tom-the-tuoi", quantity: 1 }

/** Pork was 89.000đ when it was added and is 92.000đ now (design screen 04). */
export const MOCK_PRICE_CHANGE = { handle: "thit-ba-roi-heo", before: 89000 }

export const MOCK_SHIPPING_FEE = 15000
export const MOCK_PROMO = { code: "TUOI20", amount: 20000 }

type Line = { handle: string; quantity: number }

function defaultPrice(handle: string): number {
  const variants = (findMockProduct(handle)?.variants ?? []) as any[]
  const v = variants.find((x) => x.metadata?.is_default) ?? variants[0]
  return v?.calculated_price?.calculated_amount ?? 0
}

export function mockCartTotals(lines: Line[]) {
  const subtotal = lines.reduce(
    (sum, l) => sum + defaultPrice(l.handle) * l.quantity,
    0
  )
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)
  const shipping = lines.length ? MOCK_SHIPPING_FEE : 0
  const discount = lines.length ? MOCK_PROMO.amount : 0
  return {
    itemCount,
    subtotal,
    shipping,
    discount,
    total: subtotal + shipping - discount,
  }
}

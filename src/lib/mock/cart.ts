import type { ProductVM, ProductVariantVM, Tint } from "../../types/viewmodels"

// Browser cart of the mock mode (issue #11). The data is the cart of screens
// 04/05 (shared.js CART). The cart lives in React state (mock-cart-context)
// and is kept in sessionStorage; this file has the seed and the arithmetic.

/** One line as the shopper put it in the cart. */
export type CartSeedLine = {
  handle: string
  quantity: number
  /** Pack size label; omitted means the product's default pack. */
  variant?: string
  /** Price when the line was added, for the "giá vừa đổi" notice. */
  pricePaid?: number
  /** Medusa variant id; only the real cart needs it (to put a line back). */
  variantId?: string
}

export const MOCK_CART_LINES = [
  { handle: "ca-loc-phi-le", quantity: 1 },
  { handle: "ca-chua-da-lat", quantity: 1 },
  { handle: "dua-tien-giang", quantity: 1 },
  { handle: "gia-do", quantity: 1 },
  { handle: "trung-ga-ta", quantity: 2 },
  { handle: "sua-tuoi-khong-duong", quantity: 2 },
  { handle: "thit-ba-roi-heo", quantity: 1 },
]

/** Shrimp is shown as "vừa hết hàng" and is not counted (CART_OOS in the design). */
export const MOCK_CART_OUT_OF_STOCK = { handle: "tom-the-tuoi", quantity: 1 }

/** Pork was 89.000đ when it was added and is 92.000đ now (design screen 04). */
export const MOCK_PRICE_CHANGE = { handle: "thit-ba-roi-heo", before: 89000 }

export const MOCK_SHIPPING_FEE = 15000

/** Voucher codes the cart accepts. Anything else is "Mã không hợp lệ". */
export const MOCK_VOUCHERS: Record<string, number> = { TUOI20: 20000 }

export const MOCK_CART_SEED: CartSeedLine[] = [
  ...MOCK_CART_LINES.map((l) =>
    l.handle === MOCK_PRICE_CHANGE.handle
      ? { ...l, pricePaid: MOCK_PRICE_CHANGE.before }
      : l
  ),
  MOCK_CART_OUT_OF_STOCK,
]

export const MOCK_VOUCHER_SEED = "TUOI20"

export type CartLineView = {
  key: string
  handle: string
  title: string
  art?: string
  /** Real cart: the product photo and category (stand-in illustration when there is no photo). */
  thumbnail?: string
  categoryHandle?: string
  tint: Tint
  variantLabel: string
  unitPrice: number
  /** Set when the price changed since the line was added. */
  previousPrice?: number
  quantity: number
  stockQty: number
  stockUnit: string
  lowStock: number
  inStock: boolean
  lineTotal: number
  /** Medusa variant id (real cart only), used to put a removed line back. */
  variantId?: string
  /** Price when the line was added (real cart only). */
  pricePaid?: number
}

export type CartView = {
  lines: CartLineView[]
  /** Items that can be bought (out-of-stock lines are not counted). */
  count: number
  subtotal: number
  shipping: number
  discount: number
  total: number
  voucher: string | null
  outOfStockCount: number
  /** Only the purchasable lines with a changed price. */
  priceChangedCount: number
}

export function lineKey(handle: string, variant?: string): string {
  return `${handle}::${variant ?? ""}`
}

/** The pack the shopper gets when none is named: the product's default pack. */
export function resolveVariant(
  product: ProductVM,
  label?: string
): ProductVariantVM | undefined {
  return (
    product.variants.find((v) => v.label === label) ??
    product.variants.find((v) => v.label === product.unitLabel) ??
    product.variants[0]
  )
}

/** The most a shopper can put in the cart: what the pack has in stock. */
export function maxQuantity(product: ProductVM, label?: string): number {
  return resolveVariant(product, label)?.stockQty ?? 0
}

/**
 * Turns the seed lines into what the cart page shows. Lines whose product is
 * gone are dropped. Out-of-stock lines stay on screen but do not count in
 * the subtotal or the item count.
 */
export function buildCartView(
  seed: CartSeedLine[],
  catalog: ProductVM[],
  voucher: string | null
): CartView {
  const lines: CartLineView[] = []

  for (const line of seed) {
    const product = catalog.find((p) => p.handle === line.handle)
    const variant = product && resolveVariant(product, line.variant)
    if (!product || !variant) continue

    const inStock = variant.stockQty > 0
    lines.push({
      key: lineKey(line.handle, line.variant),
      handle: product.handle,
      title: product.title,
      art: product.art,
      tint: product.tint,
      variantLabel: variant.label,
      unitPrice: variant.price,
      previousPrice:
        line.pricePaid !== undefined && line.pricePaid !== variant.price
          ? line.pricePaid
          : undefined,
      quantity: line.quantity,
      stockQty: variant.stockQty,
      stockUnit: product.stockUnit,
      lowStock: product.lowStock,
      inStock,
      lineTotal: inStock ? variant.price * line.quantity : 0,
    })
  }

  const buyable = lines.filter((l) => l.inStock)
  const subtotal = buyable.reduce((sum, l) => sum + l.lineTotal, 0)
  const shipping = buyable.length ? MOCK_SHIPPING_FEE : 0
  const discount =
    subtotal > 0 && voucher && MOCK_VOUCHERS[voucher] ? MOCK_VOUCHERS[voucher] : 0

  return {
    lines,
    count: buyable.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    shipping,
    discount,
    total: Math.max(0, subtotal + shipping - discount),
    voucher: discount ? voucher : null,
    outOfStockCount: lines.length - buyable.length,
    priceChangedCount: buyable.filter((l) => l.previousPrice !== undefined).length,
  }
}

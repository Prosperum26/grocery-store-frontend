import type { ProductVM } from "types/viewmodels"

import { formatVnd, pricePerKg, salePercent } from "./price"

/**
 * What a product card prints besides name and price. Pure, so the rules
 * (when to show "Còn 3", when a per-kg price helps) are tested without React.
 */

export type CardBadge =
  | { kind: "sale"; percent: number }
  | { kind: "low"; left: number }
  | { kind: "out" }

/** At most this many packs left counts as "sắp hết" when the product gives no threshold of its own. */
const DEFAULT_LOW_STOCK = 5

/**
 * Badges on the image, most urgent first. Out of stock hides the others: a
 * discount on something that cannot be bought only frustrates.
 */
export function cardBadges(product: Pick<ProductVM, "price" | "originalPrice" | "stockQty" | "lowStock">): CardBadge[] {
  if (product.stockQty <= 0) {
    return [{ kind: "out" }]
  }
  const badges: CardBadge[] = []
  const percent = salePercent(product.originalPrice, product.price)
  if (percent) {
    badges.push({ kind: "sale", percent })
  }
  if (product.stockQty <= (product.lowStock || DEFAULT_LOW_STOCK)) {
    badges.push({ kind: "low", left: product.stockQty })
  }
  return badges
}

/**
 * "22.000đ/kg" for packs sold by weight, so packs of different sizes can be
 * compared. Rounded to the nearest 100đ: it is a comparison aid, not a price.
 * Null when the weight is unknown, when the pack is exactly 1 kg (the price
 * already is the per-kg price), or when the pack is sold by volume ("110ml",
 * "1 lít"): the catalog stores a weight for those too, but "/kg" would be wrong.
 */
export function perKgLabel(product: Pick<ProductVM, "price" | "variants" | "unitLabel">): string | null {
  const weight = product.variants[0]?.weightGrams
  if (!weight || weight === 1000 || /\d\s*(ml|l|lít)\b/i.test(product.unitLabel)) {
    return null
  }
  const perKg = pricePerKg(product.price, weight)
  return perKg ? `${formatVnd(Math.round(perKg / 100) * 100)}/kg` : null
}

/** Whole-percent discount, or null when the product is not on sale. */
export function salePercent(
  original: number | null | undefined,
  current: number
): number | null {
  if (!original || original <= current) {
    return null
  }
  return Math.round((1 - current / original) * 100)
}

/** Price per kilogram for packs sold by weight, e.g. "170.000đ/kg". */
export function pricePerKg(
  price: number,
  weightGrams: number | null | undefined
): number | null {
  if (!weightGrams) {
    return null
  }
  return Math.round((price / weightGrams) * 1000)
}

/**
 * VND the way the design writes it: "395.000đ". VND has no minor unit and
 * Medusa stores it as-is, so the amount is never divided by 100.
 */
export function formatVnd(amount: number): string {
  const sign = amount < 0 ? "−" : ""
  const digits = String(Math.abs(Math.round(amount)))
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ"
}

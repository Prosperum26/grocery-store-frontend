export type StockState = "low" | "out"

/**
 * What the stock badge says. The design only shows stock when it matters:
 * "Còn 3 khay" at or below the product's low-stock threshold, "Hết hàng" at 0,
 * nothing otherwise.
 */
export function stockLabel(
  qty: number,
  lowStock: number,
  unit: string
): { state: StockState; text: string } | null {
  if (qty <= 0) {
    return { state: "out", text: "Hết hàng" }
  }
  if (qty <= lowStock) {
    return { state: "low", text: `Còn ${qty} ${unit}` }
  }
  return null
}

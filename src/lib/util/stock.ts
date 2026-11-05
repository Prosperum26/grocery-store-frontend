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

/** One variant from `GET /store/stock` (backend API-15). */
export type RawLiveStock = {
  variant_id: string
  inventory_item_id: string | null
  available: number | null
  held_by_cart?: number
}

/**
 * Stock of a variant net of other customers' holds. `heldByCart` is what this
 * cart holds itself: the live updates (API-16) carry the shared number, so it
 * is added back to them.
 */
export type LiveStock = { available: number; inventoryItemId: string; heldByCart: number }

/** API-15 rows → by variant. Variants without managed stock (null) are left out: nothing to show. */
export function toLiveStock(rows: RawLiveStock[]): Record<string, LiveStock> {
  const result: Record<string, LiveStock> = {}
  for (const row of rows) {
    if (row.available === null || !row.inventory_item_id) continue
    result[row.variant_id] = {
      available: Math.max(0, row.available),
      inventoryItemId: row.inventory_item_id,
      heldByCart: Math.max(0, row.held_by_cart ?? 0),
    }
  }
  return result
}

/** Medusa's own numbers, overridden by the held-aware ones where the backend gave them. */
export function mergeStock(fallback: Record<string, number>, live: Record<string, LiveStock>): Record<string, number> {
  const result = { ...fallback }
  for (const [variantId, entry] of Object.entries(live)) {
    result[variantId] = entry.available
  }
  return result
}

/** `stock:update` from the realtime gateway (backend API-16): the shared number of one inventory item. */
export type StockUpdate = { inventory_item_id: string; available: number }

/**
 * Applies a live update to the numbers on screen. The update is the same for
 * every customer, so this cart's own hold is added back. Returns the same
 * object when no variant on screen uses that item (React skips the render).
 */
export function applyStockUpdate(state: Record<string, LiveStock>, update: StockUpdate): Record<string, LiveStock> {
  let next: Record<string, LiveStock> | null = null
  for (const [variantId, entry] of Object.entries(state)) {
    if (entry.inventoryItemId !== update.inventory_item_id) continue
    next ??= { ...state }
    next[variantId] = { ...entry, available: Math.max(0, update.available + entry.heldByCart) }
  }
  return next ?? state
}

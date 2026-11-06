"use server"

import { sdk } from "@lib/config"
import { isMockMode } from "@lib/mock/mode"
import { toLiveStock, type LiveStock, type RawLiveStock } from "@lib/util/stock"
import { getCartId } from "./cookies"

/*
 * Stock net of other customers' holds (backend API-15). Medusa's own
 * `inventory_quantity` does not subtract units held in Redis before payment,
 * so it can say "Còn 1" while that unit is held by someone else.
 */

/** API-15 for these variants, relative to `cartId` when given. Empty on any error: callers keep Medusa's numbers. */
export async function fetchLiveStock(variantIds: string[], cartId?: string): Promise<Record<string, LiveStock>> {
  const ids = Array.from(new Set(variantIds)).slice(0, 100)
  if (isMockMode() || !ids.length) {
    return {}
  }
  try {
    const { stock } = await sdk.client.fetch<{ stock: RawLiveStock[] }>("/store/stock", {
      method: "GET",
      query: { variant_ids: ids.join(","), ...(cartId ? { cart_id: cartId } : {}) },
      cache: "no-store",
    })
    return toLiveStock(stock)
  } catch {
    return {}
  }
}

/** For the browser (live badges): the same numbers, relative to the customer's cart. */
export async function readLiveStock(variantIds: string[]): Promise<Record<string, LiveStock>> {
  return fetchLiveStock(variantIds, await getCartId())
}

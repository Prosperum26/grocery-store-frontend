"use server"

import { sdk } from "@lib/config"
import { buildBasketView, type BasketView, type RawBasket } from "@lib/util/basket"
import { getAuthHeaders } from "./cookies"
import { addLine } from "./shopping-cart"

/*
 * "Có thể bạn cần mua lại" (backend API-3): the basket the backend picks
 * for the signed-in customer. A visitor who is not signed in gets nothing.
 */

async function readBasket(): Promise<RawBasket | null> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return null
  }
  return sdk.client
    .fetch<RawBasket>("/store/predictive/reorder-basket", {
      method: "GET",
      headers: { ...authHeaders },
      cache: "no-store",
    })
    .catch(() => null)
}

export async function getReorderBasket(): Promise<BasketView> {
  return buildBasketView(await readBasket())
}

/**
 * "Thêm tất cả": reads the basket again (the screen may be old) and puts
 * every item that is in stock in the cart.
 */
export async function addReorderBasket(countryCode: string): Promise<{ added: number; skipped: number }> {
  const raw = await readBasket()
  let added = 0
  let skipped = 0
  // One after another: each call reads and changes the same cart.
  for (const item of raw?.status === "ready" ? raw.items : []) {
    if (!item.in_stock) {
      skipped += 1
      continue
    }
    const { result } = await addLine({ countryCode, variantId: item.variant_id, quantity: item.quantity })
    if (result.ok) added += 1
    else skipped += 1
  }
  return { added, skipped }
}

/**
 * Tells the backend a customer has just signed in, so it can prepare their
 * basket ahead of the home page (API-3b). Fire and forget: a failure only
 * means the basket is made when it is asked for.
 */
export async function warmReorderBasket(): Promise<void> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return
  }
  await sdk.client
    .fetch("/store/predictive/warm", { method: "POST", headers: { ...authHeaders } })
    .catch(() => undefined)
}

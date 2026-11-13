"use server"

import { sdk } from "@lib/config"
import { isMockMode } from "@lib/mock/mode"
import type { RawSuggestResponse } from "@lib/util/suggest"
import { retrieveCart } from "./cart"
import { getAuthHeaders } from "./cookies"
import type { KitchenResult } from "./kitchen"
import { listProducts } from "./products"

/*
 * Gợi ý món (backend POST /store/ai/suggest/by-products). The storefront only talks to the Medusa backend, which asks
 * the AI service. Every call returns a result the block can show without try/catch: when the AI service is down, the
 * request fails or there is nothing to suggest, the block draws nothing (no fallback text).
 */

const NOTHING: KitchenResult<RawSuggestResponse> = { ok: true, data: { status: "empty", suggestions: [] } }
const MAX_SKUS = 30 // the backend takes at most this many

async function suggest(body: object): Promise<KitchenResult<RawSuggestResponse>> {
  try {
    const data = await sdk.client.fetch<RawSuggestResponse>("/store/ai/suggest/by-products", { method: "POST", body, cache: "no-store" })
    return { ok: true, data }
  } catch (error) {
    const status = (error as { status?: number })?.status
    return { ok: false, reason: status === 503 ? "unavailable" : "error" }
  }
}

const unique = (skus: (string | null | undefined)[]) => Array.from(new Set(skus.filter((s): s is string => !!s))).slice(0, MAX_SKUS)

/**
 * B: recipes that use what is in the cart now. The SKU of each cart line is read from the server cart, not sent by the
 * browser, so the block always matches what the customer would check out. An empty cart has nothing to suggest.
 */
export async function getRecipesForCart(excludeIds: string[] = []): Promise<KitchenResult<RawSuggestResponse>> {
  if (isMockMode()) return NOTHING
  // Same reader as the cart page (cached per cart, refreshed when the cart changes).
  const cart = await retrieveCart(undefined, "id,*items,*items.variant")
  const skus = unique((cart?.items ?? []).map((item) => item.variant?.sku))
  if (skus.length === 0) return NOTHING
  return suggest({ catalog_ids: skus, mode: "cart", limit: 3, exclude_ids: excludeIds })
}

/** C: up to 3 recipes that use this product (any of its variants). The product page is static, so this runs in the browser. */
export async function getRecipesForProduct(countryCode: string, handle: string): Promise<KitchenResult<RawSuggestResponse>> {
  if (isMockMode()) return NOTHING
  const product = await listProducts({ countryCode, queryParams: { handle, fields: "id,*variants" } })
    .then(({ response }) => response.products[0])
    .catch(() => null)

  const skus = unique((product?.variants ?? []).map((v) => v.sku))
  if (skus.length === 0) return NOTHING
  return suggest({ catalog_ids: skus, mode: "product", limit: 3 })
}

/**
 * A: one dish the customer may want to try. Signed in, the backend knows what they bought before (from the session,
 * not from here); signed out, it picks among the best-checked dishes. `excludeIds` are the dishes already shown
 * ("Đổi món khác"). The cart's products are sent as `have`, so a dish the cart already covers is not offered.
 */
export async function getRecipeToTry(excludeIds: string[] = []): Promise<KitchenResult<RawSuggestResponse>> {
  if (isMockMode()) return NOTHING
  const cart = await retrieveCart(undefined, "id,*items,*items.variant")
  try {
    const data = await sdk.client.fetch<RawSuggestResponse>("/store/ai/suggest/discover", {
      method: "POST",
      body: { exclude_ids: excludeIds, have: unique((cart?.items ?? []).map((item) => item.variant?.sku)) },
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    })
    return { ok: true, data }
  } catch (error) {
    const status = (error as { status?: number })?.status
    return { ok: false, reason: status === 503 ? "unavailable" : "error" }
  }
}

"use server"

import { sdk } from "@lib/config"
import type { AddResult, VoucherResult } from "@lib/context/cart-context"
import type { CartView } from "@lib/mock/cart"
import {
  buildCartViewFromMedusa,
  EMPTY_CART_VIEW,
  type RawCart,
} from "@lib/util/cart-view"
import { mergeStock } from "@lib/util/stock"
import { revalidateTag } from "next/cache"
import { getOrSetCart } from "./cart"
import { fetchLiveStock } from "./stock"
import {
  getAuthHeaders,
  getCacheTag,
  getCartId,
  removeCartId,
} from "./cookies"

/*
 * The browser cart of the real storefront: what the cart page, the header
 * badge and the "add" buttons call. Each action changes the Medusa cart and
 * returns the new CartView, so the screen updates from one round trip.
 * The cart id lives in the _medusa_cart_id cookie (see cookies.ts).
 */

// *items.product brings the product metadata (art, tint, stock unit...).
const CART_FIELDS =
  "id,region_id,discount_total,*items,*items.product,*promotions"

type CartWithRegion = RawCart & {
  id: string
  region_id: string
  items?: (NonNullable<RawCart["items"]>[number] & { id: string })[] | null
}

/** The cart, or null when it no longer exists (e.g. the database was reset). */
async function readCart(cartId: string): Promise<CartWithRegion | null> {
  return sdk.client
    .fetch<{ cart: CartWithRegion }>(`/store/carts/${cartId}`, {
      method: "GET",
      query: { fields: CART_FIELDS },
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

/**
 * Units in stock per variant. Medusa does not put stock on cart lines, so
 * it is read from the products of the cart (one request, any number of lines),
 * then replaced by the numbers net of other customers' holds (API-15) where
 * the backend gives them. This cart's own hold is added back, so its lines do
 * not show "Hết hàng" when the customer returns from VNPAY.
 */
async function readStock(cart: CartWithRegion): Promise<Record<string, number>> {
  const productIds = Array.from(
    new Set(
      (cart.items ?? [])
        .map((item) => (item as { product_id?: string }).product_id)
        .filter((id): id is string => !!id)
    )
  )
  if (!productIds.length) {
    return {}
  }

  const { products } = await sdk.client.fetch<{
    products: { variants?: { id: string; inventory_quantity?: number }[] }[]
  }>("/store/products", {
    method: "GET",
    query: {
      id: productIds,
      limit: productIds.length,
      region_id: cart.region_id,
      fields: "id,variants.id,+variants.inventory_quantity",
    },
    headers: { ...(await getAuthHeaders()) },
    cache: "no-store",
  })

  const stock: Record<string, number> = {}
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      stock[variant.id] = variant.inventory_quantity ?? 0
    }
  }
  const variantIds = (cart.items ?? []).map((item) => (item as { variant_id?: string | null }).variant_id).filter((id): id is string => !!id)
  return mergeStock(stock, await fetchLiveStock(variantIds, cart.id))
}

async function viewOf(cartId: string | undefined): Promise<CartView> {
  if (!cartId) {
    return EMPTY_CART_VIEW
  }
  const cart = await readCart(cartId)
  if (!cart) {
    return EMPTY_CART_VIEW
  }
  return buildCartViewFromMedusa(cart, await readStock(cart))
}

/** Other pages that read the cart through the Starter functions refetch it. */
async function bustCaches() {
  revalidateTag(await getCacheTag("carts"))
  revalidateTag(await getCacheTag("fulfillment"))
}

/** Medusa refuses a quantity above the stock with 400 insufficient_inventory. */
function isStockError(error: unknown) {
  const e = error as { status?: number; message?: string }
  return e?.status === 400 && /inventory/i.test(e.message ?? "")
}

/** The cart of this browser. No cart is created just by looking. */
export async function getCartView(): Promise<CartView> {
  return viewOf(await getCartId())
}

/**
 * Adds a pack. A pack already in the cart gets its quantity raised on the
 * existing line, so that line keeps the price it was first added at: a new
 * line would have a different `price_at_add` and Medusa would not merge them.
 */
export async function addLine({
  countryCode,
  variantId,
  quantity,
  priceAtAdd,
}: {
  countryCode: string
  variantId: string
  quantity: number
  /** Price now, kept on the line for the "giá vừa đổi" notice. */
  priceAtAdd?: number
}): Promise<{ result: AddResult; view: CartView }> {
  const cart = await getOrSetCart(countryCode)
  const headers = { ...(await getAuthHeaders()) }
  const existing = (await readCart(cart.id))?.items?.find(
    (item) => item.variant_id === variantId
  )

  try {
    let key: string
    if (existing) {
      await sdk.store.cart.updateLineItem(
        cart.id,
        existing.id,
        { quantity: existing.quantity + quantity },
        {},
        headers
      )
      key = existing.id
    } else {
      const { cart: updated } = await sdk.store.cart.createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
          metadata: priceAtAdd === undefined ? undefined : { price_at_add: priceAtAdd },
        },
        {},
        headers
      )
      key = updated.items?.find((item) => item.variant_id === variantId)?.id ?? ""
    }
    await bustCaches()
    return {
      result: { ok: true, key, before: existing?.quantity ?? 0 },
      view: await viewOf(cart.id),
    }
  } catch (error) {
    if (isStockError(error)) {
      return { result: { ok: false }, view: await viewOf(cart.id) }
    }
    throw error
  }
}

/** Sets the quantity of a line. `ok: false` when the stock is not enough. */
export async function setLineQuantity({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}): Promise<{ ok: boolean; view: CartView }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { ok: false, view: EMPTY_CART_VIEW }
  }

  try {
    await sdk.store.cart.updateLineItem(
      cartId,
      lineId,
      { quantity: Math.max(1, Math.floor(quantity)) },
      {},
      { ...(await getAuthHeaders()) }
    )
    await bustCaches()
    return { ok: true, view: await viewOf(cartId) }
  } catch (error) {
    if (isStockError(error)) {
      return { ok: false, view: await viewOf(cartId) }
    }
    throw error
  }
}

export async function removeLine(lineId: string): Promise<CartView> {
  const cartId = await getCartId()
  if (!cartId) {
    return EMPTY_CART_VIEW
  }

  await sdk.store.cart.deleteLineItem(cartId, lineId, {}, {
    ...(await getAuthHeaders()),
  })
  await bustCaches()
  return viewOf(cartId)
}

/**
 * Applies a code and reads the cart again. Medusa answers 200 for a code
 * that exists but whose conditions the cart does not meet (the discount
 * stays 0), so the result is decided by the discount, not by the status.
 * Only an unknown code is a 400.
 */
export async function applyVoucherCode(
  code: string
): Promise<{ result: VoucherResult; view: CartView }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { result: "not_eligible", view: EMPTY_CART_VIEW }
  }

  try {
    await sdk.store.cart.update(
      cartId,
      { promo_codes: [code.trim().toUpperCase()] },
      {},
      { ...(await getAuthHeaders()) }
    )
  } catch (error) {
    if ((error as { status?: number })?.status === 400) {
      return { result: "invalid", view: await viewOf(cartId) }
    }
    throw error
  }

  await bustCaches()
  const view = await viewOf(cartId)
  return { result: view.voucher ? "ok" : "not_eligible", view }
}

export async function removeVoucherCode(): Promise<CartView> {
  const cartId = await getCartId()
  if (!cartId) {
    return EMPTY_CART_VIEW
  }

  await sdk.store.cart.update(cartId, { promo_codes: [] }, {}, {
    ...(await getAuthHeaders()),
  })
  await bustCaches()
  return viewOf(cartId)
}

/**
 * Forgets the cart of this browser (the next add starts a new one). Used
 * once an order is placed; the old cart stays in Medusa.
 */
export async function forgetCart(): Promise<CartView> {
  await removeCartId()
  await bustCaches()
  return EMPTY_CART_VIEW
}

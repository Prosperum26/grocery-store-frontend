"use server"

import { sdk } from "@lib/config"
import { buildOrderView, type OrderView, type RawMyOrder } from "@lib/util/order-view"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag } from "./cookies"
import { addLine } from "./shopping-cart"

/*
 * The signed-in customer's orders (real mode). The list route of the store
 * API only returns the customer's own orders, so asking it for one `id`
 * also checks the order belongs to them; `GET /store/orders/:id` would not.
 */

const ORDER_FIELDS =
  "id,display_id,created_at,total,subtotal,shipping_total,discount_total,+metadata,*items,*shipping_address"

async function fetchOrders(query: Record<string, unknown>): Promise<RawMyOrder[]> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return []
  }
  const { orders } = await sdk.client.fetch<{ orders: RawMyOrder[] }>("/store/orders", {
    method: "GET",
    query: { fields: ORDER_FIELDS, order: "-created_at", ...query },
    headers: { ...authHeaders },
    cache: "no-store",
  })
  return orders
}

export async function listMyOrders(): Promise<OrderView[]> {
  const orders = await fetchOrders({ limit: 50 }).catch(() => [])
  return orders.map(buildOrderView)
}

/** One order of this customer, or null when it is not theirs or does not exist. */
export async function getMyOrder(orderId: string): Promise<OrderView | null> {
  const [order] = await fetchOrders({ id: orderId, limit: 1 }).catch(() => [])
  return order ? buildOrderView(order) : null
}

/**
 * "Mua lại": puts the items of one of the customer's orders in the cart, at
 * today's price. A pack that is sold out (or short of stock) is skipped.
 */
export async function reorderOrder(
  orderId: string,
  countryCode: string
): Promise<{ added: number; skipped: number }> {
  const order = await getMyOrder(orderId)
  let added = 0
  let skipped = 0
  // One after another: each call reads and changes the same cart.
  for (const item of order?.items ?? []) {
    if (!item.variantId) {
      skipped += 1
      continue
    }
    const { result } = await addLine({ countryCode, variantId: item.variantId, quantity: item.quantity })
    if (result.ok) added += 1
    else skipped += 1
  }
  return { added, skipped }
}

export type CancelResult =
  | { ok: true }
  | { ok: false; reason: "not_cancellable" | "refund_failed" | "failed" }

/** Customer cancels their own order (backend API-6). */
export async function cancelMyOrder(orderId: string): Promise<CancelResult> {
  try {
    await sdk.client.fetch(`/store/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { ...(await getAuthHeaders()) },
    })
    revalidateTag(await getCacheTag("orders"))
    return { ok: true }
  } catch (error) {
    const status = (error as { status?: number })?.status
    if (status === 409) return { ok: false, reason: "not_cancellable" }
    if (status === 502) return { ok: false, reason: "refund_failed" }
    console.error("cancelMyOrder failed", error)
    return { ok: false, reason: "failed" }
  }
}

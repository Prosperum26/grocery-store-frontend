"use server"

import { backendUrl, sdk } from "@lib/config"
import {
  refundNotice,
  reserveOutcome,
  soldOutMessage,
  splitName,
  toSlotOptions,
  type RawStockFailed,
  type RawSlot,
  type RefundNotice,
  type Shortage,
  type SlotOption,
} from "@lib/util/checkout"
import { buildOrderReceipt, type OrderReceipt, type RawOrder } from "@lib/util/order-receipt"
import { revalidateTag } from "next/cache"
import { getCartView } from "./shopping-cart"
import { getAuthHeaders, getCacheTag, getCartId, getPayStartedAt, removeCartId, setPayStartedAt } from "./cookies"

/*
 * Server side of the real checkout (mock mode never calls these):
 *   1. startPayment    address + slot + note + shipping + stock hold + VNPAY session → payment URL
 *   2. verifyReturn    the customer comes back from VNPAY: is the result genuine?
 *   3. findPaidOrder   VNPAY's IPN completes the cart on the backend; wait for the order
 *   4. getOrderReceipt the confirmation page
 */

/** Payment provider of the region (backend plan BE-5a). */
const VNPAY_PROVIDER = "pp_vnpay_vnpay"

export type CheckoutInput = {
  email: string
  name: string
  phone: string
  line: string
  /** "Phường, quận, tỉnh/thành" typed as one text. */
  ward: string
  slotId: string
  note: string
}

export type StartPaymentResult =
  | { ok: true; paymentUrl: string }
  | { ok: false; reason: "empty_cart" | "out_of_stock" | "slot_unavailable" | "failed"; message: string; items?: Shortage[] }

/**
 * Holds the whole cart for 15 minutes (backend API-14). Plain fetch, not the
 * SDK: the SDK keeps only the message of an error, and a 409 here carries the
 * short lines in its body.
 */
async function reserveStock(cartId: string, headers: Record<string, string>) {
  const response = await fetch(`${backendUrl}/store/carts/${cartId}/reserve`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
      ...headers,
    },
    body: "{}",
    cache: "no-store",
  })
  return { status: response.status, body: await response.json().catch(() => ({})) }
}

const status = (error: unknown) => (error as { status?: number })?.status

/** Open time slots (backend API-4), already labelled for the page. */
export async function listDeliverySlots(): Promise<SlotOption[]> {
  const { slots } = await sdk.client.fetch<{ slots: RawSlot[] }>("/store/delivery-slots", {
    method: "GET",
    cache: "no-store",
  })
  return toSlotOptions(slots, Date.now())
}

/**
 * Writes everything the order needs on the Medusa cart, opens a VNPAY
 * payment session and returns the address of the VNPAY page. Calling it
 * again (the customer came back and changed something) is safe: every step
 * overwrites the previous one.
 */
export async function startPayment(input: CheckoutInput): Promise<StartPaymentResult> {
  const cartId = await getCartId()
  if (!cartId) {
    return { ok: false, reason: "empty_cart", message: "Giỏ hàng đang trống." }
  }

  // The same rule as the cart page: a sold-out line must be removed first.
  const view = await getCartView()
  if (view.lines.length === 0) {
    return { ok: false, reason: "empty_cart", message: "Giỏ hàng đang trống." }
  }
  if (view.outOfStockCount > 0) {
    return { ok: false, reason: "out_of_stock", message: soldOutMessage(view.lines.filter((line) => !line.inStock).map((line) => line.title)) }
  }

  const headers = { ...(await getAuthHeaders()) }
  const address = {
    ...splitName(input.name),
    phone: input.phone.replace(/\s/g, ""),
    address_1: input.line.trim(),
    city: input.ward.trim(),
    country_code: "vn",
  }

  try {
    // Email, addresses and the note for the courier.
    await sdk.store.cart.update(
      cartId,
      {
        email: input.email.trim(),
        shipping_address: address,
        billing_address: address,
        metadata: { delivery_note: input.note.trim() },
      },
      {},
      headers
    )

    // The delivery slot (backend API-4). 409 = it has just closed.
    await sdk.client.fetch(`/store/carts/${cartId}/delivery-slot`, {
      method: "POST",
      body: { slot_id: input.slotId },
      headers,
    })

    // The slot is not a shipping option: there is one option, "Giao tận nhà".
    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cartId }, headers)
    const option = shipping_options?.[0]
    if (!option) {
      return { ok: false, reason: "failed", message: "Chưa có hình thức giao hàng cho giỏ này." }
    }
    await sdk.store.cart.addShippingMethod(cartId, { option_id: option.id }, {}, headers)

    // Hold the stock before VNPAY: if someone else holds the last units, the
    // customer is told now instead of after paying. Safe to call again.
    const reserved = await reserveStock(cartId, headers)
    const hold = reserveOutcome(reserved.status, reserved.body, (variantId) => view.lines.find((line) => line.variantId === variantId)?.title)
    if (!hold.ok) {
      return hold.reason === "out_of_stock"
        ? { ok: false, reason: "out_of_stock", message: hold.message, items: hold.items }
        : { ok: false, reason: "failed", message: hold.message }
    }
    await setPayStartedAt(Date.now())

    // The payment session. The cart is read again so it carries its shipping
    // total and its payment collection, if an earlier try made one.
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: "id,total,+payment_collection.id" }, headers)
    const { payment_collection } = await sdk.store.payment.initiatePaymentSession(
      cart,
      { provider_id: VNPAY_PROVIDER },
      {},
      headers
    )
    const session = payment_collection.payment_sessions?.find((s) => s.provider_id === VNPAY_PROVIDER)
    const paymentUrl = (session?.data as { payment_url?: unknown } | undefined)?.payment_url
    if (typeof paymentUrl !== "string") {
      return { ok: false, reason: "failed", message: "Không tạo được phiên thanh toán VNPAY." }
    }

    revalidateTag(await getCacheTag("carts"))
    return { ok: true, paymentUrl }
  } catch (error) {
    if (status(error) === 409 || status(error) === 404) {
      return { ok: false, reason: "slot_unavailable", message: "Khung giờ vừa đóng, bạn chọn khung giờ khác nhé." }
    }
    console.error("startPayment failed", error)
    return { ok: false, reason: "failed", message: "Không đặt được hàng lúc này. Giỏ hàng của bạn vẫn còn." }
  }
}

/**
 * The customer comes back from VNPAY with signed vnp_* parameters. The
 * backend checks the signature; this tells the page what to show. It does
 * not change the order: only VNPAY's IPN does that (backend plan V14).
 */
export async function verifyReturn(params: Record<string, string>): Promise<{ valid: boolean; success: boolean }> {
  try {
    return await sdk.client.fetch<{ valid: boolean; success: boolean }>("/store/vnpay/verify-return", {
      method: "GET",
      query: params,
      cache: "no-store",
    })
  } catch {
    return { valid: false, success: false }
  }
}

/**
 * The order that VNPAY's payment has produced, or null while it is not
 * there yet. The backend creates it a few hundred ms after the IPN, so the
 * page asks again until it appears. Completing a finished cart again returns
 * the same order (backend spike S8), so this is safe to repeat.
 */
export async function findPaidOrder(): Promise<{ orderId: string | null; hasCart: boolean; refund?: RefundNotice }> {
  const cartId = await getCartId()
  if (!cartId) {
    return { orderId: null, hasCart: false }
  }
  const headers = { ...(await getAuthHeaders()) }

  const { cart } = await sdk.store.cart.retrieve(
    cartId,
    { fields: "id,completed_at,total,metadata,items.variant_id,items.product_title" },
    headers
  )
  const raw = cart as {
    completed_at?: string | null
    total?: number
    metadata?: { stock_failed?: RawStockFailed } | null
    items?: { variant_id?: string | null; product_title?: string | null }[]
  }
  if (!raw.completed_at) {
    // Paid but out of stock when VNPAY confirmed: the backend refunded and made no order (API-12).
    const refund = refundNotice(raw.metadata?.stock_failed, await getPayStartedAt(), Number(raw.total ?? 0), (variantId) =>
      raw.items?.find((item) => item.variant_id === variantId)?.product_title ?? undefined
    )
    return refund ? { orderId: null, hasCart: true, refund } : { orderId: null, hasCart: true }
  }

  const done = await sdk.store.cart.complete(cartId, {}, headers)
  if (done.type !== "order") {
    return { orderId: null, hasCart: true }
  }

  // The cart is spent: the next "add" starts a new one.
  await removeCartId()
  revalidateTag(await getCacheTag("carts"))
  revalidateTag(await getCacheTag("orders"))
  return { orderId: done.order.id, hasCart: true }
}

/** The receipt of an order, or null when there is no such order. */
export async function getOrderReceipt(orderId: string): Promise<OrderReceipt | null> {
  try {
    const { order } = await sdk.client.fetch<{ order: RawOrder }>(`/store/orders/${orderId}`, {
      method: "GET",
      // metadata comes through the backend's allowFields (slot, note, stage).
      query: { fields: "id,display_id,created_at,item_subtotal,shipping_total,discount_total,total,+metadata,*items" },
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    })
    return buildOrderReceipt(order)
  } catch {
    return null
  }
}

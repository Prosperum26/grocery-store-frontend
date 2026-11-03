"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

/** One code of the customer's wallet (backend API-10). */
export type VoucherView = {
  code: string
  title: string
  description: string
  discountLabel: string
  minSubtotal: number | null
  /** ISO date, or null when the code does not expire. */
  endsAt: string | null
  status: "usable" | "not_eligible" | "expired"
}

export async function listMyVouchers(): Promise<VoucherView[]> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return []
  }
  const { vouchers } = await sdk.client
    .fetch<{ vouchers: VoucherView[] }>("/store/customers/me/vouchers", {
      method: "GET",
      headers: { ...authHeaders },
      cache: "no-store",
    })
    .catch(() => ({ vouchers: [] as VoucherView[] }))
  return vouchers
}

// Checkout options of the mock mode: delivery slots and the one payment
// method. The order that the confirmation page shows is the design's sample
// order (shared.js ORDER); it is not created from the cart.

export type DeliverySlot = {
  id: string
  day: string
  time: string
  open: boolean
}

export const DELIVERY_SLOTS: DeliverySlot[] = [
  { id: "today-15-17", day: "Hôm nay", time: "15:00–17:00", open: false },
  { id: "today-17-19", day: "Hôm nay", time: "17:00–19:00", open: true },
  { id: "today-19-21", day: "Hôm nay", time: "19:00–21:00", open: true },
  { id: "tomorrow-7-9", day: "Ngày mai", time: "07:00–09:00", open: true },
]

export const DEFAULT_SLOT_ID = "today-17-19"

export const NOTE_MAX_LENGTH = 200

/** Id of the sample order that the confirmation page shows. */
export const DEMO_ORDER_ID = "demo"

export const DEMO_ORDER = {
  code: "C4F-261007-0142",
  placed: "07.10.2026 · 15:12",
  slot: "Hôm nay, 17:00–19:00",
  payment: "VNPAY",
  count: 9,
  subtotal: 395000,
  shipping: 15000,
  discount: 20000,
  voucher: "TUOI20",
  total: 390000,
}

/** Vietnamese mobile numbers: 03, 05, 07, 08, 09 prefixes, with or without +84. */
export function isVietnamesePhone(value: string): boolean {
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(value.replace(/\s/g, ""))
}

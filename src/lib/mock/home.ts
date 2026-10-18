import type { ProductVM } from "../../types/viewmodels"

// Content of the home page blocks, from the v2 design data (shared.js).

/** Product of the big promo banner and the "Ưu đãi hôm nay" row (homeD()). */
export const HOME_PROMO_HANDLE = "thit-ba-roi-heo"
export const HOME_DEAL_HANDLES = [
  "thit-ba-roi-heo",
  "ca-loc-phi-le",
  "bong-cai-xanh",
  "tom-the-tuoi",
]

export type BasketLine = { handle: string; quantity: number }

/**
 * "Có thể bạn cần mua lại" sample (PREDICT in shared.js). Shown as a
 * placeholder: the prediction module is phase 2. No probability or reason is
 * shown, only items and prices (docs/07).
 */
export const MOCK_BUY_AGAIN: BasketLine[] = [
  { handle: "trung-ga-ta", quantity: 1 },
  { handle: "sua-tuoi-khong-duong", quantity: 2 },
  { handle: "rau-muong", quantity: 1 },
  { handle: "gao-st25", quantity: 1 },
  { handle: "chuoi-gia-nam-my", quantity: 1 },
]

/** "Tối nay nấu gì?" banner (RECIPE in shared.js), also a placeholder. */
export const MOCK_RECIPE = {
  name: "Canh chua cá lóc",
  serves: 4,
  minutes: 35,
  ingredients: [
    { handle: "ca-loc-phi-le", quantity: 1, short: "Cá lóc" },
    { handle: "ca-chua-da-lat", quantity: 1, short: "Cà chua" },
    { handle: "dua-tien-giang", quantity: 1, short: "Dứa" },
    { handle: "gia-do", quantity: 1, short: "Giá đỗ" },
    { handle: "me-chua", quantity: 1, short: "Me chua" },
    { handle: "rau-om-ngo-gai", quantity: 1, short: "Rau om" },
  ],
}

/** Products in the given handle order; handles not in the catalog are skipped. */
export function pickProducts(catalog: ProductVM[], handles: string[]): ProductVM[] {
  return handles
    .map((h) => catalog.find((p) => p.handle === h))
    .filter((p): p is ProductVM => Boolean(p))
}

/** Sum of default-pack price × quantity; lines whose product is missing count 0. */
export function basketTotal(lines: BasketLine[], catalog: ProductVM[]): number {
  return lines.reduce((sum, line) => {
    const product = catalog.find((p) => p.handle === line.handle)
    return sum + (product ? product.price * line.quantity : 0)
  }, 0)
}

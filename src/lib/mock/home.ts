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

/** Products in the given handle order; handles not in the catalog are skipped. */
export function pickProducts(catalog: ProductVM[], handles: string[]): ProductVM[] {
  return handles
    .map((h) => catalog.find((p) => p.handle === h))
    .filter((p): p is ProductVM => Boolean(p))
}

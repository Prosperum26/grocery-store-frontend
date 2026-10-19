// View-models the Com4Fud UI renders. Components take these instead of raw
// Medusa types, so the same component works with mock data now and with the
// real Store API later (see docs/plans/2026-10-18-sync-ui-v2-frontend.md §1.4).

export type OrderStage =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"

/** Plate colour behind a product illustration (`T` in the v2 design source). */
export type Tint =
  | "red"
  | "orange"
  | "green"
  | "cream"
  | "blue"
  | "yellow"
  | "brown"
  | "pink"

export type ProductVariantVM = {
  id: string
  label: string
  price: number
  originalPrice?: number
  stockQty: number
  weightGrams?: number
}

export type ProductVM = {
  id: string
  handle: string
  title: string
  categoryHandle?: string
  /** Pack size shown under the name, e.g. "Khay 500g". */
  unitLabel: string
  price: number
  originalPrice?: number
  stockQty: number
  /** Word used in "Còn 3 khay". */
  stockUnit: string
  lowStock: number
  art?: string
  tint: Tint
  thumbnail?: string
  origin?: string
  prepOptions?: string[]
  /** Handles of products bought together with this one ("Thường mua kèm"). */
  companions?: string[]
  description?: string
  variants: ProductVariantVM[]
  /** ISO date; used by "Mới nhất" sorting. */
  createdAt?: string
}

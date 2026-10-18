import { HttpTypes } from "@medusajs/types"
import type { ProductVM, ProductVariantVM, Tint } from "../../types/viewmodels"

const TINTS: Tint[] = ["red", "orange", "green", "cream", "blue", "yellow", "brown", "pink"]

function toVariantVM(v: any): ProductVariantVM {
  const calculated = v.calculated_price?.calculated_amount ?? 0
  const original = v.calculated_price?.original_amount
  return {
    id: v.id,
    label: v.title ?? "",
    price: calculated,
    originalPrice: original && original > calculated ? original : undefined,
    stockQty: v.inventory_quantity ?? 0,
    weightGrams: v.weight ?? undefined,
  }
}

/**
 * Maps a Store API product (real or mock) to what the UI renders. Metadata
 * keys follow the backend plan §2; missing keys fall back to safe defaults so
 * a product without Com4Fud metadata still renders.
 */
export function toProductVM(product: HttpTypes.StoreProduct): ProductVM {
  const meta = (product.metadata ?? {}) as Record<string, any>
  const rawVariants = (product.variants ?? []) as any[]
  const variants = rawVariants.map(toVariantVM)
  const defaultIndex = Math.max(
    0,
    rawVariants.findIndex((v) => v.metadata?.is_default)
  )
  const main = variants[defaultIndex]

  return {
    id: product.id,
    handle: product.handle ?? "",
    title: product.title ?? "",
    categoryHandle: product.categories?.[0]?.handle ?? undefined,
    unitLabel: main?.label ?? "",
    price: main?.price ?? 0,
    originalPrice: main?.originalPrice,
    stockQty: main?.stockQty ?? 0,
    stockUnit: meta.stock_unit ?? "phần",
    lowStock: typeof meta.low_stock === "number" ? meta.low_stock : 10,
    art: meta.art ?? undefined,
    tint: TINTS.includes(meta.tint) ? meta.tint : "green",
    thumbnail: product.thumbnail ?? undefined,
    origin: meta.origin ?? undefined,
    prepOptions: Array.isArray(meta.prep_options) ? meta.prep_options : undefined,
    variants,
  }
}

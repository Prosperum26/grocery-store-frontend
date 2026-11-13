import type { Tint } from "types/viewmodels"

/**
 * Illustration shown for a product that has no photo and no illustration of its own: one per category (files in
 * public/art), on the category's plate colour. A product of an unknown category gets a grocery bag. The eight first
 * are the category tiles of the design; noodles, candy, frozen and grocery were drawn for the other categories.
 */
export const CATEGORY_ART: Record<string, { art: string; tint: Tint }> = {
  "rau-cu": { art: "waterSpinach", tint: "green" },
  "trai-cay": { art: "pineapple", tint: "yellow" },
  thit: { art: "pork", tint: "pink" },
  "hai-san": { art: "shrimp", tint: "orange" },
  "trung-sua": { art: "eggs", tint: "cream" },
  "gao-do-kho": { art: "rice", tint: "cream" },
  "gia-vi": { art: "fishSauce", tint: "brown" },
  "do-uong": { art: "milk", tint: "blue" },
  "mi-an-lien": { art: "noodles", tint: "orange" },
  "banh-keo-an-vat": { art: "candy", tint: "pink" },
  "dong-lanh-che-bien": { art: "frozen", tint: "blue" },
}

export const FALLBACK_ART: { art: string; tint: Tint } = { art: "grocery", tint: "cream" }

/** The product's own illustration if it has one, else its category's, else the grocery bag. */
export function artFor(product: { art?: string; tint: Tint; categoryHandle?: string }): { art: string; tint: Tint } {
  if (product.art) return { art: product.art, tint: product.tint }
  return (product.categoryHandle && CATEGORY_ART[product.categoryHandle]) || FALLBACK_ART
}

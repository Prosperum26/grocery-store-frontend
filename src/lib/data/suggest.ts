"use server"

import { isMockMode } from "@lib/mock/mode"
import type { ProductVM } from "types/viewmodels"

import { listShortRow } from "./catalog"
import { searchRecipes } from "./kitchen"

/*
 * Suggestions under the header search box, asked while the shopper types.
 * The box finds two things: products (the catalog search) and dishes (Trợ lý
 * Bếp). The two are asked in parallel and each fails on its own: when the AI
 * service is down the shopper still gets products.
 */

export type SearchSuggestions = {
  products: ProductVM[]
  recipes: { id: string; name: string }[]
}

const MAX_PRODUCTS = 5
const MAX_RECIPES = 3

export async function suggest(countryCode: string, text: string): Promise<SearchSuggestions> {
  const q = text.trim().slice(0, 100)
  if (q.length < 2) {
    return { products: [], recipes: [] }
  }
  const [products, recipes] = await Promise.all([
    listShortRow({ countryCode, q, take: MAX_PRODUCTS }),
    // Mock mode has no AI service. Dishes are shown only when the search found a real match
    // (`accepted`); its "nearest dishes" fallback would look unrelated next to a product query.
    isMockMode() ? null : searchRecipes(q),
  ])
  return {
    products,
    recipes:
      recipes?.ok && recipes.data.accepted
        ? recipes.data.results.slice(0, MAX_RECIPES).map((r) => ({ id: r.recipe.id, name: r.recipe.name }))
        : [],
  }
}

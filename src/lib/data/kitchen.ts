"use server"

import { sdk } from "@lib/config"
import type { RawRecipeDetail, RawRecipeSearch } from "@lib/util/kitchen"
import { addLine } from "./shopping-cart"

/*
 * Trợ lý Bếp (backend API-8). The storefront only talks to the Medusa
 * backend, which asks the AI service. Each call returns a result the screen
 * can show without a try/catch:
 *   "unavailable": the AI service is down (backend 503), show "Trợ lý Bếp tạm nghỉ"
 *   "not_found":   the recipe id is unknown (404)
 *   "error":       anything else
 * The AI is only asked for an answer when the customer presses the "hỏi thêm" button.
 */

export type KitchenFailure = "unavailable" | "not_found" | "error"
export type KitchenResult<T> = { ok: true; data: T } | { ok: false; reason: KitchenFailure }

async function post<T>(path: string, body: object): Promise<KitchenResult<T>> {
  try {
    const data = await sdk.client.fetch<T>(path, { method: "POST", body, cache: "no-store" })
    return { ok: true, data }
  } catch (error) {
    const status = (error as { status?: number })?.status
    return { ok: false, reason: status === 503 ? "unavailable" : status === 404 ? "not_found" : "error" }
  }
}

/**
 * Recipes for a typed dish name. Fast: the AI language model is not used, and
 * `include_basket: false` asks for the list only (no ingredients, prices or
 * stock), because the search page shows names. The recipe page loads the rest.
 */
export async function searchRecipes(query: string): Promise<KitchenResult<RawRecipeSearch>> {
  return post<RawRecipeSearch>("/store/ai/search", { query: query.trim().slice(0, 300), top_k: 6, include_basket: false })
}

/** One recipe with its steps and an ingredient list scaled to `servings`. */
export async function getRecipe(recipeId: string, servings?: number): Promise<KitchenResult<RawRecipeDetail>> {
  return post<RawRecipeDetail>("/store/ai/recipe", { recipe_id: recipeId, ...(servings ? { servings } : {}) })
}

export type RawAsk = { answer: string | null; status: string }
export type AskTurn = { question: string; answer: string }

/** The backend takes at most this many earlier turns. */
const MAX_HISTORY = 6

/**
 * Follow-up question about the recipe on screen; this is the only call that
 * uses the language model. `history` holds the earlier turns of this page, so
 * "vậy thay bằng gì?" is understood; nothing is stored on the server.
 */
export async function askAboutRecipe(
  recipeId: string,
  question: string,
  servings?: number,
  history: AskTurn[] = []
): Promise<KitchenResult<RawAsk>> {
  return post<RawAsk>("/store/ai/ask", {
    recipe_id: recipeId,
    question: question.trim().slice(0, 300),
    ...(servings ? { servings } : {}),
    history: history.slice(-MAX_HISTORY).map((turn) => ({ question: turn.question.slice(0, 300), answer: turn.answer.slice(0, 1500) })),
  })
}

/**
 * Puts the ticked ingredients in the cart, one after another (each call reads
 * and changes the same cart). Lines that cannot be added (stock ran out
 * meanwhile) are counted, not thrown.
 */
export async function addRecipeLines(
  countryCode: string,
  lines: { variantId: string; quantity: number; unitPrice: number }[]
): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0
  for (const line of lines) {
    const { result } = await addLine({
      countryCode,
      variantId: line.variantId,
      quantity: line.quantity,
      priceAtAdd: line.unitPrice,
    })
    if (result.ok) added += 1
    else skipped += 1
  }
  return { added, skipped }
}

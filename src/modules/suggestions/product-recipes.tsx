"use client"

import { getRecipesForProduct } from "@lib/data/suggest-recipes"
import type { RawSuggestion } from "@lib/util/suggest"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import RecipeCard from "./recipe-card"

/**
 * C: "Món nấu với {sản phẩm}". The product page is built ahead of time, so this loads in the browser after the page
 * shows. While it loads a fixed-height placeholder keeps the layout still; if the product has no dish (soft drinks,
 * snacks), or the AI service is down, the whole block disappears.
 */
export default function ProductRecipes({ handle, title }: { handle: string; title: string }) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const [state, setState] = useState<"loading" | "none" | RawSuggestion[]>("loading")

  useEffect(() => {
    let cancelled = false
    getRecipesForProduct(countryCode, handle)
      .then((result) => {
        if (cancelled) return
        setState(result.ok && result.data.suggestions.length > 0 ? result.data.suggestions : "none")
      })
      .catch(() => !cancelled && setState("none"))
    return () => {
      cancelled = true
    }
  }, [countryCode, handle])

  if (state === "none") return null
  // The full product name carries the pack size ("… chai 500ml"); the dish's own ingredient name reads better.
  const heading = state !== "loading" ? (state[0]?.matched[0]?.name.trim().toLocaleLowerCase("vi") ?? title) : title

  if (state === "loading") {
    return <div aria-hidden="true" className="h-[250px] animate-pulse rounded-card bg-page-2" />
  }

  return (
    <section aria-labelledby="product-recipes" className="flex flex-col gap-3">
      <h2 id="product-recipes" className="font-display text-xl font-bold text-ink small:text-[26px] small:leading-8">
        Món nấu với {heading}
      </h2>
      <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 small:mx-0 small:grid small:grid-cols-3 small:overflow-visible small:px-0">
        {state.map((s) => (
          <li key={s.recipe.id} className="w-[78%] shrink-0 snap-start small:w-auto">
            <RecipeCard suggestion={s} />
          </li>
        ))}
      </ul>
    </section>
  )
}

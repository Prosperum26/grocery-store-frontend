"use client"

import { useCart } from "@lib/context/cart-context"
import { getRecipesForCart } from "@lib/data/suggest-recipes"
import { cartSignature, introNames, introText, type RawSuggestion } from "@lib/util/suggest"
import { useEffect, useRef, useState } from "react"
import { LuChefHat } from "react-icons/lu"
import RecipeCard from "./recipe-card"

const DELAY_MS = 500

/**
 * B: "Mình thấy bạn có … trong giỏ. Bạn muốn thử nấu…". Up to 3 dishes that use what is in the cart. Asks again only
 * when the set of products changes (not the quantities), 500 ms after the last change; an answer for an older cart is
 * dropped. Draws nothing for an empty cart, no suggestion, or when the AI service is down.
 */
export default function CartRecipes({ headingId = "cart-recipes" }: { headingId?: string }) {
  const { view } = useCart()
  const signature = cartSignature(view.lines.map((line) => line.key))
  const [shown, setShown] = useState<{ signature: string; suggestions: RawSuggestion[] } | null>(null)
  const latest = useRef(signature)
  latest.current = signature

  useEffect(() => {
    if (signature === "") return
    const timer = setTimeout(() => {
      getRecipesForCart()
        .then((result) => {
          if (latest.current !== signature) return // the cart changed while waiting
          setShown({ signature, suggestions: result.ok ? result.data.suggestions : [] })
        })
        .catch(() => setShown({ signature, suggestions: [] }))
    }, DELAY_MS)
    return () => clearTimeout(timer)
  }, [signature])

  // Hide while the answer belongs to another cart: stale dishes would name products that are no longer in the cart.
  if (signature === "" || !shown || shown.signature !== signature || shown.suggestions.length === 0) return null

  const intro = introText(introNames(shown.suggestions))

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-4 small:rounded-card small:p-6">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-ink small:h-10 small:w-10 small:rounded-xl">
          <LuChefHat size={18} />
        </span>
        <div>
          <h2 id={headingId} className="font-sans text-base font-semibold small:font-display small:text-[24px] small:font-bold small:leading-8">
            Bạn muốn thử nấu…
          </h2>
          {intro && <p className="text-sm text-ink-2">{intro}</p>}
        </div>
      </div>
      <ul aria-live="polite" className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 small:mx-0 small:grid small:grid-cols-3 small:overflow-visible small:px-0">
        {shown.suggestions.map((s) => (
          <li key={s.recipe.id} className="w-[78%] shrink-0 snap-start small:w-auto">
            <RecipeCard suggestion={s} />
          </li>
        ))}
      </ul>
    </section>
  )
}

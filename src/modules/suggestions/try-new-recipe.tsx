"use client"

import { getRecipeToTry } from "@lib/data/suggest-recipes"
import { formatMissing, recipeMeta, thumbnailsOf, type RawSuggestion } from "@lib/util/suggest"
import Button from "@modules/common/components/button"
import ProductArt from "@modules/products/components/product-art"
import { useEffect, useRef, useState } from "react"
import { LuPlus, LuShuffle, LuSparkles } from "react-icons/lu"
import { useAddSuggestion } from "./recipe-card"

/** "3 nguyên liệu mới bạn chưa mua · 1 nguyên liệu bạn đã quen". Only when there is a buying history to compare with. */
function reasonOf(s: RawSuggestion): string | null {
  if (!s.new_count || !s.familiar_count) return null
  return `${s.new_count} nguyên liệu mới bạn chưa mua · ${s.familiar_count} nguyên liệu bạn đã quen`
}

/**
 * A: "Thử món mới?". One dish at a time, the same dish all day for the same customer (the backend seeds the pick with
 * customer and date). "Đổi món khác" asks again without the dishes already shown; when none is left the button goes
 * away. Draws nothing while loading, when the AI service is down, or when no dish can be bought right now.
 */
export default function TryNewRecipe({ headingId = "try-new-recipe" }: { headingId?: string }) {
  const [current, setCurrent] = useState<RawSuggestion | null>(null)
  const [exhausted, setExhausted] = useState(false)
  const [changing, setChanging] = useState(false)
  const shown = useRef<string[]>([])

  useEffect(() => {
    let cancelled = false
    getRecipeToTry([])
      .then((result) => {
        if (cancelled || !result.ok) return
        const first = result.data.suggestions[0]
        if (first) {
          shown.current = [first.recipe.id]
          setCurrent(first)
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const another = async () => {
    setChanging(true)
    const result = await getRecipeToTry(shown.current).catch(() => null)
    setChanging(false)
    const next = result && result.ok ? result.data.suggestions[0] : undefined
    if (next) {
      shown.current = [...shown.current, next.recipe.id]
      setCurrent(next)
    } else {
      setExhausted(true)
    }
  }

  if (!current) return null
  return <Card key={current.recipe.id} suggestion={current} headingId={headingId} onChange={exhausted ? undefined : another} changing={changing} />
}

function Card({ suggestion, headingId, onChange, changing }: { suggestion: RawSuggestion; headingId: string; onChange?: () => void; changing: boolean }) {
  const { add, busy } = useAddSuggestion(suggestion)
  const { recipe, missing_count, missing_total } = suggestion
  const photos = thumbnailsOf(suggestion, 6)
  const reason = reasonOf(suggestion)

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4 rounded-[20px] bg-accent-soft p-5 small:flex-row small:items-center small:gap-8 small:rounded-banner small:p-8">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 text-accent-ink">
          <LuSparkles aria-hidden="true" />
          <h2 id={headingId} className="font-display text-xl font-bold text-ink small:text-[26px] small:leading-8">
            Thử món mới?
          </h2>
        </div>
        <p aria-live="polite" className="text-lg font-semibold text-ink">
          {recipe.name}
        </p>
        <p className="text-sm text-accent-ink">{recipeMeta(recipe)}</p>
        {reason && <p className="text-sm text-ink">{reason}</p>}
        {recipe.description && <p className="line-clamp-2 text-sm text-ink-2">{recipe.description}</p>}
        {photos.length > 0 && (
          <div className="flex gap-1.5" aria-hidden="true">
            {photos.map((url) => (
              <div key={url} className="aspect-square w-12 overflow-hidden rounded-btn bg-surface small:w-14">
                <ProductArt product={{ title: "", tint: "cream", thumbnail: url }} decorative fit="contain" scale={0.7} sizes="56px" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 small:w-[340px] small:shrink-0">
        <p className="text-sm text-ink">{formatMissing(missing_count, missing_total)}</p>
        {missing_count > 0 && (
          <Button
            variant="primary"
            size="lg"
            icon={<LuPlus />}
            fullWidth
            onClick={add}
            aria-disabled={busy || undefined}
            aria-label={`Thêm cả giỏ nguyên liệu cho ${recipe.name}`}
          >
            {busy ? "Đang thêm…" : "Thêm cả giỏ nguyên liệu"}
          </Button>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="md" href={`/tro-ly-bep/${recipe.id}`} aria-label={`Xem công thức ${recipe.name}`} className="flex-1">
            Xem công thức
          </Button>
          {onChange && (
            <Button variant="secondary" size="md" icon={<LuShuffle />} onClick={onChange} aria-disabled={changing || undefined} className="flex-1">
              {changing ? "Đang đổi…" : "Đổi món khác"}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

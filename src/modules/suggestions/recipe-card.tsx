"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import { addRecipeLines } from "@lib/data/kitchen"
import { addLinesOf, formatMissing, recipeMeta, thumbnailsOf, type RawSuggestion } from "@lib/util/suggest"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"
import { useParams } from "next/navigation"
import { useState } from "react"
import { LuPlus } from "react-icons/lu"

/**
 * One suggested dish, shared by the cart (B), product page (C) and "thử món mới" (A) blocks. A strip of ingredient
 * photos stands in for a dish photo (the dish photo host is not allowed in next.config yet). "Thêm" puts only the
 * missing ingredients in the cart, the same lines the recipe page would add.
 */
export default function RecipeCard({ suggestion, onAdded }: { suggestion: RawSuggestion; onAdded?: () => void }) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const { refresh } = useCart()
  const { show } = useToast()
  const [busy, setBusy] = useState(false)
  const { recipe, missing_count, missing_total } = suggestion
  const photos = thumbnailsOf(suggestion)
  const covered = missing_count === 0

  const add = async () => {
    if (busy) return
    setBusy(true)
    const { added, skipped } = await addRecipeLines(countryCode, addLinesOf(suggestion))
    await refresh()
    setBusy(false)
    show(
      added > 0
        ? { tone: "ok", title: `Đã thêm ${added} nguyên liệu cho ${recipe.name}`, description: skipped > 0 ? `${skipped} nguyên liệu vừa hết hàng nên chưa thêm.` : undefined }
        : { tone: "warn", title: "Chưa thêm được nguyên liệu nào", description: "Các nguyên liệu này vừa hết hàng." }
    )
    onAdded?.()
  }

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-3.5">
      {photos.length > 0 && (
        <div className="flex gap-1.5" aria-hidden="true">
          {photos.map((url) => (
            <div key={url} className="aspect-square min-w-0 flex-1 overflow-hidden rounded-btn">
              <ProductArt product={{ title: "", tint: "cream", thumbnail: url }} decorative fit="contain" scale={0.7} sizes="80px" />
            </div>
          ))}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-sans text-base font-semibold leading-snug text-ink">{recipe.name}</h3>
        <p className="text-xs text-ink-2">{recipeMeta(recipe)}</p>
        <p className={"mt-1 text-sm " + (covered ? "font-semibold text-accent-ink" : "text-ink")}>{formatMissing(missing_count, missing_total)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!covered && (
          <Button
            variant="primary"
            size="md"
            icon={<LuPlus />}
            onClick={add}
            aria-disabled={busy || undefined}
            aria-label={`Thêm ${missing_count} nguyên liệu còn thiếu cho ${recipe.name}`}
          >
            {busy ? "Đang thêm…" : `Thêm ${missing_count} món còn thiếu`}
          </Button>
        )}
        <Button variant="secondary" size="md" href={`/tro-ly-bep/${recipe.id}`} aria-label={`Xem công thức ${recipe.name}`}>
          Xem công thức
        </Button>
      </div>
    </article>
  )
}

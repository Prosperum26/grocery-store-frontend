"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import { addRecipeLines, getRecipe, type KitchenFailure } from "@lib/data/kitchen"
import {
  buildLines,
  cartLinesOf,
  initialSelection,
  servingsLabel,
  summarize,
  type KitchenLine,
  type RawRecipeDetail,
  type Selection,
} from "@lib/util/kitchen"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { LuArrowLeft, LuMinus, LuPlus } from "react-icons/lu"

import AskPanel from "./ask-panel"
import { FailureNote } from "./failure"
import IngredientList from "./ingredient-list"

type Shown = { detail: RawRecipeDetail; lines: KitchenLine[]; selection: Selection }

const show = (detail: RawRecipeDetail, before?: Selection): Shown => {
  const lines = buildLines(detail.basket)
  const fresh = initialSelection(lines)
  if (!before) {
    return { detail, lines, selection: fresh }
  }
  // Another number of people: keep the ticks and brands the customer already chose.
  return {
    detail,
    lines,
    selection: {
      ticked: Object.fromEntries(lines.map((l) => [l.key, before.ticked[l.key] ?? fresh.ticked[l.key]])),
      choice: Object.fromEntries(Object.entries(before.choice).filter(([key]) => lines.some((l) => l.key === key))),
    },
  }
}

/**
 * One recipe (screen 11, "Công thức vào giỏ"): ingredients with the product
 * the store picked, ticks, brand choice, subtotal, add to cart, cooking steps
 * and the "Hỏi thêm" box. The server page loads the recipe; this component
 * only reloads it when the customer changes the number of people.
 */
export default function RecipeView({ initial, backQuery }: { initial: RawRecipeDetail; backQuery: string }) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const { refresh } = useCart()
  const toast = useToast()

  const [shown, setShown] = useState<Shown>(() => show(initial))
  const [loading, setLoading] = useState(false)
  const [failure, setFailure] = useState<KitchenFailure | null>(null)
  const [adding, setAdding] = useState(false)
  // Only the newest request may write its answer (people press +/- fast).
  const latest = useRef(0)

  const { detail, lines, selection } = shown
  const recipe = detail.recipe
  const servings = detail.servings
  const summary = useMemo(() => summarize(lines, selection), [lines, selection])
  const steps = [...detail.prep_steps, ...detail.cooking_steps]
  const recipeLines = detail.ingredient_lines ?? []

  const changeServings = async (next: number) => {
    const id = ++latest.current
    setLoading(true)
    setFailure(null)
    const result = await getRecipe(recipe.id, next)
    if (id !== latest.current) return
    setLoading(false)
    if (!result.ok) {
      setFailure(result.reason)
      return
    }
    setShown((current) => show(result.data, current.selection))
    // Keep the number of people in the address, so a reload or a shared link shows the same list.
    const url = new URL(window.location.href)
    url.searchParams.set("nguoi", String(next))
    window.history.replaceState(null, "", url)
  }

  const update = (change: (s: Selection) => Selection) =>
    setShown((current) => ({ ...current, selection: change(current.selection) }))

  const addToCart = async () => {
    if (summary.count === 0) return
    setAdding(true)
    try {
      const { added, skipped } = await addRecipeLines(countryCode, cartLinesOf(lines, selection))
      await refresh()
      toast.show(
        added > 0
          ? {
              tone: "ok",
              title: `Đã thêm ${added} nguyên liệu vào giỏ`,
              description: skipped > 0 ? `${skipped} món vừa hết hàng nên chưa thêm.` : undefined,
            }
          : { tone: "warn", title: "Chưa thêm được món nào", description: "Các nguyên liệu đã chọn vừa hết hàng." }
      )
    } catch {
      toast.show({ tone: "err", title: "Chưa thêm được vào giỏ", description: "Bạn thử lại nhé." })
    } finally {
      setAdding(false)
    }
  }

  return (
    <article aria-labelledby="kitchen-recipe" className="content-container flex flex-col gap-6 py-8 small:py-12">
      <LocalizedClientLink
        href={backQuery ? `/tro-ly-bep?q=${encodeURIComponent(backQuery)}` : "/tro-ly-bep"}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
      >
        <LuArrowLeft aria-hidden="true" />
        {backQuery ? `Kết quả cho “${backQuery}”` : "Tìm món khác"}
      </LocalizedClientLink>

      <div className="flex flex-col gap-2">
        <h1 id="kitchen-recipe" className="font-display text-3xl font-bold small:text-4xl">
          {recipe.name}
        </h1>
        {recipe.description && <p className="max-w-3xl text-ink-2">{recipe.description}</p>}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div role="group" aria-label="Số người ăn" className="inline-flex items-center rounded-full border border-line-2 bg-surface">
            <button
              type="button"
              aria-label="Giảm số người"
              className="touch-target relative flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-35"
              disabled={servings <= 1 || loading}
              onClick={() => void changeServings(servings - 1)}
            >
              <LuMinus aria-hidden="true" />
            </button>
            <span className="min-w-20 text-center font-semibold" aria-live="polite">
              {servingsLabel(servings)}
            </span>
            <button
              type="button"
              aria-label="Tăng số người"
              className="touch-target relative flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-35"
              disabled={servings >= 50 || loading}
              onClick={() => void changeServings(servings + 1)}
            >
              <LuPlus aria-hidden="true" />
            </button>
          </div>
          {recipe.time_minutes ? <span className="text-ink-2">{recipe.time_minutes} phút</span> : null}
          {servings !== recipe.servings && <span className="text-ink-2">Công thức gốc cho {servingsLabel(recipe.servings)}</span>}
        </div>
      </div>

      {failure && <FailureNote reason={failure} />}

      <div className={"grid gap-6 small:grid-cols-[1fr_380px] " + (loading ? "opacity-60" : "")}>
        <section aria-labelledby="kitchen-ingredients" className="rounded-card border border-line bg-surface p-4 small:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-3">Cho {servingsLabel(servings)}</p>
              <h2 id="kitchen-ingredients" className="font-display text-2xl font-bold">
                Nguyên liệu
              </h2>
            </div>
            <p className="text-sm font-semibold">
              Đã chọn {summary.count}/{lines.length}
            </p>
          </div>
          <IngredientList
            lines={lines}
            selection={selection}
            onTick={(key, ticked) => update((s) => ({ ...s, ticked: { ...s.ticked, [key]: ticked } }))}
            onChoose={(key, catalogId) => update((s) => ({ ...s, choice: { ...s.choice, [key]: catalogId } }))}
          />
          {detail.not_in_basket.length > 0 && (
            <p className="mt-3 rounded-2xl bg-page-2 p-3 text-sm text-ink-2">
              Không có trong giỏ (ăn kèm hoặc cửa hàng không bán): {detail.not_in_basket.join(", ")}.
            </p>
          )}
          {recipeLines.length > 0 && (
            <details className="mt-3 rounded-2xl border border-line p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Nguyên liệu theo công thức gốc ({servingsLabel(recipe.servings)})</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-2">
                {recipeLines.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="kitchen-summary" className="rounded-card border border-line bg-surface p-4 small:p-6">
            <h2 id="kitchen-summary" className="font-mono text-xs uppercase tracking-wider text-ink-3">
              Tóm tắt
            </h2>
            <dl className="mt-2 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-2">{summary.count} nguyên liệu sẽ thêm vào giỏ</dt>
                <dd className="font-mono font-bold">{formatVnd(summary.total)}</dd>
              </div>
              {summary.notChosen > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-2">{summary.notChosen} món chưa chọn</dt>
                  <dd className="font-mono">0đ</dd>
                </div>
              )}
              {summary.unavailable > 0 && (
                <div className="flex justify-between text-warn-ink">
                  <dt>{summary.unavailable} món hết hàng hoặc chưa bán</dt>
                  <dd className="font-mono">—</dd>
                </div>
              )}
            </dl>
            <div className="mt-3 flex items-end justify-between border-t border-dashed border-line-2 pt-3">
              <span className="font-semibold">Tạm tính</span>
              <span className="font-mono text-2xl font-bold">{formatVnd(summary.total)}</span>
            </div>
            <Button
              fullWidth
              size="lg"
              className="mt-3"
              icon={<LuPlus />}
              onClick={addToCart}
              aria-disabled={adding || loading || summary.count === 0 || undefined}
            >
              {adding ? "Đang thêm…" : `Thêm ${summary.count} nguyên liệu · ${formatVnd(summary.total)}`}
            </Button>
          </section>

          {steps.length > 0 && (
            <section aria-labelledby="kitchen-steps" className="rounded-card border border-line bg-surface p-4 small:p-6">
              <h2 id="kitchen-steps" className="font-mono text-xs uppercase tracking-wider text-ink-3">
                Cách nấu · {steps.length} bước
              </h2>
              <ol className="mt-3 flex flex-col gap-3 text-sm">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warn font-mono text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {recipe.source_url.startsWith("http") && (
                <p className="mt-3 text-xs text-ink-3">
                  Nguồn công thức:{" "}
                  <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="underline">
                    {new URL(recipe.source_url).hostname}
                  </a>
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      <AskPanel recipeId={recipe.id} servings={servings} />
    </article>
  )
}

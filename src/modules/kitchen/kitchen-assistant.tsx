"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import { addRecipeLines, getRecipe, searchRecipes, type KitchenFailure } from "@lib/data/kitchen"
import {
  buildLines,
  cartLinesOf,
  initialSelection,
  servingsLabel,
  summarize,
  type KitchenLine,
  type RawRecipeDetail,
  type RecipeInfo,
  type Selection,
} from "@lib/util/kitchen"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import { useParams } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { LuChefHat, LuClock, LuMinus, LuPlus, LuSearch, LuUsers } from "react-icons/lu"

import AskPanel from "./ask-panel"
import IngredientList from "./ingredient-list"

const EXAMPLES = ["canh chua cá lóc", "thịt kho trứng", "gà kho gừng"]

const FAILURE_TEXT: Record<KitchenFailure, string> = {
  unavailable: "Trợ lý Bếp tạm nghỉ, bạn thử lại sau nhé.",
  not_found: "Không tìm thấy món này.",
  error: "Có lỗi xảy ra, bạn thử lại nhé.",
}

type Found = { accepted: boolean; recipes: RecipeInfo[] }
type Opened = { recipe: RecipeInfo; detail: RawRecipeDetail; lines: KitchenLine[]; selection: Selection }

/**
 * "Tìm món → công thức vào giỏ" (screens 10 and 11). The customer types a dish
 * name, picks a recipe, ticks ingredients and adds them to the cart. The AI
 * language model is not used on this screen except for the "Hỏi thêm" button.
 */
export default function KitchenAssistant() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const { refresh } = useCart()
  const { show } = useToast()

  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [found, setFound] = useState<Found | null>(null)
  const [opened, setOpened] = useState<Opened | null>(null)
  const [loadingRecipe, setLoadingRecipe] = useState(false)
  const [failure, setFailure] = useState<KitchenFailure | null>(null)
  const [adding, setAdding] = useState(false)
  // Only the newest request may write its answer (people type and click fast).
  const searchId = useRef(0)
  const recipeId = useRef(0)

  const search = async (text: string) => {
    const q = text.trim()
    if (!q) return
    const id = ++searchId.current
    setSearching(true)
    setFailure(null)
    const result = await searchRecipes(q)
    if (id !== searchId.current) return
    setSearching(false)
    if (!result.ok) {
      setFailure(result.reason)
      return
    }
    setFound({ accepted: result.data.accepted, recipes: result.data.results.map((r) => r.recipe) })
    setOpened(null)
  }

  /** Opens a recipe, or reloads it for another number of people keeping the ticks the customer made. */
  const open = async (recipe: RecipeInfo, servings?: number) => {
    const id = ++recipeId.current
    setLoadingRecipe(true)
    setFailure(null)
    const result = await getRecipe(recipe.id, servings)
    if (id !== recipeId.current) return
    setLoadingRecipe(false)
    if (!result.ok) {
      setFailure(result.reason)
      return
    }
    const lines = buildLines(result.data.basket)
    const fresh = initialSelection(lines)
    const before = opened?.recipe.id === recipe.id ? opened.selection : null
    const selection: Selection = before
      ? {
          ticked: Object.fromEntries(lines.map((l) => [l.key, before.ticked[l.key] ?? fresh.ticked[l.key]])),
          choice: Object.fromEntries(Object.entries(before.choice).filter(([k]) => lines.some((l) => l.key === k))),
        }
      : fresh
    setOpened({ recipe, detail: result.data, lines, selection })
  }

  const summary = useMemo(() => (opened ? summarize(opened.lines, opened.selection) : null), [opened])

  const update = (change: (s: Selection) => Selection) =>
    setOpened((o) => (o ? { ...o, selection: change(o.selection) } : o))

  const addToCart = async () => {
    if (!opened || !summary || summary.count === 0) return
    setAdding(true)
    try {
      const { added, skipped } = await addRecipeLines(countryCode, cartLinesOf(opened.lines, opened.selection))
      await refresh()
      show(
        added > 0
          ? {
              tone: "ok",
              title: `Đã thêm ${added} nguyên liệu vào giỏ`,
              description: skipped > 0 ? `${skipped} món vừa hết hàng nên chưa thêm.` : undefined,
            }
          : { tone: "warn", title: "Chưa thêm được món nào", description: "Các nguyên liệu đã chọn vừa hết hàng." }
      )
    } catch {
      show({ tone: "err", title: "Chưa thêm được vào giỏ", description: "Bạn thử lại nhé." })
    } finally {
      setAdding(false)
    }
  }

  const servings = opened?.detail.servings ?? 0

  return (
    <div className="content-container flex flex-col gap-6 py-8 small:py-12">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-12 w-12 -rotate-6 items-center justify-center rounded-2xl bg-accent text-ink">
            <LuChefHat size={26} />
          </span>
          <h1 className="font-display text-3xl font-bold small:text-[40px] small:leading-[48px]">Trợ lý Bếp</h1>
        </div>
        <p className="text-ink-2">Gõ tên món, xem công thức và đưa đủ nguyên liệu còn hàng vào giỏ.</p>

        <form
          role="search"
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void search(query)
          }}
        >
          <label htmlFor="kitchen-search" className="sr-only">
            Tên món ăn
          </label>
          <div className="relative flex-1">
            <LuSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="kitchen-search"
              value={query}
              maxLength={300}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm “canh chua cá lóc”, “thịt kho trứng”…"
              className="h-12 w-full rounded-btn border border-line-2 bg-surface pl-10 pr-3"
            />
          </div>
          <Button type="submit" size="lg" aria-disabled={searching || !query.trim() || undefined}>
            {searching ? "Đang tìm…" : "Tìm món"}
          </Button>
        </form>

        {!found && !searching && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-2">Thử:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="touch-target rounded-full border border-line-2 px-3 py-1.5 hover:bg-page"
                onClick={() => {
                  setQuery(example)
                  void search(example)
                }}
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </header>

      <div aria-live="polite">
        {failure && <p className="rounded-2xl bg-warn-bg p-4 text-sm text-warn-ink">{FAILURE_TEXT[failure]}</p>}
      </div>

      {found && (
        <section aria-labelledby="kitchen-results" className="flex flex-col gap-3">
          <h2 id="kitchen-results" className="font-display text-xl font-bold">
            {found.accepted ? "Món phù hợp" : "Chưa có món đúng ý, bạn xem thử các món gần nhất"}
          </h2>
          {found.recipes.length === 0 ? (
            <p className="text-ink-2">Chưa có món nào. Bạn thử gõ tên món khác nhé.</p>
          ) : (
            <ul className="grid gap-3 small:grid-cols-2">
              {found.recipes.map((recipe) => {
                const current = opened?.recipe.id === recipe.id
                return (
                  <li key={recipe.id}>
                    <button
                      type="button"
                      aria-pressed={current}
                      onClick={() => void open(recipe)}
                      className={
                        "flex w-full flex-col gap-1 rounded-2xl border p-4 text-left hover:bg-page " +
                        (current ? "border-brand bg-brand-bg" : "border-line bg-surface")
                      }
                    >
                      <span className="font-semibold">{recipe.name}</span>
                      <span className="flex flex-wrap gap-x-3 text-xs text-ink-2">
                        <span className="inline-flex items-center gap-1">
                          <LuUsers aria-hidden="true" size={12} />
                          {servingsLabel(recipe.servings)}
                        </span>
                        {recipe.time_minutes && (
                          <span className="inline-flex items-center gap-1">
                            <LuClock aria-hidden="true" size={12} />
                            {recipe.time_minutes} phút
                          </span>
                        )}
                        {recipe.difficulty && <span>{recipe.difficulty}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {loadingRecipe && !opened && <p className="text-ink-2">Đang mở công thức…</p>}

      {opened && summary && (
        <article aria-labelledby="kitchen-recipe" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="kitchen-recipe" className="font-display text-3xl font-bold small:text-4xl">
              {opened.recipe.name}
            </h2>
            {opened.recipe.description && <p className="max-w-3xl text-ink-2">{opened.recipe.description}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div role="group" aria-label="Số người ăn" className="inline-flex items-center rounded-full border border-line-2 bg-surface">
                <button
                  type="button"
                  aria-label="Giảm số người"
                  className="touch-target flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-35"
                  disabled={servings <= 1 || loadingRecipe}
                  onClick={() => void open(opened.recipe, servings - 1)}
                >
                  <LuMinus aria-hidden="true" />
                </button>
                <span className="min-w-20 text-center font-semibold" aria-live="polite">
                  {servingsLabel(servings)}
                </span>
                <button
                  type="button"
                  aria-label="Tăng số người"
                  className="touch-target flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-35"
                  disabled={servings >= 50 || loadingRecipe}
                  onClick={() => void open(opened.recipe, servings + 1)}
                >
                  <LuPlus aria-hidden="true" />
                </button>
              </div>
              {opened.recipe.time_minutes && <span className="text-ink-2">{opened.recipe.time_minutes} phút</span>}
              {opened.recipe.difficulty && <span className="text-ink-2">{opened.recipe.difficulty}</span>}
            </div>
          </div>

          <div className={"grid gap-6 small:grid-cols-[1fr_380px] " + (loadingRecipe ? "opacity-60" : "")}>
            <section aria-labelledby="kitchen-ingredients" className="rounded-card border border-line bg-surface p-4 small:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-ink-3">Cho {servingsLabel(servings)}</p>
                  <h3 id="kitchen-ingredients" className="font-display text-2xl font-bold">
                    Nguyên liệu
                  </h3>
                </div>
                <p className="text-sm font-semibold">
                  Đã chọn {opened.lines.length - summary.unticked}/{opened.lines.length}
                </p>
              </div>
              <IngredientList
                lines={opened.lines}
                selection={opened.selection}
                onTick={(key, ticked) => update((s) => ({ ...s, ticked: { ...s.ticked, [key]: ticked } }))}
                onChoose={(key, catalogId) => update((s) => ({ ...s, choice: { ...s.choice, [key]: catalogId } }))}
              />
              {opened.detail.not_in_basket.length > 0 && (
                <p className="mt-3 rounded-2xl bg-page-2 p-3 text-sm text-ink-2">
                  Cửa hàng chưa bán: {opened.detail.not_in_basket.join(", ")}.
                </p>
              )}
            </section>

            <div className="flex flex-col gap-6">
              <section aria-labelledby="kitchen-summary" className="rounded-card border border-line bg-surface p-4 small:p-6">
                <h3 id="kitchen-summary" className="font-mono text-xs uppercase tracking-wider text-ink-3">
                  Tóm tắt
                </h3>
                <dl className="mt-2 flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-2">{summary.count} nguyên liệu sẽ thêm</dt>
                    <dd className="font-mono font-bold">{formatVnd(summary.total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-2">{summary.unticked} món bỏ qua (nhà đã có)</dt>
                    <dd className="font-mono">0đ</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-end justify-between border-t border-dashed border-line-2 pt-3">
                  <span className="font-semibold">Tạm tính</span>
                  <span className="font-mono text-2xl font-bold">{formatVnd(summary.total)}</span>
                </div>
                {summary.skipped > 0 && (
                  <p className="mt-2 text-xs text-warn-ink">{summary.skipped} món đã chọn đang hết hàng hoặc chưa bán nên sẽ không được thêm.</p>
                )}
                <Button
                  fullWidth
                  size="lg"
                  className="mt-3"
                  icon={<LuPlus />}
                  onClick={addToCart}
                  aria-disabled={adding || summary.count === 0 || undefined}
                >
                  {adding ? "Đang thêm…" : `Thêm ${summary.count} nguyên liệu · ${formatVnd(summary.total)}`}
                </Button>
              </section>

              {(opened.detail.prep_steps.length > 0 || opened.detail.cooking_steps.length > 0) && (
                <section aria-labelledby="kitchen-steps" className="rounded-card border border-line bg-surface p-4 small:p-6">
                  <h3 id="kitchen-steps" className="font-mono text-xs uppercase tracking-wider text-ink-3">
                    Cách nấu · {opened.detail.prep_steps.length + opened.detail.cooking_steps.length} bước
                  </h3>
                  <ol className="mt-3 flex flex-col gap-3 text-sm">
                    {[...opened.detail.prep_steps, ...opened.detail.cooking_steps].map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warn font-mono text-xs font-bold">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          </div>

          <AskPanel key={opened.recipe.id} recipeId={opened.recipe.id} servings={servings} />
        </article>
      )}
    </div>
  )
}

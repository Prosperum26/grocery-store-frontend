"use client"

import type { KitchenResult } from "@lib/data/kitchen"
import { servingsLabel, type RawRecipeSearch } from "@lib/util/kitchen"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { LuChefHat, LuClock, LuSearch, LuUsers } from "react-icons/lu"

import { FailureNote } from "./failure"

const EXAMPLES = ["canh chua cá lóc", "gà kho gừng", "gỏi cuốn"]

/**
 * Search page of Trợ lý Bếp. The query lives in the address (?q=...): the
 * server page runs the search and passes the result here, so a result list
 * can be reloaded, shared, and reached again with the Back button.
 */
export default function KitchenSearch({
  query,
  result,
}: {
  /** The query the result below belongs to ("" before any search). */
  query: string
  result: KitchenResult<RawRecipeSearch> | null
}) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const router = useRouter()
  const [text, setText] = useState(query)
  const [searching, startSearch] = useTransition()

  // Back / Forward change the query in the address: show that query in the box.
  useEffect(() => setText(query), [query])

  const search = (value: string) => {
    const q = value.trim()
    if (!q) return
    setText(q)
    startSearch(() => router.push(`/${countryCode}/tro-ly-bep?q=${encodeURIComponent(q)}`))
  }

  const recipes = result?.ok ? result.data.results.map((r) => r.recipe) : []

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
            search(text)
          }}
        >
          <label htmlFor="kitchen-search" className="sr-only">
            Tên món ăn
          </label>
          <div className="relative flex-1">
            <LuSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="kitchen-search"
              value={text}
              maxLength={300}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tìm “canh chua cá lóc”, “gà kho gừng”…"
              className="h-12 w-full rounded-btn border border-line-2 bg-surface pl-10 pr-3"
            />
          </div>
          <Button type="submit" size="lg" aria-disabled={searching || !text.trim() || undefined}>
            {searching ? "Đang tìm…" : "Tìm món"}
          </Button>
        </form>

        {!result && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-2">Thử:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="touch-target rounded-full border border-line-2 px-3 py-1.5 hover:bg-page"
                onClick={() => search(example)}
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </header>

      {result && !result.ok && <FailureNote reason={result.reason} />}

      {result?.ok && (
        <section aria-labelledby="kitchen-results" className={"flex flex-col gap-3 " + (searching ? "opacity-60" : "")}>
          <h2 id="kitchen-results" className="font-display text-xl font-bold">
            {recipes.length === 0
              ? `Chưa có món nào cho “${query}”`
              : result.data.accepted
                ? `Món phù hợp với “${query}”`
                : `Chưa có món đúng ý “${query}”. Bạn xem thử các món gần nhất`}
          </h2>
          {recipes.length === 0 ? (
            <p className="text-ink-2">Bạn thử gõ tên món khác nhé.</p>
          ) : (
            <ul className="grid gap-3 small:grid-cols-2">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <LocalizedClientLink
                    href={`/tro-ly-bep/${encodeURIComponent(recipe.id)}?q=${encodeURIComponent(query)}`}
                    className="flex h-full flex-col gap-1 rounded-2xl border border-line bg-surface p-4 hover:border-brand hover:bg-brand-bg"
                  >
                    <span className="font-semibold">{recipe.name}</span>
                    <span className="flex flex-wrap gap-x-3 text-xs text-ink-2">
                      <span className="inline-flex items-center gap-1">
                        <LuUsers aria-hidden="true" size={12} />
                        {servingsLabel(recipe.servings)}
                      </span>
                      {recipe.time_minutes ? (
                        <span className="inline-flex items-center gap-1">
                          <LuClock aria-hidden="true" size={12} />
                          {recipe.time_minutes} phút
                        </span>
                      ) : null}
                    </span>
                    {recipe.description && <span className="line-clamp-2 text-sm text-ink-2">{recipe.description}</span>}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

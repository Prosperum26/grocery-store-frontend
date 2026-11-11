"use client"

import { useParams, usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { LuChefHat, LuSearch } from "react-icons/lu"

import { suggest, type SearchSuggestions } from "@lib/data/suggest"
import { cx } from "@lib/util/cx"
import { formatVnd } from "@lib/util/price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"
import AddButton from "@modules/products/components/product-card/add-button"

/** Wait this long after the last keystroke before asking, so typing a word is one request. */
const DEBOUNCE_MS = 250
const MIN_CHARS = 2

/**
 * Search box of the header. It is a plain GET form to /store?q=..., so Enter
 * works without JavaScript and the results page owns the filtering (FE-6).
 *
 * With JavaScript, typing opens a panel of suggestions: products (with a buy
 * control, so a known item is in the cart without leaving the page) and
 * dishes from Trợ lý Bếp. The panel holds ordinary links and buttons, so Tab
 * walks through it; Esc or a click outside closes it.
 */
export default function HeaderSearch({ className }: { className?: string }) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()
  // The header renders this component twice (desktop and phone), so ids must be unique per instance.
  const inputId = useId()
  const panelId = useId()
  const boxRef = useRef<HTMLDivElement>(null)

  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [found, setFound] = useState<SearchSuggestions | null>(null)

  const query = text.trim()

  // Ask after a pause in typing. `stale` drops an answer that arrives after a newer keystroke.
  useEffect(() => {
    if (query.length < MIN_CHARS) {
      setFound(null)
      setLoading(false)
      return
    }
    let stale = false
    setLoading(true)
    const timer = setTimeout(() => {
      suggest(countryCode, query)
        .then((result) => {
          if (!stale) setFound(result)
        })
        .catch(() => {
          if (!stale) setFound({ products: [], recipes: [] })
        })
        .finally(() => {
          if (!stale) setLoading(false)
        })
    }, DEBOUNCE_MS)
    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [query, countryCode])

  // Going to another page (a suggestion was followed) closes the panel.
  useEffect(() => setOpen(false), [pathname])

  // Click or focus outside the box closes the panel, and so does Esc wherever the focus is: after "+"
  // in the panel the pressed button is replaced by the stepper, which leaves the focus on the page body.
  useEffect(() => {
    if (!open) return
    const onOutside = (event: MouseEvent | FocusEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    document.addEventListener("focusin", onOutside)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onOutside)
      document.removeEventListener("focusin", onOutside)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const showPanel = open && query.length >= MIN_CHARS
  const empty = found && found.products.length === 0 && found.recipes.length === 0
  const encoded = encodeURIComponent(query)

  return (
    <div ref={boxRef} className={cx("relative", className)}>
      <form
        role="search"
        action={`/${countryCode}/store`}
        method="get"
        className="flex h-12 min-w-0 items-center gap-2.5 rounded-[14px] border border-line-2 bg-page pl-4 pr-3 focus-within:border-ink"
      >
        <label htmlFor={inputId} className="sr-only">
          Tìm sản phẩm hoặc món ăn
        </label>
        <LuSearch size={20} aria-hidden="true" className="shrink-0 text-ink-2" />
        <input
          id={inputId}
          name="q"
          type="search"
          autoComplete="off"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          aria-expanded={showPanel}
          aria-controls={panelId}
          placeholder="Tìm sản phẩm hoặc món ăn…"
          className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none"
        />
      </form>

      {showPanel && (
        <div
          id={panelId}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-lg"
        >
          {/* Screen readers hear the outcome of the search without moving focus. */}
          <p aria-live="polite" className="sr-only">
            {loading && !found
              ? "Đang tìm"
              : found
                ? `${found.products.length} sản phẩm, ${found.recipes.length} món ăn`
                : ""}
          </p>

          {loading && !found && <p className="px-3 py-2 text-sm text-ink-2">Đang tìm…</p>}

          {found && found.products.length > 0 && (
            <section aria-label="Sản phẩm">
              <h2 className="px-3 pb-1 pt-2 text-xs font-semibold text-ink-2">Sản phẩm</h2>
              <ul>
                {found.products.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-page">
                    <LocalizedClientLink href={`/products/${product.handle}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line">
                        <ProductArt product={product} decorative dots={false} fit="contain" sizes="48px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{product.title}</span>
                        <span className="block truncate text-xs text-ink-2">{product.unitLabel}</span>
                      </span>
                      <span className="shrink-0 font-mono text-sm font-bold">{formatVnd(product.price)}</span>
                    </LocalizedClientLink>
                    <AddButton product={product} inStock={product.stockQty > 0} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {found && found.recipes.length > 0 && (
            <section aria-label="Món ăn" className={found.products.length > 0 ? "mt-1 border-t border-line pt-1" : undefined}>
              <h2 className="px-3 pb-1 pt-2 text-xs font-semibold text-ink-2">Món ăn và nguyên liệu</h2>
              <ul>
                {found.recipes.map((recipe) => (
                  <li key={recipe.id}>
                    <LocalizedClientLink
                      href={`/tro-ly-bep/${encodeURIComponent(recipe.id)}?q=${encoded}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-ink hover:bg-page"
                    >
                      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                        <LuChefHat size={16} />
                      </span>
                      {recipe.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {empty && <p className="px-3 py-2 text-sm text-ink-2">Chưa thấy sản phẩm hay món nào cho “{query}”.</p>}

          {found && (
            <div className="mt-1 flex flex-wrap gap-2 border-t border-line px-2 pb-1 pt-2.5">
              <LocalizedClientLink
                href={`/store?q=${encoded}`}
                className="rounded-full border border-line-2 px-3 py-1.5 text-sm font-semibold hover:bg-page"
              >
                Xem tất cả sản phẩm “{query}”
              </LocalizedClientLink>
              <LocalizedClientLink
                href={`/tro-ly-bep?q=${encoded}`}
                className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent-ink hover:bg-accent"
              >
                Tìm món với “{query}”
              </LocalizedClientLink>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

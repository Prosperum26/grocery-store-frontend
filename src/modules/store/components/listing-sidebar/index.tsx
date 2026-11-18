"use client"

import { useId, useState } from "react"
import { LuSearch, LuX } from "react-icons/lu"

import { hasListingFilters, ListingParams, PRICE_PRESETS } from "@lib/util/catalog"
import { cx } from "@lib/util/cx"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Toggle from "@modules/common/components/toggle"
import { SortSelect, useListingNavigate } from "@modules/store/components/listing-controls"

export type SidebarCategory = { handle: string; name: string; count?: number }

type ListingSidebarProps = {
  params: ListingParams
  /** Path of the list without filters, for "Xóa bộ lọc". */
  basePath: string
  categories: SidebarCategory[]
  /** Handle of the category being listed; undefined on /store. */
  currentCategory?: string
  totalAll: number
  subcategories: { value: string; count: number }[]
  /** Phrases common in the listed product names, offered as extra keywords. */
  related: string[]
}

/**
 * Filters of the product list, top to bottom in the order a shopper narrows
 * down: where (category, then the kind inside it), how much (price), what
 * state (in stock, on sale), then free words. Every control only changes the
 * URL (see useListingNavigate), so back/forward and shared links keep the filters.
 *
 * Rendered in the left column on desktop and inside the "Bộ lọc" panel on
 * phones, so ids come from useId.
 */
export default function ListingSidebar({
  params,
  basePath,
  categories,
  currentCategory,
  totalAll,
  subcategories,
  related,
}: ListingSidebarProps) {
  const navigate = useListingNavigate(params)

  return (
    <div className="flex flex-col gap-6">
      <SortSelect params={params} />

      <Section title="Danh mục">
        <ul className="flex flex-col">
          <li>
            <CategoryLink href="/store" active={!currentCategory} name="Tất cả sản phẩm" count={totalAll} />
          </li>
          {categories.map((c) => (
            <li key={c.handle}>
              <CategoryLink href={`/categories/${c.handle}`} active={currentCategory === c.handle} name={c.name} count={c.count} />
            </li>
          ))}
        </ul>
      </Section>

      {subcategories.length > 1 && (
        <Section title="Loại">
          <div className="flex flex-wrap gap-2">
            <Pill pressed={!params.sub} onClick={() => navigate({ sub: undefined })}>
              Tất cả
            </Pill>
            {subcategories.map((s) => (
              <Pill key={s.value} pressed={params.sub === s.value} onClick={() => navigate({ sub: params.sub === s.value ? undefined : s.value })}>
                {s.value} <span className="opacity-60">{s.count}</span>
              </Pill>
            ))}
          </div>
        </Section>
      )}

      <Section title="Mức giá">
        {/* Keyed by the URL value: back/forward or "Xóa bộ lọc" resets what the boxes show. */}
        <PriceFilter key={`${params.minPrice}-${params.maxPrice}`} params={params} />
      </Section>

      <Section title="Tình trạng">
        <div className="flex flex-col gap-3">
          <Toggle label="Chỉ hiện còn hàng" checked={params.inStock} onChange={(next) => navigate({ inStock: next })} />
          <Toggle label="Đang giảm giá" checked={params.onSale} onChange={(next) => navigate({ onSale: next })} />
        </div>
      </Section>

      <Section title={currentCategory ? "Lọc thêm theo từ khóa" : "Từ khóa"}>
        <KeywordFilter key={params.q ?? ""} params={params} related={related} />
      </Section>

      {hasListingFilters(params) && (
        <LocalizedClientLink
          href={basePath}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-btn border border-line-2 text-sm font-semibold text-ink hover:bg-page"
        >
          <LuX aria-hidden="true" />
          Xóa tất cả bộ lọc
        </LocalizedClientLink>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5">
      <h2 id={id} className="text-xs font-bold uppercase tracking-wide text-ink-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

function CategoryLink({ href, active, name, count }: { href: string; active: boolean; name: string; count?: number }) {
  return (
    <LocalizedClientLink
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex h-9 items-center justify-between gap-2 rounded-[10px] px-2.5 text-sm",
        active ? "bg-brand-bg font-semibold text-brand-deep" : "text-ink hover:bg-page"
      )}
    >
      <span className="truncate">{name}</span>
      {count !== undefined && <span className="shrink-0 text-xs text-ink-3">{count}</span>}
    </LocalizedClientLink>
  )
}

function Pill({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-8 items-center gap-1 rounded-full px-3 py-1 text-left text-sm font-medium",
        pressed ? "bg-ink text-white" : "border border-line-2 bg-surface text-ink hover:bg-page"
      )}
    >
      {children}
    </button>
  )
}

/** "20.000", "20000" or "20k" typed by the shopper, as đồng. Empty or unreadable gives undefined. */
function readAmount(text: string): number | undefined {
  const t = text.trim().toLowerCase()
  if (!t) return undefined
  const thousands = t.endsWith("k")
  const n = Number.parseInt(t.replace(/[^\d]/g, ""), 10)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return thousands ? n * 1000 : n
}

const grouped = (n?: number) => (n ? n.toLocaleString("vi-VN") : "")

function PriceFilter({ params }: { params: ListingParams }) {
  const navigate = useListingNavigate(params)
  const id = useId()
  // The boxes show what the URL says; typing only changes them until "Áp dụng".
  const [from, setFrom] = useState(grouped(params.minPrice))
  const [to, setTo] = useState(grouped(params.maxPrice))

  const isPreset = (p: (typeof PRICE_PRESETS)[number]) => p.min === params.minPrice && p.max === params.maxPrice

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((p) => {
          const on = isPreset(p)
          return (
            <Pill
              key={p.label}
              pressed={on}
              onClick={() => {
                const next = on ? { minPrice: undefined, maxPrice: undefined } : { minPrice: p.min, maxPrice: p.max }
                setFrom(grouped(next.minPrice))
                setTo(grouped(next.maxPrice))
                navigate(next)
              }}
            >
              {p.label}
            </Pill>
          )
        })}
      </div>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ minPrice: readAmount(from), maxPrice: readAmount(to) })
        }}
      >
        <label htmlFor={`${id}-from`} className="sr-only">
          Giá từ (đồng)
        </label>
        <input
          id={`${id}-from`}
          inputMode="numeric"
          placeholder="Từ"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-10 w-full min-w-0 rounded-btn border border-line-2 bg-surface px-3 text-sm"
        />
        <span aria-hidden="true" className="text-ink-3">
          –
        </span>
        <label htmlFor={`${id}-to`} className="sr-only">
          Giá đến (đồng)
        </label>
        <input
          id={`${id}-to`}
          inputMode="numeric"
          placeholder="Đến"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-10 w-full min-w-0 rounded-btn border border-line-2 bg-surface px-3 text-sm"
        />
        <button type="submit" className="h-10 shrink-0 rounded-btn bg-ink px-3 text-sm font-semibold text-white hover:brightness-125">
          Áp dụng
        </button>
      </form>
    </div>
  )
}

function KeywordFilter({ params, related }: { params: ListingParams; related: string[] }) {
  const navigate = useListingNavigate(params)
  const id = useId()
  const [text, setText] = useState(params.q ?? "")

  // A related phrase is added to what is already typed: "rau" + "hữu cơ" narrows, it does not replace.
  const addWord = (word: string) => {
    const next = [params.q, word].filter(Boolean).join(" ")
    setText(next)
    navigate({ q: next })
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        role="search"
        className="flex h-10 items-center gap-2 rounded-btn border border-line-2 bg-surface pl-3 pr-1 focus-within:border-ink"
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ q: text.trim() || undefined })
        }}
      >
        <label htmlFor={id} className="sr-only">
          Lọc theo từ khóa
        </label>
        <LuSearch aria-hidden="true" className="shrink-0 text-ink-3" />
        <input
          id={id}
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="vd: hữu cơ, Đà Lạt"
          className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
        />
        <button type="submit" className="h-8 shrink-0 rounded-[8px] px-2.5 text-sm font-semibold text-brand-deep hover:bg-page">
          Lọc
        </button>
      </form>
      {related.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {related.map((word) => (
            <Pill key={word} pressed={false} onClick={() => addWord(word)}>
              + {word}
            </Pill>
          ))}
        </div>
      )}
    </div>
  )
}

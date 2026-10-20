"use client"

import { cx } from "@lib/util/cx"
import { useId, useRef, useState, type KeyboardEvent } from "react"

/**
 * Nutrition values of the design's "mock layout". They are not measured data
 * for any product, so the panel says so next to the table.
 */
const ILLUSTRATIVE_NUTRITION: [string, string][] = [
  ["Năng lượng", "95 kcal"],
  ["Chất đạm", "18 g"],
  ["Chất béo", "2,5 g"],
  ["Carbohydrate", "0,5 g"],
  ["Natri", "70 mg"],
]

type TabKey = "description" | "storage" | "nutrition"

const TABS: { key: TabKey; label: string }[] = [
  { key: "description", label: "Mô tả" },
  { key: "storage", label: "Bảo quản" },
  { key: "nutrition", label: "Dinh dưỡng" },
]

/** Tabs with the ARIA tab pattern: arrow keys move, Tab leaves the list. */
export default function ProductTabs({
  description,
  storage,
}: {
  description?: string
  storage?: string
}) {
  const [active, setActive] = useState<TabKey>("description")
  const baseId = useId()
  const buttons = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({})

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = TABS[(index + step + TABS.length) % TABS.length]
    setActive(next.key)
    buttons.current[next.key]?.focus()
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Thông tin sản phẩm" className="flex gap-6 border-b border-line">
        {TABS.map((tab, i) => {
          const selected = active === tab.key
          return (
            <button
              key={tab.key}
              ref={(el) => {
                buttons.current[tab.key] = el
              }}
              id={`${baseId}-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cx(
                "touch-target relative -mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
                selected ? "border-brand text-brand" : "border-transparent text-ink-2 hover:text-ink"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.key}
          id={`${baseId}-panel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={active !== tab.key}
          tabIndex={0}
          className="text-sm leading-relaxed text-ink-2"
        >
          {tab.key === "description" && <p>{description ?? "Sản phẩm đang được cập nhật mô tả."}</p>}
          {tab.key === "storage" && <p>{storage ?? "Thông tin bảo quản đang được cập nhật."}</p>}
          {tab.key === "nutrition" && (
            <div className="flex flex-col gap-3">
              <p className="rounded-btn bg-warn-bg px-3 py-2 text-xs text-warn-ink">
                Số liệu minh họa theo bố cục thiết kế, chưa phải thông tin dinh dưỡng đã kiểm định.
              </p>
              <p className="font-semibold text-ink">Trên 100 g</p>
              <dl className="max-w-md divide-y divide-line rounded-btn border border-line bg-surface">
                {ILLUSTRATIVE_NUTRITION.map(([label, value]) => (
                  <div key={label} className="flex justify-between px-4 py-2.5">
                    <dt>{label}</dt>
                    <dd className="font-mono font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

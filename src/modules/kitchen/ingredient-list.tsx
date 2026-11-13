"use client"

import {
  canBuy,
  chosenOption,
  quantityOf,
  type KitchenLine,
  type Selection,
} from "@lib/util/kitchen"
import { formatVnd } from "@lib/util/price"
import { cx } from "@lib/util/cx"
import { useState } from "react"
import { LuCheck, LuChevronDown } from "react-icons/lu"

/**
 * Ingredient list of screen 11 (Công thức vào giỏ): a tick per line, the
 * product the store picked, "Đổi hãng" to choose another one, and "Nhà bạn đã
 * có" on lines the customer probably has at home.
 */
export default function IngredientList({
  lines,
  selection,
  onTick,
  onChoose,
}: {
  lines: KitchenLine[]
  selection: Selection
  onTick: (key: string, ticked: boolean) => void
  onChoose: (key: string, catalogId: string) => void
}) {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => {
        const option = chosenOption(line, selection)
        const buyable = canBuy(option)
        const ticked = !!selection.ticked[line.key]
        const quantity = quantityOf(line, option)
        // Product ids are safe in an HTML id; ingredient names (spaces, commas) are not.
        const inputId = `kitchen-line-${line.options[0].catalogId}`
        const picking = openKey === line.key

        return (
          <li key={line.key} className="py-2.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <input
                id={inputId}
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-brand"
                checked={ticked}
                disabled={!buyable}
                onChange={(e) => onTick(line.key, e.target.checked)}
              />
              <label htmlFor={inputId} className="min-w-0 flex-1 basis-40">
                <span className={cx("block text-[15px] font-semibold leading-5", ticked ? "text-ink" : "text-ink-2")}>
                  {line.label}
                  {line.needLabel && <span className="text-sm font-normal text-ink-2"> · {line.needLabel}</span>}
                </span>
                {line.maybeHave && (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-page-2 px-1.5 py-0.5 text-xs text-ink-2">
                    <LuCheck aria-hidden="true" size={12} />
                    Nhà bạn đã có
                  </span>
                )}
                {line.derived && <span className="mt-0.5 block text-xs text-ink-3">Tự làm từ sản phẩm này</span>}
              </label>

              <div className="min-w-0 flex-1 basis-48 text-sm">
                <p className="font-semibold">{option.variant?.title ?? option.name}</p>
                <p className="text-xs text-ink-3">
                  {!option.variant
                    ? "Cửa hàng chưa bán"
                    : !option.variant.purchasable
                      ? "Hết hàng"
                      : `${option.variant.unit_label}${quantity > 1 ? ` · ×${quantity}` : ""}`}
                </p>
              </div>

              {line.options.length > 1 && (
                <button
                  type="button"
                  className="touch-target relative inline-flex h-8 items-center gap-1 rounded-full border border-line-2 px-3 text-xs font-semibold hover:bg-page"
                  aria-expanded={picking}
                  aria-controls={`${inputId}-brands`}
                  onClick={() => setOpenKey(picking ? null : line.key)}
                >
                  Đổi hãng
                  <LuChevronDown aria-hidden="true" size={14} className={picking ? "rotate-180" : ""} />
                </button>
              )}

              <p className={cx("w-24 text-right font-mono text-sm font-bold", !ticked && "text-ink-3")}>
                {option.variant && buyable ? formatVnd(option.variant.unit_price * quantity) : "—"}
              </p>
            </div>

            {picking && (
              <fieldset id={`${inputId}-brands`} className="mt-3 rounded-2xl border border-line-2 p-2">
                <legend className="px-2 font-mono text-xs uppercase tracking-wider text-ink-3">Chọn hãng</legend>
                {line.options.map((o) => {
                  const checked = o.catalogId === option.catalogId
                  return (
                    <label
                      key={o.catalogId}
                      className={cx(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm",
                        checked && "bg-brand-bg",
                        !canBuy(o) && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <input
                        type="radio"
                        name={`${inputId}-brand`}
                        className="h-4 w-4 accent-brand"
                        checked={checked}
                        disabled={!canBuy(o)}
                        onChange={() => {
                          onChoose(line.key, o.catalogId)
                          setOpenKey(null)
                        }}
                      />
                      <span className="flex-1">
                        <span className="block font-semibold">{o.variant?.title ?? o.name}</span>
                        <span className="block text-xs text-ink-3">
                          {o.variant ? (o.variant.purchasable ? o.variant.unit_label : "Hết hàng") : "Cửa hàng chưa bán"}
                        </span>
                      </span>
                      {o.variant && <span className="font-mono text-xs font-bold">{formatVnd(o.variant.unit_price)}</span>}
                    </label>
                  )
                })}
              </fieldset>
            )}
          </li>
        )
      })}
    </ul>
  )
}

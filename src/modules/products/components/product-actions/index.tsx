"use client"

import { useLiveStock } from "@lib/hooks/use-live-stock"
import { resolveVariant } from "@lib/mock/cart"
import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import { isMockMode } from "@lib/mock/mode"
import { cx } from "@lib/util/cx"
import { formatVnd, pricePerKg, salePercent } from "@lib/util/price"
import Button from "@modules/common/components/button"
import LiveStock from "@modules/common/components/live-stock"
import PriceTag from "@modules/common/components/price-tag"
import Stepper from "@modules/common/components/stepper"
import { useRef, useState, type KeyboardEvent } from "react"
import { LuShoppingBag } from "react-icons/lu"
import type { ProductVM } from "types/viewmodels"

/**
 * Pack sizes, preparation and the add-to-cart row of the product page
 * (03_Chi_Tiet_San_Pham). On phones the row floats above the bottom nav.
 * The chosen preparation is shown only; the cart does not store it yet.
 */
export default function ProductActions({ product }: { product: ProductVM }) {
  const { add, remove, setQuantity } = useCart()
  const { show } = useToast()

  const defaultVariant = resolveVariant(product)
  const [packLabel, setPackLabel] = useState(defaultVariant?.label ?? "")
  const [prep, setPrep] = useState(product.prepOptions?.[0])
  const [quantity, setQty] = useState(1)
  const radios = useRef<(HTMLButtonElement | null)[]>([])

  // Stock net of other customers' holds, kept current over Socket.io; the
  // rendered number until it arrives (or when the gateway is down).
  const live = useLiveStock(product.variants.map((v) => v.id))
  const stockOf = (v: { id: string; stockQty: number }) => live[v.id]?.available ?? v.stockQty

  const variant = resolveVariant(product, packLabel)
  const stock = variant ? stockOf(variant) : 0
  const soldOut = stock <= 0
  const qty = Math.min(quantity, Math.max(stock, 1))
  const percent = variant ? salePercent(variant.originalPrice, variant.price) : null
  const perKg = variant ? pricePerKg(variant.price, variant.weightGrams) : null

  // Arrow keys move the selection among the pack sizes that can be bought,
  // as in any radio group.
  const onPackKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0
    if (!step) return
    e.preventDefault()
    const n = product.variants.length
    for (let i = 1; i <= n; i++) {
      const next = (((index + step * i) % n) + n) % n
      if (stockOf(product.variants[next]) > 0) {
        setPackLabel(product.variants[next].label)
        radios.current[next]?.focus()
        return
      }
    }
  }

  const onAdd = async () => {
    if (!variant || soldOut) return
    const result = await add(product, { variant: variant.label, quantity: qty })
    if (!result.ok) {
      show({ tone: "warn", title: "Số lượng vượt quá tồn kho" })
      return
    }
    show({
      tone: "ok",
      title: `Đã thêm ${qty} × ${product.title} (${variant.label})`,
      description: isMockMode()
        ? "Giỏ hàng được lưu trong phiên này."
        : "Giỏ hàng được lưu trên trình duyệt này.",
      action: {
        label: "Hoàn tác",
        onAction: () => {
          if (result.before === 0) remove(result.key)
          else setQuantity(result.key, result.before)
        },
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {product.prepOptions && product.prepOptions.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold text-ink">Cách sơ chế</legend>
          <div className="flex flex-wrap gap-2">
            {product.prepOptions.map((option) => {
              const on = prep === option
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPrep(option)}
                  className={cx(
                    "touch-target relative inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-colors",
                    on ? "border-ink bg-ink text-white" : "border-line-2 bg-surface text-ink hover:bg-page"
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {/* Pack sizes: a radio group. Sold-out packs stay visible but cannot be chosen. */}
      <div role="radiogroup" aria-label="Quy cách" className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-ink">Quy cách</p>
        <div className="grid grid-cols-2 gap-2.5 small:grid-cols-3">
          {product.variants.map((v, i) => {
            const checked = v.label === variant?.label
            const out = stockOf(v) <= 0
            return (
              <button
                key={v.id}
                ref={(el) => {
                  radios.current[i] = el
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-disabled={out || undefined}
                tabIndex={checked && !out ? 0 : -1}
                onKeyDown={(e) => onPackKeyDown(e, i)}
                onClick={() => {
                  if (!out) setPackLabel(v.label)
                }}
                className={cx(
                  "flex flex-col items-start gap-0.5 rounded-btn border-[1.5px] px-3.5 py-2.5 text-left transition-colors",
                  checked ? "border-brand bg-brand-bg" : "border-line-2 bg-surface",
                  out && "cursor-not-allowed opacity-45"
                )}
              >
                <span className={cx("text-sm font-semibold", checked ? "text-brand" : "text-ink")}>{v.label}</span>
                <span className="font-mono text-xs text-ink-2">{out ? "Hết hàng" : formatVnd(v.price)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <PriceTag price={variant?.price ?? 0} unit={variant?.label} sale={Boolean(percent)} large />
          {variant?.originalPrice && variant.originalPrice > variant.price && (
            <span className="font-mono text-sm text-ink-3 line-through">
              <span className="sr-only">Giá cũ </span>
              {formatVnd(variant.originalPrice)}
            </span>
          )}
          {percent && (
            <span className="rounded-chip bg-sale-bg px-2 py-0.5 text-xs font-bold text-sale-deep">
              Giảm {percent}%
            </span>
          )}
          {variant && <LiveStock qty={stock} lowStock={product.lowStock} unit={product.stockUnit} />}
        </div>
        {perKg && <p className="font-mono text-xs text-ink-2">tương đương {formatVnd(perKg)}/kg</p>}
      </div>

      <div className="fixed inset-x-4 bottom-24 z-30 flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-toast small:static small:z-auto small:border-0 small:bg-transparent small:p-0 small:shadow-none">
        <Stepper
          value={qty}
          min={1}
          max={Math.max(stock, 1)}
          label={`Số lượng ${product.title}`}
          onChange={setQty}
          className={soldOut ? "pointer-events-none opacity-40" : undefined}
        />
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<LuShoppingBag />}
          aria-disabled={soldOut || undefined}
          onClick={soldOut ? undefined : onAdd}
          data-testid="add-to-cart-button"
          className="min-w-0 flex-1"
        >
          {soldOut ? (
            "Hết hàng"
          ) : (
            <>
              <span className="small:hidden">Thêm · </span>
              <span className="hidden small:inline">Thêm vào giỏ · </span>
              {formatVnd((variant?.price ?? 0) * qty)}
            </>
          )}
        </Button>
      </div>
      {soldOut && <p className="text-sm text-sale-deep">Quy cách này đang hết hàng. Hãy chọn quy cách khác.</p>}
    </div>
  )
}

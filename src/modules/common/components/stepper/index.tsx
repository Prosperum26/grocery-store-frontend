"use client"

import { clx } from "@medusajs/ui"
import { LuMinus, LuPlus, LuTrash2 } from "react-icons/lu"

/**
 * Quantity stepper (stepper() in ui.js). Controlled: the parent owns the
 * value. With `removeAtMin`, the minus button turns into a trash icon at 1 and
 * calls onRemove. `label` names what is counted, for screen readers.
 */
export default function Stepper({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  label,
  removeAtMin,
  onRemove,
  className,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  size?: "sm" | "md"
  label: string
  removeAtMin?: boolean
  onRemove?: () => void
  className?: string
}) {
  const atMin = value <= min
  const atMax = max !== undefined && value >= max
  const showTrash = removeAtMin && atMin
  const box = size === "sm" ? "h-8 w-8" : "h-10 w-10"
  const iconSize = size === "sm" ? 14 : 17

  return (
    <div
      role="group"
      aria-label={`Số lượng ${label}`}
      className={clx(
        "inline-flex w-fit items-center rounded-full border border-line-2 bg-surface",
        className
      )}
    >
      <button
        type="button"
        className={clx(box, "touch-target relative flex items-center justify-center rounded-full disabled:opacity-35")}
        disabled={atMin && !showTrash}
        aria-label={showTrash ? `Xóa ${label} khỏi giỏ` : `Giảm số lượng ${label}`}
        onClick={() => (showTrash ? onRemove?.() : onChange(value - 1))}
      >
        {showTrash ? (
          <LuTrash2 size={iconSize} aria-hidden="true" />
        ) : (
          <LuMinus size={iconSize} aria-hidden="true" />
        )}
      </button>
      <span
        className={clx(
          "text-center font-mono font-bold",
          size === "sm" ? "w-6 text-sm" : "w-8 text-base"
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={clx(box, "touch-target relative flex items-center justify-center rounded-full disabled:opacity-35")}
        disabled={atMax}
        aria-label={`Tăng số lượng ${label}`}
        onClick={() => onChange(value + 1)}
      >
        <LuPlus size={iconSize} aria-hidden="true" />
      </button>
    </div>
  )
}

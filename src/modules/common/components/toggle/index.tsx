"use client"

import { clx } from "@medusajs/ui"

/**
 * On/off switch (toggle() in ui.js). A real button with role="switch", so
 * Space/Enter toggle it and screen readers announce "bật/tắt". The visible
 * label is part of the button, so clicking the text works too.
 */
export default function Toggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clx(
        "flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-ink",
        className
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={clx(
          "relative h-[26px] w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-line-2"
        )}
      >
        <span
          className={clx(
            "absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-[left]",
            checked ? "left-[21px]" : "left-[3px]"
          )}
        />
      </span>
    </button>
  )
}

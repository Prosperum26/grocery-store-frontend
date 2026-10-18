"use client"

import { clx } from "@medusajs/ui"
import React, { useId } from "react"
import type { IconType } from "react-icons"
import { LuTriangleAlert } from "react-icons/lu"

/**
 * Text input of the v2 design (field() in ui.js). Always has a visible
 * <label>; helper and error text are linked with aria-describedby, and an
 * error also sets aria-invalid.
 */
export default function Field({
  label,
  icon: Icon,
  error,
  helper,
  suffix,
  mono,
  className,
  id,
  ...input
}: {
  label: string
  icon?: IconType
  error?: string
  helper?: string
  suffix?: React.ReactNode
  mono?: boolean
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId()
  const inputId = id ?? autoId
  const noteId = `${inputId}-note`
  const note = error ?? helper

  return (
    <div className={clx("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={clx(
          "flex h-12 items-center gap-2.5 rounded-btn border bg-surface px-3.5",
          "focus-within:border-ink focus-within:ring-4 focus-within:ring-warn-bg",
          error ? "border-[1.5px] border-sale" : "border-line-2"
        )}
      >
        {Icon && <Icon size={18} aria-hidden="true" className="text-ink-3" />}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          className={clx(
            "min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none",
            mono && "font-mono text-sm"
          )}
          {...input}
        />
        {suffix}
      </div>
      {note && (
        <p
          id={noteId}
          className={clx(
            "flex items-start gap-1.5 text-xs",
            error ? "text-sale-deep" : "text-ink-2"
          )}
        >
          {error && <LuTriangleAlert size={14} aria-hidden="true" className="mt-px text-sale" />}
          {note}
        </p>
      )}
    </div>
  )
}

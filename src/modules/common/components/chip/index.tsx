import { cx as clx } from "@lib/util/cx"
import React from "react"
import type { IconType } from "react-icons"

// Label chip of the v2 design (chip() in ui.js): square-ish corners, a bold
// border in the same hue and a solid 2px offset shadow like a sticker.
// Neutral chips are flat.
export type ChipTone =
  | "neutral"
  | "brand"
  | "brandSolid"
  | "accent"
  | "sale"
  | "saleSolid"
  | "warn"
  | "warnSolid"
  | "sky"
  | "plum"
  | "dark"
  | "outline"

const TONES: Record<ChipTone, string> = {
  neutral: "bg-page-2 text-ink-2",
  brand: "bg-brand-bg text-brand-deep border-brand shadow-brand",
  brandSolid: "bg-brand text-white border-brand-deep shadow-brand-deep",
  accent: "bg-accent text-ink border-accent-ink shadow-accent-ink",
  sale: "bg-sale-bg text-sale-deep border-sale shadow-sale",
  saleSolid: "bg-sale text-white border-sale-deep shadow-sale-deep",
  warn: "bg-warn-bg text-warn-ink border-warn shadow-warn",
  warnSolid: "bg-warn text-ink border-ink shadow-ink",
  sky: "bg-sky-bg text-sky border-sky shadow-sky",
  plum: "bg-plum-bg text-plum border-plum shadow-plum",
  dark: "bg-ink text-white border-ink shadow-ink",
  outline: "bg-surface text-ink border-ink shadow-ink",
}

export type ChipProps = {
  tone?: ChipTone
  icon?: IconType
  /** Prices, codes and counts use the mono font. */
  mono?: boolean
  /** No border or shadow, even for coloured tones. */
  flat?: boolean
  size?: "sm" | "md"
  className?: string
  children: React.ReactNode
}

export default function Chip({
  tone = "neutral",
  icon: Icon,
  mono,
  flat,
  size = "md",
  className,
  children,
}: ChipProps) {
  const stuck = !flat && tone !== "neutral"
  return (
    <span
      className={clx(
        "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-chip font-semibold",
        size === "sm" ? "h-[22px] px-2 text-[11px]" : "h-[26px] px-2.5 text-xs",
        mono && "font-mono",
        TONES[tone],
        stuck ? "border-[1.2px] shadow-sticker" : "border-0 shadow-none",
        className
      )}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  )
}

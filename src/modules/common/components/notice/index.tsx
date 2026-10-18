import { cx as clx } from "@lib/util/cx"
import type { IconType } from "react-icons"
import {
  LuChefHat,
  LuCircleCheck,
  LuInfo,
  LuTriangleAlert,
} from "react-icons/lu"

// Shared look of toasts and banners in the v2 design (toast(), banner() and
// noteIcon() in ui.js): a tilted icon tile coloured by tone.
export type NoticeTone = "ok" | "warn" | "err" | "info" | "tip"

const ICON: Record<NoticeTone, { icon: IconType; tile: string }> = {
  ok: { icon: LuCircleCheck, tile: "bg-brand text-white" },
  warn: { icon: LuTriangleAlert, tile: "bg-warn text-ink" },
  err: { icon: LuTriangleAlert, tile: "bg-sale text-white" },
  info: { icon: LuInfo, tile: "bg-sky text-white" },
  tip: { icon: LuChefHat, tile: "bg-accent text-ink" },
}

export function NoticeIcon({
  tone,
  size = 30,
}: {
  tone: NoticeTone
  size?: number
}) {
  const { icon: Icon, tile } = ICON[tone]
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={clx(
        "inline-flex shrink-0 -rotate-6 items-center justify-center rounded-lg",
        tile
      )}
    >
      <Icon size={Math.round(size * 0.56)} strokeWidth={2.2} />
    </span>
  )
}

// Toast: white card, ink border, solid 4px shadow in the tone colour.
const TOAST_SHADOW: Record<NoticeTone, string> = {
  ok: "shadow-brand",
  warn: "shadow-warn",
  err: "shadow-sale",
  info: "shadow-sky",
  tip: "shadow-accent-ink",
}

export function Toast({
  tone = "ok",
  title,
  description,
  action,
  className,
}: {
  tone?: NoticeTone
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={clx(
        "flex items-center gap-3 rounded-btn border-[1.5px] border-ink bg-surface px-3.5 py-3 shadow-toast",
        TOAST_SHADOW[tone],
        className
      )}
    >
      <NoticeIcon tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description && <p className="text-xs text-ink-2">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// Banner: pale fill and a thick left edge, like the spine of a notebook.
const BANNER: Record<Exclude<NoticeTone, "ok">, string> = {
  warn: "bg-warn-bg border-warn text-warn-ink",
  err: "bg-sale-bg border-sale text-sale-deep",
  info: "bg-sky-bg border-sky text-sky",
  tip: "bg-accent-soft border-accent-ink text-accent-ink",
}

export function Banner({
  tone = "warn",
  title,
  description,
  action,
  role,
  className,
}: {
  tone?: Exclude<NoticeTone, "ok">
  title: string
  description?: string
  action?: React.ReactNode
  /** "alert" for errors that appear after an action; omit for static notes. */
  role?: "alert" | "status"
  className?: string
}) {
  return (
    <div
      role={role}
      className={clx(
        "flex items-center gap-3 rounded-btn border-[1.2px] border-l-8 py-3 pl-4 pr-4",
        BANNER[tone],
        className
      )}
    >
      <NoticeIcon tone={tone} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-sm text-ink">{description}</p>}
      </div>
      {action}
    </div>
  )
}

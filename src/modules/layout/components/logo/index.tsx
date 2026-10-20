import { cx } from "@lib/util/cx"

/**
 * Com4Fud logo (logoMark()/logo() in ui.js): a rounded tile with a white rice
 * bowl and a sprout, then the wordmark with the "4" highlighted. The tile is
 * green here (the v2 red was dropped for the v1 palette).
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="36" height="36" rx="11" fill="#1F6B3A" />
      <path d="M7 18h22a11 11 0 0 1-22 0z" fill="#FFFFFF" />
      <path d="M12 18c0-3 3-5 6-5s6 2 6 5" fill="#FFFFFF" opacity=".55" />
      <path
        d="M18 13V8m0 3c-1-2-3-3-5-3 0 2 2 3 5 3zm0-1c1-2 3-3 5-3 0 2-2 3-5 3z"
        stroke="#C8F169"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="#C8F169"
      />
    </svg>
  )
}

export default function Logo({
  inverse,
  size = 36,
  className,
}: {
  /** White wordmark for dark backgrounds. */
  inverse?: boolean
  size?: number
  className?: string
}) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span
        className={cx(
          "font-display font-extrabold tracking-tight",
          inverse ? "text-white" : "text-ink"
        )}
        style={{ fontSize: Math.round(size * 0.7) }}
      >
        Com<span className={inverse ? "text-accent" : "text-brand"}>4</span>Fud
      </span>
    </span>
  )
}

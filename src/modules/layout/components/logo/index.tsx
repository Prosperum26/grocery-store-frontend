import { cx } from "@lib/util/cx"

/**
 * Com4Fud mark: a shopper walking with a supermarket hand basket (the pedestrian road-sign figure), on a rounded
 * green tile so it stays readable at favicon size. On a dark background (`inverse`) the tile turns lime and the
 * person dark green, so the tile does not sink into the footer. Same drawing as the favicon (src/app/icon.svg).
 */
export function LogoMark({ size = 36, inverse = false }: { size?: number; inverse?: boolean }) {
  const tile = inverse ? "#C8F169" : "#1F6B3A"
  const person = inverse ? "#123D24" : "#FFFFFF"
  const basket = inverse ? "#1F6B3A" : "#C8F169"
  const rim = inverse ? "#17532D" : "#A9D94A"
  const slots = inverse ? "#C8F169" : "#1F6B3A"
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" fill={tile} />
      <g transform="translate(5.2 4.2) scale(0.8)">
        {/* Person: back arm, legs, body, front arm (round strokes like the sign), then the head. */}
        <g stroke={person} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M19 16.5l-4 5.5-1 5" strokeWidth="4" />
          <path d="M18.5 27l-3.5 8-4 7.5" strokeWidth="5.2" />
          <path d="M18.5 27l3.5 7.5 1.5 8.5" strokeWidth="5.2" />
          <path d="M20 15l-1.5 12" strokeWidth="7.4" />
          <path d="M20.5 16.5l4.5 4.5 5 2.5" strokeWidth="4" />
        </g>
        <circle cx="21" cy="8.2" r="4.8" fill={person} />
        {/* Hand basket: two handles meeting in the hand, body, rim, ventilation slots. */}
        <path
          d="M25.6 30.4c-.3-4.4 2.2-6.8 4.4-7.2M38 30.4c.4-4.4-3.4-7-8-7.2"
          stroke={basket}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M23.6 30.4h16.6l-1.9 11.4a1.7 1.7 0 0 1-1.7 1.4H27.2a1.7 1.7 0 0 1-1.7-1.4z" fill={basket} />
        <path d="M23.2 30.1h17.4" stroke={rim} strokeWidth="2.6" strokeLinecap="round" />
        <g fill={slots}>
          <rect x="27" y="33.4" width="1.8" height="5.8" rx=".9" />
          <rect x="30.3" y="33.4" width="1.8" height="5.8" rx=".9" />
          <rect x="33.6" y="33.4" width="1.8" height="5.8" rx=".9" />
          <rect x="36.8" y="33.4" width="1.6" height="5.8" rx=".8" />
        </g>
      </g>
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
      <LogoMark size={size} inverse={inverse} />
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

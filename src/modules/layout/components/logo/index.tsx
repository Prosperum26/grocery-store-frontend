import { cx } from "@lib/util/cx"

/**
 * Com4Fud mark: a walking person in the style of the pedestrian road sign, carrying a supermarket hand basket. No
 * background tile. On a dark background (`inverse`) the person turns white and the basket lime, so both stay visible.
 * The same drawing is the favicon (src/app/icon.svg).
 */
export function LogoMark({ size = 36, inverse = false }: { size?: number; inverse?: boolean }) {
  const person = inverse ? "#FFFFFF" : "#16241B"
  const basket = inverse ? "#C8F169" : "#1F6B3A"
  const rim = inverse ? "#A9D94A" : "#17532D"
  const slots = inverse ? "#123D24" : "#C8F169"
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {/* Person: back arm, legs, body, front arm (round strokes like the sign), then the head. */}
      <g stroke={person} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M18.5 15.5l-4.5 5-1.5 4.5" strokeWidth="3.6" />
        <path d="M17.5 26.5l3.5 7 1.2 9" strokeWidth="4.4" />
        <path d="M17.5 26.5l-3 7.5-4.5 7.5" strokeWidth="4.4" />
        <path d="M19 14.5l-1.5 12" strokeWidth="6.4" />
        <path d="M19.8 15.5l4.6 4.5 5.3 3" strokeWidth="3.6" />
      </g>
      <circle cx="20.5" cy="7.4" r="4.3" fill={person} />
      {/* Hand basket: two handles meeting in the hand, body, rim, ventilation slots. */}
      <path
        d="M25.2 30.5c-.4-4.6 2.2-7 4.5-7.4M37.8 30.5c.4-4.6-3.3-7.2-8.1-7.4"
        stroke={basket}
        strokeWidth="1.9"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M23.4 30.5h16.4l-1.9 11.2a1.6 1.6 0 0 1-1.6 1.3H26.9a1.6 1.6 0 0 1-1.6-1.3z" fill={basket} />
      <path d="M23 30.2h17.2" stroke={rim} strokeWidth="2.2" strokeLinecap="round" />
      <g fill={slots}>
        <rect x="26.6" y="33.2" width="1.6" height="5.6" rx=".8" />
        <rect x="29.7" y="33.2" width="1.6" height="5.6" rx=".8" />
        <rect x="32.8" y="33.2" width="1.6" height="5.6" rx=".8" />
        <rect x="35.9" y="33.2" width="1.4" height="5.6" rx=".7" />
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
    <span className={cx("inline-flex items-center gap-2", className)}>
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

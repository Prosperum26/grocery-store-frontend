import type { SlotOption } from "./checkout"

/**
 * The delivery slot shown in the header (spec R1, 2026-11-11). The header only
 * remembers a choice; the slot is set on the cart at checkout, so a choice
 * made here needs no cart and changes nothing on the backend. Pure helpers,
 * tested without a browser.
 */

/** Cookie holding the slot id the shopper picked in the header, for one day. */
export const SLOT_COOKIE = "_c4f_slot"
const ONE_DAY_S = 24 * 60 * 60

/**
 * The slot to show: the remembered one while it is still open, otherwise the
 * earliest open slot. `remembered` is false in the second case, so the pill
 * can say "Sớm nhất". Null when no slot is open at all.
 */
export function pickShownSlot(
  slots: SlotOption[],
  savedId: string | undefined
): { slot: SlotOption; remembered: boolean } | null {
  const saved = savedId ? slots.find((s) => s.id === savedId && s.open) : undefined
  if (saved) return { slot: saved, remembered: true }
  const earliest = slots.find((s) => s.open)
  return earliest ? { slot: earliest, remembered: false } : null
}

/** "Hôm nay 17:00–19:00", "Ngày mai 07:00–09:00". */
export function slotText(slot: SlotOption): string {
  return `${slot.day} ${slot.time}`
}

/** The value of one cookie in a `document.cookie` string. */
export function readCookie(cookieString: string, name: string): string | undefined {
  const pair = cookieString
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : undefined
}

/** A `document.cookie` assignment that remembers the slot for one day. */
export function slotCookie(slotId: string): string {
  return `${SLOT_COOKIE}=${encodeURIComponent(slotId)}; path=/; max-age=${ONE_DAY_S}; samesite=lax`
}

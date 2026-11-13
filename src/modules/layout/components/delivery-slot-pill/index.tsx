"use client"

import { usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { LuCheck, LuChevronDown, LuClock } from "react-icons/lu"

import { listDeliverySlots } from "@lib/data/checkout"
import { DELIVERY_SLOTS } from "@lib/mock/checkout"
import { isMockMode } from "@lib/mock/mode"
import type { SlotOption } from "@lib/util/checkout"
import { cx } from "@lib/util/cx"
import { pickShownSlot, readCookie, SLOT_COOKIE, slotCookie, slotText } from "@lib/util/delivery-slot"

/** Shown when the slots cannot be read: still true, and not a button that does nothing. */
const FALLBACK = "Giao trong ngày · TP.HCM"

/**
 * Delivery slot of the header (spec R1). Shows the slot the shopper picked,
 * or the earliest one still open, and opens a short list to pick another.
 * The choice is kept in a cookie for a day; checkout picks it again if it is
 * still open. The address is not chosen here: it is entered at checkout.
 *
 * `variant`: "desktop" is the pill next to the search box, "phone" the small
 * chip under the logo.
 */
export default function DeliverySlotPill({ variant }: { variant: "desktop" | "phone" }) {
  const pathname = usePathname()
  const [slots, setSlots] = useState<SlotOption[] | null>(null)
  const [savedId, setSavedId] = useState<string | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  // Read the slots again on every page: they close as the day goes on.
  useEffect(() => {
    let stale = false
    setSavedId(readCookie(document.cookie, SLOT_COOKIE))
    const load = isMockMode() ? Promise.resolve(DELIVERY_SLOTS) : listDeliverySlots()
    load
      .then((list) => {
        if (!stale) setSlots(list)
      })
      .catch(() => {
        if (!stale) setSlots([])
      })
    return () => {
      stale = true
    }
  }, [pathname])

  useEffect(() => setOpen(false), [pathname])

  // Esc, a click or the focus outside close the list.
  useEffect(() => {
    if (!open) return
    const onOutside = (event: MouseEvent | FocusEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", onOutside)
    document.addEventListener("focusin", onOutside)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onOutside)
      document.removeEventListener("focusin", onOutside)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const shown = slots ? pickShownSlot(slots, savedId) : null
  const openSlots = (slots ?? []).filter((s) => s.open)

  const choose = (slot: SlotOption) => {
    document.cookie = slotCookie(slot.id)
    setSavedId(slot.id)
    setOpen(false)
    buttonRef.current?.focus()
  }

  // Not loaded yet, failed, or nothing open: plain text.
  if (!shown) {
    return variant === "desktop" ? (
      <div className="flex h-12 shrink-0 items-center gap-2 rounded-[14px] border border-line px-3 text-sm text-ink-2">
        <LuClock size={18} aria-hidden="true" className="text-brand" />
        {slots === null ? <span className="w-40" aria-hidden="true" /> : FALLBACK}
      </div>
    ) : (
      <p className="flex h-7 items-center gap-1.5 text-xs text-ink-2">
        <LuClock size={13} aria-hidden="true" className="text-brand" />
        {slots === null ? "" : FALLBACK}
      </p>
    )
  }

  const caption = shown.remembered ? "Giao lúc" : "Giao sớm nhất"

  return (
    <div ref={boxRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${caption}: ${slotText(shown.slot)}. Đổi khung giờ giao`}
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "desktop"
            ? "flex h-12 items-center gap-2 rounded-[14px] border border-line px-3 text-left hover:bg-page"
            : "touch-target relative inline-flex h-7 items-center gap-1.5 rounded-full bg-brand-bg px-2.5 text-xs font-semibold text-brand-deep"
        }
      >
        <LuClock size={variant === "desktop" ? 18 : 13} aria-hidden="true" className="text-brand" />
        {variant === "desktop" ? (
          <span className="flex flex-col">
            <span className="text-xs text-ink-2">{caption}</span>
            <span className="text-sm font-semibold text-ink">{slotText(shown.slot)}</span>
          </span>
        ) : (
          <span>
            {caption}: <span className="font-mono">{slotText(shown.slot)}</span>
          </span>
        )}
        <LuChevronDown size={variant === "desktop" ? 16 : 13} aria-hidden="true" className={cx("text-ink-2", open && "rotate-180")} />
      </button>

      {open && (
        <div
          id={listId}
          className={cx(
            "absolute top-[calc(100%+6px)] z-40 w-64 rounded-2xl border border-line bg-surface p-2 shadow-lg",
            variant === "desktop" ? "right-0" : "left-0"
          )}
        >
          <p className="px-2 pb-1 pt-1 text-xs font-semibold text-ink-2">Chọn khung giờ giao</p>
          <ul>
            {openSlots.map((slot) => {
              const current = slot.id === shown.slot.id
              return (
                <li key={slot.id}>
                  <button
                    type="button"
                    aria-current={current ? "true" : undefined}
                    onClick={() => choose(slot)}
                    className={cx(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm",
                      current ? "bg-brand-bg font-semibold text-brand-deep" : "text-ink hover:bg-page"
                    )}
                  >
                    <span>
                      {slot.day} <span className="font-mono">{slot.time}</span>
                    </span>
                    {current && <LuCheck aria-hidden="true" className="text-brand" />}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="px-2 pb-1 pt-2 text-xs text-ink-3">Địa chỉ giao nhập ở bước thanh toán.</p>
        </div>
      )}
    </div>
  )
}

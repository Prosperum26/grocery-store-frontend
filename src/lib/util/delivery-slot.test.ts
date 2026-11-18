import { describe, expect, it } from "vitest"

import type { SlotOption } from "./checkout"
import { pickShownSlot, readCookie, SLOT_COOKIE, slotCookie, slotText } from "./delivery-slot"

const slot = (id: string, open: boolean, day = "Hôm nay", time = "17:00–19:00"): SlotOption => ({ id, day, time, open })
const SLOTS = [
  slot("2026-11-13T07", false, "Hôm nay", "07:00–09:00"),
  slot("2026-11-13T17", true, "Hôm nay", "17:00–19:00"),
  slot("2026-11-13T19", true, "Hôm nay", "19:00–21:00"),
  slot("2026-11-14T07", true, "Ngày mai", "07:00–09:00"),
]

describe("pickShownSlot", () => {
  it("shows the earliest open slot when nothing is remembered", () => {
    expect(pickShownSlot(SLOTS, undefined)).toEqual({ slot: SLOTS[1], remembered: false })
  })

  it("shows the remembered slot while it is open", () => {
    expect(pickShownSlot(SLOTS, "2026-11-13T19")).toEqual({ slot: SLOTS[2], remembered: true })
  })

  it("falls back to the earliest open slot when the remembered one closed or is unknown", () => {
    expect(pickShownSlot(SLOTS, "2026-11-13T07")).toEqual({ slot: SLOTS[1], remembered: false })
    expect(pickShownSlot(SLOTS, "2026-11-10T07")).toEqual({ slot: SLOTS[1], remembered: false })
  })

  it("moves on to tomorrow when today is over, and is null when nothing is open", () => {
    const late = SLOTS.map((s) => (s.day === "Hôm nay" ? { ...s, open: false } : s))
    expect(pickShownSlot(late, undefined)?.slot.day).toBe("Ngày mai")
    expect(pickShownSlot(SLOTS.map((s) => ({ ...s, open: false })), undefined)).toBeNull()
    expect(pickShownSlot([], "x")).toBeNull()
  })
})

describe("slot cookie", () => {
  it("writes a one-day cookie and reads it back", () => {
    const written = slotCookie("2026-11-13T19")
    expect(written).toContain(`${SLOT_COOKIE}=2026-11-13T19`)
    expect(written).toContain("max-age=86400")
    expect(readCookie(`a=1; ${SLOT_COOKIE}=2026-11-13T19; b=2`, SLOT_COOKIE)).toBe("2026-11-13T19")
    expect(readCookie("a=1", SLOT_COOKIE)).toBeUndefined()
  })
})

describe("slotText", () => {
  it("joins day and time", () => {
    expect(slotText(SLOTS[3])).toBe("Ngày mai 07:00–09:00")
  })
})

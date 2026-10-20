import { describe, expect, it } from "vitest"
import { tintColors } from "./tint"

// Values from T in Com4Fud_UI_SVG/v2/_source/src/shared.js.
describe("tintColors", () => {
  it("returns the plate and dot colours of a tint", () => {
    expect(tintColors("red")).toEqual({ plate: "#FDE8E2", dot: "#F6B9AA" })
    expect(tintColors("blue")).toEqual({ plate: "#E2EBF5", dot: "#B3C8E0" })
  })
  it("falls back to green for an unknown tint", () => {
    expect(tintColors("purple" as any)).toEqual({ plate: "#E3F2DC", dot: "#B5DCA4" })
  })
})

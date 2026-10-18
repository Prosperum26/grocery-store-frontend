import { describe, expect, it } from "vitest"
import { cx } from "./cx"

describe("cx", () => {
  it("keeps a shadow size and a shadow colour together", () => {
    // tailwind-merge (behind clx) drops one of these two.
    expect(cx("shadow-toast", "shadow-brand")).toBe("shadow-toast shadow-brand")
  })
  it("skips falsy values", () => {
    expect(cx("a", false, undefined, null, "", "b")).toBe("a b")
  })
})

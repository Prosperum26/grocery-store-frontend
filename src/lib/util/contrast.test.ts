import { createRequire } from "module"
import { describe, expect, it } from "vitest"
import { contrastRatio } from "./contrast"

const require = createRequire(import.meta.url)
// Read the real palette so a colour change that breaks contrast fails here.
const { colors: c } = require("../../../tailwind.config.js").theme.extend

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1)
  })
  it("is 1 for a colour on itself", () => {
    expect(contrastRatio("#1F6B3A", "#1F6B3A")).toBeCloseTo(1, 5)
  })
})

// WCAG 2.1 AA: 4.5:1 for body text. Pairs are the ones the plan §1.2 uses.
describe("Com4Fud palette meets WCAG AA for text", () => {
  const pairs: [string, string, string][] = [
    ["white on brand (buy buttons)", "#FFFFFF", c.brand.DEFAULT],
    ["white on brand-deep (footer)", "#FFFFFF", c.brand.deep],
    ["on-dark on brand-deep (footer links)", c["on-dark"], c.brand.deep],
    ["ink on accent (Mua lại chip)", c.ink.DEFAULT, c.accent.DEFAULT],
    ["accent-ink on accent-soft", c.accent.ink, c.accent.soft],
    ["sale-deep on sale-bg (errors)", c.sale.deep, c.sale.bg],
    ["sale on white (sale price)", c.sale.DEFAULT, "#FFFFFF"],
    ["warn-ink on warn-bg", c.warn.ink, c.warn.bg],
    ["ink on warn (sale sticker)", c.ink.DEFAULT, c.warn.DEFAULT],
    ["ink-2 on page", c.ink[2], c.page.DEFAULT],
    ["ink-3 on page", c.ink[3], c.page.DEFAULT],
    ["ink-3 on white", c.ink[3], "#FFFFFF"],
    ["brand on page (links)", c.brand.DEFAULT, c.page.DEFAULT],
    ["brand-deep on brand-bg (selected)", c.brand.deep, c.brand.bg],
    ["white on sky", "#FFFFFF", c.sky.DEFAULT],
    ["plum on plum-bg", c.plum.DEFAULT, c.plum.bg],
  ]
  it.each(pairs)("%s", (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
})

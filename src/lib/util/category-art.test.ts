import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { artFor, CATEGORY_ART, FALLBACK_ART } from "./category-art"

describe("artFor", () => {
  it("keeps the product's own illustration", () => {
    expect(artFor({ art: "tomato", tint: "red", categoryHandle: "rau-cu" })).toEqual({ art: "tomato", tint: "red" })
  })

  it("uses the category's illustration and plate colour when the product has none", () => {
    expect(artFor({ tint: "green", categoryHandle: "mi-an-lien" })).toEqual({ art: "noodles", tint: "orange" })
  })

  it("falls back to the grocery bag for an unknown or missing category", () => {
    expect(artFor({ tint: "green", categoryHandle: "khong-co" })).toEqual(FALLBACK_ART)
    expect(artFor({ tint: "green" })).toEqual(FALLBACK_ART)
  })

  it("every illustration exists in public/art", () => {
    const names = [...Object.values(CATEGORY_ART).map((c) => c.art), FALLBACK_ART.art]
    for (const name of names) {
      expect(fs.existsSync(path.join(__dirname, "../../../public/art", `${name}.svg`))).toBe(true)
    }
  })
})

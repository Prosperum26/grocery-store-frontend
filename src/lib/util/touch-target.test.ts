import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/*
 * Guard for the `.touch-target` class (styles/globals.css). It grows the
 * clickable area with an absolutely positioned ::after, so the control itself
 * must be positioned. Without that the ::after is sized by the whole page and
 * every click on the page lands on that control (the Trợ lý Bếp bug of
 * 2026-11-11: nine buttons each covered 1440 x 2096 px).
 */

const SRC = path.resolve(__dirname, "../..")
const POSITIONED = /(^|[\s"'`])(relative|absolute|fixed|sticky)([\s"'`]|$)/

// Button puts `relative` in its base class and `touch-target` in the size
// classes, on separate lines; every Button gets both.
const CHECKED_BY_HAND = ["modules/common/components/button/index.tsx"]

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return tsxFiles(full)
    return entry.name.endsWith(".tsx") ? [full] : []
  })
}

describe("touch-target", () => {
  it("is only used on a positioned control", () => {
    const offenders: string[] = []
    for (const file of tsxFiles(SRC)) {
      const relative = path.relative(SRC, file).replace(/\\/g, "/")
      if (CHECKED_BY_HAND.includes(relative)) continue
      readFileSync(file, "utf-8")
        .split("\n")
        .forEach((line, i) => {
          if (line.includes("touch-target") && !POSITIONED.test(line)) {
            offenders.push(`${relative}:${i + 1}`)
          }
        })
    }
    expect(offenders).toEqual([])
  })
})

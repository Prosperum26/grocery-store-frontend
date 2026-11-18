// Exports the produce illustrations of the v2 design into public/art/*.svg.
//
//   node scripts/export-art.mjs [path/to/Com4Fud_UI_SVG/v2/_source/src/ui.js]
//
// The design generator keeps each illustration as a function returning SVG
// markup in a 100x100 box (`ART` in ui.js). We wrap each one in its own <svg>
// so the storefront can use it like any image. Run again after the design
// changes; the output is committed.
import { mkdirSync, writeFileSync } from "fs"
import { createRequire } from "module"
import path from "path"
import { fileURLToPath } from "url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const source = path.resolve(
  process.argv[2] ?? path.join(root, "../Com4Fud_UI_SVG/v2/_source/src/ui.js")
)

const require = createRequire(import.meta.url)
const { ART } = require(source)

const outDir = path.join(root, "public/art")
mkdirSync(outDir, { recursive: true })

for (const [key, draw] of Object.entries(ART)) {
  // Decorative by default: the product name is always printed next to it.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">${draw()}</svg>\n`
  writeFileSync(path.join(outDir, `${key}.svg`), svg)
}

console.log(`Wrote ${Object.keys(ART).length} illustrations to ${outDir}`)

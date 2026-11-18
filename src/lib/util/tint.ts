import type { Tint } from "../../types/viewmodels"

// Plate colour behind a product illustration and the colour of its dot
// pattern (T in Com4Fud_UI_SVG/v2/_source/src/shared.js). These are the
// design's illustration colours, kept apart from the UI palette on purpose.
const TINTS: Record<Tint, { plate: string; dot: string }> = {
  red: { plate: "#FDE8E2", dot: "#F6B9AA" },
  orange: { plate: "#FDEBD8", dot: "#F5C390" },
  green: { plate: "#E3F2DC", dot: "#B5DCA4" },
  cream: { plate: "#F7F0E2", dot: "#E3D2AE" },
  blue: { plate: "#E2EBF5", dot: "#B3C8E0" },
  yellow: { plate: "#FBF3D2", dot: "#EBD98A" },
  brown: { plate: "#F2E6DA", dot: "#D8BFA3" },
  pink: { plate: "#FBE6E6", dot: "#EDB8B8" },
}

export function tintColors(tint: Tint): { plate: string; dot: string } {
  return TINTS[tint] ?? TINTS.green
}

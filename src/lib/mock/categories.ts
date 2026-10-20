import { HttpTypes } from "@medusajs/types"

// The 8 categories of the design, in the order the home page shows them.
// `art`/`tint` are the illustration and plate colour of the category tile
// (CAT_ART in Com4Fud_UI_SVG/v2/_source/src/pages_a.js).
export const MOCK_CATEGORY_LIST = [
  { handle: "rau-cu", name: "Rau củ", art: "waterSpinach", tint: "green" },
  { handle: "trai-cay", name: "Trái cây", art: "pineapple", tint: "yellow" },
  { handle: "thit", name: "Thịt", art: "pork", tint: "pink" },
  { handle: "hai-san", name: "Hải sản", art: "shrimp", tint: "orange" },
  { handle: "trung-sua", name: "Trứng & Sữa", art: "eggs", tint: "cream" },
  { handle: "gao-do-kho", name: "Gạo & Đồ khô", art: "rice", tint: "cream" },
  { handle: "gia-vi", name: "Gia vị", art: "fishSauce", tint: "brown" },
  { handle: "do-uong", name: "Đồ uống", art: "milk", tint: "blue" },
] as const

export const MOCK_CATEGORIES = MOCK_CATEGORY_LIST.map(
  (c) =>
    ({
      id: `pcat_mock_${c.handle}`,
      name: c.name,
      handle: c.handle,
      description: "",
      parent_category: null,
      parent_category_id: null,
      category_children: [],
      metadata: { art: c.art, tint: c.tint },
    }) as unknown as HttpTypes.StoreProductCategory
)

import { describe, expect, it } from "vitest"
import {
  needLabelOf,
  buildLines,
  cartLinesOf,
  chosenOption,
  initialSelection,
  packsOf,
  summarize,
  type KitchenVariant,
  type RawKitchenItem,
} from "./kitchen"

const variant = (id: string, price: number, available = 10): KitchenVariant => ({
  variant_id: id,
  product_id: "p_" + id,
  handle: id,
  title: id,
  unit_label: "Khay",
  unit_price: price,
  available,
  purchasable: available > 0,
})

const item = (over: Partial<RawKitchenItem> & { ingredient: string }): RawKitchenItem => ({
  kind: "core",
  raw_text: over.ingredient,
  derived: false,
  default_qty: 1,
  pack_hint: null,
  product: { catalog_id: "CAT-" + over.ingredient, name: over.ingredient },
  variant: variant("v_" + over.ingredient, 10000),
  alternatives: [],
  ...over,
})

describe("packsOf", () => {
  it("uses the pack hint, then the default, never below 1", () => {
    expect(packsOf({ pack_hint: 3, default_qty: 1 })).toBe(3)
    expect(packsOf({ pack_hint: null, default_qty: 2 })).toBe(2)
    expect(packsOf({ pack_hint: null, default_qty: 0 })).toBe(1)
  })
})

describe("kitchen basket lines", () => {
  const basket = {
    buy: [
      item({ ingredient: "cá lóc", pack_hint: 2, variant: variant("v_ca", 85000) }),
      item({ ingredient: "me", variant: null }),
      item({ ingredient: "dứa", variant: variant("v_dua", 20000, 0) }),
    ],
    maybe_have: [
      item({
        ingredient: "nước mắm",
        default_qty: 0,
        variant: variant("v_nm", 45000),
        alternatives: [{ catalog_id: "CAT-nm2", name: "Nước mắm nhĩ", variant: variant("v_nm2", 39000) }],
      }),
    ],
  }
  const lines = buildLines(basket)

  it("ticks only buyable lines to buy, and leaves 'maybe have' lines unticked", () => {
    const { ticked } = initialSelection(lines)
    expect(ticked).toEqual({ "cá lóc": true, me: false, dứa: false, "nước mắm": false })
  })

  it("adds the ticked lines with their pack count and sums the price", () => {
    const selection = initialSelection(lines)
    expect(cartLinesOf(lines, selection)).toEqual([{ variantId: "v_ca", quantity: 2, unitPrice: 85000 }])
    // me: no product, dứa: out of stock -> unavailable; nước mắm: buyable but not ticked -> notChosen
    expect(summarize(lines, selection)).toEqual({ count: 1, total: 170000, notChosen: 1, unavailable: 2 })
  })

  it("keeps unavailable lines out of the cart even when ticked", () => {
    const selection = initialSelection(lines)
    selection.ticked["me"] = true
    selection.ticked["dứa"] = true
    expect(summarize(lines, selection)).toMatchObject({ count: 1, unavailable: 2, notChosen: 1 })
  })

  it("labels a line with the ingredient name and the amount needed", () => {
    expect(lines[0].label).toBe("Cá lóc")
    expect(needLabelOf({ quantity: 100, unit: "g" })).toBe("100 g")
    expect(needLabelOf({ quantity: 0.5, unit: "cây" })).toBe("0,5 cây")
    expect(needLabelOf({ quantity: 2, unit: null })).toBe("2")
    expect(needLabelOf(null)).toBeNull()
  })

  it("uses the brand the customer chose for the price and the cart", () => {
    const selection = initialSelection(lines)
    selection.ticked["nước mắm"] = true
    selection.choice["nước mắm"] = "CAT-nm2"
    expect(chosenOption(lines[3], selection).catalogId).toBe("CAT-nm2")
    expect(cartLinesOf(lines, selection).map((l) => l.variantId)).toEqual(["v_ca", "v_nm2"])
    expect(summarize(lines, selection).total).toBe(170000 + 39000)
  })

  it("never adds more packs than the stock", () => {
    const small = buildLines({ buy: [item({ ingredient: "tôm", pack_hint: 5, variant: variant("v_tom", 1000, 2) })], maybe_have: [] })
    expect(cartLinesOf(small, initialSelection(small))[0].quantity).toBe(2)
  })
})

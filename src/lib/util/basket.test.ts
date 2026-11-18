import { describe, expect, it } from "vitest"
import { buildBasketView, EMPTY_BASKET, type RawBasketItem } from "./basket"

const item = (over: Partial<RawBasketItem>): RawBasketItem => ({
  variant_id: "var_1",
  product_id: "prod_1",
  handle: "trung-ga",
  title: "Trứng gà",
  unit_label: "Hộp 10 quả",
  art: null,
  tint: null,
  quantity: 1,
  unit_price: 38000,
  in_stock: true,
  ...over,
})

describe("buildBasketView", () => {
  it("marks best sellers apart from a reorder", () => {
    expect(buildBasketView({ status: "ready", total: 1, items: [item({})], source: "popular" }).popular).toBe(true)
    expect(buildBasketView({ status: "ready", total: 1, items: [item({})], source: "model" }).popular).toBe(false)
    expect(buildBasketView({ status: "ready", total: 1, items: [item({})] }).popular).toBe(false)
  })

  it("is empty unless the backend says the basket is ready", () => {
    expect(buildBasketView(null)).toEqual(EMPTY_BASKET)
    expect(buildBasketView({ status: "empty", items: [], total: 0 })).toEqual(EMPTY_BASKET)
    expect(buildBasketView({ status: "warming", items: [item({})], total: 38000 })).toEqual(EMPTY_BASKET)
  })

  it("passes the product photo through, and leaves it out when the product has none", () => {
    const withPhoto = buildBasketView({ status: "ready", total: 1, items: [item({ thumbnail: "https://x/a.jpg" })] })
    expect(withPhoto.items[0].thumbnail).toBe("https://x/a.jpg")
    expect(buildBasketView({ status: "ready", total: 1, items: [item({ thumbnail: null })] }).items[0].thumbnail).toBeUndefined()
  })

  it("prices each line, labels the quantity and defaults art and tint", () => {
    const view = buildBasketView({
      status: "ready",
      items: [item({ quantity: 2, unit_price: 38000, tint: "not-a-tint" }), item({ variant_id: "var_2", in_stock: false })],
      total: 76000,
    })
    expect(view.items[0]).toMatchObject({ quantityLabel: "Hộp 10 quả · ×2", linePrice: 76000, tint: "green", art: undefined })
    expect(view.items[1].quantityLabel).toBe("Hộp 10 quả")
    expect(view.total).toBe(76000)
    expect(view.addableCount).toBe(1)
  })
})

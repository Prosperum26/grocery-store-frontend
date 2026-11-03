import { describe, expect, it } from "vitest"
import {
  buildCartViewFromMedusa,
  DELIVERY_FEE,
  EMPTY_CART_VIEW,
  withQuantity,
  type RawCartLine,
} from "./cart-view"

function line(over: Partial<RawCartLine> & { id: string }): RawCartLine {
  return {
    quantity: 1,
    unit_price: 10000,
    variant_id: `var_${over.id}`,
    variant_title: "1 kg",
    product_title: `Món ${over.id}`,
    product_handle: `mon-${over.id}`,
    metadata: null,
    product: { metadata: { tint: "red", art: "tomato", stock_unit: "kg", low_stock: 5 } },
    ...over,
  }
}

describe("buildCartViewFromMedusa", () => {
  it("is empty without a cart", () => {
    expect(buildCartViewFromMedusa(null, {})).toEqual(EMPTY_CART_VIEW)
    expect(buildCartViewFromMedusa({ items: [] }, {}).shipping).toBe(0)
  })

  it("prices lines, counts items and adds the delivery fee", () => {
    const view = buildCartViewFromMedusa(
      { items: [line({ id: "a", quantity: 2, unit_price: 30000 }), line({ id: "b", unit_price: 5000 })] },
      { var_a: 10, var_b: 10 }
    )
    expect(view.subtotal).toBe(65000)
    expect(view.count).toBe(3)
    expect(view.shipping).toBe(DELIVERY_FEE)
    expect(view.total).toBe(65000 + DELIVERY_FEE)
  })

  it("reads art, tint and stock unit from the product metadata, with defaults", () => {
    const [full] = buildCartViewFromMedusa({ items: [line({ id: "a" })] }, { var_a: 3 }).lines
    expect(full).toMatchObject({ art: "tomato", tint: "red", stockUnit: "kg", lowStock: 5, key: "a", handle: "mon-a" })

    const [bare] = buildCartViewFromMedusa(
      { items: [line({ id: "b", product: { metadata: { tint: "not-a-tint" } } })] },
      { var_b: 3 }
    ).lines
    expect(bare).toMatchObject({ art: undefined, tint: "green", stockUnit: "phần", lowStock: 10 })
  })

  it("keeps a sold-out line on screen but leaves it out of the totals", () => {
    const view = buildCartViewFromMedusa(
      { items: [line({ id: "a", unit_price: 20000 }), line({ id: "gone", unit_price: 99000 })] },
      { var_a: 4, var_gone: 0 }
    )
    expect(view.lines).toHaveLength(2)
    expect(view.outOfStockCount).toBe(1)
    expect(view.subtotal).toBe(20000)
    expect(view.count).toBe(1)
  })

  it("treats a variant missing from the stock map as sold out", () => {
    const view = buildCartViewFromMedusa({ items: [line({ id: "a" })] }, {})
    expect(view.lines[0].inStock).toBe(false)
    expect(view.shipping).toBe(0)
  })

  it("flags a changed price from price_at_add and keeps the price paid", () => {
    const view = buildCartViewFromMedusa(
      {
        items: [
          line({ id: "up", unit_price: 92000, metadata: { price_at_add: 89000 } }),
          line({ id: "same", unit_price: 10000, metadata: { price_at_add: 10000 } }),
          line({ id: "none", unit_price: 10000, metadata: null }),
        ],
      },
      { var_up: 5, var_same: 5, var_none: 5 }
    )
    expect(view.lines[0]).toMatchObject({ previousPrice: 89000, pricePaid: 89000 })
    expect(view.lines[1].previousPrice).toBeUndefined()
    expect(view.lines[2].previousPrice).toBeUndefined()
    expect(view.priceChangedCount).toBe(1)
  })

  it("shows a voucher only while it discounts something", () => {
    const items = [line({ id: "a", unit_price: 200000 })]
    const stock = { var_a: 5 }

    const ok = buildCartViewFromMedusa({ items, discount_total: 20000, promotions: [{ code: "TUOI20" }] }, stock)
    expect(ok).toMatchObject({ voucher: "TUOI20", discount: 20000, total: 200000 + DELIVERY_FEE - 20000 })

    // The code is on the cart but the cart does not qualify: discount is 0.
    const notEligible = buildCartViewFromMedusa({ items, discount_total: 0, promotions: [{ code: "TUOI20" }] }, stock)
    expect(notEligible).toMatchObject({ voucher: null, discount: 0 })
  })

  it("never discounts more than the subtotal", () => {
    const view = buildCartViewFromMedusa(
      { items: [line({ id: "a", unit_price: 5000 })], discount_total: 20000, promotions: [{ code: "X" }] },
      { var_a: 5 }
    )
    expect(view.discount).toBe(5000)
    expect(view.total).toBe(DELIVERY_FEE)
  })
})

describe("withQuantity", () => {
  const base = buildCartViewFromMedusa(
    { items: [line({ id: "a", unit_price: 30000, quantity: 2 }), line({ id: "b", unit_price: 5000 })] },
    { var_a: 10, var_b: 10 }
  )

  it("changes one line and the totals", () => {
    const next = withQuantity(base, "a", 5)
    expect(next.lines[0]).toMatchObject({ quantity: 5, lineTotal: 150000 })
    expect(next.lines[1].quantity).toBe(1)
    expect(next.count).toBe(6)
    expect(next.subtotal).toBe(155000)
    expect(next.total).toBe(155000 + DELIVERY_FEE)
  })

  it("does not change the original view", () => {
    withQuantity(base, "a", 9)
    expect(base.lines[0].quantity).toBe(2)
  })

  it("keeps the voucher but never discounts more than the subtotal", () => {
    const withCode = { ...base, discount: 20000, voucher: "TUOI20" }
    expect(withQuantity(withCode, "a", 3)).toMatchObject({ voucher: "TUOI20", discount: 20000 })
    const tiny = withQuantity({ ...withCode, discount: 90000 }, "a", 1)
    expect(tiny.discount).toBe(35000)
  })
})

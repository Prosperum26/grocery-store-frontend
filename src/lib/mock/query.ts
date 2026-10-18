import { HttpTypes } from "@medusajs/types"
import { MOCK_PRODUCTS } from "./products"

export type MockProductQuery = {
  limit?: number
  offset?: number
  id?: string | string[]
  handle?: string
  category_id?: string | string[]
  collection_id?: string | string[]
  order?: string
  /** Mock-only: products whose price is below the original price. */
  on_sale?: boolean
}

const asArray = (v?: string | string[]) =>
  v === undefined ? undefined : Array.isArray(v) ? v : [v]

const isOnSale = (p: HttpTypes.StoreProduct) =>
  (p.variants ?? []).some((v: any) => {
    const c = v.calculated_price
    return c && c.original_amount > c.calculated_amount
  })

/** The subset of Store API product filters the Starter pages use. */
export function queryMockProducts(q: MockProductQuery = {}) {
  const ids = asArray(q.id)
  const categoryIds = asArray(q.category_id)
  const collectionIds = asArray(q.collection_id)

  let list = MOCK_PRODUCTS.filter(
    (p) =>
      (!ids || ids.includes(p.id)) &&
      (!q.handle || p.handle === q.handle) &&
      (!categoryIds ||
        (p.categories ?? []).some((c) => categoryIds.includes(c.id))) &&
      (!collectionIds || collectionIds.includes(p.collection_id ?? "")) &&
      (!q.on_sale || isOnSale(p))
  )

  if (q.order === "-created_at") {
    list = [...list].sort((a, b) =>
      String(b.created_at).localeCompare(String(a.created_at))
    )
  }

  const offset = Number(q.offset ?? 0)
  const limit = Number(q.limit ?? list.length)

  return { products: list.slice(offset, offset + limit), count: list.length }
}

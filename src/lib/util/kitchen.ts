/**
 * Trợ lý Bếp (backend API-8): the recipe screen's ingredient list. Pure, so
 * the ticks, brand choice, subtotal and cart lines can be tested without a
 * backend. Contract: grocery-store-backend/docs/contracts/ai-copilot.md.
 */

/** What the backend attaches to one catalog_id (StoreVariantInfo). */
export type KitchenVariant = {
  variant_id: string
  product_id: string
  handle: string
  title: string
  unit_label: string
  unit_price: number
  available: number
  purchasable: boolean
}

export type RawKitchenItem = {
  ingredient: string
  kind: "core" | "addon"
  raw_text: string
  derived: boolean
  default_qty: number
  pack_hint: number | null
  product: { catalog_id: string; name: string }
  variant: KitchenVariant | null
  alternatives: { catalog_id: string; name: string; variant: KitchenVariant | null }[]
}

export type RawKitchenBasket = { buy: RawKitchenItem[]; maybe_have: RawKitchenItem[] }

export type RecipeInfo = {
  id: string
  name: string
  family: string | null
  servings: number
  time_minutes: number | null
  difficulty: string | null
  description: string | null
  image_url: string | null
  source_url: string
}

/** POST /store/ai/recipe */
export type RawRecipeDetail = {
  recipe: RecipeInfo
  servings: number
  complete: boolean
  prep_steps: string[]
  cooking_steps: string[]
  basket: RawKitchenBasket
  not_in_basket: string[]
}

/** POST /store/ai/search, only what the list needs. */
export type RawRecipeSearch = {
  accepted: boolean
  results: { recipe: RecipeInfo; complete: boolean }[]
}

/** A product the customer can pick for one ingredient ("Đổi hãng"). */
export type KitchenOption = { catalogId: string; name: string; variant: KitchenVariant | null }

export type KitchenLine = {
  /** Ingredient name: unique inside one basket. */
  key: string
  rawText: string
  derived: boolean
  /** True for lines the store suggests the customer may already have. */
  maybeHave: boolean
  /** Packs to buy. */
  quantity: number
  /** First option is the product the backend picked. */
  options: KitchenOption[]
}

/** Packs for one line: the backend's pack hint, else its default, never below 1. */
export function packsOf(item: Pick<RawKitchenItem, "pack_hint" | "default_qty">): number {
  const packs = item.pack_hint ?? item.default_qty
  return Math.max(1, Math.round(packs || 1))
}

export function buildLines(basket: RawKitchenBasket): KitchenLine[] {
  const make = (item: RawKitchenItem, maybeHave: boolean): KitchenLine => ({
    key: item.ingredient,
    rawText: item.raw_text,
    derived: item.derived,
    maybeHave,
    quantity: packsOf(item),
    options: [
      { catalogId: item.product.catalog_id, name: item.product.name, variant: item.variant },
      ...item.alternatives.map((alt) => ({ catalogId: alt.catalog_id, name: alt.name, variant: alt.variant })),
    ],
  })
  return [...basket.buy.map((i) => make(i, false)), ...basket.maybe_have.map((i) => make(i, true))]
}

/** Whether the customer can put this option in the cart at all. */
export const canBuy = (option: KitchenOption | undefined): boolean => !!option?.variant?.purchasable

export type Selection = { ticked: Record<string, boolean>; choice: Record<string, string> }

/** Starting point: lines to buy are ticked when buyable, "maybe have" lines are not. */
export function initialSelection(lines: KitchenLine[]): Selection {
  const ticked: Record<string, boolean> = {}
  for (const line of lines) {
    ticked[line.key] = !line.maybeHave && canBuy(line.options[0])
  }
  return { ticked, choice: {} }
}

export function chosenOption(line: KitchenLine, selection: Selection): KitchenOption {
  return line.options.find((o) => o.catalogId === selection.choice[line.key]) ?? line.options[0]
}

/** Packs to add, capped by what is in stock. */
export function quantityOf(line: KitchenLine, option: KitchenOption): number {
  const available = option.variant?.available ?? 0
  return Math.max(0, Math.min(line.quantity, available))
}

export type CartLine = { variantId: string; quantity: number; unitPrice: number }

/** Ticked lines that can be bought, as the cart needs them. */
export function cartLinesOf(lines: KitchenLine[], selection: Selection): CartLine[] {
  const out: CartLine[] = []
  for (const line of lines) {
    const option = chosenOption(line, selection)
    if (!selection.ticked[line.key] || !canBuy(option)) continue
    const quantity = quantityOf(line, option)
    if (quantity > 0) {
      out.push({ variantId: option.variant!.variant_id, quantity, unitPrice: option.variant!.unit_price })
    }
  }
  return out
}

export type Summary = { count: number; total: number; skipped: number; unticked: number }

/**
 * `count` and `total` are what the add button will put in the cart. `skipped`
 * counts ticked lines that cannot be added (no product or out of stock).
 */
export function summarize(lines: KitchenLine[], selection: Selection): Summary {
  const cart = cartLinesOf(lines, selection)
  const ticked = lines.filter((l) => selection.ticked[l.key]).length
  return {
    count: cart.length,
    total: cart.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    skipped: ticked - cart.length,
    unticked: lines.length - ticked,
  }
}

/** "4 người" label of a recipe card. */
export const servingsLabel = (n: number) => `${n} người`

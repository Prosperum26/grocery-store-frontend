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
  /** Product photo, for the strip of ingredient photos on a suggestion card. */
  thumbnail?: string | null
  title: string
  unit_label: string
  unit_price: number
  available: number
  purchasable: boolean
}

export type RawKitchenItem = {
  /** Display name. One product can serve several ingredients, then they are joined with ", ". */
  ingredient: string
  need?: { quantity: number; unit: string | null } | null
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
  /** Ingredients exactly as the recipe writes them, each line once. */
  ingredient_lines?: string[]
  not_in_basket: string[]
}

/** POST /store/ai/search with include_basket: false, only what the list needs. */
export type RawRecipeSearch = {
  accepted: boolean
  results: { recipe: RecipeInfo; complete: boolean }[]
}

/** A product the customer can pick for one ingredient ("Đổi hãng"). */
export type KitchenOption = { catalogId: string; name: string; variant: KitchenVariant | null }

export type KitchenLine = {
  /** Ingredient name: unique inside one basket (the backend gives one line per product). */
  key: string
  /** "Cá lóc", "Rau om, ngò gai" */
  label: string
  /** Amount the recipe needs for the chosen number of people, e.g. "100 g"; null when the recipe gives none. */
  needLabel: string | null
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

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase("vi") + text.slice(1)

/** "100 g", "0,5 cây", "2" (no unit). Up to two decimals, Vietnamese decimal comma. */
export function needLabelOf(need: RawKitchenItem["need"]): string | null {
  if (!need || !(need.quantity > 0)) {
    return null
  }
  const amount = String(Math.round(need.quantity * 100) / 100).replace(".", ",")
  return need.unit ? `${amount} ${need.unit}` : amount
}

export function buildLines(basket: RawKitchenBasket): KitchenLine[] {
  const make = (item: RawKitchenItem, maybeHave: boolean): KitchenLine => ({
    key: item.ingredient,
    label: capitalize(item.ingredient),
    needLabel: needLabelOf(item.need),
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

export type Summary = {
  /** Lines the add button will put in the cart, and their price. */
  count: number
  total: number
  /** Lines the customer left unticked although they could be bought. */
  notChosen: number
  /** Lines that cannot be bought now, whatever the tick: no product in the store, or out of stock. */
  unavailable: number
}

export function summarize(lines: KitchenLine[], selection: Selection): Summary {
  const cart = cartLinesOf(lines, selection)
  const unavailable = lines.filter((l) => {
    const option = chosenOption(l, selection)
    return !canBuy(option) || quantityOf(l, option) === 0
  }).length
  return {
    count: cart.length,
    total: cart.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    notChosen: lines.length - cart.length - unavailable,
    unavailable,
  }
}

/** "4 người" label of a recipe card. */
export const servingsLabel = (n: number) => `${n} người`

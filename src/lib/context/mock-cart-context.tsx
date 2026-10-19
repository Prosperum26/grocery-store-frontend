"use client"

import {
  buildCartView,
  CartSeedLine,
  CartView,
  lineKey,
  maxQuantity,
  MOCK_CART_SEED,
  MOCK_VOUCHER_SEED,
  MOCK_VOUCHERS,
  resolveVariant,
} from "@lib/mock/cart"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { ProductVM } from "types/viewmodels"

/*
 * The browser cart of the mock mode. Lines are kept in React state and in
 * sessionStorage (every access in try/catch: private windows can refuse it).
 * It survives reloads of the tab, not a new session. When the Medusa backend
 * is wired (backend plan BE-2), this context is replaced by the real cart.
 */

const STORAGE_KEY = "com4fud.mockCart.v1"

type Stored = { lines: CartSeedLine[]; voucher: string | null }

type CartApi = {
  view: CartView
  /** Adds one pack (or raises the quantity). Returns false when stock is full. */
  add: (handle: string, opts?: { variant?: string; quantity?: number }) => boolean
  setQuantity: (key: string, quantity: number) => void
  /** Removes a line and returns it, so the caller can offer "Hoàn tác". */
  remove: (key: string) => CartSeedLine | null
  /** Puts back a removed line, at the end of the cart. */
  restore: (line: CartSeedLine) => void
  /** "ok" when the code is known; otherwise "invalid" and nothing changes. */
  applyVoucher: (code: string) => "ok" | "invalid"
  removeVoucher: () => void
  /** Empties the cart, e.g. after an order is placed. */
  clear: () => void
  /** Hides the "giá vừa đổi" notice for this session. */
  dismissPriceNotice: () => void
  priceNoticeDismissed: boolean
}

const CartContext = createContext<CartApi | null>(null)

function readStored(): Stored | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Stored) : null
  } catch {
    return null
  }
}

function writeStored(value: Stored) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Storage is unavailable: the cart still works until the page reloads.
  }
}

export function MockCartProvider({
  catalog,
  seed = MOCK_CART_SEED,
  children,
}: {
  catalog: ProductVM[]
  /** Starting lines. The layout passes [] when mock mode is off. */
  seed?: CartSeedLine[]
  children: ReactNode
}) {
  const [lines, setLines] = useState<CartSeedLine[]>(seed)
  const [voucher, setVoucher] = useState<string | null>(
    seed.length ? MOCK_VOUCHER_SEED : null
  )
  const [priceNoticeDismissed, setPriceNoticeDismissed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Read what the shopper did earlier in this tab. Runs after the first
  // render so the server HTML and the first client render agree.
  useEffect(() => {
    const stored = readStored()
    if (stored) {
      setLines(stored.lines)
      setVoucher(stored.voucher)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) writeStored({ lines, voucher })
  }, [hydrated, lines, voucher])

  const view = useMemo(
    () => buildCartView(lines, catalog, voucher),
    [lines, catalog, voucher]
  )

  const add = useCallback<CartApi["add"]>(
    (handle, opts = {}) => {
      const product = catalog.find((p) => p.handle === handle)
      if (!product) return false
      const key = lineKey(handle, opts.variant)
      const max = maxQuantity(product, opts.variant)
      const current = lines.find((l) => lineKey(l.handle, l.variant) === key)
      const wanted = (current?.quantity ?? 0) + (opts.quantity ?? 1)
      if (max <= 0 || (current?.quantity ?? 0) >= max) return false

      const quantity = Math.min(wanted, max)
      // A new line records today's price, so it does not show as "giá vừa đổi".
      const price = resolveVariant(product, opts.variant)?.price
      setLines((prev) =>
        current
          ? prev.map((l) =>
              lineKey(l.handle, l.variant) === key ? { ...l, quantity } : l
            )
          : [...prev, { handle, variant: opts.variant, quantity, pricePaid: price }]
      )
      return true
    },
    [catalog, lines]
  )

  const setQuantity = useCallback<CartApi["setQuantity"]>(
    (key, quantity) => {
      setLines((prev) =>
        prev.map((l) => {
          if (lineKey(l.handle, l.variant) !== key) return l
          const product = catalog.find((p) => p.handle === l.handle)
          if (!product) return l
          const max = maxQuantity(product, l.variant)
          return { ...l, quantity: Math.max(1, Math.min(quantity, max)) }
        })
      )
    },
    [catalog]
  )

  const remove = useCallback<CartApi["remove"]>(
    (key) => {
      const removed = lines.find((l) => lineKey(l.handle, l.variant) === key) ?? null
      if (removed) {
        setLines((prev) => prev.filter((l) => lineKey(l.handle, l.variant) !== key))
      }
      return removed
    },
    [lines]
  )

  const restore = useCallback<CartApi["restore"]>((line) => {
    setLines((prev) => [...prev, line])
  }, [])

  const applyVoucher = useCallback<CartApi["applyVoucher"]>((code) => {
    const normalized = code.trim().toUpperCase()
    if (!MOCK_VOUCHERS[normalized]) return "invalid"
    setVoucher(normalized)
    return "ok"
  }, [])

  const value: CartApi = {
    view,
    add,
    setQuantity,
    remove,
    restore,
    applyVoucher,
    removeVoucher: () => setVoucher(null),
    clear: () => {
      setLines([])
      setVoucher(null)
    },
    dismissPriceNotice: () => setPriceNoticeDismissed(true),
    priceNoticeDismissed,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useMockCart(): CartApi {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useMockCart must be used inside <MockCartProvider>")
  }
  return ctx
}

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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { ProductVM } from "types/viewmodels"
import { CartContext, type CartApi } from "./cart-context"

/*
 * The browser cart of the mock mode. Lines are kept in React state and in
 * sessionStorage (every access in try/catch: private windows can refuse it).
 * It survives reloads of the tab, not a new session. With the Medusa backend
 * the layout uses RealCartProvider instead (real-cart-context.tsx); both give
 * the same CartApi (cart-context.tsx), whose changes are async.
 */

const STORAGE_KEY = "com4fud.mockCart.v1"

type Stored = { lines: CartSeedLine[]; voucher: string | null }

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
  // The undo of a toast runs long after the render that made it, so the
  // callbacks read the lines through a ref instead of a stale closure.
  const linesRef = useRef(lines)
  linesRef.current = lines

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
    async (product, opts = {}) => {
      const handle = product.handle
      const key = lineKey(handle, opts.variant)
      const max = maxQuantity(product, opts.variant)
      const current = linesRef.current.find((l) => lineKey(l.handle, l.variant) === key)
      const wanted = (current?.quantity ?? 0) + (opts.quantity ?? 1)
      if (max <= 0 || (current?.quantity ?? 0) >= max) return { ok: false }

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
      return { ok: true, key, before: current?.quantity ?? 0 }
    },
    []
  )

  const setQuantity = useCallback<CartApi["setQuantity"]>(
    async (key, quantity) => {
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
    async (key) => {
      const removed =
        linesRef.current.find((l) => lineKey(l.handle, l.variant) === key) ?? null
      if (removed) {
        setLines((prev) => prev.filter((l) => lineKey(l.handle, l.variant) !== key))
      }
      return removed
    },
    []
  )

  const restore = useCallback<CartApi["restore"]>(async (line) => {
    setLines((prev) => [...prev, line])
  }, [])

  const applyVoucher = useCallback<CartApi["applyVoucher"]>(async (code) => {
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
    removeVoucher: async () => setVoucher(null),
    clear: async () => {
      setLines([])
      setVoucher(null)
    },
    refresh: async () => undefined,
    dismissPriceNotice: () => setPriceNoticeDismissed(true),
    priceNoticeDismissed,
    pending: false,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

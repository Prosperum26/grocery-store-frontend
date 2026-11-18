"use client"

import {
  applyVoucherCode,
  addLine,
  forgetCart,
  getCartView,
  removeLine,
  removeVoucherCode,
  setLineQuantity,
} from "@lib/data/shopping-cart"
import { resolveVariant, type CartSeedLine, type CartView } from "@lib/mock/cart"
import { EMPTY_CART_VIEW, withQuantity } from "@lib/util/cart-view"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { CartContext, type CartApi } from "./cart-context"

/*
 * The cart of the real storefront. The Medusa cart lives on the server (its
 * id is in a cookie); this keeps the last CartView and calls the server
 * actions of lib/data/shopping-cart.ts. Changes run one after another, and a
 * new quantity shows at once, so quick taps on "+" add up and are saved in
 * order.
 */
export function RealCartProvider({
  countryCode,
  children,
}: {
  countryCode: string
  children: ReactNode
}) {
  const [view, setView] = useState<CartView>(EMPTY_CART_VIEW)
  const [pending, setPending] = useState(false)
  const [priceNoticeDismissed, setPriceNoticeDismissed] = useState(false)
  // The view is also read inside callbacks that must not change identity.
  const viewRef = useRef(view)
  viewRef.current = view
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const waiting = useRef(0)

  // Runs `task` after the ones already queued and shows its CartView.
  const enqueue = useCallback(<T extends { view: CartView }>(task: () => Promise<T>) => {
    waiting.current += 1
    setPending(true)
    const run = queue.current.then(task)
    queue.current = run.catch(() => undefined)
    return run
      .then((result) => {
        // Only the last queued change sets the view: an earlier answer would
        // briefly undo a tap that is still being saved.
        if (waiting.current === 1) setView(result.view)
        return result
      })
      .finally(() => {
        waiting.current -= 1
        if (waiting.current === 0) setPending(false)
      })
  }, [])

  // The cart of an earlier visit: read it once the page is on screen.
  useEffect(() => {
    getCartView()
      .then(setView)
      .catch(() => undefined)
  }, [])

  const api = useMemo<CartApi>(
    () => ({
      view,
      pending,
      priceNoticeDismissed,
      dismissPriceNotice: () => setPriceNoticeDismissed(true),

      add: async (product, opts = {}) => {
        const variant = resolveVariant(product, opts.variant)
        if (!variant || variant.stockQty <= 0) return { ok: false }
        const { result } = await enqueue(() =>
          addLine({
            countryCode,
            variantId: variant.id,
            quantity: opts.quantity ?? 1,
            priceAtAdd: variant.price,
          })
        )
        return result
      },

      setQuantity: async (key, quantity) => {
        // Show the new quantity at once, so the next tap counts from it.
        setView((current) => withQuantity(current, key, Math.max(1, quantity)))
        await enqueue(() => setLineQuantity({ lineId: key, quantity }))
      },

      remove: async (key) => {
        const line = viewRef.current.lines.find((l) => l.key === key)
        if (!line) return null
        await enqueue(async () => ({ view: await removeLine(key) }))
        const removed: CartSeedLine = {
          handle: line.handle,
          variant: line.variantLabel,
          quantity: line.quantity,
          pricePaid: line.pricePaid,
          variantId: line.variantId,
        }
        return removed
      },

      restore: async (line) => {
        if (!line.variantId) return
        await enqueue(() =>
          addLine({
            countryCode,
            variantId: line.variantId!,
            quantity: line.quantity,
            // Put back at the price it had, so the "giá vừa đổi" notice returns.
            priceAtAdd: line.pricePaid,
          })
        )
      },

      applyVoucher: async (code) => {
        const { result } = await enqueue(() => applyVoucherCode(code))
        return result
      },

      removeVoucher: async () => {
        await enqueue(async () => ({ view: await removeVoucherCode() }))
      },

      clear: async () => {
        await enqueue(async () => ({ view: await forgetCart() }))
      },

      refresh: async () => {
        await enqueue(async () => ({ view: await getCartView() }))
      },
    }),
    [view, pending, priceNoticeDismissed, countryCode, enqueue]
  )

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

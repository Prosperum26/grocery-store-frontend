import { isMockMode } from "@lib/mock/mode"
import type { StockUpdate } from "@lib/util/stock"
import { io, type Socket } from "socket.io-client"

/*
 * One Socket.io connection to the realtime gateway (backend API-16), shared
 * by every live stock badge of the page. The gateway sends `stock:update` to
 * the clients that subscribed to an inventory item.
 *
 * Several components can watch the same item (two cart lines, a product page
 * and the cart), so subscriptions are counted: the item is unsubscribed only
 * when the last watcher leaves, and every watched item is subscribed again
 * after a reconnect (the gateway forgets the rooms of a closed connection).
 */

let socket: Socket | null | undefined
const watchers = new Map<string, number>()

/** The shared connection, or null in mock mode, on the server, or without NEXT_PUBLIC_REALTIME_URL. */
function connection(): Socket | null {
  if (socket !== undefined) return socket
  const url = process.env.NEXT_PUBLIC_REALTIME_URL
  if (typeof window === "undefined" || isMockMode() || !url) {
    return null
  }
  socket = io(url, { transports: ["websocket"], reconnectionDelayMax: 10_000 })
  socket.on("connect", () => {
    const ids = Array.from(watchers.keys())
    if (ids.length) socket?.emit("subscribe", { inventory_item_ids: ids.slice(0, 100) })
  })
  return socket
}

/**
 * Watches inventory items: `onUpdate` gets every `stock:update` of the page
 * (callers ignore the items they do not show), `onReconnect` runs after the
 * connection comes back, since updates sent while it was down are lost.
 * Returns the function that stops watching. Does nothing when there is no
 * connection: the badges keep the numbers they were rendered with.
 */
export function watchStock(itemIds: string[], onUpdate: (update: StockUpdate) => void, onReconnect: () => void): () => void {
  const s = connection()
  const ids = Array.from(new Set(itemIds)).slice(0, 100)
  if (!s || !ids.length) return () => {}

  const fresh = ids.filter((id) => !watchers.has(id))
  for (const id of ids) watchers.set(id, (watchers.get(id) ?? 0) + 1)
  if (fresh.length && s.connected) s.emit("subscribe", { inventory_item_ids: fresh })

  let connectedOnce = s.connected
  const onConnect = () => {
    if (connectedOnce) onReconnect()
    connectedOnce = true
  }
  s.on("stock:update", onUpdate)
  s.on("connect", onConnect)

  return () => {
    s.off("stock:update", onUpdate)
    s.off("connect", onConnect)
    const gone: string[] = []
    for (const id of ids) {
      const left = (watchers.get(id) ?? 1) - 1
      if (left > 0) {
        watchers.set(id, left)
      } else {
        watchers.delete(id)
        gone.push(id)
      }
    }
    if (gone.length && s.connected) s.emit("unsubscribe", { inventory_item_ids: gone })
  }
}

"use client"

import { readLiveStock } from "@lib/data/stock"
import { watchStock } from "@lib/realtime/socket"
import { applyStockUpdate, type LiveStock } from "@lib/util/stock"
import { useEffect, useState } from "react"

/**
 * Live stock of some variants, by variant id: the held-aware numbers of
 * backend API-15, then kept current by the realtime gateway (API-16).
 * Variants missing from the result (mock mode, backend or gateway down, not
 * loaded yet) keep the number they were rendered with.
 */
export function useLiveStock(variantIds: (string | undefined)[]): Record<string, LiveStock> {
  const [stock, setStock] = useState<Record<string, LiveStock>>({})
  const key = Array.from(new Set(variantIds.filter((id): id is string => !!id))).sort().join(",")

  useEffect(() => {
    const ids = key ? key.split(",") : []
    if (!ids.length) return
    let active = true
    let stop = () => {}

    const load = () =>
      readLiveStock(ids)
        .then((fresh) => {
          if (active) setStock(fresh)
          return fresh
        })
        .catch(() => ({}) as Record<string, LiveStock>)

    load().then((fresh) => {
      if (!active) return
      const items = Object.values(fresh).map((entry) => entry.inventoryItemId)
      stop = watchStock(items, (update) => setStock((prev) => applyStockUpdate(prev, update)), load)
    })

    return () => {
      active = false
      stop()
    }
  }, [key])

  return stock
}

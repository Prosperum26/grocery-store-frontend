"use client"

import { useCart } from "@lib/context/cart-context"
import { useToast } from "@lib/context/toast-context"
import { addReorderBasket, getReorderBasket } from "@lib/data/predictive"
import { EMPTY_BASKET, type BasketView } from "@lib/util/basket"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { LuPlus, LuRepeat } from "react-icons/lu"

/**
 * "Có thể bạn cần mua lại" with the real basket (backend API-3). Nothing is
 * drawn for a visitor who is not signed in or has no past orders: an empty
 * "buy again" box would only be noise.
 */
export default function BuyAgainLive() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const { refresh } = useCart()
  const { show } = useToast()
  const [basket, setBasket] = useState<BasketView>(EMPTY_BASKET)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getReorderBasket()
      .then(setBasket)
      .catch(() => undefined)
  }, [])

  if (basket.items.length === 0) {
    return null
  }

  const addAll = async () => {
    setBusy(true)
    const { added, skipped } = await addReorderBasket(countryCode)
    await refresh()
    setBusy(false)
    show(
      added > 0
        ? {
            tone: "ok",
            title: `Đã thêm ${added} món vào giỏ`,
            description: skipped > 0 ? `${skipped} món hết hàng nên chưa thêm.` : undefined,
          }
        : { tone: "warn", title: "Chưa thêm được món nào", description: "Các món này hiện đã hết hàng." }
    )
  }

  const total = formatVnd(basket.total)

  return (
    <section
      aria-labelledby="home-buy-again"
      className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-4 small:gap-[18px] small:rounded-card small:p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent-soft text-accent-ink small:h-10 small:w-10 small:rounded-xl">
          <LuRepeat size={18} />
        </span>
        <h2 id="home-buy-again" className="font-sans text-base font-semibold small:font-display small:text-[28px] small:font-bold small:leading-[34px]">
          Có thể bạn cần mua lại
        </h2>
        {basket.addableCount > 0 && (
          <Button variant="primary" size="md" icon={<LuPlus />} className="ml-auto hidden small:inline-flex" onClick={addAll} aria-disabled={busy || undefined}>
            {busy ? "Đang thêm…" : `Thêm tất cả · ${total}`}
          </Button>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-3.5 small:grid-cols-5">
        {basket.items.map((item) => (
          <li key={item.variantId} className={"flex flex-col gap-2.5 rounded-2xl border border-line p-2.5 " + (item.inStock ? "" : "opacity-60")}>
            <LocalizedClientLink href={`/products/${item.handle}`} className="flex flex-col gap-2.5">
              <div className="aspect-[1.4] overflow-hidden rounded-btn">
                <ProductArt product={{ title: item.title, art: item.art, tint: item.tint }} decorative scale={0.7} />
              </div>
              <div className="px-0.5">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="truncate text-xs text-ink">{item.quantityLabel}</p>
              </div>
            </LocalizedClientLink>
            <p className="px-0.5 font-mono text-base font-bold">
              {item.inStock ? formatVnd(item.linePrice) : "Hết hàng"}
            </p>
          </li>
        ))}
      </ul>

      {basket.addableCount > 0 && (
        <Button variant="deep" size="lg" icon={<LuPlus />} fullWidth className="small:hidden" onClick={addAll} aria-disabled={busy || undefined}>
          {busy ? "Đang thêm…" : `Thêm cả ${basket.addableCount} món · ${total}`}
        </Button>
      )}
    </section>
  )
}

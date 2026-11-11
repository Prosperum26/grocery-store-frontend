import { Metadata } from "next"
import { LuArrowRight, LuRepeat } from "react-icons/lu"

import { getReorderSchedule } from "@lib/data/predictive"
import { formatVnd } from "@lib/util/price"
import type { BasketItemView } from "@lib/util/basket"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"
import AddTodayButton from "@modules/reorder/add-today-button"

export const metadata: Metadata = {
  title: "Mua lại · Com4Fud",
}

function ItemCard({ item, note }: { item: BasketItemView; note?: string }) {
  return (
    <li className={"flex flex-col gap-2.5 rounded-2xl border border-line p-2.5 " + (item.inStock ? "" : "opacity-60")}>
      <LocalizedClientLink href={`/products/${item.handle}`} className="flex flex-col gap-2.5">
        <div className="aspect-square overflow-hidden rounded-btn">
          <ProductArt product={{ title: item.title, art: item.art, tint: item.tint, thumbnail: item.thumbnail }} decorative fit="contain" scale={0.7} />
        </div>
        <div className="px-0.5">
          <p className="truncate text-sm font-semibold">{item.title}</p>
          <p className="truncate text-xs text-ink">{item.quantityLabel}</p>
        </div>
      </LocalizedClientLink>
      <p className="px-0.5 font-mono text-base font-bold">
        {item.inStock ? formatVnd(item.linePrice) : "Hết hàng"}
      </p>
      {note && <p className="px-0.5 text-xs font-semibold text-accent-ink">{note}</p>}
    </li>
  )
}

const GRID = "grid grid-cols-2 gap-3.5 small:grid-cols-5"

export default async function ReorderPage() {
  const { today, upcoming, total, addableCount } = await getReorderSchedule()

  return (
    <div className="content-container flex flex-col gap-8 pb-28 pt-5 small:pb-24 small:pt-8">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <LuRepeat size={20} />
        </span>
        <h1 className="font-display text-[28px] font-bold leading-[34px]">Mua lại</h1>
      </div>

      {today.length === 0 && upcoming.length === 0 && (
        <section className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface p-6">
          <p className="text-sm text-ink">
            Gợi ý mua lại sẽ xuất hiện khi bạn đã đăng nhập và có từ 2 đơn hàng đã giao.
          </p>
          <Button href="/store" iconRight={<LuArrowRight />}>
            Xem sản phẩm
          </Button>
        </section>
      )}

      {today.length > 0 && (
        <section aria-labelledby="reorder-today" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="reorder-today" className="text-xl font-semibold">
              Top {today.length} nên mua lại hôm nay
            </h2>
            {addableCount > 0 && <AddTodayButton label={`Thêm tất cả · ${formatVnd(total)}`} />}
          </div>
          <ul className={GRID}>
            {today.map((item) => (
              <ItemCard key={item.variantId} item={item} />
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-labelledby="reorder-upcoming" className="flex flex-col gap-4">
          <div>
            <h2 id="reorder-upcoming" className="text-xl font-semibold">
              Sắp cần mua lại
            </h2>
            <p className="text-sm text-ink">Số ngày là ước tính, dựa trên chu kỳ mua hàng của bạn.</p>
          </div>
          <ul className={GRID}>
            {upcoming.map((item) => (
              <ItemCard key={item.variantId} item={item} note={item.daysLabel} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

import Image from "next/image"
import { LuArrowRight, LuLeaf, LuTruck } from "react-icons/lu"

import { formatVnd, salePercent } from "@lib/util/price"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SaleSticker from "@modules/common/components/sale-sticker"
import type { ProductVM } from "types/viewmodels"

function Art({ name, className }: { name?: string; className: string }) {
  if (!name) return null
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <Image src={`/art/${name}.svg`} alt="" fill unoptimized className="object-contain" />
    </span>
  )
}

/**
 * Promo banners that open the home page (homeD()/homeM() in pages_a.js): one
 * big banner for today's best deal and, on desktop, two small cards. The
 * design's "free delivery from 300.000đ" card is replaced (plan O4).
 */
export default function PromoBanners({
  promo,
  spinach,
}: {
  promo?: ProductVM
  spinach?: ProductVM
}) {
  const percent = promo ? salePercent(promo.originalPrice, promo.price) : null

  return (
    <section aria-label="Ưu đãi nổi bật" className="grid gap-4 small:grid-cols-[1fr_360px]">
      {promo && (
        <div
          data-surface="dark"
          className="relative flex min-h-[156px] flex-col gap-2 overflow-hidden rounded-[20px] bg-brand p-4 text-white small:min-h-[300px] small:gap-3.5 small:rounded-banner small:p-10 small:pl-11"
        >
          <span
            aria-hidden="true"
            className="absolute -right-10 -top-1.5 h-[170px] w-[170px] rounded-full bg-brand-deep small:-right-10 small:-top-2.5 small:h-80 small:w-80"
          />
          <Art name={promo.art} className="-right-1.5 top-3.5 h-[140px] w-[140px] small:right-5 small:top-7 small:h-[250px] small:w-[250px]" />
          <Art name="chili" className="hidden small:block small:bottom-[-10px] small:right-[230px] small:h-[110px] small:w-[110px]" />

          {percent && (
            <SaleSticker large className="relative" label={`Giảm ${percent}% hôm nay`}>
              −{percent}% HÔM NAY
            </SaleSticker>
          )}
          <h2 className="relative max-w-[190px] text-[28px] font-bold leading-[34px] small:max-w-none small:text-[52px] small:font-extrabold small:leading-[56px] small:tracking-tight">
            {promo.title}
          </h2>
          <p className="relative flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="font-mono text-xl font-bold small:text-[28px]">{formatVnd(promo.price)}</span>
            {promo.originalPrice && (
              <span className="font-mono text-xs text-sale-bg line-through small:text-sm">
                <span className="sr-only">Giá cũ </span>
                {formatVnd(promo.originalPrice)}
              </span>
            )}
            <span className="hidden text-sm text-brand-bg small:inline">/ {promo.unitLabel.toLowerCase()}</span>
          </p>
          <div className="relative mt-auto flex flex-wrap gap-3">
            <Button href={`/products/${promo.handle}`} variant="warn" size="sm" iconRight={<LuArrowRight />} className="small:h-[52px] small:px-6 small:text-[15px]">
              Mua ngay
            </Button>
            <Button href="/store" variant="onDark" size="lg" className="hidden small:inline-flex">
              Xem ưu đãi khác
            </Button>
          </div>
        </div>
      )}

      <div className="hidden flex-col gap-4 small:flex">
        {spinach && (
          <LocalizedClientLink
            href={`/products/${spinach.handle}`}
            className="relative flex h-[142px] flex-col gap-1.5 overflow-hidden rounded-[20px] bg-brand-bg p-6 pr-32 text-brand-deep hover:brightness-[0.98]"
          >
            <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em]">
              <LuLeaf size={16} aria-hidden="true" /> Rau sáng nay
            </span>
            <span className="font-display text-[22px] font-bold leading-7">
              {spinach.title} {formatVnd(spinach.price)} một bó
            </span>
            <Art name={spinach.art} className="bottom-[-6px] right-2.5 h-[120px] w-[120px]" />
          </LocalizedClientLink>
        )}
        <LocalizedClientLink
          href="/chinh-sach/giao-hang"
          className="relative flex h-[142px] flex-col gap-1.5 overflow-hidden rounded-[20px] bg-warn p-6 pr-32 text-ink hover:brightness-[0.98]"
        >
          <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em]">
            <LuTruck size={16} aria-hidden="true" /> Giao trong ngày
          </span>
          <span className="font-display text-[22px] font-bold leading-7">Chọn khung giờ giao hợp với bạn</span>
          <Art name="eggs" className="bottom-[-6px] right-2.5 h-[120px] w-[120px]" />
        </LocalizedClientLink>
      </div>
    </section>
  )
}

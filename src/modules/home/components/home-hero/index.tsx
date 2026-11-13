import Image from "next/image"
import { LuTruck } from "react-icons/lu"

import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

function Art({ name, className }: { name: string; className: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <Image src={`/art/${name}.svg`} alt="" fill unoptimized className="object-contain" />
    </span>
  )
}

/**
 * Opening band of the home page. It says what the shop is and when the order
 * arrives, and it is kept short on purpose: the products below are what
 * people came for, so they must start on the first screen.
 */
export default function HomeHero({ showKitchen }: { showKitchen: boolean }) {
  return (
    <section aria-labelledby="home-hero" className="grid gap-3 small:grid-cols-[1fr_340px] small:gap-4">
      <div
        data-surface="dark"
        className="relative flex flex-col gap-3 overflow-hidden rounded-[20px] bg-brand p-5 text-white small:min-h-[200px] small:justify-center small:rounded-banner small:p-9"
      >
        <span aria-hidden="true" className="absolute -right-12 -top-10 h-56 w-56 rounded-full bg-brand-deep small:h-80 small:w-80" />
        <Art name="tomato" className="right-3 top-3 hidden h-24 w-24 xsmall:block small:right-44 small:top-6 small:h-28 small:w-28" />
        <Art name="fishFillet" className="hidden small:block small:right-10 small:top-10 small:h-36 small:w-36" />
        <Art name="herbs" className="hidden small:block small:bottom-[-14px] small:right-36 small:h-28 small:w-28" />

        <h2 id="home-hero" className="relative max-w-[30ch] font-display text-2xl font-bold leading-8 small:text-[38px] small:leading-[44px]">
          Đi chợ online, giao trong ngày tại TP.HCM
        </h2>
        <p className="relative max-w-[46ch] text-sm text-brand-bg small:text-base">
          Rau củ, thịt cá và đồ khô cho bữa cơm nhà. Chọn khung giờ nhận hàng lúc thanh toán.
        </p>
        <div className="relative flex flex-wrap gap-2.5 pt-1">
          <Button href="/store" variant="warn">
            Xem sản phẩm
          </Button>
          {showKitchen && (
            <Button href="/tro-ly-bep" variant="onDark">
              Hôm nay nấu gì?
            </Button>
          )}
        </div>
      </div>

      <LocalizedClientLink
        href="/chinh-sach/giao-hang"
        className="relative hidden flex-col justify-center gap-1.5 overflow-hidden rounded-[20px] bg-warn p-6 pr-32 text-ink hover:brightness-[0.98] small:flex"
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <LuTruck size={16} aria-hidden="true" /> Giao trong ngày
        </span>
        <span className="font-display text-[22px] font-bold leading-7">Chọn khung giờ giao hợp với bạn</span>
        <span className="text-sm">Xem phí và khu vực giao hàng</span>
        <Art name="eggs" className="bottom-[-6px] right-2.5 h-[120px] w-[120px]" />
      </LocalizedClientLink>
    </section>
  )
}

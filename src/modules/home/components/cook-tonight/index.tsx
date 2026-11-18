import { LuChefHat, LuSearch } from "react-icons/lu"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Dish searches that the recipe set answers well (checked against the AI service on 2026-11-10).
const IDEAS = ["Canh chua", "Cá kho", "Gỏi cuốn", "Lẩu thái", "Cơm chiên", "Bánh xèo"]

/**
 * "Hôm nay nấu gì?": the way into Trợ lý Bếp from the home page. A plain GET
 * form (works without JavaScript) and a few dish ideas; both land on the
 * recipe search, where a dish opens with its ingredients ready for the cart.
 */
export default function CookTonight({ countryCode }: { countryCode: string }) {
  return (
    <section
      aria-labelledby="home-cook"
      className="flex flex-col gap-4 rounded-[20px] bg-accent-soft p-5 small:flex-row small:items-center small:gap-8 small:rounded-banner small:p-8"
    >
      <div className="flex items-start gap-3 small:w-[340px] small:shrink-0">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 -rotate-6 items-center justify-center rounded-2xl bg-accent text-ink">
          <LuChefHat size={24} />
        </span>
        <div>
          <h2 id="home-cook" className="font-display text-xl font-bold text-ink small:text-[26px] small:leading-8">
            Hôm nay nấu gì?
          </h2>
          <p className="text-sm text-accent-ink">Chọn món, Trợ lý Bếp gom đủ nguyên liệu còn hàng vào giỏ.</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <form role="search" action={`/${countryCode}/tro-ly-bep`} method="get" className="flex gap-2">
          <label htmlFor="home-cook-q" className="sr-only">
            Tên món ăn
          </label>
          <div className="relative flex-1">
            <LuSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="home-cook-q"
              name="q"
              type="search"
              required
              maxLength={300}
              placeholder="Gõ tên món, ví dụ “canh chua cá lóc”"
              className="h-11 w-full rounded-btn border border-line-2 bg-surface pl-10 pr-3 text-sm"
            />
          </div>
          <button type="submit" className="h-11 shrink-0 rounded-btn bg-accent-ink px-4 text-sm font-semibold text-white hover:brightness-110">
            Tìm món
          </button>
        </form>
        <ul className="flex flex-wrap gap-2">
          {IDEAS.map((idea) => (
            <li key={idea}>
              <LocalizedClientLink
                href={`/tro-ly-bep?q=${encodeURIComponent(idea.toLowerCase())}`}
                className="inline-flex h-9 items-center rounded-full border border-accent-ink/30 bg-surface px-3.5 text-sm font-medium text-ink hover:bg-accent"
              >
                {idea}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

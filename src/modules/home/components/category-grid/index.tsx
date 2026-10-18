import { MOCK_CATEGORY_LIST } from "@lib/mock/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"
import type { Tint } from "types/viewmodels"

/**
 * "Danh mục" tiles (catTile() in pages_a.js): name top-left, illustration
 * bottom-right on the category's tinted plate. 8 in a row on desktop, 4×2 on
 * phones. The category list is fixed by the design (plan §2), so it is read
 * from the shared constant rather than fetched.
 */
export default function CategoryGrid() {
  return (
    <section aria-labelledby="home-categories" className="flex flex-col gap-3 small:gap-4">
      <div className="flex items-end justify-between">
        <h2 id="home-categories" className="text-lg font-bold small:text-[28px] small:leading-[34px]">
          Danh mục
        </h2>
        <LocalizedClientLink href="/store" className="text-sm font-semibold text-brand hover:underline small:hidden">
          Tất cả
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-4 gap-2 small:grid-cols-8 small:gap-4">
        {MOCK_CATEGORY_LIST.map((c) => (
          <li key={c.handle}>
            <LocalizedClientLink
              href={`/categories/${c.handle}`}
              className="relative block h-[84px] overflow-hidden rounded-[18px] small:h-[120px]"
            >
              <ProductArt
                product={{ title: c.name, art: c.art, tint: c.tint as Tint }}
                decorative
                scale={0.62}
                className="!items-end !justify-end pb-0 pr-1 [&>div]:-mb-1"
              />
              <span className="absolute left-2.5 top-2.5 right-2 text-xs font-semibold leading-4 text-ink small:left-3 small:top-3 small:text-base small:leading-6">
                {c.name}
              </span>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

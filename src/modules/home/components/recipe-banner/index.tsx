import { LuChefHat, LuPlus } from "react-icons/lu"

import { MOCK_RECIPE, basketTotal } from "@lib/mock/home"
import { formatVnd } from "@lib/util/price"
import {
  ComingSoonBadge,
  ComingSoonButton,
} from "@modules/common/components/coming-soon"
import ProductArt from "@modules/products/components/product-art"
import type { ProductVM } from "types/viewmodels"

const FEATURE = "Công thức vào giỏ"

/**
 * "Tối nay nấu gì?" banner (pages_a.js) in placeholder state: recipe to cart
 * needs the Recipe RAG module (phase 2), so both buttons open the
 * coming-soon dialog.
 */
export default function RecipeBanner({ catalog }: { catalog: ProductVM[] }) {
  const recipe = MOCK_RECIPE
  const ingredients = recipe.ingredients
    .map((i) => ({ ...i, product: catalog.find((p) => p.handle === i.handle) }))
    .filter((i): i is typeof i & { product: ProductVM } => Boolean(i.product))
  const total = formatVnd(basketTotal(recipe.ingredients, catalog))

  return (
    <section
      aria-labelledby="home-recipe"
      data-surface="dark"
      className="relative flex flex-col gap-3 overflow-hidden rounded-[20px] bg-brand-deep p-4 text-white small:flex-row small:items-center small:gap-6 small:rounded-banner small:px-10 small:py-8"
    >
      <div className="flex flex-1 flex-col gap-2.5 small:gap-3">
        <p className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-accent">
            <LuChefHat size={16} aria-hidden="true" /> Tối nay nấu gì?
          </span>
          <ComingSoonBadge />
        </p>
        <h2 id="home-recipe" className="text-lg font-bold small:text-4xl small:leading-[42px]">
          {recipe.name}
          <span className="hidden small:inline"> cho {recipe.serves} người</span>
        </h2>
        <p className="hidden text-base text-brand-bg small:block">
          Đủ {ingredients.length} nguyên liệu tươi, nấu trong {recipe.minutes} phút.
        </p>
        <ul aria-label="Nguyên liệu" className="flex small:hidden">
          {ingredients.map((i) => (
            <li key={i.handle} className="-ml-2.5 h-10 w-10 overflow-hidden rounded-full border-2 border-brand-deep bg-surface first:ml-0">
              <ProductArt product={i.product} dots={false} scale={0.8} plateColor="#FFFFFF" />
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 pt-1.5">
          <ComingSoonButton feature={FEATURE} icon={<LuPlus />} variant="warn" className="max-small:w-full">
            Thêm {ingredients.length} nguyên liệu · {total}
          </ComingSoonButton>
          <ComingSoonButton feature={FEATURE} variant="onDark" className="hidden small:inline-flex">
            Xem công thức
          </ComingSoonButton>
        </div>
      </div>

      <ul aria-hidden="true" className="hidden items-start gap-3 small:flex">
        {ingredients.map((i, index) => (
          <li key={i.handle} className={`flex w-[86px] flex-col items-center gap-1.5 ${index % 2 ? "pt-6" : ""}`}>
            <span className="h-[86px] w-[86px] overflow-hidden rounded-full bg-surface">
              <ProductArt product={i.product} dots={false} scale={0.74} plateColor="#FFFFFF" />
            </span>
            <span className="text-xs font-semibold">{i.short}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

import { MOCK_CATEGORY_LIST } from "@lib/mock/categories"
import { resolveVariant } from "@lib/mock/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import ProductActions from "@modules/products/components/product-actions"
import ProductArt from "@modules/products/components/product-art"
import ProductTabs from "@modules/products/components/product-tabs"
import ScaleLabel from "@modules/products/components/scale-label"
import type { ProductVM } from "types/viewmodels"

/**
 * Product page of the v2 design (03_Chi_Tiet_San_Pham_*). Desktop: image
 * with the scale label on the left, buying panel on the right. Phone: one
 * column, with the buying bar floating above the bottom nav.
 */
export default function ProductTemplate({
  product,
  companions,
}: {
  product: ProductVM
  companions: ProductVM[]
}) {
  const category = MOCK_CATEGORY_LIST.find((c) => c.handle === product.categoryHandle)
  const defaultVariant = resolveVariant(product)

  return (
    <div className="content-container flex flex-col gap-10 pb-44 pt-6 small:pb-16 small:pt-8">
      <nav aria-label="Đường dẫn">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <li>
            <LocalizedClientLink href="/" className="hover:text-ink hover:underline">
              Trang chủ
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <LocalizedClientLink
              href={category ? `/categories/${category.handle}` : "/store"}
              className="hover:text-ink hover:underline"
            >
              {category?.name ?? "Tất cả sản phẩm"}
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 small:grid-cols-[minmax(0,560px)_minmax(0,1fr)] small:gap-12">
        <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border border-line">
          <ProductArt product={product} scale={0.62} dots sizes="(max-width: 1024px) 100vw, 560px" />
          {defaultVariant && (
            <div className="absolute bottom-5 right-5 hidden small:block">
              <ScaleLabel variant={defaultVariant} packLabel={defaultVariant.label} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-2">
              {category && <span className="rounded-chip bg-page-2 px-2.5 py-1">{category.name}</span>}
              {product.origin && <span className="rounded-chip bg-page-2 px-2.5 py-1">{product.origin}</span>}
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-ink small:text-[40px]">
              {product.title}
            </h1>
          </div>
          <ProductActions product={product} />
        </div>
      </div>

      <section aria-labelledby="pdp-info" className="flex flex-col gap-4">
        <h2 id="pdp-info" className="font-display text-xl font-bold text-ink">
          Thông tin sản phẩm
        </h2>
        <ProductTabs description={product.description} />
      </section>

      {companions.length > 0 && (
        <section aria-labelledby="pdp-companions" className="flex flex-col gap-4">
          <h2 id="pdp-companions" className="font-display text-xl font-bold text-ink">
            Thường mua kèm
          </h2>
          <ul className="grid grid-cols-2 gap-3 small:grid-cols-4 small:gap-5">
            {companions.map((p) => (
              <li key={p.id} className="flex">
                <ProductCard product={p} className="w-full" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRow from "@modules/home/components/product-row"
import ProductCard from "@modules/products/components/product-card"
import ProductActions from "@modules/products/components/product-actions"
import ProductArt from "@modules/products/components/product-art"
import type { ProductVM } from "types/viewmodels"

/**
 * Product page. Desktop: the photo on the left (whole pack on white, as on
 * the cards), the buying panel on the right. Phone: one column, with the
 * buying bar floating above the bottom nav (ProductActions). Below: the
 * description when the catalog has a real one, "Thường mua kèm", then other
 * products of the same category.
 */
export default function ProductTemplate({
  product,
  companions,
  sameCategory,
}: {
  product: ProductVM
  companions: ProductVM[]
  sameCategory: ProductVM[]
}) {
  const category =
    product.categoryHandle && product.categoryName ? { handle: product.categoryHandle, name: product.categoryName } : null
  // Many catalog descriptions only repeat the name: show the block only when it says more.
  const description = product.description?.trim()
  const hasDescription = Boolean(description && description.toLowerCase() !== product.title.toLowerCase())

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
        <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border border-line bg-white">
          <ProductArt product={product} scale={0.62} dots fit="contain" sizes="(max-width: 1024px) 100vw, 560px" />
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

      {hasDescription && (
        <section aria-labelledby="pdp-info" className="flex max-w-3xl flex-col gap-3">
          <h2 id="pdp-info" className="font-display text-xl font-bold text-ink">
            Thông tin sản phẩm
          </h2>
          <p className="whitespace-pre-line text-sm leading-6 text-ink-2">{description}</p>
        </section>
      )}

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
      {category && sameCategory.length > 0 && (
        <ProductRow
          id="pdp-same-category"
          title={`Cùng danh mục ${category.name.toLowerCase()}`}
          href={`/categories/${category.handle}`}
          linkLabel={`Xem tất cả ${category.name.toLowerCase()}`}
          products={sameCategory}
        />
      )}
    </div>
  )
}

import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  filterCatalog,
  ListingParams,
  paginate,
  sortCatalog,
} from "@lib/util/catalog"
import { toProductVM } from "@lib/viewmodels/product"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import ListingControls, { SortSelect } from "@modules/store/components/listing-controls"
import ListingPagination from "@modules/store/components/listing-pagination"

/** 9 cards: a full 3×3 grid on desktop (design 02). */
export const PAGE_SIZE = 9

type StoreTemplateProps = {
  countryCode: string
  params: ListingParams
  /** Set on /categories/[handle]; the store (/store) has no category. */
  category?: { handle: string; name: string }
}

/**
 * Product list of the v2 design (02_San_Pham_*). Server component: it reads
 * the catalog (mock or Medusa), applies the URL state, and renders. The
 * filter controls are small client components that only change the URL.
 */
export default async function StoreTemplate({
  countryCode,
  params,
  category,
}: StoreTemplateProps) {
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  })
  const catalog = response.products.map(toProductVM)
  const categories = (await listCategories()) ?? []

  const matched = sortCatalog(
    filterCatalog(catalog, {
      category: category?.handle,
      q: params.q,
      inStock: params.inStock,
      onSale: params.onSale,
    }),
    params.sort
  )
  const page = paginate(matched, params.page, PAGE_SIZE)

  const basePath = category ? `/categories/${category.handle}` : "/store"
  const title = category?.name ?? (params.q ? `Kết quả cho “${params.q}”` : "Tất cả sản phẩm")
  const hasFilters = Boolean(params.q || params.inStock || params.onSale)
  const countIn = (handle: string) =>
    catalog.filter((p) => p.categoryHandle === handle).length

  const categoryLinkClass = (active: boolean) =>
    `flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-sm ${
      active ? "bg-brand-bg font-semibold text-brand" : "text-ink hover:bg-page"
    }`

  return (
    <div className="content-container flex flex-col gap-6 py-6 small:py-8">
      <nav aria-label="Đường dẫn">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <li>
            <LocalizedClientLink href="/" className="hover:text-ink hover:underline">
              Trang chủ
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true">/</li>
          {category ? (
            <>
              <li>
                <LocalizedClientLink href="/store" className="hover:text-ink hover:underline">
                  Tất cả sản phẩm
                </LocalizedClientLink>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-ink">
                {category.name}
              </li>
            </>
          ) : (
            <li aria-current="page" className="font-semibold text-ink">
              {title}
            </li>
          )}
        </ol>
      </nav>

      <div className="flex items-start gap-8">
        <aside
          aria-label="Bộ lọc sản phẩm"
          className="hidden w-[264px] shrink-0 flex-col gap-6 small:flex"
        >
          <section aria-labelledby="listing-categories" className="rounded-card border border-line bg-surface p-3">
            <h2 id="listing-categories" className="px-3 pb-2 pt-1 font-mono text-xs font-semibold uppercase tracking-wide text-ink-2">
              Danh mục
            </h2>
            <ul className="flex flex-col gap-0.5">
              <li>
                <LocalizedClientLink
                  href="/store"
                  aria-current={!category ? "page" : undefined}
                  className={categoryLinkClass(!category)}
                >
                  <span>Tất cả sản phẩm</span>
                  <span className="font-mono text-xs text-ink-3">{catalog.length}</span>
                </LocalizedClientLink>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    aria-current={category?.handle === c.handle ? "page" : undefined}
                    className={categoryLinkClass(category?.handle === c.handle)}
                  >
                    <span>{c.name}</span>
                    <span className="font-mono text-xs text-ink-3">{countIn(c.handle)}</span>
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Lọc nhanh" className="rounded-card border border-line bg-surface p-5">
            <ListingControls params={params} variant="sidebar" />
          </section>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Phone: categories as a scrolling row of links. */}
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 small:hidden" aria-label="Danh mục">
            <li className="shrink-0">
              <LocalizedClientLink
                href="/store"
                aria-current={!category ? "page" : undefined}
                className={`inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-sm font-medium ${
                  !category ? "border-ink bg-ink text-white" : "border-line-2 bg-surface text-ink"
                }`}
              >
                Tất cả
              </LocalizedClientLink>
            </li>
            {categories.map((c) => {
              const on = category?.handle === c.handle
              return (
                <li key={c.id} className="shrink-0">
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    aria-current={on ? "page" : undefined}
                    className={`inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-sm font-medium ${
                      on ? "border-ink bg-ink text-white" : "border-line-2 bg-surface text-ink"
                    }`}
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              )
            })}
          </ul>
          <div className="small:hidden">
            <ListingControls params={params} variant="chips" />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-2">
                {catalog.length} món
              </p>
              <h1 className="font-display text-2xl font-bold text-ink small:text-[32px] small:leading-tight">
                {title}
              </h1>
            </div>
            <SortSelect params={params} />
          </div>

          <p aria-live="polite" className="text-sm text-ink-2">
            {page.total > 0
              ? `Hiển thị ${page.from}–${page.to} / ${page.total} sản phẩm`
              : "Không có sản phẩm nào"}
          </p>

          {page.items.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 small:grid-cols-3 small:gap-5" data-testid="products-list">
              {page.items.map((p) => (
                <li key={p.id} className="flex">
                  <ProductCard product={p} className="w-full" />
                </li>
              ))}
            </ul>
          ) : (
            <section
              aria-labelledby="listing-empty"
              className="flex flex-col items-start gap-3 rounded-card border border-dashed border-line-2 bg-surface p-6 small:p-8"
            >
              <h2 id="listing-empty" className="font-display text-xl font-bold text-ink">
                Không có sản phẩm phù hợp
              </h2>
              <p className="text-sm text-ink-2">
                {hasFilters
                  ? "Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác."
                  : "Danh mục này chưa có sản phẩm."}
              </p>
              {hasFilters && (
                <Button variant="secondary" href={basePath}>
                  Xóa bộ lọc
                </Button>
              )}
            </section>
          )}

          <ListingPagination
            basePath={basePath}
            params={params}
            page={page.page}
            totalPages={page.totalPages}
          />
        </div>
      </div>
    </div>
  )
}

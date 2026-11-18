import { listCategories } from "@lib/data/categories"
import { getListing } from "@lib/data/catalog"
import { getRegion } from "@lib/data/regions"
import { hasListingFilters, ListingParams, relatedWords } from "@lib/util/catalog"
import { isMockMode } from "@lib/mock/mode"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import ListingPagination from "@modules/store/components/listing-pagination"
import ListingSidebar from "@modules/store/components/listing-sidebar"
import { LuChefHat, LuSlidersHorizontal } from "react-icons/lu"

/** 24 cards fill whole rows at every width the grid uses (2, 3 and 4 columns). */
export const PAGE_SIZE = 24

type StoreTemplateProps = {
  countryCode: string
  params: ListingParams
  /** Set on /categories/[handle]; the store (/store) has no category. */
  category?: { handle: string; name: string }
}

/**
 * Product list. Server component: it asks getListing for the page the URL
 * describes (mock data or the Medusa search) and renders it. The filter
 * controls are small client components that only change the URL.
 *
 * Layout: on desktop the filters (sort, category, kind, price, state,
 * keywords) sit in a left column and the grid holds four products per row.
 * On phones the same filters fold into a "Bộ lọc" panel above the grid, so
 * the products still start near the top of the screen.
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

  const categories = (await listCategories()) ?? []
  const { page, totalAll, categoryCounts, subcategories } = await getListing({
    countryCode,
    params,
    category,
    categories,
    pageSize: PAGE_SIZE,
  })

  const basePath = category ? `/categories/${category.handle}` : "/store"
  const title = category?.name ?? (params.q ? `Kết quả cho “${params.q}”` : "Tất cả sản phẩm")
  const hasFilters = hasListingFilters(params)
  // How many filters are on, shown on the phone "Bộ lọc" button.
  const activeCount = [
    params.q,
    params.inStock,
    params.onSale,
    params.minPrice || params.maxPrice,
    params.sub,
  ].filter(Boolean).length

  const sidebar = (
    <ListingSidebar
      params={params}
      basePath={basePath}
      categories={categories.map((c) => ({ handle: c.handle, name: c.name, count: categoryCounts[c.handle] }))}
      currentCategory={category?.handle}
      totalAll={totalAll}
      subcategories={subcategories}
      related={relatedWords(
        page.items.map((p) => p.title),
        [params.q, category?.name].filter(Boolean).join(" ")
      )}
    />
  )

  // A typed word may be a dish, not a product ("canh chua"): offer the recipe search for the same words.
  const recipeSearch = params.q && !isMockMode() && (
    <LocalizedClientLink
      href={`/tro-ly-bep?q=${encodeURIComponent(params.q)}`}
      className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent"
    >
      <LuChefHat aria-hidden="true" />
      Tìm món ăn với “{params.q}” ở Trợ lý Bếp
    </LocalizedClientLink>
  )

  return (
    <div className="content-container flex flex-col gap-4 py-5 small:gap-5 small:py-7">
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

      <div className="flex flex-col gap-4 small:flex-row small:items-start small:gap-8">
        {/* Desktop: the filters in a column that stays in view while the grid scrolls. */}
        <aside
          aria-label="Bộ lọc"
          className="hidden small:sticky small:top-4 small:block small:max-h-[calc(100vh-2rem)] small:w-[260px] small:shrink-0 small:overflow-y-auto small:pb-4 small:pr-1"
        >
          {sidebar}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-display text-2xl font-bold text-ink small:text-[32px] small:leading-tight">{title}</h1>
            {/* The count of what is listed (search and filters applied), not of the whole catalog. */}
            <p aria-live="polite" className="text-sm text-ink-2">
              {page.total > 0 ? `${page.total} sản phẩm` : "Không có sản phẩm nào"}
            </p>
          </div>

          {/* Phones: the same filters folded into a panel, so the grid starts near the top. */}
          <details className="small:hidden">
            <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-btn border border-line-2 bg-surface px-3.5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <LuSlidersHorizontal aria-hidden="true" />
              Sắp xếp và lọc
              {activeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-xs text-white">
                  {activeCount}
                </span>
              )}
            </summary>
            <div className="mt-3 rounded-card border border-line bg-surface p-4">{sidebar}</div>
          </details>

          {recipeSearch}

          {page.items.length > 0 ? (
            <>
              {/* Cards use h3; this keeps the heading order h1 → h2 → h3. */}
              <h2 className="sr-only">Danh sách sản phẩm</h2>
              <ul
                className="grid grid-cols-2 gap-3 xsmall:grid-cols-3 small:gap-4 medium:grid-cols-4"
                data-testid="products-list"
              >
                {page.items.map((p) => (
                  <li key={p.id} className="flex">
                    <ProductCard product={p} className="w-full" />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <section
              aria-labelledby="listing-empty"
              className="flex flex-col items-start gap-3 rounded-card border border-dashed border-line-2 bg-surface p-6 small:p-8"
            >
              <h2 id="listing-empty" className="font-display text-xl font-bold text-ink">
                Không có sản phẩm phù hợp
              </h2>
              <p className="text-sm text-ink-2">
                {hasFilters ? "Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác." : "Danh mục này chưa có sản phẩm."}
              </p>
              {hasFilters && (
                <Button variant="secondary" href={basePath}>
                  Xóa bộ lọc
                </Button>
              )}
            </section>
          )}

          <ListingPagination basePath={basePath} params={params} page={page.page} totalPages={page.totalPages} />
        </div>
      </div>
    </div>
  )
}

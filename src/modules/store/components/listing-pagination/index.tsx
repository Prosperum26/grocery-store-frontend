import { listingHref, ListingParams, pageWindow } from "@lib/util/catalog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

/** Numbered pages with previous/next. Plain links, so it works without JS. */
export default function ListingPagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string
  params: ListingParams
  page: number
  totalPages: number
}) {
  if (totalPages <= 1) return null

  const href = (p: number) => listingHref(basePath, { ...params, page: p })
  const itemClass =
    "inline-flex h-10 min-w-[40px]items-center justify-center rounded-btn border border-line-2 bg-surface px-3 font-mono text-sm font-semibold text-ink hover:bg-page"

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-2 pt-2">
      {page > 1 ? (
        <LocalizedClientLink href={href(page - 1)} className={itemClass} aria-label="Trang trước">
          <LuChevronLeft aria-hidden="true" />
        </LocalizedClientLink>
      ) : (
        <span aria-hidden="true" className={`${itemClass} opacity-40`}>
          <LuChevronLeft />
        </span>
      )}

      <ol className="flex items-center gap-2">
        {pageWindow(page, totalPages).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-ink-3">
              …
            </li>
          ) : (
            <li key={p}>
              <LocalizedClientLink
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Trang ${p}`}
                className={
                  p === page
                    ? "inline-flex h-10 min-w-[40px] items-center justify-center rounded-btn bg-ink px-3 font-mono text-sm font-semibold text-accent"
                    : itemClass
                }
              >
                {p}
              </LocalizedClientLink>
            </li>
          )
        )}
      </ol>

      {page < totalPages ? (
        <LocalizedClientLink href={href(page + 1)} className={itemClass} aria-label="Trang sau">
          <LuChevronRight aria-hidden="true" />
        </LocalizedClientLink>
      ) : (
        <span aria-hidden="true" className={`${itemClass} opacity-40`}>
          <LuChevronRight />
        </span>
      )}
    </nav>
  )
}

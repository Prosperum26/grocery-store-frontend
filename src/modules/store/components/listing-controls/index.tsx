"use client"

import {
  listingHref,
  ListingParams,
  SORT_KEYS,
  SORT_LABELS,
  SortKey,
} from "@lib/util/catalog"
import FilterChip from "@modules/common/components/filter-chip"
import Toggle from "@modules/common/components/toggle"
import { usePathname, useRouter } from "next/navigation"
import { LuCheck, LuPercent } from "react-icons/lu"

/*
 * Filter controls of the product list. The state lives in the URL: every
 * change pushes a new address and the server renders the matching list. That
 * keeps back/forward working and lets shoppers share a filtered link.
 */

export function useListingNavigate(params: ListingParams) {
  const router = useRouter()
  const pathname = usePathname()
  return (next: Partial<ListingParams>) => {
    // A filter change starts again from page 1 of the new result.
    router.push(listingHref(pathname, { ...params, page: 1, ...next }))
  }
}

/** Desktop sidebar: the two switches of the design. Phone: two chips. */
export default function ListingControls({
  params,
  variant,
}: {
  params: ListingParams
  variant: "sidebar" | "chips"
}) {
  const navigate = useListingNavigate(params)

  if (variant === "chips") {
    return (
      <div className="flex flex-wrap gap-2">
        <FilterChip
          pressed={params.inStock}
          onClick={() => navigate({ inStock: !params.inStock })}
          icon={<LuCheck />}
        >
          Chỉ hiện còn hàng
        </FilterChip>
        <FilterChip
          pressed={params.onSale}
          onClick={() => navigate({ onSale: !params.onSale })}
          icon={<LuPercent />}
        >
          Đang giảm giá
        </FilterChip>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Toggle
        label="Chỉ hiện còn hàng"
        checked={params.inStock}
        onChange={(next) => navigate({ inStock: next })}
      />
      <Toggle
        label="Đang giảm giá"
        checked={params.onSale}
        onChange={(next) => navigate({ onSale: next })}
      />
    </div>
  )
}

export function SortSelect({ params }: { params: ListingParams }) {
  const navigate = useListingNavigate(params)
  return (
    <label className="flex items-center gap-3 text-sm font-semibold text-ink">
      <span className="whitespace-nowrap">Sắp xếp</span>
      <select
        name="sort"
        value={params.sort}
        onChange={(e) => navigate({ sort: e.target.value as SortKey })}
        className="h-10 rounded-btn border-[1.5px] border-line-2 bg-surface px-3 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-brand"
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
    </label>
  )
}

import SkeletonBlock from "@modules/skeletons/components/skeleton-block"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export default function StoreLoading() {
  return (
    <div className="content-container flex flex-col gap-5 py-6">
      <SkeletonBlock className="h-9 w-64" />
      <div className="flex flex-col gap-6 small:flex-row">
        <SkeletonBlock className="hidden h-72 w-60 shrink-0 !rounded-card small:block" />
        <SkeletonProductGrid />
      </div>
    </div>
  )
}

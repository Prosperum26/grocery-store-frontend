import SkeletonBlock from "@modules/skeletons/components/skeleton-block"

export default function ProductLoading() {
  return (
    <div aria-busy="true" className="content-container py-6">
      <p role="status" className="sr-only">
        Đang tải sản phẩm…
      </p>
      <div className="grid gap-8 small:grid-cols-2">
        <SkeletonBlock className="aspect-square w-full !rounded-card" />
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-10 w-4/5" />
          <SkeletonBlock className="h-8 w-40" />
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

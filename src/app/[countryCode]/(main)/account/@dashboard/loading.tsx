import SkeletonBlock from "@modules/skeletons/components/skeleton-block"

export default function Loading() {
  return (
    <div aria-busy="true" className="flex w-full flex-col gap-3">
      <p role="status" className="sr-only">
        Đang tải…
      </p>
      <SkeletonBlock className="h-9 w-56" />
      <SkeletonBlock className="h-28 w-full !rounded-card" />
      <SkeletonBlock className="h-28 w-full !rounded-card" />
    </div>
  )
}

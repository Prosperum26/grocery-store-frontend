import SkeletonBlock from "@modules/skeletons/components/skeleton-block"

/** Placeholder with the proportions of a ProductCard: art plate, name, spec, price. */
const SkeletonProductPreview = () => {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3">
      <SkeletonBlock className="aspect-square w-full !rounded-btn" />
      <SkeletonBlock className="h-5 w-4/5" />
      <SkeletonBlock className="h-4 w-2/5" />
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-6 w-1/3" />
        <SkeletonBlock className="h-9 w-9 !rounded-full" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview

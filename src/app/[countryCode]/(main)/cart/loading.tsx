import SkeletonBlock from "@modules/skeletons/components/skeleton-block"

export default function CartLoading() {
  return (
    <div aria-busy="true" className="content-container py-6">
      <p role="status" className="sr-only">
        Đang tải giỏ hàng…
      </p>
      <div className="grid gap-6 small:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">
          <SkeletonBlock className="h-9 w-48" />
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-24 w-full !rounded-card" />
          ))}
        </div>
        <SkeletonBlock className="h-72 w-full !rounded-card" />
      </div>
    </div>
  )
}

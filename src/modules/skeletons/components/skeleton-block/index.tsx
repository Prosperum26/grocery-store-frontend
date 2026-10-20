import { clx } from "@medusajs/ui"

/**
 * One grey block of a loading skeleton (state "Đang tải" in 12_Trang_Thai_UI).
 * Decorative: the surrounding region carries aria-busy and the status text.
 * The pulse is switched off by the global prefers-reduced-motion rule.
 */
export default function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clx("animate-pulse rounded-btn bg-page-2", className)}
    />
  )
}

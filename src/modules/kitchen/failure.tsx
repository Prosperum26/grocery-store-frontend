import type { KitchenFailure } from "@lib/data/kitchen"

export const FAILURE_TEXT: Record<KitchenFailure, string> = {
  unavailable: "Trợ lý Bếp tạm nghỉ, bạn thử lại sau nhé.",
  not_found: "Không tìm thấy món này.",
  error: "Có lỗi xảy ra, bạn thử lại nhé.",
}

/** Message shown when the backend or the AI service could not answer. */
export function FailureNote({ reason }: { reason: KitchenFailure }) {
  return (
    <p role="alert" className="rounded-2xl bg-warn-bg p-4 text-sm text-warn-ink">
      {FAILURE_TEXT[reason]}
    </p>
  )
}

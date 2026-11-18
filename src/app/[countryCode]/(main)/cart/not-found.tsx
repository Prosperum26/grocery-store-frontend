import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404",
  description: "Đã có lỗi xảy ra",
}

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-2 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">Không tìm thấy giỏ hàng</h1>
      <p className="text-sm text-ink-2">
        Giỏ hàng bạn mở không tồn tại. Hãy xóa cookie của trình duyệt rồi thử
        lại.
      </p>
      <InteractiveLink href="/">Về trang chủ</InteractiveLink>
    </div>
  )
}

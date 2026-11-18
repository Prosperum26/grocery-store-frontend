import { Metadata } from "next"

import NotFoundPanel from "@modules/common/components/not-found-panel"

export const metadata: Metadata = {
  title: "Không tìm thấy trang | Com4Fud",
  description: "Trang này không tồn tại.",
}

export default function NotFound() {
  return (
    <main id="main" className="min-h-[60vh] bg-page">
      <NotFoundPanel />
    </main>
  )
}

import { Metadata } from "next"
import { Suspense } from "react"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Đăng nhập | Com4Fud",
  description: "Đăng nhập để xem đơn hàng và địa chỉ đã lưu.",
}

export default function Login() {
  // LoginTemplate reads ?next=checkout with useSearchParams, which needs a Suspense boundary.
  return (
    <Suspense>
      <LoginTemplate />
    </Suspense>
  )
}

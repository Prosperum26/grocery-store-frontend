import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Đăng nhập | Com4Fud",
  description: "Đăng nhập để xem đơn hàng và địa chỉ đã lưu.",
}

export default function Login() {
  return <LoginTemplate />
}

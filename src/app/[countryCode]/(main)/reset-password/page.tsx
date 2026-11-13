import { Metadata } from "next"

import ResetPasswordTemplate from "@modules/account/templates/reset-password-template"

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | Com4Fud",
  description: "Chọn mật khẩu mới cho tài khoản Com4Fud.",
}

// `token` và `email` nằm trong link gửi qua email; template client đọc từ query.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const { token, email } = await searchParams
  return <ResetPasswordTemplate token={token ?? ""} email={email ?? ""} />
}

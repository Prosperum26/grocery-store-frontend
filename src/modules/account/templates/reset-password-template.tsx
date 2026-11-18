"use client"

import { resetPassword } from "@lib/data/customer"
import Button from "@modules/common/components/button"
import Field from "@modules/common/components/field"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState, type FormEvent } from "react"

/**
 * Trang đặt mật khẩu mới, mở từ link trong email "quên mật khẩu".
 * Link thiếu token hoặc email thì không có gì để đặt lại: hiện hướng dẫn xin link mới.
 */
export default function ResetPasswordTemplate({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("")
  const [again, setAgain] = useState("")
  const [errors, setErrors] = useState<{ password?: string; again?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return

    const next: typeof errors = {}
    if (password.length < 8) next.password = "Mật khẩu cần ít nhất 8 ký tự"
    if (again !== password) next.again = "Hai mật khẩu chưa giống nhau"
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setBusy(true)
    const result = await resetPassword(email, token, password)
    setBusy(false)
    if (result.ok) setDone(true)
    else setErrors({ form: result.message })
  }

  const usable = Boolean(token && email)

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-ink">Đặt lại mật khẩu</h1>

      {!usable && (
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
          <p className="text-sm text-ink">Link này thiếu thông tin nên chưa đặt lại được mật khẩu.</p>
          <LocalizedClientLink href="/account" className="text-sm font-semibold text-brand underline-offset-2 hover:underline">
            Yêu cầu link mới ở trang đăng nhập
          </LocalizedClientLink>
        </div>
      )}

      {usable && done && (
        <div role="status" className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
          <p className="text-sm text-ink">Đã đổi mật khẩu. Bạn đăng nhập bằng mật khẩu mới nhé.</p>
          <LocalizedClientLink href="/account" className="text-sm font-semibold text-brand underline-offset-2 hover:underline">
            Đến trang đăng nhập
          </LocalizedClientLink>
        </div>
      )}

      {usable && !done && (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
          <p className="text-sm text-ink-2">Chọn mật khẩu mới cho {email}.</p>
          <Field
            label="Mật khẩu mới"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Field
            label="Nhập lại mật khẩu"
            name="again"
            type="password"
            autoComplete="new-password"
            value={again}
            error={errors.again}
            onChange={(e) => setAgain(e.target.value)}
          />
          {errors.form && (
            <p role="alert" className="text-sm text-sale-deep">
              {errors.form}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" fullWidth aria-disabled={busy || undefined}>
            {busy ? "Đang xử lý…" : "Đổi mật khẩu"}
          </Button>
        </form>
      )}
    </div>
  )
}

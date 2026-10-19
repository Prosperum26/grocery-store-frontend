"use client"

import { signInDemo } from "@lib/data/demo-session"
import { isMockMode } from "@lib/mock/mode"
import { useComingSoon, ComingSoonBadge } from "@modules/common/components/coming-soon"
import Button from "@modules/common/components/button"
import Field from "@modules/common/components/field"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"
import { useState, type FormEvent } from "react"

/**
 * Sign-in page of the v2 design (09_Dang_Nhap_*). Left: the brand panel on
 * dark green. Right: the form. There is no real sign-in yet (issue #11), so
 * submitting shows the "đang phát triển" dialog. A demo account is offered
 * only in development (plan O5), and no password is stored in the code.
 */
export default function LoginTemplate() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const { open } = useComingSoon()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | undefined>()
  const demoAvailable = process.env.NODE_ENV !== "production" && isMockMode()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError("Nhập email và mật khẩu để đăng nhập")
      return
    }
    setError(undefined)
    open("Đăng nhập")
  }

  return (
    <div className="grid min-h-[70vh] grid-cols-1 small:grid-cols-2">
      <aside className="flex flex-col justify-between gap-8 bg-brand-deep p-8 text-white small:p-12" aria-label="Com4Fud">
        <p className="font-display text-lg font-bold">
          Com<span className="text-accent">4</span>Fud
        </p>
        <div className="flex max-w-md flex-col gap-4">
          <h2 className="font-display text-3xl font-bold leading-tight small:text-[40px]">Bữa cơm nhà, đi chợ một chạm.</h2>
          <p className="text-base text-on-dark">Đăng nhập để xem đơn hàng và địa chỉ đã lưu của bạn.</p>
        </div>
        <p className="text-xs text-on-dark">Rau củ, thịt cá và hàng thiết yếu giao trong ngày tại TP.HCM.</p>
      </aside>

      <div className="flex flex-col justify-center gap-6 bg-page p-8 small:p-12">
        <div className="flex max-w-md flex-col gap-2">
          <ComingSoonBadge className="self-start" />
          <h1 className="font-display text-3xl font-bold text-ink">Đăng nhập</h1>
          <p className="text-sm text-ink-2">Đăng nhập thật đang trong quá trình phát triển.</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-4 rounded-card border border-line bg-surface p-6">
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Mật khẩu"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />
          <Button type="submit" variant="primary" size="lg" fullWidth>
            Đăng nhập
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => open("Quên mật khẩu")}
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              Quên mật khẩu?
            </button>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => open("Đăng ký tài khoản")}
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              Chưa có tài khoản? Đăng ký
            </button>
          </div>
        </form>

        {demoAvailable && (
          <form
            action={async () => {
              await signInDemo(countryCode)
            }}
            className="flex max-w-md flex-col gap-2 rounded-card border border-dashed border-line-2 bg-surface p-5"
          >
            <p className="text-sm font-semibold text-ink">Tài khoản dùng thử</p>
            <p className="text-xs text-ink-2">Chỉ hiện khi phát triển. Không cần mật khẩu.</p>
            <Button type="submit" variant="secondary" size="md">
              Vào tài khoản dùng thử
            </Button>
          </form>
        )}

        <LocalizedClientLink href="/" className="text-sm text-ink-2 underline-offset-2 hover:underline">
          Về trang chủ
        </LocalizedClientLink>
      </div>
    </div>
  )
}

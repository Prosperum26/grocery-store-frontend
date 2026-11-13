"use client"

import { login, requestPasswordReset, signup } from "@lib/data/customer"
import { signInDemo } from "@lib/data/demo-session"
import { isMockMode } from "@lib/mock/mode"
import { isVietnamesePhone } from "@lib/mock/checkout"
import { authErrorMessage } from "@lib/util/auth-error"
import { isEmail, splitName } from "@lib/util/checkout"
import { MOCK_NO_BACKEND } from "@lib/util/mock-copy"
import { clearDraft, loadDraft, LOGIN_DRAFT, saveDraft } from "@lib/util/draft"
import Button from "@modules/common/components/button"
import Field from "@modules/common/components/field"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, type FormEvent } from "react"

/**
 * Sign-in page of the v2 design (09_Dang_Nhap_*). Left: the brand panel on
 * dark green. Right: the form. Real mode signs in or registers against the
 * backend (one form switches between the two). Mock mode has no backend, so
 * submitting says so under the form; a demo account is offered only in
 * development (plan O5), and no password is stored in the code.
 */
export default function LoginTemplate() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const router = useRouter()
  const mock = isMockMode()
  const [registering, setRegistering] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  // "Quên mật khẩu": cùng form, chỉ còn ô email; gửi xong thì hiện lời nhắn kiểm tra hộp thư.
  const [forgot, setForgot] = useState(false)
  const [sent, setSent] = useState(false)
  // Came from the checkout (?next=checkout): say why, and go back there after signing in.
  const toCheckout = useSearchParams().get("next") === "checkout"
  const draftLoaded = useRef(false)

  // Restore what was typed before a reload or a trip to another page (not the password). After mount, so the
  // server and the browser render the same first page.
  useEffect(() => {
    const saved = loadDraft<{ registering: boolean; name: string; phone: string; email: string }>(LOGIN_DRAFT)
    if (saved) {
      setRegistering(saved.registering)
      setName(saved.name)
      setPhone(saved.phone)
      setEmail(saved.email)
    }
    draftLoaded.current = true
  }, [])
  useEffect(() => {
    if (draftLoaded.current) saveDraft(LOGIN_DRAFT, { registering, name, phone, email })
  }, [registering, name, phone, email])

  const demoAvailable = process.env.NODE_ENV !== "production" && mock

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (mock) {
      if (!email.trim() || !password) {
        setErrors({ password: "Nhập email và mật khẩu để đăng nhập" })
        return
      }
      setErrors({ form: MOCK_NO_BACKEND })
      return
    }

    if (forgot) {
      if (!isEmail(email)) {
        setErrors({ email: "Nhập email, ví dụ ban@example.com" })
        return
      }
      setBusy(true)
      const result = await requestPasswordReset(email.trim())
      setBusy(false)
      if (result.ok) {
        setErrors({})
        setSent(true)
      } else {
        setErrors({ form: result.message })
      }
      return
    }

    const next: typeof errors = {}
    if (!isEmail(email)) next.email = "Nhập email, ví dụ ban@example.com"
    if (!password) next.password = "Nhập mật khẩu"
    if (registering) {
      if (!name.trim()) next.name = "Nhập họ và tên"
      if (!isVietnamesePhone(phone)) next.phone = "Số điện thoại chưa đúng, ví dụ 0903 412 588"
      if (password && password.length < 8) next.password = "Mật khẩu cần ít nhất 8 ký tự"
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setBusy(true)
    const form = new FormData()
    form.set("email", email.trim())
    form.set("password", password)
    let result: unknown
    if (registering) {
      const { first_name, last_name } = splitName(name)
      form.set("first_name", first_name)
      form.set("last_name", last_name)
      form.set("phone", phone.split(" ").join(""))
      result = await signup(null, form)
    } else {
      result = await login(null, form)
    }
    setBusy(false)

    // Both actions return an error text on failure; on success the cookie is set.
    if (typeof result === "string") {
      setErrors({ form: authErrorMessage(result, registering) })
      return
    }
    setErrors({})
    clearDraft(LOGIN_DRAFT)
    if (toCheckout) {
      router.push(`/${countryCode}/checkout`)
      return
    }
    router.refresh() // the account layout reads the signed-in customer again
  }

  const switchMode = () => {
    setRegistering((r) => !r)
    setErrors({})
  }

  const toggleForgot = () => {
    setForgot((f) => !f)
    setSent(false)
    setErrors({})
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
          <h1 className="font-display text-3xl font-bold text-ink">{forgot ? "Quên mật khẩu" : registering ? "Đăng ký" : "Đăng nhập"}</h1>
          {mock && <p className="text-sm text-ink-2">Bản xem thử không nối máy chủ, nên chưa đăng nhập được.</p>}
          {toCheckout && !mock && (
            <p role="status" className="rounded-2xl bg-accent-soft p-3 text-sm text-ink">
              Đăng nhập hoặc tạo tài khoản để thanh toán, giúp bạn theo dõi và huỷ đơn sau này. Giỏ hàng vẫn được giữ nguyên.
            </p>
          )}
        </div>

        <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-4 rounded-card border border-line bg-surface p-6">
          {forgot && !sent && (
            <p className="text-sm text-ink-2">Nhập email đã đăng ký, mình sẽ gửi link để bạn đặt mật khẩu mới.</p>
          )}
          {forgot && sent && (
            <p role="status" className="text-sm text-ink">
              Nếu {email.trim()} đã có tài khoản, bạn sẽ nhận được email hướng dẫn trong ít phút. Nhớ xem cả thư rác nhé.
            </p>
          )}
          {registering && !forgot && (
            <>
              <Field
                label="Họ và tên"
                name="name"
                autoComplete="name"
                value={name}
                error={errors.name}
                onChange={(e) => setName(e.target.value)}
              />
              <Field
                label="Số điện thoại"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                error={errors.phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}
          {!sent && (
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          {!forgot && (
            <Field
              label="Mật khẩu"
              name="password"
              type="password"
              autoComplete={registering ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
          )}
          {errors.form && (
            <p role="alert" className="text-sm text-sale-deep">
              {errors.form}
            </p>
          )}
          {!sent && (
            <Button type="submit" variant="primary" size="lg" fullWidth aria-disabled={busy || undefined}>
              {busy ? "Đang xử lý…" : forgot ? "Gửi link đặt lại mật khẩu" : registering ? "Tạo tài khoản" : "Đăng nhập"}
            </Button>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            {forgot ? (
              <button
                type="button"
                onClick={toggleForgot}
                className="relative font-semibold text-brand underline-offset-2 hover:underline touch-target"
              >
                Quay lại đăng nhập
              </button>
            ) : (
              <>
                {!registering ? (
                  <button
                    type="button"
                    onClick={toggleForgot}
                    className="relative font-semibold text-brand underline-offset-2 hover:underline touch-target"
                  >
                    Quên mật khẩu?
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={switchMode}
                  className="relative font-semibold text-brand underline-offset-2 hover:underline touch-target"
                >
                  {registering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
                </button>
              </>
            )}
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

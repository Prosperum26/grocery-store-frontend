"use client"

import { useToast } from "@lib/context/toast-context"
import { saveCustomerProfile } from "@lib/data/customer"
import { isVietnamesePhone } from "@lib/mock/checkout"
import { splitName } from "@lib/util/checkout"
import Button from "@modules/common/components/button"
import Field from "@modules/common/components/field"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  /** Family name first, given name last ("Trần Minh Thư"). */
  name: string
  email: string
  phone: string
}

/**
 * Profile of the signed-in customer: name and phone can be changed here. The
 * email is the sign-in name, so it is only shown.
 */
export default function ProfileCard({ name, email, phone }: Props) {
  return (
    <div className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface px-5 small:px-6" data-testid="profile-card">
      <EditableRow
        label="Họ và tên"
        value={name}
        empty="Chưa có tên"
        inputName="name"
        autoComplete="name"
        validate={(v) => (v.trim() ? undefined : "Nhập họ và tên")}
        toBody={(v) => splitName(v)}
        saved="Đã lưu họ tên"
      />
      <div className="flex flex-col gap-1 py-4">
        <span className="text-sm text-ink-2">Email</span>
        <span className="font-semibold text-ink">{email}</span>
        <span className="text-xs text-ink-2">Email dùng để đăng nhập nên chưa đổi được.</span>
      </div>
      <EditableRow
        label="Số điện thoại"
        value={phone}
        empty="Chưa có số điện thoại"
        inputName="phone"
        type="tel"
        autoComplete="tel"
        validate={(v) => (isVietnamesePhone(v) ? undefined : "Số điện thoại chưa đúng, ví dụ 0903 412 588")}
        toBody={(v) => ({ phone: v.trim() })}
        saved="Đã lưu số điện thoại"
      />
    </div>
  )
}

function EditableRow({
  label,
  value,
  empty,
  inputName,
  type,
  autoComplete,
  validate,
  toBody,
  saved,
}: {
  label: string
  value: string
  empty: string
  inputName: string
  type?: string
  autoComplete?: string
  validate: (value: string) => string | undefined
  toBody: (value: string) => Record<string, string>
  saved: string
}) {
  const router = useRouter()
  const { show } = useToast()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const start = () => {
    setDraft(value)
    setError(undefined)
    setEditing(true)
  }

  const save = async () => {
    const problem = validate(draft)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    const result = await saveCustomerProfile(toBody(draft))
    setBusy(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setEditing(false)
    show({ tone: "ok", title: saved })
    router.refresh()
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm text-ink-2">{label}</span>
          <span className={value ? "font-semibold text-ink" : "text-ink-2"}>{value || empty}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={start} aria-label={`Sửa ${label.toLowerCase()}`}>
          Sửa
        </Button>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-3 py-4"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <Field
        label={label}
        name={inputName}
        type={type}
        autoComplete={autoComplete}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        error={error}
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" aria-disabled={busy || undefined}>
          {busy ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={() => setEditing(false)} aria-disabled={busy || undefined}>
          Hủy
        </Button>
      </div>
    </form>
  )
}

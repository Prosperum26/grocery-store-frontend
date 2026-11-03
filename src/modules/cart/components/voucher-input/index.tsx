"use client"

import { useCart } from "@lib/context/cart-context"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import Field from "@modules/common/components/field"
import { useState, type FormEvent } from "react"

/**
 * "Mã giảm giá" field of the cart. An unknown code keeps the cart unchanged
 * and says so; a known code the cart does not qualify for says that instead.
 */
export default function VoucherInput() {
  const { view, applyVoucher, removeVoucher } = useCart()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | undefined>()
  const [checking, setChecking] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError("Nhập mã giảm giá trước khi áp dụng")
      return
    }
    setChecking(true)
    const result = await applyVoucher(code)
    setChecking(false)
    if (result === "invalid") {
      setError("Mã không hợp lệ hoặc đã hết hạn")
      return
    }
    if (result === "not_eligible") {
      setError("Giỏ hàng chưa đủ điều kiện dùng mã này")
      return
    }
    setError(undefined)
    setCode("")
  }

  if (view.voucher) {
    return (
      <div className="flex flex-col gap-2 rounded-btn border border-brand bg-brand-bg p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-brand-deep">
            Đã áp dụng mã <span className="font-mono font-bold">{view.voucher}</span>
            {" · "}giảm {formatVnd(view.discount)}
          </p>
          <Button variant="ghost" size="xs" onClick={removeVoucher}>
            Bỏ mã
          </Button>
        </div>
      </div>
    )
  }

  return (
    // items-start + mt-[26px] (label 20px + gap 6px): the button stays level with
    // the input even when the error line makes the field taller.
    <form onSubmit={onSubmit} noValidate className="flex items-start gap-2">
      <Field
        label="Mã giảm giá"
        name="voucher"
        autoComplete="off"
        value={code}
        mono
        error={error}
        onChange={(e) => {
          setCode(e.target.value)
          if (error) setError(undefined)
        }}
        className="min-w-0 flex-1"
      />
      <Button type="submit" variant="secondary" size="md" aria-disabled={checking || undefined} className="mt-[26px] h-12 shrink-0">
        {checking ? "Đang kiểm tra" : "Áp dụng"}
      </Button>
    </form>
  )
}

"use client"

import { useMockCart } from "@lib/context/mock-cart-context"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import Field from "@modules/common/components/field"
import { useState, type FormEvent } from "react"

/**
 * "Mã giảm giá" field of the cart. The code is checked against the mock list
 * only; an unknown code keeps the cart unchanged and says why.
 */
export default function VoucherInput() {
  const { view, applyVoucher, removeVoucher } = useMockCart()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | undefined>()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError("Nhập mã giảm giá trước khi áp dụng")
      return
    }
    if (applyVoucher(code) === "invalid") {
      setError("Mã không hợp lệ hoặc đã hết hạn")
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
    <form onSubmit={onSubmit} noValidate className="flex items-end gap-2">
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
        className="flex-1"
      />
      <Button type="submit" variant="secondary" size="md">
        Áp dụng
      </Button>
    </form>
  )
}

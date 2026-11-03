"use client"

import { useCart } from "@lib/context/cart-context"
import { DEMO_ADDRESSES, type DemoAddress } from "@lib/mock/customer"
import { isMockMode } from "@lib/mock/mode"
import { DEFAULT_SLOT_ID, DELIVERY_SLOTS, isVietnamesePhone, NOTE_MAX_LENGTH } from "@lib/mock/checkout"
import { listDeliverySlots, startPayment } from "@lib/data/checkout"
import { isEmail, type SavedAddress, type SlotOption } from "@lib/util/checkout"
import { cx } from "@lib/util/cx"
import { formatVnd } from "@lib/util/price"
import Button from "@modules/common/components/button"
import Field from "@modules/common/components/field"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import EmptyCartMessage from "@modules/cart/components/empty-cart-message"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { LuCheck, LuLock, LuMapPin } from "react-icons/lu"

const FORM_ID = "checkout-form"
const NEW_ADDRESS = "new"

type Draft = { email: string; name: string; phone: string; line: string; ward: string }
type Errors = Partial<Record<"address" | "email" | "name" | "phone" | "line" | "ward" | "slot" | "note" | "cart", string>>

const STEPS = ["Giỏ hàng", "Thanh toán", "Hoàn tất"]

/**
 * Checkout of the v2 design (05_Thanh_Toan_*): three numbered parts and the
 * summary. A single submit button validates the form. Mock mode then leads to
 * the sample confirmation. Real mode saves the cart on the backend and sends
 * the shopper to VNPAY; the order is created when VNPAY confirms the payment.
 * The real checkout has no saved addresses yet (they need an account), so the
 * shopper types the address and an email.
 */
export default function CheckoutTemplate({
  customerEmail,
  savedAddresses,
}: {
  /** Real mode, signed in: the email of the account (no need to ask). */
  customerEmail?: string
  /** Real mode, signed in: the addresses saved in the account. */
  savedAddresses?: SavedAddress[]
}) {
  const { view, clear } = useCart()
  const router = useRouter()
  const { countryCode } = useParams<{ countryCode: string }>()
  const mock = isMockMode()
  const addresses: DemoAddress[] = mock ? DEMO_ADDRESSES : (savedAddresses ?? [])
  const [addressId, setAddressId] = useState<string>(
    (addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? NEW_ADDRESS
  )
  const [draft, setDraft] = useState<Draft>({ email: "", name: "", phone: "", line: "", ward: "" })
  const [slots, setSlots] = useState<SlotOption[]>(mock ? DELIVERY_SLOTS : [])
  const [slotId, setSlotId] = useState(mock ? DEFAULT_SLOT_ID : "")
  const [note, setNote] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  // Real mode: the slots come from the backend. Pick the first one still open.
  const loadSlots = () =>
    listDeliverySlots()
      .then((list) => {
        setSlots(list)
        setSlotId((current) =>
          list.some((s) => s.id === current && s.open) ? current : (list.find((s) => s.open)?.id ?? "")
        )
      })
      .catch(() => setErrors((e) => ({ ...e, slot: "Không tải được khung giờ giao. Tải lại trang để thử lại." })))
  useEffect(() => {
    if (!mock) loadSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (view.lines.length === 0) {
    return (
      <div className="content-container py-10">
        <EmptyCartMessage />
      </div>
    )
  }

  const usingNewAddress = addressId === NEW_ADDRESS
  const hasOutOfStock = view.outOfStockCount > 0

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const next: Errors = {}

    if (hasOutOfStock) {
      next.cart = "Giỏ có món hết hàng. Quay lại giỏ để xóa trước khi đặt."
    }
    if (!mock && !customerEmail && !isEmail(draft.email)) next.email = "Nhập email để nhận thông tin đơn hàng"
    if (usingNewAddress) {
      if (!draft.name.trim()) next.name = "Nhập họ tên người nhận"
      if (!isVietnamesePhone(draft.phone)) next.phone = "Số điện thoại chưa đúng, ví dụ 0903 412 588"
      if (!draft.line.trim()) next.line = "Nhập số nhà, tên đường hoặc tòa nhà"
      if (!draft.ward.trim()) next.ward = "Nhập phường, quận, tỉnh/thành"
    } else if (!addresses.some((a) => a.id === addressId)) {
      next.address = "Chọn địa chỉ nhận hàng"
    }
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || !slot.open) next.slot = "Chọn khung giờ còn mở"
    if (note.length > NOTE_MAX_LENGTH) next.note = `Ghi chú tối đa ${NOTE_MAX_LENGTH} ký tự`

    setErrors(next)
    if (Object.keys(next).length > 0) {
      summaryRef.current?.focus()
      return
    }
    if (mock) {
      clear()
      router.push(`/${countryCode}/order/demo/confirmed`)
      return
    }

    // Real: save the cart on the backend, then go to VNPAY. The cart stays
    // until VNPAY confirms the payment (the return page empties it).
    setSubmitting(true)
    const chosen = usingNewAddress ? draft : addresses.find((a) => a.id === addressId)!
    const result = await startPayment({
      email: customerEmail ?? draft.email,
      name: chosen.name,
      phone: chosen.phone,
      line: chosen.line,
      ward: chosen.ward,
      slotId,
      note,
    })
    if (result.ok) {
      window.location.assign(result.paymentUrl)
      return // keep the button disabled while the browser leaves the page
    }
    setSubmitting(false)
    if (result.reason === "slot_unavailable") {
      setErrors({ slot: result.message })
      loadSlots()
    } else {
      setErrors({ cart: result.message })
    }
    summaryRef.current?.focus()
  }

  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof Errors, string][]

  return (
    <div className="content-container flex flex-col gap-6 pb-40 pt-6 small:pb-16 small:pt-8">
      <div className="flex flex-col gap-5 small:flex-row small:items-end small:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-2">Bước 2 / 3</p>
          <h1 className="font-display text-3xl font-bold text-ink small:text-[40px] small:leading-tight">Thanh toán</h1>
        </div>
        <ol aria-label="Các bước" className="flex flex-wrap items-center gap-3 text-sm">
          {STEPS.map((label, i) => {
            const current = i === 1
            const done = i === 0
            const content = (
              <span className={cx("flex items-center gap-2", current ? "font-semibold text-ink" : done ? "text-brand" : "text-ink-3")}>
                <span
                  aria-hidden="true"
                  className={cx(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
                    current ? "border-ink bg-accent text-ink" : done ? "border-brand bg-brand text-white" : "border-line-2 bg-surface"
                  )}
                >
                  {done ? <LuCheck /> : i + 1}
                </span>
                {label}
              </span>
            )
            return (
              <li key={label} aria-current={current ? "step" : undefined} className="flex items-center gap-3">
                {done ? (
                  <LocalizedClientLink href="/cart" className="hover:underline">
                    {content}
                  </LocalizedClientLink>
                ) : (
                  content
                )}
                {i < STEPS.length - 1 && <span aria-hidden="true" className="hidden h-px w-8 bg-line-2 small:block" />}
              </li>
            )
          })}
        </ol>
      </div>

      {errorList.length > 0 && (
        <div role="alert" ref={summaryRef} tabIndex={-1} className="rounded-btn border-[1.2px] border-l-8 border-sale bg-sale-bg px-4 py-3 text-sm text-sale-deep focus:outline-none">
          <p className="font-semibold">Kiểm tra lại {errorList.length} mục:</p>
          <ul className="mt-1 list-disc pl-5">
            {errorList.map(([key, message]) => (
              <li key={key}>
                <a href={`#checkout-${key}`} className="underline underline-offset-2">
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="grid gap-6 small:grid-cols-[minmax(0,1fr)_380px] small:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {/* 1. Address */}
          <section aria-labelledby="checkout-address-title" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 small:p-6">
            <h2 id="checkout-address-title" className="flex items-center gap-3 font-display text-lg font-bold text-ink">
              <Step n={1} />
              Địa chỉ nhận hàng
            </h2>
            <fieldset id="checkout-address" className="flex flex-col gap-2.5" aria-describedby={errors.address ? "checkout-address-error" : undefined}>
              <legend className="sr-only">Chọn địa chỉ</legend>
              {addresses.map((address) => (
                <AddressOption
                  key={address.id}
                  address={address}
                  checked={addressId === address.id}
                  onChange={() => setAddressId(address.id)}
                />
              ))}
              {addresses.length > 0 && (
                <label
                  className={cx(
                    "flex cursor-pointer items-center gap-3 rounded-btn border-[1.5px] p-4",
                    usingNewAddress ? "border-brand bg-brand-bg" : "border-line-2 bg-surface"
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    value={NEW_ADDRESS}
                    checked={usingNewAddress}
                    onChange={() => setAddressId(NEW_ADDRESS)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="text-sm font-semibold text-ink">Thêm địa chỉ mới</span>
                </label>
              )}
            </fieldset>
            {errors.address && (
              <p id="checkout-address-error" className="text-sm text-sale-deep">
                {errors.address}
              </p>
            )}

            {usingNewAddress && (
              <div className="grid gap-4 small:grid-cols-2">
                {!mock && !customerEmail && (
                  <div id="checkout-email" className="small:col-span-2">
                    <Field
                      label="Email nhận thông tin đơn hàng"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={draft.email}
                      error={errors.email}
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    />
                  </div>
                )}
                <div id="checkout-name" className="small:col-span-1">
                  <Field
                    label="Họ và tên người nhận"
                    name="name"
                    autoComplete="name"
                    value={draft.name}
                    error={errors.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>
                <div id="checkout-phone">
                  <Field
                    label="Số điện thoại"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={draft.phone}
                    error={errors.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  />
                </div>
                <div id="checkout-line" className="small:col-span-2">
                  <Field
                    label="Số nhà, tên đường, tòa nhà"
                    name="street-address"
                    autoComplete="street-address"
                    value={draft.line}
                    error={errors.line}
                    onChange={(e) => setDraft({ ...draft, line: e.target.value })}
                  />
                </div>
                <div id="checkout-ward" className="small:col-span-2">
                  <Field
                    label="Phường, quận, tỉnh/thành"
                    name="address-level2"
                    autoComplete="address-level2"
                    value={draft.ward}
                    error={errors.ward}
                    onChange={(e) => setDraft({ ...draft, ward: e.target.value })}
                  />
                </div>
              </div>
            )}
          </section>

          {/* 2. Delivery time */}
          <section aria-labelledby="checkout-time-title" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 small:p-6">
            <h2 id="checkout-time-title" className="flex items-center gap-3 font-display text-lg font-bold text-ink">
              <Step n={2} />
              Thời gian giao
            </h2>
            <fieldset id="checkout-slot" className="grid grid-cols-2 gap-2.5 small:grid-cols-4" aria-describedby={errors.slot ? "checkout-slot-error" : undefined}>
              <legend className="sr-only">Khung giờ giao</legend>
              {slots.length === 0 && !mock && (
                <p className="col-span-full text-sm text-ink-2">Đang tải khung giờ giao…</p>
              )}
              {slots.map((slot) => {
                const checked = slotId === slot.id
                return (
                  <label
                    key={slot.id}
                    className={cx(
                      "flex flex-col gap-0.5 rounded-btn border-[1.5px] px-3.5 py-3",
                      !slot.open ? "cursor-not-allowed border-line-2 bg-page-2 opacity-60" : "cursor-pointer",
                      checked && slot.open ? "border-brand bg-brand-bg" : slot.open ? "border-line-2 bg-surface" : ""
                    )}
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={slot.id}
                      disabled={!slot.open}
                      checked={checked}
                      onChange={() => setSlotId(slot.id)}
                      className="sr-only"
                    />
                    <span className="text-xs text-ink-2">{slot.day}</span>
                    <span className="font-mono text-sm font-semibold text-ink">{slot.time}</span>
                    {!slot.open && <span className="text-xs text-ink-2">Đã đóng</span>}
                    {checked && slot.open && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-brand">
                        <LuCheck aria-hidden="true" /> Đã chọn
                      </span>
                    )}
                  </label>
                )
              })}
            </fieldset>
            {errors.slot && (
              <p id="checkout-slot-error" className="text-sm text-sale-deep">
                {errors.slot}
              </p>
            )}

            <div id="checkout-note" className="flex flex-col gap-1.5">
              <label htmlFor="checkout-note-input" className="text-sm font-medium text-ink">
                Ghi chú cho người giao hàng
              </label>
              <textarea
                id="checkout-note-input"
                name="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-describedby="checkout-note-count"
                aria-invalid={errors.note ? true : undefined}
                className="rounded-btn border-[1.5px] border-line-2 bg-surface px-3.5 py-2.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand"
              />
              <p id="checkout-note-count" className={cx("text-xs", note.length > NOTE_MAX_LENGTH ? "text-sale-deep" : "text-ink-2")}>
                {note.length}/{NOTE_MAX_LENGTH} ký tự
              </p>
              {errors.note && <p className="text-sm text-sale-deep">{errors.note}</p>}
            </div>
          </section>

          {/* 3. Payment */}
          <section aria-labelledby="checkout-pay-title" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 small:p-6">
            <h2 id="checkout-pay-title" className="flex items-center gap-3 font-display text-lg font-bold text-ink">
              <Step n={3} />
              Phương thức thanh toán
            </h2>
            <label className="flex cursor-pointer items-center gap-3 rounded-btn border-[1.5px] border-brand bg-brand-bg p-4">
              <input type="radio" name="payment" value="vnpay" checked readOnly className="h-4 w-4 accent-brand" />
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-ink">Thanh toán qua VNPAY</span>
                <span className="text-xs text-ink-2">Thẻ ATM hoặc mã QR ngân hàng · thử nghiệm, không trừ tiền thật</span>
              </span>
            </label>
          </section>
        </div>

        {/* Summary */}
        <aside aria-labelledby="checkout-summary-title" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 small:sticky small:top-6 small:p-6">
          <div className="flex items-center justify-between">
            <h2 id="checkout-summary-title" className="font-display text-lg font-bold text-ink">
              Đơn hàng ({view.count} món)
            </h2>
            <LocalizedClientLink href="/cart" className="text-sm font-semibold text-brand underline-offset-2 hover:underline">
              Sửa giỏ
            </LocalizedClientLink>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm">
            {view.lines
              .filter((l) => l.inStock)
              .map((line) => (
                <li key={line.key} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-ink">{line.title}</span>
                    <span className="text-xs text-ink-2">
                      {line.variantLabel} × {line.quantity}
                    </span>
                  </span>
                  <span className="font-mono font-semibold text-ink">{formatVnd(line.lineTotal)}</span>
                </li>
              ))}
          </ul>
          <dl className="flex flex-col gap-2 border-t border-dashed border-line-2 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-2">Tạm tính</dt>
              <dd className="font-mono font-semibold">{formatVnd(view.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-2">Phí giao hàng</dt>
              <dd className="font-mono font-semibold">{formatVnd(view.shipping)}</dd>
            </div>
            {view.discount > 0 && (
              <div className="flex justify-between text-brand">
                <dt>Mã {view.voucher}</dt>
                <dd className="font-mono font-semibold">−{formatVnd(view.discount)}</dd>
              </div>
            )}
          </dl>
          <div className="flex items-end justify-between border-t border-dashed border-line-2 pt-4">
            <span className="text-sm font-semibold text-ink">Tổng thanh toán</span>
            <span className="font-mono text-2xl font-bold text-ink" aria-live="polite">
              {formatVnd(view.total)}
            </span>
          </div>
          {errors.cart && (
            <p id="checkout-cart" className="text-sm text-sale-deep">
              {errors.cart}
            </p>
          )}
          <Button type="submit" form={FORM_ID} variant="primary" size="lg" fullWidth icon={<LuLock />} aria-disabled={hasOutOfStock || submitting || undefined} data-testid="place-order-button">
            {submitting ? "Đang chuyển sang VNPAY…" : "Xác nhận đặt hàng"}
          </Button>
          <p className="flex gap-2 text-xs text-ink-2">
            <LuMapPin aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={14} />
            Giá chốt khi bạn đặt hàng.
          </p>
        </aside>
      </form>

      {/* Phone: the total and the button stay in reach above the bottom nav. */}
      <div className="fixed inset-x-4 bottom-24 z-30 flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-toast small:hidden">
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-ink-2">Tổng thanh toán</span>
          <span className="font-mono text-lg font-bold text-ink">{formatVnd(view.total)}</span>
        </div>
        <Button type="submit" form={FORM_ID} variant="primary" size="md" className="flex-1" aria-disabled={hasOutOfStock || submitting || undefined}>
          {submitting ? "Đang chuyển…" : "Đặt hàng"}
        </Button>
      </div>
    </div>
  )
}

function Step({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink font-mono text-sm font-bold text-accent">
      {n}
    </span>
  )
}

function AddressOption({
  address,
  checked,
  onChange,
}: {
  address: DemoAddress
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      className={cx(
        "flex cursor-pointer items-start gap-3 rounded-btn border-[1.5px] p-4",
        checked ? "border-brand bg-brand-bg" : "border-line-2 bg-surface"
      )}
    >
      <input type="radio" name="address" value={address.id} checked={checked} onChange={onChange} className="mt-1 h-4 w-4 accent-brand" />
      <span className="flex flex-col gap-0.5 text-sm">
        <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          {address.name} · {address.phone}
          <span className="rounded-chip bg-page-2 px-2 py-0.5 text-xs font-semibold text-ink-2">{address.label}</span>
        </span>
        <span className="text-ink">
          {address.line}, {address.ward}
        </span>
      </span>
    </label>
  )
}

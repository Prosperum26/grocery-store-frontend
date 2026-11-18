"use client"

import { useToast } from "@lib/context/toast-context"
import { deleteCustomerAddress, saveCustomerAddress } from "@lib/data/customer"
import {
  EMPTY_ADDRESS_INPUT,
  toAddressInput,
  validateAddress,
  type AddressErrors,
  type AddressInput,
} from "@lib/util/address-form"
import { toSavedAddress, type RawCustomerAddress } from "@lib/util/checkout"
import Button from "@modules/common/components/button"
import Chip from "@modules/common/components/chip"
import Field from "@modules/common/components/field"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LuMapPin, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu"

/** Which form is open: a new address, the address with this id, or none. */
type Editing = { id: string | null } | null

/**
 * The customer's saved addresses (the checkout lists the same ones). The form
 * opens in place of the list, with the same boxes as the checkout.
 */
export default function AddressBook({ addresses }: { addresses: RawCustomerAddress[] }) {
  const router = useRouter()
  const { show } = useToast()
  const [editing, setEditing] = useState<Editing>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const remove = async (id: string) => {
    setRemoving(id)
    const result = await deleteCustomerAddress(id)
    setRemoving(null)
    if (!result.ok) {
      show({ tone: "err", title: "Chưa xóa được địa chỉ", description: result.message })
      return
    }
    show({ tone: "ok", title: "Đã xóa địa chỉ" })
    router.refresh()
  }

  const editingAddress = editing?.id ? addresses.find((a) => a.id === editing.id) : undefined

  return (
    <div className="flex flex-col gap-4" data-testid="address-book">
      {editing ? (
        <AddressForm
          key={editing.id ?? "new"}
          addressId={editing.id}
          initial={
            editingAddress
              ? toAddressInput(editingAddress)
              : // The first address is the default one.
                { ...EMPTY_ADDRESS_INPUT, makeDefault: addresses.length === 0 }
          }
          alreadyDefault={!!editingAddress?.is_default_shipping}
          onDone={() => {
            setEditing(null)
            router.refresh()
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div>
          <Button variant="primary" size="md" icon={<LuPlus />} onClick={() => setEditing({ id: null })} data-testid="add-address-button">
            Thêm địa chỉ
          </Button>
        </div>
      )}

      {addresses.length === 0 && !editing && (
        <p className="rounded-card border border-line bg-surface p-6 text-ink-2">
          Bạn chưa lưu địa chỉ nào. Thêm một địa chỉ để thanh toán nhanh hơn.
        </p>
      )}

      <ul className="grid grid-cols-1 gap-3 small:grid-cols-2">
        {addresses.map((raw) => {
          const a = toSavedAddress(raw)
          return (
            <li key={a.id} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5" data-testid="address-container">
              <div className="flex items-center gap-2">
                <LuMapPin aria-hidden="true" className="text-brand" />
                <span className="font-semibold text-ink">{a.label}</span>
                {a.isDefault && <Chip tone="brand">Mặc định</Chip>}
              </div>
              <div className="flex flex-col gap-0.5 text-sm text-ink">
                <span className="font-semibold">
                  {a.name}
                  {a.phone && <span className="font-normal text-ink-2"> · {a.phone}</span>}
                </span>
                <span>{a.line}</span>
                <span className="text-ink-2">{a.ward}</span>
              </div>
              <div className="mt-auto flex gap-2">
                <Button variant="secondary" size="sm" icon={<LuPencil />} onClick={() => setEditing({ id: a.id })} aria-label={`Sửa địa chỉ ${a.label}`}>
                  Sửa
                </Button>
                <Button
                  variant="dangerSoft"
                  size="sm"
                  icon={<LuTrash2 />}
                  onClick={() => remove(a.id)}
                  aria-disabled={removing === a.id || undefined}
                  aria-label={`Xóa địa chỉ ${a.label}`}
                >
                  {removing === a.id ? "Đang xóa…" : "Xóa"}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AddressForm({
  addressId,
  initial,
  alreadyDefault,
  onDone,
  onCancel,
}: {
  addressId: string | null
  initial: AddressInput
  alreadyDefault: boolean
  onDone: () => void
  onCancel: () => void
}) {
  const { show } = useToast()
  const [draft, setDraft] = useState<AddressInput>(initial)
  const [errors, setErrors] = useState<AddressErrors>({})
  const [failure, setFailure] = useState<string>()
  const [busy, setBusy] = useState(false)

  const set = (key: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: key === "makeDefault" ? e.target.checked : e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateAddress(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setBusy(true)
    setFailure(undefined)
    const result = await saveCustomerAddress(draft, addressId ?? undefined)
    setBusy(false)
    if (!result.ok) {
      setFailure(result.message)
      return
    }
    show({ tone: "ok", title: addressId ? "Đã lưu địa chỉ" : "Đã thêm địa chỉ" })
    onDone()
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 small:p-6" data-testid="address-form">
      <h2 className="font-display text-xl font-bold text-ink">{addressId ? "Sửa địa chỉ" : "Thêm địa chỉ"}</h2>
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Field label="Họ và tên người nhận" name="name" autoComplete="name" value={draft.name} onChange={set("name")} error={errors.name} />
        <Field label="Số điện thoại" name="phone" type="tel" autoComplete="tel" value={draft.phone} onChange={set("phone")} error={errors.phone} />
      </div>
      <Field label="Số nhà, tên đường" name="line" autoComplete="address-line1" value={draft.line} onChange={set("line")} error={errors.line} />
      <Field
        label="Phường, quận, tỉnh/thành"
        name="ward"
        autoComplete="address-level2"
        placeholder="P. Tân Phong, Quận 7, TP.HCM"
        value={draft.ward}
        onChange={set("ward")}
        error={errors.ward}
      />
      <Field label="Tên gọi (không bắt buộc)" name="label" placeholder="Nhà riêng, Văn phòng…" value={draft.label} onChange={set("label")} />
      {!alreadyDefault && (
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={draft.makeDefault} onChange={set("makeDefault")} className="h-4 w-4 accent-brand" />
          Đặt làm địa chỉ mặc định
        </label>
      )}
      {failure && (
        <p role="alert" className="text-sm text-sale-deep" data-testid="address-error">
          {failure}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" aria-disabled={busy || undefined}>
          {busy ? "Đang lưu…" : "Lưu địa chỉ"}
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={onCancel} aria-disabled={busy || undefined}>
          Hủy
        </Button>
      </div>
    </form>
  )
}

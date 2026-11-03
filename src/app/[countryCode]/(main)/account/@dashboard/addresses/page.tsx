import { Metadata } from "next"
import { redirect } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import AddressBook from "@modules/account/components/address-book"

export const metadata: Metadata = {
  title: "Địa chỉ giao hàng | Com4Fud",
  description: "Xem và sửa địa chỉ giao hàng của bạn.",
}

export default async function Addresses(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    redirect(`/${countryCode}/account`)
  }

  return (
    <div className="flex flex-col gap-4" data-testid="addresses-page-wrapper">
      <h1 className="font-display text-2xl font-bold text-ink small:text-[32px]">Địa chỉ giao hàng</h1>
      <p className="text-ink-2">Địa chỉ đã lưu sẽ có sẵn khi thanh toán.</p>
      <AddressBook addresses={customer.addresses ?? []} />
    </div>
  )
}

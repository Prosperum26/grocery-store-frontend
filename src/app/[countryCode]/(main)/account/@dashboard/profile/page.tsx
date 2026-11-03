import { Metadata } from "next"
import { redirect } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import ProfileCard from "@modules/account/components/profile-card"

export const metadata: Metadata = {
  title: "Hồ sơ | Com4Fud",
  description: "Xem và sửa hồ sơ của bạn.",
}

export default async function Profile(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    redirect(`/${countryCode}/account`)
  }

  return (
    <div className="flex flex-col gap-4" data-testid="profile-page-wrapper">
      <h1 className="font-display text-2xl font-bold text-ink small:text-[32px]">Hồ sơ</h1>
      <p className="text-ink-2">Họ tên và số điện thoại dùng để giao hàng và liên hệ khi cần.</p>
      <ProfileCard
        // Vietnamese order: family name first, given name last.
        name={[customer.last_name, customer.first_name].filter(Boolean).join(" ")}
        email={customer.email}
        phone={customer.phone ?? ""}
      />
    </div>
  )
}

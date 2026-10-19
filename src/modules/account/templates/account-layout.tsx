import type { ReactNode } from "react"
import type { HttpTypes } from "@medusajs/types"

import AccountNav from "../components/account-nav"

/**
 * Account pages of the v2 design: a side menu with the customer's name on
 * desktop, a row of links on phones. Signed out, the page is the sign-in
 * form alone.
 */
export default function AccountLayout({
  customer,
  children,
}: {
  customer: HttpTypes.StoreCustomer | null
  children: ReactNode
}) {
  if (!customer) {
    return <div className="content-container py-8 small:py-12">{children}</div>
  }

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")

  return (
    <div className="content-container flex flex-col gap-6 py-6 small:flex-row small:items-start small:gap-8 small:py-10" data-testid="account-page">
      <AccountNav name={name || customer.email || ""} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

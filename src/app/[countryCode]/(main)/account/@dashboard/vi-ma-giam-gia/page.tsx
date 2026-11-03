import { Metadata } from "next"
import { redirect } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { listMyVouchers } from "@lib/data/vouchers"
import { isMockMode } from "@lib/mock/mode"
import VoucherWallet from "@modules/account/components/voucher-wallet"
import { ComingSoonPanel } from "@modules/common/components/coming-soon"

export const metadata: Metadata = {
  title: "Ví mã giảm giá | Com4Fud",
  description: "Mã giảm giá của bạn.",
}

/** Wallet of discount codes: the customer's codes (real mode), a placeholder in mock mode. */
export default async function VoucherWalletPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    redirect(`/${countryCode}/account`)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-ink small:text-[32px]">Ví mã giảm giá</h1>
      {isMockMode() ? (
        <ComingSoonPanel
          title="Ví mã giảm giá"
          description="Mã giảm giá của bạn sẽ hiện ở đây. Hiện tại, bạn có thể nhập mã trong giỏ hàng."
        />
      ) : (
        <VoucherWallet vouchers={await listMyVouchers()} />
      )}
    </div>
  )
}

import { Metadata } from "next"
import { notFound } from "next/navigation"

import { verifyReturn } from "@lib/data/checkout"
import { isMockMode } from "@lib/mock/mode"
import WaitForOrder from "@modules/checkout/components/wait-for-order"
import Button from "@modules/common/components/button"
import { Banner } from "@modules/common/components/notice"

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = {
  title: "Kết quả thanh toán | Com4Fud",
}

/**
 * Where VNPAY sends the customer back (VNPAY_RETURN_URL of the backend).
 * The address is only a hint: the backend checks the signature, and the
 * order itself is created by VNPAY's IPN, never by this page.
 */
export default async function VnpayReturnPage(props: Props) {
  if (isMockMode()) {
    notFound()
  }

  // Keep only the vnp_* parameters, as plain strings.
  const query = await props.searchParams
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("vnp_") && typeof value === "string") {
      params[key] = value
    }
  }

  const { valid, success } = await verifyReturn(params)

  if (valid && success) {
    return (
      <div className="content-container flex flex-col items-center gap-6 py-14 text-center">
        <WaitForOrder />
      </div>
    )
  }

  return (
    <div className="content-container flex flex-col items-center gap-6 py-14 text-center">
      <div className="w-full max-w-md text-left">
        <Banner
          tone={valid ? "warn" : "err"}
          title={valid ? "Thanh toán chưa hoàn tất" : "Không xác minh được kết quả thanh toán"}
          description={
            valid
              ? "Bạn đã hủy hoặc giao dịch không thành công. Không có khoản tiền nào bị trừ, giỏ hàng của bạn vẫn còn."
              : "Đường dẫn này không hợp lệ. Nếu bạn đã thanh toán, đơn hàng sẽ xuất hiện trong mục Đơn hàng của bạn."
          }
        />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="lg" href="/checkout">
          Thử thanh toán lại
        </Button>
        <Button variant="secondary" size="lg" href="/cart">
          Về giỏ hàng
        </Button>
      </div>
    </div>
  )
}

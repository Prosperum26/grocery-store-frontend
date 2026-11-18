import { Metadata } from "next"

import { parseListingParams } from "@lib/util/catalog"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Tất cả sản phẩm | Com4Fud",
  description: "Rau củ, thịt cá và hàng thiết yếu, lọc theo danh mục, còn hàng và đang giảm giá.",
}

type Params = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const { countryCode } = await props.params
  const listing = parseListingParams(await props.searchParams)

  return <StoreTemplate countryCode={countryCode} params={listing} />
}

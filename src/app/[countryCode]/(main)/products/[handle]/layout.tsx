import { notFound } from "next/navigation"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

// Checks the product exists before loading.tsx streams its skeleton: once streaming starts the status is already 200,
// so a notFound() inside page.tsx would only render the 404 page with a 200 status (soft 404). The layout sits outside
// the loading boundary, so a 404 here is a real 404. Same query as page.tsx, so Next reuses the fetch.
export default async function ProductLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string; handle: string }>
}) {
  const { countryCode, handle } = await props.params
  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  const { response } = await listProducts({ countryCode, queryParams: { handle } })
  if (!response.products[0]) {
    notFound()
  }

  return props.children
}

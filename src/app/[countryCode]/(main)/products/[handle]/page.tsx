import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { pickProducts } from "@lib/mock/home"
import { toProductVM } from "@lib/viewmodels/product"
import ProductTemplate from "@modules/products/templates"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode, handle } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Com4Fud`,
    description: product.description || `${product.title}, tươi mỗi ngày tại Com4Fud.`,
    openGraph: {
      title: `${product.title} | Com4Fud`,
      description: product.description || `${product.title}, tươi mỗi ngày tại Com4Fud.`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const { countryCode, handle } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const { response: byHandle } = await listProducts({
    countryCode,
    queryParams: { handle },
  })
  const product = byHandle.products[0]

  if (!product) {
    notFound()
  }

  // "Thường mua kèm" points at other products by handle; read the catalog once.
  const { response: all } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  })
  const vm = toProductVM(product)
  const companions = pickProducts(all.products.map(toProductVM), vm.companions ?? [])

  return <ProductTemplate product={vm} companions={companions} />
}

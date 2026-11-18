import { MockCartProvider } from "@lib/context/mock-cart-context"
import { RealCartProvider } from "@lib/context/real-cart-context"
import { ToastProvider } from "@lib/context/toast-context"
import { listProducts } from "@lib/data/products"
import { MOCK_CART_SEED } from "@lib/mock/cart"
import { isMockMode } from "@lib/mock/mode"
import { toProductVM } from "@lib/viewmodels/product"
import OfflineBanner from "@modules/common/components/offline-banner"

/**
 * Shared state of the store and checkout: the cart and toasts. With the real
 * backend the cart is the Medusa cart (RealCartProvider). In mock mode it is a
 * browser cart, and the catalog is read here once so it can price its lines.
 */
export default async function CountryLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const page = (
    <ToastProvider>
      <OfflineBanner />
      {props.children}
    </ToastProvider>
  )

  if (!isMockMode()) {
    return <RealCartProvider countryCode={countryCode}>{page}</RealCartProvider>
  }

  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  })
  const catalog = response.products.map(toProductVM)

  return (
    <MockCartProvider catalog={catalog} seed={MOCK_CART_SEED}>
      {page}
    </MockCartProvider>
  )
}

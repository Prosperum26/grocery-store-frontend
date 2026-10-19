import { MockCartProvider } from "@lib/context/mock-cart-context"
import { ToastProvider } from "@lib/context/toast-context"
import { listProducts } from "@lib/data/products"
import { MOCK_CART_SEED } from "@lib/mock/cart"
import { isMockMode } from "@lib/mock/mode"
import { toProductVM } from "@lib/viewmodels/product"

/**
 * Shared state of the store and checkout: the browser cart and toasts. The
 * catalog is read here once so the cart can price its lines on any page.
 */
export default async function CountryLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  })
  const catalog = response.products.map(toProductVM)

  return (
    <MockCartProvider catalog={catalog} seed={isMockMode() ? MOCK_CART_SEED : []}>
      <ToastProvider>{props.children}</ToastProvider>
    </MockCartProvider>
  )
}

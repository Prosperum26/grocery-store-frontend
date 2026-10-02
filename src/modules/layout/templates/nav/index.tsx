import Image from "next/image"
import { Suspense } from "react"
import { MdLogin, MdOutlineAccountCircle, MdShoppingBasket } from "react-icons/md"

import { retrieveCustomer } from "@lib/data/customer"
import { getLocale } from "@lib/data/locale-actions"
import { listLocales } from "@lib/data/locales"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Cửa hàng", href: "/store" },
  { label: "Đơn hàng", href: "/account/orders" },
]

// Montra header: translucent blurred bar, logo left, links + basket right.
export default async function Nav() {
  const [regions, locales, currentLocale, customer] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    retrieveCustomer().catch(() => null),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto h-16 bg-cardOverlay backdrop-blur-md small:h-20">
        <nav className="content-container flex h-full w-full items-center justify-between">
          <div className="flex h-full items-center gap-4">
            <div className="h-full small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 transition-transform duration-150 hover:scale-105"
              data-testid="nav-store-link"
            >
              <Image
                src="/montra/logo.png"
                alt="SmartPantry"
                width={32}
                height={32}
                className="h-7 w-7 object-cover small:h-8 small:w-8"
              />
              <span className="text-lg font-bold text-headingColor small:text-xl">
                SmartPantry
              </span>
            </LocalizedClientLink>
          </div>

          <div className="flex h-full items-center gap-8">
            <ul className="hidden items-center gap-8 small:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="text-base text-textColor transition-all duration-100 ease-in-out hover:text-headingColor"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="relative flex items-center text-textColor"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <MdShoppingBasket className="text-2xl" />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>

            {customer ? (
              <LocalizedClientLink
                href="/account"
                className="flex items-center gap-2 text-headingColor transition-transform duration-150 hover:scale-105"
                data-testid="nav-account-link"
              >
                <MdOutlineAccountCircle className="text-3xl" />
                <span className="hidden small:inline">
                  {customer.first_name || "Tài khoản"}
                </span>
              </LocalizedClientLink>
            ) : (
              <LocalizedClientLink
                href="/account"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1 text-headingColor transition-transform duration-150 hover:scale-105"
                data-testid="nav-account-link"
              >
                <MdLogin />
                <span className="hidden small:inline">Đăng nhập</span>
              </LocalizedClientLink>
            )}
          </div>
        </nav>
      </header>
    </div>
  )
}

import Image from "next/image"
import { BsFacebook, BsGithub, BsInstagram } from "react-icons/bs"

import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Prosperum26", icon: BsGithub },
  { label: "Facebook", href: "https://facebook.com", icon: BsFacebook },
  { label: "Instagram", href: "https://instagram.com", icon: BsInstagram },
]

// Montra footer: light panel, logo + brand, divider, copyright and round social icons.
export default async function Footer() {
  const productCategories = await listCategories()
  const topCategories =
    productCategories?.filter((c) => !c.parent_category).slice(0, 6) ?? []

  return (
    <footer className="w-full bg-primary">
      <div className="content-container flex flex-col py-8 small:py-12">
        <div className="flex flex-col gap-8 small:flex-row small:items-start small:justify-between">
          <LocalizedClientLink href="/" className="flex items-center gap-4">
            <Image
              src="/montra/logo.png"
              alt="SmartPantry"
              width={56}
              height={56}
              className="h-12 w-12 object-contain small:h-14 small:w-14"
            />
            <span className="text-2xl font-semibold text-headingColor">
              SmartPantry
            </span>
          </LocalizedClientLink>

          <div className="grid grid-cols-2 gap-10 text-sm small:gap-x-16">
            {topCategories.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-semibold text-headingColor">
                  Danh mục
                </span>
                <ul className="grid grid-cols-1 gap-2" data-testid="footer-categories">
                  {topCategories.map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-textColor hover:text-headingColor"
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="font-semibold text-headingColor">Mua sắm</span>
              <ul className="grid grid-cols-1 gap-2">
                <li>
                  <LocalizedClientLink className="text-textColor hover:text-headingColor" href="/store">
                    Tất cả sản phẩm
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="text-textColor hover:text-headingColor" href="/account/orders">
                    Đơn hàng của tôi
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="text-textColor hover:text-headingColor" href="/cart">
                    Giỏ hàng
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200 small:my-8" />

        <div className="flex flex-col items-center justify-center gap-4 small:flex-row small:justify-between">
          <span className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SmartPantry · MSIS4133 Nhóm 05, UIT
          </span>
          <div className="flex gap-4 text-xl">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-textColor shadow-sm transition-transform duration-150 hover:scale-110"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

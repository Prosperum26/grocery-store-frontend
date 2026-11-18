import { LuClock, LuMail, LuMapPin, LuPhone } from "react-icons/lu"
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6"

import { POLICIES, SITE_CONTACT, SOCIAL_LINKS } from "@lib/mock/site"
import Chip from "@modules/common/components/chip"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/layout/components/logo"

const SOCIAL_ICONS = { Facebook: FaFacebookF, Instagram: FaInstagram, TikTok: FaTiktok }

const SHOP_LINKS = [
  { label: "Rau củ", href: "/categories/rau-cu" },
  { label: "Thịt", href: "/categories/thit" },
  { label: "Hải sản", href: "/categories/hai-san" },
  { label: "Trứng & Sữa", href: "/categories/trung-sua" },
  { label: "Tất cả sản phẩm", href: "/store" },
]

const HELP_LINKS = [
  { label: "Trợ lý Bếp", href: "/tro-ly-bep" },
  { label: "Đơn hàng của tôi", href: "/account/orders" },
  { label: "Giỏ hàng", href: "/cart" },
]

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-accent">
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5 text-sm">{children}</ul>
    </div>
  )
}

const linkClass = "text-on-dark hover:text-white hover:underline"

/** Store footer of the v2 design (footer() in ui.js) plus contact and policies. */
export default function Footer() {
  return (
    <footer className="bg-brand-deep text-white" data-surface="dark">
      <div className="content-container flex flex-col gap-8 pb-28 pt-12 small:pb-9">
        <div className="grid gap-10 small:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <LocalizedClientLink href="/" aria-label="Com4Fud, về trang chủ" className="w-fit">
              <Logo inverse />
            </LocalizedClientLink>
            <p className="text-sm text-on-dark">Đi chợ trực tuyến cho bữa cơm nhà.</p>
            <address className="flex flex-col gap-2 text-sm not-italic text-on-dark">
              <a href={SITE_CONTACT.hotlineHref} className="flex items-center gap-2 hover:text-white">
                <LuPhone size={16} aria-hidden="true" className="text-accent" />
                Tổng đài <span className="font-mono">{SITE_CONTACT.hotline}</span>
              </a>
              <a href={`mailto:${SITE_CONTACT.email}`} className="flex items-center gap-2 hover:text-white">
                <LuMail size={16} aria-hidden="true" className="text-accent" />
                {SITE_CONTACT.email}
              </a>
              <span className="flex items-center gap-2">
                <LuMapPin size={16} aria-hidden="true" className="text-accent" />
                {SITE_CONTACT.address}
              </span>
              <span className="flex items-center gap-2">
                <LuClock size={16} aria-hidden="true" className="text-accent" />
                {SITE_CONTACT.hours}
              </span>
            </address>
          </div>

          <Column title="Mua sắm">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <LocalizedClientLink href={l.href} className={linkClass}>
                  {l.label}
                </LocalizedClientLink>
              </li>
            ))}
          </Column>

          <Column title="Hỗ trợ">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <LocalizedClientLink href={l.href} className={linkClass}>
                  {l.label}
                </LocalizedClientLink>
              </li>
            ))}
          </Column>

          <Column title="Chính sách">
            {POLICIES.map((p) => (
              <li key={p.slug}>
                <LocalizedClientLink href={`/chinh-sach/${p.slug}`} className={linkClass}>
                  {p.title}
                </LocalizedClientLink>
              </li>
            ))}
          </Column>
        </div>

        <hr className="border-dark-line" />

        <div className="flex flex-col gap-4 small:flex-row small:items-center small:justify-between">
          <p className="text-xs text-on-dark">© 2026 Com4Fud · Đồ án MSIS4133, UIT</p>
          <div className="flex items-center gap-4">
            <ul className="flex items-center gap-2" aria-label="Mạng xã hội">
              {SOCIAL_LINKS.map((s) => {
                const Icon = SOCIAL_ICONS[s.label]
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (mở tab mới)`}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-mid text-white hover:bg-brand"
                    >
                      <Icon size={16} aria-hidden="true" />
                    </a>
                  </li>
                )
              })}
            </ul>
            <span className="flex items-center gap-2 text-xs text-on-dark">
              Thanh toán qua <Chip mono>VNPAY</Chip>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

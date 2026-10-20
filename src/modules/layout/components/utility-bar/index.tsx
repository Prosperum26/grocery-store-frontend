import { LuClock, LuTruck } from "react-icons/lu"

import { SITE_CONTACT } from "@lib/mock/site"

/**
 * Thin dark bar above the desktop header (utilityBar() in ui.js). The
 * "free delivery from 300.000đ" line of the design is left out on purpose:
 * it contradicts the 15.000đ fee in the design's own sample order (plan O4).
 */
export default function UtilityBar() {
  return (
    <div className="bg-brand-deep text-white" data-surface="dark">
      <div className="content-container flex h-9 items-center justify-between text-xs">
        <p className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <LuClock size={14} aria-hidden="true" className="text-accent" />
            Giao trong ngày tại TP.HCM
          </span>
          <span className="flex items-center gap-1.5">
            <LuTruck size={14} aria-hidden="true" className="text-accent" />
            Chọn khung giờ giao khi thanh toán
          </span>
        </p>
        <a href={SITE_CONTACT.hotlineHref} className="font-mono text-on-dark hover:text-white">
          Tổng đài {SITE_CONTACT.hotline}
        </a>
      </div>
    </div>
  )
}

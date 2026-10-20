import { clx } from "@medusajs/ui"
import type { IconType } from "react-icons"
import {
  LuCheck,
  LuCircleCheck,
  LuClock,
  LuPackage,
  LuTruck,
  LuX,
} from "react-icons/lu"

import { stageLabel } from "@lib/util/stage"
import type { OrderStage } from "types/viewmodels"

// Order status printed on a notched "ticket" (orderChip() in ui.js), same
// family as the price tag. Colour, icon and text all carry the status, so it
// never depends on colour alone.
const STYLE: Record<OrderStage, { icon: IconType; className: string }> = {
  PENDING: { icon: LuClock, className: "bg-warn-bg text-warn-ink" },
  CONFIRMED: { icon: LuCheck, className: "bg-sky-bg text-sky" },
  PREPARING: { icon: LuPackage, className: "bg-plum-bg text-plum" },
  SHIPPING: { icon: LuTruck, className: "bg-brand text-white" },
  DELIVERED: { icon: LuCircleCheck, className: "bg-brand-bg text-brand-deep" },
  CANCELLED: { icon: LuX, className: "bg-sale-bg text-sale-deep" },
}

export default function OrderStatusChip({
  stage,
  large,
  className,
}: {
  stage: OrderStage
  large?: boolean
  className?: string
}) {
  const { icon: Icon, className: tone } = STYLE[stage]
  return (
    <span
      className={clx(
        "ticket relative inline-flex w-fit items-center gap-1.5 whitespace-nowrap pl-[18px] pr-3 text-xs font-semibold",
        large ? "h-[30px]" : "h-7",
        tone,
        className
      )}
    >
      {/* Punched hole of the ticket. */}
      <span
        aria-hidden="true"
        className="absolute left-[7px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-surface"
      />
      <Icon size={14} aria-hidden="true" />
      {stageLabel(stage)}
    </span>
  )
}

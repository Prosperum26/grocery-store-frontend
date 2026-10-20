import { Metadata } from "next"
import { LuArrowRight, LuChefHat, LuHouse } from "react-icons/lu"

import Button from "@modules/common/components/button"
import { ComingSoonPanel } from "@modules/common/components/coming-soon"

export const metadata: Metadata = {
  title: "Trợ lý Bếp · Com4Fud",
}

// Placeholder for the kitchen assistant (issue #11 section 3). The real page
// (chat, weekly menu, recipe to cart) follows 10_Tro_Ly_Bep_* and needs the
// AI service, so it belongs to phase 2.
export default function KitchenAssistantPage() {
  return (
    <div className="content-container py-10 small:py-16">
      <ComingSoonPanel
        as="h1"
        title="Trợ lý Bếp"
        description="Gợi ý thực đơn cho cả tuần và gom đủ nguyên liệu còn hàng vào giỏ cho bạn."
        icon={
          <span
            aria-hidden="true"
            className="flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl bg-accent text-ink"
          >
            <LuChefHat size={32} />
          </span>
        }
      >
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="secondary" icon={<LuHouse />}>
            Về trang chủ
          </Button>
          <Button href="/store" iconRight={<LuArrowRight />}>
            Xem sản phẩm
          </Button>
        </div>
      </ComingSoonPanel>
    </div>
  )
}

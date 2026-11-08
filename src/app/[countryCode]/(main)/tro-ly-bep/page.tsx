import { Metadata } from "next"
import { LuArrowRight, LuChefHat, LuHouse } from "react-icons/lu"

import { isMockMode } from "@lib/mock/mode"
import Button from "@modules/common/components/button"
import { ComingSoonPanel } from "@modules/common/components/coming-soon"
import KitchenAssistant from "@modules/kitchen/kitchen-assistant"

export const metadata: Metadata = {
  title: "Trợ lý Bếp · Com4Fud",
}

// With the real backend: search a dish, open its recipe, tick ingredients and
// add them to the cart (screens 10 and 11, scope "Tìm món → công thức vào giỏ").
// Mock mode has no AI service behind it, so it keeps the placeholder.
export default function KitchenAssistantPage() {
  if (!isMockMode()) {
    return <KitchenAssistant />
  }
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

import { Metadata } from "next"
import { LuArrowRight, LuChefHat, LuHouse } from "react-icons/lu"

import { searchRecipes } from "@lib/data/kitchen"
import { isMockMode } from "@lib/mock/mode"
import Button from "@modules/common/components/button"
import KitchenSearch from "@modules/kitchen/kitchen-search"

export const metadata: Metadata = {
  title: "Trợ lý Bếp · Com4Fud",
}

// With the real backend: search a dish (?q=...), then open its recipe at
// /tro-ly-bep/[recipeId]. The search runs here on the server, so the result
// list has an address that can be reloaded and shared.
// Mock mode has no AI service behind it, so it says so and points back to the shop.
export default async function KitchenAssistantPage(props: { searchParams: Promise<{ q?: string | string[] }> }) {
  if (!isMockMode()) {
    const { q } = await props.searchParams
    const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 300) ?? ""
    return <KitchenSearch query={query} result={query ? await searchRecipes(query) : null} />
  }
  return (
    <div className="content-container py-10 small:py-16">
      <section className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
        <span aria-hidden="true" className="flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl bg-accent text-ink">
          <LuChefHat size={32} />
        </span>
        <h1 className="font-display text-2xl font-bold text-ink">Trợ lý Bếp</h1>
        <p className="text-sm text-ink-2">Trợ lý Bếp cần máy chủ AI. Bản xem thử không nối máy chủ nên chưa tìm món được.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="secondary" icon={<LuHouse />}>
            Về trang chủ
          </Button>
          <Button href="/store" iconRight={<LuArrowRight />}>
            Xem sản phẩm
          </Button>
        </div>
      </section>
    </div>
  )
}

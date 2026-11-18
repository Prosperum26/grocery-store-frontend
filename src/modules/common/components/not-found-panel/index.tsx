import Button from "@modules/common/components/button"
import { LuPackageX } from "react-icons/lu"

/**
 * 404 of the v2 design (13_Trang_Thai_UI, "Trang này đã hết hàng"). It works
 * for any missing page, so the copy is about the page and not about stock.
 */
export default function NotFoundPanel() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center small:py-24"
    >
      <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-ink">
        <LuPackageX size={30} />
      </span>
      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-2">Lỗi 404</p>
      <h1 id="not-found-title" className="font-display text-3xl font-bold text-ink small:text-[40px] small:leading-tight">
        Trang này đã hết hàng
      </h1>
      <p className="text-sm text-ink-2">Trang bạn tìm không còn hoặc đã đổi địa chỉ. Hãy quay lại trang chủ hoặc tìm món khác.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="primary" href="/">
          Về trang chủ
        </Button>
        <Button variant="secondary" href="/store">
          Xem sản phẩm
        </Button>
      </div>
    </section>
  )
}

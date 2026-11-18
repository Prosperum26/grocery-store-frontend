import Button from "@modules/common/components/button"

/** Empty cart (FE-12): says so, and offers one way forward. */
export default function EmptyCartMessage() {
  return (
    <section
      aria-labelledby="empty-cart-title"
      data-testid="empty-cart-message"
      className="flex flex-col items-start gap-4 rounded-card border border-dashed border-line-2 bg-surface p-6 small:p-10"
    >
      <h2 id="empty-cart-title" className="font-display text-2xl font-bold text-ink">
        Giỏ hàng đang trống
      </h2>
      <p className="max-w-md text-sm text-ink-2">
        Chọn vài món rau củ, thịt cá để bắt đầu. Giỏ hàng sẽ hiện ở đây.
      </p>
      <Button variant="primary" href="/store">
        Đi chợ ngay
      </Button>
    </section>
  )
}

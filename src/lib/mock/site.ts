// Static site content for the shell (issue #11). Contact details are clearly
// fake placeholders until the team has real ones (plan §2, O1/O2).

export const SITE_CONTACT = {
  hotline: "1900 0000",
  hotlineHref: "tel:19000000",
  email: "cskh@com4fud.demo",
  address: "Kho Q.7, Quận 7, TP.HCM",
  hours: "07:00–21:00 mỗi ngày",
}

export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "TikTok", href: "https://www.tiktok.com" },
] as const

export type Policy = { slug: string; title: string; paragraphs: string[] }

// Short sample text so footer links lead to real pages, not a 404.
export const POLICIES: Policy[] = [
  {
    slug: "giao-hang",
    title: "Chính sách giao hàng",
    paragraphs: [
      "Com4Fud giao hàng trong ngày tại TP.HCM theo khung giờ bạn chọn khi thanh toán.",
      "Phí giao hàng hiện theo từng khung giờ ngay ở bước thanh toán, trước khi bạn xác nhận đơn.",
      "Khi tài xế bắt đầu giao, bạn sẽ thấy giờ dự kiến tới trong trang theo dõi đơn.",
    ],
  },
  {
    slug: "doi-tra",
    title: "Đổi trả hàng tươi",
    paragraphs: [
      "Nếu sản phẩm không tươi hoặc sai quy cách, hãy báo cho Com4Fud trong vòng 24 giờ kể từ lúc nhận hàng.",
      "Chụp ảnh sản phẩm và gửi kèm mã đơn để được đổi hàng mới hoặc hoàn tiền về tài khoản đã thanh toán.",
    ],
  },
  {
    slug: "bao-mat",
    title: "Chính sách bảo mật",
    paragraphs: [
      "Com4Fud chỉ dùng thông tin của bạn để xử lý đơn hàng và giao hàng.",
      "Thông tin thanh toán được xử lý bởi VNPAY; Com4Fud không lưu số thẻ của bạn.",
    ],
  },
  {
    slug: "dieu-khoan",
    title: "Điều khoản sử dụng",
    paragraphs: [
      "Khi đặt hàng tại Com4Fud, bạn đồng ý với giá và quy cách hiển thị tại thời điểm đặt.",
      "Đây là trang web của đồ án môn học MSIS4133 (UIT), dữ liệu sản phẩm và đơn hàng là dữ liệu minh họa.",
    ],
  },
]

export function findPolicy(slug: string): Policy | undefined {
  return POLICIES.find((p) => p.slug === slug)
}

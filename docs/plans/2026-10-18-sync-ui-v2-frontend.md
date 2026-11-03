# Sync giao diện v2 (xương) + palette v1 (xanh lá): phần Frontend (issue #11)

> **Cho người làm tiếp:** làm lần lượt từng task, tick `- [ ]` khi xong, ghi commit hash vào bảng mục 0. Mỗi task đủ độc lập để merge riêng, nên có thể dừng giữa chừng. Phần backend (đấu dữ liệu thật) nằm ở `grocery-store-backend/docs/plans/2026-10-18-sync-ui-v2-backend.md` và là **giai đoạn sau**, không thuộc issue này.
>
> Storefront là Medusa Next.js Starter (Next 15, Tailwind 3, React 19, `@medusajs/js-sdk`). Đừng đoán API Medusa từ trí nhớ, tra docs trước khi đụng SDK. Lệnh: `yarn dev` (cổng 8000), `yarn build`, `yarn lint`, `npx tsc --noEmit`.

**Issue:** Prosperum26/grocery-store-backend#11 "[UI/Storefront] Đồng bộ toàn bộ giao diện Storefront theo bản thiết kế Figma".
**Mục tiêu:** thay hoàn toàn giao diện mặc định/Montra bằng khung xương v2 + bộ màu xanh lá v1. **Chỉ làm vỏ giao diện**: layout, typography, màu, component, điều hướng. Chưa đấu catalog thật, chưa làm logic backend.
**Nguồn thiết kế:** bản SVG đã tải về `Com4Fud_UI_SVG/v2/` (thực tế nằm ở `Com4Fud_UI_SVG/Com4Fud_UI_SVG/`, mã sinh ở `_source/src/*.js`) (README, ảnh `preview_png/`, mã sinh ở `v2/_source/src/*.js`). Không cần truy cập Figma. Ảnh PNG v2 vẽ bằng **màu đỏ-xanh cũ**, chỉ để xem bố cục; màu lấy từ mục 1.2.
**Nhánh:** `feature/sync-figma-ui`.

## 0. Bảng trạng thái

| Task | Nội dung | Mục issue | Trạng thái |
| :--- | :--- | :--- | :--- |
| FE-0 | Nền: chế độ mock, lớp dữ liệu giả, kiểu view-model, pin phiên bản | 2 | [x] 17b9c54, fa4b743 |
| FE-1 | Token màu, font, Tailwind, ghi đè biến `@medusajs/ui`, nền tảng a11y | 1 | [x] 646fbb3 |
| FE-2 | Minh họa nông sản (`public/art`) + `ProductArt` | 2 | [x] 1ee281a |
| FE-3 | Thành phần dùng chung + hệ thống "Đang trong quá trình phát triển" | 1, 3 | [x] c6d379a |
| FE-4 | Header, Footer, điều hướng điện thoại, trang chính sách | 1 | [x] 7b113e0 (kèm trang giữ chỗ FE-11) |
| FE-5 | Trang chủ | 2 | [x] 25deff3, sửa sau review 5521dac |
| FE-6 | Danh sách sản phẩm (PLP) + lọc/sắp xếp | 2 | [x] dc436e3 |
| FE-7 | Chi tiết sản phẩm (PDP) | 2 | [x] 54716b4 |
| FE-8 | Giỏ hàng | 2 | [x] 903353f |
| FE-9 | Thanh toán + Đặt hàng thành công | 2 | [x] fbdb75a |
| FE-10 | Tài khoản: đăng nhập/đăng ký, Đơn hàng của tôi, Theo dõi đơn, Hồ sơ | 2, 3 | [x] 35786f8; Hồ sơ/Địa chỉ đã Việt hóa (2026-10-20) |
| FE-11 | Trợ lý Bếp (trang giữ chỗ) | 3 | [x] 7b113e0 |
| FE-12 | Trạng thái giao diện: trống, tải, lỗi, 404, mất mạng | 2 | [x] 126d193; skeleton v2 + `loading.tsx` (2026-10-20) |
| FE-13 | Rà soát accessibility | cả issue | [x] Lighthouse a11y 100 trên 9 trang (2026-10-20); chưa thử NVDA |
| FE-14 | Kiểm tra liên kết, build, responsive, dọn dẹp, README | nghiệm thu | [x] e7999ee; lint sạch, bỏ alias Montra (2026-10-20) |

## 1. Bối cảnh và những gì đã chốt

### 1.1 Quyết định (2026-10-18, nhóm)

Lấy **bố cục và thành phần của v2**, **giữ bảng màu xanh lá của v1** (bộ đỏ-xanh của v2 bị bỏ vì xấu). Quy tắc còn lại của v2 giữ nguyên (nguồn: `docs/07-ui-design.md` gốc):

- Tiếng Việt thuần trên giao diện. Không chữ "AI", shipper, voucher, Sandbox, COD, MoMo. (Issue viết "Trợ lý Bếp AI" và "Ví voucher"; trên giao diện dùng **"Trợ lý Bếp"** và **"Ví mã giảm giá"**.)
- Chỉ hiện điều khách cần và chắc chắn: không xác suất, chu kỳ, độ khớp, nguồn dữ liệu, tên mô hình.
- Trang bán hàng không viết kiểu trang giới thiệu (không hàng cam kết, dãy số marketing).
- Thanh toán chỉ VNPAY. Không bản đồ theo dõi trực tiếp.
- Điện thoại: một nút nổi, bấm mới bung thanh 5 mục (Trang chủ, Danh mục, Trợ lý Bếp, Giỏ hàng, Tài khoản). Trang chủ để **Ưu đãi hôm nay trước Danh mục**.
- Bộ lọc sản phẩm chỉ có **Chỉ hiện còn hàng** và **Đang giảm giá**, cộng danh mục và nút sắp xếp.
- Không có trang Giỏ đoán trước riêng: nằm trong Giỏ hàng, tên **"Có thể bạn cần mua lại"**.
- Phong cách thành phần: nhãn viền đậm, bóng đặc lệch 2px; trạng thái đơn in trên **vé có khía**; tem giảm giá dán nghiêng; thông báo viền than, bóng màu theo loại.

### 1.2 Bảng màu: v2 (vai trò) → v1 (giá trị)

Đặt tên Tailwind theo **vai trò**, không theo màu, vì tên v2 (`red` = hành động mua) không còn đúng khi hành động mua đổi sang xanh.

| Token mới | Giá trị | Thay cho (v2) | Dùng cho |
| :--- | :--- | :--- | :--- |
| `brand` | `#1F6B3A` | `red` | Nút mua, mục đang chọn, liên kết hành động |
| `brand-deep` | `#0F3D2E` | `redDeep` + nền tối | Hover/nhấn, chân trang, nền banner công thức, nút nổi điện thoại |
| `brand-mid` | `#16503A` | (mới) | Nền tối cấp hai |
| `brand-vivid` | `#3C9A5B` | `leafV` | Dấu "còn hàng", tiến trình |
| `brand-bg` | `#DCEFD9` | `redBg` (mục chọn) + `leafBg` | Nền mục đang chọn |
| `accent` | `#C8F169` | `leaf` (vai trò mua lại, Trợ lý Bếp) | Chỉ cho **Mua lại** và **Trợ lý Bếp**; chữ trên nó là `accent-ink` hoặc `ink` |
| `accent-soft` / `accent-ink` | `#EEFAD0` / `#3D5A00` | `leafBg` / `leafDeep` | Nền khối "Có thể bạn cần mua lại" / chữ trên accent |
| `sale` | `#C8361F` | `red` (giá giảm, lỗi) | Giá giảm, hết hàng, lỗi, nút xóa |
| `sale-vivid` | `#E8492B` | | Điểm nhấn nhỏ trên nền tối |
| `sale-bg` | `#FDE4DE` | `redBg` (nền lỗi) | Nền cảnh báo, dòng hết hàng |
| `sale-deep` | `#9E2815` | `redDeep` | Chữ lỗi trên `sale-bg`. **Giá trị mới, cần kiểm tra tương phản** |
| `sale-line` | `#F3BFB3` | `redLine` | Viền cảnh báo. **Mới, cần kiểm tra** |
| `warn` | `#E9A23B` | `sun` | Tem giảm giá (chữ và viền `ink`), "sắp hết", "chờ xác nhận" |
| `warn-bg` / `warn-ink` | `#FCEFD6` / `#7A4B00` | `sunBg` / `sunInk` | |
| `ink` / `ink-2` / `ink-3` | `#10241B` / `#4E5D55` / `#626E67` | `ink*` | Chữ (`ink-3` làm tối từ `#66736B` của v1 để đạt 4,5:1 trên `page`; không dùng `ink-3` trên `page-2`) |
| `page` / `page-2` | `#F2F4EC` / `#E8ECDF` | `bg` / `bg2` | Nền trang / nền phụ (đổi tên từ `bg` vì lớp `bg-bg` khó đọc) |
| `surface` | `#FFFFFF` | | Thẻ |
| `line` / `line-2` | `#DDE3D6` / `#C3CCBD` | | Viền thẻ / viền ô nhập |
| `on-dark` / `dark-line` | `#B5C7BA` / `#2C5A45` | `onDark2` / `darkLine` | Chữ phụ, viền trên nền tối |
| `sky`, `plum` | `#2563A8` / `#6B3FA0` (bg `#DFEAF7` / `#EDE4F7`) | giữ | "Đã xác nhận", "Đang chuẩn bị" |

Quy tắc dùng: nền kem-xanh chiếm đa số, `brand` ≤ ~10% diện tích một màn, `accent` rất ít, **không đặt hai khối lớn `brand` và `sale` cạnh nhau**. Đĩa nền sản phẩm (`tint`) giữ bảng 8 màu `T` trong `v2/_source/src/shared.js`.

| Thành phần v2 | Màu cũ | Màu mới |
| :--- | :--- | :--- |
| Nút nổi điện thoại | nền `ink`, bóng `red` | `brand-deep`, bóng `accent` |
| Băng rôn ưu đãi chính | `red` / `redDeep` | `brand` / `brand-deep`, nút "Mua ngay" màu `warn` |
| Vé trạng thái đơn | Chờ xác nhận `sun`; Đã xác nhận `sky`; Đang chuẩn bị `plum`; Đang giao `leafSolid`; Đã giao `leaf`; Đã hủy `red` | `warn`; `sky`; `plum`; `brand` (đặc); `brand-bg`/`brand-deep`; `sale` |
| Nhãn "Mua lại", chip Trợ lý Bếp | `leaf` | `accent` |
| "Còn hàng", thành công | `leaf` | `brand-vivid` / `brand-bg` |
| Hết hàng, lỗi, xóa | `red` | `sale` |

### 1.3 Hiện trạng frontend (2026-10-18)

- Đã có giao diện **Montra cam** ở header, hero, thẻ sản phẩm, giỏ, footer (`modules/layout/templates/{nav,footer}`, `modules/home/components/hero`, `modules/products/components/product-preview`, `modules/layout/components/cart-dropdown`); Tailwind còn bảng Montra, ảnh ở `public/montra/`; thương hiệu đang hiện là "SmartPantry" (phải là **Com4Fud**).
- Phần còn lại là Starter nguyên bản dùng `@medusajs/ui` (74 file) và lớp `text-ui-*` (53 file): cần ghi đè biến ở FE-1 để trang chưa làm lại không lệch tông.
- Backend đang là catalog áo quần châu Âu (region eur/usd). Vì issue này **không đấu dữ liệu thật**, storefront chạy bằng dữ liệu giả (FE-0), không phụ thuộc backend.
- Font hiện chỉ Be Vietnam Pro, nạp bằng `<link>` trong `src/app/layout.tsx` (comment ở đó nói vì sao không dùng `next/font/google`; giữ cách này).

### 1.4 Chế độ mock (quyết định kiến trúc)

Biến `NEXT_PUBLIC_UI_MOCK` (mặc định `true` trong `.env.template` cho đến khi đấu dữ liệu thật). Khi bật:

- Lớp `src/lib/data/*` (regions, products, categories, collections, cart, customer, orders) trả dữ liệu giả từ `src/lib/mock/*`, **không gọi mạng**. Mỗi hàm giữ nguyên chữ ký hiện tại để giai đoạn sau chỉ cần tắt cờ.
- Mọi component hiển thị nhận **view-model** (`ProductVM`, `CartVM`, `OrderVM`) chứ không nhận `StoreProduct` trực tiếp. Có hai bộ chuyển: `fromMock` và `fromMedusa` (bộ sau viết cho giai đoạn 2, FE-0 chỉ cần khung và test).
- Dữ liệu giả lấy từ `v2/_source/src/shared.js` (23 sản phẩm, khách Trần Minh Thư, giỏ 9 món 395.000đ, đơn `C4F-261007-0142` 390.000đ, 5 đơn lịch sử). Giữ đúng số liệu để khớp bản thiết kế.
- Giỏ giả sống trong bộ nhớ (React context, lưu `sessionStorage` bọc `try/catch`, trang vẫn chạy khi không có storage). Không persist qua phiên.

### 1.5 Hệ thống giữ chỗ "Đang trong quá trình phát triển" (yêu cầu mục 3 của issue)

Một cách thể hiện duy nhất cho mọi tính năng chưa có:

| Tính năng | Cách giữ chỗ |
| :--- | :--- |
| Trợ lý Bếp (nav, banner công thức, nút "Xem công thức", "Thêm N nguyên liệu") | Mục nav dẫn tới trang `/[countryCode]/tro-ly-bep` giữ chỗ (FE-11); nút ở nơi khác mở `ComingSoonDialog` |
| Có thể bạn cần mua lại (trang chủ, giỏ) | Khối vẫn hiện đúng vị trí với 3 món mẫu mờ + huy hiệu; nút "Thêm tất cả" `aria-disabled` |
| Theo dõi đơn thời gian thực (thẻ "Dự kiến tới lúc", thông báo) | Thẻ giữ chỗ trong trang chi tiết đơn; timeline tĩnh vẫn hiện |
| Ví mã giảm giá | Mục trong menu tài khoản mở trang giữ chỗ `/account/vi-ma-giam-gia`; ô nhập mã ở giỏ vẫn chạy với mã mẫu `TUOI20` |
| Chính sách, mạng xã hội ở chân trang | Trang chính sách tĩnh (FE-4); liên kết mạng xã hội là URL ngoài thật (O2) |

Nhãn chuẩn: **"Đang trong quá trình phát triển"**; dòng phụ: "Tính năng này sẽ sớm ra mắt." Không dùng `href="#"`, không `alert()`. Chi tiết cài đặt ở FE-3.

## 2. Câu hỏi mở (có mặc định, không chặn việc)

| # | Câu hỏi | Task | Mặc định |
| :--- | :--- | :--- | :--- |
| O1 | Thông tin liên hệ chân trang (hotline, email, địa chỉ kho) | FE-4 | Dữ liệu mẫu rõ ràng là giả (`hotline: 1900 0000`, `cskh@com4fud.demo`), gom vào `src/lib/mock/site.ts` |
| O2 | URL mạng xã hội thật của Com4Fud | FE-4 | Liên kết gốc nền tảng (facebook.com, instagram.com, tiktok.com), `target="_blank" rel="noopener noreferrer"`, có `aria-label` nói rõ mở tab mới |
| O3 | Điểm đánh giá, nút tim, "Báo khi có hàng" có trong thiết kế nhưng không có dữ liệu | FE-3, 6, 7 | Không vẽ (quy tắc "chỉ hiện điều chắc chắn"). Nếu nhóm muốn giữ cho giống thiết kế, đổi sang giữ chỗ theo 1.5 |
| O4 | Dữ liệu mẫu ghi phí giao 15.000đ cho đơn 395.000đ, nhưng trang chủ có băng "Miễn phí giao từ 300.000đ". Mâu thuẫn | FE-5, 9 | Bỏ băng "miễn phí từ 300.000đ" |
| O5 | Trang tài khoản khi chưa đăng nhập ở chế độ mock | FE-10 | Ở môi trường dev (`NODE_ENV !== "production"`) và mock bật thì hiện khách mẫu; production luôn yêu cầu đăng nhập thật |
| O6 | Logo Com4Fud | FE-4 | Vẽ lại `logoMark` trong `v2/_source/src/ui.js` (hàm `logoMark`, `logo`) thành SVG React, nền `brand` |
| O7 | Ảnh sản phẩm thật chưa có | FE-2 | Dùng minh họa vector; `ProductArt` ưu tiên ảnh thật nếu có `thumbnail` |

---

## Task FE-0: Nền, chế độ mock

**Files:**
- Modify: `package.json` (pin `@medusajs/js-sdk`, `@medusajs/types` về `2.21.1`; các gói `@medusajs/ui`, `icons`, `ui-preset` đang `latest`, chốt theo `yarn.lock`), `.env.template` (`NEXT_PUBLIC_UI_MOCK=true`, `NEXT_PUBLIC_DEFAULT_REGION=vn`)
- Modify: `src/middleware.ts` (khi mock bật: không gọi backend lấy region, chỉ chấp nhận `vn`, chuyển hướng mọi đường dẫn không có tiền tố về `/vn/...`)
- Create: `src/lib/mock/{products,categories,cart,customer,orders,site}.ts`, `src/lib/mock/index.ts`
- Create: `src/types/viewmodels.ts`: `ProductVM`, `CartVM`, `OrderVM`, `OrderStage`
- Create: `src/lib/viewmodels/{from-mock,from-medusa}.ts`
- Modify: `src/lib/data/{regions,products,categories,collections,cart,customer,orders}.ts` (rẽ nhánh theo cờ)
- Create: `src/lib/util/{price,stage}.ts` + `*.test.ts`

**Interfaces:**
- `ProductVM { id; handle; title; categoryHandle; unitLabel; price: number; originalPrice?: number; stockQty: number; stockUnit: string; lowStock: number; art: string; tint: Tint; thumbnail?: string; origin?: string; prepOptions?: string[]; variants?: { id; label; price; stockQty }[] }`
- `salePercent(original: number, current: number): number | null`, `pricePerKg(price: number, weightGrams?: number): number | null`, `stageLabel(stage: OrderStage): string`.

**Xong khi:** `NEXT_PUBLIC_UI_MOCK=true yarn dev` chạy khi **tắt hẳn backend**, `/vn` trả 200; `yarn build` qua; test hàm thuần qua.

- [ ] Thêm `vitest` (devDependency) và script `"test": "vitest run"`. Chỉ test hàm thuần; Starter chưa có bộ test.
- [ ] Test viết trước: `salePercent(105000, 92000)` = `12`; `salePercent(92000, 92000)` = `null`; `pricePerKg(85000, 500)` = `170000`; `pricePerKg(85000, undefined)` = `null`; `stageLabel("SHIPPING")` = `"Đang giao"` (đủ 6 nhãn: Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao, Đã giao, Đã hủy).
- [ ] Dữ liệu giả: chép số liệu từ `shared.js`, thêm kiểm tra tổng trong test (`subtotal 395000`, `total 390000`, `cartCount 9`), như hàm `verify()` ở nguồn.
- [ ] Mọi hàm `src/lib/data/*` đổi chữ ký tối thiểu; nơi gọi hiện có (18 file dùng `countryCode`) không phải sửa.
- [ ] Đề xuất commit: `chore: mock mode, view-models and shared util tests`

## Task FE-1: Token, font, Tailwind, nền tảng accessibility

**Files:**
- Modify: `tailwind.config.js` (bỏ khối màu Montra; token mục 1.2; `boxShadow.sticker` `2px 2px 0 0` và `toast` `4px 4px 0 0` theo `var(--tw-shadow-color)`; `borderRadius`: `tag 6px`, `chip 7px`, `btn 12px`, `card 18px`, `banner 24px`; `fontFamily`: `display` Bricolage Grotesque, `sans` Be Vietnam Pro, `mono` JetBrains Mono)
- Modify: `src/app/layout.tsx` (thêm hai font vào `<link>`; `<html lang="vi">`; thẻ "Bỏ qua tới nội dung")
- Modify: `src/styles/globals.css` (ghi đè biến `@medusajs/ui-preset` ở `:root`; vòng focus; `prefers-reduced-motion`; lớp `.ticket`)

**Xong khi:** `yarn build` qua; `/vn/account` (trang Starter chưa sửa) nền kem-xanh, nút/liên kết màu `brand`; Tab vào trang đầu tiên hiện liên kết "Bỏ qua tới nội dung" và nhảy tới `#main`.

- [ ] Liệt kê biến CSS thật mà `@medusajs/ui-preset` dùng cho nút chính, nền, viền (đọc `node_modules/@medusajs/ui-preset`) rồi ghi đè đúng các biến đó. **Không đoán tên biến.**
- [ ] Giữ `screens` hiện có (`small: 1024px`, ...) để khỏi vỡ 18 file đang dùng.
- [ ] Giữ alias tạm cho lớp Montra đang được dùng (`headingColor`, `textColor`, `cardOverlay`, `containerbg`, `lightGray`, `cartNumBg`) trỏ sang token mới, kèm `// TODO FE-14: xóa`.
- [ ] Vòng focus toàn cục: `:focus-visible` viền 2px `brand` + offset 2px (đổi sang `accent` trên nền tối), không bao giờ `outline: none` mà không thay thế.
- [ ] `@media (prefers-reduced-motion: reduce)` tắt animation/transition của `framer-motion` và Tailwind (`animate-*`).
- [ ] Kiểm tra tương phản bằng công cụ (WCAG AA 4.5:1 chữ thường, 3:1 chữ lớn/viền thành phần): trắng trên `brand`; `ink` trên `accent`; `sale-deep` trên `sale-bg`; `warn-ink` trên `warn-bg`; `ink-2`/`ink-3` trên `bg`; `on-dark` trên `brand-deep`. Sửa giá trị mới và cập nhật bảng 1.2 nếu không đạt.
- [ ] Đề xuất commit: `feat(ui): green palette tokens, fonts, focus ring and medusa ui overrides`

## Task FE-2: Minh họa nông sản

**Files:**
- Create: `scripts/export-art.mjs`, `public/art/<key>.svg` × 23 (từ đối tượng `ART` ở `Com4Fud_UI_SVG/v2/_source/src/ui.js`, dòng 158)
- Create: `src/modules/products/components/product-art/index.tsx`, `src/lib/util/tint.ts`
- Modify: `src/modules/products/components/thumbnail/index.tsx`

**Interfaces:** `<ProductArt product: ProductVM; size?: number; dots?: boolean />`: có `thumbnail` thì `next/image`, không thì `/art/${art}.svg` trên đĩa `tint` có họa tiết chấm. `alt` là tên sản phẩm khi đứng một mình; `alt=""` khi tên đã có ngay bên cạnh.

**Xong khi:** thẻ cá lóc, cà chua, trứng hiện minh họa đúng trên đĩa đúng màu.

- [ ] Script xuất: mỗi `ART[key]()` trả nội dung SVG trong hộp 100×100; bọc `<svg viewBox="0 0 100 100" role="img">`. Mở vài file kiểm tra.
- [ ] `tint.ts`: bảng `T` (8 màu, mỗi màu `[nền, chấm]`) từ `shared.js`.
- [ ] Đề xuất commit: `feat(ui): product vector art and ProductArt`

## Task FE-3: Thành phần dùng chung và hệ thống giữ chỗ

**Files (mới, trong `src/modules/common/components/`):** `button`, `chip`, `sale-sticker`, `order-status-chip` (vé có khía), `stepper`, `toggle`, `filter-chip`, `live-stock`, `price-tag`, `banner`, `toast`, `field`, **`coming-soon/{badge,dialog,panel}.tsx`**. Thêm trang tạm `/vn/_kit` (xóa ở FE-14).

**Interfaces:**
- `<ComingSoonBadge />` chip `warn` có chấm, chữ "Đang trong quá trình phát triển".
- `<ComingSoonDialog open onClose title? />`: hộp thoại có `role="dialog"` `aria-modal="true"`, tiêu đề, dòng phụ "Tính năng này sẽ sớm ra mắt.", nút "Đã hiểu"; **bẫy focus**, đóng bằng Esc và bấm nền, trả focus về nút đã mở nó, khóa cuộn nền.
- `<ComingSoonPanel title description art? />`: khối thay chỗ cho tính năng chưa có.
- Hook `useComingSoon(): { open: (title?: string) => void; dialog: ReactNode }`.

**Xong khi:** `_kit` hiện mọi biến thể; bấm nút mở dialog, Tab không thoát ra ngoài, Esc đóng và focus quay về nút; không lỗi console.

- [ ] Nút theo `btn()` trong `ui.js`: cao `xs 30, sm 36, md 44, lg 52`; **vùng bấm thực tế ≥ 44px** (dùng `min-h`/padding ẩn cho xs/sm); biến thể `primary`(brand), `secondary`(viền), `deep`(brand-deep), `warn`, `danger`(sale), `dangerSoft`, `ghost`, `onDark`. Trạng thái `disabled` dùng `aria-disabled="true"` kèm `tabIndex` giữ nguyên để người dùng bàn phím vẫn thấy được, và chặn hành vi ở `onClick`.
- [ ] `Chip` có tông `neutral|brand|accent|sale|warn|sky|plum|dark|outline`; trừ `neutral`, viền đậm cùng tông và bóng `sticker`. `SaleSticker` xoay `-5deg`, nền `warn`, viền và bóng `ink`.
- [ ] `OrderStatusChip({ stage })`: vé có khía bằng `clip-path`/SVG; nhận biết bằng **icon + chữ**, không chỉ màu.
- [ ] `LiveStock({ qty, unit, low })`: ẩn khi `qty > low`; "Còn N {unit}" khi `0 < qty <= low`; "Hết hàng" khi 0.
- [ ] `Toast`/`Banner` tông `ok|warn|err|info`; vùng chứa toast là `role="status"` `aria-live="polite"` (lỗi dùng `role="alert"`); không tự tắt trong dưới 5 giây.
- [ ] `Toggle` dùng `role="switch"` `aria-checked`; `Field` luôn có `<label>` gắn `htmlFor`, lỗi gắn bằng `aria-describedby`.
- [ ] Đề xuất commit: `feat(ui): shared components and coming-soon placeholder system`

## Task FE-4: Header, Footer, điều hướng điện thoại, trang chính sách

**Files:**
- Modify: `src/modules/layout/templates/{nav,footer}/index.tsx`, `src/app/[countryCode]/(main)/layout.tsx`
- Create: `src/modules/layout/components/{utility-bar,mobile-nav,address-pill,logo,social-links}/index.tsx`
- Create: `src/app/[countryCode]/(main)/chinh-sach/[slug]/page.tsx` (slug: `giao-hang`, `doi-tra`, `bao-mat`, `dieu-khoan`; nội dung mẫu ngắn trong `src/lib/mock/site.ts`)
- Delete (cuối task): `modules/layout/components/medusa-cta`, `public/montra/` nếu hết dùng

**Xong khi:** desktop 1440 và mobile 390 khớp bố cục đầu/cuối trang của `01_Trang_Chu_*.png`; thương hiệu **Com4Fud**; bấm nút nổi mobile bung thanh 5 mục, nút X thu lại; mọi liên kết nav và chân trang tới trang tồn tại.

- [ ] Header desktop theo `utilityBar()`, `header()` (`ui.js` dòng 419–460): thanh tiện ích tối (`brand-deep`), logo, ô tìm kiếm (gửi tới `/store?q=`), địa chỉ giao, cụm tài khoản, nút giỏ có tổng tiền, hàng danh mục. Ô tìm kiếm là `<form role="search">` có `<label>` ẩn.
- [ ] Footer: nền `brand-deep`, cột liên hệ (O1), chính sách (4 liên kết tới trang vừa tạo), mạng xã hội (O2), chỉ ghi VNPAY (không COD/MoMo).
- [ ] Mobile nav (client component): nút nổi `aria-expanded` + `aria-controls`, thanh mở là `<nav aria-label="Điều hướng chính">`, Esc đóng và trả focus; mục đang chọn có `aria-current="page"`; nút cao ≥ 44px; mục "Trợ lý Bếp" dẫn `/tro-ly-bep`.
- [ ] Mỗi trang có đúng một `<main id="main">`; header là `<header>`, footer là `<footer>`; nhóm nav có nhãn `aria-label` khác nhau.
- [ ] Đề xuất commit: `feat(layout): v2 header, footer, mobile nav and policy pages`

## Task FE-5: Trang chủ

**Files:** `src/app/[countryCode]/(main)/page.tsx`; thay `modules/home/components/hero` bằng `promo-banner`, `category-grid`, `deals`, `buy-again`, `recipe-banner`.

**Xong khi:** thứ tự mobile: băng rôn, Ưu đãi hôm nay, Danh mục, Có thể bạn cần mua lại, gợi ý món; desktop thêm băng phụ hai bên; khớp `01_Trang_Chu_*.png`; mọi nút "Mua ngay"/"Xem tất cả" tới trang có thật.

- [ ] Băng rôn: nội dung cố định (`PROMOS` trong `src/lib/mock/site.ts`), "Mua ngay" tới `/store?sale=1`.
- [ ] Danh mục: 8 thẻ (Rau củ, Trái cây, Thịt, Hải sản, Trứng & Sữa, Gạo & Đồ khô, Gia vị, Đồ uống) tới `/categories/<handle>`; đĩa nền theo `CAT_ART` trong `pages_a.js`.
- [ ] Ưu đãi hôm nay: 4 sản phẩm giảm giá từ dữ liệu giả.
- [ ] "Có thể bạn cần mua lại" và banner "Tối nay nấu gì?" dùng giữ chỗ theo 1.5: bố cục đúng thiết kế, món mẫu mờ, `ComingSoonBadge`, nút `aria-disabled` mở `ComingSoonDialog`.
- [ ] O4: bỏ dải "Miễn phí giao từ 300.000đ".
- [ ] Đề xuất commit: `feat(home): v2 home page with placeholders`

## Task FE-6: Danh sách sản phẩm

**Files:** `src/app/[countryCode]/(main)/store/page.tsx`, `categories/[...category]/page.tsx`; `modules/store/templates/*`, `modules/store/components/refinement-list/*`, `modules/products/components/product-preview/*`.

**Xong khi:** khớp `02_San_Pham_*.png`; lọc "Chỉ hiện còn hàng", "Đang giảm giá", danh mục, sắp xếp và `?q=` hoạt động trên dữ liệu giả qua query string (bấm lại giữ trạng thái, chia sẻ được URL); kết quả rỗng có trạng thái trống (FE-12).

- [ ] Thẻ sản phẩm theo `productCard()`: tem `−N%`, lớp mờ "Hết hàng" (nút thêm bị khóa, không có chuông, O3), `LiveStock`, bước chọn số lượng nếu đã có trong giỏ giả.
- [ ] Desktop: thanh bên Danh mục (kèm số lượng) + thẻ "Lọc nhanh" hai công tắc. Mobile: chip danh mục cuộn ngang + hai chip lọc + nút sắp xếp. Chip lọc là `aria-pressed`.
- [ ] Sắp xếp: Phổ biến (mặc định), Giá tăng, Giá giảm, Mới nhất. Phân trang số ở desktop, "Xem thêm" ở mobile (`<nav aria-label="Phân trang">`, trang hiện tại `aria-current="page"`).
- [ ] Lưới là `<ul>` với `<li>` mỗi thẻ; số kết quả thông báo qua `aria-live="polite"` khi đổi bộ lọc.
- [ ] Đề xuất commit: `feat(store): v2 product list with filters`

## Task FE-7: Chi tiết sản phẩm

**Files:** `src/app/[countryCode]/(main)/products/[handle]/page.tsx`; `modules/products/templates/*`, `components/product-actions/*`, `image-gallery`, `related-products`, `product-tabs`.

**Xong khi:** khớp `03_Chi_Tiet_San_Pham_*.png`; chọn quy cách đổi giá/tồn; quy cách hết hàng bị mờ và không chọn được; chọn cách sơ chế; stepper số lượng; "Thêm vào giỏ" thêm vào giỏ giả và hiện toast có "Hoàn tác"; tab Mô tả / Bảo quản / **Dinh dưỡng (bố cục mẫu)**; "Thường mua kèm"; khối "Món ngon với …" là giữ chỗ.

- [ ] Quy cách thay `option-select.tsx` bằng ô chọn kiểu `specChoice` (nhãn + giá), dạng `radiogroup` có mũi tên điều hướng.
- [ ] Tab Dinh dưỡng: bảng giá trị mẫu cho mỗi 100g, đánh dấu rõ là **dữ liệu minh họa** trong mã (comment) vì thiết kế dặn "mock layout"; không hiện lời hứa sức khỏe.
- [ ] "170.000đ/kg" dùng `pricePerKg`; không có `weight` thì ẩn. Không vẽ điểm sao, tim (O3).
- [ ] Mobile: thanh hành động dưới đáy thay `mobile-actions.tsx`.
- [ ] Đề xuất commit: `feat(pdp): v2 product detail`

## Task FE-8: Giỏ hàng

**Files:** `modules/cart/templates/{index,items,summary}.tsx`, `modules/cart/components/item`, `modules/layout/components/cart-dropdown`; tạo `modules/cart/components/{buy-again,voucher-input}`; tạo `src/lib/context/mock-cart-context.tsx`.

**Xong khi:** khớp `04_Gio_Hang_*.png`: dòng hết hàng (nền `sale-bg`, "Vừa hết hàng, không tính vào đơn", nút Xóa), dòng giá vừa đổi (giá cũ gạch, giá mới `sale`, banner cảnh báo), stepper và xóa chạy trên giỏ giả, ô mã chấp nhận `TUOI20` (−20.000đ) và báo lỗi "Mã không hợp lệ" với mã khác, tổng khớp 390.000đ; "Có thể bạn cần mua lại" là giữ chỗ.

- [ ] Giỏ giả khởi tạo đúng `CART` trong `shared.js` (9 món) kèm tôm thẻ hết hàng và thịt ba rọi đổi giá 89.000→92.000 để cả hai trạng thái hiện được. Nút "Đã hiểu" ẩn banner trong phiên.
- [ ] Dòng hết hàng không cộng vào "Tạm tính" và chặn nút "Tiến hành thanh toán" cho đến khi xóa (mô tả bằng `aria-describedby`).
- [ ] Thay đổi số lượng/xóa thông báo qua vùng `aria-live`. Xóa món có "Hoàn tác" trong toast.
- [ ] Bỏ "Chọn tất cả / Xóa đã chọn" (không có ý nghĩa với giỏ giả).
- [ ] Đề xuất commit: `feat(cart): v2 cart on mock cart context`

## Task FE-9: Thanh toán và Đặt hàng thành công

**Files:** `src/app/[countryCode]/(checkout)/checkout/page.tsx`; `modules/checkout/**`; `src/lib/constants.tsx`; `order/[id]/confirmed/page.tsx`; `modules/order/templates/order-completed-template.tsx`

**Xong khi:** khớp `05_*` và `06_*`: ba phần đánh số (Địa chỉ, Thời gian giao, Thanh toán) + tóm tắt đơn; chọn khung giờ đổi phí và tổng (slot "đã đóng" mờ); ghi chú cho tài xế đếm ký tự (≤200); chỉ **một** lựa chọn "Thanh toán qua VNPAY"; bấm nút thì kiểm tra form (lỗi hiện đúng ô), thành công thì chuyển tới `/order/demo/confirmed`. Trang thành công bản máy tính **đơn giản như mobile**: dấu tích, lời cảm ơn, khung giờ, phiếu đặt hàng (vé có barcode), hai nút.

- [ ] Bỏ Stripe/iDeal/Bancontact/PayPal khỏi `paymentInfoMap`, bỏ `stripe-wrapper`, `payment-test` và dependency `@stripe/*`.
- [ ] Form địa chỉ: chỉ quốc gia Việt Nam (bỏ ô chọn quốc gia); thẻ địa chỉ dạng radio; mọi ô có `label`, `autocomplete` phù hợp (`name`, `tel`, `street-address`), lỗi gắn `aria-describedby` và tóm tắt lỗi đầu form (`role="alert"`).
- [ ] Thanh bước "Giỏ hàng, Thanh toán, Hoàn tất" là `<ol>` với `aria-current="step"`.
- [ ] Mobile: thanh đáy "Tổng thanh toán" + nút.
- [ ] Bỏ `onboarding-cta` và `transfer-*` khỏi trang thành công.
- [ ] Đề xuất commit: `feat(checkout): v2 checkout (VNPAY only) and order confirmed`

## Task FE-10: Tài khoản

**Files:** `account/@login/page.tsx`, `account/@dashboard/{page,orders/page,orders/details/[id]/page,profile/page,addresses/page}.tsx`, tạo `account/@dashboard/vi-ma-giam-gia/page.tsx`; `modules/account/**`, `modules/order/**`.

**Xong khi:** khớp `07_*`, `08_*`, `09_*`:
- Đăng nhập/đăng ký: nửa trái `brand-deep` với "Bữa cơm nhà, đi chợ một chạm.", form bên phải; tài khoản dùng thử chỉ hiện ở dev (không có mật khẩu viết cứng trong mã); **không** có nút "Tiếp tục với Google" (không có provider).
- Đơn hàng của tôi: 5 đơn mẫu với `OrderStatusChip`; nút theo trạng thái (Đang giao: "Theo dõi đơn"; Đã giao: "Mua lại", "Chi tiết").
- Theo dõi đơn: timeline tĩnh (Đã đặt hàng, Đã thanh toán, Đang chuẩn bị, Đang giao, Đã giao) từ dữ liệu giả; tài xế, danh sách món, thanh toán VNPAY; **thẻ "Dự kiến tới lúc / thông báo" là giữ chỗ**; không bản đồ.
- Menu tài khoản: Đơn hàng, Địa chỉ, Hồ sơ, **Ví mã giảm giá (giữ chỗ)**, Đăng xuất.

- [ ] Việt hóa mọi nhãn và thông báo lỗi.
- [ ] O5: khách mẫu ở dev + mock; production bắt buộc đăng nhập thật.
- [ ] "Mua lại" thêm lại món vào giỏ giả (món hết hàng bị bỏ qua và nói rõ trong toast).
- [ ] Timeline là `<ol>`; mốc hiện tại `aria-current="step"`; trạng thái đọc được bằng chữ, không chỉ bằng màu.
- [ ] Hồ sơ và Địa chỉ: chỉ đổi giao diện sang token mới, giữ form Starter.
- [ ] Đề xuất commit: `feat(account): v2 auth, orders, tracking and wallet placeholder`

## Task FE-11: Trợ lý Bếp (giữ chỗ)

**Files:** tạo `src/app/[countryCode]/(main)/tro-ly-bep/page.tsx`, `modules/assistant/placeholder.tsx`

**Xong khi:** trang có tiêu đề "Trợ lý Bếp", minh họa, một hai câu mô tả ngắn, `ComingSoonBadge`, nút "Về trang chủ" và "Xem sản phẩm"; không ô chat nào hoạt động; mục nav mobile và desktop dẫn vào đây không lỗi.

- [ ] Dựng bằng `ComingSoonPanel` (FE-3), không vẽ giao diện chat/thực đơn (thuộc giai đoạn 2, thiết kế ở `10_*` và `11_*`).
- [ ] Đề xuất commit: `feat(assistant): kitchen assistant placeholder page`

## Task FE-12: Trạng thái giao diện

**Files:** `src/modules/skeletons/*`, `src/app/not-found.tsx`, `src/app/[countryCode]/(main)/not-found.tsx`, `src/lib/context/toast-context.tsx`, `modules/common/components/offline-banner`

**Xong khi:** khớp `12_Trang_Thai_UI_*.png`: giỏ trống ("Giỏ hàng đang trống", "Đi chợ ngay"), kết quả lọc rỗng, skeleton khung xương, toast, banner mất mạng, 404 "Trang này đã hết hàng" có nút về trang chủ.

- [ ] Skeleton có `aria-busy="true"` ở vùng chứa và không đọc từng khối.
- [ ] Mất mạng: lắng nghe `online`/`offline` của `window`, không giả định trạng thái ban đầu.
- [ ] Đề xuất commit: `feat(ui): empty, loading, offline, 404 and toast states`

## Task FE-13: Rà soát accessibility

Issue yêu cầu cân nhắc accessibility; các task trên đã có yêu cầu rải rác, task này **kiểm chứng**.

- [ ] Quét bằng Lighthouse (mục Accessibility) 6 trang: `/vn`, `/vn/store`, `/vn/products/<một món>`, `/vn/cart`, `/vn/checkout`, `/vn/account/orders`; mục tiêu **≥ 95**, mỗi lỗi còn lại ghi vào bảng "Khác thiết kế / Tồn đọng" bên dưới.
- [ ] Bật `eslint-plugin-jsx-a11y` nếu `next lint` chưa gồm; `yarn lint` sạch.
- [ ] Duyệt bàn phím toàn luồng chỉ bằng Tab/Shift+Tab/Enter/Space/Esc: duyệt trang chủ → thêm vào giỏ → thanh toán → hoàn tất. Thứ tự focus theo thứ tự hiển thị, không bẫy focus ngoài dialog, vòng focus luôn thấy.
- [ ] Đọc thử bằng trình đọc màn hình (NVDA hoặc VoiceOver) ở 3 điểm: thẻ sản phẩm (đọc tên, giá, tình trạng), dialog giữ chỗ, timeline đơn.
- [ ] Kiểm tra: mọi ảnh có `alt` phù hợp (trang trí thì `alt=""`); mọi nút/biểu tượng có tên truy cập; không dùng màu làm tín hiệu duy nhất (vé trạng thái, hết hàng, lỗi đều có chữ/icon); vùng bấm ≥ 44px trên mobile; phóng 200% không vỡ; `prefers-reduced-motion` được tôn trọng; `lang="vi"`.
- [ ] Đề xuất commit: `fix(a11y): findings from audit`

## Task FE-14: Kiểm tra liên kết, build, responsive, dọn dẹp

- [ ] Viết `scripts/check-links.mjs`: duyệt từ `/vn` trên server dev, thu mọi `href` nội bộ (cả mobile nav mở), yêu cầu từng URL, **báo lỗi nếu trả ≥ 400**. Chạy sạch. (Tiêu chí "không broken link" của issue.)
- [ ] `yarn build`, `yarn lint`, `npx tsc --noEmit`, `yarn test` đều sạch; chạy `yarn start` sau build và mở các trang chính, không lỗi console.
- [ ] Duyệt từng màn ở **1440 và 390** so với `preview_png` (bố cục) và ghi chênh lệch cố ý vào bảng bên dưới.
- [ ] Xóa alias Montra tạm (FE-1), `public/montra/` (nếu hết dùng), trang `_kit`, mọi chữ "SmartPantry" (`grep -ri smartpantry src`), lớp `text-ui-*` còn sót ở trang đã làm lại.
- [ ] Soát chữ tiếng Anh còn trên giao diện (`grep -rniE "add to cart|checkout|sign in|shipping|voucher" src --include=*.tsx`), loại phần là mã, sửa phần là nhãn.
- [ ] Cập nhật `README.md` (chế độ mock, cách tắt khi có backend, cách chạy `check-links`) và `docs/07-ui-design.md` gốc (palette mới, v2 + xanh v1 là bản hiện hành).
- [ ] Đề xuất commit: `chore: remove leftovers, link check, readme`

### Khác thiết kế / tồn đọng

| Màn | Khác gì | Lý do |
| :--- | :--- | :--- |
| 02 PLP | Bỏ lọc khoảng giá, nguồn gốc, đơn vị; sắp xếp là `<select>` thay cho nút phân đoạn; 9 món/trang ở cả hai cỡ, điện thoại dùng số trang thay "Xem thêm" | Mục 1.1 (chỉ 2 bộ lọc); `<select>` dễ dùng bằng bàn phím và trên điện thoại |
| 02 PLP | Bỏ khối "Bếp AI" ở thanh bên, bỏ "cập nhật 06:00" | Không chữ AI; không hứa điều chưa chắc |
| 03 PDP | Không có ảnh phụ, điểm sao, tim, dải "17:00–19:00 / thùng lạnh / đổi trả 24 giờ", banner "chỉ còn 3 khay trong kho Q.7" | O3, quy tắc "chỉ hiện điều chắc chắn" |
| 03 PDP | Cách sơ chế chỉ là lựa chọn trên giao diện, chưa lưu vào giỏ | Giỏ giả chưa có trường này |
| 04 Giỏ | Bỏ "Chọn tất cả/Xóa đã chọn", "Báo khi có hàng", dải miễn phí giao 300.000đ, "Kho chỉ được trừ khi bấm Đặt hàng" | FE-8, O3, O4; giữ hàng nguyên tử chưa có |
| 05 Thanh toán | Chỉ VNPAY; bỏ COD, MoMo, "Sandbox", "Thùng giữ lạnh", phụ phí cao điểm và nhãn "Miễn phí" theo khung giờ | Mục 1.1; phí giao cố định 15.000đ cho mọi khung |
| 06 Thành công | Thêm banner "Đây là đơn mẫu"; phiếu luôn là đơn mẫu C4F-261007-0142, không lấy từ giỏ | Chưa có đơn thật |
| 07 Đơn hàng | Không có bộ lọc trạng thái; "Mua lại" mở hộp thoại giữ chỗ | Đơn giả chỉ có ảnh minh họa, không có danh sách món |
| 08 Theo dõi | Không bản đồ; "Dự kiến tới lúc" là giữ chỗ; tài xế chỉ có ở đơn mẫu đang giao | Mục 1.1, 1.5 |
| 09 Đăng nhập | Không đăng ký, không Google; gửi form mở hộp thoại giữ chỗ; nút tài khoản dùng thử chỉ ở dev | O5 |

## 3. Cách chia đôi công việc khi sync dở

- **Đợt 1 (nền + khung):** FE-0 … FE-4. **Đừng bỏ qua** dù chỉ làm nửa chừng, mọi trang sau dựa vào token, thành phần, chế độ mock.
- **Đợt 2 (trang mua sắm):** FE-5 … FE-9.
- **Đợt 3 (tài khoản, giữ chỗ, hoàn thiện):** FE-10 … FE-14.
- Khi dừng: ghi hash commit vào bảng mục 0 và điều dở dang vào nhật ký.

## 4. Giai đoạn sau (ngoài issue #11)

Khi nhóm đấu dữ liệu thật: làm các task BE trong file backend, rồi đặt `NEXT_PUBLIC_UI_MOCK=false`, viết nốt `fromMedusa` (FE-0), thay các khối giữ chỗ bằng tính năng thật theo bảng:

| Giữ chỗ hiện tại | Thay bằng khi có | Task BE |
| :--- | :--- | :--- |
| Có thể bạn cần mua lại | `GET /store/predictive/reorder-basket` | BE-9 (bản tạm), module Predictive |
| Trợ lý Bếp, Công thức | Trang chat/thực đơn/công thức theo `10_*`, `11_*` | BE-10, repo AI |
| Thẻ dự kiến tới / thông báo | `order.metadata.delivery` | BE-6, BE-7 |
| Ví mã giảm giá | Danh sách mã của khách | chưa có task, cần thiết kế |
| Giỏ, sản phẩm, đơn giả | Medusa thật | BE-1 … BE-5, BE-8 |

**Nhật ký bàn giao** (thêm dòng mới ở trên cùng):

| Ngày | Người | Đã xong | Dở dang / lưu ý |
| :--- | :--- | :--- | :--- |
| 2026-11-03 | Claude | Đợt 1 đấu BE thật (nhánh `feature/medusa-backend-integration`, `NEXT_PUBLIC_UI_MOCK=false`): danh sách `/store` và `/categories/*` lọc, sắp xếp, đếm, phân trang bằng `POST /store/search` (`063a840`); trang chủ lấy "Ưu đãi hôm nay" từ món đang giảm giá và ẩn khối mẫu (`cb391a5`); gợi ý mua kèm ở PDP đọc theo handle (`3d33f5a`). Đối chiếu với BE trên catalog v2 (2.126 món): tổng, 11 danh mục, còn hàng, giảm giá, 3 kiểu sắp xếp, tìm không dấu, trang 3, trang cuối đều khớp. | **Chưa đấu:** giỏ hàng (vẫn là giỏ giả, `layout.tsx` nạp 100 món đầu nên chỉ thêm được các món đó), khung giờ giao, thanh toán VNPAY, mã giảm giá, đơn hàng/theo dõi đơn, huỷ đơn, đăng nhập thật, mua lại (API-3). **Cần quyết định:** lưới danh mục trang chủ và thanh điều hướng cố định 8 mục, thiếu 3 danh mục mới (Mì & Đồ ăn liền, Bánh kẹo & Ăn vặt, Đông lạnh & Chế biến sẵn, 850 món) vì chưa có minh họa và lưới 8 cột. Catalog thật không có `art`, `origin`, `companions`, ảnh sản phẩm (BE-2b). `@medusajs/js-sdk` FE là 2.12.3, BE là 2.21.1, chưa pin cùng phiên bản. Key publishable đổi mỗi khi tạo lại DB. |
| 2026-10-20 | Claude | Sửa lỗi theo "Kiểm thư UI": (1) bỏ nút đen "Danh mục" ở hàng danh mục desktop; (2) phân trang `/store` thiếu dấu cách ở `min-w-[40px]items-center` làm nút trước/sau lệch; (3) nhãn "N món" ở trang danh mục giờ đếm theo danh mục, không phải cả catalog; (4) **lỗi nặng PDP**: `.touch-target::after` là `absolute` nhưng tab, ô quy cách, nút đóng toast thiếu `relative`, nên vùng bấm phủ cả trang (bấm đâu cũng ra tab "Dinh dưỡng", không bấm được nút nào); thêm `relative`; (5) ô "Áp dụng" mã giảm giá ở giỏ tràn khỏi thẻ: thêm `min-w-0`/`shrink-0`, nút căn ngang với ô nhập khi có lỗi. `tsc` 0 lỗi. | Chưa chạy lại được `yarn lint` (lỗi tải rule `no-html-link-for-pages`, không do thay đổi này) và chưa xem lại bằng trình duyệt. |
| 2026-10-20 | Claude | Cài deps, `eslint` nâng 8.10 → 8.57.1 nên `yarn lint` sạch; `tsc` 0 lỗi, 76 test, `yarn build`, `check-links` 44 URL sạch. Sửa: `id` ô tìm kiếm trùng (`useId`), `h1` Trợ lý Bếp, Stepper giữ focus (`aria-disabled`), nav mobile trả focus, tương phản PriceTag, "Thêm cả N món" khớp danh sách, `label-content-name-mismatch` ô khung giờ, thứ tự heading ở `/store`; Việt hóa form Hồ sơ/Địa chỉ/giỏ trống; skeleton v2 + `loading.tsx` (store, PDP, giỏ, tài khoản); `/collections/*` trả 404 ở chế độ mock; xóa alias Montra khỏi Tailwind. Lighthouse Accessibility 100 trên `/vn`, `/store`, PDP, `/cart`, `/checkout`, `/account/orders`, `/tro-ly-bep`, `/account/profile`, `/account/addresses`. | Chưa làm: thử NVDA; PDP lạ trả HTTP 200 (có `noindex`, nội dung 404) vì `loading.tsx` bắt đầu stream trước `notFound()`. Đã xóa 39 file Starter không còn import (commit 9df4324). |
| 2026-10-19 | Claude | FE-6, 7, 8, 9, 10, 12, 14 (chưa commit). Giỏ giả + toast ở `app/[countryCode]/layout.tsx`; bỏ Stripe, luồng transfer đơn, module checkout/order cũ; `tsc` 0 lỗi (trước 18), 76 test qua, `yarn build` qua, `check-links` 44 URL sạch. | Chưa làm: FE-13 (Lighthouse, NVDA); skeleton theo thiết kế; nối `fromMedusa`/giỏ thật; trang `/collections/*` vẫn là code Starter; vài câu tiếng Anh trong form Hồ sơ/Địa chỉ của Starter; `yarn lint` hỏng sẵn (`@next/next/no-html-link-for-pages`). |
| 2026-10-18 | Claude (theo yêu cầu Hưng) | FE-0 … FE-5 + trang giữ chỗ `/tro-ly-bep` (FE-11). Đã review toàn nhánh, sửa 5 lỗi Important (5521dac). | Chưa làm: FE-6 trở đi. Tồn đọng nhỏ từ review: trùng `id="header-search"` giữa bản desktop/điện thoại; `/tro-ly-bep` thiếu h1; Stepper mất focus khi chạm giới hạn; nav điện thoại mất focus sau khi chuyển trang; `/store?q=` chưa lọc và danh mục rỗng chưa có trạng thái trống (FE-6/FE-12); 500 ở handle sản phẩm lạ và `/collections/*` (code Starter); PriceTag sale+unit tương phản 2,96:1; `yarn lint` hỏng sẵn do lệch phiên bản ESLint (FE-13); nút "Thêm cả 5 món" trên điện thoại chỉ hiện 3 món. Bản ghi chi tiết: `.superpowers/sdd/…/progress.md` (không commit). |
| 2026-10-18 | | Chưa bắt đầu, mới có kế hoạch | |

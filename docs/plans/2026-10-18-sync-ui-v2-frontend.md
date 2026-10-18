# Sync giao diện v2 (xương) + palette v1 (xanh lá): phần Frontend

> **Cho người làm tiếp:** làm lần lượt từng task, tick `- [ ]` khi xong, ghi commit hash vào bảng mục 0. Mỗi task đủ độc lập để merge riêng, nên có thể dừng giữa chừng. Đọc kèm bản BE: `grocery-store-backend/docs/plans/2026-10-18-sync-ui-v2-backend.md`. **Các mục 2, 3, 4 là bản sao của file BE; BE là nơi sửa trước, rồi chép sang đây.**
>
> Storefront là Medusa Next.js Starter (Next 15, Tailwind 3, React 19, `@medusajs/js-sdk`). **Đừng đoán API Medusa từ trí nhớ**, tra docs (MCP `medusa` hoặc context7) trước mỗi task đụng SDK. Lệnh: `yarn dev` (cổng 8000), `yarn build`, `yarn lint`, `npx tsc --noEmit`.

**Mục tiêu:** storefront có khung xương (bố cục, thành phần, luồng) của thiết kế v2 nhưng dùng bộ màu xanh lá của v1.
**Nguồn thiết kế:** `Com4Fud_UI_SVG/v2/` (README, ảnh `preview_png/`, mã sinh SVG ở `v2/_source/src/*.js`). Ảnh PNG v2 vẽ bằng **màu đỏ-xanh cũ**: chỉ dùng để xem bố cục, màu lấy từ mục 1.2 dưới đây.
**Nhánh:** `feature/sync-figma-ui`.

## 0. Bảng trạng thái

| Task | Nội dung | Ưu tiên | Cần BE | Trạng thái |
| :--- | :--- | :---: | :--- | :--- |
| FE-0 | Chuẩn bị: pin phiên bản, env, kiểu dữ liệu, test cho hàm thuần | P0 | | [ ] |
| FE-1 | Token màu, font, Tailwind, ghi đè biến `@medusajs/ui` | P0 | | [ ] |
| FE-2 | Minh họa nông sản (`public/art`) + `ProductArt` | P0 | BE-2 (`metadata.art`) | [ ] |
| FE-3 | Thành phần dùng chung (nút, nhãn, tem, vé trạng thái, ...) | P0 | | [ ] |
| FE-4 | Khung trang: thanh tiện ích, header, footer, điều hướng điện thoại | P0 | | [ ] |
| FE-5 | Trang chủ | P0 | BE-2, BE-3 | [ ] |
| FE-6 | Danh sách sản phẩm + bộ lọc | P0 | BE-3 | [ ] |
| FE-7 | Chi tiết sản phẩm | P0 | BE-2 | [ ] |
| FE-8 | Giỏ hàng (+ "Có thể bạn cần mua lại") | P1 | BE-2, BE-9 | [ ] |
| FE-9 | Thanh toán (chỉ VNPAY, khung giờ) | P1 | BE-4, BE-5 | [ ] |
| FE-10 | Đặt hàng thành công | P1 | BE-6 | [ ] |
| FE-11 | Đơn hàng của tôi + Theo dõi đơn | P1 | BE-6, BE-7, BE-8 | [ ] |
| FE-12 | Đăng nhập / Đăng ký | P1 | BE-2 | [ ] |
| FE-13 | Trạng thái giao diện (trống, tải, lỗi, 404, mất mạng) | P2 | | [ ] |
| FE-14 | Trợ lý Bếp + Công thức vào giỏ (dùng fixture) | P2 | BE-10 | [ ] |
| FE-15 | Dọn dẹp, kiểm tra chất lượng, cập nhật README | P3 | tất cả | [ ] |

## 1. Bối cảnh và những gì đã chốt

### 1.1 Quyết định (2026-10-18, nhóm)

Lấy **bố cục và thành phần của v2**, **giữ bảng màu xanh lá của v1** (bộ đỏ-xanh của v2 bị bỏ vì xấu). Mọi quy tắc còn lại của v2 giữ nguyên (tóm tắt, nguồn ở `docs/07-ui-design.md` gốc):

- Tiếng Việt thuần trên giao diện. Không chữ "AI", shipper, voucher, Sandbox, COD, MoMo.
- Chỉ hiện điều khách cần và chắc chắn: không xác suất, chu kỳ, "còn N ngày", độ khớp, nguồn dữ liệu, tên mô hình.
- Trang bán hàng không viết kiểu trang giới thiệu (không hàng cam kết, không dãy số marketing).
- Thanh toán chỉ VNPAY. Không bản đồ theo dõi trực tiếp.
- Điện thoại: một nút nổi, bấm mới bung thanh 5 mục (Trang chủ, Danh mục, Trợ lý Bếp, Giỏ hàng, Tài khoản). Trang chủ để **Ưu đãi hôm nay trước Danh mục**.
- Bộ lọc sản phẩm chỉ có **Chỉ hiện còn hàng** và **Đang giảm giá**, cộng danh mục và nút sắp xếp.
- Không có trang Giỏ đoán trước riêng: nằm trong Giỏ hàng, tên **"Có thể bạn cần mua lại"**, chỉ là danh sách món kèm giá.
- Phong cách thành phần: nhãn viền đậm, bóng đặc lệch 2px; trạng thái đơn in trên **vé có khía**; tem giảm giá dán nghiêng; thông báo viền than, bóng màu theo loại.

### 1.2 Bảng màu: v2 (vai trò) → v1 (giá trị)

Đặt tên Tailwind theo **vai trò**, không theo màu, vì tên v2 (`red` = hành động mua) không còn đúng khi hành động mua đổi sang xanh.

| Token mới | Giá trị | Thay cho (v2) | Dùng cho |
| :--- | :--- | :--- | :--- |
| `brand` | `#1F6B3A` | `red` | Nút mua, mục đang chọn, giá thường, liên kết hành động |
| `brand-deep` | `#0F3D2E` | `redDeep` + nền tối | Hover/nhấn, chân trang, thanh Admin, nền banner công thức, nút nổi điện thoại |
| `brand-mid` | `#16503A` | (mới) | Nền tối cấp hai |
| `brand-vivid` | `#3C9A5B` | `leafV` | Dấu "còn hàng", chấm trạng thái, tiến trình |
| `brand-bg` | `#DCEFD9` | `redBg` (mục chọn) + `leafBg` | Nền mục đang chọn, nền gợi ý |
| `accent` | `#C8F169` | `leaf` (vai trò mua lại, Trợ lý Bếp) | Chỉ cho **Mua lại** và **Trợ lý Bếp**; chữ trên nó luôn là `accent-ink` hoặc `ink` |
| `accent-soft` | `#EEFAD0` | `leafBg` (khối gợi ý) | Nền khối "Có thể bạn cần mua lại" |
| `accent-ink` | `#3D5A00` | `leafDeep` (chữ) | Chữ/icon trên nền accent |
| `sale` | `#C8361F` | `red` (vai trò giá giảm, lỗi) | Giá giảm, hết hàng, lỗi, nút xóa |
| `sale-vivid` | `#E8492B` | | Điểm nhấn nhỏ trên nền tối |
| `sale-bg` | `#FDE4DE` | `redBg` (nền lỗi) | Nền cảnh báo lỗi, dòng hết hàng |
| `sale-deep` | `#9E2815` | `redDeep` | Chữ lỗi trên nền `sale-bg`. **Giá trị mới, chưa có ở v1, cần kiểm tra tương phản** |
| `sale-line` | `#F3BFB3` | `redLine` | Viền cảnh báo. **Mới, cần kiểm tra** |
| `warn` | `#E9A23B` | `sun` | Tem giảm giá (chữ `ink`, viền `ink`), "sắp hết hàng", "chờ xác nhận" |
| `warn-bg` / `warn-ink` | `#FCEFD6` / `#7A4B00` | `sunBg` / `sunInk` | |
| `ink` / `ink-2` / `ink-3` | `#10241B` / `#4E5D55` / `#66736B` | `ink*` | Chữ |
| `bg` / `bg-2` | `#F2F4EC` / `#E8ECDF` | `bg` / `bg2` | Nền trang / nền phụ |
| `surface` | `#FFFFFF` | | Thẻ |
| `line` / `line-2` | `#DDE3D6` / `#C3CCBD` | | Viền thẻ / viền ô nhập |
| `on-dark` / `dark-line` | `#B5C7BA` / `#2C5A45` | `onDark2` / `darkLine` | Chữ phụ và viền trên nền tối |
| `sky`, `plum` | `#2563A8` / `#6B3FA0` (bg `#DFEAF7` / `#EDE4F7`) | giữ | "Đã xác nhận", "Đang chuẩn bị" |

Quy tắc dùng (từ README v1/v2): nền kem-xanh chiếm đa số, `brand` ≤ ~10% diện tích một màn, `accent` rất ít, **không đặt hai khối lớn `brand` và `sale` cạnh nhau**. Đĩa nền sản phẩm (`tint`) giữ nguyên bảng 8 màu trong `shared.js` (`T`).

Vai trò các thành phần khi đổi màu:

| Thành phần v2 | Màu cũ | Màu mới |
| :--- | :--- | :--- |
| Nút nổi điện thoại (nền than, bóng đỏ) | `ink` + bóng `red` | `brand-deep` + bóng `accent` |
| Băng rôn ưu đãi chính (nền đỏ, vòng tròn đỏ đậm) | `red` / `redDeep` | `brand` / `brand-deep`, nút "Mua ngay" màu `warn` |
| Tem giảm giá `−12%` | vàng nghệ | `warn`, chữ và viền `ink` |
| Vé trạng thái | Chờ xác nhận `sun`; Đã xác nhận `sky`; Đang chuẩn bị `plum`; Đang giao `leafSolid`; Đã giao `leaf`; Đã hủy `red` | Chờ xác nhận `warn`; Đã xác nhận `sky`; Đang chuẩn bị `plum`; Đang giao `brand` (đặc); Đã giao `brand-bg`/`brand-deep`; Đã hủy `sale` |
| Nhãn "Mua lại", chip Trợ lý Bếp | `leaf` | `accent` |
| "Còn hàng", dấu tích thành công | `leaf` | `brand-vivid` / `brand-bg` |
| Hết hàng, lỗi, xóa | `red` | `sale` |

### 1.3 Hiện trạng frontend (2026-10-18)

- Đã áp giao diện **Montra cam** cho header, hero, thẻ sản phẩm, giỏ, footer (các file: `modules/layout/templates/{nav,footer}`, `modules/home/components/hero`, `modules/products/components/product-preview`, `modules/layout/components/cart-dropdown`). Tailwind có bảng Montra (`headingColor`, `textColor`, `cardOverlay`, ...), ảnh ở `public/montra/`. Thương hiệu hiện hiển thị là "SmartPantry" (phải là **Com4Fud**).
- **Phần còn lại là Starter nguyên bản** dùng `@medusajs/ui` (74 file) và các lớp `text-ui-*` (53 file), nên cần ghi đè biến ở FE-1 để các trang chưa làm lại không bị lệch tông.
- Route mặc định theo `NEXT_PUBLIC_DEFAULT_REGION` (hiện `us`); catalog backend là áo quần châu Âu. Sau BE-1/BE-2 đổi thành `vn`.
- Chưa có: Socket.io, TanStack Query, Trợ lý Bếp, "Có thể bạn cần mua lại". Chúng **ngoài phạm vi sync** (Socket.io, TanStack), hoặc chạy bằng fixture (Trợ lý Bếp).
- Font hiện chỉ có Be Vietnam Pro, nạp bằng thẻ `<link>` trong `src/app/layout.tsx` (comment ở đó giải thích vì sao không dùng `next/font/google`; giữ cách này).

### 1.4 Ngoài phạm vi (không làm trong đợt sync này)

Realtime tồn kho (Socket.io), gọi thật `assistant/chat` và `recipes/semantic-search`, VNPAY thật, tìm kiếm bằng AI, điểm đánh giá, yêu thích, "Báo khi có hàng", bản đồ.

## 2. Quy ước chung cho dữ liệu (cả FE và BE phải khớp)

- **Tiền:** Medusa v2 lưu số tiền theo đơn vị chính, `vnd` không chia 100. FE đã có `noDivisionCurrencies` chứa `vnd`.
- **Danh mục (8, handle cố định):** `rau-cu` Rau củ, `trai-cay` Trái cây, `thit` Thịt, `hai-san` Hải sản, `trung-sua` Trứng & Sữa, `gao-do-kho` Gạo & Đồ khô, `gia-vi` Gia vị, `do-uong` Đồ uống.
- **Metadata sản phẩm:** `art` (khóa minh họa, vd `"fishFillet"`), `tint` (`red|orange|green|cream|blue|yellow|brown|pink`, màu đĩa nền), `origin` (vd `"Đồng Tháp"`, tùy chọn), `stock_unit` (`"khay"`, dùng cho "Còn 3 khay"), `low_stock` (số, ngưỡng hiện "Còn N", mặc định 10), `prep_options` (mảng chuỗi, tùy chọn), `companions` (mảng handle, "Thường mua kèm").
- **Biến thể:** `title` là quy cách hiển thị ("Khay 500g"), `weight` tính bằng gam (FE tính "170.000đ/kg" từ đây), có một option tên `Quy cách`.
- **Dòng giỏ:** `metadata.prep` (chuỗi, một trong `prep_options`), `metadata.price_at_add` (số, giá lúc thêm, để hiện "giá vừa đổi từ 89.000đ lên 92.000đ").
- **Giỏ:** `metadata.delivery_note` (≤200 ký tự), `metadata.slot` (id khung giờ).
- **Đơn:** `metadata.stage`, `metadata.stage_log`, `metadata.delivery` (API-5, API-7).

## 3. Hợp đồng API (nguồn sự thật cho cả hai bên)

Mọi route `/store/*` cần `x-publishable-api-key`; route của khách cần thêm JWT. **Nếu đổi hình dạng response, sửa mục này ở cả hai file kế hoạch.**

| ID | Route | Trạng thái | Response / ghi chú |
| :--- | :--- | :--- | :--- |
| API-1 | `GET /store/products` | Medusa | Thêm `fields=+metadata,+variants.inventory_quantity,+variants.weight`. FE tính giá gốc/giá bán từ `calculated_price`. |
| API-2 | `POST /store/search` | Medusa Search (cấu hình ở BE-3) | Lọc `category`, `in_stock: true`, `on_sale_vnd: true`; sắp xếp. Hình dạng body chốt ở BE-3 rồi ghi lại tại đây. |
| API-3 | `GET /store/predictive/reorder-basket` | Mới (stub ở BE-9) | `{ status: "ready"\|"warming"\|"empty", items: [{ variant_id, product_id, title, unit_label, art, tint, quantity, unit_price, in_stock }], total }`. **Không** trả xác suất, chu kỳ, lý do. |
| API-3b | `POST /store/predictive/warm` | Mới (stub ở BE-9) | `202 {}`; không chờ. |
| API-4 | `GET /store/delivery-slots?cart_id=` | Mới (BE-4) | `{ slots: [{ id, label, day_label, shipping_option_id, fee, closed, note }] }`. FE chọn slot rồi thêm shipping method thường với `option_id = shipping_option_id`. |
| API-5 | `order.metadata` | Mới (BE-6) | `stage`: `PENDING\|CONFIRMED\|PREPARING\|SHIPPING\|DELIVERED\|CANCELLED`; `stage_log`: `[{ stage, at }]` (ISO). FE đọc trực tiếp, **không tự suy ra** từ trạng thái Medusa. |
| API-6 | `POST /store/orders/:id/cancel` | Mới (BE-8) | `200 { order }`; `409` nếu `stage != PENDING`. |
| API-7 | `order.metadata.delivery` | Mới (BE-7) | `{ driver_name, plate, distance_km, eta_at, started_at, notice_sent_at }`; chỉ có từ lúc `SHIPPING`. |
| API-8 | `POST /store/recipes/semantic-search`, `POST /store/assistant/chat` | Hợp đồng ở BE-10, cài đặt thật ở repo AI | Kiểu `Recipe`, `MealPlan`, `AssistantReply` ở BE-10. |
| API-9 | `GET /admin/dashboard/summary` | Mới (BE-11) | Chỉ Admin, FE không dùng. |

## 4. Câu hỏi mở (hỏi nhóm trước khi làm task liên quan)

| # | Câu hỏi | Task FE bị chặn | Mặc định nếu chưa có trả lời |
| :--- | :--- | :--- | :--- |
| O1 | Dữ liệu mẫu ghi "Phí giao 15.000đ" cho đơn 395.000đ, nhưng trang chủ có băng "Miễn phí giao từ 300.000đ". Mâu thuẫn. | FE-5, FE-9 | Bỏ băng "miễn phí từ 300.000đ" ở trang chủ, giữ phí theo khung giờ. |
| O2 | Thông báo đẩy thật có làm không? Thiết kế chỉ có mẫu. | FE-11 | Không. Hiện băng thông báo trên trang theo dõi đơn khi `notice_sent_at` có giá trị. |
| O3 | Thiết kế có điểm đánh giá, nút tim, "Báo khi có hàng". | FE-3, FE-6, FE-7, FE-8 | Không vẽ ba thứ này (không có dữ liệu). |
| O4 | Trợ lý Bếp có thẻ "Nhà bạn đang có" nhưng MVP Recipe RAG đã cắt tính năng loại trừ đồ sẵn có. | FE-14 | Ẩn thẻ này. |
| O5 | Khoảng cách/ước giờ tính bằng gì khi chưa có geocoding? | FE-11 | FE chỉ hiển thị giá trị BE trả về. |
| O6 | `POST /store/search` cần provider nào? | FE-6 | Nếu BE-3 chọn route dự phòng `GET /store/catalog`, FE-6 đổi sang route đó. |
| O7 (chỉ FE) | Logo/mark thương hiệu Com4Fud: dùng `logoMark` trong `v2/_source/src/ui.js` (hàm `logoMark`, `logo`) hay file ảnh có sẵn? | FE-4 | Vẽ lại `logoMark` thành SVG React, nền `brand`. |
| O8 (chỉ FE) | Ảnh sản phẩm thật chưa có. Dùng minh họa vector (`art`) làm ảnh chính thức? | FE-2 | Có. `ProductArt` ưu tiên `thumbnail` nếu có, ngược lại vẽ `art` trên đĩa `tint`. |

---

## Task FE-0: Chuẩn bị

**Files:**
- Modify: `package.json` (pin `@medusajs/js-sdk`, `@medusajs/types`, `@medusajs/ui`, `@medusajs/icons`, `@medusajs/ui-preset` đang là `latest`; đổi `@medusajs/js-sdk` và `@medusajs/types` thành `2.21.1` cho khớp backend, các gói UI chốt theo phiên bản `yarn.lock` đang cài)
- Modify: `.env.template` (không đụng `.env.local`): `NEXT_PUBLIC_DEFAULT_REGION=vn`
- Create: `src/types/com4fud.ts` (kiểu `OrderStage`, `Delivery`, `DeliverySlot`, `ReorderBasket`, `Recipe`, `MealPlan`, `AssistantReply`, sao chép từ BE-6/7/9/10)
- Create: `src/lib/util/stage.ts` (nhãn tiếng Việt và thứ tự cho `OrderStage`)
- Create: `src/lib/util/price.ts` (hàm thuần: `salePercent(original, current): number | null`, `pricePerKg(price: number, weightGrams?: number): number | null`, `priceChanged(item): { before, after } | null`)

**Xong khi:** `yarn install && yarn build` qua; các hàm thuần có test.

- [ ] Pin phiên bản (rủi ro TR-05 trong `AGENTS.md` gốc), chạy lại `yarn install`, đảm bảo `yarn.lock` đổi đúng.
- [ ] Thêm `vitest` (devDependency) và script `"test": "vitest run"`; chỉ test hàm thuần ở `src/lib/util/*.test.ts`. Starter chưa có bộ test; đây là mức tối thiểu.
- [ ] Test (viết trước): `salePercent(105000, 92000)` = `12`; `salePercent(92000, 92000)` = `null`; `pricePerKg(85000, 500)` = `170000`; `pricePerKg(85000, undefined)` = `null`; `priceChanged({ unit_price: 92000, metadata: { price_at_add: 89000 } })` = `{ before: 89000, after: 92000 }`; không có `price_at_add` thì `null`.
- [ ] Cài đặt ba hàm cho test qua.
- [ ] Đề xuất commit: `chore: pin medusa deps, add vitest and shared price/stage utils`

## Task FE-1: Token, font, Tailwind

**Files:**
- Modify: `tailwind.config.js` (bỏ khối màu Montra; thêm token mục 1.2; `boxShadow.sticker` `2px 2px 0 0` và `toast` `4px 4px 0 0` dùng `var(--tw-shadow-color)`; `borderRadius`: `tag 6px`, `chip 7px`, `btn 12px`, `card 18px`, `banner 24px`; `fontFamily`: `display` Bricolage Grotesque, `sans` Be Vietnam Pro, `mono` JetBrains Mono)
- Modify: `src/app/layout.tsx` (thêm hai font vào thẻ `<link>` Google Fonts hiện có)
- Modify: `src/styles/globals.css` (ghi đè biến của `@medusajs/ui-preset` ở `:root` cho tông xanh; lớp tiện ích `.ticket` cho vé có khía)

**Xong khi:** `yarn build` qua; mở `/vn/account` (trang Starter chưa sửa) thấy nền kem-xanh, nút/liên kết màu `brand`, không còn tông cam hay tím của Medusa UI.

- [ ] Liệt kê biến CSS thật mà `@medusajs/ui-preset` đang dùng cho nút chính, nền, viền (đọc `node_modules/@medusajs/ui-preset`), rồi ghi đè đúng các biến đó. **Không đoán tên biến.**
- [ ] Giữ `screens` hiện có (`small: 1024px`, ...) để khỏi vỡ 18 file đang dùng.
- [ ] Giữ alias tạm cho lớp Montra đang được dùng (`headingColor`, `textColor`, `cardOverlay`, `containerbg`, `lightGray`, `cartNumBg`) trỏ sang token mới, kèm comment `// TODO FE-15: xóa`. Cách này để các task sau không phải sửa cả loạt trong một lần.
- [ ] Kiểm tra tương phản bằng công cụ (WCAG AA 4.5:1 cho chữ thường): trắng trên `brand`; `ink` trên `accent`; `sale-deep` trên `sale-bg`; `warn-ink` trên `warn-bg`; `ink-2` trên `bg`. Sửa giá trị mới (`sale-deep`, `sale-line`) nếu không đạt và cập nhật bảng 1.2.
- [ ] Đề xuất commit: `feat(ui): green palette tokens, fonts and medusa ui overrides`

## Task FE-2: Minh họa nông sản

**Files:**
- Create: `public/art/<key>.svg` × 23 (xuất từ `Com4Fud_UI_SVG/v2/_source/src/ui.js`, đối tượng `ART`, dòng 158)
- Create: `scripts/export-art.mjs` (chạy một lần bằng Node; dùng chung `ART` qua `require`)
- Create: `src/modules/products/components/product-art/index.tsx`
- Modify: `src/modules/products/components/thumbnail/index.tsx`

**Interfaces:** Produces `<ProductArt product: StoreProduct; size?: number; dots?: boolean />`: nếu `product.thumbnail` có thì `next/image`, ngược lại vẽ `/art/${metadata.art}.svg` trên đĩa màu `tint` có họa tiết chấm; không có `art` thì `PlaceholderImage`.

**Xong khi:** thẻ sản phẩm của cá lóc, cà chua, trứng hiện minh họa đúng trên đĩa đúng màu; thay `thumbnail` bằng ảnh thật thì ảnh thật được dùng, không sửa code.

- [ ] Script xuất: mỗi khóa `ART[key]()` trả chuỗi nội dung SVG trong hộp 100×100; bọc thành `<svg viewBox="0 0 100 100">...</svg>`. Kiểm tra bằng cách mở vài file.
- [ ] Bảng `tint` → `[nền, chấm]` lấy từ `T` trong `shared.js`, đặt ở `src/lib/util/tint.ts`.
- [ ] Đề xuất commit: `feat(ui): product vector art and ProductArt component`

## Task FE-3: Thành phần dùng chung

**Files (tạo mới trong `src/modules/common/components/`):** `button`, `chip`, `sale-sticker`, `order-status-chip` (vé có khía), `stepper`, `toggle`, `filter-chip`, `live-stock`, `price-tag`, `banner`, `toast`, `field`.

**Xong khi:** trang tạm `/vn/_kit` (xóa ở FE-15) hiển thị tất cả biến thể và trạng thái; so mắt với `v2/preview_png/00_He_Thong_Thiet_Ke.png` về hình dạng (màu theo 1.2).

- [ ] Kích thước nút theo `btn()` trong `ui.js`: cao `xs 30, sm 36, md 44, lg 52`; bo `btn` (12px) cho md/lg, 10px cho xs/sm; biến thể `primary`(brand), `secondary`(viền), `green`→ dùng `brand-deep`, `sun`→`warn`, `danger`(sale), `dangerSoft`, `ghost`, `onDark`.
- [ ] `Chip` có tông `neutral|brand|accent|sale|warn|sky|plum|dark|outline`; trừ `neutral`, có viền đậm cùng tông và bóng `sticker` lệch 2px cùng màu viền. `SaleSticker` xoay `-5deg`, nền `warn`, viền và bóng `ink`.
- [ ] `OrderStatusChip({ stage: OrderStage })`: nhãn từ `src/lib/util/stage.ts`, màu theo bảng 1.2, hình vé (khía bên trái, một lỗ tròn) bằng `clip-path`/SVG; nhận biết bằng icon và chữ, không chỉ bằng màu.
- [ ] `LiveStock({ qty, unit, low })`: ẩn khi `qty > low`; "Còn N {unit}" khi `0 < qty <= low`; "Hết hàng" khi 0.
- [ ] `Toast` và `Banner` có tông `ok|warn|err|info`; viền `ink`, bóng `toast` màu theo tông, icon dán nghiêng.
- [ ] Mỗi thành phần có thuộc tính `aria` phù hợp (nút icon có `aria-label`, toggle có `role="switch"`).
- [ ] Đề xuất commit: `feat(ui): shared components (button, chip, sticker, order ticket, ...)`

## Task FE-4: Khung trang

**Files:**
- Modify: `src/modules/layout/templates/nav/index.tsx`, `src/modules/layout/templates/footer/index.tsx`
- Create: `src/modules/layout/components/utility-bar/index.tsx`, `mobile-nav/index.tsx`, `address-pill/index.tsx`, `logo/index.tsx`
- Modify: `src/app/[countryCode]/(main)/layout.tsx`
- Delete (cuối task): `public/montra/` nếu không còn nơi dùng, `modules/layout/components/medusa-cta`

**Xong khi:** desktop 1440 và mobile 390 khớp bố cục `01_Trang_Chu_*.png` (phần đầu và cuối trang); thương hiệu là **Com4Fud**; bấm nút nổi ở mobile bung thanh 5 mục, nút X thu lại; số món trong giỏ hiện đúng.

- [ ] Header desktop theo `header()` và `utilityBar()` trong `ui.js` (dòng 419–460): thanh tiện ích tối (`brand-deep`), logo, ô tìm kiếm, địa chỉ giao (`address-pill`, lấy địa chỉ mặc định của khách; chưa đăng nhập thì "Chọn địa chỉ giao"), nút giỏ có tổng tiền.
- [ ] Footer nền `brand-deep`, **không** có COD/MoMo; chỉ VNPAY.
- [ ] Mobile: `mobile-nav` là client component; trạng thái mở/đóng giữ trong state; thanh 5 mục cao 64, mục đang chọn nền `brand`, nút X thu gọn. Có `aria-expanded` và đóng bằng Esc.
- [ ] Giải quyết O7 (logo) trước.
- [ ] Đề xuất commit: `feat(layout): v2 header, footer and mobile floating nav`

## Task FE-5: Trang chủ

**Files:** `src/app/[countryCode]/(main)/page.tsx`; thay `modules/home/components/hero` bằng `promo-banner`, `category-grid`, `deals`, `buy-again`, `recipe-banner`.

**Xong khi:** thứ tự mobile là băng rôn, Ưu đãi hôm nay, Danh mục, Có thể bạn cần mua lại, gợi ý món; desktop có thêm băng phụ hai bên; khớp `01_Trang_Chu_*.png`.

- [ ] Băng rôn chính và băng phụ: nội dung cố định trong code (một hằng `PROMOS`), nhưng sản phẩm trong băng chính lấy từ sản phẩm giảm giá cao nhất trả về từ API-2 (`on_sale_vnd`).
- [ ] Ưu đãi hôm nay: 4 sản phẩm đang giảm giá. Danh mục: 8 thẻ theo handle ở mục 2, đĩa nền theo `CAT_ART` trong `pages_a.js`.
- [ ] "Có thể bạn cần mua lại": gọi API-3; `status` khác `ready` hoặc chưa đăng nhập thì **ẩn cả khối**, không hiện khối rỗng. Desktop có nút "Thêm tất cả · 343.000đ", mobile có "Thêm cả 5 món"; làm cả hai (dùng chung logic thêm của FE-8).
- [ ] Banner công thức "Tối nay nấu gì?" dùng fixture từ FE-14 (hoặc ẩn nếu FE-14 chưa xong).
- [ ] O1: bỏ dải "Miễn phí giao từ 300.000đ" nếu nhóm chưa trả lời khác.
- [ ] Gọi `POST /store/predictive/warm` (fire-and-forget) ngay sau khi đăng nhập thành công (nằm ở FE-12).
- [ ] Đề xuất commit: `feat(home): v2 home page`

## Task FE-6: Danh sách sản phẩm

**Files:** `src/app/[countryCode]/(main)/store/page.tsx`, `categories/[...category]/page.tsx`; `modules/store/templates/*`, `modules/store/components/refinement-list/*`, `modules/products/components/product-preview/*`.

**Xong khi:** lọc `Chỉ hiện còn hàng`, `Đang giảm giá`, danh mục và sắp xếp hoạt động qua query string (bấm lại giữ trạng thái, chia sẻ được URL); thẻ sản phẩm khớp `productCard()` (tem `−N%`, "Hết hàng" mờ + nút chuông bị bỏ theo O3, bước chọn số lượng khi đã có trong giỏ).

- [ ] Desktop: thanh bên Danh mục (kèm số lượng) + thẻ "Lọc nhanh" với hai công tắc; mobile: hàng chip danh mục cuộn ngang + hai chip lọc + nút sắp xếp.
- [ ] Dữ liệu từ API-2 (hoặc `GET /store/catalog` nếu BE-3 đổi). `searchParams` là nguồn trạng thái, không dùng state cục bộ.
- [ ] Phân trang số trang (1 2 3 … N) ở desktop, "Xem thêm" ở mobile.
- [ ] Sắp xếp: Phổ biến (mặc định), Giá tăng, Giá giảm, Mới nhất. Bỏ lọc khoảng giá, nguồn gốc, đơn vị bán.
- [ ] Skeleton khi tải (dùng thành phần của FE-13 nếu đã có, nếu chưa dùng skeleton Starter).
- [ ] Đề xuất commit: `feat(store): v2 product list with in-stock and on-sale filters`

## Task FE-7: Chi tiết sản phẩm

**Files:** `src/app/[countryCode]/(main)/products/[handle]/page.tsx`; `modules/products/templates/*`, `components/product-actions/*`, `image-gallery`, `related-products`.

**Xong khi:** khớp `03_Chi_Tiet_San_Pham_*.png`: chọn quy cách đổi giá và tồn kho; quy cách hết hàng bị mờ, không bấm được; chọn cách sơ chế (nếu có `prep_options`); nút "Thêm vào giỏ · 85.000đ" ghi `metadata.prep` và `metadata.price_at_add` vào dòng giỏ; "Thường mua kèm" lấy từ `metadata.companions`; khối "Món ngon với {sản phẩm}" dùng fixture FE-14.

- [ ] Quy cách = option `Quy cách` của Medusa; thay `option-select.tsx` bằng ô chọn kiểu `specChoice` (nhãn + giá, viền `brand` khi chọn).
- [ ] "170.000đ/kg" dùng `pricePerKg` (FE-0); không có `weight` thì ẩn.
- [ ] Không vẽ điểm sao, tim, "Báo khi có hàng" (O3).
- [ ] Mobile: thanh hành động dưới đáy (stepper + nút thêm) thay thanh `mobile-actions.tsx` hiện có.
- [ ] `addToCart` ở `src/lib/data/cart.ts` nhận thêm `metadata` (tra SDK: tham số line item có `metadata`).
- [ ] Đề xuất commit: `feat(pdp): v2 product detail with spec picker and prep options`

## Task FE-8: Giỏ hàng

**Files:** `modules/cart/templates/{index,items,summary}.tsx`, `modules/cart/components/item`, `modules/layout/components/cart-dropdown`; tạo `modules/cart/components/buy-again`.

**Xong khi:** khớp `04_Gio_Hang_*.png`: dòng hết hàng giữa chừng (nền `sale-bg`, "Vừa hết hàng, không tính vào đơn", nút Xóa), dòng giá vừa đổi (giá cũ gạch, giá mới màu `sale`, banner cảnh báo cho cả giỏ), khối "Có thể bạn cần mua lại" với nút `+` từng món và "Thêm tất cả", mã giảm giá `TUOI20` áp được.

- [ ] Hết hàng: so `variant.inventory_quantity` với `quantity` (cần `fields` ở API-1). Dòng hết hàng không cộng vào "Tạm tính" hiển thị; chặn nút thanh toán cho đến khi khách xóa hoặc giảm.
- [ ] Giá đổi: `priceChanged()` (FE-0). Nút "Đã hiểu" ẩn banner trong phiên (`sessionStorage`, bọc `try/catch`).
- [ ] "Thêm tất cả": thêm tuần tự từng dòng bằng `addToCart`; xác minh trong docs xem SDK có route batch cho line items không, nếu có thì dùng. Hiện toast khi xong. Món `in_stock: false` bị bỏ qua và nói rõ trong toast.
- [ ] Ẩn cả khối khi `status !== "ready"`.
- [ ] Bỏ lựa chọn "Chọn tất cả / Xóa đã chọn" nếu không có hỗ trợ chọn nhiều dòng ở backend; nếu giữ, chỉ làm chọn để xóa.
- [ ] Đề xuất commit: `feat(cart): v2 cart with stock/price warnings and buy-again block`

## Task FE-9: Thanh toán

**Files:** `src/app/[countryCode]/(checkout)/checkout/page.tsx`; `modules/checkout/**`; `src/lib/constants.tsx` (`paymentInfoMap`); tạo `modules/checkout/components/delivery-slots`.

**Xong khi:** khớp `05_Thanh_Toan_*.png`: 3 phần đánh số (Địa chỉ, Thời gian giao, Thanh toán) + tóm tắt đơn bên phải; slot đã đóng bị mờ; chọn slot đổi phí và tổng; ghi chú cho tài xế lưu vào `cart.metadata.delivery_note`; chỉ **một** lựa chọn thanh toán, nhãn "Thanh toán qua VNPAY"; nút "Thanh toán qua VNPAY" hoàn tất đơn.

- [ ] `paymentInfoMap`: thêm ID provider mà BE-5 dùng (ban đầu `pp_system_default`) với tiêu đề "Thanh toán qua VNPAY" và dòng mô tả "Thẻ ATM nội địa, mã QR ngân hàng, thẻ quốc tế". Xóa mục Stripe/iDeal/Bancontact/PayPal và bỏ `stripe-wrapper`, `payment-test`, dependency `@stripe/*`.
- [ ] Slot lấy từ API-4; gọi lại khi vào trang (không cache), vì `closed` phụ thuộc giờ.
- [ ] Địa chỉ: giữ form địa chỉ của Starter nhưng bố cục thẻ chọn địa chỉ (radio) như thiết kế; chỉ quốc gia `vn`, bỏ ô chọn quốc gia.
- [ ] Thanh bước "Giỏ hàng, Thanh toán, Hoàn tất".
- [ ] Mobile: thanh dưới đáy hiện "Tổng thanh toán" + nút.
- [ ] Đề xuất commit: `feat(checkout): v2 checkout with delivery slots and VNPAY only`

## Task FE-10: Đặt hàng thành công

**Files:** `src/app/[countryCode]/(main)/order/[id]/confirmed/page.tsx`; `modules/order/templates/order-completed-template.tsx`

**Xong khi:** khớp `06_Dat_Hang_Thanh_Cong_*.png` (bản máy tính **đơn giản như mobile**): dấu tích, lời cảm ơn, khung giờ giao, phiếu đặt hàng gọn (vé có barcode) và hai nút "Tiếp tục mua sắm", "Xem đơn hàng". Không có phần "Tiếp theo" hay gợi ý.

- [ ] Bỏ `onboarding-cta`, `transfer-*`, khối hỗ trợ cũ nếu không dùng.
- [ ] Đề xuất commit: `feat(order): v2 order confirmed page`

## Task FE-11: Đơn hàng của tôi và Theo dõi đơn

**Files:** `account/@dashboard/orders/page.tsx`, `orders/details/[id]/page.tsx`, `modules/account/components/{order-card,order-overview,account-nav}`, `modules/order/templates/order-details-template.tsx`; tạo `modules/order/components/{timeline,eta-card,driver-card,notice-banner}`.

**Xong khi:** khớp `07_*` và `08_*`: danh sách có `OrderStatusChip`, nút theo trạng thái (Đang giao: "Theo dõi đơn · tới lúc 17:35"; Đã giao: "Mua lại", "Chi tiết"; Chờ xác nhận có "Hủy đơn" gọi API-6); trang theo dõi có timeline từ `stage_log`, thẻ "Dự kiến tới lúc 17:35 · còn 2,4 km", thẻ tài xế (tên, biển số), danh sách món, thanh toán VNPAY; **không có bản đồ**.

- [ ] `stage` đọc trực tiếp từ `order.metadata.stage` (API-5); thiếu thì hiện "Đang xử lý" và ghi `console.warn`, không tự suy ra.
- [ ] Thông báo (O2): khi `delivery.notice_sent_at` có giá trị, hiện `notice-banner` đầu trang theo dõi theo mẫu "Đơn hàng sắp tới!" của `etaCard` / mẫu đẩy trong `pages_c.js` (dòng 118–126). Không dùng Notification API của trình duyệt.
- [ ] "Mua lại": thêm lại các món của đơn vào giỏ (món hết hàng bị bỏ qua và báo).
- [ ] Menu tài khoản: Đơn hàng, Địa chỉ, Hồ sơ, Đăng xuất (theo `ACC_NAV` trong `pages_c.js`).
- [ ] Hủy đơn: xác nhận bằng hộp thoại trước khi gọi API-6; `409` thì hiện toast lỗi và tải lại đơn.
- [ ] Đề xuất commit: `feat(account): v2 orders list and order tracking`

## Task FE-12: Đăng nhập / Đăng ký

**Files:** `account/@login/page.tsx`; `modules/account/components/{login,register}`, `modules/account/templates/login-template.tsx`

**Xong khi:** khớp `09_Dang_Nhap_*.png`: nửa trái nền `brand-deep` với câu "Bữa cơm nhà, đi chợ một chạm.", form bên phải; tài khoản dùng thử hiện **chỉ ở môi trường dev** (`process.env.NODE_ENV !== "production"`), mật khẩu không nằm trong mã nguồn; đăng nhập xong gọi `POST /store/predictive/warm`.

- [ ] Nút "Tiếp tục với Google" **không làm** (chưa có provider); ẩn nút này thay vì để nút chết.
- [ ] Việt hóa mọi nhãn và thông báo lỗi.
- [ ] Đề xuất commit: `feat(auth): v2 login and register`

## Task FE-13: Trạng thái giao diện

**Files:** `src/modules/skeletons/*`, `src/app/not-found.tsx`, `src/app/[countryCode]/(main)/not-found.tsx`, tạo `src/lib/context/toast-context.tsx`, `src/modules/common/components/offline-banner`.

**Xong khi:** khớp `12_Trang_Thai_UI_*.png`: giỏ trống ("Giỏ hàng đang trống", nút "Đi chợ ngay"), skeleton khung xương thay vòng xoay, toast lỗi/thành công (có "Hoàn tác" cho thêm vào giỏ), banner mất mạng, 404 "Trang này đã hết hàng".

- [ ] Toast provider đặt ở layout gốc; toast "Không thể thêm vào giỏ" khi `addToCart` lỗi tồn kho.
- [ ] Mất mạng: lắng nghe `online`/`offline` của `window`, trạng thái ban đầu không giả định.
- [ ] Đề xuất commit: `feat(ui): empty, loading, offline, 404 and toast states`

## Task FE-14: Trợ lý Bếp và Công thức vào giỏ (fixture)

**Files:** tạo `src/app/[countryCode]/(main)/tro-ly-bep/page.tsx`, `cong-thuc/[slug]/page.tsx`; `src/lib/data/assistant.ts` (adapter), `src/lib/data/fixtures/assistant.ts`; `src/modules/assistant/**`.

**Xong khi:** khớp `10_Tro_Ly_Bep_*` và `11_Cong_Thuc_Vao_Gio_*`; hội thoại, thực đơn 3 bữa, danh sách cần mua (11 món, 232.000đ), công thức canh chua cá lóc (6 nguyên liệu, 161.000đ), đổi hãng nước mắm, nút "Thêm N món vào giỏ" hoạt động với giỏ thật.

- [ ] `src/lib/data/assistant.ts` xuất `chat(message: string): Promise<AssistantReply>` và `getRecipe(slug: string): Promise<Recipe>`. Cài đặt hiện tại đọc fixture; cờ `NEXT_PUBLIC_ASSISTANT_MODE=fixture|live`. Khi `live`, gọi API-8. Bản fixture phải **cùng kiểu** `AssistantReply`/`Recipe` ở BE-10.
- [ ] Fixture dùng `variant_id` thật của catalog sau BE-2 (tra bằng `handle`), để "Thêm vào giỏ" chạy thật. Nếu chưa có BE-2, nút bị vô hiệu.
- [ ] Không hiện: điểm khớp, nguồn dữ liệu, "Gemini · RAG", thời gian trả lời, kcal (nếu hợp đồng không có). Ẩn "Nhà bạn đang có" (O4).
- [ ] Giao diện gõ/gửi đơn giản, không streaming (streaming thuộc phần AI).
- [ ] Mục điều hướng "Trợ lý Bếp" trỏ về `/tro-ly-bep`.
- [ ] Đề xuất commit: `feat(assistant): kitchen assistant and recipe pages with fixtures`

## Task FE-15: Dọn dẹp và kiểm tra chất lượng

- [ ] Xóa alias Montra tạm (FE-1), `public/montra/` (nếu hết dùng), trang `_kit`, mục `medusa-cta`, mọi chữ "SmartPantry" còn sót (`grep -ri smartpantry src`).
- [ ] `yarn build`, `yarn lint`, `npx tsc --noEmit`, `yarn test` đều sạch.
- [ ] Duyệt từng màn ở **1440 và 390** so với `preview_png` (bố cục), tick bảng: 01…12. Ghi lại chênh lệch cố ý vào mục "Khác thiết kế" bên dưới.
- [ ] Kiểm tra tương phản và thao tác bàn phím: nút nổi điện thoại, bộ lọc, chọn quy cách, chọn khung giờ, hộp thoại hủy đơn; mục tiêu cảm ứng ≥ 44px.
- [ ] Soát chữ tiếng Anh còn trên giao diện: `grep -rniE "add to cart|checkout|sign in|order|shipping" src --include=*.tsx` rồi loại bỏ phần là mã, giữ phần là nhãn.
- [ ] Cập nhật `README.md` (chạy với backend `vn`, biến `NEXT_PUBLIC_ASSISTANT_MODE`) và `docs/07-ui-design.md` gốc (bảng màu mới, đánh dấu v2 + xanh v1 là bản hiện hành).
- [ ] Đề xuất commit: `chore: remove montra leftovers, qa pass, update readme`

### Khác thiết kế (cố ý)

| Màn | Khác gì | Lý do |
| :--- | :--- | :--- |
| (điền khi làm) | | |

## 5. Cách chia đôi công việc khi sync dở

- **Đợt 1:** FE-0 … FE-7 (sau BE-1/2/3). Xong đợt này: duyệt, xem hàng, chi tiết.
- **Đợt 2:** FE-8 … FE-12 (sau BE-4…BE-8). Xong đợt này: mua hàng trọn vòng, theo dõi đơn.
- **Đợt 3:** FE-13 … FE-15.
- FE-0 đến FE-4 là nền; **đừng bỏ qua** dù chỉ sync nửa chừng, vì mọi trang sau dựa vào token và thành phần.
- Khi dừng: ghi hash commit vào bảng mục 0 và liệt kê điều dở dang ở nhật ký.

**Nhật ký bàn giao** (thêm dòng mới ở trên cùng):

| Ngày | Người | Đã xong | Dở dang / lưu ý |
| :--- | :--- | :--- | :--- |
| 2026-10-18 | | Chưa bắt đầu, mới có kế hoạch | |

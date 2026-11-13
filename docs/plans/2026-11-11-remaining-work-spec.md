# Spec: các hạng mục còn lại của storefront (ngoài A, B, C)

Ngày: 2026-11-11. Trạng thái: **bản nháp chờ duyệt**, chưa code (trừ phần điều tra ở R0).
Tách riêng với [spec A, B, C](2026-11-11-recipe-suggestions-spec.md). Hạng mục **R0 làm trước tất cả**, kể cả A, B, C.

| Mã | Hạng mục | Repo | Ưu tiên |
| :-- | :-- | :-- | :-- |
| **R0** | Sửa trang Trợ lý Bếp: bấm đâu cũng nảy | frontend | **P0, làm ngay** |
| R1 | Ô "Giao đến" trên header dùng khung giờ thật | frontend | P1 |
| R2 | Bỏ hẳn "Dự kiến tới lúc" | frontend, backend | P1 |
| R3 | Quên mật khẩu | frontend, backend | P2 |
| R4 | Dọn hộp thoại "đang phát triển" (`ComingSoon`) | frontend | P2, sau R1 và R3 |
| R5 | Hoàn tất trùng tu UX: bước 5 (trang sản phẩm) và bước 6 (trang công thức) | frontend | P1 |
| R6 | Nợ kiểm thử và tài liệu | cả 3 | P2 |
| **R7** | Ngữ cảnh cho AI ở "Hỏi thêm về món này" | ai (chính), backend, frontend | P1, sau R0 |

**Quyết định của nhóm (2026-11-11):** R0 làm ngay. R1 theo đề xuất (header chỉ chọn khung giờ). R3 làm đủ (cách b), xếp cuối vì cần thao tác tay để cấu hình dịch vụ gửi email. R4: dọn sạch hộp thoại "đang phát triển".

**R0 đã làm (2026-11-11):** thêm `relative` ở 5 chỗ, test chặn tái phát `src/lib/util/touch-target.test.ts`, khung "Hỏi thêm" thành hộp cao cố định cuộn bên trong. Đo trên Edge 1440px và 500px: không còn vùng bấm quá cỡ ở 8 trang; 200 điểm ngẫu nhiên trên trang món không bị nút ở xa nhận; tick, +/- số người, gợi ý câu hỏi không làm cuộn trang; nút gửi giữ nguyên toạ độ dọc qua 3 lần hỏi. Còn lại của R0.4: chuyển khối "Hỏi thêm" lên cột phải (làm cùng R5 bước 6).

**Trạng thái (2026-11-13):**

| Mã | Trạng thái | Nhánh | Ghi chú |
| :-- | :-- | :-- | :-- |
| R0 | Xong, đã kiểm trên trình duyệt | frontend `feature/storefront-ux-rework` | Kiểm lại sau khi đổi bố cục trang công thức (R5) |
| R1 | Xong, đã kiểm trên trình duyệt | frontend `feature/storefront-ux-rework` | Chưa thử khi backend tắt (có test đơn vị) |
| R2 | Xong | backend `chore/remove-delivery-eta`, frontend | Test tích hợp backend chưa chạy (cần Postgres thử cổng 5434 và `.env.test`) |
| R3 | **Chưa làm**, chờ cấu hình gửi email | — | Cần người tạo tài khoản dịch vụ gửi email; xem mục R3 |
| R4 | Xong | frontend | "Quên mật khẩu?" bị gỡ khỏi form, sẽ quay lại cùng R3. Chế độ mock chưa mở trên trình duyệt |
| R5 | Xong (bước 5 và 6) | frontend | Bố cục khác đề xuất ban đầu: cột phải dính theo gồm tạm tính và "Hỏi thêm"; các bước nấu nằm dưới nguyên liệu ở cột trái |
| R6 | Xong phần tài liệu | backend `feature/search-subcategory` (README) | Còn: chạy test tích hợp, khối Mua lại khi đăng nhập, kịch bản demo đầu-cuối, Docker Compose |
| R7 | Xong mục 1, 2, 3, 5, 6 | ai `fix/ask-context` | Mục 4 (quy ước M/m) bỏ: dữ liệu không có chỗ nào giải thích, không kiểm chứng được. Phần gửi trạng thái giỏ (tuỳ chọn) chưa làm |

Nguyên tắc chung: không còn nút nào trên storefront mở hộp thoại "đang phát triển" khi chạy với backend thật. Mỗi nút hoặc chạy thật, hoặc bị gỡ.

---

## R0. Trang Trợ lý Bếp: bấm chỗ này, nảy sang chỗ khác

### R0.1 Triệu chứng

Trên `/tro-ly-bep/<món>`: bấm vào một chỗ, trang cuộn hoặc nhảy sang một chỗ khác (thường xuống ô "Hỏi thêm"), và các lần bấm không vào đúng nút. Bấm "Hỏi thêm" rồi bấm chỗ khác thì bố cục tiếp tục dịch chuyển.

### R0.2 Nguyên nhân đã xác định (đo bằng trình duyệt thật, 2026-11-11)

Class `.touch-target` ([globals.css:184-196](../../src/styles/globals.css)) nới vùng bấm của nút nhỏ lên 44px bằng một phần tử giả `::after` với `position: absolute; width: max(100%, 44px); height: max(100%, 44px)`. Chính file CSS ghi rõ: *"Needs a positioned parent, so the control itself gets `relative`."*

Năm chỗ trong module `kitchen` dùng `touch-target` **mà không có `relative`**:

| File | Nút |
| :-- | :-- |
| [recipe-view.tsx:134](../../src/modules/kitchen/recipe-view.tsx#L134) | Giảm số người |
| [recipe-view.tsx:146](../../src/modules/kitchen/recipe-view.tsx#L146) | Tăng số người |
| [ingredient-list.tsx:83](../../src/modules/kitchen/ingredient-list.tsx#L83) | "Đổi hãng" (mỗi dòng nguyên liệu có nhiều hãng) |
| [ask-panel.tsx:82](../../src/modules/kitchen/ask-panel.tsx#L82) | 3 nút câu hỏi gợi ý |
| [kitchen-search.tsx:90](../../src/modules/kitchen/kitchen-search.tsx#L90) | Các nút gợi ý món ở trang tìm |

Không có cha nào có `position`, nên phần tử giả được định vị theo cả trang. Kết quả đo với trang món "Canh chua cá" (1440×900):

- 9 nút trên trang, **mỗi nút có một lớp bấm vô hình rộng 1440px, cao 2096px**, tức là phủ toàn trang.
- Tại 5 điểm thử nằm ở các vùng trống và vùng nguyên liệu, `document.elementFromPoint` đều trả về cùng một nút: **"Làm sao để món ít mặn, ít cay hơn?"** (nút cuối cùng trong DOM, nên nằm trên cùng).
- Hệ quả: bấm hầu như bất cứ đâu trên trang đều kích hoạt nút gợi ý đó. Nó điền câu hỏi vào ô và gọi `inputRef.current?.focus()`, mà ô nhập nằm ở cuối trang, nên trình duyệt **cuộn xuống tận ô "Hỏi thêm"**. Đó là cú "nảy một chỗ khác" mà bạn thấy. Lớp phủ này cũng chặn ô tick nguyên liệu, nút thêm vào giỏ và các liên kết trong vùng phủ.

Các chỗ khác trong dự án dùng `touch-target` đều đã có `relative` (nút `Button`, `FilterChip`, `Stepper`, thông báo, ô địa chỉ…), nên lỗi chỉ nằm ở 4 file trên. Lỗi này lọt qua vì ghi chú kiểm thử cũ ghi rõ "chưa bấm thử trên trình duyệt" cho trang này (`docs/ghi-chu-test-chua-chay.md`), và `vitest`, `tsc`, lint không bắt được lỗi bố cục.

### R0.3 Sửa

1. Thêm `relative` vào 5 chỗ ở bảng trên. Không đổi gì khác trong lần sửa này.
2. **Chặn tái phát**: thêm test `vitest` đọc mã nguồn `src/**/*.tsx`, mỗi chuỗi class có `touch-target` mà không có một trong `relative`, `absolute`, `fixed`, `sticky` thì test đỏ. Cách này không phụ thuộc vào thứ tự CSS của Tailwind.
3. **Kiểm bằng trình duyệt**: script `puppeteer` (đã có khung ở thư mục tạm của phiên này, chuyển vào `scripts/` của repo nếu nhóm muốn giữ) duyệt các trang chính (`/`, `/store`, `/categories/rau-cu`, trang sản phẩm, `/cart`, `/tro-ly-bep`, một trang món). Đỏ nếu có phần tử `.touch-target` nào mà `::after` lớn hơn `max(kích thước nút, 44px) + 2px`.

### R0.4 Các lỗi phụ của khung "Hỏi thêm" (làm cùng đợt, sau khi R0.3 xong)

Đây không phải nguyên nhân của hiện tượng trên, nhưng khiến nút dịch chuyển dưới tay người dùng:

| Vấn đề trong [ask-panel.tsx](../../src/modules/kitchen/ask-panel.tsx) | Sửa |
| :-- | :-- |
| Bấm "Hỏi thêm" thì 3 nút gợi ý biến mất và bong bóng "Đang trả lời…" chèn vào phía trên ô nhập, nên ô nhập và nút gửi bị đẩy dịch chuyển | Khung hội thoại có chiều cao tối đa cố định (`max-h` khoảng 320px, cuộn bên trong); ô nhập và nút gửi nằm ngoài vùng cuộn và **không đổi vị trí** khi có câu trả lời |
| Mỗi câu trả lời mới làm tài liệu dài ra, trang trượt theo | Chỉ cuộn bên trong khung hội thoại tới câu mới nhất, không cuộn cả trang |
| `inputRef.current?.focus()` khi bấm gợi ý làm trình duyệt cuộn tới ô nhập | `focus({ preventScroll: true })` |
| Cả vùng `aria-live` được đọc lại mỗi lần có thêm câu | Dùng `role="log"` để chỉ đọc nội dung mới |
| Khối "Hỏi thêm" nằm cuối trang, khách phải cuộn mới thấy | Chuyển lên cột phải dưới "Cách nấu" (đã có trong [kế hoạch trùng tu 3.6](2026-11-11-storefront-ux-rework.md), làm cùng R5) |

### R0.5 Nghiệm thu

Chạy trên trình duyệt thật (Edge, 1440px và 500px), backend và AI service bật, `NEXT_PUBLIC_UI_MOCK=false`:

1. 20 điểm ngẫu nhiên ở vùng trống của trang món: không điểm nào trả về nút (`elementFromPoint`).
2. Bấm ô tick nguyên liệu: chỉ ô đó đổi, trang không cuộn. Bấm "Đổi hãng": chỉ danh sách hãng của dòng đó mở ra.
3. Bấm "+" và "−" số người: số người đổi đúng một bước mỗi lần bấm, trang không cuộn.
4. Bấm gợi ý trong "Hỏi thêm" chỉ điền ô nhập, không đổi vị trí cuộn. Gửi câu hỏi 3 lần liên tiếp: vị trí của nút "Hỏi thêm" trên màn hình **không đổi** (đo bằng `getBoundingClientRect` trước và sau).
5. Bấm vào vùng trống: không có gì xảy ra.
6. Script ở R0.3 (3) xanh trên các trang liệt kê; test ở R0.3 (2) xanh.

---

## R1. Ô "Giao đến" trên header dùng khung giờ thật

### R1.1 Hiện trạng

[address-pill/index.tsx](../../src/modules/layout/components/address-pill/index.tsx): chữ cố định "Giao đến · Q.7", "Hôm nay 17:00–19:00", "Sky Garden, Q.7"; bấm vào chỉ mở hộp thoại "đang phát triển". Trong khi đó backend đã có `GET /store/delivery-slots` (khung giờ còn mở) và checkout đã chọn khung giờ thật (`listDeliverySlots()` trong [checkout.ts](../../src/lib/data/checkout.ts)), địa chỉ nhập ở bước thanh toán.

### R1.2 Hành vi

- **Chỉ làm phần khung giờ** (bản đầu). Bỏ hẳn phần địa chỉ ở header (địa chỉ vẫn nhập ở thanh toán). Nhãn: "Giao trong ngày · TP.HCM" thay cho "Giao đến · Q.7".
- Ô hiển thị **khung giờ đang chọn**; nếu chưa chọn thì **khung sớm nhất còn mở** ("Sớm nhất: 17:00–19:00 hôm nay"). Nếu hôm nay hết khung thì hiển thị khung đầu tiên của ngày mai, kèm chữ "ngày mai".
- Bấm vào ô mở một danh sách nhỏ (popover, bàn phím và Esc dùng được) liệt kê các khung còn mở, giống danh sách ở trang thanh toán. Chọn một khung thì ô đổi ngay.
- **Lưu lựa chọn**: cookie `_c4f_slot` (id khung giờ, hạn 1 ngày). Trang thanh toán chọn sẵn khung này nếu còn mở. Bước chọn ở thanh toán vẫn là bước có hiệu lực (gọi `POST /store/carts/:id/delivery-slot`), nên không cần giỏ để chọn ở header và backend không đổi.
- Khung đã lưu mà đóng thì tự về "sớm nhất", không báo lỗi.
- API khung giờ lỗi: ô chỉ hiện "Giao trong ngày · TP.HCM", không bấm được.
- Điện thoại: hàng địa chỉ bỏ, chỉ giữ nút khung giờ.

### R1.3 Kỹ thuật

- Server component `Nav` lấy danh sách khung giờ, truyền xuống `DeliverySlotPill` (client). Trang tĩnh nhưng danh sách thay đổi theo giờ, nên lấy không cache, cùng cách với phần lưu kho (`no-store`), hoặc lấy ở client qua server action để không chậm phần còn lại của header.
- Tái dùng `toSlotOptions` ([util/checkout.ts](../../src/lib/util/checkout.ts)) để gắn nhãn.
- Không gọi `useComingSoon` ở đây nữa.

### R1.4 Nghiệm thu

1. Không còn chuỗi "Q.7", "Sky Garden" hay khung giờ cố định trong `src` (grep).
2. Ô hiển thị đúng khung sớm nhất từ `GET /store/delivery-slots`; so sánh bằng `curl`.
3. Chọn khung ở header rồi vào thanh toán: khung đó được chọn sẵn. Khung vừa đóng: thanh toán chọn khung sớm nhất.
4. Tắt backend: header vẫn hiển thị, ô không bấm được, không lỗi.
5. Test đơn vị cho hàm chọn "khung sớm nhất" và "khung đã lưu còn mở hay không" (hàm thuần).

### R1.5 Chưa chốt

Có cần chọn **địa chỉ** ngay trên header (khách đăng nhập chọn trong sổ địa chỉ) không? Đề xuất: không, để thanh toán xử lý. Nếu cần, đó là một hạng mục riêng vì phải có sổ địa chỉ, vùng giao hàng và phí giao.

---

## R2. Bỏ hẳn "Dự kiến tới lúc"

Quyết định của nhóm: không làm ước tính giờ tới. Gỡ ở cả hai tầng. Giữ **tên và biển số tài xế** (dữ liệu có thật khi admin bấm "Bắt đầu giao").

| Repo | Việc |
| :-- | :-- |
| frontend | [order-tracking-template.tsx](../../src/modules/account/templates/order-tracking-template.tsx): xóa khối `tracking-eta` (cả nhãn "Đang phát triển"); khi không có tài xế thì cột bên không hiển thị gì và lưới còn một cột. Sửa chú thích đầu file (đang ghi "arrival time is a placeholder"). |
| frontend | [util/order-view.ts](../../src/lib/util/order-view.ts): bỏ `distanceKm`, `etaTime`, `formatVnTime`, và `SAMPLE_DRIVER` còn trường rỗng; cập nhật `order-view.test.ts`. |
| backend | [lib/delivery/estimate.ts](../../../grocery-store-backend/apps/backend/src/lib/delivery/estimate.ts) và test: xóa. [workflows/start-delivery.ts](../../../grocery-store-backend/apps/backend/src/workflows/start-delivery.ts): ngừng tính và ghi `eta_at`, `distance_km` vào `metadata.delivery`. |
| backend | [admin/widgets/order-start-delivery.tsx](../../../grocery-store-backend/apps/backend/src/admin/widgets/order-start-delivery.tsx): bỏ dòng "Dự kiến tới lúc … còn … km"; giữ tên tài xế và biển số. |
| docs | Câu hỏi mở Q10 (thông báo "đơn sắp tới", tính từ quãng đường kho tới địa chỉ) mất cơ sở khi không có ước tính: ghi "không làm" ở `docs/06`, trừ khi nhóm chọn cách khác. |

Đơn cũ đã có `eta_at` trong metadata không cần dọn (chỉ không còn được đọc).

**Nghiệm thu**: trang theo dõi đơn không còn chữ "Dự kiến"; đơn đã có tài xế vẫn hiện tên và biển số; `tsc`, `vitest` và test backend xanh; grep `eta_at`, `etaTime`, `distance_km` trong `src` không còn kết quả (trừ migration hoặc ghi chú lịch sử nếu có).

---

## R3. Quên mật khẩu

### R3.1 Hiện trạng

[login-template.tsx:163](../../src/modules/account/templates/login-template.tsx#L163): nút "Quên mật khẩu?" luôn mở hộp thoại "đang phát triển", kể cả khi chạy backend thật. Cả frontend lẫn backend chưa có luồng đặt lại mật khẩu (grep `reset-password` không có kết quả).

### R3.2 Phương án

Luồng chuẩn của Medusa v2 (**phải đối chiếu với tài liệu Medusa qua MCP `medusa` khi làm, không đoán từ trí nhớ**): khách gửi email → backend phát sự kiện đặt lại → một subscriber gửi email chứa liên kết có token → khách vào trang đặt mật khẩu mới.

Việc phải có mà dự án chưa có: **một nơi gửi email** (notification provider). Hai cách:

| Cách | Mô tả | Chi phí |
| :-- | :-- | :-- |
| **a. Gỡ nút** (đề xuất cho đồ án) | Bỏ "Quên mật khẩu?" khỏi form. Tài khoản dùng thử có sẵn nút đăng nhập nhanh. Ghi rõ trong báo cáo rằng chưa hỗ trợ | Nửa giờ |
| **b. Làm đủ** | Notification provider, subscriber, hai trang frontend, test | Khoảng 1–1,5 ngày, phụ thuộc cấu hình email |

Nếu chọn b:

- Backend: cấu hình notification module (SMTP hoặc dịch vụ gửi email), subscriber cho sự kiện đặt lại mật khẩu, mẫu email tiếng Việt. Môi trường dev dùng provider ghi liên kết ra log để khỏi cần email thật.
- Frontend: `/account/quen-mat-khau` (nhập email, luôn trả lời "nếu email có trong hệ thống, bạn sẽ nhận được thư" để không lộ email nào đã đăng ký) và `/account/dat-lai-mat-khau?token=` (mật khẩu mới, nhập lại, quy tắc giống form đăng ký).
- Test: đơn vị cho form; tích hợp backend cho luồng (sự kiện → subscriber → token → đổi được mật khẩu).
- Không in token hay mật khẩu vào log ở môi trường không phải dev.

### R3.3 Chưa chốt

Chọn a hay b. Đề xuất a trước, b nếu còn thời gian sau các hạng mục P1.

---

## R4. Dọn hộp thoại "đang phát triển" (`ComingSoon`)

Sau R1, R3 (nếu chọn cách a hoặc b) và C, không còn chỗ nào ở chế độ backend thật mở hộp thoại "đang phát triển". Việc còn lại:

1. Với backend thật: grep `useComingSoon`, `ComingSoonButton`, `ComingSoonBadge`, `ComingSoonPanel` ở các đường chạy thật (không thuộc nhánh `isMockMode()`): kết quả phải rỗng.
2. **Chế độ mock còn dùng không?** Hiện còn 12 file dùng `ComingSoon`, hầu hết là thay thế cho tính năng cần backend thật (đăng nhập, "Mua lại", banner món ăn, ví mã giảm giá, nút "Mua lại" của đơn). Hai hướng:

| Hướng | Việc | Ghi chú |
| :-- | :-- | :-- |
| **Giữ mock** | Giữ nguyên các chỗ trên, chỉ giữ component | Mock mode phải tiếp tục chạy sau mỗi thay đổi (yêu cầu của kế hoạch trùng tu) |
| **Bỏ mock** | Xóa `isMockMode` và dữ liệu mock, rồi xóa `ComingSoon` | Gọn hơn, nhưng bỏ khả năng chạy giao diện không có backend (demo khi mất Docker) |

Đề xuất: giữ mock đến hết đợt bảo vệ, rồi xóa. Cần nhóm xác nhận.

---

## R5. Hoàn tất trùng tu UX: bước 5 và bước 6

Mô tả thiết kế nằm ở [kế hoạch trùng tu 3.5 và 3.6](2026-11-11-storefront-ux-rework.md). Ghi lại phần còn lại và điều kiện nghiệm thu; phần "Món nấu với sản phẩm này" của trang sản phẩm do tính năng C đảm nhận.

**Bước 5, trang sản phẩm** (không gồm C):
- Bỏ `ScaleLabel` đè lên ảnh; bỏ khối tab (chỉ hiện phần có nội dung thật); bỏ banner "Đang trong quá trình phát triển" (C thay).
- Thêm dãy "Cùng danh mục" (5 thẻ, dùng `listShortRow`).
- Điện thoại: thanh "Thêm vào giỏ" dính đáy.
- Ảnh sản phẩm dùng `fit="contain"` như thẻ sản phẩm, nền trắng.
- Nghiệm thu: không còn tem cân, tab rỗng, banner; chụp 1440px và 500px; mock mode còn chạy.

**Bước 6, trang công thức** (làm sau R0):
- Tên nguyên liệu 15px đậm; hàng nguyên liệu gọn (tick, tên và lượng, sản phẩm, giá).
- Khung tạm tính và nút thêm vào giỏ **dính theo khi cuộn** (desktop cột phải, điện thoại thanh đáy).
- "Hỏi thêm" chuyển lên cột phải, dưới "Cách nấu" (xem R0.4).
- Ảnh món: chờ PR ảnh món; chừa chỗ trong bố cục; thêm host `monngonmoingay.com` vào `remotePatterns` khi có ảnh.
- Nghiệm thu: 16 nguyên liệu vừa khoảng một màn hình rưỡi; nút thêm vào giỏ luôn nhìn thấy khi cuộn; kiểm R0.5 lại sau khi đổi bố cục.

---

## R6. Nợ kiểm thử và tài liệu

Những việc đã ghi là "chưa chạy" hoặc lệch tài liệu, mình thấy khi rà:

1. **Chưa bấm thử trên trình duyệt** các thao tác của trang Trợ lý Bếp (tick, đổi hãng, +/- số người, thêm vào giỏ, "Hỏi thêm", nút Trợ lý Bếp ở header) theo `docs/ghi-chu-test-chua-chay.md`. R0.5 thay thế phần này; ghi kết quả vào cùng file.
2. **Khối "Mua lại" của khách đã đăng nhập chưa xác nhận trên trình duyệt** (chỉ mới gọi thẳng `/predict`). Mình đã thêm ảnh sản phẩm vào khối này nhưng chưa nhìn thấy trên màn hình: kiểm bằng tài khoản demo `minhthu@com4fud.demo`.
3. **Test tích hợp backend** `ai-copilot.spec.ts` chưa chạy lại sau nhánh `fix/ai-chef-hardening`, và chưa có test cho hai thay đổi mới ở nhánh `feature/search-subcategory` (trường `subcategory`, `thumbnail` của giỏ mua lại).
4. **Chỉ mục tìm kiếm**: nhánh `feature/search-subcategory` thêm trường `subcategory`; ai kéo nhánh này về phải chạy `npx medusa db:migrate:search` (khởi động lại backend là chưa đủ, mình đã thử). Ghi vào README backend và vào PR.
5. **`AGENTS.md` mục 4 (trạng thái, ghi 2026-10-11) đã lỗi thời**: backend đã có các module `hot-stock`, `vnpay`, `realtime-gateway`, workflow giữ kho, subscriber theo giai đoạn đơn, `get-reorder-basket`, `list-delivery-slots`. Mình chưa kiểm chứng bốn tính năng lõi (Predictive Caching, Atomic Hot-Stock Gate, Real-Time Stock Sync, Chef Copilot) chạy được từ đầu đến cuối trong cùng một lần, nên spec này không đặc tả lại chúng. Đề xuất một buổi chạy kịch bản demo từ đầu đến cuối (đăng nhập, mua lại, đặt hàng có giữ kho, thanh toán VNPAY, huỷ đơn, đổi tồn trong admin và xem huy hiệu đổi trên storefront) và ghi lại kết quả thật.
6. **Docker Compose** mới có ở repo AI (`grocery-store-ai/docker-compose.yml`); chưa có cho Postgres Medusa, Redis, gateway. Theo Q8 của `docs/06`, đặt ở repo backend. Hạng mục riêng nếu nhóm muốn người khác chạy được bằng một lệnh.
7. **TanStack Query** (Q9) chưa được cài; các khối tải ở client hiện dùng `useEffect` và server action. Không cần thiết cho các spec này; ghi vào `docs/06` rằng đã chọn cách không dùng.

## R7. Ngữ cảnh cho AI ở "Hỏi thêm về món này"

### R7.1 Triệu chứng

Khách hỏi về một bước nấu thì trợ lý trả lời như không biết các bước của món.

### R7.2 Nguyên nhân đã xác định (đo ngày 2026-11-11, món "Canh chua cá", qua `/store/ai/ask`)

Prompt **có** các bước nấu ([ask_facts.py](../../../grocery-store-ai/src/services/ask_facts.py), hàm `build_ask_prompt`), và dữ liệu có đủ (chỉ 3 trong 1.061 món không có bước nào). Lỗi nằm ở **cách đánh số**:

- Trang công thức gộp bước chuẩn bị và bước nấu thành một danh sách "Cách nấu · 8 bước", đánh số **1 đến 8** ([recipe-view.tsx](../../src/modules/kitchen/recipe-view.tsx), `steps = [...prep_steps, ...cooking_steps]`).
- Prompt gửi hai danh sách riêng, "Các bước chuẩn bị" **1 đến 4** và "Các bước nấu" **1 đến 4**.

| Câu hỏi | Trả lời thật | Đánh giá |
| :-- | :-- | :-- |
| "Bước 6 làm gì vậy?" | "…chỉ có 4 bước chuẩn bị và 4 bước nấu thôi, không có bước số 6 nhé." | Sai: màn hình có bước 6 |
| "Ở bước 3 mình cần chú ý gì?" | Trả lời về "cho bạc hà, đậu bắp, giá vào…" | Sai bước: đó là bước 7 trên màn hình; bước 3 trên màn hình là "cắt lát mỏng thơm, bạc hà…" |
| "Tổng cộng có mấy bước?" | Liệt kê đúng 8 bước, chia hai nhóm | Đúng |
| "1M là bao nhiêu?" | "1 muỗng canh (khoảng 15ml)…" | Đúng (mô hình tự suy ra, prompt không giải thích) |

Thiếu thêm so với những gì khách đang nhìn thấy:

| Thứ khách thấy hoặc dữ liệu có sẵn | Trong prompt? |
| :-- | :-- |
| Số bước đánh liên tục như trên màn hình | Không |
| `usage_notes` (cách dùng, 1.044 món có) và `tips` (mẹo, 1.040 món có) trong bảng `recipe` | Không. `RecipeService` cũng không đọc hai cột này |
| Thời gian nấu, độ khó | Không |
| Lượng nguyên liệu **đã nhân theo số người đang xem** | Không: chỉ có dòng công thức gốc và câu "Khách đang xem cho N người" |
| Nguyên liệu khách đã bỏ tick hoặc "Nhà bạn đã có", món hết hàng | Không |
| Quy ước viết tắt của nguồn công thức (M = muỗng canh, m = muỗng cà phê) | Không |

### R7.3 Sửa

**AI service** (`ask_facts.py`, `recipe_service.py`, test `tests/recipe_rag/test_ask*.py`):

1. **Một danh sách bước, đánh số liên tục, giống màn hình**: "Các bước (đánh số như khách thấy trên màn hình)", bước chuẩn bị trước, bước nấu sau, kèm nhãn `[chuẩn bị]` hoặc `[nấu]` ở mỗi dòng. Thêm quy tắc vào `SYSTEM_PROMPT`: khi khách nói "bước N" thì là số trong danh sách này.
2. Đọc thêm `usage_notes`, `tips` trong `RecipeService` và đưa vào prompt (cắt độ dài như các bước).
3. Thêm thời gian nấu và độ khó khi có.
4. Thêm một dòng quy ước: "M = muỗng canh (khoảng 15 ml), m = muỗng cà phê (khoảng 5 ml)". **Cần người kiểm lại quy ước này với nguồn công thức trước khi đưa vào**; nếu không chắc thì bỏ dòng này.
5. Lượng theo số người: thêm phần "Lượng cho N người" lấy từ `build_basket` (đã có `need.quantity`, `need.unit`), chỉ khi N khác khẩu phần gốc.
6. Giới hạn độ dài prompt: giữ `STEP_CHARS`, thêm giới hạn cho mẹo và cách dùng; đo số token trước và sau trên 20 món dài nhất để chắc không vượt hạn mức của mô hình đang dùng.

**Backend và frontend** (tuỳ chọn, làm sau 1–6): gửi kèm trạng thái giỏ của màn hình (nguyên liệu đã bỏ tick, món hết hàng) để trợ lý trả lời được "mình không mua cá thì thay bằng gì". Cần thêm trường vào `AskRequest` và hợp đồng `ai-copilot.md`; dữ liệu do máy khách gửi nên coi là dữ liệu, không phải chỉ thị (như `history` hiện nay).

**Giao diện**: không đổi số bước. Giữ danh sách gộp 1 đến N.

### R7.4 Nghiệm thu

1. Test đơn vị cho `build_ask_prompt`: số bước liên tục; có mẹo và cách dùng khi dữ liệu có; không có phần lượng theo số người khi N bằng khẩu phần gốc.
2. Bộ câu hỏi cố định trên 5 món (có món không có bước chuẩn bị, món nhiều bước): "bước K làm gì" với K ở cả hai nhóm, "bước cuối là gì", "có mẹo gì không", "nấu cho 8 người thì cần bao nhiêu cá". Người chấm đối chiếu câu trả lời với màn hình; ghi tỉ lệ đúng trước và sau khi sửa. Hiện tại: 2 trên 4 câu thử ở bảng trên sai.
3. Câu hỏi ngoài chủ đề vẫn bị từ chối; độ trễ `/ask` không tăng đáng kể (đo, không ước lượng).

Lưu ý: câu trả lời do mô hình ngôn ngữ sinh nên không cố định; nghiệm thu bằng bộ câu hỏi và người chấm, không bằng so khớp chuỗi.

---

## Thứ tự đề xuất

| Thứ tự | Hạng mục | Ước lượng thô |
| :-- | :-- | :-- |
| 1 | **R0.1–R0.3** (sửa và chặn tái phát) | 0,5 giờ sửa, 1–2 giờ viết test và script |
| 2 | R0.4 và R0.5 cùng R5 bước 6 | 1 ngày |
| 2b | R7 (ngữ cảnh "Hỏi thêm"), mục 1–4 trước | 0,5 ngày; mục 5–6 thêm 0,5 ngày |
| 3 | R2 (bỏ "Dự kiến tới lúc") | 0,5 ngày |
| 4 | R1 (khung giờ ở header) | 0,5–1 ngày |
| 5 | R5 bước 5 (cùng C) | 0,5 ngày |
| 6 | R6 (kiểm thử, tài liệu) | 1 ngày |
| 7 | R3, R4 | R3a: nửa giờ; R3b: 1–1,5 ngày |

Ước lượng là thô, chưa tính thời gian xem xét PR.

# Redis so với bản chỉ dùng Postgres: sửa backend và nối storefront

> **Cho người làm tiếp:** làm lần lượt, tick `- [ ]` khi xong, ghi commit vào bảng mục 0. Hai task backend (RB-1, RB-2) làm trước vì storefront dựa vào chúng. Backend: repo `grocery-store-backend`, quy ước ở `AGENTS.md` của repo đó (route chỉ chạy workflow, đừng đoán API Medusa). Storefront: repo này, quy ước ở plan `2026-10-18-sync-ui-v2-frontend.md` (chữ trên giao diện tiếng Việt thuần, không "AI", "Sandbox"; logic thuần ở `src/lib/util` có test vitest; chế độ giả `NEXT_PUBLIC_UI_MOCK` không gọi backend).
>
> Nhánh: `feature/medusa-backend-integration` ở cả hai repo. Người làm: noper1080 và Claude. **Báo Thiện trước khi bắt đầu RF-1, RF-2**: hai task này sửa `src/lib/data/checkout.ts` và trang `vnpay-return` mà Thiện đã viết.

**Mục tiêu:** storefront dùng được các phần backend đã thêm khi đưa Redis vào (plan backend `docs/plans/2026-11-03-redis-hot-stock.md`, HS-0 đến HS-8), và sửa hai chỗ backend còn thiếu phát hiện khi rà lại ngày 2026-11-05.

## 0. Bảng trạng thái

| Task | Repo | Nội dung | Phụ thuộc | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| RB-1 | backend | `stock_failed` theo từng giao dịch: thanh toán lại sau khi bị hoàn tiền không bị nuốt | | [x] Xong · 2 test http (lỗi khi bỏ bản sửa, qua khi có) |
| RB-2 | backend | API-15 nhận `cart_id`: cộng lại phần chính giỏ đang giữ, trả `held_by_cart` | | [x] Xong · 1 test http, 1 unit |
| RF-1 | storefront | Thanh toán: giữ hàng (API-14) trước khi sang VNPAY, báo đúng món hết hàng | RB-1 | [~] Code và test xong; chờ kiểm trên trình duyệt (RF-5) |
| RF-2 | storefront | Trang kết quả thanh toán: báo "hết hàng, đã hoàn tiền" thay vì chờ đơn | RB-1 | [~] Code và test xong; chờ kiểm trên trình duyệt (RF-5) |
| RF-3 | storefront | Số tồn ở giỏ và trang sản phẩm đã trừ phần người khác đang giữ (API-15) | RB-2 | [~] Code và test xong; chờ kiểm trên trình duyệt (RF-5) |
| RF-4 | storefront | Tồn cập nhật trực tiếp qua Socket.io (API-16) | RF-3 | [~] Code và test xong; chờ kiểm trên trình duyệt (RF-5) |
| RF-5 | cả hai | Kiểm tay trên trình duyệt, tài liệu, bàn giao | tất cả | [ ] |

Ký hiệu: `[x]` xong và đã kiểm · `[~]` code và test xong, còn phần kiểm tay · `[ ]` chưa làm.

## 1. Khác nhau giữa hai phiên bản

| Phần | Bản chỉ Postgres (trước 2026-11-03) | Bản có Redis (backend hiện tại) | Storefront phải đổi |
| :--- | :--- | :--- | :--- |
| Hạ tầng chạy dev | Postgres | Postgres + **Redis** (bắt buộc, backend không khởi động nếu thiếu) + gateway Socket.io (tuỳ chọn, cổng 4001) | Thêm `NEXT_PUBLIC_REALTIME_URL` (RF-4) |
| Lúc bấm "Đặt hàng" | Ghi địa chỉ, khung giờ, phương thức giao, mở phiên VNPAY | **Giữ hàng cả giỏ 15 phút** trước khi mở phiên (API-14). Thiếu món nào thì không giữ món nào, trả `409 OUT_OF_STOCK` kèm danh sách | Gọi API-14, xử lý `409` theo `code` (RF-1) |
| Nhiều người cùng mua món cuối | Ai cũng sang VNPAY được; hoàn tất giỏ mới biết hết hàng, lúc đó tiền đã thu | Chỉ người giữ được hàng mới sang VNPAY | Báo người không giữ được (RF-1) |
| Link VNPAY | 15 phút | **10 phút** (hold 15 phút) | Không đổi code |
| Thanh toán lỗi, khách huỷ trên VNPAY | Không đổi gì | Hàng được trả về ngay | Không đổi (trang kết quả đã có nút "Thử thanh toán lại") |
| IPN tới muộn, món đã bị người khác giữ | Medusa hoàn tất giỏ hoặc báo lỗi tuỳ tồn Postgres | **Hoàn tiền, không tạo đơn**, ghi `cart.metadata.stock_failed` | Trang kết quả báo hết hàng, đã hoàn tiền (RF-2) |
| Số tồn hiển thị | `inventory_quantity` = stocked − reserved | `inventory_quantity` vẫn như cũ (không trừ phần đang giữ); số đúng ở API-15 | Đọc API-15 cho giỏ và trang sản phẩm (RF-3) |
| Tồn đổi khi đang xem trang | Phải tải lại trang | Gateway đẩy `stock:update` | Hook nghe Socket.io (RF-4) |
| Mã đơn | Chỉ đơn demo có `metadata.code` | Mọi đơn mới có `C4F-YYMMDD-NNNN` | Không đổi (FE đã đọc `metadata.code`) |

Danh sách sản phẩm (`/store`, danh mục) vẫn lọc "còn hàng" theo chỉ mục tìm kiếm của Postgres, không trừ phần đang giữ. Chấp nhận được: món đang được giữ hết chỉ bị chặn ở bước đặt hàng; không làm trong plan này.

## 2. Hợp đồng dùng trong plan

Đầy đủ ở bảng API mục 3 của plan backend `2026-10-18-sync-ui-v2-backend.md`. Phần đổi trong plan này đánh dấu **(RB-x)**.

**API-14** `POST /store/carts/:id/reserve`, body rỗng:
- `200 { hold: { cart_id, status: "HELD", expires_at } }`
- `409 { code: "OUT_OF_STOCK", items: [{ variant_id, inventory_item_id, requested, available }] }`: không món nào được giữ
- `409 { code: "CART_COMPLETED" }`, `404` giỏ lạ, `400` giỏ không có món quản kho
- Gọi lại an toàn: giỏ đổi thì giữ theo giỏ mới.

**`cart.metadata.stock_failed`** (API-12, sau HS-6, đổi ở **RB-1**):

```ts
{ at: string; txn_ref: string; vnp_transaction_no?: string;
  items: { variant_id; inventory_item_id; requested; available }[];
  refund: "refunded" | "failed"; refund_error?: string }
```

Mỗi lần IPN hết hàng ghi đè giá trị cũ. Storefront chỉ coi là "lần thanh toán vừa rồi bị hoàn tiền" khi giỏ **chưa hoàn tất** và `stock_failed.at` mới hơn lúc khách bấm thanh toán (xem RF-2).

**API-15** `GET /store/stock?variant_ids=a,b[&cart_id=...]` (đổi ở **RB-2**):

```ts
{ stock: [{ variant_id, inventory_item_id, location_id, available, held_by_cart }] }
```

- `available`: số còn giữ được **cho giỏ này**, tức là đã trừ phần người khác đang giữ và cộng lại phần chính giỏ `cart_id` đang giữ. Không có `cart_id` thì `held_by_cart = 0`.
- `null` khi biến thể không quản kho (không giới hạn).

**API-16** Socket.io tại `NEXT_PUBLIC_REALTIME_URL` (dev `http://localhost:4001`):
- `emit("subscribe", { inventory_item_ids }, ack)` (1–100 id) → `{ ok: true, inventory_item_ids }` hoặc `{ ok: false, error }`; `unsubscribe` cùng dạng
- nhận `stock:update { location_id, inventory_item_id, available }`: số **chung cho mọi khách**, chưa cộng phần giỏ mình giữ. Storefront tự cộng `held_by_cart` của API-15.
- Pub/Sub không lưu tin: kết nối lại thì gọi lại API-15.

## 3. Quyết định chung

| # | Quyết định | Lý do |
| :--- | :--- | :--- |
| Q1 | Chế độ giả (`NEXT_PUBLIC_UI_MOCK` khác `false`) không gọi API-14/15/16, giữ nguyên hành vi hiện tại | Giữ nguyên cam kết của chế độ giả |
| Q2 | API-15 hoặc gateway lỗi thì **giữ số cũ** (`inventory_quantity`), không báo lỗi cho khách | Badge tồn là thông tin phụ; chặn thật nằm ở API-14 |
| Q3 | Chặn bán lố chỉ dựa vào API-14 ở backend; số trên giao diện chỉ để báo trước | Số trên trình duyệt luôn có thể cũ |
| Q4 | Chữ hiển thị (đề xuất, chỉnh khi làm): hết hàng lúc đặt "Vừa có người đặt hết {tên món}. Bạn bỏ món này hoặc giảm số lượng rồi đặt lại nhé."; hoàn tiền "{tên món} vừa hết trong lúc bạn thanh toán. Com4Fud đã hoàn {số tiền} về tài khoản của bạn."; hoàn lỗi "… Com4Fud sẽ liên hệ để hoàn tiền trong 24 giờ." | Tiếng Việt thuần, nói rõ khách cần làm gì |
| Q5 | Socket.io chỉ mở ở trang chi tiết sản phẩm và trang giỏ (`LiveStock`), không ở danh sách sản phẩm | Danh sách tới 100 món mỗi trang và lọc theo chỉ mục tìm kiếm (mục 1) |

---

## Task RB-1 (backend): `stock_failed` theo từng giao dịch

**Lỗi:** sau khi bị hoàn tiền vì hết hàng, khách thanh toán lại **trên cùng giỏ** (phiên VNPAY mới). IPN mới tới, `guard-paid-cart-stock` thấy giỏ đã có `stock_failed` nên coi là IPN lặp và trả `02`: **tiền đã thu, không có đơn, không hoàn**.

**Files:** `apps/backend/src/workflows/guard-paid-cart-stock.ts`, `apps/backend/src/api/hooks/vnpay/ipn/route.ts`, `apps/backend/integration-tests/http/hot-stock-ipn.spec.ts`.

**Xong khi:** test mới qua (hoàn tiền rồi thanh toán lại có hàng thì có đơn, hết hàng thì hoàn lần hai); test cũ "IPN lặp trả 02, không hoàn lần hai" vẫn qua.

- [x] `stock_failed` lưu thêm `txn_ref` (từ `vnp_TxnRef`).
- [x] `checkPaidCartHoldStep`: chỉ trả `already_failed` khi `stock_failed.txn_ref` trùng `txn_ref` của IPN đang xử lý; khác thì chạy tiếp như giỏ chưa từng bị hoàn (giữ lại hàng, còn thì tạo đơn, hết thì hoàn và ghi đè `stock_failed`).
- [x] Test: hoàn tiền → khách tạo phiên mới và trả tiền (còn hàng) → có đơn, `stock_failed` cũ vẫn trên giỏ đã hoàn tất; hoàn tiền → trả lại khi vẫn hết → hoàn lần hai, `stock_failed` ghi đè.
- [x] Ghi vào plan hot-stock (HS-6b) và `verified-apis.md` mục HS-6.
- [x] Commit `fix(vnpay): out-of-stock refund is per transaction, not per cart`.

## Task RB-2 (backend): API-15 theo giỏ

**Vấn đề:** khách sang VNPAY rồi đóng tab, quay về giỏ trong 15 phút: hold của chính khách vẫn còn nên API-15 trừ luôn phần đó, các món của khách hiện "Hết hàng".

**Files:** `apps/backend/src/api/store/stock/{validators,route}.ts`, `apps/backend/src/workflows/get-variant-stock.ts`, `apps/backend/src/lib/inventory/variant-stock.ts` (+ unit test), `apps/backend/integration-tests/http/hot-stock-reserve.spec.ts`.

**Xong khi:** gọi API-15 với `cart_id` của giỏ đang giữ thì số của các món trong giỏ cộng lại phần giữ, `held_by_cart` đúng; không có `cart_id` thì như cũ cộng `held_by_cart: 0`.

- [x] Query thêm `cart_id` (tuỳ chọn, chuỗi ≤ 100 ký tự).
- [x] Workflow đọc hold của giỏ (`getHold`, chỉ khi `HELD`), cộng số lượng giữ theo inventory item vào `available` trước khi chia `required_quantity`; trả `held_by_cart` theo đơn vị biến thể.
- [x] `cart_id` của giỏ người khác: chỉ làm số của chính người gọi cao hơn đúng phần giỏ đó giữ, không lộ gì thêm (giỏ chỉ đọc được khi biết id). Ghi chú trong code.
- [x] Test: một giỏ giữ 2 trên tồn 5 → không `cart_id` trả 3; có `cart_id` trả 5, `held_by_cart` 2; hold đã hết hạn thì `held_by_cart` 0.
- [x] Sửa dòng API-15 trong bảng API (plan `2026-10-18`, repo backend).
- [x] Commit `feat(hot-stock): stock read relative to the caller's cart`.

## Task RF-1: Thanh toán giữ hàng trước khi sang VNPAY

**Files:** `src/lib/data/checkout.ts` (`startPayment`), `src/lib/util/checkout.ts` (+ test), `src/modules/checkout/templates/index.tsx`.

**Xong khi:** đặt hàng khi đủ hàng thì sang VNPAY như cũ; món bị người khác giữ hết thì ở lại trang, báo tên món và có nút về giỏ; khung giờ vừa đóng vẫn báo như cũ.

- [x] `startPayment`: sau `addShippingMethod`, trước `initiatePaymentSession`, gọi `POST /store/carts/:id/reserve` (`sdk.client.fetch`, kèm header khách đăng nhập như các bước khác). **Khác plan:** gọi bằng `fetch` thường (`reserveStock`), không qua SDK: `FetchError` của `@medusajs/js-sdk` chỉ giữ `message` và `status`, bỏ body nên không đọc được `code`, `items`. `config.ts` export `backendUrl`.
- [x] Hàm thuần `reserveFailure(error, lines)` trong `src/lib/util/checkout.ts`: đọc `status` và `code` của lỗi; `OUT_OF_STOCK` → `{ reason: "out_of_stock", items: [{ title, requested, available }] }` (tên món lấy từ dòng giỏ theo `variant_id`); `CART_COMPLETED` → `{ reason: "failed" }` kèm hướng dẫn xem đơn; 409 khác hoặc `SLOT_UNAVAILABLE` → `slot_unavailable` như cũ. Bỏ cách coi mọi 409 là khung giờ. **Khác plan:** tên `reserveOutcome(status, body, titleOf)`; khung giờ vẫn nhận ra như cũ vì lỗi của bước khung giờ đến từ SDK, còn bước giữ hàng có kết quả riêng.
- [x] `StartPaymentResult` thêm `items?` cho `out_of_stock`; template hiện thông báo theo Q4 ở khối lỗi giỏ, có liên kết về `/cart`. Hết hàng thì gọi `refresh()` của giỏ để dòng thiếu hiện ngay.
- [x] Test vitest cho `reserveFailure` (đủ các nhánh, món không tìm thấy tên thì dùng "một món trong giỏ").
- [ ] Commit `feat(checkout): reserve stock before paying with VNPAY`.

## Task RF-2: Trang kết quả khi bị hoàn tiền vì hết hàng

**Files:** `src/lib/data/checkout.ts` (`findPaidOrder`, `startPayment`), `src/lib/util/checkout.ts` (+ test), `src/modules/checkout/components/wait-for-order/index.tsx`.

**Hiện tại:** giỏ không thành đơn nên trang chờ 30 giây rồi báo "Thanh toán thành công, đừng thanh toán lại", sai trong trường hợp này.

**Xong khi:** IPN hoàn tiền vì hết hàng thì trang kết quả báo theo Q4 (hoàn được / hoàn lỗi), có nút về giỏ; lần thanh toán lại thành công vẫn ra trang xác nhận đơn.

- [x] `startPayment` ghi thời điểm bấm thanh toán vào cookie ngắn hạn (`_c4f_pay_started`, 30 phút) để phân biệt `stock_failed` của lần này với lần trước. (`setPayStartedAt` trong `cookies.ts`, ghi ngay sau khi giữ hàng được)
- [x] `findPaidOrder` đọc `metadata` của giỏ; trả thêm `stockFailed` khi giỏ chưa hoàn tất và `stock_failed.at` ≥ thời điểm trong cookie. (cho lệch đồng hồ 60 giây; không có cookie, ví dụ trình duyệt khác, thì vẫn tính)
- [x] Hàm thuần `paymentOutcome({ orderId, stockFailed, lineTitles })` → `"order" | "refunded" | "refund_failed" | "waiting"` kèm nội dung hiển thị; test vitest. **Khác plan:** hàm `refundNotice(stockFailed, payStartedAt, amountVnd, titleOf)` trả nội dung banner hoặc null; `findPaidOrder` trả thêm `refund`.
- [x] `WaitForOrder`: gặp `refunded`/`refund_failed` thì dừng chờ, hiện `Banner` (tone `warn` / `err`) và nút "Về giỏ hàng". Không xoá giỏ (khách còn các món khác).
- [ ] Commit `feat(checkout): tell the customer when a paid order was refunded for stock`.

## Task RF-3: Số tồn đã trừ phần người khác đang giữ

**Files:** `src/lib/data/stock.ts` (mới, server action `readStock(variantIds)` gọi API-15 kèm `cart_id` từ cookie giỏ), `src/lib/data/shopping-cart.ts` (thay đọc `inventory_quantity` khi tính `stockQty` dòng giỏ), `src/lib/util/stock.ts` (+ test).

**Xong khi:** một giỏ khác đang giữ 2 trên tồn 5 thì giỏ của mình và trang sản phẩm hiện "Còn 3"; giỏ của mình đang giữ thì các món của mình không bị hiện "Hết hàng"; API-15 lỗi thì vẫn hiện số `inventory_quantity` (Q2).

- [x] `readStock`: chế độ giả trả `{}` (Q1); lỗi mạng trả `{}` (Q2); trả `Record<variant_id, { available, inventoryItemId, heldByCart }>`. **Khác plan:** `src/lib/data/stock.ts` có `fetchLiveStock(variantIds, cartId?)` (dùng ở server) và `readLiveStock(variantIds)` (server action cho trình duyệt, tự lấy giỏ từ cookie).
- [x] Giỏ: `stockQty` lấy từ `readStock`, rơi về `inventory_quantity` khi không có. `outOfStockCount` và dòng "vừa hết hàng" dùng số mới.
- [x] Trang chi tiết sản phẩm: số ban đầu vẫn render từ `inventory_quantity` ở server; RF-4 thay bằng số của API-15 ngay khi trang chạy ở trình duyệt.
- [x] Hàm thuần `mergeStock(fallback, api)` và test. (cùng `toLiveStock`)
- [ ] Commit `feat(stock): show stock net of other customers' holds`.

## Task RF-4: Tồn cập nhật trực tiếp (Socket.io)

**Files:** `package.json` (`socket.io-client` 4.8.1, ghim), `.env.template` (`NEXT_PUBLIC_REALTIME_URL=http://localhost:4001`), `src/lib/realtime/socket.ts` (một kết nối dùng chung, chỉ mở ở trình duyệt), `src/lib/hooks/use-live-stock.ts`, `src/lib/util/live-stock.ts` (+ test), `src/modules/products/components/product-actions/index.tsx`, `src/modules/cart/components/item/index.tsx`.

**Xong khi:** mở trang sản phẩm ở hai trình duyệt; bên kia giữ hàng (đặt hàng tới bước VNPAY) thì bên này đổi "Còn N" trong khoảng một giây mà không tải lại; tắt gateway thì trang vẫn chạy với số cũ, bật lại thì số đúng lại.

- [x] `socket.ts`: `io(NEXT_PUBLIC_REALTIME_URL, { transports: ["websocket"] })` mở lần đầu cần dùng; không có biến hoặc chế độ giả thì không mở (Q1). Thêm đếm số người theo dõi mỗi món: món chỉ được `unsubscribe` khi người cuối rời đi, và mọi món được `subscribe` lại sau khi kết nối lại (`watchStock`).
- [x] `useLiveStock(variantIds, initial)`: gọi `readStock` (RF-3) lấy số và `inventory_item_id`, `subscribe` các item, cập nhật khi có `stock:update` (số chung + `heldByCart`); `connect` lại thì gọi lại `readStock`; unmount thì `unsubscribe`. **Khác plan:** `useLiveStock(variantIds)` không cần `initial`: chưa có số thì component dùng số đã render.
- [x] Hàm thuần `applyUpdate(state, update)` (ánh xạ item → biến thể, cộng `heldByCart`, không âm) và test. (tên `applyStockUpdate`, trong `src/lib/util/stock.ts`)
- [x] `ProductActions` và dòng giỏ truyền số của hook vào `LiveStock`; nút "Thêm vào giỏ" tắt khi số mới bằng 0. Giỏ gọi hook một lần cho cả trang (`cart/templates`), truyền `liveQty` xuống từng dòng.
- [x] Ghi `NEXT_PUBLIC_REALTIME_URL` vào README của storefront. (README thêm mục "Chạy với backend thật"; `.env.template` có biến này)
- [ ] Commit `feat(stock): live stock updates over socket.io`.

## Task RF-5: Kiểm tay và bàn giao

- [ ] Chạy đủ: backend (`npm run backend:dev`), gateway (`npm run gateway:dev`), storefront (`yarn dev`) với `NEXT_PUBLIC_UI_MOCK=false`.
- [ ] Kịch bản trên trình duyệt (dùng `khachmoi@com4fud.demo` và một khách vãng lai):
  1. Hai giỏ tranh món còn 1: giỏ thứ hai bị chặn ở "Đặt hàng" với đúng tên món (RF-1).
  2. Giỏ thứ nhất huỷ trên VNPAY: giỏ thứ hai đặt được (RF-1, hàng trả về).
  3. Trang sản phẩm mở ở trình duyệt khác thấy số đổi theo (RF-4).
  4. Hoàn tiền vì hết hàng: VNPAY chỉ giả lập, kiểm bằng test của backend và bằng cách gọi IPN giả lập ký khóa thử như bộ kiểm cũ của Thiện (RF-2).
- [ ] `yarn test`, `yarn lint`, `npx tsc --noEmit`, `yarn build` sạch.
- [ ] Cập nhật: bảng mục 0, plan FE `2026-10-18` (đóng câu 14 của mục 2b, thêm dòng nhật ký), plan hot-stock (RB-1, RB-2), `docs/known-risks.md` (R6 đóng khi RF-3, RF-4 xong), nhật ký `log-teammate`.
- [ ] Commit tài liệu, push cả hai repo, báo Thiện.

## Sau plan này

- **AI-0** (backend, plan `2026-10-18-sync-ui-v2-backend.md` của repo backend): chuẩn bị nối 2 AI service (`AI_SERVICE_URL` cổng 8100, hàm gọi AI có timeout và dự phòng, `product_id` = `catalog_id`, hướng dẫn cho người nối). Nhóm chốt 2026-11-05: làm storefront (plan này) trước, AI-0 sau.

## 4. Rủi ro và câu hỏi mở

- **VNPAY vẫn giả lập** (R4, R5 ở backend): RF-2 chỉ kiểm được bằng IPN giả lập.
- **Danh sách sản phẩm** vẫn theo chỉ mục tìm kiếm (mục 1); nếu nhóm muốn cả danh sách trừ phần đang giữ thì cần task riêng ở backend (đưa số Redis vào chỉ mục hoặc API-15 theo trang).
- **Nhiều tab cùng giỏ:** tab sau bấm thanh toán thì phiên VNPAY của tab trước bị xoá (R1 ở backend), chưa xử lý.
- **Thiện đang làm cùng nhánh:** chia việc theo file để tránh xung đột; RF-1, RF-2 đụng code thanh toán của Thiện.

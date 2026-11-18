# Spec: gợi ý món ăn ở storefront (A, B, C)

Ngày: 2026-11-11. Trạng thái: **đã code A, B, C** (2026-11-13, nhánh `feature/recipe-suggest` ở cả 3 repo, xem mục 13). Phạm vi: 3 repo (ai, backend, frontend).

| Mã | Tên hiển thị | Ở đâu | Ý chính |
| :-- | :-- | :-- | :-- |
| **A** | Thử món mới? | Trang chủ, `/mua-lai`, giỏ hàng | Chọn sẵn 1 món có nguyên liệu khách ít hoặc chưa từng mua |
| **B** | Mình thấy bạn có … trong giỏ, bạn muốn thử nấu … | Trang chủ (khi giỏ có hàng), giỏ hàng | Từ các sản phẩm đang trong giỏ, gợi ý top 3 món dùng chúng |
| **C** | Món nấu với sản phẩm này | Trang sản phẩm | Từ một sản phẩm, gợi ý tối đa 3 món dùng nó. Thay khối "Món ngon với …" đang là "Sắp ra mắt" |

Đây là bước 5 của [kế hoạch trùng tu](2026-11-11-storefront-ux-rework.md) (phần liên kết "Món nấu với sản phẩm này") được làm đầy đủ.

## 1. Nguyên tắc

1. **Không có mô hình ngôn ngữ, không embedding.** Xếp hạng bằng luật trên dữ liệu công thức đã ghép với catalog. Mỗi dòng giải thích được khi bảo vệ.
2. **Storefront không gọi AI service trực tiếp.** Đường đi: storefront → backend `/store/ai/suggest/*` → AI service. Giống `/store/ai/search`.
3. **AI service lỗi thì ẩn khối**, không có nội dung dự phòng (cùng cách với khối "Mua lại").
4. **Chỉ gợi ý món mua được ngay**: mọi nguyên liệu chính còn thiếu phải có biến thể đã mở bán và còn hàng. Ngược lại món bị loại, không hiện "hết hàng".
5. Mọi con số bên dưới (ngưỡng, số lượng gợi ý) là **giá trị khởi đầu cần chỉnh sau khi xem kết quả thật**. Tác động lên doanh thu là giả thuyết cần đo (mục 9), không phải kết quả.

## 2. Dữ liệu nền (đo ngày 2026-11-11 trên `ai_db` và `recipes_matched_v2.json`)

- 1.061 món trong `recipe_basket`, tất cả `complete`; 100 món thuộc `in_target_set` (đã được kiểm kỹ nhất). 107 họ món (`family`).
- Mỗi món có trung bình khoảng 6,6 nguyên liệu `core` đã ghép `catalog_id`. Trung vị 6, lớn nhất 15, **24 món có không quá 2 nguyên liệu core** (quá ngắn để gợi ý).
- 672 sản phẩm xuất hiện ở ít nhất một món. **21 sản phẩm có mặt ở ≥ 5% số món, 5 sản phẩm ở ≥ 15%** (hành tây 268 món, ớt sừng 256, cà rốt 242, ớt hiểm 183, cà chua 163). **213 sản phẩm chỉ xuất hiện ở đúng 1 món.**
- `catalog_product`: 2.129 sản phẩm, **373 sản phẩm `needs_review = true`** (tên, đơn vị tạm thời).
- `catalog_id` là SKU của biến thể trong Medusa, nên nối được giỏ, lịch sử mua và công thức mà không cần bảng ánh xạ.
- `RecipeService` đã giữ toàn bộ món và catalog trong bộ nhớ lúc khởi động. Hai chỉ mục mới cũng dựng ở đó, không cần SQL lúc chạy.
- Ảnh món: cột `image_url` có đủ nhưng host `monngonmoingay.com` **chưa nằm trong `remotePatterns`** và nhóm đang làm PR ảnh món riêng. Bản đầu của thẻ gợi ý dùng **dải ảnh nguyên liệu** (ảnh sản phẩm đã có); khi có ảnh món thì thêm ảnh món làm ảnh chính.

## 3. AI service (`grocery-store-ai`)

File mới: `src/services/suggest_service.py`, `src/api/v1/suggest.py`, `tests/test_suggest.py`. Gắn router vào app `chef` và `main`. Thay đổi nhỏ: `RecipeService` đọc thêm cột `needs_review` của `catalog_product`.

### 3.1 Chỉ mục dựng lúc khởi động (từ `RecipeService.recipes` và `catalog`)

- `core_of[recipe_id]`: tập `catalog_id` của các dòng `kind = core`, `status = da_ghep`.
- `recipes_of[catalog_id]`: tập món có sản phẩm đó là core. `df[catalog_id] = len(recipes_of[...])`.
- `N` = số món đủ điều kiện (bên dưới).
- **Món đủ điều kiện (`eligible`)**: `complete`, 3 ≤ `len(core_of)` ≤ 12, và **không** có sản phẩm core nào `needs_review` hoặc đã mất khỏi catalog.
- **Sản phẩm "đồ nền"** (`df ≥ 15% × N`): hành tây, ớt, cà rốt… Trọng số 0 khi tính điểm B, vì chúng khớp với hầu hết món và không nói lên khách muốn nấu gì.
- Trọng số `w(p) = ln(N / df(p))` cho sản phẩm còn lại; `w = 0` với đồ nền.

### 3.2 `POST /api/v1/suggest/by-products` (dùng cho B và C)

Request:

```json
{ "catalog_ids": ["CAT-000123", "CAT-000456"], "mode": "cart", "limit": 9,
  "have": ["CAT-000123", "CAT-000456"], "exclude_ids": [] }
```

- `mode = "cart"` (B): xem mục 4.2. `mode = "product"` (C): xem mục 6.2.
- `limit` 1–12. `have` đưa vào `build_basket` (đã có sẵn) để `basket.buy` chỉ còn phần còn thiếu.
- Mỗi kết quả: `recipe` (RecipeInfo), `matched` (các `catalog_id` đầu vào có trong món, kèm tên), `missing_count = len(basket.buy)`, `basket` (giỏ hai phần như `/search`).
- **Không trả hai món cùng `family`** trong một danh sách (để top 3 khác nhau).

### 3.3 `POST /api/v1/suggest/discover` (dùng cho A)

Request: `{ "bought_catalog_ids": [...], "have": [...], "seed": "cus_01...:2026-11-11", "limit": 10, "exclude_ids": [] }`.
Xem mục 5.2. Mỗi kết quả thêm `new_count`, `familiar_count`.

### 3.4 Kiểm thử (pytest, dữ liệu mẫu nhỏ trong test)

- Đồ nền không đẩy món lên hạng.
- Giỏ 1 sản phẩm chỉ có ở 1 món trả đúng món đó.
- Không có hai món cùng `family`; món `needs_review`, món ngắn (< 3 core) không bao giờ xuất hiện.
- `seed` giống nhau cho cùng kết quả, `seed` khác cho kết quả khác; `exclude_ids` được tôn trọng.
- Khách chưa có lịch sử chỉ nhận món thuộc `in_target_set`.

## 4. Tính năng B: "Mình thấy bạn có … trong giỏ"

### 4.1 Hành vi

- Hiện khi giỏ có ít nhất 1 sản phẩm không phải đồ nền và có ít nhất 1 món để gợi ý. Nếu không, **ẩn hẳn**.
- Câu dẫn: "Mình thấy bạn có **{tên 1}**, **{tên 2}** trong giỏ. Bạn muốn thử nấu…" (tối đa 2 tên có `w` cao nhất; thêm "và N món khác" nếu nhiều hơn). Tên rút gọn về tên nguyên liệu, không phải tên đầy đủ có quy cách.
- Tối đa 3 thẻ món. Mỗi thẻ: dải ảnh nguyên liệu, tên món, số người và thời gian, dòng "Cần thêm N nguyên liệu · +xxx.xxxđ", hai nút: **Thêm N món còn thiếu** (một bấm) và **Xem công thức** (mở `/tro-ly-bep/<id>`).
- Nút "Thêm" chỉ thêm `basket.buy` (phần còn thiếu), qua `addRecipeLines` sẵn có. Xong thì giỏ cập nhật và khối tính lại (món vừa đủ nguyên liệu sẽ đổi nhãn thành "Đã đủ nguyên liệu").

### 4.2 Xếp hạng (`mode = "cart"`)

Với giỏ `I` (tập `catalog_id`) và mỗi món đủ điều kiện `R` có `S = core_of[R]`:

```
matched   = I ∩ S
bỏ nếu    Σ w(p) trên matched = 0            (chỉ khớp đồ nền)
điểm      = Σ w(p) trên matched / Σ w(p) trên S
```

Sắp theo `điểm` giảm dần, hòa thì `|S \ I|` (số nguyên liệu thiếu) tăng dần, rồi `in_target_set` trước, rồi `id`. Lấy lần lượt, bỏ món trùng `family` với món đã lấy, cho đến đủ `limit`.
Ý nghĩa: ưu tiên món mà giỏ hiện tại đã phủ phần lớn phần "đặc trưng", ít phải mua thêm.

### 4.3 Backend lọc tồn kho

Xin AI `limit = 9`, gắn biến thể và tồn kho (mục 7), **bỏ món có nguyên liệu `buy` hết hàng hoặc chưa mở bán**, giữ 3 món đầu. Nếu không còn món nào thì trả `status: "empty"`.

### 4.4 Làm mới khi giỏ đổi

Client tính **chữ ký giỏ** (danh sách SKU đã sắp xếp). Chỉ gọi lại khi chữ ký đổi, trễ 500 ms, hủy yêu cầu cũ. Đổi số lượng không đổi chữ ký nên không gọi lại.

## 5. Tính năng A: "Thử món mới?"

### 5.1 Hành vi

- Một thẻ lớn: tên món, dải ảnh nguyên liệu, mô tả ngắn, "**N nguyên liệu mới** bạn chưa mua · M nguyên liệu bạn đã quen", tổng tiền nếu thêm hết.
- Nút: **Thêm cả giỏ nguyên liệu** (một bấm), **Xem công thức**, **Đổi món khác**.
- "Đổi món khác" gọi lại với `exclude_ids` là các món đã hiện trong phiên (lưu ở state client). Hết món thì ẩn nút.
- **Cùng một khách, cùng một ngày, thấy cùng một món** (seed cố định, mục 5.2) để trang không đổi món mỗi lần tải lại.
- Khối **không dùng lời hứa về tác động**. Câu chữ nêu lý do chọn ("có cải thìa, bạn chưa mua bao giờ"), không nêu số liệu.

### 5.2 Chọn món

Đầu vào: tập đã mua `B` (SKU trong các đơn đã giao, lấy từ `loadReorderData`, cần thêm trường `sku`), `have` (SKU trong giỏ), `seed`.

1. `pool` = món đủ điều kiện, loại món có `core ⊆ have`, loại `exclude_ids`.
2. **Khách có lịch sử** (có đơn đã giao): với mỗi món tính `new = |S \ B|`, `familiar = |S ∩ B|`.
   - Bậc 1: `2 ≤ new ≤ 4` và `1 ≤ familiar ≤ 2`.
   - Bậc 2 (nếu bậc 1 rỗng): `1 ≤ new ≤ 6`.
   - Bậc 3 (nếu vẫn rỗng): toàn `pool`.
3. **Khách chưa có lịch sử** (chưa đăng nhập hoặc chưa có đơn): chỉ lấy món `in_target_set`.
4. Trong bậc được chọn, sắp theo `sha1(seed + ":" + recipe_id)` và lấy `limit` món đầu, bỏ món trùng `family`.
5. `seed = (customer_id hoặc "guest") + ":" + ngày theo giờ Việt Nam`.

Lý do chọn khoảng "2–4 mới, 1–2 quen": món toàn nguyên liệu lạ làm khách ngại mua (rào cản lớn), còn món quen quá thì không mở rộng giỏ. Hai con số là điểm khởi đầu, chỉnh sau khi xem kết quả.

### 5.3 Backend

Lọc tồn kho như mục 4.3 (xin 10, giữ 1; mỗi lần "Đổi món khác" xin lại với `exclude_ids`).

## 6. Tính năng C: "Món nấu với sản phẩm này"

### 6.1 Hành vi

- Trên trang sản phẩm, thay khối "Món ngon với … Sắp ra mắt" bằng một hàng tối đa 3 thẻ món (cùng thẻ với A, B), tiêu đề "Món nấu với {tên sản phẩm}".
- Sản phẩm **không có món nào** (nước ngọt, bánh kẹo…): **ẩn khối**, không để chỗ trống.
- Nút "Thêm" trong thẻ chỉ thêm phần còn thiếu. Sản phẩm đang xem **không** tự thêm (khách có thể đã bỏ vào giỏ hoặc chưa).
- Trang sản phẩm là trang tĩnh dựng sẵn, nên khối tải **ở client qua server action**, có khung giữ chỗ cố định chiều cao để không giật bố cục, và không làm chậm phần còn lại của trang.

### 6.2 Xếp hạng (`mode = "product"`)

Đầu vào: tất cả SKU của sản phẩm (mọi biến thể). Với sản phẩm là "đồ nền" vẫn phải có kết quả, nên ở chế độ này **không dùng trọng số**:

1. Món có sản phẩm là core. Bỏ món không đủ điều kiện.
2. Sắp theo: sản phẩm nằm trong **2 nguyên liệu core đầu** của món (nguyên liệu chính, theo thứ tự công thức) trước; rồi `|S|` tăng dần (món gọn); rồi `in_target_set`; rồi `id`.
3. Bỏ món trùng `family`, lấy `limit`.

Không dùng giỏ hiện tại ở C (ngoài phạm vi, xem mục 10).

## 7. Backend (`grocery-store-backend`)

### 7.1 Hợp đồng Store

```
POST /store/ai/suggest/by-products   body: { catalog_ids: string[≤30], mode: "cart"|"product", limit?: 1–3, exclude_ids?: string[] }
POST /store/ai/suggest/discover      body: { exclude_ids?: string[], have?: string[] }   // khách lấy từ phiên, cho phép chưa đăng nhập
```

Cả hai đều trả:

```json
{
  "status": "ready",
  "suggestions": [{
    "recipe": { "id": "canh-chua-ca-loc", "name": "...", "servings": 4, "time_minutes": 35, "image_url": null },
    "reason": { "matched": [{ "catalog_id": "CAT-000123", "name": "Cá lóc" }], "new_count": 3, "familiar_count": 1 },
    "missing_count": 4,
    "missing_total": 96500,
    "basket": { "buy": [ /* StoreBasketItem, mỗi dòng có variant */ ], "maybe_have": [] }
  }]
}
```

`reason.new_count` / `familiar_count` chỉ có ở `discover`; `reason.matched` chỉ có ở `by-products`. `status: "empty"` khi không còn món nào sau khi lọc. AI service lỗi: 503 `AI_UNAVAILABLE` (như các route AI khác). Cần cập nhật `docs/contracts/ai-copilot.md` (storefront ↔ backend) và `ai-service.md` (backend ↔ AI) khi làm.

### 7.2 Workflow

- `ai-suggest-by-products`: gọi AI → `loadVariantRowsStep` (có sẵn trong `ai-recipe-search`) → `getVariantStockWorkflow` → `attachBasket` (có sẵn) → lọc món mà mọi dòng `buy` có `variant.purchasable` → tính `missing_total` → cắt top.
- `ai-suggest-discover`: như trên, thêm bước đọc `purchased` SKU của khách (nếu có) từ `loadReorderData`. `loadReorderData` cần lấy thêm `sku` ở `product_variant`.
- `lib/ai/client.ts`: thêm `suggestByProducts`, `suggestDiscover`, biến môi trường `AI_SUGGEST_TIMEOUT_MS` (mặc định 2000).
- `StoreVariantInfo`: thêm `thumbnail` để thẻ vẽ dải ảnh nguyên liệu.
- Middleware: validate body (zod, như `validators.ts` các route AI). `discover` cho phép không đăng nhập (`allowUnauthenticated`).

### 7.3 Kiểm thử

Test đơn vị cho hàm lọc tồn kho và tính `missing_total` (hàm thuần, như `attach-variants.unit.spec.ts`); test tích hợp một route với AI service giả.

## 8. Frontend (`grocery-store-frontend`)

### 8.1 File

- `src/lib/data/suggest-recipes.ts` (`"use server"`): `getRecipesForCart()`, `getRecipeToTry(excludeIds)`, `getRecipesForProduct(handle)`. Đọc giỏ bằng `retrieveCart` để lấy SKU. Mock mode trả rỗng.
- `src/lib/util/suggest.ts` (thuần, có test): `cartSignature(skus)`, `intro(matchedNames)` (câu dẫn), `formatMissing(count, total)`.
- `src/modules/suggestions/`: `recipe-card.tsx` (thẻ chung), `cart-recipes.tsx` (B), `try-new-recipe.tsx` (A), `product-recipes.tsx` (C). Các khối là client component, tải qua server action, có khung giữ chỗ và `aria-live` khi đổi.
- Nút "Thêm": `addRecipeLines` (có sẵn trong `lib/data/kitchen.ts`), sau đó `useCart().refresh()`.

### 8.2 Vị trí và trạng thái từng trang

| Trang | Thứ tự khối | Khi nào ẩn |
| :-- | :-- | :-- |
| Trang chủ | … Mua lại → **B** (dải mỏng, chỉ khi giỏ có hàng) → **A** (nằm trong khối "Hôm nay nấu gì?", thẻ A ở trên, ô tìm món và các món gợi ý ở dưới) → các dãy danh mục | B: giỏ rỗng hoặc không có kết quả. A: AI lỗi hoặc không còn món |
| `/mua-lai` | Danh sách mua lại → **A** | A: như trên |
| Giỏ hàng | Danh sách sản phẩm → **B** → **A** | Giỏ rỗng: chỉ A. B ẩn nếu không có kết quả |
| Trang sản phẩm | Thông tin → Thường mua kèm → **C** | Sản phẩm không có món |

Khách chưa đăng nhập: A vẫn hiện (chọn từ 100 món `in_target_set`), B và C không phụ thuộc đăng nhập. Điện thoại: B là hàng cuộn ngang, A là một thẻ rộng hết chiều ngang.

### 8.3 Truy cập

Nút có nhãn rõ ("Thêm 4 nguyên liệu còn thiếu cho Canh chua cá lóc"); câu dẫn là văn bản thật, không nằm trong ảnh; thẻ có thể dùng bàn phím; nội dung đổi khi giỏ thay đổi được thông báo bằng `aria-live="polite"`.

## 9. Kiểm chứng và đo

**Kiểm bằng dữ liệu thật trước khi làm giao diện** (script, báo cáo kết quả, không đoán):

1. Với 20 giỏ mẫu (1, 2, 3, 5 sản phẩm; có và không có đồ nền), B trả gì? Có món nào vô lý không (ví dụ chỉ có hành tây mà ra món nặng)?
2. Tỉ lệ món qua bộ lọc tồn kho (`purchasable`) trên dữ liệu seed hiện có. Nếu quá thấp thì cần nới (cho phép thay bằng `alternatives`) trước khi làm tiếp.
3. Với tài khoản demo có lịch sử, A rơi vào bậc 1, 2 hay 3? Phân bố `new_count`.
4. Độ trễ cả đường đi (storefront → backend → AI → lọc tồn). Mục tiêu khởi đầu < 500 ms ở lần gọi nóng; **đây là mục tiêu cần đo**, chưa phải kết quả.

**Nghiệm thu giao diện**: mỗi trang ở bảng 8.2 chụp 1440px và 500px; tắt AI service thì khối ẩn mà trang vẫn đủ; giỏ đổi thì B đổi theo; bấm "Thêm" thì giỏ ở header đổi đúng; mock mode không lỗi.

**Đo tác động (tuỳ chọn, ngoài MVP)**: khi thêm từ khối, gắn `metadata.suggest_source = "A" | "B" | "C"` vào dòng giỏ (`addLine` hiện chỉ gắn `price_at_add` vào `metadata`, cần mở rộng để nhận thêm trường). Sau đó so tỉ lệ đơn có dòng gắn nhãn và số nhóm hàng trên mỗi đơn. Con số "tăng doanh thu" chỉ được nêu trong báo cáo sau khi có đo thật.

## 10. Ngoài phạm vi (bản này)

- Lời giải thích sinh bởi mô hình ngôn ngữ; học xếp hạng từ hành vi; theo dõi món đã nấu.
- C dùng giỏ hiện tại để thiên vị kết quả; thay nguyên liệu hết hàng bằng `alternatives`.
- Loại nguyên liệu khách có sẵn trong tủ bếp (chỉ dùng giỏ hiện tại và lịch sử mua).
- Ảnh món (chờ PR ảnh món); khi có thì thêm vào thẻ và thêm host vào `remotePatterns`.

## 11. Thứ tự làm, tách PR

| Bước | Repo | Nội dung | Ước lượng thô |
| :-- | :-- | :-- | :-- |
| 0 | ai | Script đo mục 9 (1–4) để chốt ngưỡng | 0,5 ngày |
| 1 | ai | `suggest_service` + `/suggest/by-products` + test | 1 ngày |
| 2 | backend | `ai-suggest-by-products` + route + test + cập nhật hợp đồng | 0,5–1 ngày |
| 3 | frontend | Thẻ chung + **C** (trang sản phẩm) + **B** (giỏ, trang chủ) | 1 ngày |
| 4 | ai, backend | `/suggest/discover` + workflow (đọc lịch sử mua) | 1 ngày |
| 5 | frontend | **A** (trang chủ, `/mua-lai`, giỏ) | 0,5–1 ngày |

Làm theo thứ tự này để C và B có thể demo sau bước 3, trước khi đụng tới lịch sử mua của A. Ước lượng là thô, chưa tính thời gian xem xét PR hay sửa dữ liệu.

## 12. Việc chưa chốt

1. Có cho phép thay nguyên liệu hết hàng bằng `alternatives` không (làm tăng số món hiển thị, nhưng phức tạp hơn)? Quyết định sau khi có số đo ở mục 9 (2).
2. Tên rút gọn của sản phẩm trong câu dẫn B ("Cá lóc" thay vì "Cá lóc phi lê 500g"): lấy từ tên nguyên liệu của công thức (`ingredient`) hay tự rút gọn tên sản phẩm? Đề xuất: lấy `ingredient` của công thức.
3. Có báo cho thầy về việc thêm tính năng ngoài 4 tính năng trong proposal không. Hai tính năng này thuộc nhóm Chef Copilot nhưng không dùng RAG.

## 13. Trạng thái (2026-11-13)

Đã làm ở cả 3 repo, nhánh `feature/recipe-suggest`, chưa push.

| Phần | Kết quả | Đã kiểm |
| :-- | :-- | :-- |
| AI `SuggestService` + `/suggest/by-products`, `/suggest/discover` | Như mục 3–6 | `pytest` 111 xanh (12 test mới cho luật xếp hạng) |
| Backend `/store/ai/suggest/by-products`, `/store/ai/suggest/discover` | Như mục 7; thêm `thumbnail` vào `StoreVariantInfo` | `jest` đơn vị xanh, `tsc` sạch. Chưa có test tích hợp route |
| Storefront C (trang sản phẩm), B (giỏ, trang chủ), A (trang chủ, `/mua-lai`, giỏ) | Như mục 8 | Edge, bản build, backend + AI thật: xem dưới |

Kiểm trên trình duyệt: C hiện 3 món và tiêu đề dùng tên nguyên liệu ("Món nấu với nước mắm ngon"); sản phẩm không có món thì khối biến mất, không để chỗ trống; "Thêm" chỉ thêm phần còn thiếu. B hiện câu dẫn và 3 món ở giỏ và trang chủ. A: cùng món sau khi tải lại, "Đổi món khác" ra món khác, "Thêm cả giỏ" chạy. Tắt AI service: trang sản phẩm, giỏ, trang chủ vẫn đủ, các khối ẩn, không lỗi. Không cuộn ngang ở 500px.

**Khác spec:**

- **Không loại món có sản phẩm `needs_review`** (mục 3.1). Đo trên dữ liệu thật: loại thì chỉ còn 158/1.061 món đủ điều kiện, A cho khách mới chỉ còn 42 món; bỏ điều kiện thì 1.025 món. `/search` vốn đã hiện các sản phẩm này. Có cờ `skip_needs_review` để bật lại.
- Backend gửi chính các sản phẩm đầu vào làm `have` (B, C), nếu không thì món bị loại vì dòng của sản phẩm đang trong giỏ bị tính là "đang giữ, hết hàng".
- `missing_total` tính theo số gói như nút "Thêm" (`pack_hint`), không theo `default_qty`, để số tiền trên thẻ khớp giỏ.

**Chưa làm hoặc chưa kiểm:**

- A với khách có lịch sử (bậc 1, 2, 3): cần đăng nhập tài khoản demo có đơn đã giao. Chỉ có số đo giả lập (200 khách mua 40 sản phẩm ngẫu nhiên: cả 200 rơi vào bậc 1, món đầu trung bình 3,3 nguyên liệu mới).
- Mục 9: tỉ lệ món qua bộ lọc tồn kho và độ trễ cả đường đi chưa đo có hệ thống. Thấy trong log: backend trả `/suggest/by-products` trong 15–600 ms; **chưa phải số đo**.
- Đo tác động (`metadata.suggest_source`) chưa làm, ngoài MVP.


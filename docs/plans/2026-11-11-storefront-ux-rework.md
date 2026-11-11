# Kế hoạch trùng tu UX storefront (2026-11-11)

Nhánh: `fix/ai-chef-hardening` (đã merge `dev` có ảnh sản phẩm). Trạng thái: **chờ duyệt**, chưa code.

## 1. Mục tiêu

Giữ nguyên màu, font và tinh thần thương hiệu hiện tại. Đổi bố cục và luồng thao tác để:

1. Khách nhìn thấy nhiều sản phẩm hơn trên một màn hình và muốn mua (thẻ sản phẩm, lưới).
2. Từ bất kỳ danh sách nào, khách thêm vào giỏ và đổi số lượng mà không rời trang.
3. Mỗi đích đến chỉ có một lối vào; bỏ nút và khối không có chức năng.
4. Ô tìm kiếm trả về đúng thứ khách gõ (sản phẩm và món ăn).

Không làm: đổi bảng màu hay font, đổi backend, đổi luồng thanh toán, trang tài khoản.

## 2. Hiện trạng (chụp màn hình 2026-11-11, desktop 1440px, backend thật)

| Chỗ | Quan sát |
| :--- | :--- |
| Trang danh mục | 3 thẻ mỗi hàng, 9 món mỗi trang (`PAGE_SIZE = 9`), danh mục Rau củ có 24 trang. Cột lọc bên trái chiếm khoảng 20% chiều ngang. |
| Thẻ sản phẩm | Ảnh tỉ lệ 1.28 bị cắt (`object-cover`) nên bao bì mất chữ. Giá cỡ 16px, nhỏ hơn tên. Bấm "+" xong không đổi được số lượng trên thẻ. Không có giá theo kg, không báo sắp hết. |
| Header | Hai nút "Trợ lý Bếp" cạnh nhau (trong ô tìm và trên thanh danh mục). Thanh trên cùng lặp nội dung ô "Giao đến". Thanh danh mục chỉ có 7 trong 11 danh mục. Điện thoại có nút "Thông báo" chưa có chức năng. |
| Tìm kiếm | Placeholder gợi ý "canh chua" (món ăn) nhưng ô chỉ tìm sản phẩm. Không có gợi ý khi gõ. Trang kết quả ghi "2126 MÓN" phía trên tiêu đề dù chỉ có 1 kết quả. |
| Trang chủ | Banner lớn quảng cáo một gói xúc xích 12.700đ, không có ảnh. Sau đó chỉ có 8 ô danh mục và 4 món ưu đãi rồi hết trang. Không có lối vào Trợ lý Bếp ở thân trang. |
| Trang sản phẩm | "Tem cân" đè lên ảnh và lặp lại giá. Ba tab, tab Mô tả chỉ lặp tên sản phẩm. Banner "Đang trong quá trình phát triển". Dưới nút mua là khoảng trống, không có sản phẩm liên quan. |
| Trang công thức | Tên nguyên liệu quá nhỏ. Hàng thưa nên bảng 16 dòng dài hơn hai màn hình. Ô hỏi thêm nằm cuối trang. |

## 3. Thiết kế

### 3.1 Thẻ sản phẩm (`modules/products/components/product-card`)

- Ảnh vuông, nền trắng, `object-contain` (thấy trọn bao bì). Sản phẩm chưa có ảnh vẫn dùng hình minh họa hiện có.
- Thứ tự thông tin: ảnh → giá (20px, đậm; giá cũ gạch bên cạnh) → tên (2 dòng) → quy cách và giá quy đổi (`22.000đ/kg`, dùng `pricePerKg` sẵn có).
- Nhãn góc ảnh: `−20%` khi giảm giá, `Còn 3` khi tồn từ 1 tới 5, `Hết hàng` phủ mờ.
- Nút "+": bấm xong đổi thành bộ `− 1 +` ngay trên thẻ, đọc số lượng từ giỏ (`useCart().view`), giảm về 0 thì xóa dòng. Dùng `setQuantity` / `remove` sẵn có của `CartContext`.
- Cả thẻ vẫn là liên kết tới trang sản phẩm; bộ số lượng nằm trên lớp liên kết như nút "+" hiện tại.

### 3.2 Trang danh sách (`modules/store/templates`)

- Lưới 5 cột từ 1280px, 4 cột từ 1024px, 3 cột máy tính bảng, 2 cột điện thoại. `PAGE_SIZE` 9 → 20 (chia hết cho 2, 4, 5).
- Bỏ cột lọc bên trái. Thay bằng một hàng phía trên lưới: chip danh mục (cuộn ngang), hai công tắc "Còn hàng" / "Đang giảm giá", ô sắp xếp. Bộ lọc vẫn nằm trong URL như hiện tại.
- Sửa dòng đếm: kết quả tìm kiếm ghi số kết quả, không ghi tổng catalog.
- Kết quả tìm rỗng hoặc ít: thêm dòng "Tìm món ăn với “…” ở Trợ lý Bếp".

### 3.3 Header (`modules/layout`)

- Bỏ `UtilityBar`; số tổng đài đã có ở footer.
- Một nút Trợ lý Bếp duy nhất (trên thanh danh mục). Bỏ nút trong ô tìm kiếm.
- Thanh danh mục hiện đủ 11 danh mục, cuộn ngang khi hẹp.
- Điện thoại: bỏ nút "Thông báo".
- Ô tìm kiếm có gợi ý khi gõ (từ 2 ký tự, trễ 250ms): tối đa 5 sản phẩm (ảnh nhỏ, giá, nút "+") và 3 món ăn (mở thẳng trang công thức). Enter vẫn tới `/store?q=`. Không có JavaScript thì form vẫn chạy như cũ. Nguồn: `POST /store/search` và `/store/ai/search` (`include_basket: false`) đã có; AI service lỗi thì chỉ hiện phần sản phẩm.
- Placeholder đổi thành thứ ô này tìm được: `Tìm sản phẩm hoặc món ăn…`.

### 3.4 Trang chủ (`modules/home`)

- Banner thấp hơn (khoảng 200px), nội dung chung ("Đi chợ online, giao trong ngày") thay vì một sản phẩm; ô "Chọn khung giờ" giữ lại.
- Thứ tự khối: banner → danh mục (một hàng) → Mua lại (khách đã đăng nhập) → Ưu đãi hôm nay (một hàng 5 thẻ, cuộn ngang trên điện thoại) → "Hôm nay nấu gì?" (ô tìm món và 6 món gợi ý dẫn tới Trợ lý Bếp) → hai dãy theo danh mục (Rau củ, Thịt và Hải sản), mỗi dãy 5 thẻ và liên kết "Xem tất cả".
- Dữ liệu dãy danh mục: `getListing` sẵn có với `pageSize: 5`.

### 3.5 Trang sản phẩm (`modules/products`)

- Bỏ `ScaleLabel` (tem cân) khỏi ảnh; giá quy đổi theo kg vẫn nằm cạnh giá.
- Bỏ khối tab. Chỉ hiện phần nào có nội dung thật, dạng đoạn văn dưới ảnh.
- Thay banner "Đang trong quá trình phát triển" bằng liên kết "Món nấu với sản phẩm này" tới `/tro-ly-bep?q=<tên ngắn>`.
- Thêm dãy "Cùng danh mục" (5 thẻ).
- Điện thoại: thanh "Thêm vào giỏ" dính đáy màn hình.

### 3.6 Trang công thức (`modules/kitchen`)

- Tên nguyên liệu 15px đậm; mỗi nguyên liệu một hàng gọn (tick, tên và lượng, sản phẩm, giá).
- Khung tạm tính và nút thêm vào giỏ dính theo khi cuộn (desktop: cột phải; điện thoại: thanh đáy).
- Khối "Hỏi thêm" chuyển lên cột phải, dưới các bước nấu.
- Ảnh món: chờ PR ảnh món của nhóm; bố cục chừa sẵn chỗ.

## 4. Thứ tự làm và cách kiểm

Mỗi bước là vài commit nhỏ. Sau mỗi bước: `tsc`, lint, `vitest`, rồi chụp lại màn hình (Edge headless, 1440px và 500px) để so với ảnh hiện trạng.

| Bước | Nội dung | Kiểm |
| :--- | :--- | :--- |
| 1 | Thẻ sản phẩm (3.1), có test cho phần tính nhãn và giá quy đổi | Thẻ hiện đúng ở trang chủ, danh mục, tìm kiếm; thêm rồi đổi số lượng trên thẻ, giỏ ở header đổi theo |
| 2 | Trang danh sách (3.2) | 5 cột ở 1440px, 2 cột ở 500px; lọc và sắp xếp vẫn giữ trong URL |
| 3 | Header và gợi ý tìm kiếm (3.3) | Gõ "cá" hiện sản phẩm và món; tắt AI service vẫn hiện sản phẩm; bàn phím lên xuống và Esc dùng được |
| 4 | Trang chủ (3.4) | Không còn khoảng trống sau "Ưu đãi"; khách chưa đăng nhập không thấy khối Mua lại |
| 5 | Trang sản phẩm (3.5) | Không còn tem cân, tab rỗng, banner "đang phát triển" |
| 6 | Trang công thức (3.6) | 16 nguyên liệu vừa khoảng một màn hình rưỡi; nút thêm vào giỏ luôn thấy |

Chế độ mock (`NEXT_PUBLIC_UI_MOCK`) phải vẫn chạy sau mỗi bước, vì thẻ và trang danh sách dùng chung cho cả hai chế độ.

## 5. Rủi ro và việc chưa chốt

- Ảnh local đang trỏ link gốc của nhà bán lẻ (DB máy dev). Ảnh `object-contain` trên nền trắng hợp với ảnh nền trắng; ảnh nền màu sẽ lộ viền. Xem lại sau bước 1.
- Gợi ý tìm kiếm gọi backend mỗi lần gõ: có trễ 250ms và hủy yêu cầu cũ; chưa đo tải.
- Bỏ `UtilityBar` và tem cân là bỏ chi tiết của bản thiết kế v2 (`Com4Fud_UI_SVG`). Nhóm đã đồng ý không cần khớp bản thiết kế đó nữa.
- Chưa chốt: sau trùng tu có giữ `ComingSoonButton` ở chỗ nào khác không (ví dụ yêu thích, thông báo) hay bỏ hết.

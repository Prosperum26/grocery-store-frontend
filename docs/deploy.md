# Deploy storefront

Storefront chạy trên **Vercel Hobby** (free), tự deploy khi push lên `main`; preview cho mỗi PR.
CI (`.github/workflows/ci.yml`) chạy lint, kiểm kiểu, vitest và build ở chế độ mock cho push/PR vào `dev`/`main`.

Biến môi trường trên Vercel:

| Biến | Giá trị |
| :--- | :--- |
| `MEDUSA_BACKEND_URL` | URL backend trên Render, ví dụ `https://com4fud-backend.onrender.com` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | admin Medusa > Settings > Publishable API Keys |
| `NEXT_PUBLIC_BASE_URL` | `https://<project>.vercel.app` |
| `NEXT_PUBLIC_DEFAULT_REGION` | `vn` |
| `NEXT_PUBLIC_UI_MOCK` | `false` |
| `NEXT_PUBLIC_REALTIME_URL` | URL realtime-gateway trên Render |
| `REVALIDATE_SECRET` | chuỗi ngẫu nhiên |

Build gọi backend để dựng sẵn trang sản phẩm: đánh thức backend (`/health`) trước khi deploy.
Ảnh do backend phục vụ (`/static/**`) được cho phép theo host của `MEDUSA_BACKEND_URL` (`next.config.js`).

Hướng dẫn đầy đủ cho cả hệ thống (Neon, Render, pinger, Hugging Face): `docs/deploy.md` của repo `grocery-store-backend`.

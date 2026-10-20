# Com4Fud Storefront

Storefront của Com4Fud (đồ án MSIS4133, nhóm 05), dựng trên Medusa Next.js Starter. Giao diện theo bản thiết kế "Chợ Tươi" (Figma + `Com4Fud_UI_SVG`). Kế hoạch đồng bộ giao diện: `docs/plans/2026-10-18-sync-ui-v2-frontend.md`.

## Chạy nhanh

```shell
cp .env.template .env.local   # giá trị mẫu đủ cho chế độ mock
yarn install
yarn dev                      # http://localhost:8000/vn
```

## Chế độ mock (`NEXT_PUBLIC_UI_MOCK`)

Mặc định bật (`true`). Khi bật, storefront **không gọi backend**: catalog, danh mục, giỏ hàng, đơn hàng và khách mẫu lấy từ `src/lib/mock/*`.

- Giỏ hàng sống trong trình duyệt (`src/lib/context/mock-cart-context.tsx`, lưu `sessionStorage`), khởi tạo bằng giỏ mẫu của thiết kế (9 món, 390.000đ, mã `TUOI20`).
- Thanh toán không trừ tiền, không tạo đơn: bấm "Xác nhận đặt hàng" sẽ tới `/vn/order/demo/confirmed` (đơn mẫu).
- Tài khoản: ở môi trường dev có nút "Vào tài khoản dùng thử" (cookie, không mật khẩu). Bản build production không hiện nút này.
- Tính năng chưa có (Trợ lý Bếp, Có thể bạn cần mua lại, theo dõi trực tiếp, ví mã giảm giá) hiện nhãn "Đang trong quá trình phát triển".

Khi backend có catalog thật: đặt `NEXT_PUBLIC_UI_MOCK=false`, rồi làm các task ở `grocery-store-backend/docs/plans/2026-10-18-sync-ui-v2-backend.md`. Giỏ, thanh toán và đơn hàng thật chưa được nối lại ở giai đoạn này.

## Kiểm tra

```shell
yarn test                     # hàm thuần (vitest)
npx tsc --noEmit
yarn build && yarn start
node scripts/check-links.mjs http://127.0.0.1:8000/vn   # báo liên kết nội bộ trả >= 400
```

Dùng `127.0.0.1` thay cho `localhost` khi chạy `check-links` (Node ưu tiên IPv6).

---

> ⚠️ This repository is now deprecated. Use the [dtc-starter](https://github.com/medusajs/dtc-starter) instead.

<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>

<h1 align="center">
  Medusa Next.js Starter Template
</h1>

<p align="center">
Combine Medusa's modules for your commerce backend with the newest Next.js 15 features for a performant storefront.</p>

<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

### Prerequisites

To use the [Next.js Starter Template](https://medusajs.com/nextjs-commerce/), you should have a Medusa server running locally on port 9000.
For a quick setup, run:

```shell
npx create-medusa-app@latest
```

Check out [create-medusa-app docs](https://docs.medusajs.com/learn/installation) for more details and troubleshooting.

# Overview

The Medusa Next.js Starter is built with:

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Medusa](https://medusajs.com/)

Features include:

- Full ecommerce support:
  - Product Detail Page
  - Product Overview Page
  - Product Collections
  - Cart
  - Checkout with Stripe
  - User Accounts
  - Order Details
- Full Next.js 15 support:
  - App Router
  - Next fetching/caching
  - Server Components
  - Server Actions
  - Streaming
  - Static Pre-Rendering

# Quickstart

### Setting up the environment variables

Navigate into your projects directory and get your environment variables ready:

```shell
cd nextjs-starter-medusa/
mv .env.template .env.local
```

### Install dependencies

Use Yarn to install all dependencies.

```shell
yarn
```

### Start developing

You are now ready to start up your project.

```shell
yarn dev
```

### Open the code and start customizing

Your site is now running at http://localhost:8000!

# Payment integrations

By default this starter supports the following payment integrations

- [Stripe](https://stripe.com/)

To enable the integrations you need to add the following to your `.env.local` file:

```shell
NEXT_PUBLIC_STRIPE_KEY=<your-stripe-public-key>
```

You'll also need to setup the integrations in your Medusa server. See the [Medusa documentation](https://docs.medusajs.com) for more information on how to configure [Stripe](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe#main).

# Resources

## Learn more about Medusa

- [Website](https://www.medusajs.com/)
- [GitHub](https://github.com/medusajs)
- [Documentation](https://docs.medusajs.com/)

## Learn more about Next.js

- [Website](https://nextjs.org/)
- [GitHub](https://github.com/vercel/next.js)
- [Documentation](https://nextjs.org/docs)

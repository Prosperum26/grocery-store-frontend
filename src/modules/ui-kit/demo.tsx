"use client"

// Component gallery for reviewing FE-3 against 00_He_Thong_Thiet_Ke.png.
// Temporary: removed in FE-14.
import { useState } from "react"
import {
  LuArrowRight,
  LuBell,
  LuChefHat,
  LuCheck,
  LuPercent,
  LuPlus,
  LuRepeat,
  LuSearch,
  LuShoppingBag,
  LuTicket,
  LuTrash2,
} from "react-icons/lu"

import Button from "@modules/common/components/button"
import Chip from "@modules/common/components/chip"
import {
  ComingSoonBadge,
  ComingSoonButton,
  ComingSoonPanel,
} from "@modules/common/components/coming-soon"
import Field from "@modules/common/components/field"
import FilterChip from "@modules/common/components/filter-chip"
import LiveStock from "@modules/common/components/live-stock"
import { Banner, Toast } from "@modules/common/components/notice"
import OrderStatusChip from "@modules/common/components/order-status-chip"
import PriceTag from "@modules/common/components/price-tag"
import SaleSticker from "@modules/common/components/sale-sticker"
import Stepper from "@modules/common/components/stepper"
import Toggle from "@modules/common/components/toggle"
import { ORDER_STAGES } from "@lib/util/stage"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </section>
  )
}

export default function UiKitDemo() {
  const [qty, setQty] = useState(1)
  const [inStock, setInStock] = useState(true)
  const [onSale, setOnSale] = useState(false)
  const [cat, setCat] = useState("Rau củ")

  return (
    <div className="content-container flex flex-col gap-6 py-10">
      <h1 className="text-4xl font-extrabold">Thành phần giao diện</h1>

      <Section title="Nút">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={LuShoppingBag}>Thêm vào giỏ</Button>
          <Button variant="secondary" iconRight={LuArrowRight}>Xem công thức</Button>
          <Button variant="deep">Xác nhận</Button>
          <Button variant="warn" iconRight={LuArrowRight}>Mua ngay</Button>
          <Button variant="accent" icon={LuChefHat}>Hỏi Trợ lý Bếp</Button>
          <Button variant="danger" icon={LuTrash2} size="sm">Xóa khỏi giỏ</Button>
          <Button variant="dangerSoft" size="sm">Hủy đơn</Button>
          <Button variant="ghost" size="sm">Bỏ qua</Button>
          <Button icon={LuPlus} size="sm" aria-label="Thêm cà chua vào giỏ" />
          <Button size="lg" icon={LuShoppingBag}>Thêm · 85.000đ</Button>
          <Button size="xs">Rất nhỏ</Button>
          <Button aria-disabled>Không dùng được</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-btn bg-brand-deep p-4" data-surface="dark">
          <Button variant="warn">Mua ngay</Button>
          <Button variant="onDark">Xem ưu đãi khác</Button>
        </div>
      </Section>

      <Section title="Nhãn, tem, vé trạng thái">
        <div className="flex flex-wrap items-center gap-3">
          <Chip>4 người</Chip>
          <Chip tone="brand" icon={LuCheck}>Đã áp dụng</Chip>
          <Chip tone="brandSolid">Mặc định</Chip>
          <Chip tone="accent" icon={LuRepeat}>Mua lại</Chip>
          <Chip tone="sale">5 món</Chip>
          <Chip tone="warn">Chưa trả</Chip>
          <Chip tone="sky">Hải sản</Chip>
          <Chip tone="dark" flat>Hết hàng</Chip>
          <Chip tone="outline" mono>VNPAY</Chip>
          <SaleSticker label="Giảm 12%">−12%</SaleSticker>
          <SaleSticker large>−12% HÔM NAY</SaleSticker>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {ORDER_STAGES.map((s) => (
            <OrderStatusChip key={s} stage={s} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PriceTag price={85000} unit="khay 500g" large />
          <PriceTag price={92000} sale />
          <LiveStock qty={3} lowStock={5} unit="khay" />
          <LiveStock qty={0} lowStock={5} unit="khay" />
          <LiveStock qty={40} lowStock={5} unit="khay" />
        </div>
      </Section>

      <Section title="Điều khiển">
        <div className="flex flex-wrap items-center gap-4">
          <Stepper value={qty} onChange={setQty} label="cà chua" max={5} />
          <Stepper value={qty} onChange={setQty} label="cà chua (nhỏ)" size="sm" removeAtMin onRemove={() => setQty(1)} />
          <div className="w-64">
            <Toggle checked={inStock} onChange={setInStock} label="Chỉ hiện còn hàng" />
            <Toggle className="mt-3" checked={onSale} onChange={setOnSale} label="Đang giảm giá" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Rau củ", "Trái cây", "Thịt"].map((c) => (
            <FilterChip key={c} pressed={cat === c} onClick={() => setCat(c)} count={c.length * 9}>
              {c}
            </FilterChip>
          ))}
          <FilterChip pressed={onSale} onClick={() => setOnSale(!onSale)} icon={LuPercent} size="sm">
            Đang giảm giá
          </FilterChip>
        </div>
        <div className="grid gap-4 small:grid-cols-3">
          <Field label="Email" type="email" placeholder="ban@email.com" autoComplete="email" />
          <Field label="Mã giảm giá" icon={LuTicket} mono defaultValue="TUOI20" suffix={<Chip tone="brand" icon={LuCheck}>Đã áp dụng</Chip>} />
          <Field label="Số điện thoại" icon={LuSearch} error="Số điện thoại chưa đúng." defaultValue="0903" />
        </div>
      </Section>

      <Section title="Thông báo">
        <div className="grid gap-4 small:grid-cols-2">
          <Toast tone="err" title="Không thể thêm vào giỏ" description="Chỉ còn 3 khay trong kho." />
          <Toast tone="warn" title="Tôm thẻ tươi vừa hết hàng" description="Giỏ hàng đã được cập nhật." />
          <Toast tone="ok" title="Đã thêm Cá lóc phi lê vào giỏ" action={<button className="text-sm font-semibold text-brand underline">Hoàn tác</button>} />
          <Toast tone="info" title="Đang kết nối lại…" />
        </div>
        <Banner tone="warn" title="Giá Thịt ba rọi heo vừa thay đổi" description="Từ 89.000đ lên 92.000đ. Tổng tiền đã tính theo giá mới." action={<Button variant="secondary" size="sm">Đã hiểu</Button>} />
        <Banner tone="err" title="5 món cần nhập gấp" />
        <Banner tone="tip" title="Mẹo: thêm cả công thức vào giỏ" />
      </Section>

      <Section title="Giữ chỗ tính năng chưa có">
        <div className="flex flex-wrap items-center gap-3">
          <ComingSoonBadge />
          <ComingSoonButton feature="Trợ lý Bếp" icon={LuChefHat} variant="accent">Hỏi Trợ lý Bếp</ComingSoonButton>
          <ComingSoonButton feature="Báo khi có hàng" icon={LuBell} variant="secondary" size="sm">Báo khi có hàng</ComingSoonButton>
        </div>
        <ComingSoonPanel title="Trợ lý Bếp" description="Gợi ý thực đơn và gom nguyên liệu vào giỏ cho bạn." />
      </Section>
    </div>
  )
}

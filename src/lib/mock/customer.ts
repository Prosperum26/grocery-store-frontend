// The demo customer of the design (shared.js USER). Used only in mock mode,
// and only in development, by the account pages (plan O5).
export type DemoAddress = {
  id: string
  label: string
  name: string
  phone: string
  line: string
  ward: string
  isDefault: boolean
}

export const DEMO_CUSTOMER = {
  name: "Trần Minh Thư",
  email: "minhthu@com4fud.demo",
  phone: "0903 412 588",
}

export const DEMO_ADDRESSES: DemoAddress[] = [
  {
    id: "addr_home",
    label: "Nhà riêng",
    name: DEMO_CUSTOMER.name,
    phone: DEMO_CUSTOMER.phone,
    line: "Căn 12.05, Tháp B, Sky Garden 3",
    ward: "P. Tân Phong, Quận 7, TP.HCM",
    isDefault: true,
  },
  {
    id: "addr_office",
    label: "Văn phòng",
    name: DEMO_CUSTOMER.name,
    phone: DEMO_CUSTOMER.phone,
    line: "Tầng 8, 102 Nguyễn Văn Linh",
    ward: "P. Tân Thuận Tây, Quận 7, TP.HCM",
    isDefault: false,
  },
]

/**
 * The demo customer shaped like Medusa's StoreCustomer, so the Starter
 * profile and address forms render it. Only the fields those forms read are
 * filled in.
 */
export const DEMO_STORE_CUSTOMER = {
  id: "cus_mock_minhthu",
  email: DEMO_CUSTOMER.email,
  first_name: "Thư",
  last_name: "Trần Minh",
  phone: "0903412588",
  company_name: null,
  has_account: true,
  metadata: {},
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-10-07T00:00:00.000Z",
  addresses: DEMO_ADDRESSES.map((a, i) => ({
    id: a.id,
    customer_id: "cus_mock_minhthu",
    first_name: "Thư",
    last_name: "Trần Minh",
    company: null,
    address_1: a.line,
    address_2: null,
    city: a.ward,
    country_code: "vn",
    province: null,
    postal_code: null,
    phone: DEMO_CUSTOMER.phone,
    metadata: {},
    is_default_shipping: a.isDefault,
    is_default_billing: a.isDefault,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-10-07T00:00:00.000Z",
    sort: i,
  })),
  default_billing_address_id: DEMO_ADDRESSES[0].id,
  default_shipping_address_id: DEMO_ADDRESSES[0].id,
} as unknown as import("@medusajs/types").HttpTypes.StoreCustomer

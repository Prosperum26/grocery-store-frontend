import { HttpTypes } from "@medusajs/types"

/**
 * Fake catalog copied from the v2 design data
 * (Com4Fud_UI_SVG/v2/_source/src/shared.js, the `prod(...)` calls), so every
 * screen shows the same numbers as the design. Objects are shaped like
 * Medusa's StoreProduct so the Starter pages keep working in mock mode, and
 * metadata follows the backend plan §2 (art, tint, origin, stock_unit, ...).
 */
type Row = {
  handle: string
  title: string
  art: string
  tint: string
  category: string
  unit: string
  price: number
  was?: number
  stock: number
  stockUnit: string
  weight?: number
  origin?: string
  low?: number
}

const ROWS: Row[] = [
  { handle: "ca-chua-da-lat", title: "Cà chua Đà Lạt", art: "tomato", tint: "red", category: "rau-cu", unit: "1 kg", price: 32000, stock: 86, stockUnit: "kg", weight: 1000, origin: "Đà Lạt" },
  { handle: "rau-muong", title: "Rau muống", art: "waterSpinach", tint: "green", category: "rau-cu", unit: "Bó 500g", price: 15000, stock: 64, stockUnit: "bó", weight: 500, origin: "Củ Chi" },
  { handle: "cai-thia", title: "Cải thìa", art: "bokChoy", tint: "green", category: "rau-cu", unit: "Túi 500g", price: 18000, stock: 40, stockUnit: "túi", weight: 500, origin: "Đà Lạt" },
  { handle: "ca-rot-da-lat", title: "Cà rốt Đà Lạt", art: "carrot", tint: "orange", category: "rau-cu", unit: "1 kg", price: 28000, stock: 52, stockUnit: "kg", weight: 1000, origin: "Đà Lạt" },
  { handle: "bong-cai-xanh", title: "Bông cải xanh", art: "broccoli", tint: "green", category: "rau-cu", unit: "Túi 500g", price: 35000, was: 42000, stock: 23, stockUnit: "túi", weight: 500, origin: "Đà Lạt" },
  { handle: "hanh-la", title: "Hành lá", art: "scallion", tint: "green", category: "rau-cu", unit: "Bó 100g", price: 5000, stock: 120, stockUnit: "bó", weight: 100, origin: "Hóc Môn" },
  { handle: "gia-do", title: "Giá đỗ", art: "sprouts", tint: "cream", category: "rau-cu", unit: "Túi 300g", price: 6000, stock: 75, stockUnit: "túi", weight: 300, origin: "TP.HCM" },
  { handle: "rau-om-ngo-gai", title: "Rau om & ngò gai", art: "herbs", tint: "green", category: "rau-cu", unit: "Bó 100g", price: 6000, stock: 48, stockUnit: "bó", weight: 100, origin: "Củ Chi" },
  { handle: "ot-hiem", title: "Ớt hiểm", art: "chili", tint: "red", category: "gia-vi", unit: "Túi 100g", price: 8000, stock: 90, stockUnit: "túi", weight: 100, origin: "Tiền Giang" },
  { handle: "toi-ly-son", title: "Tỏi Lý Sơn", art: "garlic", tint: "cream", category: "gia-vi", unit: "Túi 200g", price: 24000, stock: 33, stockUnit: "túi", weight: 200, origin: "Lý Sơn" },
  { handle: "gung-ta", title: "Gừng ta", art: "ginger", tint: "yellow", category: "gia-vi", unit: "Túi 200g", price: 9000, stock: 41, stockUnit: "túi", weight: 200 },
  { handle: "me-chua", title: "Me chua", art: "tamarind", tint: "brown", category: "gia-vi", unit: "Gói 200g", price: 12000, stock: 28, stockUnit: "gói", weight: 200 },
  { handle: "dua-tien-giang", title: "Dứa (thơm) Tiền Giang", art: "pineapple", tint: "yellow", category: "trai-cay", unit: "1 quả ~1,2 kg", price: 20000, stock: 37, stockUnit: "quả", origin: "Tiền Giang" },
  { handle: "chuoi-gia-nam-my", title: "Chuối già Nam Mỹ", art: "banana", tint: "yellow", category: "trai-cay", unit: "Nải ~1 kg", price: 25000, stock: 29, stockUnit: "nải" },
  { handle: "trung-ga-ta", title: "Trứng gà ta", art: "eggs", tint: "cream", category: "trung-sua", unit: "Hộp 10 quả", price: 42000, stock: 58, stockUnit: "hộp" },
  { handle: "sua-tuoi-khong-duong", title: "Sữa tươi không đường", art: "milk", tint: "blue", category: "trung-sua", unit: "Hộp 1 lít", price: 38000, stock: 70, stockUnit: "hộp" },
  { handle: "uc-ga-phi-le", title: "Ức gà phi lê", art: "chicken", tint: "pink", category: "thit", unit: "Khay 500g", price: 59000, stock: 18, stockUnit: "khay", weight: 500 },
  { handle: "thit-ba-roi-heo", title: "Thịt ba rọi heo", art: "pork", tint: "pink", category: "thit", unit: "Khay 500g", price: 92000, was: 105000, stock: 12, stockUnit: "khay", weight: 500 },
  { handle: "ca-loc-phi-le", title: "Cá lóc phi lê", art: "fishFillet", tint: "blue", category: "hai-san", unit: "Khay 500g", price: 85000, stock: 3, stockUnit: "khay", weight: 500, origin: "Đồng Tháp", low: 5 },
  { handle: "tom-the-tuoi", title: "Tôm thẻ tươi", art: "shrimp", tint: "orange", category: "hai-san", unit: "Khay 300g", price: 99000, stock: 0, stockUnit: "khay", weight: 300, origin: "Cà Mau" },
  { handle: "gao-st25", title: "Gạo ST25", art: "rice", tint: "cream", category: "gao-do-kho", unit: "Túi 5 kg", price: 185000, stock: 44, stockUnit: "túi", weight: 5000, origin: "Sóc Trăng" },
  { handle: "nuoc-mam-ca-com", title: "Nước mắm cá cơm 40°N", art: "fishSauce", tint: "brown", category: "gia-vi", unit: "Chai 500ml", price: 45000, stock: 26, stockUnit: "chai", origin: "Phú Quốc" },
]

// Cá lóc is the one product with several pack sizes in the design (screen 03).
const EXTRA_VARIANTS: Record<
  string,
  { label: string; price: number; stock: number; weight: number }[]
> = {
  "ca-loc-phi-le": [
    { label: "Khay 300g", price: 52000, stock: 8, weight: 300 },
    { label: "Khay 1 kg", price: 165000, stock: 0, weight: 1000 },
  ],
}

const DETAILS: Record<
  string,
  { description: string; prep?: string[]; companions?: string[] }
> = {
  "ca-loc-phi-le": {
    description:
      "Cá lóc đồng nuôi tại Đồng Tháp, phi lê sáng nay. Thịt trắng, chắc, ít xương dăm. Hợp nấu canh chua, kho tộ hoặc chiên sả.",
    prep: ["Phi lê nguyên miếng", "Cắt khúc nấu canh", "Cắt lát mỏng"],
    companions: [
      "ca-chua-da-lat",
      "dua-tien-giang",
      "me-chua",
      "rau-om-ngo-gai",
    ],
  },
}

function variant(
  id: string,
  label: string,
  price: number,
  was: number | undefined,
  stock: number,
  weight: number | undefined,
  isDefault: boolean
) {
  return {
    id,
    title: label,
    sku: null,
    weight: weight ?? null,
    manage_inventory: true,
    allow_backorder: false,
    inventory_quantity: stock,
    options: [{ id: `${id}_opt`, value: label, option_id: "opt_quy_cach" }],
    // The pack size a product card shows when no size is picked yet.
    metadata: isDefault ? { is_default: true } : {},
    calculated_price: {
      calculated_amount: price,
      original_amount: was ?? price,
      currency_code: "vnd",
      calculated_price: { price_list_type: was ? "sale" : null },
      original_price: { price_list_type: null },
    },
  }
}

function toStoreProduct(r: Row, index: number): HttpTypes.StoreProduct {
  const id = `prod_mock_${index + 1}`
  const details = DETAILS[r.handle]
  const main = variant(`${id}_v1`, r.unit, r.price, r.was, r.stock, r.weight, true)
  const extra = (EXTRA_VARIANTS[r.handle] ?? []).map((v, i) =>
    variant(`${id}_v${i + 2}`, v.label, v.price, undefined, v.stock, v.weight, false)
  )
  // Pack sizes in ascending weight so the picker reads 300g, 500g, 1 kg.
  const variants = [main, ...extra].sort(
    (a, b) => (a.weight ?? 0) - (b.weight ?? 0)
  )

  return {
    id,
    handle: r.handle,
    title: r.title,
    subtitle: null,
    description: details?.description ?? null,
    thumbnail: null,
    images: [],
    status: "published",
    created_at: new Date(Date.UTC(2026, 9, 1, 0, index)).toISOString(),
    collection: null,
    collection_id: null,
    categories: [{ id: `pcat_mock_${r.category}`, handle: r.category }],
    tags: [],
    options: [
      {
        id: "opt_quy_cach",
        title: "Quy cách",
        values: variants.map((v) => ({ id: `${v.id}_opt`, value: v.title })),
      },
    ],
    variants,
    metadata: {
      art: r.art,
      tint: r.tint,
      origin: r.origin ?? null,
      stock_unit: r.stockUnit,
      low_stock: r.low ?? 10,
      prep_options: details?.prep ?? null,
      companions: details?.companions ?? null,
    },
  } as unknown as HttpTypes.StoreProduct
}

export const MOCK_PRODUCTS: HttpTypes.StoreProduct[] = ROWS.map(toStoreProduct)

export function findMockProduct(handle: string) {
  return MOCK_PRODUCTS.find((p) => p.handle === handle)
}

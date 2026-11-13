/**
 * Gợi ý món (B giỏ hàng, C trang sản phẩm, A thử món mới): phần thuần của thẻ gợi ý, để test không cần backend.
 * Hợp đồng: grocery-store-backend/docs/contracts/ai-copilot.md, mục 5.
 */
import { formatVnd } from "./price"
import { buildLines, cartLinesOf, initialSelection, type CartLine, type RawKitchenBasket, type RecipeInfo } from "./kitchen"

export type RawSuggestion = {
  recipe: RecipeInfo
  /** Sản phẩm đầu vào có trong món; `name` là tên nguyên liệu trong công thức ("cá lóc"). */
  matched: { catalog_id: string; name: string }[]
  new_count: number | null
  familiar_count: number | null
  missing_count: number
  /** VND, tổng phần còn thiếu, tính số gói như nút "Thêm". */
  missing_total: number
  basket: RawKitchenBasket
}

export type RawSuggestResponse = { status: "ready" | "empty"; suggestions: RawSuggestion[] }

/** Chữ ký giỏ: danh sách khoá dòng đã sắp xếp. Đổi số lượng không đổi chữ ký nên không phải gọi lại. */
export function cartSignature(keys: string[]): string {
  return Array.from(new Set(keys)).sort().join("|")
}

/**
 * Tên nguyên liệu để nói trong câu dẫn của B: lấy từ các món gợi ý theo thứ tự gặp (món đầu là món khớp nhất),
 * không trùng. Hiện tối đa `max` tên, phần còn lại gộp thành "N nguyên liệu khác".
 */
export function introNames(suggestions: Pick<RawSuggestion, "matched">[], max = 2): { shown: string[]; more: number } {
  const seen: string[] = []
  for (const s of suggestions) {
    for (const m of s.matched) {
      const name = m.name.trim().toLocaleLowerCase("vi")
      if (name && !seen.includes(name)) seen.push(name)
    }
  }
  return { shown: seen.slice(0, max), more: Math.max(0, seen.length - max) }
}

/** "Mình thấy bạn có cá lóc, cà chua và 2 nguyên liệu khác trong giỏ." */
export function introText(names: { shown: string[]; more: number }): string {
  if (names.shown.length === 0) return ""
  const list = names.shown.join(", ")
  const tail = names.more > 0 ? ` và ${names.more} nguyên liệu khác` : ""
  return `Mình thấy bạn có ${list}${tail} trong giỏ.`
}

/** Dòng dưới tên món: "Cần thêm 4 nguyên liệu · +96.500đ", hoặc "Đã đủ nguyên liệu". */
export function formatMissing(count: number, total: number): string {
  return count === 0 ? "Đã đủ nguyên liệu" : `Cần thêm ${count} nguyên liệu · +${formatVnd(total)}`
}

/** Các dòng "Thêm" đưa vào giỏ: chỉ phần còn thiếu (`basket.buy`), mỗi dòng đã mua được (backend đã loại món không mua được). */
export function addLinesOf(s: Pick<RawSuggestion, "basket">): CartLine[] {
  const lines = buildLines({ buy: s.basket.buy, maybe_have: [] })
  return cartLinesOf(lines, initialSelection(lines))
}

/** Ảnh nguyên liệu cho dải ảnh của thẻ: không trùng, tối đa `max`. */
export function thumbnailsOf(s: Pick<RawSuggestion, "basket">, max = 4): string[] {
  const out: string[] = []
  for (const item of [...s.basket.buy, ...s.basket.maybe_have]) {
    const url = item.variant?.thumbnail
    if (url && !out.includes(url)) out.push(url)
    if (out.length === max) break
  }
  return out
}

/** "4 người · 35 phút" */
export function recipeMeta(recipe: Pick<RecipeInfo, "servings" | "time_minutes">): string {
  return [`${recipe.servings} người`, recipe.time_minutes ? `${recipe.time_minutes} phút` : null].filter(Boolean).join(" · ")
}

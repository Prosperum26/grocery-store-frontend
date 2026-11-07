import { buildBasketView, type BasketItemView, type RawBasketItem } from "./basket"

/**
 * Data of the "Mua lại" page (GET /store/predictive/reorder-schedule). Pure,
 * so it can be tested without a backend.
 */

export type RawSchedule = {
  status: "ready" | "empty"
  today: RawBasketItem[]
  upcoming: (RawBasketItem & { days_left: number })[]
  total: number
}

export type ScheduleView = {
  today: BasketItemView[]
  upcoming: (BasketItemView & { daysLabel: string })[]
  total: number
  addableCount: number
}

export const EMPTY_SCHEDULE: ScheduleView = { today: [], upcoming: [], total: 0, addableCount: 0 }

export function daysLeftLabel(days: number): string {
  return days <= 0 ? "Đã đến lúc mua lại" : `Còn khoảng ${days} ngày`
}

const toViews = (items: RawBasketItem[]) =>
  buildBasketView({ status: "ready", items, total: 0 }).items

export function buildScheduleView(raw: RawSchedule | null | undefined): ScheduleView {
  if (!raw || raw.status !== "ready") {
    return EMPTY_SCHEDULE
  }
  const today = toViews(raw.today ?? [])
  const upcoming = raw.upcoming ?? []
  return {
    today,
    upcoming: toViews(upcoming).map((item, i) => ({
      ...item,
      daysLabel: daysLeftLabel(upcoming[i].days_left),
    })),
    total: raw.total,
    addableCount: today.filter((i) => i.inStock).length,
  }
}

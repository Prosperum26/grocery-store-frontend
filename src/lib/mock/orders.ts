import type { OrderStage } from "../../types/viewmodels"

export type MockOrder = {
  id: string
  code: string
  date: string
  itemCount: number
  total: number
  stage: OrderStage
  /** Illustration keys of a few items, for the order card thumbnails. */
  arts: string[]
}

// Order history of the demo customer (shared.js ORDERS), newest first.
export const MOCK_ORDERS: MockOrder[] = [
  { id: "order_mock_0142", code: "C4F-261007-0142", date: "07.10.2026", itemCount: 9, total: 390000, stage: "SHIPPING", arts: ["fishFillet", "tomato", "eggs", "milk"] },
  { id: "order_mock_0098", code: "C4F-261003-0098", date: "03.10.2026", itemCount: 6, total: 286000, stage: "DELIVERED", arts: ["chicken", "bokChoy", "rice"] },
  { id: "order_mock_0311", code: "C4F-260928-0311", date: "28.09.2026", itemCount: 4, total: 157000, stage: "DELIVERED", arts: ["eggs", "milk", "banana"] },
  { id: "order_mock_0207", code: "C4F-260924-0207", date: "24.09.2026", itemCount: 3, total: 118000, stage: "CANCELLED", arts: ["shrimp", "herbs"] },
  { id: "order_mock_0150", code: "C4F-260919-0150", date: "19.09.2026", itemCount: 8, total: 342000, stage: "DELIVERED", arts: ["pork", "waterSpinach", "fishSauce"] },
]

import { isMockMode } from "@lib/mock/mode"
import { MOCK_ORDERS } from "@lib/mock/orders"
import { fromMockOrder, type OrderView } from "@lib/util/order-view"
import { listMyOrders } from "./my-orders"

/** The orders the account pages list: the sample orders in mock mode, else the customer's own. */
export async function loadOrders(): Promise<OrderView[]> {
  return isMockMode() ? MOCK_ORDERS.map(fromMockOrder) : listMyOrders()
}

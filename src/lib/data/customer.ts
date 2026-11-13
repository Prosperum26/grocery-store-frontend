"use server"

import { sdk } from "@lib/config"
import { DEMO_STORE_CUSTOMER } from "@lib/mock/customer"
import { isMockMode } from "@lib/mock/mode"
import { isDemoSignedIn } from "./demo-session"
import { toAddressBody, type AddressInput } from "@lib/util/address-form"
import { MOCK_NO_BACKEND } from "@lib/util/mock-copy"
import { warmReorderBasket } from "./predictive"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    // Mock mode: the demo customer, only after the demo sign-in (plan O5).
    if (isMockMode()) {
      if (!(await isDemoSignedIn())) return null
      return process.env.NODE_ENV === "production" ? null : DEMO_STORE_CUSTOMER
    }

    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

// Accounts need the backend; in mock mode the forms say so instead of
// failing with a network error (issue #11: placeholder, never a crash).
const MOCK_AUTH_MESSAGE = MOCK_NO_BACKEND

export async function signup(_currentState: unknown, formData: FormData) {
  if (isMockMode()) return MOCK_AUTH_MESSAGE

  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  if (isMockMode()) return MOCK_AUTH_MESSAGE

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }

  // Let the backend prepare the "Mua lại" basket while the shopper lands.
  await warmReorderBasket()
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export type SaveResult = { ok: true } | { ok: false; message: string }

const SAVE_FAILED = "Chưa lưu được. Bạn thử lại sau nhé."

/** Name or phone of the signed-in customer (the profile page). */
export async function saveCustomerProfile(body: HttpTypes.StoreUpdateCustomer): Promise<SaveResult> {
  if (isMockMode()) return { ok: false, message: MOCK_AUTH_MESSAGE }

  const headers = { ...(await getAuthHeaders()) }
  try {
    await sdk.store.customer.update(body, {}, headers)
  } catch {
    return { ok: false, message: SAVE_FAILED }
  }
  revalidateTag(await getCacheTag("customers"))
  return { ok: true }
}

/** Adds an address, or changes the one with `addressId` (the address book page). */
export async function saveCustomerAddress(input: AddressInput, addressId?: string): Promise<SaveResult> {
  if (isMockMode()) return { ok: false, message: MOCK_AUTH_MESSAGE }

  const headers = { ...(await getAuthHeaders()) }
  const body = toAddressBody(input)
  try {
    if (addressId) {
      await sdk.store.customer.updateAddress(addressId, body, {}, headers)
    } else {
      await sdk.store.customer.createAddress(body, {}, headers)
    }
  } catch {
    return { ok: false, message: SAVE_FAILED }
  }
  revalidateTag(await getCacheTag("customers"))
  return { ok: true }
}

export async function deleteCustomerAddress(addressId: string): Promise<SaveResult> {
  if (isMockMode()) return { ok: false, message: MOCK_AUTH_MESSAGE }

  const headers = { ...(await getAuthHeaders()) }
  try {
    await sdk.store.customer.deleteAddress(addressId, headers)
  } catch {
    return { ok: false, message: "Chưa xóa được địa chỉ. Bạn thử lại sau nhé." }
  }
  revalidateTag(await getCacheTag("customers"))
  return { ok: true }
}

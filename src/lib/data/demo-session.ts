"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DEMO_CUSTOMER_COOKIE } from "@lib/mock/session"
import { isMockMode } from "@lib/mock/mode"

/*
 * Demo sign-in of the mock mode (plan O5). It is a cookie, not a login: no
 * password is checked and none is stored in the code. It only works while
 * mock mode is on and outside production builds.
 */

export async function isDemoSignedIn(): Promise<boolean> {
  if (!isMockMode() || process.env.NODE_ENV === "production") return false
  const store = await cookies()
  return store.get(DEMO_CUSTOMER_COOKIE)?.value === "1"
}

export async function signInDemo(countryCode: string) {
  if (!isMockMode() || process.env.NODE_ENV === "production") return
  const store = await cookies()
  store.set(DEMO_CUSTOMER_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
  redirect(`/${countryCode}/account`)
}

export async function signOutDemo(countryCode: string) {
  const store = await cookies()
  store.delete(DEMO_CUSTOMER_COOKIE)
  redirect(`/${countryCode}/account`)
}

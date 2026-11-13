/**
 * Short-lived drafts of the sign-in and checkout forms, kept in the browser (localStorage) so a shopper who leaves to
 * sign in, opens another page or reloads finds what they typed. A draft older than DRAFT_TTL_MS is dropped. Never put
 * a password here: anyone using the same browser could read it.
 *
 * Storage can be missing or throw (private window, blocked site data); every call then does nothing and the form
 * simply starts empty.
 */

export const DRAFT_TTL_MS = 30 * 60 * 1000

export const LOGIN_DRAFT = "c4f:draft:login"
export const CHECKOUT_DRAFT = "c4f:draft:checkout"

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">

function browserStore(): Store | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

export function saveDraft<T>(key: string, value: T, now = Date.now(), store: Store | null = browserStore()): void {
  try {
    store?.setItem(key, JSON.stringify({ savedAt: now, value }))
  } catch {
    // full or blocked: the draft is only a convenience
  }
}

/** The draft, or null when there is none, it is older than `ttlMs`, or it cannot be read. An expired draft is removed. */
export function loadDraft<T>(key: string, now = Date.now(), ttlMs = DRAFT_TTL_MS, store: Store | null = browserStore()): T | null {
  try {
    const raw = store?.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { savedAt?: unknown; value?: T }
    if (typeof parsed.savedAt !== "number" || now - parsed.savedAt > ttlMs || parsed.value === undefined) {
      store?.removeItem(key)
      return null
    }
    return parsed.value
  } catch {
    return null
  }
}

export function clearDraft(key: string, store: Store | null = browserStore()): void {
  try {
    store?.removeItem(key)
  } catch {
    // nothing to do
  }
}

/** On sign-out or a placed order: no address or phone number should stay behind in the browser. */
export function clearAllDrafts(store: Store | null = browserStore()): void {
  clearDraft(LOGIN_DRAFT, store)
  clearDraft(CHECKOUT_DRAFT, store)
}

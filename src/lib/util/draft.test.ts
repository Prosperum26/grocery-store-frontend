import { describe, expect, it } from "vitest"
import { clearAllDrafts, CHECKOUT_DRAFT, DRAFT_TTL_MS, loadDraft, LOGIN_DRAFT, saveDraft } from "./draft"

const memory = () => {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  }
}

describe("drafts", () => {
  it("gives back what was saved while it is fresh", () => {
    const store = memory()
    saveDraft("k", { name: "Thư" }, 1000, store)
    expect(loadDraft("k", 1000 + DRAFT_TTL_MS, DRAFT_TTL_MS, store)).toEqual({ name: "Thư" })
  })

  it("drops a draft older than the time limit", () => {
    const store = memory()
    saveDraft("k", { name: "Thư" }, 1000, store)
    expect(loadDraft("k", 1000 + DRAFT_TTL_MS + 1, DRAFT_TTL_MS, store)).toBeNull()
    expect(store.data.has("k")).toBe(false)
  })

  it("is null for nothing saved, broken data, or no storage", () => {
    const store = memory()
    expect(loadDraft("missing", 0, DRAFT_TTL_MS, store)).toBeNull()
    store.setItem("bad", "{not json")
    expect(loadDraft("bad", 0, DRAFT_TTL_MS, store)).toBeNull()
    expect(loadDraft("k", 0, DRAFT_TTL_MS, null)).toBeNull()
    expect(() => saveDraft("k", 1, 0, null)).not.toThrow()
  })

  it("does not throw when storage refuses to write", () => {
    const store = { ...memory(), setItem: () => { throw new Error("quota") } }
    expect(() => saveDraft("k", 1, 0, store)).not.toThrow()
  })

  it("clears both forms at once", () => {
    const store = memory()
    saveDraft(LOGIN_DRAFT, 1, 0, store)
    saveDraft(CHECKOUT_DRAFT, 2, 0, store)
    clearAllDrafts(store)
    expect(store.data.size).toBe(0)
  })
})

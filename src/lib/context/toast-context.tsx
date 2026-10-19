"use client"

import { cx } from "@lib/util/cx"
import Button from "@modules/common/components/button"
import { Toast, type NoticeTone } from "@modules/common/components/notice"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { LuX } from "react-icons/lu"

/** Errors are announced at once; the rest wait for a pause in speech. */
const DURATION_MS = 6000
const MAX_VISIBLE = 3

export type ToastInput = {
  tone?: NoticeTone
  title: string
  description?: string
  action?: { label: string; onAction: () => void }
}

type ToastItem = ToastInput & { id: number }

type ToastApi = { show: (toast: ToastInput) => void }

const ToastContext = createContext<ToastApi | null>(null)

/**
 * Toasts of the v2 design. Two live regions (polite and assertive) are always
 * in the DOM, so a message added later is read out. Each toast stays for at
 * least 5 seconds so there is time to press "Hoàn tác".
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++
      setItems((prev) => [...prev, { ...toast, id }].slice(-MAX_VISIBLE))
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION_MS))
    },
    [dismiss]
  )

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => clearTimeout(t))
  }, [])

  const errors = items.filter((t) => t.tone === "err")
  const others = items.filter((t) => t.tone !== "err")

  const render = (toast: ToastItem) => (
    <div key={toast.id} className="pointer-events-auto flex items-start gap-2">
      <Toast
        tone={toast.tone}
        title={toast.title}
        description={toast.description}
        className="flex-1"
        action={
          toast.action ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                toast.action?.onAction()
                dismiss(toast.id)
              }}
            >
              {toast.action.label}
            </Button>
          ) : undefined
        }
      />
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Đóng thông báo"
        className="touch-target mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-btn text-ink-2 hover:bg-page-2"
      >
        <LuX aria-hidden="true" />
      </button>
    </div>
  )

  const region = (list: ToastItem[], className: string) => (
    <div className={cx("pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col gap-2 small:inset-x-auto small:bottom-6 small:right-6 small:w-[380px]", className)}>
      {list.map(render)}
    </div>
  )

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* The regions are always mounted, so the first message is announced too. */}
      <div role="status" aria-live="polite">
        {region(others, "")}
      </div>
      <div role="alert" aria-live="assertive">
        {region(errors, "")}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>")
  }
  return ctx
}

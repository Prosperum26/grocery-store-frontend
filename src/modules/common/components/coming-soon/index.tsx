"use client"

import { cx as clx } from "@lib/util/cx"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { LuConstruction, LuX } from "react-icons/lu"

import Button, { ButtonProps } from "@modules/common/components/button"

/*
 * One way to show features that are not built yet (issue #11, section 3):
 * a badge where the feature sits, and a dialog when someone tries to use it.
 * Copy is fixed here so every placeholder says the same thing.
 */
import { COMING_SOON_TEXT, COMING_SOON_TITLE } from "@lib/util/coming-soon-copy"

export { COMING_SOON_TEXT, COMING_SOON_TITLE }

export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={clx(
        "inline-flex h-[26px] w-fit items-center gap-1.5 whitespace-nowrap rounded-chip border-[1.2px] border-warn bg-warn-bg px-2.5 text-xs font-semibold text-warn-ink shadow-sticker shadow-warn",
        className
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-warn-ink" />
      {COMING_SOON_TITLE}
    </span>
  )
}

type ComingSoonContextValue = { open: (feature?: string) => void }

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null)

/**
 * Renders the single placeholder dialog for the whole app. Uses the native
 * <dialog> element: showModal() makes the rest of the page inert, keeps focus
 * inside and closes on Esc. We add closing on backdrop click, restoring
 * focus to the control that opened it, and locking page scroll.
 */
export function ComingSoonProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const [feature, setFeature] = useState<string | undefined>()

  const open = useCallback((name?: string) => {
    openerRef.current = document.activeElement as HTMLElement | null
    setFeature(name)
    document.body.style.overflow = "hidden"
    dialogRef.current?.showModal()
  }, [])

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // "close" fires for the button, Esc and backdrop alike.
    const onClose = () => {
      document.body.style.overflow = ""
      openerRef.current?.focus()
    }
    dialog.addEventListener("close", onClose)
    return () => dialog.removeEventListener("close", onClose)
  }, [])

  return (
    <ComingSoonContext.Provider value={{ open }}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="coming-soon-title"
        aria-describedby="coming-soon-text"
        onClick={(e) => {
          // A click on the dialog element itself is a click on the backdrop.
          if (e.target === dialogRef.current) close()
        }}
        className="m-auto w-[min(420px,calc(100vw-32px))] rounded-card border-[1.5px] border-ink bg-surface p-0 text-ink shadow-toast shadow-warn backdrop:bg-ink/50"
      >
        <div className="relative flex flex-col items-center gap-3 px-6 pb-6 pt-8 text-center">
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="touch-target absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-2 hover:bg-page"
          >
            <LuX size={18} aria-hidden="true" />
          </button>
          <span
            aria-hidden="true"
            className="flex h-14 w-14 -rotate-6 items-center justify-center rounded-2xl bg-warn text-ink"
          >
            <LuConstruction size={28} />
          </span>
          {feature && (
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">
              {feature}
            </p>
          )}
          <h2 id="coming-soon-title" className="text-xl font-bold">
            {COMING_SOON_TITLE}
          </h2>
          <p id="coming-soon-text" className="text-sm text-ink-2">
            {COMING_SOON_TEXT}
          </p>
          <Button className="mt-2" onClick={close} autoFocus>
            Đã hiểu
          </Button>
        </div>
      </dialog>
    </ComingSoonContext.Provider>
  )
}

export function useComingSoon(): ComingSoonContextValue {
  const ctx = useContext(ComingSoonContext)
  if (!ctx) {
    throw new Error("useComingSoon must be used inside <ComingSoonProvider>")
  }
  return ctx
}

/**
 * A button for an unbuilt feature. It looks like the real button and opens
 * the placeholder dialog instead of acting, so it never crashes or leads
 * nowhere. Not aria-disabled: it does something (opens the dialog), and
 * aria-haspopup tells screen readers so. Usable from server components.
 */
export function ComingSoonButton({
  feature,
  ...props
}: { feature: string } & Omit<ButtonProps, "href" | "onClick">) {
  const { open } = useComingSoon()
  return (
    <Button
      {...(props as ButtonProps)}
      aria-haspopup="dialog"
      onClick={() => open(feature)}
    />
  )
}

/** Full block that stands in for an unbuilt section or page. */
export function ComingSoonPanel({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section
      aria-label={title}
      className={clx(
        "flex flex-col items-center gap-3 rounded-card border border-dashed border-line-2 bg-surface px-6 py-10 text-center",
        className
      )}
    >
      {icon}
      <ComingSoonBadge />
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      {description && <p className="max-w-md text-sm text-ink-2">{description}</p>}
      {children}
    </section>
  )
}

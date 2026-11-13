"use client"

import { askAboutRecipe, type AskTurn, type RawAsk } from "@lib/data/kitchen"
import { suggest } from "@lib/data/suggest"
import { formatVnd } from "@lib/util/price"
import { recipeMeta } from "@lib/util/suggest"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"
import AddButton from "@modules/products/components/product-card/add-button"
import type { ProductVM } from "types/viewmodels"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { LuChefHat, LuSend, LuX } from "react-icons/lu"

import Button from "@modules/common/components/button"

const SUGGESTIONS = [
  "Món này khoảng bao nhiêu calo?",
  "Làm sao để món ít mặn, ít cay hơn?",
  "Gợi ý món canh ăn kèm",
  "Tìm nước mắm ngon",
]

/** Products shown under an answer when the customer asked for one (same search as the header box). */
const MAX_PRODUCTS = 3

/** One exchange as shown: the answer, plus the dishes or products it found. Only question and answer go back to the AI. */
type Turn = AskTurn & { dishes: NonNullable<RawAsk["dishes"]>; products: ProductVM[]; productQuery: string | null }

/**
 * "Bạn có thắc mắc gì về món này không?": a short bar floating at the bottom of the recipe page. Pressing it opens the
 * chat (a box in the corner on desktop, a sheet from the bottom on phones). Besides answering about this recipe, it can
 * suggest other dishes (the AI side runs the recipe search) and look up a product (the header search, with the usual
 * add button). It never adds to the cart or orders by itself: the customer presses the buttons.
 *
 * The AI is called only when the customer sends a question, and it answers from this recipe. Earlier questions and
 * answers stay in the chat and are sent along, so a follow-up ("vậy thay bằng gì?") is understood. They also survive
 * closing and opening the chat; leaving the page forgets them (nothing is stored).
 *
 * The conversation sits in a box that scrolls inside, so the question box and the send button never move while
 * answers come in.
 */
export default function AskPanel({ recipeId, servings }: { recipeId: string; servings: number }) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const { countryCode } = useParams<{ countryCode: string }>()
  const [turns, setTurns] = useState<Turn[]>([])
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  // Show the newest message: scroll the box, not the page.
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [turns.length, pending, error, open])

  // Opening puts the cursor in the question box; closing gives focus back to the bar.
  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
    else if (wasOpen.current) barRef.current?.focus({ preventScroll: true })
    wasOpen.current = open
  }, [open])

  const ask = async () => {
    const q = question.trim()
    if (!q || pending) return
    setPending(q)
    setError(null)
    const result = await askAboutRecipe(recipeId, q, servings, turns.map(({ question, answer }) => ({ question, answer })))
    // A product the customer asked for: looked up here, the same way as the header search box.
    const productQuery = result.ok ? result.data.product_query : null
    const products = productQuery ? (await suggest(countryCode, productQuery).catch(() => null))?.products.slice(0, MAX_PRODUCTS) ?? [] : []
    setPending(null)
    if (result.ok && result.data.answer) {
      const answer = result.data.answer
      setTurns((before) => [...before, { question: q, answer, dishes: result.data.dishes ?? [], products, productQuery: productQuery ?? null }])
      setQuestion("")
      return
    }
    // The question stays in the box so the customer can send it again.
    setError(
      !result.ok && result.reason === "unavailable"
        ? "Trợ lý Bếp tạm nghỉ, bạn thử lại sau nhé."
        : "Chưa trả lời được câu này, bạn thử hỏi lại nhé."
    )
  }

  if (!open) {
    return (
      // Phones: above the "Thêm … vào giỏ" bar (bottom-24 + its height). Desktop: the bottom-right corner.
      <button
        ref={barRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="touch-target fixed bottom-[11rem] left-4 z-30 flex h-11 max-w-[calc(100vw-6rem)] items-center gap-2 rounded-full border border-line-2 bg-surface pl-1.5 pr-4 text-sm font-semibold text-ink shadow-toast hover:bg-page-2 small:bottom-6 small:left-auto small:right-6 small:max-w-none"
      >
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
          <LuChefHat size={18} />
        </span>
        <span className="truncate">Bạn có thắc mắc gì về món này không?</span>
      </button>
    )
  }

  return (
    <>
      {/* Phones only: dims the page; pressing it closes the chat. */}
      <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/30 small:hidden" onClick={() => setOpen(false)} />
      <section
        role="dialog"
        aria-labelledby="kitchen-ask"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
        }}
        className="fixed inset-x-0 bottom-0 z-50 flex h-[75vh] flex-col rounded-t-[20px] border border-line bg-surface p-4 shadow-toast small:inset-x-auto small:bottom-6 small:right-6 small:h-[560px] small:w-[400px] small:rounded-card"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-ink">
            <LuChefHat size={20} />
          </span>
          <h2 id="kitchen-ask" className="min-w-0 flex-1 font-display text-lg font-bold leading-tight">
            Hỏi về món này
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng khung hỏi đáp"
            className="touch-target relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-page-2"
          >
            <LuX size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-2">Hỏi về món này, nhờ gợi ý món khác hoặc tìm nhanh sản phẩm. Mình không tự thêm vào giỏ hay đặt hàng thay bạn.</p>

        <div
          ref={logRef}
          role="log"
          aria-label="Hỏi đáp về món này"
          tabIndex={0}
          className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-2xl bg-page p-3"
        >
          {turns.length === 0 && !pending && (
            <div className="m-auto flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-ink-2">Thử một câu hỏi:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="touch-target relative rounded-full border border-line-2 bg-surface px-3 py-1.5 text-sm hover:bg-page-2"
                    // Only fills the box: the customer can edit the question, and nothing is sent until they press "Hỏi".
                    onClick={() => {
                      setQuestion(s)
                      // preventScroll: focusing must not move the page under the pointer.
                      inputRef.current?.focus({ preventScroll: true })
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {turns.map((turn, i) => (
            <div key={i} className="flex flex-col gap-2">
              <p className="ml-auto max-w-[85%] rounded-2xl bg-brand px-4 py-2 text-sm text-white">{turn.question}</p>
              <p className="max-w-[85%] whitespace-pre-line rounded-2xl bg-brand-bg px-4 py-3 text-sm leading-6">{turn.answer}</p>
              {turn.dishes.length > 0 && (
                <ul className="flex max-w-[85%] flex-col gap-1.5" aria-label="Món gợi ý">
                  {turn.dishes.map((d) => (
                    <li key={d.id}>
                      <LocalizedClientLink
                        href={`/tro-ly-bep/${d.id}`}
                        className="flex flex-col rounded-xl border border-line bg-surface px-3 py-2 text-sm hover:bg-page-2"
                      >
                        <span className="font-semibold text-ink">{d.name}</span>
                        <span className="text-xs text-ink-2">{recipeMeta(d)} · Xem công thức</span>
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              )}
              {turn.productQuery && turn.products.length === 0 && (
                // The quick search found nothing (short words such as "me" match poorly): offer the full search page.
                <LocalizedClientLink
                  href={`/store?q=${encodeURIComponent(turn.productQuery)}`}
                  className="w-fit rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-brand hover:bg-page-2"
                >
                  Tìm “{turn.productQuery}” trong cửa hàng
                </LocalizedClientLink>
              )}
              {turn.products.length > 0 && (
                <ul className="flex max-w-[85%] flex-col gap-1.5" aria-label="Sản phẩm tìm được">
                  {turn.products.map((product) => (
                    <li key={product.id} className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2">
                      <LocalizedClientLink href={`/products/${product.handle}`} className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                          <ProductArt product={product} decorative dots={false} fit="contain" sizes="40px" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">{product.title}</span>
                          <span className="block text-xs text-ink-2">{formatVnd(product.price)}</span>
                        </span>
                      </LocalizedClientLink>
                      <AddButton product={product} inStock={product.stockQty > 0} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {pending && (
            <div className="flex flex-col gap-2">
              <p className="ml-auto max-w-[85%] rounded-2xl bg-brand px-4 py-2 text-sm text-white">{pending}</p>
              <p className="w-fit rounded-2xl bg-brand-bg px-4 py-3 text-sm text-ink-2">Đang trả lời…</p>
            </div>
          )}
          {error && <p className="rounded-2xl bg-warn-bg p-4 text-sm text-warn-ink">{error}</p>}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void ask()
          }}
        >
          <label htmlFor="kitchen-question" className="sr-only">
            Câu hỏi về món này
          </label>
          <input
            ref={inputRef}
            id="kitchen-question"
            value={question}
            maxLength={300}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={turns.length ? "Hỏi tiếp…" : "Ví dụ: món này hợp cho bé 3 tuổi không?"}
            className="h-11 min-w-0 flex-1 rounded-btn border border-line-2 bg-surface px-3 text-sm"
          />
          {/* Fixed minimum width: "Đang hỏi…" is wider than "Hỏi" and must not resize the row. */}
          <Button type="submit" icon={<LuSend />} className="min-w-[116px]" aria-disabled={!!pending || !question.trim() || undefined}>
            {pending ? "Đang hỏi…" : "Hỏi"}
          </Button>
        </form>

        <p className="mt-2 text-xs text-ink-2">Số liệu dinh dưỡng chỉ là ước tính, không thay lời khuyên của bác sĩ hay chuyên gia dinh dưỡng.</p>
      </section>
    </>
  )
}

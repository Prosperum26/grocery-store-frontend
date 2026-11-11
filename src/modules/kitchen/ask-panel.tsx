"use client"

import { askAboutRecipe, type AskTurn } from "@lib/data/kitchen"
import { useEffect, useRef, useState } from "react"
import { LuChefHat, LuSend } from "react-icons/lu"

import Button from "@modules/common/components/button"

const SUGGESTIONS = [
  "Món này khoảng bao nhiêu calo?",
  "Nên bớt gì cho hợp khẩu vị miền Bắc?",
  "Làm sao để món ít mặn, ít cay hơn?",
]

/**
 * "Hỏi thêm về món này". The AI is called only when the customer presses the
 * button, and it answers from this recipe. Earlier questions and answers stay
 * on screen and are sent along, so a follow-up ("vậy thay bằng gì?") is
 * understood. Nothing is stored: leaving the page forgets the conversation.
 *
 * The conversation lives in a box of fixed height that scrolls inside, so the
 * question box and the send button never move while answers come in.
 */
export default function AskPanel({ recipeId, servings }: { recipeId: string; servings: number }) {
  const [question, setQuestion] = useState("")
  const [turns, setTurns] = useState<AskTurn[]>([])
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  // Show the newest message: scroll the box, not the page.
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [turns.length, pending, error])

  const ask = async () => {
    const q = question.trim()
    if (!q || pending) return
    setPending(q)
    setError(null)
    const result = await askAboutRecipe(recipeId, q, servings, turns)
    setPending(null)
    if (result.ok && result.data.answer) {
      setTurns((before) => [...before, { question: q, answer: result.data.answer as string }])
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

  return (
    <section aria-labelledby="kitchen-ask" className="rounded-card border border-line bg-surface p-4 small:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-ink">
          <LuChefHat size={20} />
        </span>
        <h2 id="kitchen-ask" className="font-display text-xl font-bold">
          Hỏi thêm về món này
        </h2>
      </div>
      <p className="mt-1 text-sm text-ink-2">Dinh dưỡng, bớt gì cho hợp khẩu vị, thay nguyên liệu... Trợ lý trả lời dựa trên công thức đang xem.</p>

      <div
        ref={logRef}
        role="log"
        aria-label="Hỏi đáp về món này"
        tabIndex={0}
        className="mt-3 flex h-72 flex-col gap-3 overflow-y-auto rounded-2xl bg-page p-3"
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
                  // Only fills the box: the customer can edit the question, and nothing is sent until they press "Hỏi thêm".
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
          placeholder={turns.length ? "Hỏi tiếp…" : "Ví dụ: món này có hợp cho bé 3 tuổi không?"}
          className="h-11 min-w-0 flex-1 rounded-btn border border-line-2 bg-surface px-3 text-sm"
        />
        {/* Fixed minimum width: "Đang hỏi…" is wider than "Hỏi thêm" and must not resize the row. */}
        <Button type="submit" icon={<LuSend />} className="min-w-[132px]" aria-disabled={!!pending || !question.trim() || undefined}>
          {pending ? "Đang hỏi…" : "Hỏi thêm"}
        </Button>
      </form>

      <p className="mt-2 text-xs text-ink-2">Số liệu dinh dưỡng chỉ là ước tính, không thay lời khuyên của bác sĩ hay chuyên gia dinh dưỡng.</p>
    </section>
  )
}

"use client"

import { askAboutRecipe } from "@lib/data/kitchen"
import { useRef, useState } from "react"
import { LuChefHat, LuSend } from "react-icons/lu"

import Button from "@modules/common/components/button"

const SUGGESTIONS = [
  "Món này khoảng bao nhiêu calo?",
  "Nên bớt gì cho hợp khẩu vị miền Bắc?",
  "Làm sao để món ít mặn, ít cay hơn?",
]

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "answer"; text: string }
  | { status: "failed"; message: string }

/**
 * "Hỏi thêm về món này". The AI is called only when the customer presses the
 * button, and it answers from this recipe. A new question replaces the old
 * answer (one question at a time, no chat history).
 */
export default function AskPanel({ recipeId, servings }: { recipeId: string; servings: number }) {
  const [question, setQuestion] = useState("")
  const [state, setState] = useState<State>({ status: "idle" })
  // Only the latest question may write the answer.
  const latest = useRef(0)

  const ask = async (text: string) => {
    const q = text.trim()
    if (!q || state.status === "loading") return
    const id = ++latest.current
    setState({ status: "loading" })
    const result = await askAboutRecipe(recipeId, q, servings)
    if (id !== latest.current) return
    if (result.ok && result.data.answer) {
      setState({ status: "answer", text: result.data.answer })
    } else if (!result.ok && result.reason === "unavailable") {
      setState({ status: "failed", message: "Trợ lý Bếp tạm nghỉ, bạn thử lại sau nhé." })
    } else {
      setState({ status: "failed", message: "Chưa trả lời được câu này, bạn thử hỏi lại nhé." })
    }
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

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="touch-target rounded-full border border-line-2 px-3 py-1.5 text-sm hover:bg-page"
            onClick={() => {
              setQuestion(s)
              void ask(s)
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void ask(question)
        }}
      >
        <label htmlFor="kitchen-question" className="sr-only">
          Câu hỏi về món này
        </label>
        <input
          id="kitchen-question"
          value={question}
          maxLength={300}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ví dụ: món này có hợp cho bé 3 tuổi không?"
          className="h-11 min-w-0 flex-1 rounded-btn border border-line-2 bg-surface px-3 text-sm"
        />
        <Button type="submit" icon={<LuSend />} aria-disabled={state.status === "loading" || !question.trim() || undefined}>
          {state.status === "loading" ? "Đang hỏi…" : "Hỏi thêm"}
        </Button>
      </form>

      <div aria-live="polite" className="mt-3">
        {state.status === "answer" && (
          <div className="rounded-2xl bg-brand-bg p-4 text-sm leading-6">
            <p className="whitespace-pre-line">{state.text}</p>
            <p className="mt-2 text-xs text-ink-2">Số liệu dinh dưỡng chỉ là ước tính, không thay lời khuyên của bác sĩ hay chuyên gia dinh dưỡng.</p>
          </div>
        )}
        {state.status === "failed" && <p className="rounded-2xl bg-warn-bg p-4 text-sm text-warn-ink">{state.message}</p>}
      </div>
    </section>
  )
}

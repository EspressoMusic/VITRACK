import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SUPERFOODS, type SuperfoodDef } from '../lib/superfoods'
import { SUPERFOOD_CONTENT } from '../lib/i18n/superfoodsPanel'
import { NUTRITION_CHAT_STRINGS } from '../lib/i18n/nutritionChat'
import type { Lang } from '../lib/i18n/lang'
import { askNutritionBot, AnalyzeError, type ChatFoodSuggestion } from '../lib/api'
import { CloseIcon, SendIcon } from './icons'
import { SuperfoodDetailModal } from './SuperfoodsPanel'

/** Matches a bot-suggested food name against the catalog (in the current language) so a tap
 *  can open the rich, fully-localized detail modal instead of the plain chat-card info. */
function findCatalogFood(name: string, lang: Lang): SuperfoodDef | null {
  const normalized = name.trim().toLowerCase()
  const content = SUPERFOOD_CONTENT[lang]
  return SUPERFOODS.find((f) => content[f.id]?.name.trim().toLowerCase() === normalized) ?? null
}

function ChatFoodCard({ food, onSelect }: { food: ChatFoodSuggestion; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5"
      style={{ backgroundColor: 'var(--surface-1)', border: '2px solid #000000' }}
    >
      <span className="text-base leading-none" aria-hidden>
        {food.emoji}
      </span>
      <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {food.name}
      </span>
    </button>
  )
}

function ChatFoodModal({ food, onClose }: { food: ChatFoodSuggestion; onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl p-4 text-center"
        style={{ backgroundColor: '#e5c184', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={onClose}
          aria-label={food.name}
          className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        <span className="text-5xl" aria-hidden>
          {food.emoji}
        </span>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {food.name}
        </h2>
        {food.tip && (
          <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
            {food.tip}
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}

interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
  foods?: ChatFoodSuggestion[]
}

export function NutritionChatModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = NUTRITION_CHAT_STRINGS[lang]
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [catalogFood, setCatalogFood] = useState<SuperfoodDef | null>(null)
  const [chatFood, setChatFood] = useState<ChatFoodSuggestion | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next: ChatTurn[] = [...turns, { role: 'user', content: text }]
    setTurns(next)
    setInput('')
    setLoading(true)
    try {
      const res = await askNutritionBot(
        next.map(({ role, content }) => ({ role, content })),
        lang
      )
      setTurns((prev) => [...prev, { role: 'assistant', content: res.reply, foods: res.foods }])
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: err instanceof AnalyzeError ? err.message : t.errorMessage },
      ])
    } finally {
      setLoading(false)
    }
  }

  function selectFood(food: ChatFoodSuggestion) {
    const match = findCatalogFood(food.name, lang)
    if (match) setCatalogFood(match)
    else setChatFood(food)
  }

  return createPortal(
    <div className="fixed inset-0 z-[65] flex items-end justify-center px-3 pb-3 sm:items-center" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex h-[75vh] max-h-[640px] w-full max-w-sm flex-col gap-2 rounded-3xl p-3"
        style={{ backgroundColor: 'var(--surface-cream)', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={onClose}
          aria-label={t.closeAriaLabel}
          className="absolute end-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>

        <div ref={scrollRef} className="thin-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1.5 pt-8">
          {turns.map((turn, i) => (
            <div key={i} className={`flex flex-col gap-1 ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
              <p
                className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-snug"
                style={{
                  backgroundColor: turn.role === 'user' ? 'var(--accent)' : 'var(--surface-1)',
                  color: turn.role === 'user' ? 'white' : 'var(--text-primary)',
                  border: turn.role === 'user' ? 'none' : '1.5px solid rgba(0,0,0,0.15)',
                }}
              >
                {turn.content}
              </p>
              {turn.foods && turn.foods.length > 0 && (
                <div className="flex max-w-[92%] flex-wrap gap-1.5">
                  {turn.foods.map((food, fi) => (
                    <ChatFoodCard key={fi} food={food} onSelect={() => selectFood(food)} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }} aria-hidden>
              …
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'var(--surface-1)', border: '2px solid #000000' }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            style={{ color: 'var(--text-primary)' }}
            autoFocus
          />
          <button
            type="submit"
            aria-label={t.sendAriaLabel}
            disabled={loading || !input.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition"
            style={{ backgroundColor: 'var(--accent)', color: 'white', opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            <SendIcon className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {catalogFood && <SuperfoodDetailModal food={catalogFood} onClose={() => setCatalogFood(null)} />}
      {chatFood && <ChatFoodModal food={chatFood} onClose={() => setChatFood(null)} />}
    </div>,
    document.body
  )
}

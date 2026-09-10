import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRITION_CHAT_STRINGS } from '../lib/i18n/nutritionChat'
import { SUPERFOODS_PANEL_CHROME } from '../lib/i18n/superfoodsPanel'
import { FAVORITES_PANEL_STRINGS } from '../lib/i18n/favoritesPanel'
import { askNutritionBot, AnalyzeError, type ChatFoodSuggestion, type ChatMealSuggestion } from '../lib/api'
import { getSavedMeals, saveMeal, unsaveMeal, type SavedMeal } from '../lib/savedMeals'
import { SendIcon, StarIcon, CloseIcon } from './icons'
import { MacroSummaryRow } from './MacroSummaryRow'
import { SavedMealCard } from './FavoritesPanel'

const CHAT_HEADER = '#6b4423'
const CHAT_WALLPAPER = '#f6e4bb'
const CHAT_OUTGOING = '#eec978'

/** The whole card is NOT a click target — only the "Choose" button is. Otherwise a stray tap
 *  anywhere on the card (which is easy to do while scrolling the chat) silently sends a chat
 *  message on the user's behalf. */
function ChatFoodCard({ food, disabled, onChoose, chooseLabel }: { food: ChatFoodSuggestion; disabled: boolean; onChoose: () => void; chooseLabel: string }) {
  return (
    <div
      className="flex min-w-0 flex-col gap-1.5 rounded-xl px-2 py-2"
      style={{ backgroundColor: 'var(--surface-cream)', border: '1.5px solid rgba(0,0,0,0.15)', opacity: disabled ? 0.6 : 1 }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
          {food.emoji}
        </span>
        <span className="truncate text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {food.name}
        </span>
      </div>
      <button
        type="button"
        onClick={onChoose}
        disabled={disabled}
        className="w-full rounded-full py-1 text-[10px] font-semibold text-white transition active:translate-y-0.5"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {chooseLabel}
      </button>
    </div>
  )
}

/** Groups the bot's food suggestions into one bordered square, matching the app's
 *  card language, instead of loose pills floating in the chat bubble area. Each card's
 *  "Choose" button sends it back into the conversation so the bot continues from that
 *  choice, instead of dead-ending in a popup. */
function ChatFoodGrid({ foods, disabled, onChoose, chooseLabel }: { foods: ChatFoodSuggestion[]; disabled: boolean; onChoose: (food: ChatFoodSuggestion) => void; chooseLabel: string }) {
  return (
    <div
      className="grid w-full max-w-[92%] grid-cols-2 gap-1.5 rounded-2xl p-2"
      style={{ backgroundColor: CHAT_WALLPAPER, border: '2px solid #000000' }}
    >
      {foods.map((food, fi) => (
        <ChatFoodCard key={fi} food={food} disabled={disabled} onChoose={() => onChoose(food)} chooseLabel={chooseLabel} />
      ))}
    </div>
  )
}

/** A full meal suggestion — richer than ChatFoodCard, so it carries its own macro breakdown via
 *  the same MacroSummaryRow used by scan results and the meal detail modal. The card itself is
 *  not a click target (a stray tap while scrolling the chat must not silently send a message on
 *  the user's behalf) — picking "Choose" sends it back into the conversation so the bot continues
 *  from it; the star in the corner saves it into favorites instead, independent of that. */
function ChatMealCard({
  meal,
  disabled,
  saved,
  onChoose,
  onToggleSave,
  saveLabel,
  unsaveLabel,
  chooseLabel,
}: {
  meal: ChatMealSuggestion
  disabled: boolean
  saved: boolean
  onChoose: () => void
  onToggleSave: () => void
  saveLabel: string
  unsaveLabel: string
  chooseLabel: string
}) {
  return (
    <div
      className="relative flex w-full max-w-[92%] flex-col gap-1.5 rounded-2xl p-2 text-start"
      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', opacity: disabled ? 0.6 : 1 }}
    >
      <button
        type="button"
        onClick={onToggleSave}
        aria-label={saved ? unsaveLabel : saveLabel}
        aria-pressed={saved}
        className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: saved ? 'var(--accent-strong)' : 'var(--text-primary)' }}
      >
        <StarIcon className="h-3 w-3" filled={saved} />
      </button>
      <div className="flex items-center gap-1.5 px-0.5 pe-7">
        <span className="text-base leading-none" aria-hidden>
          {meal.emoji}
        </span>
        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          {meal.name}
        </span>
      </div>
      {meal.tip && (
        <p className="px-0.5 text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {meal.tip}
        </p>
      )}
      <MacroSummaryRow macros={{ calories: meal.calories, carbsG: meal.carbsG, fatG: meal.fatG, proteinG: meal.proteinG }} />
      <button
        type="button"
        onClick={onChoose}
        disabled={disabled}
        className="mt-0.5 w-full rounded-full py-1.5 text-xs font-semibold text-white transition active:translate-y-0.5"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {chooseLabel}
      </button>
    </div>
  )
}

/** Short tappable choice chips shown under a clarifying question, so the user can pick one
 *  instead of typing a free-form reply. Picking a chip sends its label back into the chat. */
function ChatOptionRow({ options, disabled, onChoose }: { options: string[]; disabled: boolean; onChoose: (option: string) => void }) {
  return (
    <div className="flex max-w-[92%] flex-wrap gap-1.5">
      {options.map((option, oi) => (
        <button
          key={oi}
          onClick={() => onChoose(option)}
          disabled={disabled}
          className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition active:translate-y-0.5"
          style={{ backgroundColor: 'var(--surface-cream)', border: '1.5px solid rgba(0,0,0,0.15)', color: 'var(--text-primary)', opacity: disabled ? 0.6 : 1 }}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
  options?: string[]
  foods?: ChatFoodSuggestion[]
  meals?: ChatMealSuggestion[]
}

/** The nutrition bot, shown as its own tab (replaces the old workouts tab) so it's always
 *  reachable instead of living behind an overlay trigger. */
export function ChatPanel() {
  const { lang, dir } = useLanguage()
  const t = NUTRITION_CHAT_STRINGS[lang]
  const st = SUPERFOODS_PANEL_CHROME[lang]
  const ft = FAVORITES_PANEL_STRINGS[lang]
  const [turns, setTurns] = useState<ChatTurn[]>([{ role: 'assistant', content: t.greeting }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() => getSavedMeals())
  const [showSavedMeals, setShowSavedMeals] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const savedMealNames = new Set(savedMeals.map((m) => m.name))

  function toggleSavedMeal(meal: ChatMealSuggestion) {
    if (savedMealNames.has(meal.name)) unsaveMeal(meal.name)
    else saveMeal(meal)
    setSavedMeals(getSavedMeals())
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, loading])

  async function sendMessage(text: string) {
    if (!text || loading) return
    const next: ChatTurn[] = [...turns, { role: 'user', content: text }]
    setTurns(next)
    setLoading(true)
    try {
      const res = await askNutritionBot(
        next.map(({ role, content }) => ({ role, content })),
        lang
      )
      setTurns((prev) => [...prev, { role: 'assistant', content: res.reply, options: res.options, foods: res.foods, meals: res.meals }])
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: err instanceof AnalyzeError ? err.message : t.errorMessage },
      ])
    } finally {
      setLoading(false)
    }
  }

  function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    sendMessage(text)
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-20 pt-12">
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl"
        style={{ border: '3px solid #000000', boxShadow: '0 5px 0 #c9a463' }}
      >
        <div className="relative flex shrink-0 items-center justify-center px-3 py-2.5" style={{ backgroundColor: CHAT_HEADER }}>
          <span className="text-sm font-semibold" style={{ color: '#f5deb3' }}>
            {showSavedMeals ? ft.savedMealsTitle : t.title}
          </span>
          {showSavedMeals ? (
            <button
              type="button"
              onClick={() => setShowSavedMeals(false)}
              aria-label={t.closeAriaLabel}
              className="absolute end-2 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ color: '#f5deb3' }}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSavedMeals(true)}
              aria-label={ft.savedMealsTitle}
              className="absolute end-2 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ color: '#f5deb3' }}
            >
              <StarIcon className="h-4 w-4" filled={savedMeals.length > 0} />
            </button>
          )}
        </div>

        {showSavedMeals ? (
          <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3" style={{ backgroundColor: CHAT_WALLPAPER }}>
            {savedMeals.length === 0 ? (
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {ft.emptyMeals}
              </p>
            ) : (
              savedMeals.map((meal) => (
                <SavedMealCard
                  key={meal.name}
                  meal={meal}
                  removeAriaLabel={ft.removeAriaLabel}
                  onRemove={() => {
                    unsaveMeal(meal.name)
                    setSavedMeals(getSavedMeals())
                  }}
                />
              ))
            )}
          </div>
        ) : (
        <div
          ref={scrollRef}
          className="thin-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3"
          style={{ backgroundColor: CHAT_WALLPAPER }}
        >
          {turns.map((turn, i) => (
            <div key={i} className={`flex flex-col gap-1 ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
              <p
                className={`max-w-[85%] px-3 py-2 text-start text-xs leading-snug ${
                  turn.role === 'user' ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'
                }`}
                style={{
                  backgroundColor: turn.role === 'user' ? CHAT_OUTGOING : 'var(--surface-cream)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                }}
              >
                {turn.content}
              </p>
              {turn.options && turn.options.length > 0 && (
                <ChatOptionRow options={turn.options} disabled={loading} onChoose={(option) => sendMessage(option)} />
              )}
              {turn.foods && turn.foods.length > 0 && (
                <ChatFoodGrid foods={turn.foods} disabled={loading} onChoose={(food) => sendMessage(food.name)} chooseLabel={t.chooseLabel} />
              )}
              {turn.meals && turn.meals.length > 0 && (
                <div className="flex w-full max-w-[92%] flex-col gap-2">
                  {turn.meals.map((meal, mi) => (
                    <ChatMealCard
                      key={mi}
                      meal={meal}
                      disabled={loading}
                      saved={savedMealNames.has(meal.name)}
                      onChoose={() => sendMessage(meal.name)}
                      onToggleSave={() => toggleSavedMeal(meal)}
                      saveLabel={st.save}
                      unsaveLabel={st.unsave}
                      chooseLabel={t.chooseLabel}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-sm px-3 py-2.5" aria-hidden style={{ backgroundColor: 'var(--surface-cream)', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="typing-dot h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--text-secondary)', animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
        )}

        {!showSavedMeals && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex shrink-0 items-center gap-1.5 p-2.5"
          style={{ backgroundColor: CHAT_WALLPAPER }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            dir={dir}
            lang={lang}
            className="min-w-0 flex-1 rounded-full px-3 py-2 text-xs outline-none"
            style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000' }}
          />
          <button
            type="submit"
            aria-label={t.sendAriaLabel}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition"
            style={{ backgroundColor: CHAT_HEADER, color: '#f5deb3', opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            <SendIcon className="h-3.5 w-3.5" />
          </button>
        </form>
        )}
      </div>

      {!showSavedMeals && (
        <p className="shrink-0 px-2 pt-1.5 text-center text-[10px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {t.disclaimer}
        </p>
      )}
    </div>
  )
}

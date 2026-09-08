import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MealEntry } from '../types'
import { getAllMeals } from '../lib/db'
import { buildCalendarGrid, formatFriendlyDate, shortMonthLabel, toLocalDateKey, todayKey, weekdayLetters } from '../lib/date'
import { EMPTY_MACROS, isMacroTrackingEnabled, sumMacros } from '../lib/macros'
import { useLanguage } from '../contexts/LanguageContext'
import { CALENDAR_PANEL_STRINGS } from '../lib/i18n/calendarPanel'
import { MOTIVATION_CHAT_STRINGS } from '../lib/i18n/motivationChat'
import type { Lang } from '../lib/i18n/lang'
import { askNutritionBot, AnalyzeError } from '../lib/api'
import { MealDetailModal } from './MealDetailModal'
import { SendIcon, ExpandIcon, CloseIcon } from './icons'
import { resolveFoodEmoji } from '../lib/foodEmoji'

const GRID_COLS = 'grid-cols-7'

interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

const CHAT_HEADER = '#6b4423'
const CHAT_WALLPAPER = '#f6e4bb'
const CHAT_OUTGOING = '#eec978'

/** Always-visible workout-motivation chat embedded below the calendar card, styled like a
 *  messaging app so it reads as a running pep-talk conversation rather than a Q&A widget. */
function MotivationChat({ lang }: { lang: Lang }) {
  const t = MOTIVATION_CHAT_STRINGS[lang]
  const [expanded, setExpanded] = useState(false)
  const [turns, setTurns] = useState<ChatTurn[]>([{ role: 'assistant', content: t.greeting }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
      const res = await askNutritionBot(next, lang, 'motivation')
      setTurns((prev) => [...prev, { role: 'assistant', content: res.reply }])
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: err instanceof AnalyzeError ? err.message : t.errorMessage },
      ])
    } finally {
      setLoading(false)
    }
  }

  const card = (
    <div
      className={
        expanded
          ? 'modal-card-enter relative z-10 flex h-[75vh] max-h-[640px] w-full max-w-sm flex-col overflow-hidden rounded-2xl'
          : 'mx-auto flex w-[92%] min-h-0 flex-1 flex-col overflow-hidden rounded-2xl'
      }
      style={{ border: '3px solid #000000', boxShadow: '0 5px 0 #c9a463' }}
    >
      <div className="flex shrink-0 items-center gap-2 px-3 py-2" style={{ backgroundColor: CHAT_HEADER }}>
        <span className="flex-1 text-center text-xs font-semibold" style={{ color: '#f5deb3' }}>{t.title}</span>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? t.collapseAriaLabel : t.expandAriaLabel}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#f5deb3' }}
        >
          {expanded ? <CloseIcon className="h-3 w-3" /> : <ExpandIcon className="h-3 w-3" />}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="thin-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2.5"
        style={{ backgroundColor: CHAT_WALLPAPER }}
      >
        {turns.map((turn, i) => (
          <p
            key={i}
            className={`max-w-[85%] px-2.5 py-1.5 text-start text-[11px] leading-snug ${
              turn.role === 'user' ? 'self-end rounded-2xl rounded-br-sm' : 'self-start rounded-2xl rounded-bl-sm'
            }`}
            style={{
              backgroundColor: turn.role === 'user' ? CHAT_OUTGOING : 'var(--surface-cream)',
              color: 'var(--text-primary)',
              boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
            }}
          >
            {turn.content}
          </p>
        ))}
        {loading && (
          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }} aria-hidden>
            …
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex shrink-0 items-center gap-1.5 p-2"
        style={{ backgroundColor: CHAT_WALLPAPER }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="min-w-0 flex-1 rounded-full px-3 py-1.5 text-[11px] outline-none"
          style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          aria-label={t.sendAriaLabel}
          disabled={loading || !input.trim()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition"
          style={{ backgroundColor: CHAT_HEADER, color: '#f5deb3', opacity: loading || !input.trim() ? 0.5 : 1 }}
        >
          <SendIcon className="h-3 w-3" />
        </button>
      </form>
    </div>
  )

  if (expanded) {
    return createPortal(
      <div className="fixed inset-0 z-[65] flex items-center justify-center px-4" role="dialog" aria-modal="true">
        <div
          className="modal-backdrop-enter absolute inset-0"
          style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={() => setExpanded(false)}
        />
        {card}
      </div>,
      document.body
    )
  }

  return card
}

export function CalendarPanel({ refreshSignal }: { refreshSignal: number }) {
  const { lang, dir } = useLanguage()
  const t = CALENDAR_PANEL_STRINGS[lang]
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [view, setView] = useState<'month' | 'day'>('month')
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null)

  useEffect(() => {
    getAllMeals().then(setMeals)
  }, [refreshSignal])

  const mealsByDate = useMemo(() => {
    const map = new Map<string, MealEntry[]>()
    for (const meal of meals) {
      const list = map.get(meal.date) ?? []
      list.push(meal)
      map.set(meal.date, list)
    }
    return map
  }, [meals])

  const grid = useMemo(() => buildCalendarGrid(cursor.year, cursor.month), [cursor])
  const weeks = useMemo(() => {
    const rows: Date[][] = []
    for (let i = 0; i < grid.length; i += 7) rows.push(grid.slice(i, i + 7))
    return rows
  }, [grid])
  const today = todayKey()

  const selectedMeals = mealsByDate.get(selectedDate) ?? []
  const trackNutrition = isMacroTrackingEnabled()
  const dayCalories = useMemo(() => sumMacros(selectedMeals.map((m) => m.macros ?? EMPTY_MACROS)).calories, [selectedMeals])

  function changeMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const selectedLabel = selectedDate === today ? t.todayPrefix : formatFriendlyDate(selectedDate, lang)

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-2.5 pt-5 text-center">
      <div
        className="mx-auto w-[92%] shrink-0 rounded-3xl p-2.5"
        style={{ backgroundColor: '#e5c184', border: '4px solid #000000', boxShadow: '0 7px 0 #c9a463, 0 10px 26px rgba(11,11,11,0.16)' }}
      >
        <div className="relative overflow-hidden">
          <div
            aria-hidden={view !== 'month'}
            style={{
              transform: `translateX(${view === 'day' ? (dir === 'rtl' ? '101%' : '-101%') : '0%'})`,
              transition: 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
              pointerEvents: view === 'month' ? 'auto' : 'none',
            }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <button
                onClick={() => changeMonth(-1)}
                aria-label={t.prevMonthAriaLabel}
                className="flex h-6 w-6 items-center justify-center text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {dir === 'rtl' ? '›' : '‹'}
              </button>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {shortMonthLabel(cursor.year, cursor.month, lang)}
              </span>
              <button
                onClick={() => changeMonth(1)}
                aria-label={t.nextMonthAriaLabel}
                className="flex h-6 w-6 items-center justify-center text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {dir === 'rtl' ? '‹' : '›'}
              </button>
            </div>

            <div className={`mb-1 grid ${GRID_COLS} gap-0.5 text-center text-[10px] font-medium`}>
              {weekdayLetters(lang).map((w, i) => (
                <span key={i} style={{ color: '#000000' }}>
                  {w}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-0.5">
              {weeks.map((week) => (
                <div key={toLocalDateKey(week[0])} className={`grid ${GRID_COLS} items-center gap-0.5`}>
                  {week.map((date) => {
                    const key = toLocalDateKey(date)
                    const inMonth = date.getMonth() === cursor.month
                    const hasActivity = (mealsByDate.get(key)?.length ?? 0) > 0
                    const isToday = key === today
                    const isSelected = key === selectedDate
                    const background = hasActivity
                      ? undefined
                      : isToday
                        ? 'var(--accent-strong)'
                        : '#f0dcab'
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedDate(key)
                          setView('day')
                        }}
                        className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-semibold transition ${hasActivity ? 'calendar-day-gold' : ''}`}
                        style={{
                          color: hasActivity ? '#3a2a06' : isToday ? '#ffffff' : inMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                          background,
                          border: isSelected ? '4px solid #000000' : '3px solid #000000',
                          opacity: inMonth ? 1 : 0.4,
                        }}
                      >
                        <span className="leading-none">{date.getDate()}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute inset-0 flex flex-col"
            aria-hidden={view !== 'day'}
            style={{
              transform: `translateX(${view === 'day' ? '0%' : dir === 'rtl' ? '-101%' : '101%'})`,
              transition: 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
              pointerEvents: view === 'day' ? 'auto' : 'none',
            }}
          >
            <div className="mb-1.5 flex shrink-0 items-center justify-between">
              <button
                onClick={() => setView('month')}
                aria-label={t.backAriaLabel}
                className="flex h-6 w-6 items-center justify-center text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {dir === 'rtl' ? '›' : '‹'}
              </button>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedLabel}
              </span>
              <span className="h-6 w-6" />
            </div>

            {trackNutrition && (
              <div className="mb-1.5 flex shrink-0 items-center justify-center">
                <span className="text-3xl font-extrabold" style={{ color: '#000000' }}>
                  {Math.round(dayCalories).toLocaleString()}
                </span>
              </div>
            )}

            <div className="thin-scroll flex min-h-0 flex-1 flex-wrap content-start justify-center gap-1.5 overflow-y-auto pe-1 pb-1">
              {selectedMeals.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {t.noMealsLoggedThisDay}
                  </p>
                </div>
              ) : (
                selectedMeals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal)}
                    aria-label={meal.foods.length > 0 ? meal.foods[0].name : t.mealFallbackName}
                    className="relative flex aspect-square w-[30%] shrink-0 items-center justify-center rounded-lg transition-transform active:translate-y-1 active:shadow-none"
                    style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 3px 0 #000000' }}
                  >
                    <span className="text-3xl leading-none">{resolveFoodEmoji(meal.foods[0]?.name)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col pb-20">
        <MotivationChat lang={lang} />
      </div>

      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
    </div>
  )
}

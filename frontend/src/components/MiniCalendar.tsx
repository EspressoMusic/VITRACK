import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MealEntry } from '../types'
import { getAllMeals } from '../lib/db'
import { buildCalendarGrid, formatFriendlyDate, monthLabel, toLocalDateKey, todayKey, WEEKDAY_NAMES } from '../lib/date'
import { EMPTY_MACROS, isMacroTrackingEnabled, macroTargetFor, sumMacros } from '../lib/macros'
import { useLanguage } from '../contexts/LanguageContext'
import { CALENDAR_PANEL_STRINGS } from '../lib/i18n/calendarPanel'
import { MealDetailModal } from './MealDetailModal'
import { AppleIcon, CloseIcon } from './icons'

const GRID_COLS = 'grid-cols-7'

/** Compact month calendar meant to sit alongside other content (e.g. the superfoods list).
 *  Tapping a day opens that day's logged meals in a small overlay instead of taking over the screen. */
export function MiniCalendar() {
  const { lang, dir } = useLanguage()
  const t = CALENDAR_PANEL_STRINGS[lang]
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null)

  useEffect(() => {
    getAllMeals().then(setMeals)
  }, [])

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

  function changeMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const selectedMeals = selectedDate ? (mealsByDate.get(selectedDate) ?? []) : []
  const selectedLabel = selectedDate
    ? selectedDate === today
      ? `${t.todayPrefix} · ${formatFriendlyDate(selectedDate)}`
      : formatFriendlyDate(selectedDate)
    : ''
  const trackNutrition = isMacroTrackingEnabled()
  const dayCalories = useMemo(() => sumMacros(selectedMeals.map((m) => m.macros ?? EMPTY_MACROS)).calories, [selectedMeals])

  return (
    <div className="flex h-full w-[124px] shrink-0 flex-col rounded-2xl p-1.5" style={{ backgroundColor: '#e5c184', border: '3px solid #000000', boxShadow: '0 4px 0 #000000' }}>
      <div className="mb-1 flex shrink-0 items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          aria-label={t.prevMonthAriaLabel}
          className="flex h-4 w-4 items-center justify-center text-[10px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {dir === 'rtl' ? '›' : '‹'}
        </button>
        <span className="truncate px-0.5 text-[9px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {monthLabel(cursor.year, cursor.month)}
        </span>
        <button
          onClick={() => changeMonth(1)}
          aria-label={t.nextMonthAriaLabel}
          className="flex h-4 w-4 items-center justify-center text-[10px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {dir === 'rtl' ? '‹' : '›'}
        </button>
      </div>

      <div className={`mb-0.5 grid ${GRID_COLS} gap-[2px] text-center text-[7px] font-medium`}>
        {WEEKDAY_NAMES.map((w) => (
          <span key={w} style={{ color: '#000000' }}>
            {w.slice(0, 1)}
          </span>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between gap-[2px]">
        {weeks.map((week) => (
          <div key={toLocalDateKey(week[0])} className={`grid ${GRID_COLS} items-center gap-[2px]`}>
            {week.map((date) => {
              const key = toLocalDateKey(date)
              const inMonth = date.getMonth() === cursor.month
              const hasActivity = (mealsByDate.get(key)?.length ?? 0) > 0
              const isToday = key === today
              const isSelected = key === selectedDate
              const background = hasActivity ? undefined : isToday ? 'var(--accent-strong)' : '#f0dcab'
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`flex aspect-square flex-col items-center justify-center rounded text-[7px] font-semibold leading-none transition ${hasActivity ? 'calendar-day-gold' : ''}`}
                  style={{
                    color: hasActivity ? '#3a2a06' : isToday ? '#ffffff' : inMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                    background,
                    border: isSelected ? '2px solid #000000' : '1px solid #00000055',
                    opacity: inMonth ? 1 : 0.4,
                  }}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {selectedDate &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
            <div
              className="modal-backdrop-enter absolute inset-0"
              style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={() => setSelectedDate(null)}
            />
            <div
              className="modal-card-enter relative z-10 flex max-h-[70dvh] w-full max-w-xs flex-col gap-2 rounded-3xl p-4"
              style={{ backgroundColor: 'var(--surface-0)', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
            >
              <button
                onClick={() => setSelectedDate(null)}
                aria-label={t.prevMonthAriaLabel}
                className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
              <h2 className="pe-6 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedLabel}
              </h2>

              {trackNutrition && selectedMeals.length > 0 && (
                <div className="flex shrink-0 items-center justify-center">
                  <span
                    className="text-xl font-extrabold"
                    style={{ color: dayCalories > macroTargetFor('calories') ? 'var(--status-critical)' : 'var(--status-good)' }}
                  >
                    {Math.round(dayCalories).toLocaleString()}
                  </span>
                </div>
              )}

              {selectedMeals.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {t.noMealsLoggedThisDay}
                </p>
              ) : (
                <div className="thin-scroll flex min-h-0 flex-1 flex-wrap content-start justify-center gap-1.5 overflow-y-auto pb-1">
                  {selectedMeals.map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => setSelectedMeal(meal)}
                      aria-label={meal.foods.length > 0 ? meal.foods[0].name : t.mealFallbackName}
                      className="relative flex aspect-square w-[30%] shrink-0 items-center justify-center rounded-lg transition-transform active:translate-y-1 active:shadow-none"
                      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 3px 0 #000000' }}
                    >
                      <AppleIcon className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
    </div>
  )
}

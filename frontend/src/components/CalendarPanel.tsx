import { useEffect, useMemo, useState } from 'react'
import type { MealEntry } from '../types'
import { getAllMeals } from '../lib/db'
import { buildCalendarGrid, formatFriendlyDate, shortMonthLabel, toLocalDateKey, todayKey, WEEKDAY_NAMES } from '../lib/date'
import { EMPTY_MACROS, isMacroTrackingEnabled, sumMacros } from '../lib/macros'
import { ACHIEVEMENT_TIERS, countGoalDays, type AchievementTier } from '../lib/achievements'
import { useLanguage } from '../contexts/LanguageContext'
import { CALENDAR_PANEL_STRINGS } from '../lib/i18n/calendarPanel'
import { MealDetailModal } from './MealDetailModal'
import { AchievementDetailModal } from './AchievementsPanel'
import { PlusIcon } from './icons'
import { resolveFoodEmoji } from '../lib/foodEmoji'

const GRID_COLS = 'grid-cols-7'

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
  const [selectedTier, setSelectedTier] = useState<AchievementTier | null>(null)

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
  const goalDayCount = useMemo(() => countGoalDays(meals, trackNutrition), [meals, trackNutrition])
  const dayCalories = useMemo(() => sumMacros(selectedMeals.map((m) => m.macros ?? EMPTY_MACROS)).calories, [selectedMeals])

  function changeMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const selectedLabel = selectedDate === today ? t.todayPrefix : formatFriendlyDate(selectedDate)

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
                {shortMonthLabel(cursor.year, cursor.month)}
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
              {WEEKDAY_NAMES.map((w) => (
                <span key={w} style={{ color: '#000000' }}>
                  {w.slice(0, 1)}
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

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <div className="thin-scroll flex min-h-0 flex-1 flex-wrap content-start justify-center gap-x-3 gap-y-1.5 overflow-y-auto px-0.5 pb-20 pt-0.5">
          {ACHIEVEMENT_TIERS.map((tier) => {
            const unlocked = goalDayCount >= tier.threshold
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className="relative flex aspect-square w-16 flex-col items-center justify-center rounded-lg p-1.5"
                style={{
                  backgroundColor: 'var(--surface-cream)',
                  border: '2px solid #000000',
                  boxShadow: '0 3px 0 #000000',
                  opacity: unlocked ? 1 : 0.55,
                }}
              >
                <PlusIcon className="h-6 w-6" style={{ color: unlocked ? tier.color : 'var(--text-secondary)' }} strokeWidth={3} />
              </button>
            )
          })}
        </div>
      </div>

      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
      {selectedTier && (
        <AchievementDetailModal tier={selectedTier} goalDayCount={goalDayCount} onClose={() => setSelectedTier(null)} />
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import type { MealEntry, NutrientId } from '../types'
import { getAllMeals } from '../lib/db'
import { buildCalendarGrid, formatFriendlyDate, monthLabel, toLocalDateKey, todayKey, WEEKDAY_NAMES } from '../lib/date'
import { NUTRIENT_MAP, getVisibleNutrients, percentOfRda } from '../lib/nutrients'
import { MealDetailModal } from './MealDetailModal'

const GRID_COLS = 'grid-cols-7'

function topNutrientLabel(nutrients: MealEntry['nutrients']): string | null {
  let best: { id: NutrientId; percent: number } | null = null
  for (const n of getVisibleNutrients()) {
    const percent = percentOfRda(n.id, nutrients[n.id])
    if (percent > 0 && (!best || percent > best.percent)) best = { id: n.id, percent }
  }
  return best ? `Rich in ${NUTRIENT_MAP[best.id].name}` : null
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function CalendarPanel({ refreshSignal }: { refreshSignal: number }) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(todayKey())
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

  function changeMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const selectedLabel = selectedDate === today ? `Today · ${formatFriendlyDate(selectedDate)}` : formatFriendlyDate(selectedDate)

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-2.5 text-center">
      <div
        className="mx-auto w-[92%] shrink-0 rounded-3xl p-2.5"
        style={{ backgroundColor: '#e5c184', border: '4px solid #000000', boxShadow: '0 7px 0 #c9a463, 0 10px 26px rgba(11,11,11,0.16)' }}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-6 w-6 items-center justify-center text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            ‹
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {monthLabel(cursor.year, cursor.month)}
          </span>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex h-6 w-6 items-center justify-center text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            ›
          </button>
        </div>

        <div className={`mb-1 grid ${GRID_COLS} gap-0.5 text-center text-[10px] font-medium`}>
          {WEEKDAY_NAMES.map((w) => (
            <span key={w} style={{ color: '#000000' }}>
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
                    onClick={() => setSelectedDate(key)}
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

      <div className="mx-auto mt-2 flex w-[92%] min-h-0 flex-1 flex-col p-3">
        <h2 className="mb-1 shrink-0 text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {selectedLabel}
        </h2>

        {selectedMeals.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            No meals logged this day.
          </p>
        ) : (
          <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
            {selectedMeals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className="flex items-center gap-1.5 rounded-lg p-1 text-left transition-transform active:translate-y-1 active:shadow-none"
                style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #1a1a19', boxShadow: '0 2px 0 #1a1a19' }}
              >
                <img
                  src={meal.imageDataUrl}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-md object-cover"
                  style={{ border: '1px solid var(--border)' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {meal.foods.length > 0 ? meal.foods[0].name.split(' ').slice(0, 3).join(' ') : 'Meal'}
                  </p>
                  <p className="truncate text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                    {topNutrientLabel(meal.nutrients) ?? 'No standout nutrients'}
                  </p>
                </div>
                <span className="shrink-0 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {formatTime(meal.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import type { MealEntry } from '../types'
import { getAllMeals } from '../lib/db'
import { buildCalendarGrid, formatFriendlyDate, monthLabel, toLocalDateKey, todayKey, WEEKDAY_NAMES } from '../lib/date'
import { NUTRIENTS, NUTRIENT_MAP, sumNutrients, percentOfRda, coverageStatus, type CoverageStatus } from '../lib/nutrients'
import { MealDetailModal } from './MealDetailModal'

const GRID_COLS = 'grid-cols-7'

function dayOverallStatus(entries: MealEntry[]): CoverageStatus | null {
  if (entries.length === 0) return null
  const total = sumNutrients(entries.map((e) => e.nutrients))
  const avgPercent =
    NUTRIENTS.reduce((sum, n) => sum + Math.min(100, percentOfRda(n.id, total[n.id])), 0) / NUTRIENTS.length
  return coverageStatus(avgPercent)
}

function topNutrientLabel(nutrients: MealEntry['nutrients']): string | null {
  let best: { id: (typeof NUTRIENTS)[number]['id']; percent: number } | null = null
  for (const n of NUTRIENTS) {
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
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-4 pt-2 text-center">
      <div
        className="mx-auto w-[78%] shrink-0 rounded-3xl p-3"
        style={{ backgroundColor: '#e5c184', border: '3px solid var(--accent-strong)', boxShadow: '0 10px 26px rgba(11,11,11,0.16)' }}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            ‹
          </button>
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {monthLabel(cursor.year, cursor.month)}
          </span>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            ›
          </button>
        </div>

        <div className={`mb-1.5 grid ${GRID_COLS} gap-1 text-center text-xs font-medium`}>
          {WEEKDAY_NAMES.map((w) => (
            <span key={w} style={{ color: '#000000' }}>
              {w}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {weeks.map((week) => (
            <div key={toLocalDateKey(week[0])} className={`grid ${GRID_COLS} items-center gap-1`}>
              {week.map((date) => {
                const key = toLocalDateKey(date)
                const inMonth = date.getMonth() === cursor.month
                const status = dayOverallStatus(mealsByDate.get(key) ?? [])
                const isToday = key === today
                const isSelected = key === selectedDate
                const background = status
                  ? status === 'good'
                    ? 'var(--status-good)'
                    : 'var(--status-critical)'
                  : isToday
                    ? 'var(--accent-soft)'
                    : 'var(--surface-cream)'
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    className="flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-semibold transition"
                    style={{
                      color: status ? '#ffffff' : inMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                      background,
                      border: isSelected ? '5px solid #000000' : '4px solid #000000',
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
        className="mx-auto mt-3 flex w-[78%] min-h-0 flex-1 flex-col overflow-hidden rounded-3xl p-4"
        style={{ backgroundColor: '#e5c184', border: '3px solid var(--accent-strong)', boxShadow: '0 10px 26px rgba(11,11,11,0.16)' }}
      >
        <h2 className="mb-2 shrink-0 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          {selectedLabel}
        </h2>

        {selectedMeals.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No meals logged this day.
          </p>
        ) : (
          <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {selectedMeals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className="flex items-center gap-2 rounded-lg p-1.5 text-left"
                style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)' }}
              >
                <img
                  src={meal.imageDataUrl}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-md object-cover"
                  style={{ border: '1px solid var(--border)' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {meal.foods.length > 0 ? meal.foods[0].name.split(' ').slice(0, 3).join(' ') : 'Meal'}
                  </p>
                  <p className="truncate text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {topNutrientLabel(meal.nutrients) ?? 'No standout nutrients'}
                  </p>
                </div>
                <span className="shrink-0 text-[10px]" style={{ color: 'var(--text-muted)' }}>
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

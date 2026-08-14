import { useEffect, useMemo, useState } from 'react'
import type { MealEntry } from '../types'
import { getAllMeals } from '../lib/db'
import { buildCalendarGrid, formatFriendlyDate, monthLabel, toLocalDateKey, todayKey, WEEKDAY_NAMES } from '../lib/date'
import { NUTRIENTS, NUTRIENT_MAP, sumNutrients, percentOfRda, coverageStatus, type CoverageStatus } from '../lib/nutrients'
import { STATUS_VAR } from './StatusDot'

const GRID_COLS = 'grid-cols-7'
const WEEKEND = new Set([0, 6])

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
    <div className="mx-auto flex max-w-md flex-col px-4 pb-6 pt-8 text-center">
      <div
        className="mx-auto w-[90%] rounded-3xl p-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            ‹
          </button>
          <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
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

        <div className={`mb-2 grid ${GRID_COLS} gap-1 text-center text-xs font-medium`}>
          {WEEKDAY_NAMES.map((w, i) => (
            <span key={w} style={{ color: WEEKEND.has(i) ? 'var(--text-muted)' : 'var(--accent)' }}>
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
                const background =
                  status === 'good'
                    ? 'var(--status-good-soft)'
                    : status
                      ? 'var(--status-critical-soft)'
                      : isToday
                        ? 'var(--accent-soft)'
                        : 'rgba(255,255,255,0.35)'
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition"
                    style={{
                      color: inMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                      background,
                      border: isSelected ? '5px solid #b8842a' : '4px solid #d9a441',
                      opacity: inMonth ? 1 : 0.4,
                    }}
                  >
                    <span className="leading-none">{date.getDate()}</span>
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full leading-none"
                      style={{ backgroundColor: status ? STATUS_VAR[status] : 'transparent' }}
                    />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div
        className="mx-auto mt-4 w-[90%] rounded-3xl p-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      >
        <h2 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {selectedLabel}
        </h2>

        {selectedMeals.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No meals logged this day.
          </p>
        ) : (
          <div className="flex flex-col">
            {selectedMeals.map((meal, i) => (
              <div
                key={meal.id}
                className="flex items-center gap-3 py-2.5"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
              >
                <img
                  src={meal.imageDataUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                  style={{ border: '1px solid var(--border)' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {meal.foods.length > 0 ? meal.foods.map((f) => f.name).join(', ') : 'Meal'}
                  </p>
                  <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {topNutrientLabel(meal.nutrients) ?? 'No standout nutrients'}
                  </p>
                </div>
                <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatTime(meal.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

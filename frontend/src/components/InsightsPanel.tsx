import { useEffect, useMemo, useState } from 'react'
import type { MealEntry } from '../types'
import { getAllMeals } from '../lib/db'
import { daysAgoKey } from '../lib/date'
import { NUTRIENTS, sumNutrients, percentOfRda, coverageStatus, NUTRIENT_MAP } from '../lib/nutrients'
import { NutrientBar } from './NutrientBar'
import { WeeklyGoalGlass } from './WeeklyGoalGlass'

const WINDOW_DAYS = 7

export function InsightsPanel({ refreshSignal }: { refreshSignal: number }) {
  const [meals, setMeals] = useState<MealEntry[]>([])

  useEffect(() => {
    getAllMeals().then(setMeals)
  }, [refreshSignal])

  const { loggedDayCount, ranked, weeklyCompletion } = useMemo(() => {
    const windowDates = new Set<string>()
    for (let i = 0; i < WINDOW_DAYS; i++) windowDates.add(daysAgoKey(i))

    const inWindow = meals.filter((m) => windowDates.has(m.date))
    const loggedDays = new Set(inWindow.map((m) => m.date))

    if (loggedDays.size === 0) {
      return {
        loggedDayCount: 0,
        ranked: [] as { id: (typeof NUTRIENTS)[number]['id']; percent: number; avgAmount: number }[],
        weeklyCompletion: 0,
      }
    }

    const total = sumNutrients(inWindow.map((m) => m.nutrients))
    const ranked = NUTRIENTS.map((n) => {
      const avgAmount = total[n.id] / loggedDays.size
      return { id: n.id, avgAmount, percent: percentOfRda(n.id, avgAmount) }
    }).sort((a, b) => a.percent - b.percent)

    const weeklyCompletion = Math.round(
      ranked.reduce((sum, r) => sum + Math.min(100, r.percent), 0) / ranked.length
    )

    return { loggedDayCount: loggedDays.size, ranked, weeklyCompletion }
  }, [meals])

  const deficient = ranked.filter((r) => coverageStatus(r.percent) !== 'good')

  if (meals.length === 0) {
    return (
      <div className="mx-auto flex max-w-[75%] flex-col items-center gap-3 pb-16 pt-6 text-center">
        <WeeklyGoalGlass percent={0} />
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          Nothing here yet
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Snap a meal to see how you're doing.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
      <div>
        <h1 className="mb-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Insights
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Average daily intake across the last {loggedDayCount} logged day{loggedDayCount === 1 ? '' : 's'}
          {' '}(of the past {WINDOW_DAYS}).
        </p>
      </div>

      <div
        className="flex flex-col items-center gap-3 rounded-2xl p-4 text-center"
        style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Weekly completion
        </span>
        <WeeklyGoalGlass percent={weeklyCompletion} />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          How much of this week's vitamin & mineral targets you've covered so far, averaged across all nutrients.
        </p>
      </div>

      {loggedDayCount < 3 && (
        <p
          className="rounded-lg px-3 py-2 text-xs"
          style={{ backgroundColor: 'var(--status-warning-soft)', color: 'var(--text-primary)' }}
        >
          Log a few more meals to get more reliable deficiency estimates.
        </p>
      )}

      {deficient.length === 0 ? (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: 'var(--status-good-soft)', color: 'var(--text-primary)' }}
        >
          Nice work — no clear deficiencies detected in this window.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Needs attention
          </h2>
          {deficient.map((d) => {
            const def = NUTRIENT_MAP[d.id]
            return (
              <div
                key={d.id}
                className="flex flex-col gap-2 rounded-xl p-3"
                style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}
              >
                <NutrientBar id={d.id} amount={d.avgAmount} showStatusLabel />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Natural sources: {def.foodSources.join(', ')}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          All nutrients this week
        </h2>
        <div className="flex flex-col gap-3 rounded-2xl p-3" style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          {ranked.map((r) => (
            <NutrientBar key={r.id} id={r.id} amount={r.avgAmount} />
          ))}
        </div>
      </div>
    </div>
  )
}

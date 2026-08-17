import { useEffect, useMemo, useRef, useState } from 'react'
import type { MealEntry, NutrientId } from '../types'
import { getAllMeals } from '../lib/db'
import { daysAgoKey } from '../lib/date'
import { NUTRIENTS, sumNutrients, percentOfRda, coverageStatus } from '../lib/nutrients'
import { NutrientRow } from './NutrientRow'
import { NutrientDetailModal } from './NutrientDetailModal'
import { MissingToGoalModal } from './MissingToGoalModal'
import { WeeklyGoalGlass } from './WeeklyGoalGlass'
import { ConfettiBurst } from './ConfettiBurst'
import { MedalIcon } from './icons'

const WINDOW_DAYS = 7

export function InsightsPanel({ refreshSignal }: { refreshSignal: number }) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientId | null>(null)
  const [missingOpen, setMissingOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiFired = useRef(false)

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
  const onTrack = ranked.filter((r) => coverageStatus(r.percent) === 'good')

  useEffect(() => {
    if (!confettiFired.current && meals.length > 0 && weeklyCompletion === 100) {
      confettiFired.current = true
      setShowConfetti(true)
    }
  }, [meals, weeklyCompletion])

  if (meals.length === 0) {
    return (
      <div className="mx-auto flex max-w-[75%] flex-col items-center gap-3 pb-16 text-center">
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
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-4">
      {showConfetti && <ConfettiBurst />}
      <div className="mx-auto flex shrink-0 flex-col items-center gap-2 pb-2 text-center">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Weekly completion
        </span>
        <WeeklyGoalGlass percent={weeklyCompletion} onClick={() => setMissingOpen(true)} />
      </div>

      <div
        className="mx-auto flex w-[90%] min-h-0 flex-1 flex-col overflow-hidden rounded-3xl"
        style={{ backgroundColor: '#e5c184', border: '3px solid var(--accent-strong)', boxShadow: '0 10px 26px rgba(11,11,11,0.16)' }}
      >
        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
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
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ backgroundColor: '#f6e4bb', color: '#8a6414', border: '1px solid #d9a441' }}
            >
              <MedalIcon className="h-5 w-5" style={{ color: '#c99a2e' }} />
              Nice work — no deficiencies.
            </p>
          ) : (
            <div className="flex flex-col">
              <h2 className="mb-1 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Needs attention
              </h2>
              <div className="flex flex-col gap-2">
                {deficient.map((d) => (
                  <NutrientRow
                    key={d.id}
                    id={d.id}
                    amount={d.avgAmount}
                    onClick={() => setSelectedNutrient(d.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {onTrack.length > 0 && (
            <div>
              <h2 className="mb-1 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                On track
              </h2>
              <div className="flex flex-col gap-2">
                {onTrack.map((r) => (
                  <NutrientRow
                    key={r.id}
                    id={r.id}
                    amount={r.avgAmount}
                    onClick={() => setSelectedNutrient(r.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedNutrient && (
        <NutrientDetailModal
          id={selectedNutrient}
          amount={ranked.find((r) => r.id === selectedNutrient)?.avgAmount ?? 0}
          onClose={() => setSelectedNutrient(null)}
        />
      )}

      {missingOpen && (
        <MissingToGoalModal
          items={ranked.filter((r) => r.percent < 100)}
          onClose={() => setMissingOpen(false)}
          onSelect={(id) => {
            setMissingOpen(false)
            setSelectedNutrient(id)
          }}
        />
      )}
    </div>
  )
}

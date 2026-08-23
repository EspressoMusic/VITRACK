import { useEffect, useMemo, useRef, useState } from 'react'
import type { MealEntry, NutrientId } from '../types'
import { getAllMeals } from '../lib/db'
import { coverageStatus, isAdvancedMode } from '../lib/nutrients'
import { computeWeeklyInsights } from '../lib/insights'
import { NutrientRow } from './NutrientRow'
import { NutrientDetailModal } from './NutrientDetailModal'
import { MissingToGoalModal } from './MissingToGoalModal'
import { WeeklyGoalGlass } from './WeeklyGoalGlass'
import { ConfettiBurst } from './ConfettiBurst'

export function InsightsPanel({ refreshSignal }: { refreshSignal: number }) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientId | null>(null)
  const [missingOpen, setMissingOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiFired = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAllMeals().then(setMeals)
  }, [refreshSignal])

  const { ranked, weeklyCompletion } = useMemo(() => computeWeeklyInsights(meals), [meals])

  const deficient = ranked.filter((r) => coverageStatus(r.percent) !== 'good')
  const onTrack = ranked.filter((r) => coverageStatus(r.percent) === 'good')

  // Slowly auto-scrolls the nutrient list downward so the user can see everything without
  // manually scrolling, pausing at the bottom before looping back to the top. Only needed in
  // advanced mode, where all nutrients don't fit on screen — simple mode never scrolls.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !isAdvancedMode()) return

    let frameId: number
    let pauseTimeout: ReturnType<typeof setTimeout> | undefined
    const SPEED = 15 // px per second

    let lastTime = performance.now()
    function step(time: number) {
      const dt = (time - lastTime) / 1000
      lastTime = time
      if (el) {
        const maxScroll = el.scrollHeight - el.clientHeight
        if (maxScroll > 0) {
          if (el.scrollTop >= maxScroll - 0.5) {
            el.scrollTop = maxScroll
            pauseTimeout = setTimeout(() => {
              if (el) el.scrollTop = 0
              lastTime = performance.now()
              frameId = requestAnimationFrame(step)
            }, 1500)
            return
          }
          el.scrollTop = Math.min(maxScroll, el.scrollTop + SPEED * dt)
        }
      }
      frameId = requestAnimationFrame(step)
    }
    frameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frameId)
      if (pauseTimeout) clearTimeout(pauseTimeout)
    }
  }, [ranked])

  useEffect(() => {
    if (!confettiFired.current && meals.length > 0 && weeklyCompletion === 100) {
      confettiFired.current = true
      setShowConfetti(true)
    }
  }, [meals, weeklyCompletion])

  if (meals.length === 0) {
    return (
      <div className="mx-auto flex max-w-[75%] flex-col items-center gap-2 pb-16 text-center">
        <WeeklyGoalGlass percent={0} />
        <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
          Nothing here yet
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Snap a meal to see how you're doing.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-4">
      {showConfetti && <ConfettiBurst />}
      <div className="mx-auto mb-1 flex shrink-0 flex-col items-center text-center">
        <WeeklyGoalGlass percent={weeklyCompletion} onClick={() => setMissingOpen(true)} />
      </div>

      <div className="mx-auto flex w-[90%] min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className={`thin-scroll flex min-h-0 flex-1 flex-col gap-1 p-1.5 ${isAdvancedMode() ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          {deficient.length === 0 ? (
            <p
              className="flex items-center justify-center whitespace-nowrap rounded-lg px-1.5 py-1.5 text-xs font-semibold"
              style={{ backgroundColor: '#f6e4bb', color: '#8a6414', border: '1px solid #d9a441' }}
            >
              Nice work! no deficiencies
            </p>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-col gap-1">
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
              <div className="flex flex-col gap-1">
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

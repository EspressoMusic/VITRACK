import { useEffect, useMemo, useRef, useState } from 'react'
import type { MealEntry, NutrientId } from '../types'
import { getAllMeals } from '../lib/db'
import { coverageStatus } from '../lib/nutrients'
import { computeWeeklyInsights } from '../lib/insights'
import { useLanguage } from '../contexts/LanguageContext'
import { INSIGHTS_PANEL_STRINGS } from '../lib/i18n/insightsPanel'
import { NutrientRow } from './NutrientRow'
import { NutrientDetailModal } from './NutrientDetailModal'
import { MissingToGoalModal } from './MissingToGoalModal'
import { WeeklyGoalGlass } from './WeeklyGoalGlass'
import { ConfettiBurst } from './ConfettiBurst'

export function InsightsPanel({ refreshSignal }: { refreshSignal: number }) {
  const { lang } = useLanguage()
  const t = INSIGHTS_PANEL_STRINGS[lang]
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

  // Auto-scrolls the nutrient list downward so the user can see everything without manually
  // scrolling. Each stop reveals one more row at the bottom with its full pill flush against
  // the container edge — never paused with a row sliced in half, which is what made it look
  // broken against the floating camera button/artwork right below this panel. A partial row
  // is only ever left at the *top* (against the harmless space below the goal gauge above),
  // never at the bottom.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const STEP_MS = 500
    const PAUSE_MS = 1400
    let frameId: number
    let timeoutId: ReturnType<typeof setTimeout>
    let cancelled = false

    function easeInOutQuad(t: number): number {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    }

    function animateTo(target: number, onDone: () => void) {
      const start = el!.scrollTop
      const distance = target - start
      const startTime = performance.now()
      function frame(now: number) {
        if (cancelled) return
        const t = Math.min(1, (now - startTime) / STEP_MS)
        el!.scrollTop = start + distance * easeInOutQuad(t)
        if (t < 1) {
          frameId = requestAnimationFrame(frame)
        } else {
          onDone()
        }
      }
      frameId = requestAnimationFrame(frame)
    }

    /** Scroll targets that each land with some row's bottom edge flush against the container's
     *  bottom — i.e. reveal rows strictly by whole rows, ending with the true max scroll. */
    function buildStops(): number[] {
      const rows = Array.from(el!.querySelectorAll<HTMLElement>('button'))
      const maxScroll = el!.scrollHeight - el!.clientHeight
      if (rows.length === 0 || maxScroll <= 0) return []

      const stops = [0]
      for (const row of rows) {
        const bottomFlush = row.offsetTop + row.offsetHeight - el!.clientHeight
        if (bottomFlush > stops[stops.length - 1] + 0.5 && bottomFlush < maxScroll - 0.5) {
          stops.push(bottomFlush)
        }
      }
      stops.push(maxScroll)
      return stops
    }

    function goTo(stops: number[], index: number) {
      animateTo(stops[index], () => {
        timeoutId = setTimeout(() => {
          goTo(stops, index + 1 >= stops.length ? 0 : index + 1)
        }, PAUSE_MS)
      })
    }

    const stops = buildStops()
    if (stops.length > 0) goTo(stops, 0)

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      clearTimeout(timeoutId)
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
      <div className="mx-auto flex h-full max-w-[75%] flex-col items-center gap-2 pt-12 text-center">
        <WeeklyGoalGlass percent={0} size={200} />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-1">
      {showConfetti && <ConfettiBurst />}
      <div className="mx-auto mb-1 flex shrink-0 flex-col items-center gap-1.5 text-center">
        <div className="mt-3">
          <WeeklyGoalGlass percent={weeklyCompletion} onClick={() => setMissingOpen(true)} />
        </div>
      </div>

      <div className="mx-auto flex w-[90%] min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className="thin-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-1.5"
        >
          {deficient.length === 0 ? (
            <p
              className="flex items-center justify-center whitespace-nowrap rounded-lg px-1.5 py-1.5 text-xs font-semibold"
              style={{ backgroundColor: '#f6e4bb', color: '#8a6414', border: '1px solid #d9a441' }}
            >
              {t.niceWorkNoDeficiencies}
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

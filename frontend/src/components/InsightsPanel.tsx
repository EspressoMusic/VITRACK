import { useEffect, useMemo, useRef, useState } from 'react'
import type { MealEntry, NutrientId } from '../types'
import { getAllMeals } from '../lib/db'
import { coverageStatus, isAdvancedMode } from '../lib/nutrients'
import { computeWeeklyInsights } from '../lib/insights'
import { useLanguage } from '../contexts/LanguageContext'
import { INSIGHTS_PANEL_STRINGS } from '../lib/i18n/insightsPanel'
import { NUTRIENT_FEELING } from '../lib/i18n/nutrientFeelings'
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
  // `ranked` is sorted worst-first, so the first deficient entry is the nutrient most worth
  // calling out — that's the one whose real-world symptom the user is most likely to notice.
  const worstDeficient = deficient[0] ?? null

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
        <div className="mt-3">
          <WeeklyGoalGlass percent={0} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-4">
      {showConfetti && <ConfettiBurst />}
      <div className="mx-auto mb-1 flex shrink-0 flex-col items-center gap-1.5 text-center">
        {worstDeficient && (
          <button
            type="button"
            onClick={() => setSelectedNutrient(worstDeficient.id)}
            className="max-w-[85%] text-base font-extrabold underline decoration-dotted underline-offset-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {t.feelingSentence(NUTRIENT_FEELING[lang][worstDeficient.id])}
          </button>
        )}
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

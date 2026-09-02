import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MealEntry, NutrientId } from '../types'
import { getAllMeals } from '../lib/db'
import { todayKey } from '../lib/date'
import { coverageStatus } from '../lib/nutrients'
import { computeWeeklyInsights } from '../lib/insights'
import { useLanguage } from '../contexts/LanguageContext'
import { INSIGHTS_PANEL_STRINGS } from '../lib/i18n/insightsPanel'
import { NutrientRow } from './NutrientRow'
import { NutrientDetailModal } from './NutrientDetailModal'
import { MissingToGoalModal } from './MissingToGoalModal'
import { WeeklyGoalGlass } from './WeeklyGoalGlass'
import { ConfettiBurst } from './ConfettiBurst'
import { CheckIcon, CloseIcon } from './icons'

const LAST_NO_DEFICIENCIES_REWARD_KEY = 'vitrack:lastNoDeficienciesReward'

export function InsightsPanel({ refreshSignal }: { refreshSignal: number }) {
  const { lang } = useLanguage()
  const t = INSIGHTS_PANEL_STRINGS[lang]
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientId | null>(null)
  const [missingOpen, setMissingOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [noDeficienciesOpen, setNoDeficienciesOpen] = useState(false)
  const confettiFired = useRef(false)
  const noDeficienciesFired = useRef(false)

  useEffect(() => {
    getAllMeals().then((m) => {
      setMeals(m)
      setLoaded(true)
    })
  }, [refreshSignal])

  const { ranked, weeklyCompletion } = useMemo(() => computeWeeklyInsights(meals), [meals])

  const deficient = ranked.filter((r) => coverageStatus(r.percent) !== 'good')
  const onTrack = ranked.filter((r) => coverageStatus(r.percent) === 'good')

  useEffect(() => {
    if (!confettiFired.current && meals.length > 0 && weeklyCompletion === 100) {
      confettiFired.current = true
      setShowConfetti(true)
    }
  }, [meals, weeklyCompletion])

  useEffect(() => {
    if (
      !noDeficienciesFired.current &&
      meals.length > 0 &&
      deficient.length === 0 &&
      localStorage.getItem(LAST_NO_DEFICIENCIES_REWARD_KEY) !== todayKey()
    ) {
      noDeficienciesFired.current = true
      localStorage.setItem(LAST_NO_DEFICIENCIES_REWARD_KEY, todayKey())
      setNoDeficienciesOpen(true)
      setShowConfetti(true)
    }
  }, [meals, deficient.length])

  if (!loaded) return null

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
        <div className="mt-8">
          <WeeklyGoalGlass percent={weeklyCompletion} onClick={() => setMissingOpen(true)} size={130} />
        </div>
      </div>

      <div className="mx-auto flex w-[90%] min-h-0 flex-1 flex-col">
        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1.5 pb-20 pt-1.5">
          {deficient.length > 0 && (
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

      {noDeficienciesOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" role="dialog" aria-modal="true">
            <div
              className="modal-backdrop-enter absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              onClick={() => setNoDeficienciesOpen(false)}
            />
            <div
              className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl px-6 py-8 text-center"
              style={{
                backgroundColor: 'var(--surface-cream)',
                border: '2px solid #000000',
                boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #000000',
              }}
            >
              <button
                onClick={() => setNoDeficienciesOpen(false)}
                aria-label={t.closeAriaLabel}
                className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ color: 'var(--text-primary)' }}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
              <div className="icon-glow-wrap food-wiggle-in h-16 w-16">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-strong)',
                    color: '#fff',
                    border: '2px solid #000000',
                    boxShadow: '0 3px 0 #000000',
                  }}
                >
                  <CheckIcon className="h-7 w-7" />
                </span>
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {t.niceWorkNoDeficiencies}
              </h2>
              <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {t.noDeficienciesNote}
              </p>
              <button
                type="button"
                onClick={() => setNoDeficienciesOpen(false)}
                className="mt-1 w-full rounded-full py-2.5 text-sm font-bold text-white transition-transform active:translate-y-1 active:shadow-none"
                style={{ backgroundColor: 'var(--accent)', border: '3px solid #000000', boxShadow: '0 3px 0 #000000' }}
              >
                {t.claimReward}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

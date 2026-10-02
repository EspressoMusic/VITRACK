import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MealEntry, WorkoutEntry } from '../types'
import { getAllMeals, getAllWorkouts } from '../lib/db'
import { todayKey } from '../lib/date'
import { computeWeeklyInsights } from '../lib/insights'
import { useLanguage } from '../contexts/LanguageContext'
import { INSIGHTS_PANEL_STRINGS } from '../lib/i18n/insightsPanel'
import { ConfettiBurst } from './ConfettiBurst'
import { CheckIcon, CloseIcon } from './icons'

const LAST_NO_DEFICIENCIES_REWARD_KEY = 'vitrack:lastNoDeficienciesReward'

// Lazy-loaded so the food-detection model (TensorFlow.js + COCO-SSD, several MB) ships in its
// own chunk instead of blocking the initial app bundle for users who haven't reached this tab yet.
const CameraPanel = lazy(() => import('./CameraPanel').then((m) => ({ default: m.CameraPanel })))

export function InsightsPanel({ refreshSignal, onLogged }: { refreshSignal: number; onLogged: () => void }) {
  const { lang } = useLanguage()
  const t = INSIGHTS_PANEL_STRINGS[lang]
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [noDeficienciesOpen, setNoDeficienciesOpen] = useState(false)
  const confettiFired = useRef(false)
  const noDeficienciesFired = useRef(false)

  useEffect(() => {
    Promise.all([getAllMeals(), getAllWorkouts()]).then(([m, w]) => {
      setMeals(m)
      setWorkouts(w)
      setLoaded(true)
    })
  }, [refreshSignal])

  const { ranked, weeklyCompletion, macros } = useMemo(() => computeWeeklyInsights(meals, workouts), [meals, workouts])
  const deficient = ranked.filter((r) => r.percent < 90)

  useEffect(() => {
    if (!confettiFired.current && meals.length > 0 && weeklyCompletion === 100) {
      confettiFired.current = true
      setShowConfetti(true)
    }
  }, [meals, weeklyCompletion])

  useEffect(() => {
    if (
      !noDeficienciesFired.current &&
      ranked.length > 0 &&
      deficient.length === 0 &&
      localStorage.getItem(LAST_NO_DEFICIENCIES_REWARD_KEY) !== todayKey()
    ) {
      noDeficienciesFired.current = true
      localStorage.setItem(LAST_NO_DEFICIENCIES_REWARD_KEY, todayKey())
      setNoDeficienciesOpen(true)
      setShowConfetti(true)
    }
  }, [ranked.length, deficient.length])

  if (!loaded) return null

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      {showConfetti && <ConfettiBurst />}

      <Suspense fallback={null}>
        <CameraPanel onLogged={onLogged} weeklyRanked={ranked} weeklyMacros={macros} />
      </Suspense>

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

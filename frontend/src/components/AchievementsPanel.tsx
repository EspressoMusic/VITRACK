import { useEffect, useMemo, useState } from 'react'
import type { MealEntry } from '../types'
import { getAllMeals } from '../lib/db'
import { isMacroTrackingEnabled } from '../lib/macros'
import { ACHIEVEMENT_TIERS, countGoalDays, nextTier } from '../lib/achievements'
import { useLanguage } from '../contexts/LanguageContext'
import { ACHIEVEMENTS_PANEL_STRINGS } from '../lib/i18n/achievementsPanel'
import { CloseIcon, LockIcon } from './icons'
import { AchievementDoll } from './AchievementDoll'

export function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage()
  const t = ACHIEVEMENTS_PANEL_STRINGS[lang]
  const [meals, setMeals] = useState<MealEntry[]>([])

  useEffect(() => {
    getAllMeals().then(setMeals)
  }, [])

  const goalDayCount = useMemo(() => countGoalDays(meals, isMacroTrackingEnabled()), [meals])
  const next = nextTier(goalDayCount)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-3.5"
        style={{ backgroundColor: '#e5c184', border: '1px solid #1a1a19' }}
      >
        <div className="relative mb-2 flex shrink-0 items-center justify-center">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t.title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t.closeAria}
            className="absolute end-0 flex h-6 w-6 items-center justify-center rounded-full"
            style={{ color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-2.5 shrink-0 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
          {next ? t.progress(goalDayCount, next.threshold) : t.allUnlocked}
        </p>

        <div className="grid shrink-0 grid-cols-3 gap-2.5">
          {ACHIEVEMENT_TIERS.map((tier) => {
            const unlocked = goalDayCount >= tier.threshold
            return (
              <div
                key={tier.id}
                className="relative flex flex-col items-center gap-1 rounded-2xl p-2 pt-2.5"
                style={{
                  backgroundColor: 'var(--surface-cream)',
                  border: '2px solid #000000',
                  boxShadow: unlocked ? '0 2px 0 #000000' : 'none',
                  opacity: unlocked ? 1 : 0.8,
                }}
              >
                {!unlocked && (
                  <span
                    className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--surface-1)', border: '2px solid #000000', color: 'var(--text-secondary)' }}
                  >
                    <LockIcon className="h-2.5 w-2.5" />
                  </span>
                )}
                <AchievementDoll color={tier.color} locked={!unlocked} />
                <span className="text-center text-[10px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {t.tierLabel(tier.threshold)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

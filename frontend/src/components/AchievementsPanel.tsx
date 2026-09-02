import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MealEntry } from '../types'
import { getAllMeals } from '../lib/db'
import { isMacroTrackingEnabled } from '../lib/macros'
import { ACHIEVEMENT_TIERS, countGoalDays, nextTier, type AchievementTier } from '../lib/achievements'
import { useLanguage } from '../contexts/LanguageContext'
import { ACHIEVEMENTS_PANEL_STRINGS } from '../lib/i18n/achievementsPanel'
import { CloseIcon, LockIcon } from './icons'
import { AchievementDoll } from './AchievementDoll'

/** Explains a single tier: whether it's unlocked, and if not, how many more goal days are needed. */
export function AchievementDetailModal({
  tier,
  goalDayCount,
  onClose,
}: {
  tier: AchievementTier
  goalDayCount: number
  onClose: () => void
}) {
  const { lang } = useLanguage()
  const t = ACHIEVEMENTS_PANEL_STRINGS[lang]
  const unlocked = goalDayCount >= tier.threshold
  const remaining = Math.max(0, tier.threshold - goalDayCount)

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl p-4 text-center"
        style={{ backgroundColor: '#e5c184', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={onClose}
          aria-label={t.closeAria}
          className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        <div className="relative">
          {!unlocked && (
            <span
              className="absolute -end-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--surface-1)', border: '2px solid #000000', color: 'var(--text-secondary)' }}
            >
              <LockIcon className="h-3 w-3" />
            </span>
          )}
          <AchievementDoll color={tier.color} locked={!unlocked} className="h-20 w-20" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {t.tierLabel(tier.threshold)}
        </h2>
        <p className="text-xs font-semibold" style={{ color: unlocked ? 'var(--accent-strong)' : 'var(--text-secondary)' }}>
          {unlocked ? t.tierUnlockedHint : t.tierNeededHint(remaining)}
        </p>
        <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {t.goalDayExplainer}
        </p>
      </div>
    </div>,
    document.body
  )
}

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
                className="relative flex flex-col items-center gap-1 rounded-lg p-2 pt-2.5"
                style={{
                  backgroundColor: 'var(--surface-cream)',
                  border: '2px solid #000000',
                  boxShadow: '0 4px 0 #000000',
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

import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { CALENDAR_PANEL_STRINGS } from '../lib/i18n/calendarPanel'
import { formatWeekRangeLabel } from '../lib/date'
import { CloseIcon, MedalIcon } from './icons'

export interface CompletedChallenge {
  weekStart: string
  name: string
}

export function CompletedChallengesModal({
  challenges,
  onClose,
}: {
  challenges: CompletedChallenge[]
  onClose: () => void
}) {
  const { lang } = useLanguage()
  const t = CALENDAR_PANEL_STRINGS[lang]

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-4"
        style={{ backgroundColor: '#e5c184', border: '3px solid #000000' }}
      >
        <div className="relative mb-3 flex shrink-0 items-center justify-center">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t.completedModalTitle}
          </h2>
          <button
            onClick={onClose}
            aria-label={t.closeAriaLabel}
            className="absolute end-0 flex h-6 w-6 items-center justify-center rounded-full"
            style={{ color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {challenges.length === 0 ? (
          <p className="py-6 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
            {t.noCompletedChallenges}
          </p>
        ) : (
          <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-0.5 pb-1">
            {challenges.map((c) => (
              <div
                key={c.weekStart}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                style={{ backgroundColor: 'var(--surface-cream)', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
              >
                <MedalIcon className="h-5 w-5 shrink-0" strokeWidth={2.2} style={{ color: 'var(--accent-strong)' }} />
                <div className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="w-full truncate text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {c.name}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {formatWeekRangeLabel(c.weekStart, lang)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

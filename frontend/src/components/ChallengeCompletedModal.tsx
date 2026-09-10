import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { CALENDAR_PANEL_STRINGS } from '../lib/i18n/calendarPanel'
import { MedalIcon } from './icons'

export function ChallengeCompletedModal({ challengeName, onClose }: { challengeName: string; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = CALENDAR_PANEL_STRINGS[lang]

  return createPortal(
    <div className="fixed inset-0 z-[75] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl p-5 text-center"
        style={{ backgroundColor: '#e5c184', border: '3px solid #000000' }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: '#6b4423', border: '2px solid #000000' }}
        >
          <MedalIcon className="h-7 w-7" strokeWidth={2.2} style={{ color: '#f5deb3' }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t.challengeCompletedTitle}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {t.challengeCompletedPrefix} &quot;{challengeName}&quot; {t.challengeCompletedSuffix}
        </p>
        <button
          onClick={onClose}
          className="mt-1 rounded-full px-5 py-1.5 text-xs font-semibold transition active:translate-y-0.5"
          style={{ backgroundColor: '#6b4423', color: '#f5deb3', border: '2px solid #000000' }}
        >
          {t.challengeCompletedButtonLabel}
        </button>
      </div>
    </div>,
    document.body
  )
}

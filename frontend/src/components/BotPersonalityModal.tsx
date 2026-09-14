import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRITION_CHAT_STRINGS } from '../lib/i18n/nutritionChat'
import type { BotPersonality } from '../lib/botPersonality'
import { CloseIcon } from './icons'

const OPTIONS: BotPersonality[] = ['veryNice', 'normal', 'angry', 'superAngry']

export function BotPersonalityModal({
  current,
  onClose,
  onSelect,
}: {
  current: BotPersonality
  onClose: () => void
  onSelect: (personality: BotPersonality) => void
}) {
  const { lang } = useLanguage()
  const t = NUTRITION_CHAT_STRINGS[lang]
  const p = t.personality

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div className="modal-card-enter relative z-10 w-full max-w-md">
        <button
          onClick={onClose}
          aria-label={t.closeAriaLabel}
          className="absolute -top-3 -end-3 z-20 flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000' }}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="flex w-full flex-col gap-3 rounded-2xl p-4" style={{ backgroundColor: '#e5c184', border: '3px solid #000000' }}>
          <h2 className="text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {p.heading}
          </h2>
          <p className="text-center text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
            {p.description}
          </p>

          <div className="flex flex-col gap-2">
            {OPTIONS.map((option) => {
              const selected = option === current
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect(option)}
                  className="flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition"
                  style={{
                    backgroundColor: selected ? 'var(--accent)' : 'var(--surface-cream)',
                    border: '2px solid #000000',
                    color: selected ? 'white' : 'var(--text-primary)',
                  }}
                >
                  {p[option]}
                </button>
              )
            })}
          </div>

          <p className="text-center text-[11px] leading-snug" style={{ color: 'var(--status-critical)' }}>
            {p.superAngryNote}
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}

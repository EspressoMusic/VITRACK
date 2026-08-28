import { createPortal } from 'react-dom'
import type { NutrientId } from '../types'
import { NUTRIENT_MAP, targetFor } from '../lib/nutrients'
import { useLanguage } from '../contexts/LanguageContext'
import { MISSING_TO_GOAL_MODAL_STRINGS } from '../lib/i18n/missingToGoalModal'
import { CloseIcon } from './icons'

export function MissingToGoalModal({
  items,
  onClose,
  onSelect,
}: {
  items: { id: NutrientId; avgAmount: number; percent: number }[]
  onClose: () => void
  onSelect: (id: NutrientId) => void
}) {
  const { lang } = useLanguage()
  const t = MISSING_TO_GOAL_MODAL_STRINGS[lang]
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-5"
        style={{ backgroundColor: '#e5c184', border: '1px solid #1a1a19' }}
      >
        <div className="relative mb-4 flex shrink-0 items-center justify-center">
          <h2
            className="whitespace-nowrap rounded-full py-1.5 ps-4 pe-12 text-sm font-semibold"
            style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-cream)' }}
          >
            {t.title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t.closeAriaLabel}
            className="absolute end-1 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <p
            className="rounded-xl p-3 text-center text-sm"
            style={{ backgroundColor: 'var(--status-good-soft)', color: 'var(--text-primary)' }}
          >
            {t.allDone}
          </p>
        ) : (
          <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pe-1">
            {items.map((item) => {
              const def = NUTRIENT_MAP[item.id]
              const target = targetFor(item.id)
              const remaining = Math.max(0, target - item.avgAmount)
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="flex items-center justify-between rounded-xl p-3 text-start transition-transform active:translate-y-1 active:shadow-none"
                  style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)', boxShadow: '0 1px 0 var(--border)' }}
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {def.name}
                  </span>
                  <span
                    className="shrink-0 whitespace-nowrap ps-2 text-[11px] font-semibold"
                    style={{ color: 'var(--accent-strong)' }}
                  >
                    {t.toGo(`${remaining.toFixed(remaining < 10 ? 1 : 0)}${def.unit}`, item.percent)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

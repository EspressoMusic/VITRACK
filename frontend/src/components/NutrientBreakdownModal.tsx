import { createPortal } from 'react-dom'
import type { NutrientId } from '../types'
import { NUTRIENT_MAP, coverageStatus } from '../lib/nutrients'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRIENT_BREAKDOWN_MODAL_STRINGS } from '../lib/i18n/nutrientBreakdownModal'
import { STATUS_VAR, STATUS_SOFT_VAR } from './StatusDot'
import { CloseIcon } from './icons'

/** Full list of every tracked vitamin/mineral with its weekly coverage — unlike
 *  MissingToGoalModal, this shows everything, not just what's still short of 100%. */
export function NutrientBreakdownModal({
  items,
  onClose,
  onSelect,
}: {
  items: { id: NutrientId; avgAmount: number; percent: number }[]
  onClose: () => void
  onSelect: (id: NutrientId) => void
}) {
  const { lang } = useLanguage()
  const t = NUTRIENT_BREAKDOWN_MODAL_STRINGS[lang]
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
            className="whitespace-nowrap py-1.5 ps-4 pe-12 text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
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

        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pe-1">
          {items.map((item) => {
            const def = NUTRIENT_MAP[item.id]
            const status = coverageStatus(item.percent)
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="flex items-center gap-2.5 rounded-xl p-3 text-start transition-transform active:translate-y-1 active:shadow-none"
                style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)', boxShadow: '0 1px 0 var(--border)' }}
              >
                <span className="min-w-0 flex-1 truncate text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {def.name}
                </span>
                <span className="block h-2 w-16 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: STATUS_SOFT_VAR[status] }}>
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${Math.min(100, item.percent)}%`, backgroundColor: STATUS_VAR[status] }}
                  />
                </span>
                <span className="shrink-0 whitespace-nowrap text-[11px] font-semibold" style={{ color: STATUS_VAR[status] }}>
                  {item.percent}%
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}

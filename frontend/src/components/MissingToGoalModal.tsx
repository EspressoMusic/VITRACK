import { createPortal } from 'react-dom'
import type { NutrientId } from '../types'
import { NUTRIENT_MAP, targetFor } from '../lib/nutrients'
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
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-5"
        style={{ backgroundColor: '#e5c184', border: '2px solid #1a1a19' }}
      >
        <div className="relative mb-4 flex shrink-0 items-center justify-center">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            What's missing to 100%
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full"
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
            You've hit 100% on everything this week.
          </p>
        ) : (
          <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {items.map((item) => {
              const def = NUTRIENT_MAP[item.id]
              const target = targetFor(item.id)
              const remaining = Math.max(0, target - item.avgAmount)
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="flex items-center justify-between rounded-xl p-3 text-left"
                  style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {def.name}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent-strong)' }}>
                    {remaining.toFixed(remaining < 10 ? 1 : 0)}
                    {def.unit} to go · {item.percent}%
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

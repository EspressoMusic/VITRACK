import { createPortal } from 'react-dom'
import type { NutrientId } from '../types'
import { NUTRIENT_MAP, coverageStatus, percentOfRda, targetFor } from '../lib/nutrients'
import { StatusDot, STATUS_VAR } from './StatusDot'
import { CloseIcon } from './icons'

export function NutrientDetailModal({
  id,
  amount,
  onClose,
}: {
  id: NutrientId
  amount: number
  onClose: () => void
}) {
  const def = NUTRIENT_MAP[id]
  const percent = percentOfRda(id, amount)
  const status = coverageStatus(percent)
  const target = targetFor(id)
  const remaining = Math.max(0, target - amount)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px) grayscale(1)', WebkitBackdropFilter: 'blur(6px) grayscale(1)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 w-full max-w-md rounded-2xl p-5"
        style={{ backgroundColor: '#e5c184', border: '2px solid #1a1a19' }}
      >
        <div className="relative mb-4 flex items-center justify-center">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {def.name}
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

        <div className="flex flex-col gap-4 rounded-2xl p-4" style={{ backgroundColor: 'var(--surface-cream)' }}>
          <div className="flex items-center justify-between">
            <StatusDot status={status} showLabel />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {percent}%
            </span>
          </div>

          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--surface-2)' }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, percent)}%`, backgroundColor: STATUS_VAR[status] }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--surface-1)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Consumed
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {amount.toFixed(amount < 10 ? 1 : 0)}
                {def.unit}
                <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                  {' '}
                  / {target.toFixed(target < 10 ? 1 : 0)}
                  {def.unit}
                </span>
              </div>
            </div>
            <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--surface-1)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {remaining > 0 ? 'Remaining' : 'Status'}
              </div>
              <div className="text-sm font-semibold" style={{ color: remaining > 0 ? STATUS_VAR[status] : 'var(--status-good)' }}>
                {remaining > 0 ? `${remaining.toFixed(remaining < 10 ? 1 : 0)}${def.unit} to go` : 'Goal met'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {status === 'good' ? "You're covered" : 'Foods to close the gap'}
          </p>
          <div
            className="thin-scroll flex max-h-40 flex-col gap-2 overflow-y-auto rounded-2xl p-3"
            style={{ backgroundColor: 'var(--surface-cream)' }}
          >
            {def.foodSources.map((food) => (
              <div key={food} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent-strong)' }} />
                {food}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

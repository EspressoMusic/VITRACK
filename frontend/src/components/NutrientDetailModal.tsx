import { createPortal } from 'react-dom'
import type { NutrientId } from '../types'
import { NUTRIENT_MAP, coverageStatus, percentOfRda, percentOfMealTarget, targetFor, mealTargetFor } from '../lib/nutrients'
import { StatusDot, STATUS_VAR } from './StatusDot'
import { CloseIcon } from './icons'

export function NutrientDetailModal({
  id,
  amount,
  perMeal = false,
  onClose,
}: {
  id: NutrientId
  amount: number
  /** True when `amount` is from a single meal, not a daily/weekly total — judges it against a per-meal share of the target instead of the full day. */
  perMeal?: boolean
  onClose: () => void
}) {
  const def = NUTRIENT_MAP[id]
  const percent = perMeal ? percentOfMealTarget(id, amount) : percentOfRda(id, amount)
  const status = coverageStatus(percent)
  const target = perMeal ? mealTargetFor(id) : targetFor(id)
  const remaining = Math.max(0, target - amount)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px) grayscale(1)', WebkitBackdropFilter: 'blur(6px) grayscale(1)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-3xl"
        style={{ backgroundColor: '#e5c184', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <div className="relative flex shrink-0 items-center justify-center px-4 pb-1.5 pt-3">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {def.name}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3.5 pb-3">
          <div className="flex flex-col gap-1.5 rounded-2xl p-2.5" style={{ backgroundColor: 'var(--surface-cream)' }}>
            <div className="flex items-center justify-between">
              <StatusDot status={status} showLabel />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {percent}%
              </span>
            </div>

            <div
              className="h-3 w-full overflow-hidden rounded-full"
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

            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-xl p-1.5" style={{ backgroundColor: 'var(--surface-1)', border: '2px solid #000000' }}>
                <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Consumed
                </div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {amount.toFixed(amount < 10 ? 1 : 0)}
                  {def.unit}
                  <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                    {' '}
                    / {target.toFixed(target < 10 ? 1 : 0)}
                    {def.unit}
                  </span>
                </div>
              </div>
              <div className="rounded-xl p-1.5" style={{ backgroundColor: 'var(--surface-1)', border: '2px solid #000000' }}>
                <div className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {remaining > 0 ? 'Remaining' : 'Status'}
                </div>
                <div className="text-xs font-semibold" style={{ color: remaining > 0 ? STATUS_VAR[status] : 'var(--status-good)' }}>
                  {remaining > 0 ? `${remaining.toFixed(remaining < 10 ? 1 : 0)}${def.unit} to go` : 'Goal met'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Why it matters
            </p>
            <div className="rounded-2xl p-2.5" style={{ backgroundColor: 'var(--surface-cream)' }}>
              <p className="text-xs leading-snug" style={{ color: 'var(--text-primary)' }}>
                {def.benefit}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              {status === 'good' ? "You're covered" : 'Foods to close the gap'}
            </p>
            <div className="flex flex-wrap gap-1 rounded-2xl p-2.5" style={{ backgroundColor: 'var(--surface-cream)' }}>
              {def.foodSources.map((food) => (
                <span
                  key={food}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-primary)', border: '1.5px solid #1a1a19' }}
                >
                  <span className="h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent-strong)' }} />
                  {food}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

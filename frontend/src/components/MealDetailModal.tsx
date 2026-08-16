import { createPortal } from 'react-dom'
import type { MealEntry } from '../types'
import { NUTRIENTS, NUTRIENT_MAP, percentOfRda, coverageStatus } from '../lib/nutrients'
import { STATUS_VAR, STATUS_SOFT_VAR } from './StatusDot'
import { CloseIcon } from './icons'

const CONFIDENCE_VAR: Record<MealEntry['confidence'], string> = {
  high: 'var(--status-good)',
  medium: 'var(--status-warning)',
  low: 'var(--status-critical)',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function MealDetailModal({ meal, onClose }: { meal: MealEntry; onClose: () => void }) {
  const presentNutrients = NUTRIENTS.filter((n) => meal.nutrients[n.id] > 0)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px) grayscale(1)', WebkitBackdropFilter: 'blur(6px) grayscale(1)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-5"
        style={{ backgroundColor: '#e5c184', border: '2px solid #1a1a19' }}
      >
        <div className="relative mb-4 flex shrink-0 items-center justify-center">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Meal details
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

        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <div className="relative shrink-0 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border)', boxShadow: '0 6px 16px rgba(26,26,25,0.18)' }}>
            <img src={meal.imageDataUrl} alt="" className="h-44 w-full object-cover" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)' }}
            />
            <span
              className="absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
            >
              {formatDate(meal.createdAt)} · {formatTime(meal.createdAt)}
            </span>
            <span
              className="absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
              style={{ backgroundColor: CONFIDENCE_VAR[meal.confidence], color: 'white' }}
            >
              {meal.confidence}
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl p-3.5" style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Foods
            </p>
            {meal.foods.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                No foods identified.
              </p>
            ) : (
              meal.foods.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent-strong)' }} />
                  <span className="flex-1">{f.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.portion}</span>
                </div>
              ))
            )}
          </div>

          {meal.analysisNote && (
            <p className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'var(--status-warning-soft)', color: 'var(--text-primary)' }}>
              {meal.analysisNote}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Nutrients
            </p>
            {presentNutrients.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No nutrient data for this meal.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {presentNutrients.map((n) => {
                  const amount = meal.nutrients[n.id]
                  const percent = percentOfRda(n.id, amount)
                  const status = coverageStatus(percent)
                  return (
                    <div
                      key={n.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)' }}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_VAR[status] }} aria-hidden />
                        {NUTRIENT_MAP[n.id].name}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {amount.toFixed(amount < 10 ? 1 : 0)}
                          {n.unit}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ backgroundColor: STATUS_SOFT_VAR[status], color: STATUS_VAR[status] }}
                        >
                          {percent}%
                        </span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

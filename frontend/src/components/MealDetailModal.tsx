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
  const presentNutrients = NUTRIENTS.filter((n) => percentOfRda(n.id, meal.nutrients[n.id]) > 0)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-4"
        style={{ backgroundColor: '#e5c184', border: '4px solid #000000' }}
      >
        <div className="relative mb-2.5 flex shrink-0 items-center justify-center">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Meal details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-full"
            style={{ color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
          <div className="relative shrink-0 overflow-hidden rounded-2xl" style={{ border: '3px solid #000000', boxShadow: '0 6px 16px rgba(26,26,25,0.18)' }}>
            <img src={meal.imageDataUrl} alt="" className="h-28 w-full object-cover" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)' }}
            />
            <span
              className="absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
            >
              {formatDate(meal.createdAt)} · {formatTime(meal.createdAt)}
            </span>
            <span
              className="absolute right-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
              style={{ backgroundColor: CONFIDENCE_VAR[meal.confidence], color: 'white' }}
            >
              {meal.confidence}
            </span>
          </div>

          {meal.foods.length === 0 ? (
            <p
              className="rounded-2xl px-2.5 py-3 text-center text-xs font-medium"
              style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              No food detected.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-1 rounded-2xl p-2.5" style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)' }}>
                <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Foods
                </p>
                {meal.foods.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent-strong)' }} />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="shrink-0" style={{ color: 'var(--text-secondary)' }}>{f.portion}</span>
                  </div>
                ))}
              </div>

              {meal.analysisNote && (
                <p className="rounded-lg px-2.5 py-1.5 text-[11px]" style={{ backgroundColor: 'var(--status-warning-soft)', color: 'var(--text-primary)' }}>
                  {meal.analysisNote}
                </p>
              )}

              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Nutrients
                </p>
                {presentNutrients.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    No nutrient data for this meal.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {presentNutrients.map((n) => {
                      const amount = meal.nutrients[n.id]
                      const percent = percentOfRda(n.id, amount)
                      const status = coverageStatus(percent)
                      return (
                        <div
                          key={n.id}
                          className="flex items-center justify-between rounded-xl px-2.5 py-1.5"
                          style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)' }}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_VAR[status] }} aria-hidden />
                            {NUTRIENT_MAP[n.id].name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                              {amount.toFixed(amount < 10 ? 1 : 0)}
                              {n.unit}
                            </span>
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
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
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

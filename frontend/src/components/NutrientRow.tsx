import type { NutrientId } from '../types'
import { NUTRIENT_MAP, coverageStatus, percentOfRda } from '../lib/nutrients'
import { STATUS_VAR, STATUS_SOFT_VAR } from './StatusDot'

export function NutrientRow({
  id,
  amount,
  onClick,
}: {
  id: NutrientId
  amount: number
  onClick: () => void
}) {
  const def = NUTRIENT_MAP[id]
  const percent = percentOfRda(id, amount)
  const status = coverageStatus(percent)

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition active:scale-[0.98]"
      style={{
        backgroundColor: 'var(--surface-cream)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 5px rgba(26,26,25,0.06)',
      }}
    >
      <span className="flex items-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_VAR[status] }} aria-hidden />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {def.name}
        </span>
      </span>
      <span className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {amount.toFixed(amount < 10 ? 1 : 0)}
          {def.unit}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: STATUS_SOFT_VAR[status], color: STATUS_VAR[status] }}
        >
          {percent}%
        </span>
      </span>
    </button>
  )
}

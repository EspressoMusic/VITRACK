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
      className="flex w-full items-center justify-between rounded-2xl px-2.5 py-2 text-left transition active:scale-[0.98]"
      style={{
        backgroundColor: 'var(--surface-cream)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 10px rgba(26,26,25,0.14)',
      }}
    >
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_VAR[status] }} aria-hidden />
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          {def.name}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {amount.toFixed(amount < 10 ? 1 : 0)}
          {def.unit}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: STATUS_SOFT_VAR[status], color: STATUS_VAR[status] }}
        >
          {percent}%
        </span>
      </span>
    </button>
  )
}

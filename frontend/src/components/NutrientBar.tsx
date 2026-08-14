import type { NutrientId } from '../types'
import { NUTRIENT_MAP, coverageStatus, percentOfRda, STATUS_LABEL } from '../lib/nutrients'
import { StatusDot, STATUS_VAR } from './StatusDot'

export function NutrientBar({
  id,
  amount,
  showName = true,
  showStatusLabel = false,
}: {
  id: NutrientId
  amount: number
  showName?: boolean
  showStatusLabel?: boolean
}) {
  const def = NUTRIENT_MAP[id]
  const percent = percentOfRda(id, amount)
  const status = coverageStatus(percent)
  const fillWidth = Math.min(100, percent)

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        {showName ? (
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {def.name}
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <StatusDot status={status} showLabel={showStatusLabel} />
          {amount.toFixed(amount < 10 ? 1 : 0)}
          {def.unit} · {percent}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--surface-2)' }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${def.name}: ${percent}% of daily target, ${STATUS_LABEL[status]}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${fillWidth}%`, backgroundColor: STATUS_VAR[status] }}
        />
      </div>
    </div>
  )
}

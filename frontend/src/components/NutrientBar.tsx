import type { NutrientId } from '../types'
import { NUTRIENT_MAP, coverageStatus, percentOfRda, STATUS_LABEL } from '../lib/nutrients'
import { StatusDot, STATUS_VAR } from './StatusDot'

export function NutrientBar({
  id,
  amount,
  showName = true,
  showStatusLabel = false,
  onClick,
}: {
  id: NutrientId
  amount: number
  showName?: boolean
  showStatusLabel?: boolean
  onClick?: () => void
}) {
  const def = NUTRIENT_MAP[id]
  const percent = percentOfRda(id, amount)
  const status = coverageStatus(percent)
  const fillWidth = Math.min(100, percent)
  const Container = onClick ? 'button' : 'div'

  return (
    <Container
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className="w-full rounded-xl px-2.5 py-1.5 text-left"
      style={{ backgroundColor: '#fdf6e8', boxShadow: '0 2px 6px rgba(26,26,25,0.14)' }}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        {showName ? (
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {def.name}
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          <StatusDot status={status} showLabel={showStatusLabel} />
          {amount.toFixed(amount < 10 ? 1 : 0)}
          {def.unit} · {percent}%
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full"
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
    </Container>
  )
}

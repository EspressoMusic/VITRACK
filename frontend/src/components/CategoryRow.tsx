import { coverageStatus } from '../lib/nutrients'
import { STATUS_VAR, STATUS_SOFT_VAR } from './StatusDot'

/** A single summary box for one broad nutrition category (protein/carbs/fats/vitamins),
 *  styled like NutrientRow but driven by a plain name+icon+percent instead of a NutrientId. */
export function CategoryRow({
  name,
  icon,
  percent,
  onClick,
}: {
  name: string
  icon: string
  percent: number
  onClick?: () => void
}) {
  const status = coverageStatus(percent)
  const isComplete = percent >= 100
  const Container = onClick ? 'button' : 'div'

  return (
    <Container
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-start transition active:scale-[0.98]"
      style={{
        backgroundColor: 'var(--surface-cream)',
        border: `2px solid ${isComplete ? 'var(--status-good)' : 'var(--status-critical)'}`,
        boxShadow: '0 4px 10px rgba(26,26,25,0.14)',
      }}
    >
      <span className="flex w-28 shrink-0 items-center justify-between text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        <span className="truncate">{name}</span>
        <span aria-hidden className="relative top-[3px] shrink-0">{icon}</span>
      </span>
      <span className="block h-2.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: STATUS_SOFT_VAR[status] }}>
        <span
          className="block h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.min(100, percent)}%`, backgroundColor: STATUS_VAR[status] }}
        />
      </span>
    </Container>
  )
}

import type { NutrientId } from '../types'
import { NUTRIENT_MAP, contributionStatus, percentOfMealTarget } from '../lib/nutrients'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
import { NUTRIENT_STATUS_LABEL, NUTRIENT_BAR_STRINGS } from '../lib/i18n/nutrientDisplay'
import { STATUS_VAR } from './StatusDot'

export function NutrientBar({
  id,
  amount,
  showName = true,
  onClick,
  riseDelayMs,
}: {
  id: NutrientId
  amount: number
  showName?: boolean
  onClick?: () => void
  /** When set, fires two small particles that rise up out of this row toward the fill bar
   *  above the list, staggered so a freshly-scanned food's nutrients read as flowing in. */
  riseDelayMs?: number
}) {
  const { lang } = useLanguage()
  const content = NUTRIENT_CONTENT[lang][id]
  const def = NUTRIENT_MAP[id]
  const percent = percentOfMealTarget(id, amount)
  const status = contributionStatus(percent)
  const fillWidth = Math.min(100, percent)
  const Container = onClick ? 'button' : 'div'

  return (
    <Container
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className="relative w-full rounded-xl px-2.5 py-1.5 text-start"
      style={{ backgroundColor: '#fdf6e8', boxShadow: '0 2px 6px rgba(26,26,25,0.14)' }}
    >
      {riseDelayMs !== undefined && (
        <>
          <span
            className="rise-particle z-10 end-3 top-1 h-1.5 w-1.5"
            style={{ backgroundColor: STATUS_VAR[status], animationDelay: `${riseDelayMs}ms` }}
            aria-hidden
          />
          <span
            className="rise-particle z-10 end-6 top-1.5 h-1 w-1"
            style={{ backgroundColor: STATUS_VAR[status], animationDelay: `${riseDelayMs + 140}ms` }}
            aria-hidden
          />
        </>
      )}
      <div className="mb-1 flex items-baseline justify-between gap-2">
        {showName ? (
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {content.name}
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
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
        aria-label={NUTRIENT_BAR_STRINGS[lang].ariaLabel(content.name, percent, NUTRIENT_STATUS_LABEL[lang][status])}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${fillWidth}%`, backgroundColor: STATUS_VAR[status] }}
        />
      </div>
    </Container>
  )
}

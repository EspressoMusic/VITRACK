import type { NutrientId } from '../types'
import { coverageStatus, percentOfRda } from '../lib/nutrients'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
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
  const { lang } = useLanguage()
  const content = NUTRIENT_CONTENT[lang][id]
  const percent = percentOfRda(id, amount)
  const status = coverageStatus(percent)

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-start transition active:scale-[0.98]"
      style={{
        backgroundColor: 'var(--surface-cream)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 10px rgba(26,26,25,0.14)',
      }}
    >
      <span className="w-28 shrink-0 truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {content.name}
      </span>
      <span className="block h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: STATUS_SOFT_VAR[status] }}>
        <span
          className="block h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.min(100, percent)}%`, backgroundColor: STATUS_VAR[status] }}
        />
      </span>
    </button>
  )
}

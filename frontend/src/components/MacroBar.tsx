import type { MacroId } from '../types'
import { MACROS, percentOfMacroMealTarget } from '../lib/macros'
import { contributionStatus } from '../lib/nutrients'
import { useLanguage } from '../contexts/LanguageContext'
import { MACRO_LABELS } from '../lib/i18n/macros'
import { STATUS_VAR } from './StatusDot'

const MACRO_UNIT: Record<MacroId, string> = Object.fromEntries(MACROS.map((m) => [m.id, m.unit])) as Record<
  MacroId,
  string
>

/** Same rectangle-with-progress-bar look as NutrientBar, reused for the protein/carbs/fat
 *  rows shown at the top of a scan result's list, above the vitamin/mineral bars. */
export function MacroBar({ id, amount, riseDelayMs }: { id: MacroId; amount: number; riseDelayMs?: number }) {
  const { lang } = useLanguage()
  const label = MACRO_LABELS[lang][id]
  const unit = MACRO_UNIT[id]
  const percent = percentOfMacroMealTarget(id, amount)
  const status = contributionStatus(percent)
  const fillWidth = Math.min(100, percent)

  return (
    <div className="relative w-full rounded-xl px-2.5 py-1.5 text-start" style={{ backgroundColor: '#fdf6e8', boxShadow: '0 2px 6px rgba(26,26,25,0.14)' }}>
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
        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>
        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {Math.round(amount)}
          {unit} · {percent}%
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--surface-2)' }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${fillWidth}%`, backgroundColor: STATUS_VAR[status] }}
        />
      </div>
    </div>
  )
}

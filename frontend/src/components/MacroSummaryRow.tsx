import type { MacroAmounts } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { MACRO_LABELS } from '../lib/i18n/macros'

/** First row of a scan result: the total calories, shown separately from (and above)
 *  the vitamin/mineral list below it. */
export function MacroSummaryRow({ macros }: { macros: MacroAmounts }) {
  const { lang } = useLanguage()
  const labels = MACRO_LABELS[lang]

  return (
    <div className="flex w-full shrink-0 items-baseline justify-center gap-1.5 py-2">
      <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {Math.round(macros.calories)}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
        {labels.calories}
      </span>
    </div>
  )
}

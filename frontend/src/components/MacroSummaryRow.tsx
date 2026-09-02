import type { MacroAmounts } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { MACRO_LABELS } from '../lib/i18n/macros'

/** First row of a scan result: total calories plus a single bar showing the carbs/fat/protein
 *  split, shown separately from (and above) the vitamin/mineral list below it. */
export function MacroSummaryRow({ macros }: { macros: MacroAmounts }) {
  const { lang } = useLanguage()
  const labels = MACRO_LABELS[lang]

  const segments: { id: 'carbsG' | 'fatG' | 'proteinG'; color: string }[] = [
    { id: 'carbsG', color: '#e8863a' },
    { id: 'fatG', color: '#d9a441' },
    { id: 'proteinG', color: '#e26d6d' },
  ]
  const total = macros.carbsG + macros.fatG + macros.proteinG

  return (
    <div
      className="flex w-full shrink-0 items-center gap-3 rounded-xl px-3 py-2"
      style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col items-start leading-tight">
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {Math.round(macros.calories)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {labels.calories}
        </span>
      </div>
      <span className="flex h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surface-1)' }}>
        {segments.map((s) => (
          <span
            key={s.id}
            className="block h-full transition-[width] duration-500"
            style={{ width: total > 0 ? `${(macros[s.id] / total) * 100}%` : '0%', backgroundColor: s.color }}
          />
        ))}
      </span>
    </div>
  )
}

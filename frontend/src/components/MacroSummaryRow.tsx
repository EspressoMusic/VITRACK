import type { MacroAmounts } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { MACRO_LABELS } from '../lib/i18n/macros'
import { percentOfMacroMealTarget } from '../lib/macros'

/** First row of a scan result: total calories plus their carbs/fat/protein breakdown, shown
 *  separately from (and above) the vitamin/mineral list below it. */
export function MacroSummaryRow({ macros }: { macros: MacroAmounts }) {
  const { lang } = useLanguage()
  const labels = MACRO_LABELS[lang]

  const chips: { id: 'carbsG' | 'fatG' | 'proteinG'; color: string }[] = [
    { id: 'carbsG', color: '#e8863a' },
    { id: 'fatG', color: '#d9a441' },
    { id: 'proteinG', color: '#e26d6d' },
  ]

  return (
    <div
      className="mx-auto flex w-[88%] shrink-0 items-center justify-between gap-2 rounded-2xl px-3 py-2"
      style={{ backgroundColor: '#e5c184', border: '3px solid #000000' }}
    >
      <div className="flex flex-col items-start leading-tight">
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {Math.round(macros.calories)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {labels.calories}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {chips.map((c) => {
          const percent = Math.max(0, Math.min(100, percentOfMacroMealTarget(c.id, macros[c.id])))
          return (
            <div
              key={c.id}
              className="relative flex flex-col items-center overflow-hidden rounded-xl px-2 py-1"
              style={{ backgroundColor: '#fdf6e8', border: '2px solid #000000' }}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 transition-[height] duration-[900ms] ease-out"
                style={{ height: `${percent}%`, backgroundColor: c.color, opacity: 0.3 }}
              />
              <span className="relative z-10 text-xs font-bold" style={{ color: c.color }}>
                {Math.round(macros[c.id])}g
              </span>
              <span className="relative z-10 text-[8px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                {labels[c.id]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

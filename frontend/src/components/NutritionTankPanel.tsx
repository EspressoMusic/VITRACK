import type { MacroAmounts } from '../types'
import { macroTargetFor } from '../lib/macros'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRITION_TANK_STRINGS } from '../lib/i18n/nutritionTankPanel'
import { BodyFillGauge, type BodyFillBand } from './BodyFillGauge'

export function NutritionTankPanel({
  bands,
  totalMacros,
  trackNutrition,
}: {
  bands: BodyFillBand[]
  totalMacros: MacroAmounts
  trackNutrition: boolean
}) {
  const { lang } = useLanguage()
  const t = NUTRITION_TANK_STRINGS[lang]

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-2.5">
      <div className="mx-auto mt-1 shrink-0 text-center">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t.title}
        </h2>
        {trackNutrition && (
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {t.calorieLabel(Math.round(totalMacros.calories), Math.round(macroTargetFor('calories')))}
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-3 py-1">
        <div className="h-full min-w-0 flex-[1.1]">
          <BodyFillGauge bands={bands} />
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-1">
          {bands.map((band) => (
            <div key={band.id} className="flex items-center gap-1.5 rounded-lg px-1.5 py-1" style={{ backgroundColor: 'var(--surface-cream)' }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: band.color }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {band.label}
              </span>
              <span className="shrink-0 text-[9px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {band.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

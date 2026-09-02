import { createPortal } from 'react-dom'
import type { MealEntry } from '../types'
import { NUTRIENT_MAP, getVisibleNutrients, hasRespectableAmount, percentOfRda, coverageStatus } from '../lib/nutrients'
import { EMPTY_MACROS, isMacroTrackingEnabled } from '../lib/macros'
import { resolveFoodEmoji } from '../lib/foodEmoji'
import { useLanguage } from '../contexts/LanguageContext'
import { MEAL_DETAIL_MODAL_STRINGS } from '../lib/i18n/mealDetailModal'
import type { Lang } from '../lib/i18n/lang'
import { STATUS_VAR, STATUS_SOFT_VAR } from './StatusDot'
import { CloseIcon } from './icons'
import { MacroSummaryRow } from './MacroSummaryRow'

const DATE_LOCALE: Record<Lang, string> = { en: 'en-US', he: 'he-IL', ar: 'ar' }

function formatDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE[lang], { month: 'short', day: 'numeric' })
}

function formatTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleTimeString(DATE_LOCALE[lang], { hour: 'numeric', minute: '2-digit' })
}

export function MealDetailModal({ meal, onClose }: { meal: MealEntry; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = MEAL_DETAIL_MODAL_STRINGS[lang]
  const presentNutrients = getVisibleNutrients().filter((n) => hasRespectableAmount(n.id, meal.nutrients[n.id]))
  const emoji = resolveFoodEmoji(meal.foods[0]?.name)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(60,42,16,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-4"
        style={{ backgroundColor: '#e5c184', border: '3px solid #000000' }}
      >
        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pe-1">
          <div className="relative flex shrink-0 flex-col items-center gap-2 pt-1">
            <button
              onClick={onClose}
              aria-label={t.closeAriaLabel}
              className="absolute end-0 top-0 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-primary)' }}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)' }}
            >
              {formatDate(meal.createdAt, lang)} · {formatTime(meal.createdAt, lang)}
            </span>
            <div className="relative flex h-32 w-32 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(217,164,65,0.75) 0%, rgba(217,164,65,0.32) 45%, rgba(217,164,65,0) 72%)' }}
              />
              <span
                role="img"
                aria-label={meal.foods[0]?.name || t.mealFallbackName}
                className="relative"
                style={{ fontSize: '5em', lineHeight: 1 }}
              >
                {emoji}
              </span>
            </div>
          </div>

          {meal.foods.length === 0 ? (
            <p
              className="rounded-2xl px-2.5 py-3 text-center text-xs font-medium"
              style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {t.noFoodDetected}
            </p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1.5">
                {meal.foods.map((f, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 text-center text-xs">
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{f.portion}</span>
                  </div>
                ))}
              </div>

              {isMacroTrackingEnabled() && <MacroSummaryRow macros={meal.macros ?? EMPTY_MACROS} />}

              <div className="flex flex-col gap-1.5">
                {presentNutrients.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {t.noNutrientData}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {presentNutrients.map((n) => {
                      const amount = meal.nutrients[n.id]
                      const percent = percentOfRda(n.id, amount)
                      const status = coverageStatus(percent)
                      return (
                        <div
                          key={n.id}
                          className="flex flex-col gap-1.5 rounded-xl px-2.5 py-2"
                          style={{ backgroundColor: 'var(--surface-cream)', border: '1px solid var(--border)' }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                              {NUTRIENT_MAP[n.id].name}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                                {amount.toFixed(amount < 10 ? 1 : 0)}
                                {n.unit}
                              </span>
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                                style={{ backgroundColor: STATUS_SOFT_VAR[status], color: STATUS_VAR[status] }}
                              >
                                {percent}%
                              </span>
                            </span>
                          </div>
                          <span className="block h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: STATUS_SOFT_VAR[status] }}>
                            <span
                              className="block h-full rounded-full transition-[width] duration-500"
                              style={{ width: `${Math.min(100, percent)}%`, backgroundColor: STATUS_VAR[status] }}
                            />
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

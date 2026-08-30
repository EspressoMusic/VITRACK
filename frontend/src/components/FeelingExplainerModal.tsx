import { createPortal } from 'react-dom'
import type { NutrientId } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
import { NUTRIENT_FEELING } from '../lib/i18n/nutrientFeelings'
import { NUTRIENT_ROLE } from '../lib/i18n/nutrientRole'
import { FEELING_EXPLAINER_MODAL_STRINGS } from '../lib/i18n/feelingExplainerModal'
import { CloseIcon } from './icons'

/** A plain-language "why might I feel this way" explainer for today's worst-covered nutrient —
 *  deliberately simpler than NutrientDetailModal (no stats/progress bar): just the feeling, a
 *  one-sentence cause, and one casual food suggestion. */
export function FeelingExplainerModal({
  id,
  onClose,
}: {
  id: NutrientId
  onClose: () => void
}) {
  const { lang } = useLanguage()
  const t = FEELING_EXPLAINER_MODAL_STRINGS[lang]
  const content = NUTRIENT_CONTENT[lang][id]
  const feeling = NUTRIENT_FEELING[lang][id]
  const role = NUTRIENT_ROLE[lang][id]
  // Lowercased so it reads naturally mid-sentence in English ("eat a little oranges" vs
  // "Oranges") — a no-op for Hebrew/Arabic, which don't have letter casing.
  const topFood = content.foodSources[0]
  const topFoodLower = topFood.charAt(0).toLowerCase() + topFood.slice(1)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px) grayscale(1)', WebkitBackdropFilter: 'blur(6px) grayscale(1)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-3xl"
        style={{ backgroundColor: '#e5c184', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <div className="flex shrink-0 justify-end px-3.5 pt-3">
          <button
            onClick={onClose}
            aria-label={t.closeAriaLabel}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3.5 pb-3.5 pt-1">
          <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: 'var(--surface-cream)' }}>
            <p className="text-sm font-extrabold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {t.todaySentence(feeling)}
            </p>
          </div>

          <div className="mt-2">
            <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              {t.whyLabel}
            </p>
            <div className="rounded-2xl p-2.5" style={{ backgroundColor: 'var(--surface-cream)' }}>
              <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {t.whySentence(content.name, role)}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              {t.helpLabel}
            </p>
            <div className="rounded-2xl p-2.5 text-center" style={{ backgroundColor: 'var(--surface-cream)' }}>
              <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {t.solutionSentence(topFoodLower)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-full py-2 text-sm font-bold transition-transform active:translate-y-0.5"
            style={{ backgroundColor: 'var(--accent-strong)', color: '#fff', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
          >
            {t.gotIt}
          </button>

          <p className="mt-2 text-center text-[9px] leading-snug" style={{ color: 'var(--text-muted)' }}>
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}

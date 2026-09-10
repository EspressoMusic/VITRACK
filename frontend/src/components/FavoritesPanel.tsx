import { useState } from 'react'
import { createPortal } from 'react-dom'
import { SUPERFOODS, type SuperfoodDef } from '../lib/superfoods'
import { SUPERFOOD_CONTENT } from '../lib/i18n/superfoodsPanel'
import { FAVORITES_PANEL_STRINGS } from '../lib/i18n/favoritesPanel'
import { getSavedMeals, unsaveMeal, type SavedMeal } from '../lib/savedMeals'
import { useLanguage } from '../contexts/LanguageContext'
import { CloseIcon, StarIcon } from './icons'
import { MacroSummaryRow } from './MacroSummaryRow'
import { isMacroTrackingEnabled } from '../lib/macros'
import { SuperfoodDetailModal } from './SuperfoodsPanel'

function SavedFoodChip({ food, onSelect }: { food: SuperfoodDef; onSelect: () => void }) {
  const { lang } = useLanguage()
  const content = SUPERFOOD_CONTENT[lang][food.id]
  return (
    <button
      onClick={onSelect}
      className="flex shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-2 transition active:translate-y-0.5"
      style={{ backgroundColor: 'var(--surface-cream)', border: '1.5px solid rgba(0,0,0,0.15)' }}
    >
      {food.imageSrc ? (
        <img src={food.imageSrc} alt="" className="h-9 w-9 object-contain" />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center text-2xl" aria-hidden>
          {food.emoji}
        </span>
      )}
      <span className="max-w-[4.5rem] truncate text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {content.name}
      </span>
    </button>
  )
}

export function SavedMealCard({ meal, removeAriaLabel, onRemove }: { meal: SavedMeal; removeAriaLabel: string; onRemove: () => void }) {
  return (
    <div
      className="relative flex flex-col gap-1.5 rounded-2xl p-2.5"
      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
    >
      <button
        onClick={onRemove}
        aria-label={removeAriaLabel}
        className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center"
        style={{ color: 'var(--accent)' }}
      >
        <StarIcon className="h-4 w-4" filled />
      </button>
      <div className="flex items-center gap-2 pe-6">
        <span className="text-xl leading-none" aria-hidden>
          {meal.emoji}
        </span>
        <span className="truncate text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          {meal.name}
        </span>
      </div>
      {meal.tip && (
        <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {meal.tip}
        </p>
      )}
      {isMacroTrackingEnabled() && (
        <MacroSummaryRow macros={{ calories: meal.calories, carbsG: meal.carbsG, fatG: meal.fatG, proteinG: meal.proteinG }} />
      )}
    </div>
  )
}

export function FavoritesPanel({
  onClose,
  savedSuperfoodIds,
  onToggleSuperfoodSave,
}: {
  onClose: () => void
  savedSuperfoodIds: Set<string>
  onToggleSuperfoodSave: (id: string) => void
}) {
  const { lang } = useLanguage()
  const t = FAVORITES_PANEL_STRINGS[lang]
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() => getSavedMeals())
  const [selectedFood, setSelectedFood] = useState<SuperfoodDef | null>(null)

  const savedFoods = SUPERFOODS.filter((food) => savedSuperfoodIds.has(food.id))

  function removeMeal(name: string) {
    unsaveMeal(name)
    setSavedMeals((prev) => prev.filter((m) => m.name !== name))
  }

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
        <div className="relative flex shrink-0 items-center justify-center pb-2">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {t.title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t.ariaLabel}
            className="absolute end-0 top-0 flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pe-1">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              {t.savedFoodsTitle}
            </span>
            {savedFoods.length === 0 ? (
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {t.emptyFoods}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {savedFoods.map((food) => (
                  <SavedFoodChip key={food.id} food={food} onSelect={() => setSelectedFood(food)} />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              {t.savedMealsTitle}
            </span>
            {savedMeals.length === 0 ? (
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {t.emptyMeals}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {savedMeals.map((meal) => (
                  <SavedMealCard key={meal.name} meal={meal} removeAriaLabel={t.removeAriaLabel} onRemove={() => removeMeal(meal.name)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedFood && (
        <SuperfoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          saved={savedSuperfoodIds.has(selectedFood.id)}
          onToggleSave={() => onToggleSuperfoodSave(selectedFood.id)}
        />
      )}
    </div>,
    document.body
  )
}

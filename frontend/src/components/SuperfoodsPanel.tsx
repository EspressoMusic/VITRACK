import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MEAL_PURPOSE_EMOJI, MEAL_PURPOSES, SUPERFOOD_CATEGORIES, SUPERFOODS, superfoodOfTheDay, type MealPurpose, type SuperfoodCategory, type SuperfoodDef } from '../lib/superfoods'
import { todayKey } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import type { Lang } from '../lib/i18n/lang'
import { SUPERFOOD_CONTENT, SUPERFOODS_PANEL_CHROME, type BenefitPart } from '../lib/i18n/superfoodsPanel'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
import { NUTRIENT_FILTER_CHROME } from '../lib/i18n/nutrientFilter'
import { NUTRIENT_BUCKETS, type NutrientBucket } from '../lib/nutrientBuckets'
import { getSavedSuperfoodIds, setSavedSuperfoodIds } from '../lib/savedSuperfoods'
import { getSavedMeals, unsaveMeal, type SavedMeal } from '../lib/savedMeals'
import { FAVORITES_PANEL_STRINGS } from '../lib/i18n/favoritesPanel'
import { getAllMeals } from '../lib/db'
import { resolveFoodEmoji } from '../lib/foodEmoji'
import type { MealEntry, NutrientId } from '../types'
import { CloseIcon, FilterIcon, StarIcon } from './icons'
import { SavedMealCard } from './FavoritesPanel'
import { MealDetailModal } from './MealDetailModal'

function NutrientInfoModal({ id, onClose }: { id: NutrientId; onClose: () => void }) {
  const { lang } = useLanguage()
  const content = NUTRIENT_CONTENT[lang][id]

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl p-4 text-center"
        style={{ backgroundColor: 'var(--surface-cream)', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={onClose}
          aria-label={content.name}
          className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {content.name}
        </h2>
        <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {content.benefit}
        </p>
        <div className="flex flex-wrap justify-center gap-1">
          {content.foodSources.map((source) => (
            <span
              key={source}
              className="rounded-full px-2 py-1 text-[10px] font-medium"
              style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-primary)', border: '1.5px solid #1a1a19' }}
            >
              {source}
            </span>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

function SuperfoodBenefit({ parts, onSelectNutrient }: { parts: BenefitPart[]; onSelectNutrient: (id: NutrientId) => void }) {
  return (
    <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <button
            key={i}
            onClick={() => onSelectNutrient(part.nutrient)}
            className="font-bold"
            style={{ color: 'var(--accent-strong)' }}
          >
            {part.label}
          </button>
        )
      )}
    </p>
  )
}

function SuperfoodImage({ food, className, emojiSize = '1.75em' }: { food: SuperfoodDef; className: string; emojiSize?: string }) {
  if (food.imageSrc) {
    return <img src={food.imageSrc} alt="" className={`${className} object-contain`} />
  }
  return (
    <span className={`${className} flex items-center justify-center`} style={{ fontSize: emojiSize }} aria-hidden>
      {food.emoji}
    </span>
  )
}

export function SuperfoodDetailModal({
  food,
  onClose,
  saved,
  onToggleSave,
}: {
  food: SuperfoodDef
  onClose: () => void
  saved: boolean
  onToggleSave: () => void
}) {
  const { lang } = useLanguage()
  const content = SUPERFOOD_CONTENT[lang][food.id]
  const t = SUPERFOODS_PANEL_CHROME[lang]
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientId | null>(null)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl p-4 text-center"
        style={{ backgroundColor: '#e5c184', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={onToggleSave}
          aria-label={saved ? t.unsave : t.save}
          aria-pressed={saved}
          className="absolute start-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: saved ? 'var(--accent-strong)' : 'var(--text-primary)' }}
        >
          <StarIcon className="h-3.5 w-3.5" filled={saved} />
        </button>
        <button
          onClick={onClose}
          aria-label={SUPERFOODS_PANEL_CHROME[lang].todaysSuperfood}
          className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        <div className="icon-glow-wrap h-28 w-28">
          <SuperfoodImage food={food} className="food-wiggle-in h-28 w-28" emojiSize="4em" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {content.name}
        </h2>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
        >
          {content.power}
        </span>
        {food.category === 'meal' && food.mealPurpose && (
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-primary)', border: '1.5px solid #1a1a19' }}
          >
            {t.mealPurposes[food.mealPurpose]} {MEAL_PURPOSE_EMOJI[food.mealPurpose]}
          </span>
        )}
        <SuperfoodBenefit parts={content.benefit} onSelectNutrient={setSelectedNutrient} />
      </div>

      {selectedNutrient && <NutrientInfoModal id={selectedNutrient} onClose={() => setSelectedNutrient(null)} />}
    </div>,
    document.body
  )
}

function FoodCard({
  food,
  lang,
  featured,
  saved,
  onSelect,
  onToggleSave,
}: {
  food: SuperfoodDef
  lang: Lang
  featured: boolean
  saved: boolean
  onSelect: () => void
  onToggleSave: () => void
}) {
  const content = SUPERFOOD_CONTENT[lang][food.id]
  const t = SUPERFOODS_PANEL_CHROME[lang]
  return (
    <button
      onClick={onSelect}
      className={`relative flex w-full shrink-0 flex-col items-center justify-start gap-0.5 rounded-xl px-1 py-2 text-center transition-transform active:translate-y-0.5 ${featured ? 'featured-card-glow calendar-day-gold' : ''}`}
      style={{
        backgroundColor: featured ? undefined : 'var(--surface-cream)',
        border: '2px solid #000000',
        boxShadow: '0 12px 22px rgba(11,11,11,0.3), 0 5px 0 #000000',
        scrollSnapAlign: 'start',
      }}
    >
      {featured && <span className="shine-sweep" aria-hidden />}
      {saved && (
        <span
          onClick={(e) => {
            e.stopPropagation()
            onToggleSave()
          }}
          role="button"
          aria-label={t.unsave}
          className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center"
          style={{ color: 'var(--accent)' }}
        >
          <StarIcon className="h-3.5 w-3.5" filled />
        </span>
      )}
      <SuperfoodImage food={food} className={`h-11 w-11 shrink-0 ${featured ? 'superfood-float' : ''}`} emojiSize="2em" />
      <span className="w-full truncate text-[11px] font-semibold" style={{ color: featured ? '#3a2a06' : 'var(--text-primary)' }}>
        {content.name}
      </span>
      <span
        className="line-clamp-2 flex min-h-[2.2em] w-full items-center justify-center text-[9px] font-bold leading-tight"
        style={{ color: featured ? '#3a2a06' : 'var(--accent-strong)' }}
      >
        {content.power}
      </span>
    </button>
  )
}

function FoodGrid({
  items,
  lang,
  featuredSuperfoodId,
  savedIds,
  onSelectHero,
  onToggleSave,
  emptyLabel,
}: {
  items: SuperfoodDef[]
  lang: Lang
  featuredSuperfoodId: string
  savedIds: Set<string>
  onSelectHero: (food: SuperfoodDef) => void
  onToggleSave: (id: string) => void
  emptyLabel: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="thin-scroll grid h-full auto-rows-min grid-cols-3 justify-items-stretch gap-x-1.5 gap-y-3 overflow-y-auto content-between pb-24 pt-3">
      {items.map((food) => (
        <FoodCard
          key={food.id}
          food={food}
          lang={lang}
          featured={food.id === featuredSuperfoodId}
          saved={savedIds.has(food.id)}
          onSelect={() => onSelectHero(food)}
          onToggleSave={() => onToggleSave(food.id)}
        />
      ))}
    </div>
  )
}

export function SuperfoodsPanel() {
  const { lang } = useLanguage()
  const [selected, setSelected] = useState<SuperfoodDef | null>(null)
  const [mainTab, setMainTab] = useState<'singleFood' | 'meals'>('singleFood')
  const [activeFilter, setActiveFilter] = useState<NutrientBucket | SuperfoodCategory | 'liked' | null>(null)
  const [activeMealPurpose, setActiveMealPurpose] = useState<MealPurpose | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(getSavedSuperfoodIds()))
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() => getSavedMeals())
  const [recentMeals, setRecentMeals] = useState<MealEntry[]>([])
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null)
  const filterZoneRef = useRef<HTMLDivElement>(null)
  const filterChrome = NUTRIENT_FILTER_CHROME[lang]
  const t = SUPERFOODS_PANEL_CHROME[lang]
  const ft = FAVORITES_PANEL_STRINGS[lang]

  useEffect(() => {
    getAllMeals().then((meals) => {
      const sorted = [...meals].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      setRecentMeals(sorted.slice(0, 8))
    })
  }, [])

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setSavedSuperfoodIds([...next])
      return next
    })
  }

  const removeSavedMeal = (name: string) => {
    unsaveMeal(name)
    setSavedMeals(getSavedMeals())
  }

  const featuredSuperfoodId = useMemo(() => superfoodOfTheDay(todayKey()).id, [])

  const filteredFoods = useMemo(() => {
    const isNutrientBucket = (v: typeof activeFilter): v is NutrientBucket => (NUTRIENT_BUCKETS as string[]).includes(v ?? '')
    return SUPERFOODS.filter((food) => (mainTab === 'meals' ? food.category === 'meal' : food.category !== 'meal'))
      .filter((food) => {
        if (mainTab === 'meals') return !activeMealPurpose || food.mealPurpose === activeMealPurpose
        if (!activeFilter) return true
        if (activeFilter === 'liked') return savedIds.has(food.id)
        if (isNutrientBucket(activeFilter)) return food.nutrients[activeFilter] !== undefined
        return food.category === activeFilter
      })
      .sort((a, b) => {
        const savedDiff = Number(savedIds.has(b.id)) - Number(savedIds.has(a.id))
        if (savedDiff !== 0) return savedDiff
        if (mainTab === 'meals' || !isNutrientBucket(activeFilter)) return 0
        return (b.nutrients[activeFilter] ?? 0) - (a.nutrients[activeFilter] ?? 0)
      })
  }, [activeFilter, activeMealPurpose, mainTab, savedIds])

  useEffect(() => {
    if (!filterOpen) return
    function handlePointerDown(e: PointerEvent) {
      if (filterZoneRef.current && !filterZoneRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [filterOpen])

  return (
    <div className="relative mx-auto flex h-full max-w-md flex-col gap-2 px-4 pt-14">
      {recentMeals.length > 0 && (
        <div className="flex shrink-0 flex-col gap-1.5">
          <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            {t.recentlyEatenTitle}
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {recentMeals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                aria-label={meal.foods[0]?.name ?? t.recentlyEatenTitle}
                className="relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg px-1 transition-transform active:translate-y-0.5 active:shadow-none"
                style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 3px 0 #000000' }}
              >
                <span className="text-2xl leading-none">{resolveFoodEmoji(meal.foods[0]?.name)}</span>
                <span className="w-full truncate text-center text-[9px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {meal.foods[0]?.name ?? ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-center gap-2">
        <div
          className="flex items-center gap-1 rounded-full p-1"
          style={{ backgroundColor: 'var(--surface-cream)', border: '3px solid #000000', boxShadow: '0 3px 0 #000000' }}
        >
          <button
            onClick={() => {
              setMainTab('singleFood')
              setActiveMealPurpose(null)
            }}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-bold"
            style={{
              backgroundColor: mainTab === 'singleFood' ? 'var(--accent-strong)' : 'transparent',
              color: mainTab === 'singleFood' ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            {t.mainTabs.singleFood}
          </button>
          <button
            onClick={() => {
              setMainTab('meals')
              setActiveFilter(null)
            }}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-bold"
            style={{
              backgroundColor: mainTab === 'meals' ? 'var(--accent-strong)' : 'transparent',
              color: mainTab === 'meals' ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            {t.mainTabs.meals}
          </button>
        </div>

        <div ref={filterZoneRef} className="relative shrink-0">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            aria-label={filterChrome.ariaLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'var(--surface-cream)',
              border: '3px solid #000000',
              boxShadow: '0 3px 0 #000000',
              color: activeFilter || activeMealPurpose ? 'var(--accent-strong)' : '#000000',
            }}
          >
            <FilterIcon className="h-3.5 w-3.5" />
          </button>
          {filterOpen && (
              <div
                className="absolute end-0 top-8 z-20 flex flex-col gap-1 rounded-2xl p-1.5"
                style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 10px 20px rgba(11,11,11,0.25), 0 4px 0 #000000' }}
              >
                {mainTab === 'meals' ? (
                  <>
                    <button
                      onClick={() => {
                        setActiveMealPurpose(null)
                        setFilterOpen(false)
                      }}
                      className="whitespace-nowrap rounded-full px-3 py-1 text-start text-[11px] font-bold"
                      style={{
                        backgroundColor: !activeMealPurpose ? 'var(--accent-strong)' : 'transparent',
                        color: !activeMealPurpose ? '#ffffff' : 'var(--text-primary)',
                      }}
                    >
                      {t.mealPurposeAll}
                    </button>
                    {MEAL_PURPOSES.map((mealPurpose) => (
                      <button
                        key={mealPurpose}
                        onClick={() => {
                          setActiveMealPurpose((prev) => (prev === mealPurpose ? null : mealPurpose))
                          setFilterOpen(false)
                        }}
                        className="whitespace-nowrap rounded-full px-3 py-1 text-start text-[11px] font-bold"
                        style={{
                          backgroundColor: activeMealPurpose === mealPurpose ? 'var(--accent-strong)' : 'transparent',
                          color: activeMealPurpose === mealPurpose ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {t.mealPurposes[mealPurpose]}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {NUTRIENT_BUCKETS.map((bucket) => (
                      <button
                        key={bucket}
                        onClick={() => {
                          setActiveFilter((prev) => (prev === bucket ? null : bucket))
                          setFilterOpen(false)
                        }}
                        className="whitespace-nowrap rounded-full px-3 py-1 text-start text-[11px] font-bold"
                        style={{
                          backgroundColor: activeFilter === bucket ? 'var(--accent-strong)' : 'transparent',
                          color: activeFilter === bucket ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {filterChrome.labels[bucket]}
                      </button>
                    ))}
                    {SUPERFOOD_CATEGORIES.filter((category) => category !== 'meal').map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setActiveFilter((prev) => (prev === category ? null : category))
                          setFilterOpen(false)
                        }}
                        className="whitespace-nowrap rounded-full px-3 py-1 text-start text-[11px] font-bold"
                        style={{
                          backgroundColor: activeFilter === category ? 'var(--accent-strong)' : 'transparent',
                          color: activeFilter === category ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {t.categories[category]}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setActiveFilter((prev) => (prev === 'liked' ? null : 'liked'))
                        setFilterOpen(false)
                      }}
                      className="whitespace-nowrap rounded-full px-3 py-1 text-start text-[11px] font-bold"
                      style={{
                        backgroundColor: activeFilter === 'liked' ? 'var(--accent-strong)' : 'transparent',
                        color: activeFilter === 'liked' ? '#ffffff' : 'var(--text-primary)',
                      }}
                    >
                      {t.likedCategory}
                    </button>
                  </>
                )}
              </div>
            )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {mainTab === 'meals' && savedMeals.length > 0 && (
          <div className="flex shrink-0 flex-col gap-1.5 pb-2" style={{ maxHeight: '38%' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              {t.savedMealsTitle}
            </span>
            <div className="thin-scroll flex flex-col gap-2 overflow-y-auto">
              {savedMeals.map((meal) => (
                <SavedMealCard
                  key={meal.name}
                  meal={meal}
                  removeAriaLabel={ft.removeAriaLabel}
                  onRemove={() => removeSavedMeal(meal.name)}
                />
              ))}
            </div>
          </div>
        )}
        <div className="min-h-0 flex-1">
          <FoodGrid
            items={filteredFoods}
            lang={lang}
            featuredSuperfoodId={featuredSuperfoodId}
            savedIds={savedIds}
            onSelectHero={setSelected}
            onToggleSave={toggleSaved}
            emptyLabel={t.noItemsInCategory}
          />
        </div>
      </div>

      {selected && (
        <SuperfoodDetailModal
          food={selected}
          onClose={() => setSelected(null)}
          saved={savedIds.has(selected.id)}
          onToggleSave={() => toggleSaved(selected.id)}
        />
      )}

      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
    </div>
  )
}

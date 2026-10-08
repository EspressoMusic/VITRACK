import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MEAL_PURPOSE_EMOJI, MEAL_PURPOSES, SUPERFOODS, superfoodOfTheDay, type MealPurpose, type SuperfoodCategory, type SuperfoodDef } from '../lib/superfoods'
import { todayKey } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import { dirFor, type Lang } from '../lib/i18n/lang'
import { SUPERFOOD_CONTENT, SUPERFOOD_GUIDE, SUPERFOOD_WARNING, SUPERFOODS_PANEL_CHROME, type BenefitPart } from '../lib/i18n/superfoodsPanel'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
import { NUTRIENT_FILTER_CHROME } from '../lib/i18n/nutrientFilter'
import { NUTRIENT_BUCKETS, type NutrientBucket } from '../lib/nutrientBuckets'
import { getSavedSuperfoodIds, setSavedSuperfoodIds } from '../lib/savedSuperfoods'
import { getSavedMeals, unsaveMeal, type SavedMeal } from '../lib/savedMeals'
import { FAVORITES_PANEL_STRINGS } from '../lib/i18n/favoritesPanel'
import type { NutrientId } from '../types'
import { BotIcon, ChevronDownIcon, CloseIcon, FilterIcon, SearchIcon, StarIcon } from './icons'
import { SavedMealCard } from './FavoritesPanel'
import { ConfettiBurst } from './ConfettiBurst'

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
        style={{ backgroundColor: '#e5c184', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
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
              style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '1.5px solid #1a1a19' }}
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

/** Treats get a matte-red card with cream text so they read as "not healthy" at a glance. */
const TREAT_RED = '#c97b70'
const TREAT_INK = '#fffaf0'
const TREAT_INK_SOFT = 'rgba(255,250,240,0.95)'

function SuperfoodBenefit({ parts, onSelectNutrient, treat }: { parts: BenefitPart[]; onSelectNutrient: (id: NutrientId) => void; treat: boolean }) {
  return (
    <p className="text-xs leading-snug" style={{ color: treat ? TREAT_INK : 'var(--text-secondary)' }}>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <button
            key={i}
            onClick={() => onSelectNutrient(part.nutrient)}
            className="font-bold"
            style={{ color: treat ? TREAT_INK : 'var(--accent-strong)' }}
          >
            {part.label}
          </button>
        )
      )}
    </p>
  )
}

function SuperfoodGuideSection({ foodId, treat }: { foodId: string; treat: boolean }) {
  const { lang } = useLanguage()
  const t = SUPERFOODS_PANEL_CHROME[lang]
  const guide = SUPERFOOD_GUIDE[lang][foodId]
  const warning = SUPERFOOD_WARNING[lang][foodId]
  const [open, setOpen] = useState(false)
  const rows = warning
    ? [
        { label: t.warnHarm, text: warning.harm },
        { label: t.warnWhy, text: warning.why },
        { label: t.warnAvoid, text: warning.avoid },
      ]
    : guide
      ? [
          { label: t.guideWhy, text: guide.why },
          { label: t.guideAmount, text: guide.amount },
          { label: t.guideWhen, text: guide.when },
        ]
      : null
  if (!rows) return null
  const accent = treat ? TREAT_INK : 'var(--accent-strong)'

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-1 py-1 text-xs font-bold"
        style={{ color: accent }}
      >
        {t.guideToggle}
        <ChevronDownIcon className="h-3 w-3 shrink-0 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {/* 0fr → 1fr row lets the section slide open to its natural height. */}
      <div className="grid transition-[grid-template-rows] duration-200" style={{ gridTemplateRows: open ? '1fr' : '0fr' }} aria-hidden={!open}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 px-1 pb-1 pt-1 text-start">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <span className="text-[11px] font-extrabold" style={{ color: treat ? TREAT_INK_SOFT : 'var(--accent-strong)' }}>
                  {row.label}
                </span>
                <span className="text-xs font-semibold leading-snug" style={{ color: treat ? TREAT_INK : 'var(--text-secondary)' }}>
                  {row.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
  // Bumped on each star-on so the keyed burst remounts and replays.
  const [burst, setBurst] = useState(0)
  const treat = food.category === 'treat'
  const ink = treat ? TREAT_INK : 'var(--text-primary)'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      {burst > 0 && <ConfettiBurst key={burst} count={36} short inline />}
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl p-4 text-center"
        style={{ backgroundColor: treat ? TREAT_RED : '#e5c184', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={() => {
            if (!saved) setBurst((b) => b + 1)
            onToggleSave()
          }}
          aria-label={saved ? t.unsave : t.save}
          aria-pressed={saved}
          className="absolute start-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: treat ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.08)', color: saved && !treat ? 'var(--accent-strong)' : ink }}
        >
          <StarIcon className="h-3.5 w-3.5" filled={saved} />
        </button>
        <button
          onClick={onClose}
          aria-label={SUPERFOODS_PANEL_CHROME[lang].todaysSuperfood}
          className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: treat ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.08)', color: ink }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        {/* No celebratory gold glow behind unhealthy foods. */}
        <div className={`${treat ? 'flex items-center justify-center' : 'icon-glow-wrap'} h-28 w-28`}>
          <SuperfoodImage food={food} className="food-wiggle-in h-28 w-28" emojiSize="4em" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: ink }}>
          {content.name}
        </h2>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={treat ? { backgroundColor: TREAT_INK, color: TREAT_RED } : { backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
        >
          {content.power.replace(TRAILING_EMOJI, '')}
        </span>
        {food.category === 'meal' && food.mealPurpose && (
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-primary)', border: '1.5px solid #1a1a19' }}
          >
            {t.mealPurposes[food.mealPurpose]} {MEAL_PURPOSE_EMOJI[food.mealPurpose]}
          </span>
        )}
        <SuperfoodBenefit parts={content.benefit} onSelectNutrient={setSelectedNutrient} treat={treat} />
        <SuperfoodGuideSection foodId={food.id} treat={treat} />
      </div>

      {selectedNutrient && <NutrientInfoModal id={selectedNutrient} onClose={() => setSelectedNutrient(null)} />}
    </div>,
    document.body
  )
}

const TRAILING_EMOJI = /[\s\p{Extended_Pictographic}‍️]+$/u

function FoodCard({
  food,
  lang,
  featured,
  nameFontSize,
  onSelect,
}: {
  food: SuperfoodDef
  lang: Lang
  featured: boolean
  nameFontSize: string
  onSelect: () => void
}) {
  const content = SUPERFOOD_CONTENT[lang][food.id]
  const treat = food.category === 'treat'
  return (
    <button
      onClick={onSelect}
      className={`scroll-card relative flex w-full shrink-0 flex-col items-center justify-start overflow-hidden rounded-[22px] px-1.5 pb-[7%] pt-[6%] text-center ${featured ? 'featured-card-glow calendar-day-gold' : ''}`}
      style={{
        backgroundColor: featured ? undefined : treat ? TREAT_RED : 'var(--surface-cream)',
        border: '2.5px solid #000000',
        boxShadow: '0 5px 0 #000000',
        scrollSnapAlign: 'start',
        // Lets the image and text size off the card's own width so proportions hold on every screen.
        containerType: 'inline-size',
      }}
    >
      {featured && <span className="shine-sweep" aria-hidden />}
      <SuperfoodImage food={food} className={`h-[64cqw] w-[64cqw] shrink-0 ${featured ? 'superfood-float' : ''}`} emojiSize="3em" />
      <span
        // Always one line, same size on every card (sized by the grid to fit its longest name).
        className="mt-[3cqw] w-full overflow-hidden text-ellipsis whitespace-nowrap font-extrabold leading-[1.15]"
        style={{
          color: featured ? '#3a2a06' : treat ? TREAT_INK : 'var(--text-primary)',
          fontSize: nameFontSize,
        }}
      >
        {content.name}
      </span>
      <span
        // Fixed 3-line box so every card's text sits in the same spot and cards match in height.
        className="mt-[2cqw] line-clamp-3 h-[3.75em] w-full text-[max(8px,7cqw)] font-bold leading-[1.25]"
        style={{ color: featured ? '#3a2a06' : treat ? TREAT_INK_SOFT : 'var(--accent-strong)' }}
      >
        {content.power.replace(TRAILING_EMOJI, '')}
      </span>
    </button>
  )
}

function FoodGrid({
  items,
  lang,
  featuredSuperfoodId,
  onSelectHero,
  emptyLabel,
  flushTop,
}: {
  items: SuperfoodDef[]
  lang: Lang
  featuredSuperfoodId: string
  onSelectHero: (food: SuperfoodDef) => void
  emptyLabel: string
  // Grid runs up to the panel's top edge, so it needs its own breathing room above the first row.
  flushTop: boolean
}) {
  const longestName = Math.max(1, ...items.map((food) => SUPERFOOD_CONTENT[lang][food.id]?.name.length ?? 0))
  const nameFontSize = `min(max(12px, 11cqw), ${135 / longestName}cqw)`

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        {emptyLabel}
      </div>
    )
  }

  return (
    <div
      // Extra bottom padding lets the last row scroll clear of the floating filter button.
      // -mx-4/px-4 widens the scroll box to the panel edge so the featured card's side glow isn't sliced off.
      className={`thin-scroll -mx-4 grid h-full auto-rows-min grid-cols-3 justify-items-stretch gap-x-2.5 gap-y-4 overflow-y-auto content-start px-4 pb-16 ${flushTop ? 'pt-8' : 'pt-3'}`}
      // Cards fade out as they scroll past the top instead of being sliced by a hard edge.
      style={{
        maskImage: `linear-gradient(to bottom, transparent 0, #000 ${flushTop ? 28 : 12}px)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent 0, #000 ${flushTop ? 28 : 12}px)`,
      }}
    >
      {items.map((food) => (
        <FoodCard
          key={food.id}
          food={food}
          lang={lang}
          featured={food.id === featuredSuperfoodId}
          nameFontSize={nameFontSize}
          onSelect={() => onSelectHero(food)}
        />
      ))}
    </div>
  )
}

export function SuperfoodsPanel({ onAskBot }: { onAskBot?: () => void }) {
  const { lang } = useLanguage()
  const [selected, setSelected] = useState<SuperfoodDef | null>(null)
  const [activeFilter, setActiveFilter] = useState<NutrientBucket | SuperfoodCategory | null>(null)
  const [activeMealPurpose, setActiveMealPurpose] = useState<MealPurpose | null>(null)
  const [likedOnly, setLikedOnly] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(getSavedSuperfoodIds()))
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() => getSavedMeals())
  const filterZoneRef = useRef<HTMLDivElement>(null)
  const filterChrome = NUTRIENT_FILTER_CHROME[lang]
  const t = SUPERFOODS_PANEL_CHROME[lang]
  const ft = FAVORITES_PANEL_STRINGS[lang]
  const showMeals = activeFilter === 'meal'

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

  const searchTerm = query.trim().toLowerCase()

  const filteredFoods = useMemo(() => {
    const isNutrientBucket = (v: typeof activeFilter): v is NutrientBucket => (NUTRIENT_BUCKETS as string[]).includes(v ?? '')
    // A search looks across every food and meal, ignoring the other filters.
    if (searchTerm) {
      return SUPERFOODS.filter((food) => SUPERFOOD_CONTENT[lang][food.id]?.name.toLowerCase().includes(searchTerm)).sort(
        (a, b) => Number(savedIds.has(b.id)) - Number(savedIds.has(a.id)),
      )
    }
    return SUPERFOODS.filter((food) => (showMeals ? food.category === 'meal' : food.category !== 'meal'))
      .filter((food) => !likedOnly || savedIds.has(food.id))
      .filter((food) => {
        if (showMeals) return !activeMealPurpose || food.mealPurpose === activeMealPurpose
        if (!activeFilter) return true
        if (isNutrientBucket(activeFilter)) return food.nutrients[activeFilter] !== undefined
        return food.category === activeFilter
      })
      .sort((a, b) => {
        const savedDiff = Number(savedIds.has(b.id)) - Number(savedIds.has(a.id))
        if (savedDiff !== 0) return savedDiff
        if (!isNutrientBucket(activeFilter)) return 0
        return (b.nutrients[activeFilter] ?? 0) - (a.nutrients[activeFilter] ?? 0)
      })
  }, [activeFilter, activeMealPurpose, likedOnly, savedIds, showMeals, searchTerm, lang])

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

  const chipClass = 'flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold'
  const rowDividerClass = 'h-px basis-full shrink-0'
  const rowDividerStyle = { backgroundColor: 'rgba(0,0,0,0.15)' }
  const chipStyle = (active: boolean) => ({
    backgroundColor: active ? 'var(--accent-strong)' : 'transparent',
    color: active ? '#ffffff' : 'var(--text-primary)',
    border: `1.5px solid ${active ? '#000000' : 'rgba(0,0,0,0.18)'}`,
  })

  const anyFilterActive = activeFilter !== null || activeMealPurpose !== null || likedOnly || searchTerm !== ''

  const gridFlushTop = !(showMeals && savedMeals.length > 0)

  return (
    <div className={`relative mx-auto flex h-full max-w-md flex-col gap-2 px-4 ${gridFlushTop ? '' : 'pt-5'}`}>
      <div className="-mx-4 flex min-h-0 flex-1 flex-col overflow-hidden px-4">
        {showMeals && savedMeals.length > 0 && (
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
            onSelectHero={setSelected}
            emptyLabel={searchTerm ? t.noSearchResults : t.noItemsInCategory}
            flushTop={gridFlushTop}
          />
        </div>
      </div>

      {/* Keeps the grid clear of the app NavBar, which overlays the panel. Its height is rem-based
          (h-14 + py-1.5 + 2px border), so these offsets are too — px values fall behind when Android's
          system font size scales rem up, and the bar then covers the filter button. */}
      <div className="-mt-2 shrink-0" style={{ height: 'calc(4.25rem + 2px)' }} aria-hidden />

      {/* Floating filter button: opens a wrapping panel with search plus every filter. */}
      <div
        ref={filterZoneRef}
        className="pointer-events-none absolute inset-x-4 z-20 flex items-end justify-end gap-2"
        style={{ bottom: 'calc(5rem + 2px)' }}
      >
        {filterOpen && (
          <div
            className="filter-row-enter pointer-events-auto min-w-0 flex-1 rounded-3xl p-2"
            style={{
              transformOrigin: dirFor(lang) === 'rtl' ? 'left bottom' : 'right bottom',
              backgroundColor: 'var(--surface-cream)',
              border: '2px solid #000000',
              boxShadow: '0 4px 0 #000000, 0 8px 16px rgba(11,11,11,0.25)',
            }}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setFilterOpen(false)
                }}
                className="flex w-full items-center gap-1 rounded-full px-2.5 py-1.5"
                style={{ backgroundColor: '#ffffff', border: '1.5px solid #000000' }}
              >
                <SearchIcon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} aria-label={t.clearSearch} className="shrink-0" style={{ color: 'var(--text-secondary)' }}>
                    <CloseIcon className="h-3 w-3" />
                  </button>
                )}
              </form>

              <span className={rowDividerClass} style={rowDividerStyle} aria-hidden />
              <button
                onClick={() => {
                  setLikedOnly((v) => !v)
                  setFilterOpen(false)
                }}
                aria-pressed={likedOnly}
                className={chipClass}
                style={chipStyle(likedOnly)}
              >
                <StarIcon className="h-3.5 w-3.5" filled={likedOnly} />
                {t.likedCategory}
              </button>
              {onAskBot && (
                <button onClick={onAskBot} className={chipClass} style={chipStyle(false)}>
                  <BotIcon className="h-3.5 w-3.5" />
                  {t.askBot}
                </button>
              )}

              <span className={rowDividerClass} style={rowDividerStyle} aria-hidden />
              {showMeals ? (
                <>
                  <button
                    onClick={() => {
                      setActiveMealPurpose(null)
                      setFilterOpen(false)
                    }}
                    className={chipClass}
                    style={chipStyle(!activeMealPurpose)}
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
                      className={chipClass}
                      style={chipStyle(activeMealPurpose === mealPurpose)}
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
                      className={chipClass}
                      style={chipStyle(activeFilter === bucket)}
                    >
                      {filterChrome.labels[bucket]}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setActiveFilter((prev) => (prev === 'treat' ? null : 'treat'))
                      setFilterOpen(false)
                    }}
                    className={chipClass}
                    style={chipStyle(activeFilter === 'treat')}
                  >
                    {t.unhealthyCategory}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setFilterOpen((v) => !v)}
          aria-label={filterChrome.ariaLabel}
          aria-expanded={filterOpen}
          className="pointer-events-auto relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:translate-y-0.5"
          style={{ backgroundColor: '#6b4423', color: '#f5deb3', border: '2px solid #000000', boxShadow: '0 3px 0 #000000, 0 6px 12px rgba(11,11,11,0.3)' }}
        >
          {filterOpen ? <CloseIcon className="h-4 w-4" /> : <FilterIcon className="h-4 w-4" />}
          {anyFilterActive && !filterOpen && (
            <span
              className="absolute -top-0.5 end-0 h-3 w-3 rounded-full"
              style={{ backgroundColor: 'var(--accent-strong)', border: '2px solid #000000' }}
              aria-hidden
            />
          )}
        </button>
      </div>

      {selected && (
        <SuperfoodDetailModal
          food={selected}
          onClose={() => setSelected(null)}
          saved={savedIds.has(selected.id)}
          onToggleSave={() => toggleSaved(selected.id)}
        />
      )}

    </div>
  )
}

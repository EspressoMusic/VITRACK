import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { User } from '@supabase/supabase-js'
import { SUPERFOODS, superfoodOfTheDay, type NutrientHeadline, type SuperfoodDef } from '../lib/superfoods'
import { JUNK_FOODS, junkFoodOfTheDay, type JunkFoodDef } from '../lib/junkFoods'
import { todayKey } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import type { Lang } from '../lib/i18n/lang'
import { SUPERFOOD_CONTENT, SUPERFOODS_PANEL_CHROME, type BenefitPart } from '../lib/i18n/superfoodsPanel'
import { JUNK_FOOD_CONTENT } from '../lib/i18n/junkFoodsPanel'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
import { NUTRIENT_FILTER_CHROME } from '../lib/i18n/nutrientFilter'
import { NUTRIENT_BUCKETS, type NutrientBucket } from '../lib/nutrientBuckets'
import type { NutrientId } from '../types'
import { CloseIcon, FilterIcon, SearchIcon } from './icons'

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

/** Junk food's XP penalty badge — always negative, so always the red/critical treatment. */
function XpText({ xp, size = 'sm' }: { xp: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-base' : 'text-xs'
  const paddingClass = size === 'lg' ? 'px-3 py-1' : 'px-1.5 py-0.5'

  return (
    <span
      className={`${paddingClass} inline-flex items-center justify-center rounded-full`}
      style={{ backgroundColor: 'var(--status-critical-soft)', border: '1.5px solid var(--status-critical)' }}
    >
      <span className={`${sizeClass} font-extrabold leading-tight`} style={{ color: 'var(--status-critical)' }}>
        {xp} XP
      </span>
    </span>
  )
}

/** A superfood's real per-100g amount of its standout nutrient, e.g. "22g Protein" or "835mcg Vitamin A". */
function NutrientAmountText({ headline, lang, size = 'sm' }: { headline: NutrientHeadline; lang: Lang; size?: 'sm' | 'lg' }) {
  const filterChrome = NUTRIENT_FILTER_CHROME[lang]
  const label =
    headline.kind === 'vitaminC' || headline.kind === 'vitaminA'
      ? filterChrome.vitaminLabels[headline.kind]
      : filterChrome.labels[headline.kind]
  const sizeClass = size === 'lg' ? 'text-base' : 'text-xs'
  const paddingClass = size === 'lg' ? 'px-3 py-1' : 'px-1.5 py-0.5'

  return (
    <span
      className={`${paddingClass} inline-flex items-center justify-center rounded-full`}
      style={{ backgroundColor: '#dcf0fd', border: '1.5px solid #1d8fe0' }}
    >
      <span className={`${sizeClass} font-extrabold leading-tight`} style={{ color: '#1d8fe0' }}>
        {headline.amount}
        {headline.unit} {label}
      </span>
    </span>
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

export function SuperfoodDetailModal({ food, onClose }: { food: SuperfoodDef; onClose: () => void }) {
  const { lang } = useLanguage()
  const content = SUPERFOOD_CONTENT[lang][food.id]
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
        <SuperfoodBenefit parts={content.benefit} onSelectNutrient={setSelectedNutrient} />
        <NutrientAmountText headline={food.headline} lang={lang} size="lg" />
      </div>

      {selectedNutrient && <NutrientInfoModal id={selectedNutrient} onClose={() => setSelectedNutrient(null)} />}
    </div>,
    document.body
  )
}

function JunkFoodDetailModal({ food, onClose }: { food: JunkFoodDef; onClose: () => void }) {
  const { lang } = useLanguage()
  const content = JUNK_FOOD_CONTENT[lang][food.id]

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(80,80,80,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl p-4 text-center"
        style={{ backgroundColor: '#f6c3ba', border: '4px solid #1a1a19', boxShadow: '0 14px 30px rgba(11,11,11,0.22), 0 4px 0 #1a1a19' }}
      >
        <button
          onClick={onClose}
          aria-label={content.name}
          className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        <span className="food-wiggle-in flex h-28 w-28 items-center justify-center" style={{ fontSize: '4em' }} aria-hidden>
          {food.emoji}
        </span>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {content.name}
        </h2>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--status-critical)' }}
        >
          {content.power}
        </span>
        <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {content.benefit}
        </p>
        <XpText xp={food.xp} size="lg" />
      </div>
    </div>,
    document.body
  )
}

/** Best-effort first name for the header greeting — Google sign-in populates user_metadata,
 *  anonymous sessions have neither a name nor an email, so they just get the plain greeting. */
function firstNameOf(user: User | null): string | null {
  if (!user || user.is_anonymous) return null
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const full = meta?.full_name ?? meta?.name ?? meta?.given_name
  if (typeof full === 'string' && full.trim()) return full.trim().split(' ')[0]
  if (user.email) return user.email.split('@')[0]
  return null
}

type FoodItem = { kind: 'hero'; food: SuperfoodDef } | { kind: 'villain'; food: JunkFoodDef }

function FoodCard({ item, lang, featured, onSelect }: { item: FoodItem; lang: Lang; featured: boolean; onSelect: () => void }) {
  const content = item.kind === 'hero' ? SUPERFOOD_CONTENT[lang][item.food.id] : JUNK_FOOD_CONTENT[lang][item.food.id]
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
      {item.kind === 'hero' ? (
        <SuperfoodImage food={item.food} className={`h-11 w-11 shrink-0 ${featured ? 'superfood-float' : ''}`} emojiSize="2em" />
      ) : (
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center ${featured ? 'superfood-float' : ''}`} style={{ fontSize: '2em' }} aria-hidden>
          {item.food.emoji}
        </span>
      )}
      <span className="w-full truncate text-[11px] font-semibold" style={{ color: featured ? '#3a2a06' : 'var(--text-primary)' }}>
        {content.name}
      </span>
      <span
        className="line-clamp-2 flex min-h-[2.2em] w-full items-center justify-center text-[9px] font-bold leading-tight"
        style={{ color: featured ? '#3a2a06' : item.kind === 'hero' ? 'var(--accent-strong)' : 'var(--status-critical)' }}
      >
        {content.power}
      </span>
      {item.kind === 'hero' ? <NutrientAmountText headline={item.food.headline} lang={lang} /> : <XpText xp={item.food.xp} />}
    </button>
  )
}

function FoodGrid({
  items,
  lang,
  featuredSuperfoodId,
  featuredJunkFoodId,
  onSelectHero,
  onSelectVillain,
  emptyLabel,
}: {
  items: FoodItem[]
  lang: Lang
  featuredSuperfoodId: string
  featuredJunkFoodId: string
  onSelectHero: (food: SuperfoodDef) => void
  onSelectVillain: (food: JunkFoodDef) => void
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
    <div className="thin-scroll grid h-full auto-rows-min grid-cols-3 justify-items-stretch gap-x-1.5 gap-y-3 overflow-y-auto content-between pb-2 pt-3">
      {items.map((item) => (
        <FoodCard
          key={`${item.kind}-${item.food.id}`}
          item={item}
          lang={lang}
          featured={item.kind === 'hero' ? item.food.id === featuredSuperfoodId : item.food.id === featuredJunkFoodId}
          onSelect={() => (item.kind === 'hero' ? onSelectHero(item.food) : onSelectVillain(item.food))}
        />
      ))}
    </div>
  )
}

export function SuperfoodsPanel() {
  const { lang } = useLanguage()
  const { user } = useAuth()
  const firstName = useMemo(() => firstNameOf(user), [user])
  const [selected, setSelected] = useState<SuperfoodDef | null>(null)
  const [selectedJunk, setSelectedJunk] = useState<JunkFoodDef | null>(null)
  const [activeFilter, setActiveFilter] = useState<NutrientBucket | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [kindFilter, setKindFilter] = useState<'hero' | 'villain'>('hero')
  const [search, setSearch] = useState('')
  const filterZoneRef = useRef<HTMLDivElement>(null)
  const filterChrome = NUTRIENT_FILTER_CHROME[lang]
  const t = SUPERFOODS_PANEL_CHROME[lang]

  const today = todayKey()
  const featuredSuperfoodId = useMemo(() => superfoodOfTheDay(today).id, [today])
  const featuredJunkFoodId = useMemo(() => junkFoodOfTheDay(today).id, [today])

  const allFoods = useMemo<FoodItem[]>(
    () => [...SUPERFOODS.map((food) => ({ kind: 'hero' as const, food })), ...JUNK_FOODS.map((food) => ({ kind: 'villain' as const, food }))],
    []
  )

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase()
    return allFoods
      .filter((item) => item.kind === kindFilter)
      .filter((item) => !activeFilter || item.food.nutrients[activeFilter] !== undefined)
      .filter((item) => {
        if (!query) return true
        const content = item.kind === 'hero' ? SUPERFOOD_CONTENT[lang][item.food.id] : JUNK_FOOD_CONTENT[lang][item.food.id]
        return content.name.toLowerCase().includes(query)
      })
      .sort((a, b) => (activeFilter ? (b.food.nutrients[activeFilter] ?? 0) - (a.food.nutrients[activeFilter] ?? 0) : 0))
  }, [allFoods, activeFilter, kindFilter, search, lang])

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
    <div className="relative mx-auto flex h-full max-w-md flex-col gap-3 px-4 pb-20 pt-12">
      <h1 className="shrink-0 text-start text-lg font-bold leading-tight pe-12" style={{ color: 'var(--text-primary)' }}>
        {t.greeting(firstName)}
      </h1>

      <div className="flex shrink-0 items-center gap-2">
        <div ref={filterZoneRef} className="relative shrink-0">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            aria-label={filterChrome.ariaLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: activeFilter ? 'var(--accent-strong)' : 'var(--accent)',
              border: '2px solid #000000',
              boxShadow: '0 4px 0 #000000',
              color: 'white',
            }}
          >
            <FilterIcon className="h-3.5 w-3.5" />
          </button>
          {filterOpen && (
            <div
              className="absolute start-0 top-11 z-20 flex flex-col gap-1 rounded-2xl p-1.5"
              style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 10px 20px rgba(11,11,11,0.25), 0 4px 0 #000000' }}
            >
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
            </div>
          )}
        </div>

        <div
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 3px 0 #000000' }}
        >
          <SearchIcon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <div
          className="flex shrink-0 items-center gap-0.5 rounded-full p-0.5"
          style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 3px 0 #000000' }}
        >
          <button
            type="button"
            aria-label={t.healthyAriaLabel}
            aria-pressed={kindFilter === 'hero'}
            onClick={() => setKindFilter('hero')}
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm transition"
            style={{ backgroundColor: kindFilter === 'hero' ? 'var(--accent-strong)' : 'transparent' }}
          >
            🌱
          </button>
          <button
            type="button"
            aria-label={t.junkAriaLabel}
            aria-pressed={kindFilter === 'villain'}
            onClick={() => setKindFilter('villain')}
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm transition"
            style={{ backgroundColor: kindFilter === 'villain' ? 'var(--status-critical)' : 'transparent' }}
          >
            ⚠️
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <FoodGrid
          items={filteredFoods}
          lang={lang}
          featuredSuperfoodId={featuredSuperfoodId}
          featuredJunkFoodId={featuredJunkFoodId}
          onSelectHero={setSelected}
          onSelectVillain={setSelectedJunk}
          emptyLabel={t.noItemsInCategory}
        />
      </div>

      {selected && <SuperfoodDetailModal food={selected} onClose={() => setSelected(null)} />}
      {selectedJunk && <JunkFoodDetailModal food={selectedJunk} onClose={() => setSelectedJunk(null)} />}
    </div>
  )
}

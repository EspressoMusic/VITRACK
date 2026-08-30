import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { SUPERFOODS, superfoodOfTheDay, type SuperfoodDef } from '../lib/superfoods'
import { todayKey } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import type { Lang } from '../lib/i18n/lang'
import { SUPERFOOD_CONTENT, SUPERFOODS_PANEL_CHROME, type BenefitPart } from '../lib/i18n/superfoodsPanel'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
import type { NutrientId } from '../types'
import { CloseIcon } from './icons'

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
        <SuperfoodImage food={food} className="food-wiggle-in h-28 w-28" emojiSize="4em" />
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
      </div>

      {selectedNutrient && <NutrientInfoModal id={selectedNutrient} onClose={() => setSelectedNutrient(null)} />}
    </div>,
    document.body
  )
}

function SuperfoodRow({
  food,
  lang,
  onSelect,
}: {
  food: SuperfoodDef
  lang: Lang
  onSelect: () => void
}) {
  const content = SUPERFOOD_CONTENT[lang][food.id]
  return (
    <button
      onClick={onSelect}
      className="relative flex w-28 shrink-0 flex-col items-center justify-start gap-1 rounded-xl px-1 py-2.5 text-center"
      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', scrollSnapAlign: 'start' }}
    >
      <SuperfoodImage food={food} className="h-14 w-14 shrink-0" emojiSize="2.5em" />
      <span className="w-full truncate text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {content.name}
      </span>
      <span className="w-full text-[10px] font-bold leading-tight" style={{ color: 'var(--accent-strong)' }}>
        {content.power}
      </span>
    </button>
  )
}

function SuperfoodList({
  items,
  lang,
  onSelect,
}: {
  items: SuperfoodDef[]
  lang: Lang
  onSelect: (food: SuperfoodDef) => void
}) {
  const t = SUPERFOODS_PANEL_CHROME[lang]

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        {t.noItemsInCategory}
      </div>
    )
  }

  return (
    <div className="thin-scroll grid h-full auto-rows-min grid-cols-2 justify-items-center gap-1.5 overflow-y-auto content-start pb-1">
      {items.map((food) => (
        <SuperfoodRow key={food.id} food={food} lang={lang} onSelect={() => onSelect(food)} />
      ))}
    </div>
  )
}

export function SuperfoodsPanel() {
  const { lang } = useLanguage()
  const [selected, setSelected] = useState<SuperfoodDef | null>(null)

  const featured = superfoodOfTheDay(todayKey())
  const featuredContent = SUPERFOOD_CONTENT[lang][featured.id]
  const rest = useMemo(() => SUPERFOODS.filter((f) => f.id !== featured.id), [featured.id])

  return (
    <div className="relative mx-auto flex h-full max-w-md flex-col gap-2 px-4 pt-1">
      <button
        onClick={() => setSelected(featured)}
        className="featured-card-glow calendar-day-gold mx-auto mb-2 flex w-28 shrink-0 flex-col items-center justify-start gap-1 rounded-xl px-1 py-2.5 text-center transition-transform active:translate-y-0.5"
        style={{ border: '2px solid #000000' }}
      >
        <span className="shine-sweep" aria-hidden />
        <SuperfoodImage food={featured} className="superfood-float h-14 w-14 shrink-0" emojiSize="2.5em" />
        <span className="w-full truncate text-[12px] font-semibold" style={{ color: '#3a2a06' }}>
          {featuredContent.name}
        </span>
        <span className="w-full text-[10px] font-bold leading-tight" style={{ color: '#3a2a06' }}>
          {featuredContent.power}
        </span>
      </button>

      <div className="mx-1 h-1 shrink-0 rounded-full" style={{ backgroundColor: '#d9a441' }} aria-hidden />

      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-hidden">
          <SuperfoodList items={rest} lang={lang} onSelect={setSelected} />
        </div>
      </div>

      {selected && <SuperfoodDetailModal food={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

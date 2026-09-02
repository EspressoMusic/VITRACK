import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SUPERFOODS, superfoodOfTheDay, type SuperfoodDef } from '../lib/superfoods'
import { JUNK_FOODS, junkFoodOfTheDay, type JunkFoodDef } from '../lib/junkFoods'
import {
  MAX_FOCUS_ITEMS,
  addFocusedJunkFood,
  addFocusedSuperfood,
  getFocusedJunkFoodIds,
  getFocusedSuperfoodIds,
  toggleFocusedJunkFood,
  toggleFocusedSuperfood,
} from '../lib/foodFocus'
import { todayKey } from '../lib/date'
import { useLanguage } from '../contexts/LanguageContext'
import type { Lang } from '../lib/i18n/lang'
import { SUPERFOOD_CONTENT, SUPERFOODS_PANEL_CHROME, type BenefitPart } from '../lib/i18n/superfoodsPanel'
import { JUNK_FOOD_CONTENT, JUNK_FOODS_PANEL_CHROME } from '../lib/i18n/junkFoodsPanel'
import { NUTRIENT_CONTENT } from '../lib/i18n/nutrientContent'
import type { NutrientId } from '../types'
import { CloseIcon, StarIcon } from './icons'

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

/** A food counts as "really healthy" past this XP value and gets the colorful treatment instead of plain blue. */
const VERY_HEALTHY_XP = 10

function XpText({ xp, size = 'sm' }: { xp: number; size?: 'sm' | 'lg' }) {
  const negative = xp < 0
  const veryHealthy = !negative && xp >= VERY_HEALTHY_XP
  const label = `${negative ? xp : `+${xp}`} XP`
  const sizeClass = size === 'lg' ? 'text-base' : 'text-xs'
  const paddingClass = size === 'lg' ? 'px-3 py-1' : 'px-1.5 py-0.5'
  const badgeStyle = negative
    ? { backgroundColor: 'var(--status-critical-soft)', border: '1.5px solid var(--status-critical)' }
    : veryHealthy
      ? { backgroundColor: '#fff7e6', border: '1.5px solid #eab308' }
      : { backgroundColor: '#dcf0fd', border: '1.5px solid #1d8fe0' }

  if (veryHealthy) {
    return (
      <span
        className={`${paddingClass} relative inline-flex items-center justify-center overflow-hidden rounded-full`}
        style={{
          backgroundImage: 'linear-gradient(90deg, #f97316, #eab308, #22c55e, #06b6d4, #8b5cf6)',
          border: '1.5px solid #1a1a19',
          boxShadow: '0 0 10px rgba(234,179,8,0.6)',
        }}
      >
        <span
          className={`${sizeClass} font-extrabold leading-tight`}
          style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {label}
        </span>
        <span className="shine-sweep" aria-hidden />
      </span>
    )
  }

  return (
    <span className={`${paddingClass} relative inline-flex items-center justify-center overflow-hidden rounded-full`} style={badgeStyle}>
      <span className={`${sizeClass} font-extrabold leading-tight`} style={{ color: negative ? 'var(--status-critical)' : '#1d8fe0' }}>
        {label}
      </span>
      {!negative && <span className="shine-sweep" aria-hidden />}
    </span>
  )
}

const LONG_PRESS_MS = 300
const DRAG_START_DISTANCE = 10

/**
 * Mouse: drag activates as soon as the pointer moves past the threshold, like normal desktop
 * drag-and-drop. Touch/pen: requires a brief press-and-hold first, so a normal scroll swipe
 * through the grid doesn't get hijacked as a drag. A quick tap (no activation) opens the modal.
 */
function useLongPressDrag({
  disabled,
  onTap,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  disabled?: boolean
  onTap: () => void
  onDragStart: (x: number, y: number) => void
  onDragMove: (x: number, y: number) => void
  onDragEnd: (x: number, y: number) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const armedRef = useRef(false)
  const draggingRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const startRef = useRef({ x: 0, y: 0 })
  const pointerTypeRef = useRef('mouse')

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const activate = (targetEl: Element, pointerId: number, x: number, y: number) => {
    draggingRef.current = true
    setIsDragging(true)
    targetEl.setPointerCapture?.(pointerId)
    onDragStart(x, y)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    pointerTypeRef.current = e.pointerType
    armedRef.current = true
    const pointerId = e.pointerId
    const targetEl = e.currentTarget
    startRef.current = { x: e.clientX, y: e.clientY }
    clearTimer()
    if (e.pointerType !== 'mouse') {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        activate(targetEl, pointerId, startRef.current.x, startRef.current.y)
      }, LONG_PRESS_MS)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingRef.current) {
      e.preventDefault()
      onDragMove(e.clientX, e.clientY)
      return
    }
    if (!armedRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    const dist = Math.hypot(dx, dy)
    if (pointerTypeRef.current === 'mouse') {
      if (dist > DRAG_START_DISTANCE) {
        activate(e.currentTarget, e.pointerId, startRef.current.x, startRef.current.y)
        e.preventDefault()
        onDragMove(e.clientX, e.clientY)
      }
      return
    }
    if (dist > DRAG_START_DISTANCE) clearTimer()
  }

  const finish = (e: React.PointerEvent, cancelled: boolean) => {
    armedRef.current = false
    clearTimer()
    if (draggingRef.current) {
      draggingRef.current = false
      setIsDragging(false)
      if (!cancelled) onDragEnd(e.clientX, e.clientY)
      return
    }
    if (!cancelled) {
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      if (Math.hypot(dx, dy) < DRAG_START_DISTANCE) onTap()
    }
  }

  return {
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: (e: React.PointerEvent) => finish(e, false),
      onPointerCancel: (e: React.PointerEvent) => finish(e, true),
    },
  }
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
        <XpText xp={food.xp} size="lg" />
      </div>

      {selectedNutrient && <NutrientInfoModal id={selectedNutrient} onClose={() => setSelectedNutrient(null)} />}
    </div>,
    document.body
  )
}

function SuperfoodRow({
  food,
  lang,
  featured,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  food: SuperfoodDef
  lang: Lang
  featured: boolean
  onSelect: () => void
  onDragStart: (food: SuperfoodDef, x: number, y: number) => void
  onDragMove: (x: number, y: number) => void
  onDragEnd: (x: number, y: number) => void
}) {
  const content = SUPERFOOD_CONTENT[lang][food.id]
  const { isDragging, handlers } = useLongPressDrag({
    onTap: onSelect,
    onDragStart: (x, y) => onDragStart(food, x, y),
    onDragMove,
    onDragEnd,
  })
  return (
    <div
      role="button"
      tabIndex={0}
      {...handlers}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`relative flex w-28 shrink-0 flex-col items-center justify-start gap-1 rounded-xl px-1 py-2.5 text-center transition-transform active:translate-y-0.5 ${featured ? 'featured-card-glow calendar-day-gold' : ''}`}
      style={{
        backgroundColor: featured ? undefined : 'var(--surface-cream)',
        border: '2px solid #000000',
        boxShadow: '0 12px 22px rgba(11,11,11,0.3), 0 5px 0 #000000',
        scrollSnapAlign: 'start',
        opacity: isDragging ? 0.35 : 1,
        touchAction: isDragging ? 'none' : undefined,
        cursor: 'grab',
      }}
    >
      {featured && <span className="shine-sweep" aria-hidden />}
      <SuperfoodImage food={food} className={`h-14 w-14 shrink-0 ${featured ? 'superfood-float' : ''}`} emojiSize="2.5em" />
      <span className="w-full truncate text-[12px] font-semibold" style={{ color: featured ? '#3a2a06' : 'var(--text-primary)' }}>
        {content.name}
      </span>
      <span
        className="flex min-h-[2.5em] w-full items-center justify-center text-[10px] font-bold leading-tight"
        style={{ color: featured ? '#3a2a06' : 'var(--accent-strong)' }}
      >
        {content.power}
      </span>
      <XpText xp={food.xp} />
    </div>
  )
}

function SuperfoodList({
  items,
  lang,
  featuredId,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  items: SuperfoodDef[]
  lang: Lang
  featuredId: string
  onSelect: (food: SuperfoodDef) => void
  onDragStart: (food: SuperfoodDef, x: number, y: number) => void
  onDragMove: (x: number, y: number) => void
  onDragEnd: (x: number, y: number) => void
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
    <div className="thin-scroll grid h-full auto-rows-min grid-cols-2 justify-items-center gap-x-1.5 gap-y-3 overflow-y-auto content-start pb-1 pt-3">
      {items.map((food) => (
        <SuperfoodRow
          key={food.id}
          food={food}
          lang={lang}
          featured={food.id === featuredId}
          onSelect={() => onSelect(food)}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
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

function JunkFoodRow({
  food,
  lang,
  featured,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  food: JunkFoodDef
  lang: Lang
  featured: boolean
  onSelect: () => void
  onDragStart: (food: JunkFoodDef, x: number, y: number) => void
  onDragMove: (x: number, y: number) => void
  onDragEnd: (x: number, y: number) => void
}) {
  const content = JUNK_FOOD_CONTENT[lang][food.id]
  const { isDragging, handlers } = useLongPressDrag({
    onTap: onSelect,
    onDragStart: (x, y) => onDragStart(food, x, y),
    onDragMove,
    onDragEnd,
  })
  return (
    <div
      role="button"
      tabIndex={0}
      {...handlers}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`relative flex w-28 shrink-0 flex-col items-center justify-start gap-1 rounded-xl px-1 py-2.5 text-center transition-transform active:translate-y-0.5 ${featured ? 'featured-card-glow calendar-day-gold' : ''}`}
      style={{
        backgroundColor: featured ? undefined : 'var(--surface-cream)',
        border: '2px solid #000000',
        boxShadow: '0 12px 22px rgba(11,11,11,0.3), 0 5px 0 #000000',
        scrollSnapAlign: 'start',
        opacity: isDragging ? 0.35 : 1,
        touchAction: isDragging ? 'none' : undefined,
        cursor: 'grab',
      }}
    >
      {featured && <span className="shine-sweep" aria-hidden />}
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center ${featured ? 'superfood-float' : ''}`} style={{ fontSize: '2.5em' }} aria-hidden>
        {food.emoji}
      </span>
      <span className="w-full truncate text-[12px] font-semibold" style={{ color: featured ? '#3a2a06' : 'var(--text-primary)' }}>
        {content.name}
      </span>
      <span
        className="flex min-h-[2.5em] w-full items-center justify-center text-[10px] font-bold leading-tight"
        style={{ color: featured ? '#3a2a06' : 'var(--status-critical)' }}
      >
        {content.power}
      </span>
      <XpText xp={food.xp} />
    </div>
  )
}

function JunkFoodList({
  items,
  lang,
  featuredId,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  items: JunkFoodDef[]
  lang: Lang
  featuredId: string
  onSelect: (food: JunkFoodDef) => void
  onDragStart: (food: JunkFoodDef, x: number, y: number) => void
  onDragMove: (x: number, y: number) => void
  onDragEnd: (x: number, y: number) => void
}) {
  return (
    <div className="thin-scroll grid h-full auto-rows-min grid-cols-2 justify-items-center gap-x-1.5 gap-y-3 overflow-y-auto content-start pb-1 pt-3">
      {items.map((food) => (
        <JunkFoodRow
          key={food.id}
          food={food}
          lang={lang}
          featured={food.id === featuredId}
          onSelect={() => onSelect(food)}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  )
}

function FocusSlot({
  food,
  lang,
  isJunk,
  removeLabel,
  onSelect,
  onRemove,
}: {
  food: SuperfoodDef | JunkFoodDef | null
  lang: Lang
  isJunk: boolean
  removeLabel: string
  onSelect: () => void
  onRemove: () => void
}) {
  if (!food) {
    return (
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)', border: '2px solid #000000', boxShadow: '0 4px 0 rgba(0,0,0,0.35)' }}
      >
        <StarIcon className="h-4 w-4" style={{ color: 'rgba(0,0,0,0.25)' } as React.CSSProperties} />
      </div>
    )
  }

  const name = isJunk ? JUNK_FOOD_CONTENT[lang][food.id].name : SUPERFOOD_CONTENT[lang][food.id].name

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className="relative flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1"
      style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 4px 0 #000000' }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={removeLabel}
        className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--status-critical)', color: '#ffffff', border: '1.5px solid #000000' }}
      >
        <CloseIcon className="h-2.5 w-2.5" />
      </button>
      {isJunk ? (
        <span style={{ fontSize: '1.4em' }} aria-hidden>
          {(food as JunkFoodDef).emoji}
        </span>
      ) : (
        <SuperfoodImage food={food as SuperfoodDef} className="h-7 w-7" emojiSize="1.4em" />
      )}
      <span className="w-full truncate text-[9px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {name}
      </span>
    </div>
  )
}

export function SuperfoodsPanel() {
  const { lang } = useLanguage()
  const [view, setView] = useState<'superfoods' | 'junkFoods'>('superfoods')
  const [selected, setSelected] = useState<SuperfoodDef | null>(null)
  const [selectedJunk, setSelectedJunk] = useState<JunkFoodDef | null>(null)
  const [focusedSuperfoodIds, setFocusedSuperfoodIds] = useState<string[]>(getFocusedSuperfoodIds)
  const [focusedJunkFoodIds, setFocusedJunkFoodIds] = useState<string[]>(getFocusedJunkFoodIds)
  const [dragPreview, setDragPreview] = useState<
    { kind: 'superfood'; food: SuperfoodDef; x: number; y: number } | { kind: 'junk'; food: JunkFoodDef; x: number; y: number } | null
  >(null)
  const focusZoneRef = useRef<HTMLDivElement>(null)
  const tabs = JUNK_FOODS_PANEL_CHROME[lang]

  const today = todayKey()
  const featuredSuperfoodId = useMemo(() => superfoodOfTheDay(today).id, [today])
  const featuredJunkFoodId = useMemo(() => junkFoodOfTheDay(today).id, [today])
  const orderedSuperfoods = useMemo(
    () => [SUPERFOODS.find((f) => f.id === featuredSuperfoodId)!, ...SUPERFOODS.filter((f) => f.id !== featuredSuperfoodId)],
    [featuredSuperfoodId]
  )
  const orderedJunkFoods = useMemo(
    () => [JUNK_FOODS.find((f) => f.id === featuredJunkFoodId)!, ...JUNK_FOODS.filter((f) => f.id !== featuredJunkFoodId)],
    [featuredJunkFoodId]
  )

  function handleToggleSuperfoodFocus(id: string) {
    setFocusedSuperfoodIds(toggleFocusedSuperfood(id))
  }
  function handleToggleJunkFoodFocus(id: string) {
    setFocusedJunkFoodIds(toggleFocusedJunkFood(id))
  }

  function isOverFocusZone(x: number, y: number) {
    const zone = focusZoneRef.current
    if (!zone) return false
    const rect = zone.getBoundingClientRect()
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  function handleDragMove(x: number, y: number) {
    setDragPreview((prev) => (prev ? { ...prev, x, y } : prev))
  }

  function handleSuperfoodDragEnd(x: number, y: number) {
    setDragPreview((prev) => {
      if (prev && prev.kind === 'superfood' && isOverFocusZone(x, y)) {
        setFocusedSuperfoodIds(addFocusedSuperfood(prev.food.id))
      }
      return null
    })
  }
  function handleJunkFoodDragEnd(x: number, y: number) {
    setDragPreview((prev) => {
      if (prev && prev.kind === 'junk' && isOverFocusZone(x, y)) {
        setFocusedJunkFoodIds(addFocusedJunkFood(prev.food.id))
      }
      return null
    })
  }

  const focusedIds = view === 'superfoods' ? focusedSuperfoodIds : focusedJunkFoodIds
  const focusSlots = Array.from({ length: MAX_FOCUS_ITEMS }, (_, i) => {
    const id = focusedIds[i]
    if (!id) return null
    return view === 'superfoods' ? (SUPERFOODS.find((f) => f.id === id) ?? null) : (JUNK_FOODS.find((f) => f.id === id) ?? null)
  })
  return (
    <div className="relative mx-auto flex h-full max-w-md flex-col gap-2 px-4 pt-5">
      <div
        className="mx-auto flex shrink-0 gap-1 rounded-full p-1"
        style={{ backgroundColor: 'var(--surface-1)', border: '2px solid #000000', boxShadow: '0 6px 14px rgba(11,11,11,0.2), 0 3px 0 #000000' }}
      >
        <button
          onClick={() => setView('superfoods')}
          className="rounded-full px-3 py-1 text-[11px] font-bold"
          style={{
            backgroundColor: view === 'superfoods' ? '#5fc9f3' : 'transparent',
            color: view === 'superfoods' ? '#1a1a19' : 'var(--text-secondary)',
          }}
        >
          {tabs.superfoodsTab}
        </button>
        <button
          onClick={() => setView('junkFoods')}
          className="rounded-full px-3 py-1 text-[11px] font-bold"
          style={{
            backgroundColor: view === 'junkFoods' ? 'var(--status-critical)' : 'transparent',
            color: view === 'junkFoods' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          {tabs.junkFoodTab}
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <div
          ref={focusZoneRef}
          className="flex justify-center gap-2 rounded-xl transition-shadow"
          style={dragPreview ? { boxShadow: '0 0 0 3px #eab308', borderRadius: '0.9rem' } : undefined}
        >
          {focusSlots.map((food, i) => (
            <FocusSlot
              key={i}
              food={food}
              lang={lang}
              isJunk={view === 'junkFoods'}
              removeLabel={tabs.removeAriaLabel}
              onSelect={() => {
                if (!food) return
                if (view === 'superfoods') setSelected(food as SuperfoodDef)
                else setSelectedJunk(food as JunkFoodDef)
              }}
              onRemove={() => {
                if (!food) return
                if (view === 'superfoods') handleToggleSuperfoodFocus(food.id)
                else handleToggleJunkFoodFocus(food.id)
              }}
            />
          ))}
        </div>
      </div>

      {view === 'superfoods' ? (
        <div className="flex min-h-0 flex-1 gap-2 overflow-hidden pt-1">
          <div className="min-w-0 flex-1 overflow-hidden">
            <SuperfoodList
              items={orderedSuperfoods}
              lang={lang}
              featuredId={featuredSuperfoodId}
              onSelect={setSelected}
              onDragStart={(food, x, y) => setDragPreview({ kind: 'superfood', food, x, y })}
              onDragMove={handleDragMove}
              onDragEnd={handleSuperfoodDragEnd}
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 gap-2 overflow-hidden pt-1">
          <div className="min-w-0 flex-1 overflow-hidden">
            <JunkFoodList
              items={orderedJunkFoods}
              lang={lang}
              featuredId={featuredJunkFoodId}
              onSelect={setSelectedJunk}
              onDragStart={(food, x, y) => setDragPreview({ kind: 'junk', food, x, y })}
              onDragMove={handleDragMove}
              onDragEnd={handleJunkFoodDragEnd}
            />
          </div>
        </div>
      )}

      {selected && <SuperfoodDetailModal food={selected} onClose={() => setSelected(null)} />}
      {selectedJunk && <JunkFoodDetailModal food={selectedJunk} onClose={() => setSelectedJunk(null)} />}

      {dragPreview &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[100] flex w-28 flex-col items-center justify-start gap-1 rounded-xl px-1 py-2.5 text-center"
            style={{
              left: dragPreview.x,
              top: dragPreview.y,
              transform: 'translate(-50%, -50%) scale(1.08)',
              backgroundColor: 'var(--surface-cream)',
              border: '2px solid #000000',
              boxShadow: '0 16px 28px rgba(11,11,11,0.35)',
            }}
          >
            {dragPreview.kind === 'superfood' ? (
              <SuperfoodImage food={dragPreview.food} className="h-14 w-14 shrink-0" emojiSize="2.5em" />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center" style={{ fontSize: '2.5em' }} aria-hidden>
                {dragPreview.food.emoji}
              </span>
            )}
            <span className="w-full truncate text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {dragPreview.kind === 'superfood'
                ? SUPERFOOD_CONTENT[lang][dragPreview.food.id].name
                : JUNK_FOOD_CONTENT[lang][dragPreview.food.id].name}
            </span>
          </div>,
          document.body
        )}
    </div>
  )
}

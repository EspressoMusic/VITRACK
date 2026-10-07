import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FOOD_GUARD_STRINGS } from '../../lib/i18n/foodGuards'
import type { FoodGuardDef } from '../data/foodGuards'
import { FOOD_GUARD_PORTRAIT_BOX, paintFoodGuardPortrait } from '../game/foodGuards'
import { INK_THIN, blitInked, renderInked } from '../game/ink'
import type { FoodGuardSpec } from '../systems/FoodGuardSystem'
import { CREAM, INK } from './kit'

const SHOW_MS = 5000

export type FoodGuardNote =
  /** New guards dropped in (the first one is pictured). */
  | { key: number; kind: 'arrived'; guard: FoodGuardSpec; count: number }
  /** The player tapped a guard. */
  | { key: number; kind: 'info'; guard: FoodGuardSpec }

/** A short note under the top bar about food guards; tapping it calls `onOpen` (e.g. to look at the guards), and it hides by itself. */
export function FoodGuardToast({ note, onOpen, onDone }: { note: FoodGuardNote; onOpen: () => void; onDone: () => void }) {
  const { lang } = useLanguage()
  const t = FOOD_GUARD_STRINGS[lang]
  const doneRef = useRef(onDone)
  useLayoutEffect(() => {
    doneRef.current = onDone
  })

  useEffect(() => {
    const timer = setTimeout(() => doneRef.current(), SHOW_MS)
    return () => clearTimeout(timer)
  }, [note.key])

  const { def, food, servings } = note.guard
  const title = note.kind === 'arrived' && note.count > 1 ? t.arrivedMany(note.count) : note.kind === 'arrived' ? t.arrived(def.name[lang], def.icon) : `${def.name[lang]} ${def.icon}`
  return (
    <div className="pointer-events-none absolute inset-x-3 z-30 flex justify-center" style={{ top: '3.9rem' }}>
      <button
        key={note.key}
        type="button"
        onClick={onOpen}
        className="farm-pop pointer-events-auto flex max-w-full items-center gap-1.5 rounded-2xl py-1 pe-3 ps-1 active:translate-y-0.5"
        style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 3px 0 ${INK}`, color: '#3a2a06' }}
      >
        <span className="shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: '#cfe9a8', border: `1.5px solid ${INK}` }}>
          <FoodGuardPortrait def={def} size={40} />
        </span>
        <span className="min-w-0 text-start leading-tight">
          <span className="block text-[0.72rem] font-extrabold">{title}</span>
          {note.kind === 'info' && (
            <>
              <span className="block text-[0.62rem] font-bold">
                {t.power} {'⭐'.repeat(def.tier)}
              </span>
              <span className="block break-words text-[0.62rem] font-bold">{t.ateIt(food)}</span>
              {servings > 1 && <span className="block text-[0.62rem] font-bold">{t.servings(servings)}</span>}
              {def.tier < 3 && <span className="block text-[0.62rem] font-bold">{t.healthierHint}</span>}
            </>
          )}
          <span className="block text-[0.62rem] font-bold" style={{ color: '#52514e' }}>
            {t.stays}
          </span>
        </span>
      </button>
    </div>
  )
}

function FoodGuardPortrait({ def, size }: { def: FoodGuardDef; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const box = FOOD_GUARD_PORTRAIT_BOX
    const scale = size / (Math.max(box.w, box.h) + 2)
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (size / 2 - (box.x + box.w / 2) * scale), dpr * (size / 2 - (box.y + box.h / 2) * scale + 2))
    blitInked(ctx, renderInked(document.createElement('canvas'), dpr * scale, box, (c) => paintFoodGuardPortrait(c, def), INK_THIN))
  }, [def, size])

  return <canvas ref={ref} style={{ width: size, height: size }} className="block" aria-hidden />
}

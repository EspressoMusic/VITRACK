import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { playConfirmSound, playTapSound } from '../../lib/sound'
import { ITEMS_BY_ID } from '../data/items'
import { onFx } from '../store/gameStore'
import type { FarmError, Point } from '../types'
import { fxTargets, type FxTarget } from './fxTargets'
import { CoinIcon, INK } from './kit'

const OUTLINE_SHADOW = [
  [0, 2],
  [2, 0],
  [-2, 0],
  [0, -2],
  [1.5, 1.5],
  [-1.5, 1.5],
  [1.5, -1.5],
  [-1.5, -1.5],
  [0, 3],
]
  .map(([x, y]) => `${x}px ${y}px 0 ${INK}`)
  .join(', ')

interface FloatText {
  id: number
  text: string
  coin: boolean
  at: Point
  color: string
  delay: number
}

interface Flyer {
  id: number
  /** Emoji, or 'coin' for the drawn coin. */
  icon: string
  from: Point
  target: FxTarget
  delay: number
}

let nextId = 1

/** Floating "+1 Wheat / +1 XP" labels, rewards flying to the HUD, and error toasts.
 *  `quietBackground`: skip the show (and sound) for coins the world earns on its own — e.g. while inside the house. */
export function FxLayer({ quietBackground = false }: { quietBackground?: boolean }) {
  const { lang } = useLanguage()
  const rootRef = useRef<HTMLDivElement>(null)
  const [floats, setFloats] = useState<FloatText[]>([])
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [toast, setToast] = useState<{ id: number; error: FarmError } | null>(null)
  const langRef = useRef(lang)
  const quietRef = useRef(quietBackground)

  useLayoutEffect(() => {
    langRef.current = lang
    quietRef.current = quietBackground
  })

  useEffect(() => {
    let burstIndex = 0
    let burstTimer: ReturnType<typeof setTimeout> | undefined
    let toastTimer: ReturnType<typeof setTimeout> | undefined

    const off = onFx((e) => {
      if (e.type === 'error') {
        setToast({ id: nextId++, error: e.error })
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => setToast(null), 2200)
        return
      }
      if (e.type !== 'gain' || (e.background && quietRef.current)) return
      const root = rootRef.current?.getBoundingClientRect()
      if (!root) return
      const at = e.at ? { x: e.at.x - root.left, y: e.at.y - root.top } : { x: root.width / 2, y: root.height / 2 }
      // Gains from one action arrive back to back — stack their labels instead of overlapping.
      const index = burstIndex++
      clearTimeout(burstTimer)
      burstTimer = setTimeout(() => (burstIndex = 0), 50)
      const g = e.gain
      const label =
        g.kind === 'item'
          ? `+${g.amount} ${ITEMS_BY_ID[g.item]?.name[langRef.current] ?? ''}`
          : g.kind === 'coins'
            ? `+${g.amount}`
            : `+${g.amount} XP`
      const color = g.kind === 'xp' ? '#8ee0ff' : g.kind === 'coins' ? '#ffd84a' : '#fffbea'
      const float: FloatText = { id: nextId++, text: label, coin: g.kind === 'coins', at: { x: at.x, y: at.y - index * 22 }, color, delay: index * 0.08 }
      setFloats((list) => [...list, float])
      setTimeout(() => setFloats((list) => list.filter((f) => f.id !== float.id)), 1300)

      const icon = g.kind === 'item' ? (ITEMS_BY_ID[g.item]?.icon ?? '📦') : g.kind === 'coins' ? 'coin' : '⭐'
      const target: FxTarget = g.kind === 'item' ? 'barn' : g.kind === 'coins' ? 'coins' : 'xp'
      const pieces = g.kind === 'coins' ? Math.min(5, Math.max(1, Math.ceil(g.amount / 20))) : 1
      setFlyers((list) => [
        ...list,
        ...Array.from({ length: pieces }, (_, i) => ({ id: nextId++, icon, from: at, target, delay: 120 + index * 80 + i * 70 })),
      ])
      if (g.kind === 'coins') playConfirmSound()
      else if (index === 0) playTapSound()
    })
    return () => {
      off()
      clearTimeout(burstTimer)
      clearTimeout(toastTimer)
    }
  }, [])

  const t = FARM_STRINGS[lang]

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-[46] overflow-hidden">
      {floats.map((f) => (
        <span
          key={f.id}
          dir="ltr"
          className="farm-float absolute flex items-center gap-0.5 whitespace-nowrap text-base font-black"
          style={{ left: f.at.x, top: f.at.y, color: f.color, animationDelay: `${f.delay}s`, textShadow: OUTLINE_SHADOW, unicodeBidi: 'isolate' }}
        >
          <span>{f.text}</span>
          {f.coin && <CoinIcon className="h-4 w-4" />}
        </span>
      ))}
      {flyers.map((f) => (
        <FlyingIcon key={f.id} flyer={f} rootRef={rootRef} onDone={() => setFlyers((list) => list.filter((x) => x.id !== f.id))} />
      ))}
      {toast && (
        <div key={toast.id} className="farm-toast absolute inset-x-0 top-16 flex justify-center px-6">
          <span
            className="rounded-full px-3 py-1.5 text-center text-xs font-extrabold"
            style={{ backgroundColor: '#fff1ec', color: '#7a1d12', border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}` }}
          >
            {t.errors[toast.error]}
          </span>
        </div>
      )}
    </div>
  )
}

function FlyingIcon({ flyer, rootRef, onDone }: { flyer: Flyer; rootRef: React.RefObject<HTMLDivElement | null>; onDone: () => void }) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const root = rootRef.current?.getBoundingClientRect()
    const targetEl = fxTargets[flyer.target]
    if (!el || !root || !targetEl) return onDone()
    const tr = targetEl.getBoundingClientRect()
    const to = { x: tr.left + tr.width / 2 - root.left, y: tr.top + tr.height / 2 - root.top }
    const dx = to.x - flyer.from.x
    const dy = to.y - flyer.from.y
    const anim = el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 0 },
        { transform: 'translate(-50%, -50%) translate(0px, -26px) scale(1.25)', opacity: 1, offset: 0.25 },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 1 },
      ],
      { duration: 700, delay: flyer.delay, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'both' },
    )
    anim.onfinish = () => {
      targetEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 220 })
      onDone()
    }
    return () => anim.cancel()
    // Runs once per flyer; onDone identity changes every render but the flyer doesn't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyer])

  return (
    <span ref={ref} className="absolute text-xl leading-none" style={{ left: flyer.from.x, top: flyer.from.y, opacity: 0 }}>
      {flyer.icon === 'coin' ? <CoinIcon className="h-6 w-6" /> : flyer.icon}
    </span>
  )
}

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { GERMS, GERMS_BY_ID, germStatKey } from '../data/germs'
import { germPortraitBox, paintGermPortrait } from '../game/germs'
import { INK_THIN, blitInked, renderInked } from '../game/ink'
import { useGame } from '../store/gameStore'
import { INK, ProgressBar, Sheet } from './kit'

/** Highest value of each stat across all germs, so the bars compare germs with each other. */
const MAX = {
  hp: Math.max(...GERMS.map((g) => g.hp)),
  attack: Math.max(...GERMS.map((g) => g.attack)),
  speed: Math.max(...GERMS.map((g) => g.speed)),
}

/** Every germ type: its power, what causes it in real life and what beats it. Fits the screen without scrolling. */
export function GermLibrarySheet({ initialId, onClose }: { initialId?: string | null; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const [id, setId] = useState(initialId && GERMS_BY_ID[initialId] ? initialId : GERMS[0].id)
  const stopped = useGame((s) => s.stats[germStatKey(id)] ?? 0)
  const level = useGame((s) => s.player.level)
  const def = GERMS_BY_ID[id]

  return (
    <Sheet title={`${t.germLibraryTitle} 🦠`} onClose={onClose} closeLabel={t.close}>
      <div className="flex flex-col gap-1.5 rounded-xl p-2" style={{ backgroundColor: '#fffaf0', border: `2px solid ${INK}` }}>
        <div className="flex items-start gap-2">
          <div
            className="shrink-0 overflow-hidden rounded-xl"
            style={{ background: 'radial-gradient(circle at 50% 75%, #d5ecb0 0%, #9cc874 70%)', border: `2px solid ${INK}` }}
          >
            <GermPortrait germId={id} size={84} animate />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-base font-black leading-tight" style={{ color: '#3a2a06' }}>
              {def.name[lang]}
            </h3>
            <span
              className="self-start rounded-full px-2 py-0.5 text-[0.62rem] font-extrabold leading-tight"
              style={{ backgroundColor: def.color, border: `1.5px solid ${INK}`, color: '#2b1d0e' }}
            >
              {t.germPower}: {def.powerName[lang]}
            </span>
            <p className="text-[0.62rem] font-bold leading-snug" style={{ color: '#52514e' }}>
              {def.powerInfo[lang]}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <Stat label={t.germHealth} fraction={def.hp / MAX.hp} color="#f0645a" />
              <Stat label={t.germBite} fraction={def.attack / MAX.attack} color="#ffb03a" />
              <Stat label={t.germSpeed} fraction={def.speed / MAX.speed} color="#5bc0eb" />
            </div>
          </div>
        </div>
        <InfoBox title={t.germCause} bg="#ffe9e4" accent="#b3261e">
          {def.cause[lang]}
        </InfoBox>
        <InfoBox title={t.germCure} bg="#e6f6dc" accent="#2e7d32">
          {def.cure[lang]}
          <span className="ms-1 whitespace-nowrap text-sm leading-none">{def.cureIcons.join(' ')}</span>
        </InfoBox>
        <p className="text-center text-[0.62rem] font-extrabold" style={{ color: level < def.minLevel ? '#b3261e' : '#52514e' }}>
          {level < def.minLevel ? t.germFromLevel(def.minLevel) : t.germStoppedCount(stopped)}
        </p>
      </div>

      <div className="grid grid-cols-9 gap-[3px] pb-0.5">
        {GERMS.map((g) => {
          const active = g.id === id
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setId(g.id)}
              aria-pressed={active}
              aria-label={g.name[lang]}
              className="flex aspect-square min-w-0 items-center justify-center rounded-lg transition active:translate-y-0.5"
              style={{
                backgroundColor: active ? '#ffcf4a' : '#fffaf0',
                border: `2px solid ${INK}`,
                boxShadow: active ? 'none' : `0 2px 0 ${INK}`,
                transform: active ? 'translateY(2px)' : undefined,
              }}
            >
              <GermPortrait germId={g.id} size={28} />
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}

function Stat({ label, fraction, color }: { label: string; fraction: number; color: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[0.55rem] font-extrabold leading-none" style={{ color: '#52514e' }}>
        {label}
      </span>
      <ProgressBar fraction={fraction} color={color} height={6} />
    </div>
  )
}

function InfoBox({ title, bg, accent, children }: { title: string; bg: string; accent: string; children: ReactNode }) {
  return (
    <p className="rounded-lg px-2 py-1 text-[0.66rem] font-bold leading-snug" style={{ backgroundColor: bg, border: `1.5px solid ${INK}`, color: '#3a2a06' }}>
      <span className="font-black" style={{ color: accent }}>
        {title}
      </span>{' '}
      {children}
    </p>
  )
}

/** The germ's in-game art with the same ink outline; `animate` keeps it bobbing. */
export function GermPortrait({ germId, size, animate = false }: { germId: string; size: number; animate?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    const def = GERMS_BY_ID[germId]
    if (!canvas || !ctx || !def) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const box = germPortraitBox(def)
    const scale = size / (Math.max(box.w, box.h) + 4)
    const scratch = document.createElement('canvas')
    const paint = (time: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (size / 2 - (box.x + box.w / 2) * scale), dpr * (size / 2 - (box.y + box.h / 2) * scale))
      blitInked(ctx, renderInked(scratch, dpr * scale, box, (c) => paintGermPortrait(c, germId, time), INK_THIN))
    }
    if (!animate) {
      paint(0.4)
      return
    }
    let raf = 0
    const loop = (now: number) => {
      paint(now / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [germId, size, animate])

  return <canvas ref={ref} style={{ width: size, height: size }} className="block shrink-0" aria-hidden />
}

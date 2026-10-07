import { useEffect, useState } from 'react'
import { useGame } from '../farm/store/gameStore'
import { xpToNextLevel } from '../farm/data/levels'

const LIQUID_GRADIENT = 'linear-gradient(90deg, #b8ecff 0%, #5bc0eb 60%, #2f9bd0 100%)'
const LIQUID_EDGE = '#2f9bd0'
const BADGE_SIZE = 42

/** Thick pill at the top of the home stage showing the player's level (badge on the reading-start
 *  edge) and how far they are into it — the XP fills in as a liquid with a wavy, sloshing edge. */
export function XpLevelBar({
  ariaLabel,
  dir,
}: {
  ariaLabel: (level: number, xp: number, needed: number) => string
  dir: 'ltr' | 'rtl'
}) {
  const level = useGame((s) => s.player.level)
  const xp = useGame((s) => s.player.xp)
  const needed = xpToNextLevel(level)
  const target = needed > 0 ? Math.max(0, Math.min(100, (xp / needed) * 100)) : 0
  const [fill, setFill] = useState(0)
  const lightFill = fill < 50

  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(target))
    return () => cancelAnimationFrame(id)
  }, [target])

  return (
    <div className="relative mt-5 flex w-[58%] shrink-0 items-center self-center" role="img" aria-label={ariaLabel(level, xp, needed)}>
      <div
        className="relative flex h-10 w-full items-center justify-center overflow-hidden rounded-full ps-5"
        style={{
          border: '3px solid #000000',
          backgroundColor: 'var(--surface-cream)',
          boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.08), 0 3px 0 #000000, 0 7px 12px rgba(0,0,0,0.2)',
        }}
      >
        {/* Drawn left-to-right and mirrored for RTL so the liquid always pours in from the reading start. */}
        <div className="absolute inset-0" style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : undefined }} aria-hidden>
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-[1100ms] ease-out"
            style={{ width: `${fill}%`, background: LIQUID_GRADIENT }}
          >
            {fill > 0 && (
              <>
                <div className="absolute inset-y-0 right-0 overflow-hidden" style={{ transform: 'translateX(50%)' }}>
                  <svg viewBox="0 0 20 400" preserveAspectRatio="none" className="liquid-wave-svg-v block h-[200%] w-4">
                    <path d="M10 0 C 20 50, 0 150, 10 200 C 20 250, 0 350, 10 400 L0 400 L0 0 Z" fill={LIQUID_EDGE} />
                  </svg>
                </div>
                <div className="liquid-wave-layer-v2 absolute inset-y-0 right-0 overflow-hidden" style={{ transform: 'translateX(25%)' }}>
                  <svg viewBox="0 0 20 400" preserveAspectRatio="none" className="liquid-wave-svg-v block h-[200%] w-3">
                    <path d="M8 0 C 18 60, -2 140, 8 200 C 18 260, -2 340, 8 400 L0 400 L0 0 Z" fill="rgba(255,255,255,0.35)" />
                  </svg>
                </div>
              </>
            )}
            <div
              className="absolute inset-x-2 top-1 h-1.5 rounded-full"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)' }}
            />
          </div>
        </div>

        <span
          className="relative z-10 text-sm font-bold tabular-nums"
          dir="ltr"
          style={{
            color: lightFill ? 'var(--text-primary)' : 'white',
            textShadow: lightFill ? 'none' : '0 1px 3px rgba(0,0,0,0.35)',
          }}
          aria-hidden
        >
          {xp}/{needed}
        </span>
      </div>

      {/* Sits half over the pill's start edge, outside its overflow clip. */}
      <div
        className="absolute start-0 top-1/2 z-10 flex flex-col items-center justify-center rounded-full"
        style={{
          transform: `translate(${dir === 'rtl' ? '50%' : '-50%'}, -50%)`,
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          backgroundColor: '#ffcf4a',
          border: '3px solid #000000',
          boxShadow: '0 3px 0 #000000',
          color: '#3a2a06',
        }}
        aria-hidden
      >
        <span className="text-base font-extrabold leading-none tabular-nums">{level}</span>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

const LIQUID_GRADIENT = 'linear-gradient(90deg, #ffd27a 0%, #f5a83a 60%, #e8863a 100%)'
const LIQUID_EDGE = '#e8863a'
const OVER_GRADIENT = 'linear-gradient(90deg, #f28b8b 0%, #e25555 60%, #d03b3b 100%)'
const OVER_EDGE = '#d03b3b'

/** Thick pill at the top of the home stage that fills with a liquid (wavy, sloshing leading edge)
 *  as the day's calories approach the goal, with a "Calories <consumed>" label sitting inside it.
 *  Turns red once the goal is passed. */
export function CalorieFillBar({ calories, goal, title, dir }: { calories: number; goal: number; title: string; dir: 'ltr' | 'rtl' }) {
  const target = goal > 0 ? Math.max(0, Math.min(100, (calories / goal) * 100)) : 0
  const over = goal > 0 && calories > goal
  const [fill, setFill] = useState(0)
  const lightFill = fill < 50

  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(target))
    return () => cancelAnimationFrame(id)
  }, [target])

  return (
    <div
      className="relative mt-8 flex h-9 w-[75%] shrink-0 items-center justify-center self-center overflow-hidden rounded-full"
      style={{
        border: '3px solid #000000',
        backgroundColor: 'var(--surface-cream)',
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.08), 0 4px 0 #000000, 0 10px 18px rgba(0,0,0,0.2)',
      }}
    >
      {/* Drawn left-to-right and mirrored for RTL so the liquid always pours in from the reading start. */}
      <div className="absolute inset-0" style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : undefined }} aria-hidden>
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-[1100ms] ease-out"
          style={{ width: `${fill}%`, background: over ? OVER_GRADIENT : LIQUID_GRADIENT }}
        >
          {fill > 0 && (
            <>
              <div className="absolute inset-y-0 right-0 overflow-hidden" style={{ transform: 'translateX(50%)' }}>
                <svg viewBox="0 0 20 400" preserveAspectRatio="none" className="liquid-wave-svg-v block h-[200%] w-4">
                  <path d="M10 0 C 20 50, 0 150, 10 200 C 20 250, 0 350, 10 400 L0 400 L0 0 Z" fill={over ? OVER_EDGE : LIQUID_EDGE} />
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
        className="relative z-10 text-sm font-bold"
        style={{
          color: lightFill ? 'var(--text-primary)' : 'white',
          textShadow: lightFill ? 'none' : '0 1px 3px rgba(0,0,0,0.35)',
        }}
      >
        {Math.round(calories) > 0 ? `${title} ${Math.round(calories).toLocaleString()}` : title}
      </span>
    </div>
  )
}

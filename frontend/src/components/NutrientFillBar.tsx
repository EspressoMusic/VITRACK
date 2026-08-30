import { useEffect, useState } from 'react'

export function NutrientFillBar({ percent, startDelayMs = 0 }: { percent: number; startDelayMs?: number }) {
  const target = Math.max(0, Math.min(100, Math.round(percent)))
  const [fill, setFill] = useState(0)
  const lightFill = fill < 50

  useEffect(() => {
    const timer = setTimeout(() => setFill(target), startDelayMs)
    return () => clearTimeout(timer)
  }, [target, startDelayMs])

  return (
    <div
      className="relative mx-auto flex h-11 w-[88%] shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        border: '3px solid #000000',
        backgroundColor: 'rgba(255,255,255,0.18)',
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.12)',
      }}
    >
      <div
        className="absolute inset-y-0 end-0 transition-[width] duration-[1100ms] ease-out"
        style={{
          width: `${fill}%`,
          background: 'linear-gradient(90deg, #a3e8fb 0%, #5fc9f3 55%, #0ea5e9 100%)',
        }}
      >
        <div className="liquid-wave-layer-v absolute inset-y-0 start-0" aria-hidden>
          <svg viewBox="0 0 20 400" preserveAspectRatio="none" className="liquid-wave-svg-v block h-[200%] w-4">
            <path
              d="M10 0 C 20 50, 0 150, 10 200 C 20 250, 0 350, 10 400 L20 400 L20 0 Z"
              fill="rgba(255,255,255,0.55)"
            />
          </svg>
        </div>
        <div className="liquid-wave-layer-v liquid-wave-layer-v2 absolute inset-y-0 start-0" aria-hidden>
          <svg viewBox="0 0 20 400" preserveAspectRatio="none" className="liquid-wave-svg-v block h-[200%] w-3">
            <path
              d="M12 0 C 2 60, 22 140, 12 200 C 2 260, 22 340, 12 400 L20 400 L20 0 Z"
              fill="rgba(255,255,255,0.3)"
            />
          </svg>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -start-1 top-0.5 h-10 w-5 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.85), transparent 70%)',
          transform: 'rotate(15deg)',
        }}
      />

      <span
        className="relative z-10 text-sm font-bold"
        style={{
          color: lightFill ? 'var(--text-primary)' : 'white',
          textShadow: lightFill ? 'none' : '0 1px 3px rgba(0,0,0,0.35)',
        }}
      >
        {fill}%
      </span>
    </div>
  )
}

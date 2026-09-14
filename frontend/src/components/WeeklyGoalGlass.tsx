import { useId } from 'react'

export function WeeklyGoalGlass({
  percent,
  onClick,
  size = 96,
}: {
  percent: number
  onClick?: () => void
  /** Diameter in px. Defaults to the original h-24/w-24 (96px) size. */
  size?: number
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  const lightFill = clamped < 45
  const Container = onClick ? 'button' : 'div'
  const scale = size / 96
  const gradId = useId()

  return (
    <Container
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="relative mx-auto flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        border: '3px solid #000000',
        backgroundColor: 'rgba(255,255,255,0.18)',
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.12)',
      }}
    >
      {/* Water level as a real wavy-top fill (not a flat block with a decal on it): the whole
       *  body is drawn by two scrolling sine paths, so the surface actually ripples. */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a3e8fb" />
            <stop offset="45%" stopColor="#5fc9f3" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <g style={{ transform: `translateY(${100 - clamped}px)`, transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1)' }}>
          <g transform="translate(-13, 2)">
            <g className="liquid-wave-drift-back">
              <path
                d="M-50,0 Q-37.5,5 -25,0 T0,0 T25,0 T50,0 T75,0 T100,0 T125,0 T150,0 L150,120 L-50,120 Z"
                fill={`url(#${gradId})`}
                opacity={0.5}
              />
            </g>
          </g>
          <g className="liquid-wave-drift-front">
            <path
              d="M-50,0 Q-37.5,4 -25,0 T0,0 T25,0 T50,0 T75,0 T100,0 T125,0 T150,0 L150,120 L-50,120 Z"
              fill={`url(#${gradId})`}
            />
            <path
              d="M-50,0 Q-37.5,4 -25,0 T0,0 T25,0 T50,0 T75,0 T100,0 T125,0 T150,0"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={1.6}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </g>
      </svg>

      {/* soft ambient highlight, like light diffusing across curved glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          insetInlineStart: -4 * scale,
          top: 2 * scale,
          height: 58 * scale,
          width: 46 * scale,
          background: 'radial-gradient(ellipse at 42% 32%, rgba(255,255,255,0.85), rgba(255,255,255,0.22) 55%, transparent 78%)',
          transform: 'rotate(-10deg)',
          filter: `blur(${1.5 * scale}px)`,
        }}
      />
      {/* sharp specular hotspot, the direct reflection of a light source */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          insetInlineStart: 15 * scale,
          top: 11 * scale,
          height: 11 * scale,
          width: 11 * scale,
          background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)',
        }}
      />
      {/* periodic glint sweeping across the glass for a living, realistic feel */}
      <div aria-hidden className="orb-glint pointer-events-none absolute inset-0" />

      <span
        className="relative z-10 font-bold"
        style={{
          fontSize: 18 * scale,
          color: lightFill ? 'var(--text-primary)' : 'white',
          textShadow: lightFill ? 'none' : '0 1px 3px rgba(0,0,0,0.35)',
        }}
      >
        {clamped}%
      </span>
    </Container>
  )
}

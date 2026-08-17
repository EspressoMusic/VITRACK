export function WeeklyGoalGlass({ percent, onClick }: { percent: number; onClick?: () => void }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const lightFill = clamped < 45
  const Container = onClick ? 'button' : 'div'

  return (
    <Container
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        border: '5px solid #000000',
        backgroundColor: 'rgba(255,255,255,0.18)',
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.12)',
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out"
        style={{
          height: `${clamped}%`,
          background: 'linear-gradient(180deg, #a3e8fb 0%, #5fc9f3 45%, #0ea5e9 100%)',
        }}
      >
        <div className="liquid-wave-layer absolute inset-x-0 top-0" aria-hidden>
          <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="liquid-wave-svg block h-4 w-[200%]">
            <path
              d="M0 10 C 50 20, 150 0, 200 10 C 250 20, 350 0, 400 10 L400 20 L0 20 Z"
              fill="rgba(255,255,255,0.55)"
            />
          </svg>
        </div>
        <div className="liquid-wave-layer liquid-wave-layer-2 absolute inset-x-0 top-0" aria-hidden>
          <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="liquid-wave-svg block h-3 w-[200%]">
            <path
              d="M0 12 C 60 2, 140 22, 200 12 C 260 2, 340 22, 400 12 L400 20 L0 20 Z"
              fill="rgba(255,255,255,0.3)"
            />
          </svg>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -left-3 top-6 h-24 w-12 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.85), transparent 70%)',
          transform: 'rotate(15deg)',
        }}
      />

      <span
        className="relative z-10 text-2xl font-bold"
        style={{
          color: lightFill ? 'var(--text-primary)' : 'white',
          textShadow: lightFill ? 'none' : '0 1px 3px rgba(0,0,0,0.35)',
        }}
      >
        {clamped}%
      </span>
    </Container>
  )
}

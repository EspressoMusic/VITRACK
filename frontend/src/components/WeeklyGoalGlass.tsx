export function WeeklyGoalGlass({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const lightFill = clamped < 45

  return (
    <div
      className="relative mx-auto flex h-56 w-56 shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        border: '5px solid rgba(255,255,255,0.75)',
        backgroundColor: 'rgba(255,255,255,0.18)',
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.12)',
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out"
        style={{
          height: `${clamped}%`,
          background: 'linear-gradient(180deg, #ffe07a 0%, #eec978 45%, #d9a441 100%)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.65), transparent 70%)' }}
        />
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
        className="relative z-10 text-4xl font-bold"
        style={{
          color: lightFill ? 'var(--text-primary)' : 'white',
          textShadow: lightFill ? 'none' : '0 1px 3px rgba(0,0,0,0.35)',
        }}
      >
        {clamped}%
      </span>
    </div>
  )
}

export type Tab = 'camera' | 'calendar' | 'insights'

export function NavBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const cameraActive = active === 'camera'

  return (
    <nav
      className="sticky bottom-0 flex shrink-0 justify-center"
      style={{ backgroundColor: '#eec978', borderTop: '4px solid #d9a441' }}
    >
      <div className="relative grid w-full max-w-md grid-cols-3 items-center">
        <button
          onClick={() => onChange('calendar')}
          className="flex flex-col items-center justify-center py-1.5 transition"
          aria-label="Calendar"
          aria-current={active === 'calendar' ? 'page' : undefined}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full transition"
            style={{
              backgroundColor: active === 'calendar' ? 'var(--accent)' : '#eec978',
              color: active === 'calendar' ? 'white' : 'var(--text-primary)',
            }}
          >
            <img
              src="/icons/calendar.png"
              alt=""
              className="h-9 w-9 object-contain transition-transform"
              style={{ transform: active === 'calendar' ? 'scale(1.15)' : 'scale(1)' }}
            />
          </span>
        </button>

        <div className="relative flex items-center justify-center py-1">
          <button
            onClick={() => onChange('camera')}
            className="absolute flex h-12 w-12 items-center justify-center rounded-full transition"
            style={{
              top: '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: cameraActive ? 'var(--accent)' : '#eec978',
              color: cameraActive ? 'white' : 'var(--text-primary)',
              border: '4px solid #d9a441',
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            }}
            aria-current={cameraActive ? 'page' : undefined}
            aria-label="Camera"
          >
            <img
              src="/icons/camera.png"
              alt=""
              className="h-11 w-11 object-contain transition-transform"
              style={{ transform: cameraActive ? 'scale(1.15)' : 'scale(1)' }}
            />
          </button>
        </div>

        <button
          onClick={() => onChange('insights')}
          className="flex flex-col items-center justify-center py-1.5 transition"
          aria-label="Insights"
          aria-current={active === 'insights' ? 'page' : undefined}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full transition"
            style={{
              backgroundColor: active === 'insights' ? 'var(--accent)' : '#eec978',
              color: active === 'insights' ? 'white' : 'var(--text-primary)',
            }}
          >
            <img
              src="/icons/avocado.png"
              alt=""
              className="h-9 w-9 object-contain transition-transform"
              style={{ transform: active === 'insights' ? 'scale(1.15)' : 'scale(1)' }}
            />
          </span>
        </button>
      </div>
    </nav>
  )
}

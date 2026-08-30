import { useLanguage } from '../contexts/LanguageContext'
import { NAV_BAR_STRINGS } from '../lib/i18n/navBar'

export type Tab = 'camera' | 'calendar' | 'insights' | 'superfoods'

export function NavBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { lang } = useLanguage()
  const t = NAV_BAR_STRINGS[lang]
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
          aria-label={t.calendar}
          aria-current={active === 'calendar' ? 'page' : undefined}
        >
          <span
            className="nav-tab-transition flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: active === 'calendar' ? 'var(--accent)' : '#eec978',
              color: active === 'calendar' ? 'white' : 'var(--text-primary)',
            }}
          >
            <img
              src="/icons/calendar.png"
              alt=""
              className="nav-tab-transition h-[42px] w-[42px] object-contain drop-shadow-[0_3px_4px_rgba(0,0,0,0.3)]"
              style={{ transform: active === 'calendar' ? 'scale(1.15)' : 'scale(1)' }}
            />
          </span>
        </button>

        <div />

        <button
          onClick={() => onChange('insights')}
          className="flex flex-col items-center justify-center py-1.5 transition"
          aria-label={t.insights}
          aria-current={active === 'insights' ? 'page' : undefined}
        >
          <span
            className="nav-tab-transition flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: active === 'insights' ? 'var(--accent)' : '#eec978',
              color: active === 'insights' ? 'white' : 'var(--text-primary)',
            }}
          >
            <img
              src="/icons/heart.png"
              alt=""
              className="nav-tab-transition h-[34px] w-[34px] object-contain drop-shadow-[0_3px_4px_rgba(0,0,0,0.3)]"
              style={{ transform: active === 'insights' ? 'scale(1.15)' : 'scale(1)' }}
            />
          </span>
        </button>

        <button
          onClick={() => onChange('camera')}
          className="nav-tab-transition absolute flex h-[96px] w-[96px] items-center justify-center rounded-full"
          style={{
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: cameraActive ? 'var(--accent)' : '#eec978',
            color: cameraActive ? 'white' : 'var(--text-primary)',
            border: '3px solid #d9a441',
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
          }}
          aria-current={cameraActive ? 'page' : undefined}
          aria-label={t.camera}
        >
          <img
            src="/icons/camera.png"
            alt=""
            className="nav-tab-transition h-[78px] w-[78px] object-contain drop-shadow-[0_3px_4px_rgba(0,0,0,0.3)]"
            style={{ transform: cameraActive ? 'scale(1.15)' : 'scale(1)' }}
          />
        </button>
      </div>
    </nav>
  )
}

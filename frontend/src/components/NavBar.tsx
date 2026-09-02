import type { ReactNode } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { NAV_BAR_STRINGS } from '../lib/i18n/navBar'
import { AppleIcon, CalendarIcon, CameraIcon, GearIcon, HeartIcon } from './icons'

export type Tab = 'camera' | 'calendar' | 'insights' | 'superfoods'

function NavIcon({
  active,
  onClick,
  ariaLabel,
  icon,
}: {
  active: boolean
  onClick: () => void
  ariaLabel: string
  icon: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center py-1.5 transition"
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className="nav-tab-transition flex h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: active ? '#6b4423' : '#eec978',
          color: active ? '#2b1810' : 'var(--accent-strong)',
        }}
      >
        <span
          className="nav-tab-transition flex h-6 w-6 items-center justify-center"
          style={{ transform: active ? 'scale(1.15)' : 'scale(1)' }}
        >
          {icon}
        </span>
      </span>
    </button>
  )
}

export function NavBar({
  active,
  onChange,
  onOpenSettings,
  settingsActive = false,
}: {
  active: Tab
  onChange: (tab: Tab) => void
  onOpenSettings: () => void
  settingsActive?: boolean
}) {
  const { lang } = useLanguage()
  const t = NAV_BAR_STRINGS[lang]
  const cameraActive = !settingsActive && active === 'camera'

  return (
    <nav
      className="sticky bottom-0 flex shrink-0 justify-center"
      style={{ backgroundColor: '#eec978', borderTop: '4px solid #d9a441' }}
    >
      <div className="relative grid w-full max-w-md grid-cols-5 items-center">
        <NavIcon
          active={!settingsActive && active === 'calendar'}
          onClick={() => onChange('calendar')}
          ariaLabel={t.calendar}
          icon={<CalendarIcon className="h-full w-full" strokeWidth={1.7} />}
        />
        <NavIcon
          active={!settingsActive && active === 'insights'}
          onClick={() => onChange('insights')}
          ariaLabel={t.insights}
          icon={<HeartIcon className="h-full w-full" strokeWidth={1.7} />}
        />

        <div />

        <NavIcon
          active={!settingsActive && active === 'superfoods'}
          onClick={() => onChange('superfoods')}
          ariaLabel={t.superfoods}
          icon={<AppleIcon className="h-full w-full" strokeWidth={1.7} />}
        />
        <NavIcon
          active={settingsActive}
          onClick={onOpenSettings}
          ariaLabel={t.settings}
          icon={<GearIcon className="h-full w-full" strokeWidth={1.7} />}
        />

        <button
          onClick={() => onChange('camera')}
          className="nav-tab-transition absolute flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: cameraActive ? '#6b4423' : '#eec978',
            border: '3px solid #d9a441',
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
          }}
          aria-current={cameraActive ? 'page' : undefined}
          aria-label={t.camera}
        >
          <span
            className="nav-tab-transition flex h-7 w-7 items-center justify-center"
            style={{
              color: cameraActive ? '#2b1810' : 'var(--accent-strong)',
              transform: cameraActive ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            <CameraIcon className="h-full w-full" strokeWidth={1.7} />
          </span>
        </button>
      </div>
    </nav>
  )
}

import type { ReactNode } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { NAV_BAR_STRINGS } from '../lib/i18n/navBar'
import { AppleIcon, BotIcon, CalendarIcon, CameraIcon } from './icons'

export type Tab = 'camera' | 'calendar' | 'insights' | 'superfoods' | 'chat'

function NavIcon({
  active,
  onClick,
  ariaLabel,
  icon,
  alwaysCircle = false,
  badge = false,
}: {
  active: boolean
  onClick: () => void
  ariaLabel: string
  icon: ReactNode
  alwaysCircle?: boolean
  /** Small colored dot in the corner — flags that this tab has something new/unseen. */
  badge?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-0 py-1.5 transition"
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={`nav-tab-transition relative flex items-center justify-center rounded-full ${
          alwaysCircle && !active ? 'h-8 w-8' : 'h-11 w-11'
        }`}
        style={{
          backgroundColor: active ? '#6b4423' : 'transparent',
          color: active ? '#f5deb3' : '#6b4423',
          border: active || alwaysCircle ? '2px solid #000000' : '2px solid transparent',
          boxShadow: active ? '0 2px 0 #000000' : 'none',
        }}
      >
        <span
          className="nav-tab-transition flex h-6 w-6 items-center justify-center"
          style={{ transform: active ? 'scale(1.15)' : 'scale(1)' }}
        >
          {icon}
        </span>
        {badge && (
          <span
            aria-hidden
            className="absolute -top-0.5 end-0.5 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: 'var(--status-critical)', border: '1.5px solid #000000' }}
          />
        )}
      </span>
      {!active && (
        <span
          className={`${alwaysCircle ? 'mt-1' : '-mt-1'} text-[10px] font-medium leading-none`}
          style={{ color: '#6b4423' }}
        >
          {ariaLabel}
        </span>
      )}
    </button>
  )
}

export function NavBar({
  active,
  onChange,
  settingsActive = false,
  insightsPercent = 0,
  chatAlert = false,
}: {
  active: Tab
  onChange: (tab: Tab) => void
  settingsActive?: boolean
  /** Weekly goal completion percentage, shown inside the insights tab icon. */
  insightsPercent?: number
  /** Shows a red dot on the chat tab icon — the bot has something to be upset about and the
   *  user isn't currently looking at the chat panel. */
  chatAlert?: boolean
}) {
  const { lang } = useLanguage()
  const t = NAV_BAR_STRINGS[lang]
  const insightsActive = !settingsActive && active === 'insights'
  const clampedPercent = Math.round(Math.max(0, Math.min(100, insightsPercent)))

  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-20 flex justify-center"
      style={{ backgroundColor: '#eec978', borderTop: '2px solid #000000' }}
    >
      <div className="relative grid w-full max-w-md grid-cols-5 items-center">
        <NavIcon
          active={!settingsActive && active === 'calendar'}
          onClick={() => onChange('calendar')}
          ariaLabel={t.calendar}
          icon={<CalendarIcon className="h-full w-full" strokeWidth={1.7} />}
        />
        <NavIcon
          active={insightsActive}
          onClick={() => onChange('insights')}
          ariaLabel={t.insights}
          alwaysCircle
          icon={
            <span className="flex items-center justify-center text-xs font-extrabold leading-none">
              {clampedPercent}%
            </span>
          }
        />

        <div className="flex items-center justify-center py-1.5">
          <button
            onClick={() => onChange('camera')}
            className={`nav-tab-transition flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full active:translate-y-0.5 active:shadow-none${
              clampedPercent >= 100 ? ' nav-goal-complete-glow' : ''
            }`}
            style={{
              backgroundColor: !settingsActive && active === 'camera' ? '#6b4423' : 'var(--surface-cream)',
              border: '2px solid #000000',
              boxShadow: clampedPercent >= 100 ? undefined : '0 3px 0 #000000',
            }}
            aria-current={!settingsActive && active === 'camera' ? 'page' : undefined}
            aria-label={t.camera}
          >
            <span
              className="nav-tab-transition flex h-6 w-6 items-center justify-center"
              style={{
                color: !settingsActive && active === 'camera' ? '#f5deb3' : '#6b4423',
                transform: !settingsActive && active === 'camera' ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <CameraIcon className="h-full w-full" strokeWidth={1.7} />
            </span>
          </button>
        </div>

        <NavIcon
          active={!settingsActive && active === 'superfoods'}
          onClick={() => onChange('superfoods')}
          ariaLabel={t.superfoods}
          icon={<AppleIcon className="h-full w-full" strokeWidth={1.7} />}
        />
        <NavIcon
          active={!settingsActive && active === 'chat'}
          onClick={() => onChange('chat')}
          ariaLabel={t.chat}
          icon={<BotIcon className="h-full w-full" strokeWidth={1.7} />}
          badge={chatAlert}
        />
      </div>
    </nav>
  )
}

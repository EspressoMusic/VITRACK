import type { ReactNode } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { NAV_BAR_STRINGS } from '../lib/i18n/navBar'
import { AppleIcon, BotIcon, FarmIcon } from './icons'

export type Tab = 'calendar' | 'insights' | 'superfoods' | 'chat' | 'farm'

// Temporarily hidden (chat tab, superfoods "ask bot" button) — flip back to true to restore.
export const BOT_ENABLED = false

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
      className="flex items-center justify-center py-1.5 transition"
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className="nav-tab-transition flex h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: active ? '#6b4423' : 'transparent',
          color: active ? '#f5deb3' : '#6b4423',
          border: active ? '2px solid #000000' : '2px solid transparent',
          boxShadow: active ? '0 2px 0 #000000' : 'none',
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
  settingsActive = false,
  insightsPercent = 0,
}: {
  active: Tab
  onChange: (tab: Tab) => void
  settingsActive?: boolean
  /** Weekly goal completion percentage, shown inside the insights tab icon. */
  insightsPercent?: number
}) {
  const { lang } = useLanguage()
  const t = NAV_BAR_STRINGS[lang]
  const clampedPercent = Math.round(Math.max(0, Math.min(100, insightsPercent)))
  const insightsActive = !settingsActive && active === 'insights'

  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-20 flex justify-center"
      // Pinned to the screen's bottom edge; the padding fills the home-indicator strip so the icons sit above it.
      style={{ backgroundColor: '#eec978', borderTop: '2px solid #000000', paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="relative grid w-full max-w-md grid-cols-3 items-center">
        {BOT_ENABLED ? (
          <NavIcon
            active={!settingsActive && active === 'chat'}
            onClick={() => onChange('chat')}
            ariaLabel={t.chat}
            icon={<BotIcon className="h-full w-full" strokeWidth={1.7} />}
          />
        ) : (
          <NavIcon
            active={!settingsActive && active === 'farm'}
            onClick={() => onChange('farm')}
            ariaLabel={t.farm}
            icon={<FarmIcon className="h-full w-full" strokeWidth={1.7} />}
          />
        )}

        <div className="flex items-center justify-center py-1.5">
          <button
            onClick={() => onChange('insights')}
            className={`nav-tab-transition flex h-14 w-14 items-center justify-center rounded-full active:translate-y-0.5 active:shadow-none${
              clampedPercent >= 100 ? ' nav-goal-complete-glow' : ''
            }`}
            style={{
              backgroundColor: insightsActive ? '#6b4423' : 'var(--surface-cream)',
              border: '2px solid #000000',
              boxShadow: clampedPercent >= 100 ? undefined : '0 3px 0 #000000',
            }}
            aria-current={insightsActive ? 'page' : undefined}
            aria-label={t.insights}
          >
            <span
              className="nav-tab-transition flex items-center justify-center text-sm font-extrabold leading-none"
              style={{
                color: insightsActive ? '#f5deb3' : '#6b4423',
                transform: insightsActive ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {clampedPercent}%
            </span>
          </button>
        </div>

        <NavIcon
          active={!settingsActive && active === 'superfoods'}
          onClick={() => onChange('superfoods')}
          ariaLabel={t.superfoods}
          icon={<AppleIcon className="h-full w-full" strokeWidth={1.7} />}
        />
      </div>
    </nav>
  )
}

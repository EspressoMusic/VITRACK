import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { CREAM, GameButton, INK, NAV_CLEARANCE } from './kit'

/** While visiting someone's city: its name up top, and "Home" / "Their home" / "Send a guard" at the bottom (instead of the bottom menu). */
export function VisitBar({
  name,
  level,
  sent,
  busy,
  onSend,
  onHouse,
  onHome,
}: {
  name: string
  level: number
  sent: boolean
  busy: boolean
  onSend: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Steps inside their home; missing when the city has none. */
  onHouse?: () => void
  onHome: () => void
}) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]

  return (
    <>
      <div className="pointer-events-none absolute inset-x-16 top-3 z-[44] flex justify-center">
        <div
          className="farm-pop flex min-w-0 max-w-full flex-col items-center rounded-2xl px-3 py-1"
          style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}` }}
        >
          <span className="max-w-full truncate text-sm font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
            {name}
          </span>
          <span className="text-[0.6rem] font-bold leading-tight" style={{ color: '#52514e' }}>
            {t.levelShort(level)}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-3 z-20 flex justify-center" style={{ bottom: `calc(${NAV_CLEARANCE} + 0.75rem)` }}>
        <div
          className="farm-pop pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-2xl p-1.5"
          style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 3px 0 ${INK}` }}
        >
          <GameButton color="cream" onClick={onHome} className="py-2">
            {t.backHome} 🏠
          </GameButton>
          {onHouse && (
            <GameButton color="amber" onClick={onHouse} className="py-2">
              {t.visitHouse}
            </GameButton>
          )}
          <GameButton onClick={onSend} disabled={sent || busy} className="flex-1 py-2 text-sm">
            {sent ? t.guardSent : t.sendGuard}
          </GameButton>
        </div>
      </div>
    </>
  )
}

export interface Notice {
  id: number
  text: string
  tone: 'good' | 'bad' | 'info'
  /** Stays up (no fade) until replaced — e.g. while a city is loading. */
  sticky?: boolean
}

const TONES = {
  good: { bg: '#eaf8df', fg: '#1f4d12' },
  bad: { bg: '#fff1ec', fg: '#7a1d12' },
  info: { bg: '#fdf3d9', fg: '#3a2a06' },
}

/** A short message pill under the top bar (guards arriving, guard sent, no connection…). */
export function NoticePill({ notice }: { notice: Notice }) {
  const c = TONES[notice.tone]
  return (
    <div key={notice.id} className={`${notice.sticky ? 'farm-pop' : 'farm-notice'} pointer-events-none absolute inset-x-0 top-16 z-[46] flex justify-center px-6`}>
      <span
        className="rounded-full px-3 py-1.5 text-center text-xs font-extrabold"
        style={{ backgroundColor: c.bg, color: c.fg, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}` }}
      >
        {notice.text}
      </span>
    </div>
  )
}

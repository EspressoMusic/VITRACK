import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { fxTargetRef, type FxTarget } from './fxTargets'
import { CREAM, INK, NAV_CLEARANCE } from './kit'

export type FarmSheet = 'shop' | 'barn' | 'orders' | 'wardrobe' | 'germs' | 'coins' | 'calendar'

function MenuButton({
  icon,
  label,
  onClick,
  badge,
  big,
  target,
}: {
  icon: string
  label: string
  onClick: () => void
  badge?: string
  big?: boolean
  target?: FxTarget
}) {
  return (
    <button type="button" onClick={onClick} className="relative flex flex-col items-center active:translate-y-0.5" aria-label={label}>
      <span
        ref={target ? fxTargetRef(target) : undefined}
        className={`flex items-center justify-center rounded-full ${big ? 'h-14 w-14 text-3xl' : 'h-11 w-11 text-2xl'}`}
        style={{ backgroundColor: big ? '#ffcf4a' : CREAM, border: `2px solid ${INK}`, boxShadow: `0 3px 0 ${INK}` }}
      >
        <span aria-hidden>{icon}</span>
      </span>
      {badge && (
        <span
          className="absolute -top-1 end-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.55rem] font-extrabold"
          style={{ backgroundColor: badge === '!' ? '#d9534a' : '#3fae4a', color: '#ffffff', border: `1.5px solid ${INK}` }}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

export function BottomMenu({ onOpen }: { onOpen: (sheet: FarmSheet) => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]

  return (
    <div className="pointer-events-none absolute inset-x-3 z-20 flex items-end justify-end" style={{ bottom: `calc(${NAV_CLEARANCE} + 0.5rem)` }}>
      <div className="pointer-events-auto">
        <MenuButton icon="🛒" label={t.shop} onClick={() => onOpen('shop')} big />
      </div>
    </div>
  )
}

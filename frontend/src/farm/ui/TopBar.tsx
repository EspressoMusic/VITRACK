import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { useGame } from '../store/gameStore'
import { fxTargetRef } from './fxTargets'
import { CREAM, CoinAmount, INK } from './kit'

export function TopBar({ onCoins }: { onCoins: () => void }) {
  const { lang } = useLanguage()
  const player = useGame((s) => s.player)

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[45] flex items-start justify-end gap-2">
      <button
        type="button"
        ref={fxTargetRef('coins')}
        onClick={onCoins}
        aria-label={FARM_STRINGS[lang].getCoins}
        className="pointer-events-auto flex shrink-0 items-center rounded-full px-2.5 py-1 text-sm active:translate-y-0.5 active:shadow-none"
        style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}`, color: '#3a2a06' }}
      >
        <CoinAmount value={player.coins} />
      </button>
    </div>
  )
}

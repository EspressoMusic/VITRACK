import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { ConfettiBurst } from '../../components/ConfettiBurst'
import { unlocksAtLevel } from '../systems/LevelSystem'
import { CREAM, FitLabel, GameButton, INK, NAV_CLEARANCE } from './kit'
import { SpritePreview } from './SpritePreview'

/** Shown after one or more level ups; lists everything unlocked between `from` and `to`. */
export function LevelUpModal({ from, to, onClose }: { from: number; to: number; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const unlocks = Array.from({ length: to - from }, (_, i) => unlocksAtLevel(from + 1 + i)).flat()

  return (
    <div
      className="modal-backdrop-enter absolute inset-x-0 top-0 z-50 flex items-center justify-center px-6"
      style={{ bottom: NAV_CLEARANCE, backgroundColor: 'rgba(20,14,4,0.5)' }}
    >
      <ConfettiBurst count={36} />
      <div
        className="modal-card-enter flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl px-4 pb-4 pt-3 text-center"
        style={{ backgroundColor: CREAM, border: `3px solid ${INK}`, boxShadow: '0 6px 0 #c9a463' }}
      >
        <div
          className="farm-level-star -mt-10 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold"
          style={{ backgroundColor: '#ffcf4a', border: `3px solid ${INK}`, boxShadow: `0 4px 0 ${INK}`, color: '#3a2a06' }}
        >
          {to}
        </div>
        <h2 className="text-lg font-extrabold" style={{ color: '#3a2a06' }}>
          {t.levelUpTitle(to)} 🎉
        </h2>
        {unlocks.length > 0 ? (
          <>
            <p className="text-xs font-bold" style={{ color: '#52514e' }}>
              {t.unlockedTitle}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {unlocks.slice(0, 8).map((u, i) => (
                <div
                  key={i}
                  className="flex w-[4.2rem] flex-col items-center rounded-xl px-1 py-1"
                  style={{ backgroundColor: '#ffffff', border: `2px solid ${INK}` }}
                >
                  <span className="flex h-9 items-center text-2xl leading-none" aria-hidden>
                    {u.objectId ? <SpritePreview defId={u.objectId} /> : u.icon}
                  </span>
                  <FitLabel className="text-[0.58rem] font-extrabold" style={{ color: '#3a2a06' }}>
                    {u.name[lang]}
                  </FitLabel>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs font-bold" style={{ color: '#52514e' }}>
            {t.nothingNew}
          </p>
        )}
        <GameButton onClick={onClose} className="mt-1 px-6 py-1.5 text-sm">
          {t.great}
        </GameButton>
      </div>
    </div>
  )
}

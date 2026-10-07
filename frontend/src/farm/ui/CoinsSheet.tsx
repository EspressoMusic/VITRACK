import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { AD_REWARD_COINS, ADS_PER_DAY } from '../data/config'
import { farm, useGame } from '../store/gameStore'
import { adsLeftToday } from '../systems/AdRewardSystem'
import { CoinIcon, GameButton, INK, Sheet } from './kit'

/** Length of the stand-in ad. A real rewarded-ad SDK (e.g. AdMob) plugs in where the countdown runs. */
const AD_SECONDS = 5

/** Opened from the coin counter: watch a short ad, get coins (a few times a day). */
export function CoinsSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const left = useGame((s) => adsLeftToday(s, Date.now()))
  /** Seconds left in the ad on screen; null = no ad playing. */
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const done = secondsLeft === 0

  useEffect(() => {
    if (!secondsLeft) return
    const timer = window.setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const collect = (e: React.MouseEvent<HTMLButtonElement>) => {
    farm.adWatched({ x: e.clientX, y: e.clientY })
    setSecondsLeft(null)
  }

  return (
    <Sheet title={t.getCoins} onClose={onClose} closeLabel={t.close}>
      {secondsLeft === null ? (
        <div className="flex flex-col items-center gap-2 px-1 pb-1 pt-2 text-center">
          <div className="flex items-center gap-1.5">
            <CoinIcon className="farm-coin-bob h-12 w-12" />
            <span className="text-2xl font-extrabold tabular-nums" style={{ color: '#3a2a06' }} dir="ltr">
              +{AD_REWARD_COINS}
            </span>
          </div>
          <p className="text-sm font-bold" style={{ color: '#3a2a06' }}>
            {t.adPays(AD_REWARD_COINS)}
          </p>
          <div className="flex items-center gap-1" dir="ltr" aria-hidden>
            {Array.from({ length: ADS_PER_DAY }, (_, i) => (
              <span key={i} className={i < ADS_PER_DAY - left ? 'opacity-25 grayscale' : ''}>
                <CoinIcon className="h-5 w-5" />
              </span>
            ))}
          </div>
          <p className="text-[0.7rem] font-bold" style={{ color: '#52514e' }}>
            {left > 0 ? t.adsLeft(left, ADS_PER_DAY) : t.adsDoneToday}
          </p>
          {left > 0 && (
            <GameButton color="amber" onClick={() => setSecondsLeft(AD_SECONDS)} className="mt-1 w-full py-2 text-sm">
              {t.watchAd}
            </GameButton>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 pb-1">
          <div
            className="relative flex aspect-video w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl"
            style={{ background: 'linear-gradient(160deg, #2d3a4a, #141b24)', border: `2px solid ${INK}` }}
          >
            <span
              className="absolute start-2 top-2 rounded px-1.5 py-0.5 text-[0.6rem] font-extrabold"
              style={{ backgroundColor: '#ffcf4a', color: '#3a2a06' }}
            >
              {t.adLabel}
            </span>
            {!done ? (
              <>
                <CountdownRing seconds={secondsLeft} total={AD_SECONDS} />
                <p className="text-xs font-bold text-white/85">{t.adEndsIn(secondsLeft)}</p>
              </>
            ) : (
              <>
                <CoinIcon className="farm-coin-bob h-12 w-12" />
                <p className="text-sm font-extrabold text-white">{t.adThanks}</p>
              </>
            )}
          </div>
          {done && (
            <GameButton onClick={collect} className="w-full py-2 text-sm">
              <span dir="ltr" className="inline-flex items-center gap-1">
                {t.collect(AD_REWARD_COINS)}
                <CoinIcon />
              </span>
            </GameButton>
          )}
        </div>
      )}
    </Sheet>
  )
}

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 22
  const length = 2 * Math.PI * r
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg viewBox="0 0 52 52" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="#ffcf4a"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={length}
          className="farm-ad-ring"
          style={{ '--ring-len': `${length}px`, '--ring-time': `${total}s` } as React.CSSProperties}
        />
      </svg>
      <span className="text-lg font-extrabold tabular-nums text-white">{seconds}</span>
    </div>
  )
}

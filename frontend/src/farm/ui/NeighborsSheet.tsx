import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { GUARD } from '../data/guards'
import { type CityCard, cityCode, fetchMyCityName, fetchSentToday, listCities, myUserId, renameCity } from '../online/cityCloud'
import { BROWN, GameButton, INK, Sheet } from './kit'

/** Cards per page — two columns of three, so the sheet never needs to scroll. */
const PAGE = 6

type Status = { kind: 'loading' } | { kind: 'offline' } | { kind: 'ready'; cities: CityCard[]; sent: Set<string>; me: string | null }

function shuffled<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Other players' cities to visit, plus the player's own city name. */
export function NeighborsSheet({ onClose, onVisit }: { onClose: () => void; onVisit: (city: CityCard, helpedToday: boolean) => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [page, setPage] = useState(0)
  const [myName, setMyName] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([listCities(), fetchSentToday(), fetchMyCityName(), myUserId()]).then(([cities, sent, name, me]) => {
      if (!alive) return
      setMyName(name)
      setStatus(cities ? { kind: 'ready', cities: shuffled(cities), sent, me } : { kind: 'offline' })
    })
    return () => {
      alive = false
    }
  }, [])

  const nameOf = (c: { name: string | null; userId: string }) => c.name ?? t.cityNumber(cityCode(c.userId))

  const saveName = async () => {
    const ok = await renameCity(draft)
    if (ok) setMyName(draft.replace(/\s+/g, ' ').trim().slice(0, 20))
    setEditing(false)
  }

  const pages = status.kind === 'ready' ? Math.ceil(status.cities.length / PAGE) : 0
  const shown = status.kind === 'ready' ? status.cities.slice(page * PAGE, page * PAGE + PAGE) : []

  return (
    <Sheet title={t.neighborsTitle} onClose={onClose} closeLabel={t.close}>
      {status.kind === 'ready' && status.me && (
        <div className="flex items-center gap-2 rounded-xl px-2 py-1.5" style={{ backgroundColor: 'rgba(107,68,35,0.1)', border: `1.5px solid ${INK}` }}>
          {editing ? (
            <>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void saveName()}
                maxLength={20}
                autoFocus
                placeholder={t.nameYourCity}
                className="min-w-0 flex-1 rounded-lg bg-white px-2 py-1 text-xs font-bold outline-none"
                style={{ border: `1.5px solid ${INK}`, color: '#3a2a06' }}
              />
              <GameButton onClick={() => void saveName()} disabled={!draft.trim()}>
                {t.save}
              </GameButton>
            </>
          ) : (
            <>
              <span className="min-w-0 flex-1 truncate text-xs font-bold" style={{ color: '#52514e' }}>
                {t.myCity}:{' '}
                <span className="font-extrabold" style={{ color: '#3a2a06' }}>
                  {myName ?? t.cityNumber(cityCode(status.me))}
                </span>
              </span>
              <GameButton
                color="cream"
                ariaLabel={t.nameYourCity}
                onClick={() => {
                  setDraft(myName ?? '')
                  setEditing(true)
                }}
              >
                ✏️
              </GameButton>
            </>
          )}
        </div>
      )}

      {status.kind === 'loading' && <Message text={t.findingCities} />}
      {status.kind === 'offline' && <Message text={t.offline} />}
      {status.kind === 'ready' && status.cities.length === 0 && <Message text={t.noCities} />}

      {shown.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {shown.map((city) => {
            const helped = status.kind === 'ready' && status.sent.has(city.userId)
            return (
              <button
                key={city.userId}
                type="button"
                onClick={() => onVisit(city, helped)}
                className="flex min-w-0 items-center gap-1.5 rounded-xl bg-white px-2 py-1.5 text-start active:translate-y-0.5"
                style={{ border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}` }}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  🏙️
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-extrabold" style={{ color: '#3a2a06' }}>
                    {nameOf(city)}
                  </span>
                  <span className="truncate text-[0.62rem] font-bold" style={{ color: helped ? '#2f8a3a' : '#52514e' }}>
                    {helped ? `${t.helpedToday} 💂` : t.levelShort(city.level)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {status.kind === 'ready' && status.cities.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 text-[0.62rem] font-bold leading-snug" style={{ color: BROWN }}>
            {t.guardsHint(GUARD.sendsPerDay)}
          </span>
          {pages > 1 && (
            <GameButton color="amber" onClick={() => setPage((p) => (p + 1) % pages)}>
              {t.otherCities}
            </GameButton>
          )}
        </div>
      )}
    </Sheet>
  )
}

function Message({ text }: { text: string }) {
  return (
    <p className="px-2 py-5 text-center text-xs font-bold leading-snug" style={{ color: '#52514e' }}>
      {text}
    </p>
  )
}

import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { GERMS_BY_ID } from '../data/germs'
import { onFx } from '../store/gameStore'
import { GermPortrait } from './GermLibrarySheet'
import { CREAM, INK, NAV_CLEARANCE } from './kit'

const SHOW_MS = 4500

/** "New germ!" — shown the first time a germ type is stopped; tapping it opens that germ in the library. */
export function GermFoundToast({ onOpen }: { onOpen: (germId: string) => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const [found, setFound] = useState<{ key: number; germId: string } | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const off = onFx((e) => {
      if (e.type !== 'germFound') return
      setFound({ key: Date.now(), germId: e.germId })
      clearTimeout(timer)
      timer = setTimeout(() => setFound(null), SHOW_MS)
    })
    return () => {
      off()
      clearTimeout(timer)
    }
  }, [])

  const def = found ? GERMS_BY_ID[found.germId] : null
  if (!found || !def) return null
  return (
    <div className="pointer-events-none absolute inset-x-3 z-30 flex justify-center" style={{ bottom: `calc(${NAV_CLEARANCE} + 5.6rem)` }}>
      <button
        key={found.key}
        type="button"
        onClick={() => onOpen(found.germId)}
        className="farm-pop pointer-events-auto flex max-w-full items-center gap-1.5 rounded-full py-0.5 pe-3 ps-0.5 active:translate-y-0.5"
        style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 3px 0 ${INK}` }}
      >
        <span className="overflow-hidden rounded-full" style={{ backgroundColor: '#cfe9a8', border: `1.5px solid ${INK}` }}>
          <GermPortrait germId={def.id} size={30} />
        </span>
        <span className="min-w-0 text-start text-[0.68rem] font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
          {t.germFound(def.name[lang])}
        </span>
      </button>
    </div>
  )
}

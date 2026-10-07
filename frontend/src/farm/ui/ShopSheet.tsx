import { useState, type ReactNode } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS, type FarmShopTab } from '../../lib/i18n/farmPanel'
import { HOME_STRINGS } from '../../lib/i18n/home'
import { OBJECTS } from '../data/objects'
import { useGame } from '../store/gameStore'
import { buyBlocker, priceOf } from '../systems/BuildingSystem'
import { BROWN, CoinAmount, FitLabel, INK, Sheet, WHEAT } from './kit'
import { SpritePreview } from './SpritePreview'

const TABS: FarmShopTab[] = ['buildings', 'production', 'decorations']
/** Three rows of four: the catalog turns pages instead of scrolling. */
const PER_PAGE = 12

function ShopCard({
  icon,
  name,
  price,
  lockedLevel,
  note,
  dim,
  onClick,
}: {
  icon: ReactNode
  name: string
  price: number
  lockedLevel?: number
  note?: string
  dim?: boolean
  onClick: () => void
}) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const locked = lockedLevel !== undefined
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked || dim}
      className="flex min-w-0 flex-col items-center rounded-xl px-1 py-1 transition active:translate-y-0.5 disabled:opacity-55"
      style={{ backgroundColor: locked ? '#e8e2d2' : '#ffffff', border: `2px solid ${INK}`, boxShadow: locked || dim ? 'none' : `0 2px 0 ${INK}` }}
    >
      <span className="flex h-9 items-center justify-center text-2xl leading-none" aria-hidden>
        {locked ? '🔒' : icon}
      </span>
      <FitLabel className="text-[0.58rem] font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
        {name}
      </FitLabel>
      {locked ? (
        <span className="text-[0.58rem] font-bold leading-tight" style={{ color: '#7a1d12' }}>
          {t.levelShort(lockedLevel)}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[0.58rem] leading-tight" dir="ltr">
          <CoinAmount value={price} />
          {note && <span className="font-bold" style={{ color: '#52514e' }}>{note}</span>}
        </span>
      )}
    </button>
  )
}

export function ShopSheet({ onClose, onBuy }: { onClose: () => void; onBuy: (defId: string) => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const pageLabels = HOME_STRINGS[lang]
  const [tab, setTab] = useState<FarmShopTab>('buildings')
  const [page, setPage] = useState(0)
  const state = useGame((s) => s)

  // What you can buy now comes first, then what opens up next.
  const objects = OBJECTS.filter((o) => o.shopCategory === tab).sort((a, b) => a.requiredLevel - b.requiredLevel || a.cost - b.cost)
  const pages = Math.max(1, Math.ceil(objects.length / PER_PAGE))
  const shown = objects.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <Sheet title={`${t.shop} 🛒`} onClose={onClose} closeLabel={t.close}>
      <div className="flex gap-1">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id)
              setPage(0)
            }}
            className="flex-auto whitespace-nowrap rounded-full px-2 py-1 text-[0.62rem] font-extrabold"
            style={{
              backgroundColor: tab === id ? '#6b4423' : '#ffffff',
              color: tab === id ? '#f5deb3' : '#3a2a06',
              border: `2px solid ${INK}`,
            }}
            aria-pressed={tab === id}
          >
            {t.shopTabs[id]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {shown.map((def) => {
          const blocker = buyBlocker(state, def)
          return (
            <ShopCard
              key={def.id}
              icon={<SpritePreview defId={def.id} />}
              name={def.name[lang]}
              price={priceOf(state, def)}
              lockedLevel={blocker === 'levelLow' ? def.requiredLevel : undefined}
              note={blocker === 'limit' ? t.maxForNow : undefined}
              dim={blocker === 'limit'}
              onClick={() => onBuy(def.id)}
            />
          )
        })}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {/* ‹ › are mirrored by the browser in right-to-left text, so they always point the right way. */}
          <PageButton label={pageLabels.prevPage} glyph="‹" disabled={page === 0} onClick={() => setPage(page - 1)} />
          <span className="text-[0.62rem] font-extrabold tabular-nums" style={{ color: '#52514e' }} dir="ltr">
            {page + 1}/{pages}
          </span>
          <PageButton label={pageLabels.nextPage} glyph="›" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} />
        </div>
      )}
    </Sheet>
  )
}

function PageButton({ label, glyph, disabled, onClick }: { label: string; glyph: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded-full text-base font-black leading-none disabled:opacity-35"
      style={{ backgroundColor: BROWN, color: WHEAT, border: `2px solid ${INK}` }}
    >
      {glyph}
    </button>
  )
}

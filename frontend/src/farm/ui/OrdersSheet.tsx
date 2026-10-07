import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { NPCS } from '../data/config'
import { ITEMS_BY_ID } from '../data/items'
import { useNow } from '../hooks/useNow'
import { farm, useGame } from '../store/gameStore'
import { hasItems, itemCount } from '../systems/InventorySystem'
import { formatDuration } from '../utils/format'
import { CoinAmount, FitLabel, GameButton, INK, Sheet } from './kit'

export function OrdersSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const state = useGame((s) => s)
  const now = useNow(500)

  return (
    <Sheet title={`${t.orders} 📋`} onClose={onClose} closeLabel={t.close}>
      {state.orderSlots.map((slot, i) => {
        const order = slot.order
        if (!order) {
          return (
            <div
              key={`empty-${i}`}
              className="flex h-[4.6rem] items-center justify-center rounded-xl text-xs font-bold tabular-nums"
              style={{ border: `2px dashed #9b8a66`, color: '#7a6a48' }}
            >
              {t.newOrderIn(formatDuration(slot.refillAt - now))}
            </div>
          )
        }
        const npc = NPCS[order.npc] ?? NPCS[0]
        const ready = hasItems(state, order.lines)
        return (
          <div
            key={order.id}
            className="flex items-center gap-2 rounded-xl p-1.5"
            style={{ backgroundColor: ready ? '#eefbe4' : '#ffffff', border: `2px solid ${INK}` }}
          >
            <div className="flex w-12 shrink-0 flex-col items-center">
              <span className="text-2xl leading-none" aria-hidden>
                {npc.face}
              </span>
              <FitLabel className="text-[0.55rem] font-extrabold" style={{ color: '#3a2a06' }}>
                {npc.name[lang]}
              </FitLabel>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap gap-1">
                {order.lines.map((line) => {
                  const have = itemCount(state, line.item)
                  const enough = have >= line.qty
                  return (
                    <span
                      key={line.item}
                      className="flex items-center gap-0.5 rounded-lg px-1 text-[0.65rem] font-extrabold tabular-nums"
                      style={{ backgroundColor: enough ? '#d6f2c4' : '#fbe1e1', color: enough ? '#1f5f17' : '#8a1f16' }}
                      dir="ltr"
                      title={ITEMS_BY_ID[line.item].name[lang]}
                    >
                      <span aria-hidden>{ITEMS_BY_ID[line.item].icon}</span>
                      {Math.min(have, line.qty)}/{line.qty}
                    </span>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 text-[0.65rem]" style={{ color: '#3a2a06' }} dir="ltr">
                <CoinAmount value={order.coins} />
                <span className="font-extrabold" style={{ color: '#1b6fa8' }}>
                  ⭐ {order.xp} XP
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-1">
              <GameButton disabled={!ready} onClick={(e) => farm.completeOrder(i, { x: e.clientX, y: e.clientY })}>
                {t.deliver}
              </GameButton>
              <GameButton color="cream" className="!py-0.5" onClick={() => farm.discardOrder(i)} ariaLabel="🗑️">
                🗑️
              </GameButton>
            </div>
          </div>
        )
      })}
    </Sheet>
  )
}

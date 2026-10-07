import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { BARN_CAPACITY_STEP, barnUpgradeCost } from '../data/config'
import { ITEMS } from '../data/items'
import { farm, useGame } from '../store/gameStore'
import { barnCapacity, barnUsed } from '../systems/InventorySystem'
import { CoinAmount, CoinIcon, FitLabel, GameButton, INK, ProgressBar, Sheet } from './kit'

export function BarnSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const state = useGame((s) => s)
  const [selected, setSelected] = useState<string | null>(null)
  const [qty, setQty] = useState(1)

  const used = barnUsed(state)
  const cap = barnCapacity(state)
  const stock = ITEMS.filter((i) => (state.inventory[i.id] ?? 0) > 0)
  const item = stock.find((i) => i.id === selected) ?? null
  const have = item ? (state.inventory[item.id] ?? 0) : 0
  const amount = Math.min(qty, have)
  const upgradeCost = barnUpgradeCost(state.barnLevel)

  const pick = (id: string) => {
    setSelected(id)
    setQty(1)
  }

  return (
    <Sheet title={`${t.barn} 📦`} onClose={onClose} closeLabel={t.close}>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-xs font-extrabold tabular-nums" style={{ color: '#3a2a06' }} dir="ltr">
            {t.barnSpace(used, cap)}
          </span>
          <ProgressBar fraction={used / cap} color={used >= cap ? '#d9534a' : '#7ac74f'} />
        </div>
        <GameButton color="amber" onClick={() => farm.upgradeBarn()} disabled={state.player.coins < upgradeCost}>
          <span>{t.upgradeBarn(BARN_CAPACITY_STEP)}</span>
          <CoinAmount value={upgradeCost} />
        </GameButton>
      </div>

      {stock.length === 0 ? (
        <p className="py-6 text-center text-xs font-bold" style={{ color: '#52514e' }}>
          {t.barnEmpty}
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-1.5">
          {stock.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => pick(i.id)}
              className="relative flex min-w-0 flex-col items-center rounded-xl px-1 py-1 transition active:translate-y-0.5"
              style={{
                backgroundColor: selected === i.id ? '#fff3c4' : '#ffffff',
                border: `2px solid ${INK}`,
                boxShadow: selected === i.id ? `0 0 0 2px #ffcf4a` : 'none',
              }}
              aria-pressed={selected === i.id}
            >
              <span className="text-2xl leading-tight" aria-hidden>
                {i.icon}
              </span>
              <FitLabel className="text-[0.58rem] font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
                {i.name[lang]}
              </FitLabel>
              <span
                className="absolute -top-1.5 end-0.5 rounded-full px-1 text-[0.55rem] font-extrabold tabular-nums"
                style={{ backgroundColor: '#6b4423', color: '#f5deb3', border: `1.5px solid ${INK}` }}
              >
                {state.inventory[i.id]}
              </span>
            </button>
          ))}
        </div>
      )}

      {item && have > 0 && (
        <div className="flex items-center gap-1.5 rounded-xl p-1.5" style={{ backgroundColor: '#ffffff', border: `2px solid ${INK}` }}>
          <span className="text-xl" aria-hidden>
            {item.icon}
          </span>
          <div className="flex items-center gap-1" dir="ltr">
            <GameButton color="cream" className="h-7 w-7 !px-0" onClick={() => setQty(Math.max(1, amount - 1))} ariaLabel="-">
              −
            </GameButton>
            <span className="w-6 text-center text-sm font-extrabold tabular-nums">{amount}</span>
            <GameButton color="cream" className="h-7 w-7 !px-0" onClick={() => setQty(Math.min(have, amount + 1))} ariaLabel="+">
              +
            </GameButton>
            <GameButton color="cream" className="h-7 !px-1.5 text-[0.6rem]" onClick={() => setQty(have)}>
              MAX
            </GameButton>
          </div>
          <GameButton
            className="ms-auto"
            onClick={(e) => {
              if (farm.sell(item.id, amount, { x: e.clientX, y: e.clientY })) setQty(1)
            }}
          >
            <span>{t.sellFor(item.sellValue * amount)}</span>
            <CoinIcon />
          </GameButton>
        </div>
      )}
    </Sheet>
  )
}

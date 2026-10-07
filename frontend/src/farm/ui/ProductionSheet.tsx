import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { ITEMS_BY_ID } from '../data/items'
import { OBJECTS_BY_ID } from '../data/objects'
import { RECIPES_BY_ID } from '../data/recipes'
import { useNow } from '../hooks/useNow'
import { farm, useGame } from '../store/gameStore'
import { hasItems, itemCount } from '../systems/InventorySystem'
import { jobStatus } from '../systems/ProductionSystem'
import { formatDuration } from '../utils/format'
import { CoinAmount, GameButton, INK, ProgressBar, Sheet } from './kit'

export function ProductionSheet({ uid, onClose }: { uid: string; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const state = useGame((s) => s)
  const now = useNow(250)
  const building = state.objects.find((o) => o.uid === uid)
  if (!building) return null
  const def = OBJECTS_BY_ID[building.defId]
  const queue = building.queue ?? []
  const readyCount = queue.filter((j) => jobStatus(j, now) === 'ready').length
  const full = queue.length >= def.productionSlots

  return (
    <Sheet title={`${def.name[lang]} ${def.icon}`} onClose={onClose} closeLabel={t.close}>
      <div className="flex items-center gap-1.5">
        <span className="text-[0.65rem] font-extrabold" style={{ color: '#3a2a06' }}>
          {t.queueTitle}
        </span>
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: def.productionSlots }, (_, i) => {
            const job = queue[i]
            const recipe = job && RECIPES_BY_ID[job.recipeId]
            const status = job ? jobStatus(job, now) : null
            return (
              <div
                key={i}
                className="flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1"
                style={{
                  backgroundColor: status === 'ready' ? '#d6f2c4' : job ? '#ffffff' : 'transparent',
                  border: job ? `2px solid ${INK}` : '2px dashed #9b8a66',
                }}
              >
                {recipe ? (
                  <>
                    <span className="text-lg leading-none" aria-hidden>
                      {ITEMS_BY_ID[recipe.output].icon}
                    </span>
                    {status === 'working' ? (
                      <div className="w-full">
                        <ProgressBar fraction={(now - job.startAt) / (job.endAt - job.startAt)} height={5} />
                      </div>
                    ) : (
                      <span className="text-[0.55rem] font-extrabold tabular-nums" style={{ color: '#52514e' }}>
                        {status === 'ready' ? '✓' : formatDuration(job.endAt - now)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[0.55rem] font-bold" style={{ color: '#9b8a66' }}>
                    {t.freeSlot}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {readyCount > 0 && (
        <GameButton color="amber" onClick={(e) => farm.collect(uid, { x: e.clientX, y: e.clientY })}>
          {t.ready} ×{readyCount}
        </GameButton>
      )}

      <div className="flex flex-col gap-1.5">
        {def.recipes.map((id) => {
          const recipe = RECIPES_BY_ID[id]
          const out = ITEMS_BY_ID[recipe.output]
          const locked = state.player.level < recipe.requiredLevel
          const canMake = !locked && !full && hasItems(state, recipe.inputs)
          return (
            <div
              key={id}
              className="flex items-center gap-2 rounded-xl p-1.5"
              style={{ backgroundColor: locked ? '#e8e2d2' : '#ffffff', border: `2px solid ${INK}`, opacity: locked ? 0.65 : 1 }}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {locked ? '🔒' : out.icon}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="break-words text-xs font-extrabold" style={{ color: '#3a2a06' }}>
                  {out.name[lang]}
                </span>
                {locked ? (
                  <span className="text-[0.6rem] font-bold" style={{ color: '#7a1d12' }}>
                    {t.levelShort(recipe.requiredLevel)}
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-1 text-[0.6rem] font-extrabold tabular-nums" dir="ltr">
                    {recipe.inputs.map((input) => {
                      const enough = itemCount(state, input.item) >= input.qty
                      return (
                        <span
                          key={input.item}
                          className="rounded-md px-1"
                          style={{ backgroundColor: enough ? '#d6f2c4' : '#fbe1e1', color: enough ? '#1f5f17' : '#8a1f16' }}
                        >
                          {ITEMS_BY_ID[input.item].icon}
                          {Math.min(itemCount(state, input.item), input.qty)}/{input.qty}
                        </span>
                      )
                    })}
                    <span style={{ color: '#52514e' }}>⏱ {formatDuration(recipe.time * 1000)}</span>
                    <CoinAmount value={out.sellValue} />
                  </div>
                )}
              </div>
              {!locked && (
                <GameButton disabled={!canMake} onClick={() => farm.produce(uid, id)}>
                  {t.produce}
                </GameButton>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}

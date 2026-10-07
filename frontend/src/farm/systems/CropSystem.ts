import { CROPS, CROPS_BY_ID, WATER_SPEEDUP } from '../data/crops'
import type { CropDef, CropSlot, GameState, GrowthStage, Result } from '../types'
import { isBuilt } from './BuildingSystem'
import { spend } from './EconomySystem'
import { addItem, barnCapacity, barnUsed, itemCount } from './InventorySystem'
import { addXp } from './LevelSystem'
import { bumpStat, fail, findObject, ok, updateObject } from './result'

export function cropProgress(slot: CropSlot, now: number): number {
  const total = slot.readyAt - slot.plantedAt
  return total <= 0 ? 1 : Math.min(1, Math.max(0, (now - slot.plantedAt) / total))
}

export function isCropReady(slot: CropSlot, now: number): boolean {
  return now >= slot.readyAt
}

export function cropStage(slot: CropSlot, now: number): GrowthStage {
  if (isCropReady(slot, now)) return 4
  const p = cropProgress(slot, now)
  const [sprout, medium, almost] = CROPS_BY_ID[slot.cropId]?.growthStages ?? [0.2, 0.4, 0.7, 1]
  if (p >= almost) return 3
  if (p >= medium) return 2
  if (p >= sprout) return 1
  return 0
}

/** Growing and still dry: a splash of water would speed it up. */
export function needsWater(slot: CropSlot, now: number): boolean {
  return !slot.wateredAt && !isCropReady(slot, now)
}

export function water(state: GameState, uid: string, now: number): Result {
  const slot = findObject(state, uid)?.crop
  if (!slot || !needsWater(slot, now)) return fail('blocked')
  const next = updateObject(state, uid, (o) => ({
    ...o,
    crop: { ...slot, wateredAt: now, readyAt: now + Math.round((slot.readyAt - now) * WATER_SPEEDUP) },
  }))
  return ok(bumpStat(next, 'watered'))
}

/** What to sow next for the town: the crop its orders are shortest of, else the one there's least of —
 *  only crops the player can afford, and none at all when the barn couldn't take the harvest. */
export function cropToPlant(state: GameState): CropDef | null {
  const growing = new Map<string, number>()
  for (const o of state.objects) if (o.crop) growing.set(o.crop.cropId, (growing.get(o.crop.cropId) ?? 0) + 1)
  const coming = [...growing.values()].reduce((sum, n) => sum + n, 0)
  if (barnUsed(state) + coming >= barnCapacity(state)) return null
  const wanted = new Map<string, number>()
  for (const slot of state.orderSlots) for (const l of slot.order?.lines ?? []) wanted.set(l.item, (wanted.get(l.item) ?? 0) + l.qty)
  const options = CROPS.filter((c) => c.requiredLevel <= state.player.level && c.seedPrice <= state.player.coins)
  const have = (c: CropDef) => itemCount(state, c.id) + (growing.get(c.id) ?? 0) * c.yield
  const short = (c: CropDef) => (wanted.get(c.id) ?? 0) - have(c)
  const needed = options.filter((c) => short(c) > 0).sort((a, b) => short(b) - short(a) || a.growTime - b.growTime)
  if (needed.length) return needed[0]
  return [...options].sort((a, b) => have(a) - have(b) || a.growTime - b.growTime)[0] ?? null
}

export function plant(state: GameState, uid: string, cropId: string, now: number): Result {
  const field = findObject(state, uid)
  const crop = CROPS_BY_ID[cropId]
  if (!field || !crop || field.defId !== 'field' || field.crop || !isBuilt(field, now)) return fail('blocked')
  if (state.player.level < crop.requiredLevel) return fail('levelLow')
  const paid = spend(state, crop.seedPrice)
  if (!paid) return fail('noCoins')
  const next = updateObject(paid, uid, (o) => ({
    ...o,
    crop: { cropId, plantedAt: now, readyAt: now + crop.growTime * 1000 },
  }))
  return ok(bumpStat(next, 'planted'))
}

export function harvest(state: GameState, uid: string, now: number): Result {
  const field = findObject(state, uid)
  const slot = field?.crop
  if (!field || !slot) return fail('blocked')
  if (!isCropReady(slot, now)) return fail('notReady')
  const crop = CROPS_BY_ID[slot.cropId]
  const stored = addItem(state, crop.id, crop.yield)
  if (!stored) return fail('barnFull')
  const next = updateObject(addXp(stored, crop.xpReward), uid, (o) => ({ ...o, crop: null }))
  return ok(bumpStat(next, `harvested:${crop.id}`, crop.yield), [
    { kind: 'item', item: crop.id, amount: crop.yield },
    { kind: 'xp', amount: crop.xpReward },
  ])
}

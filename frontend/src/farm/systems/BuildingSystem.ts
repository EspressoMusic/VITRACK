import { OBJECTS_BY_ID } from '../data/objects'
import type { GameState, ObjectDef, PlacedObject, Result, UpgradeDef } from '../types'
import { spend } from './EconomySystem'
import { addXp } from './LevelSystem'
import { canPlace } from './MapSystem'
import { fail, findObject, ok, updateObject } from './result'

export function isBuilt(obj: PlacedObject, now: number): boolean {
  return now >= obj.builtAt
}

export function ownedCount(state: GameState, defId: string): number {
  return state.objects.filter((o) => o.defId === defId).length
}

export function priceOf(state: GameState, def: ObjectDef): number {
  return def.cost + (def.costStep ?? 0) * ownedCount(state, def.id)
}

export type BuyBlocker = 'levelLow' | 'limit' | 'noCoins' | null

/** Why the player can't buy this right now (null = they can). Placement is checked separately. */
export function buyBlocker(state: GameState, def: ObjectDef): BuyBlocker {
  if (state.player.level < def.requiredLevel) return 'levelLow'
  if (ownedCount(state, def.id) >= def.maxCount(state.player.level)) return 'limit'
  if (state.player.coins < priceOf(state, def)) return 'noCoins'
  return null
}

export function newObject(state: GameState, defId: string, x: number, y: number, now: number): { state: GameState; obj: PlacedObject } {
  const def = OBJECTS_BY_ID[defId]
  const obj: PlacedObject = {
    uid: `o${state.nextUid}`,
    defId,
    x,
    y,
    builtAt: now + def.buildTime * 1000,
    ...(def.kind === 'field' ? { crop: null } : {}),
    ...(def.kind === 'production' ? { queue: [] } : {}),
  }
  return { state: { ...state, nextUid: state.nextUid + 1, objects: [...state.objects, obj] }, obj }
}

export function buyAndPlace(state: GameState, defId: string, x: number, y: number, now: number): Result {
  const def = OBJECTS_BY_ID[defId]
  if (!def || !def.shopCategory) return fail('blocked')
  const blocker = buyBlocker(state, def)
  if (blocker) return fail(blocker)
  if (!canPlace(state, defId, x, y)) return fail('blocked')
  const paid = spend(state, priceOf(state, def))
  if (!paid) return fail('noCoins')
  const placed = newObject(paid, defId, x, y, now).state
  return ok(addXp(placed, def.xpReward), def.xpReward > 0 ? [{ kind: 'xp', amount: def.xpReward }] : [])
}

export function isMovable(def: ObjectDef): boolean {
  return def.movable !== false
}

export function moveObject(state: GameState, uid: string, x: number, y: number): Result {
  const obj = findObject(state, uid)
  if (!obj || !isMovable(OBJECTS_BY_ID[obj.defId]) || !canPlace(state, obj.defId, x, y, uid)) return fail('blocked')
  return ok(updateObject(state, uid, (o) => ({ ...o, x, y })))
}

/** Anything bought from the shop can be cleared off the map; the starting buildings and the gate stay. */
export function isRemovable(def: ObjectDef): boolean {
  return def.shopCategory !== null && isMovable(def)
}

export function removeObject(state: GameState, uid: string): Result {
  const obj = findObject(state, uid)
  if (!obj || !isRemovable(OBJECTS_BY_ID[obj.defId])) return fail('blocked')
  return ok({ ...state, objects: state.objects.filter((o) => o.uid !== uid) })
}

// ---------- building levels ----------

export function objectLevel(obj: PlacedObject): number {
  return obj.level ?? 1
}

export function maxObjectLevel(def: ObjectDef): number {
  return 1 + (def.upgrades?.length ?? 0)
}

/** The next upgrade step, or null when the building is already at its top level. */
export function nextUpgrade(def: ObjectDef, obj: PlacedObject): UpgradeDef | null {
  return def.upgrades?.[objectLevel(obj) - 1] ?? null
}

export function upgradeObject(state: GameState, uid: string): Result {
  const obj = findObject(state, uid)
  const def = obj && OBJECTS_BY_ID[obj.defId]
  if (!obj || !def) return fail('blocked')
  const step = nextUpgrade(def, obj)
  if (!step) return fail('maxLevel')
  if (state.player.level < step.requiredLevel) return fail('levelLow')
  const paid = spend(state, step.cost)
  if (!paid) return fail('noCoins')
  const xp = Math.max(5, Math.round(step.cost / 20))
  return ok(addXp(updateObject(paid, uid, (o) => ({ ...o, level: objectLevel(o) + 1 })), xp), [{ kind: 'xp', amount: xp }])
}

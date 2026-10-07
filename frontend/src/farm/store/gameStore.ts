import { useSyncExternalStore } from 'react'
import { CROPS_BY_ID } from '../data/crops'
import { germStatKey } from '../data/germs'
import { GUARD } from '../data/guards'
import { OBJECTS_BY_ID } from '../data/objects'
import { claimAdReward } from '../systems/AdRewardSystem'
import { buyAndPlace, moveObject, removeObject, upgradeObject } from '../systems/BuildingSystem'
import { harvest, plant, water } from '../systems/CropSystem'
import { damageGate, germStopped, repairGate, upgradeGate } from '../systems/DefenseSystem'
import { addGuards } from '../systems/GuardSystem'
import { applyRoomStyle, type FurniturePose, moveFurniture, placeFurniture, storeFurniture } from '../systems/HomeSystem'
import { sellItem, upgradeBarn } from '../systems/InventorySystem'
import { addXp } from '../systems/LevelSystem'
import { unlockArea } from '../systems/MapSystem'
import { completeOrder, discardOrder, refillOrders } from '../systems/OrderSystem'
import { collectProduction, startProduction } from '../systems/ProductionSystem'
import { findObject, ok } from '../systems/result'
import { clearSave, createInitialState, loadGame, saveGame } from '../systems/SaveSystem'
import type { FarmError, GameState, Gain, Point, Result } from '../types'

// ---------- State container ----------

let state: GameState | null = null
const listeners = new Set<() => void>()
let saveTimer: ReturnType<typeof setTimeout> | undefined

function current(): GameState {
  state ??= loadGame(Date.now())
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function commit(next: GameState) {
  if (next === state) return
  state = next
  clearTimeout(saveTimer)
  saveTimer = setTimeout(flushSave, 400)
  listeners.forEach((l) => l())
}

export function getGameState(): GameState {
  return current()
}

/** Called after every change to the game state (e.g. to publish the city online). */
export const onGameChange = subscribe

export function flushSave(): void {
  clearTimeout(saveTimer)
  if (state) saveGame(state)
}

/** Selector must return something already in the state (or a primitive) so it stays referentially stable. */
export function useGame<T>(selector: (s: GameState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(current()))
}

// ---------- One-shot visual events (not saved) ----------

export type FxEvent =
  /** `background` = paid out by the world on its own (a germ stopped by the gate/guards), not by a tap. */
  | { type: 'gain'; gain: Gain; at?: Point; background?: boolean }
  | { type: 'error'; error: FarmError }
  | { type: 'levelUp'; from: number; to: number }
  | { type: 'burst'; kind: 'harvest' | 'build'; tileX: number; tileY: number; color?: string }
  | { type: 'placed'; uid: string }
  | { type: 'gateHit'; amount: number }
  /** The first germ of a type was stopped — it's now worth a look in the germ library. */
  | { type: 'germFound'; germId: string }
  /** Other players sent guards to the gate (names of the cities that sent them). */
  | { type: 'guardsArrived'; from: string[] }

const fxListeners = new Set<(e: FxEvent) => void>()

export function onFx(listener: (e: FxEvent) => void): () => void {
  fxListeners.add(listener)
  return () => {
    fxListeners.delete(listener)
  }
}

function emit(e: FxEvent) {
  fxListeners.forEach((l) => l(e))
}

/** "+1 Bread, +4 XP, +1 Bread, +4 XP" → "+2 Bread, +8 XP". */
function mergeGains(gains: Gain[]): Gain[] {
  const merged: Gain[] = []
  for (const g of gains) {
    const same = merged.find((m) => m.kind === g.kind && (m.kind !== 'item' || (g.kind === 'item' && m.item === g.item)))
    if (same) same.amount += g.amount
    else merged.push({ ...g })
  }
  return merged
}

/** Applies a system result: commits on success, otherwise surfaces the error (unless `quiet`: the character's
 *  own chores just skip a field that changed meanwhile). */
function run(result: Result, at?: Point, background?: boolean, quiet = false): boolean {
  if (!result.ok) {
    if (!quiet) emit({ type: 'error', error: result.error })
    return false
  }
  const from = current().player.level
  commit(result.state)
  mergeGains(result.gains).forEach((gain) => emit({ type: 'gain', gain, at, background }))
  const to = result.state.player.level
  if (to > from) emit({ type: 'levelUp', from, to })
  return true
}

// ---------- Actions ----------

export const farm = {
  plant(uid: string, cropId: string, quiet = false): boolean {
    return run(plant(current(), uid, cropId, Date.now()), undefined, false, quiet)
  },

  /** The character watered a growing crop (it then grows faster). */
  water(uid: string): boolean {
    return run(water(current(), uid, Date.now()), undefined, false, true)
  },

  /** `quiet` = the character harvested it on its own: no error toast, and its rewards count as background gains. */
  harvest(uid: string, at?: Point, quiet = false): boolean {
    const obj = findObject(current(), uid)
    const color = obj?.crop ? CROPS_BY_ID[obj.crop.cropId]?.look.fruit : undefined
    const done = run(harvest(current(), uid, Date.now()), at, quiet, quiet)
    if (done && obj) emit({ type: 'burst', kind: 'harvest', tileX: obj.x + 0.5, tileY: obj.y + 0.5, color })
    return done
  },

  buy(defId: string, x: number, y: number): boolean {
    const uid = `o${current().nextUid}`
    const done = run(buyAndPlace(current(), defId, x, y, Date.now()))
    if (done) {
      emit({ type: 'placed', uid })
      emit({ type: 'burst', kind: 'build', tileX: x + 0.5, tileY: y + 0.5 })
    }
    return done
  },

  move(uid: string, x: number, y: number): boolean {
    const done = run(moveObject(current(), uid, x, y))
    if (done) emit({ type: 'placed', uid })
    return done
  },

  remove(uid: string): boolean {
    const obj = findObject(current(), uid)
    const done = run(removeObject(current(), uid))
    if (done && obj) emit({ type: 'burst', kind: 'build', tileX: obj.x + 0.5, tileY: obj.y + 0.5 })
    return done
  },

  produce(uid: string, recipeId: string): boolean {
    return run(startProduction(current(), uid, recipeId, Date.now()))
  },

  collect(uid: string, at?: Point): boolean {
    return run(collectProduction(current(), uid, Date.now()), at)
  },

  completeOrder(slot: number, at?: Point): boolean {
    return run(completeOrder(current(), slot, Date.now()), at)
  },

  discardOrder(slot: number): boolean {
    return run(discardOrder(current(), slot, Date.now()))
  },

  sell(item: string, qty: number, at?: Point): boolean {
    return run(sellItem(current(), item, qty), at)
  },

  upgradeBarn(): boolean {
    return run(upgradeBarn(current()))
  },

  unlockArea(areaId: string): boolean {
    return run(unlockArea(current(), areaId))
  },

  /** Raises a building's level (the gate also gains health). */
  upgrade(uid: string): boolean {
    const obj = findObject(current(), uid)
    if (!obj) return false
    const isGate = OBJECTS_BY_ID[obj.defId]?.kind === 'gate'
    const done = run(isGate ? upgradeGate(current(), Date.now()) : upgradeObject(current(), uid))
    if (done) {
      emit({ type: 'placed', uid })
      emit({ type: 'burst', kind: 'build', tileX: obj.x + 1, tileY: obj.y + 0.5 })
    }
    return done
  },

  repairGate(): boolean {
    return run(repairGate(current(), Date.now()))
  },

  // ---------- inside the home ----------

  placeFurniture(homeUid: string, pose: FurniturePose): boolean {
    return run(placeFurniture(current(), homeUid, pose))
  },

  moveFurniture(homeUid: string, pieceId: string, x: number, y: number, turned: boolean): boolean {
    return run(moveFurniture(current(), homeUid, pieceId, x, y, turned))
  },

  storeFurniture(homeUid: string, pieceId: string): boolean {
    return run(storeFurniture(current(), homeUid, pieceId))
  },

  roomStyle(homeUid: string, styleId: string): boolean {
    return run(applyRoomStyle(current(), homeUid, styleId))
  },

  /** A germ bit the gate (called by the world simulation). */
  hitGate(amount: number): void {
    commit(damageGate(current(), amount, Date.now()))
    emit({ type: 'gateHit', amount })
  },

  /** A germ was stopped and pays out (`at` = where, in client coordinates, for the coin animation). */
  germStopped(germId: string, mini: boolean, at?: Point): void {
    const first = !current().stats[germStatKey(germId)]
    run(germStopped(current(), germId, mini), at, true)
    if (first) emit({ type: 'germFound', germId })
  },

  /** Guards other players sent are now standing at the gate. */
  receiveGuards(gifts: { id: string; from: string }[]): void {
    if (!gifts.length) return
    commit(addGuards(current(), gifts, Date.now()))
    emit({ type: 'guardsArrived', from: gifts.map((g) => g.from) })
  },

  /** The player sent a guard to help someone else's city. */
  guardSent(at?: Point): boolean {
    return run(ok(addXp(current(), GUARD.sendXp), [{ kind: 'xp', amount: GUARD.sendXp }]), at)
  },

  /** The player watched a whole ad (`at` = where to fly the coins from). */
  adWatched(at?: Point): boolean {
    return run(claimAdReward(current(), Date.now()), at)
  },

  /** Time-driven bookkeeping that needs randomness (new orders). Crops/production need no tick. */
  tick(): void {
    commit(refillOrders(current(), Date.now()))
  },

  /** Surfaces a UI-side failure (e.g. no free spot for a new building) the same way system errors are. */
  notify(error: FarmError): void {
    emit({ type: 'error', error })
  },

  reset(): void {
    clearSave()
    commit(createInitialState(Date.now()))
  },
}

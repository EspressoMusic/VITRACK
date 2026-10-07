import { OBJECTS_BY_ID } from '../data/objects'
import { RECIPES_BY_ID } from '../data/recipes'
import type { Gain, GameState, PlacedObject, ProductionJob, Result } from '../types'
import { isBuilt } from './BuildingSystem'
import { addItem, removeItems } from './InventorySystem'
import { addXp } from './LevelSystem'
import { bumpStat, fail, findObject, ok, updateObject } from './result'

export type JobStatus = 'waiting' | 'working' | 'ready'

export function jobStatus(job: ProductionJob, now: number): JobStatus {
  if (now >= job.endAt) return 'ready'
  if (now >= job.startAt) return 'working'
  return 'waiting'
}

export function readyJobCount(obj: PlacedObject, now: number): number {
  return (obj.queue ?? []).filter((j) => jobStatus(j, now) === 'ready').length
}

/** Jobs run one after another: each new job starts when the previous one finishes. Times are
 *  fixed when queued, so progress made while the app was closed is picked up automatically. */
export function startProduction(state: GameState, uid: string, recipeId: string, now: number): Result {
  const building = findObject(state, uid)
  const def = building && OBJECTS_BY_ID[building.defId]
  const recipe = RECIPES_BY_ID[recipeId]
  if (!building || !def || !recipe || !def.recipes.includes(recipeId) || !isBuilt(building, now)) return fail('blocked')
  if (state.player.level < recipe.requiredLevel) return fail('levelLow')
  const queue = building.queue ?? []
  if (queue.length >= def.productionSlots) return fail('queueFull')
  const paid = removeItems(state, recipe.inputs)
  if (!paid) return fail('missingItems')
  const startAt = Math.max(now, queue[queue.length - 1]?.endAt ?? now)
  const job: ProductionJob = { recipeId, startAt, endAt: startAt + recipe.time * 1000 }
  return ok(updateObject(paid, uid, (o) => ({ ...o, queue: [...queue, job] })))
}

/** Moves every finished product (oldest first) into the barn until it runs out of room. */
export function collectProduction(state: GameState, uid: string, now: number): Result {
  const building = findObject(state, uid)
  const queue = building?.queue ?? []
  let next = state
  let collected = 0
  const gains: Gain[] = []
  for (const job of queue) {
    if (jobStatus(job, now) !== 'ready') break
    const recipe = RECIPES_BY_ID[job.recipeId]
    const stored = addItem(next, recipe.output, recipe.outputQty)
    if (!stored) break
    next = bumpStat(addXp(stored, recipe.xpReward), `produced:${recipe.output}`, recipe.outputQty)
    gains.push({ kind: 'item', item: recipe.output, amount: recipe.outputQty }, { kind: 'xp', amount: recipe.xpReward })
    collected++
  }
  if (collected === 0) return fail(queue.some((j) => jobStatus(j, now) === 'ready') ? 'barnFull' : 'notReady')
  return ok(
    updateObject(next, uid, (o) => ({ ...o, queue: queue.slice(collected) })),
    gains,
  )
}

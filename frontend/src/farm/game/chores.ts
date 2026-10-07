import { CROPS_BY_ID } from '../data/crops'
import { OBJECTS_BY_ID } from '../data/objects'
import { isBuilt } from '../systems/BuildingSystem'
import { cropToPlant, isCropReady, needsWater } from '../systems/CropSystem'
import { canStore } from '../systems/InventorySystem'
import type { GameState } from '../types'

export type ChoreKind = 'harvest' | 'water' | 'plant'

/** Field work the character walks over and does on its own. */
export interface Chore {
  kind: ChoreKind
  uid: string
  /** The field's tile. */
  x: number
  y: number
  /** What to sow, or what's growing there. */
  cropId?: string
}

/** How long each job takes once the character stands at the field. */
export const CHORE_MS: Record<ChoreKind, number> = { harvest: 900, water: 1900, plant: 1400 }
/** Ripe crops first, then thirsty ones, then bare soil — weighed against how far away each field is. */
export const CHORE_RANK: Record<ChoreKind, number> = { harvest: 0, water: 1, plant: 2 }

/** Every field that wants work right now. `sow` = empty fields may be planted (off while the player plants by hand). */
export function pendingChores(state: GameState, now: number, sow: boolean): Chore[] {
  const seed = sow ? cropToPlant(state) : null
  const chores: Chore[] = []
  for (const o of state.objects) {
    if (OBJECTS_BY_ID[o.defId]?.kind !== 'field' || !isBuilt(o, now)) continue
    const at = { uid: o.uid, x: o.x, y: o.y }
    if (!o.crop) {
      if (seed) chores.push({ kind: 'plant', ...at, cropId: seed.id })
    } else if (isCropReady(o.crop, now)) {
      if (canStore(state, CROPS_BY_ID[o.crop.cropId]?.yield ?? 1)) chores.push({ kind: 'harvest', ...at, cropId: o.crop.cropId })
    } else if (needsWater(o.crop, now)) {
      chores.push({ kind: 'water', ...at, cropId: o.crop.cropId })
    }
  }
  return chores
}

/** Whether the field still wants this (it may have been harvested, moved or sold since the character set off). */
export function choreStillNeeded(state: GameState, chore: Chore, now: number): boolean {
  const field = state.objects.find((o) => o.uid === chore.uid)
  if (!field || field.x !== chore.x || field.y !== chore.y) return false
  if (chore.kind === 'plant') return !field.crop
  if (!field.crop) return false
  return chore.kind === 'harvest' ? isCropReady(field.crop, now) : needsWater(field.crop, now)
}

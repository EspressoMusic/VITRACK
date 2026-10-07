import { type AvatarLook, sanitizeLook } from '../../avatar/look'
import { AREAS_BY_ID } from '../data/areas'
import { CROPS_BY_ID } from '../data/crops'
import { GUARD } from '../data/guards'
import { OBJECTS_BY_ID } from '../data/objects'
import { RECIPES_BY_ID } from '../data/recipes'
import { SAVE_VERSION } from '../data/config'
import { activeGuards } from '../systems/GuardSystem'
import { areaAt } from '../systems/MapSystem'
import type { GameState, GuardStay, PlacedObject, ProductionJob } from '../types'

/** What other players get to see of a city: the map only — no coins, barn or orders. */
export interface CitySnapshot {
  level: number
  objects: PlacedObject[]
  unlockedAreas: string[]
  guards: GuardStay[]
}

export function toSnapshot(state: GameState, now: number): CitySnapshot {
  return { level: state.player.level, objects: state.objects, unlockedAreas: state.unlockedAreas, guards: activeGuards(state, now) }
}

// ---------- Reading someone else's city ----------
// Snapshots are written by other players' devices, so nothing in them is trusted: every field is checked
// against the game's data files before the map draws it.

const MAX_OBJECTS = 800
const MAX_NAME = 20

type Raw = Record<string, unknown>
const isObj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v)
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isInt = (v: unknown, min: number, max: number): v is number => isNum(v) && Number.isInteger(v) && v >= min && v <= max

function parseJob(raw: unknown): ProductionJob | null {
  if (!isObj(raw) || typeof raw.recipeId !== 'string' || !RECIPES_BY_ID[raw.recipeId] || !isNum(raw.startAt) || !isNum(raw.endAt)) return null
  return { recipeId: raw.recipeId, startAt: raw.startAt, endAt: raw.endAt }
}

function parseObject(raw: unknown, i: number): PlacedObject | null {
  if (!isObj(raw) || typeof raw.defId !== 'string') return null
  const def = OBJECTS_BY_ID[raw.defId]
  if (!def || !isInt(raw.x, -64, 64) || !isInt(raw.y, -64, 64) || !isNum(raw.builtAt)) return null
  if (!areaAt(raw.x, raw.y) || !areaAt(raw.x + def.width - 1, raw.y + def.height - 1)) return null
  const obj: PlacedObject = { uid: `v${i}`, defId: def.id, x: raw.x, y: raw.y, builtAt: raw.builtAt }
  const crop = raw.crop
  if (isObj(crop) && typeof crop.cropId === 'string' && CROPS_BY_ID[crop.cropId] && isNum(crop.plantedAt) && isNum(crop.readyAt)) {
    obj.crop = { cropId: crop.cropId, plantedAt: crop.plantedAt, readyAt: crop.readyAt }
    if (isNum(crop.wateredAt)) obj.crop.wateredAt = crop.wateredAt
  }
  if (Array.isArray(raw.queue)) obj.queue = raw.queue.slice(0, 12).map(parseJob).filter((j): j is ProductionJob => !!j)
  if (isInt(raw.level, 1, 20)) obj.level = raw.level
  if (isNum(raw.hp)) obj.hp = raw.hp
  if (isNum(raw.hpAt)) obj.hpAt = raw.hpAt
  return obj
}

export function cleanName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME)
  return name || null
}

/** Turns a snapshot from the server into a read-only game state the map can draw, or null if it's unusable. */
export function parseSnapshot(raw: unknown, now: number): GameState | null {
  if (!isObj(raw) || !Array.isArray(raw.objects)) return null
  const objects = raw.objects
    .slice(0, MAX_OBJECTS)
    .map(parseObject)
    .filter((o): o is PlacedObject => !!o)
  const areas = Array.isArray(raw.unlockedAreas) ? raw.unlockedAreas.filter((a): a is string => typeof a === 'string' && !!AREAS_BY_ID[a]) : []
  const guards = (Array.isArray(raw.guards) ? raw.guards : [])
    .slice(0, GUARD.max)
    .filter((g): g is Raw => isObj(g) && isNum(g.until) && g.until > now)
    .map((g, i) => ({ id: `v${i}`, from: cleanName(g.from) ?? '', until: g.until as number }))
  return {
    version: SAVE_VERSION,
    player: { level: isInt(raw.level, 1, 999) ? raw.level : 1, xp: 0, coins: 0, gems: 0 },
    inventory: {},
    barnLevel: 0,
    objects,
    unlockedAreas: [...new Set(['home', ...areas])],
    orderSlots: [],
    nextUid: objects.length + 1,
    stats: {},
    guards,
    savedAt: now,
  }
}

export function parseLook(raw: unknown): AvatarLook | undefined {
  return isObj(raw) ? sanitizeLook(raw) : undefined
}

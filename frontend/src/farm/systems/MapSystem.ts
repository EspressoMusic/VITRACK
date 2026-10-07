import { AREAS, AREAS_BY_ID, MAP_HEIGHT, MAP_WIDTH, WORLDS, ZONES } from '../data/areas'
import { NEIGHBOR_SIZE, NEIGHBOR_SLOTS } from '../data/neighbors'
import { OBJECTS_BY_ID } from '../data/objects'
import type { AreaDef, GameState, PlacedObject, Point, Result } from '../types'
import { spend } from './EconomySystem'
import { fail, ok } from './result'

/** Tiles on the main island keep the y·width+x key (the avatar's walk grid reads it); tiles on the worlds get negative keys. */
const tileKey = (x: number, y: number) => (inBounds(x, y) ? y * MAP_WIDTH + x : -1 - ((y + 512) * 1024 + (x + 512)))

/** Whether (x, y) is on the main island's districts (where the character walks). */
export function inBounds(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT
}

export function areaAt(x: number, y: number): AreaDef | null {
  return AREAS.find(({ rect: r }) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) ?? null
}

/** The world whose island (rim included) holds tile (x, y). */
export function worldAt(x: number, y: number): AreaDef | null {
  return WORLDS.find(({ world: w }) => x >= w!.island.x && y >= w!.island.y && x < w!.island.x + w!.island.w && y < w!.island.y + w!.island.h) ?? null
}

export function isTileUnlocked(state: GameState, x: number, y: number): boolean {
  const area = areaAt(x, y)
  return !!area && state.unlockedAreas.includes(area.id)
}

/** Tiles in the wild zones that stay unbuildable even once bought: each zone's feature, and the spots where neighbor villages show up. */
const RESERVED = new Set<number>()
for (const r of [...ZONES.map((a) => a.zone!.spot), ...NEIGHBOR_SLOTS.map((s) => ({ ...s, w: NEIGHBOR_SIZE, h: NEIGHBOR_SIZE }))]) {
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) RESERVED.add(tileKey(x, y))
}

export function footprint(obj: Pick<PlacedObject, 'defId' | 'x' | 'y'>): { x: number; y: number; w: number; h: number } {
  const def = OBJECTS_BY_ID[obj.defId]
  return { x: obj.x, y: obj.y, w: def?.width ?? 1, h: def?.height ?? 1 }
}

/** Tile → uid of the object covering it. */
export function buildOccupancy(state: GameState, ignoreUid?: string): Map<number, string> {
  const map = new Map<number, string>()
  for (const obj of state.objects) {
    if (obj.uid === ignoreUid) continue
    const f = footprint(obj)
    for (let dx = 0; dx < f.w; dx++) for (let dy = 0; dy < f.h; dy++) map.set(tileKey(f.x + dx, f.y + dy), obj.uid)
  }
  return map
}

export function objectAt(state: GameState, x: number, y: number): PlacedObject | null {
  const uid = buildOccupancy(state).get(tileKey(x, y))
  return uid ? (state.objects.find((o) => o.uid === uid) ?? null) : null
}

/** Per-tile verdict for a placement preview: true = free, false = blocked. */
export function placementTiles(
  state: GameState,
  defId: string,
  x: number,
  y: number,
  ignoreUid?: string,
): { x: number; y: number; free: boolean }[] {
  const def = OBJECTS_BY_ID[defId]
  if (!def) return []
  const occupied = buildOccupancy(state, ignoreUid)
  const tiles = []
  for (let dx = 0; dx < def.width; dx++) {
    for (let dy = 0; dy < def.height; dy++) {
      const tx = x + dx
      const ty = y + dy
      const key = tileKey(tx, ty)
      const free = isTileUnlocked(state, tx, ty) && !RESERVED.has(key) && !occupied.has(key)
      tiles.push({ x: tx, y: ty, free })
    }
  }
  return tiles
}

export function canPlace(state: GameState, defId: string, x: number, y: number, ignoreUid?: string): boolean {
  const tiles = placementTiles(state, defId, x, y, ignoreUid)
  return tiles.length > 0 && tiles.every((t) => t.free)
}

/** Closest valid spot to (nearX, nearY), searched in growing rings. */
export function findFreeSpot(
  state: GameState,
  defId: string,
  nearX: number,
  nearY: number,
  ignoreUid?: string,
): { x: number; y: number } | null {
  for (let r = 0; r < Math.max(MAP_WIDTH, MAP_HEIGHT); r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
        if (canPlace(state, defId, nearX + dx, nearY + dy, ignoreUid)) return { x: nearX + dx, y: nearY + dy }
      }
    }
  }
  return null
}

export interface PointOfInterest {
  kind: 'home' | 'shop' | 'park' | 'gate'
  uid: string
  /** Tile to walk to (just outside the building). */
  tile: Point
  /** Which way to face on arrival, as a tile step (e.g. {x: 0, y: 1} = toward the gate). */
  face: Point
}

/** Places in town worth walking to: the house door, shop fronts, parks, and the inside of the gate. */
export function pointsOfInterest(state: GameState): PointOfInterest[] {
  const points: PointOfInterest[] = []
  for (const o of state.objects) {
    const def = OBJECTS_BY_ID[o.defId]
    if (!def) continue
    const { width: w, height: h } = def
    if (def.kind === 'home') points.push({ kind: 'home', uid: o.uid, tile: { x: o.x + w, y: o.y + Math.floor(h / 2) }, face: { x: -1, y: 0 } })
    else if (def.look.type === 'shop' || def.look.type === 'market') points.push({ kind: 'shop', uid: o.uid, tile: { x: o.x + Math.floor(w / 2), y: o.y + h }, face: { x: 0, y: -1 } })
    else if (['park', 'playground', 'pitch', 'pool'].includes(def.look.type)) points.push({ kind: 'park', uid: o.uid, tile: { x: o.x + w, y: o.y + h - 1 }, face: { x: -1, y: 0 } })
    else if (def.kind === 'gate') points.push({ kind: 'gate', uid: o.uid, tile: { x: o.x + 1, y: o.y - 2 }, face: { x: 0, y: 1 } })
  }
  return points.filter((p) => inBounds(p.tile.x, p.tile.y) && isTileUnlocked(state, p.tile.x, p.tile.y))
}

export function canUnlockArea(state: GameState, area: AreaDef): boolean {
  return state.player.level >= area.requiredLevel && state.player.coins >= area.cost
}

export function unlockArea(state: GameState, areaId: string): Result {
  const area = AREAS_BY_ID[areaId]
  if (!area || state.unlockedAreas.includes(areaId)) return fail('blocked')
  if (state.player.level < area.requiredLevel) return fail('levelLow')
  const paid = spend(state, area.cost)
  if (!paid) return fail('noCoins')
  return ok({ ...paid, unlockedAreas: [...paid.unlockedAreas, areaId] })
}

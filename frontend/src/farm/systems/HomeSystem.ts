import { FURNITURE_BY_ID, ROOM_STYLES_BY_ID, starterInterior } from '../data/furniture'
import { OBJECTS_BY_ID } from '../data/objects'
import type { GameState, HomeInterior, PlacedFurniture, PlacedObject, Result } from '../types'
import { spend } from './EconomySystem'
import { addXp } from './LevelSystem'
import { fail, findObject, ok, updateObject } from './result'

export type FurniturePose = Pick<PlacedFurniture, 'defId' | 'x' | 'y' | 'turned'>

export function interiorOf(obj: PlacedObject): HomeInterior {
  return obj.interior ?? starterInterior()
}

export function roomSize(obj: PlacedObject): { w: number; h: number } {
  return OBJECTS_BY_ID[obj.defId]?.home?.interior ?? { w: 6, h: 6 }
}

/** The tiles a piece covers in the room. */
export function furnitureFootprint(p: FurniturePose): { x: number; y: number; w: number; h: number } {
  const def = FURNITURE_BY_ID[p.defId]
  const w = def?.width ?? 1
  const h = def?.height ?? 1
  return { x: p.x, y: p.y, w: p.turned ? h : w, h: p.turned ? w : h }
}

/** Fits inside the room without overlapping other pieces. Flat pieces (rugs) only clash with other flat ones. */
export function canPlaceFurniture(room: { w: number; h: number }, interior: HomeInterior, pose: FurniturePose, ignoreId?: string): boolean {
  const def = FURNITURE_BY_ID[pose.defId]
  if (!def) return false
  const a = furnitureFootprint(pose)
  if (a.x < 0 || a.y < 0 || a.x + a.w > room.w || a.y + a.h > room.h) return false
  return interior.furniture.every((other) => {
    if (other.id === ignoreId || !!FURNITURE_BY_ID[other.defId]?.flat !== !!def.flat) return true
    const b = furnitureFootprint(other)
    return a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y
  })
}

function withHome(state: GameState, homeUid: string): { obj: PlacedObject; interior: HomeInterior; room: { w: number; h: number } } | null {
  const obj = findObject(state, homeUid)
  if (!obj || !OBJECTS_BY_ID[obj.defId]?.home) return null
  return { obj, interior: interiorOf(obj), room: roomSize(obj) }
}

const setInterior = (state: GameState, homeUid: string, interior: HomeInterior) => updateObject(state, homeUid, (o) => ({ ...o, interior }))

/** Puts a piece in the room: free when one is waiting in storage, otherwise bought. */
export function placeFurniture(state: GameState, homeUid: string, pose: FurniturePose): Result {
  const home = withHome(state, homeUid)
  const def = FURNITURE_BY_ID[pose.defId]
  if (!home || !def) return fail('blocked')
  if (state.player.level < def.requiredLevel) return fail('levelLow')
  if (!canPlaceFurniture(home.room, home.interior, pose)) return fail('blocked')
  const inStorage = home.interior.stored[def.id] ?? 0
  const paid = inStorage > 0 ? state : spend(state, def.cost)
  if (!paid) return fail('noCoins')
  const piece: PlacedFurniture = { id: `f${home.interior.nextId}`, defId: def.id, x: pose.x, y: pose.y, ...(pose.turned ? { turned: true } : {}) }
  const interior: HomeInterior = {
    ...home.interior,
    furniture: [...home.interior.furniture, piece],
    stored: inStorage > 0 ? { ...home.interior.stored, [def.id]: inStorage - 1 } : home.interior.stored,
    nextId: home.interior.nextId + 1,
  }
  const xp = inStorage > 0 ? 0 : def.xpReward
  return ok(addXp(setInterior(paid, homeUid, interior), xp), xp > 0 ? [{ kind: 'xp', amount: xp }] : [])
}

export function moveFurniture(state: GameState, homeUid: string, pieceId: string, x: number, y: number, turned: boolean): Result {
  const home = withHome(state, homeUid)
  const piece = home?.interior.furniture.find((f) => f.id === pieceId)
  if (!home || !piece) return fail('blocked')
  const moved: PlacedFurniture = { id: piece.id, defId: piece.defId, x, y, ...(turned ? { turned: true } : {}) }
  if (!canPlaceFurniture(home.room, home.interior, moved, pieceId)) return fail('blocked')
  return ok(setInterior(state, homeUid, { ...home.interior, furniture: home.interior.furniture.map((f) => (f.id === pieceId ? moved : f)) }))
}

/** Takes a piece out of the room into storage, to place again later for free. */
export function storeFurniture(state: GameState, homeUid: string, pieceId: string): Result {
  const home = withHome(state, homeUid)
  const piece = home?.interior.furniture.find((f) => f.id === pieceId)
  if (!home || !piece) return fail('blocked')
  return ok(
    setInterior(state, homeUid, {
      ...home.interior,
      furniture: home.interior.furniture.filter((f) => f.id !== pieceId),
      stored: { ...home.interior.stored, [piece.defId]: (home.interior.stored[piece.defId] ?? 0) + 1 },
    }),
  )
}

export function ownsRoomStyle(interior: HomeInterior, styleId: string): boolean {
  return (ROOM_STYLES_BY_ID[styleId]?.cost ?? 1) === 0 || interior.styles.includes(styleId)
}

/** Switches the wallpaper or floor, buying it the first time. */
export function applyRoomStyle(state: GameState, homeUid: string, styleId: string): Result {
  const home = withHome(state, homeUid)
  const style = ROOM_STYLES_BY_ID[styleId]
  if (!home || !style) return fail('blocked')
  if (state.player.level < style.requiredLevel) return fail('levelLow')
  const owned = ownsRoomStyle(home.interior, styleId)
  const paid = owned ? state : spend(state, style.cost)
  if (!paid) return fail('noCoins')
  return ok(
    setInterior(paid, homeUid, {
      ...home.interior,
      [style.kind]: styleId,
      styles: owned ? home.interior.styles : [...home.interior.styles, styleId],
    }),
  )
}

import { CROPS_BY_ID } from '../data/crops'
import { OBJECTS_BY_ID } from '../data/objects'
import { SAVE_VERSION, START_COINS } from '../data/config'
import { GATE_TILE, HOME_TILE } from '../data/areas'
import type { GameState, PlacedObject } from '../types'
import { newObject } from './BuildingSystem'
import { findFreeSpot } from './MapSystem'
import { refillOrders } from './OrderSystem'

const STORAGE_KEY = 'vitrack-farm-save'

/** Where the food calendar board stands in a new town. */
const CALENDAR_BOARD_TILE = { x: 23, y: 15 }

/** Starting town: the gate in the front wall, two crossing streets, the main character's house, a grocery,
 *  a small park, the food calendar board, and the farm basics (six garden beds — two with wheat ready to pick). */
export function createInitialState(now: number): GameState {
  let state: GameState = {
    version: SAVE_VERSION,
    player: { level: 1, xp: 0, coins: START_COINS, gems: 0 },
    inventory: { wheat: 2 },
    barnLevel: 0,
    objects: [],
    unlockedAreas: ['home'],
    orderSlots: [],
    nextUid: 1,
    stats: {},
    guards: [],
    savedAt: now,
  }
  // Starting buildings are already standing (no construction timer).
  const place = (defId: string, x: number, y: number) => {
    state = newObject(state, defId, x, y, now - 1 - OBJECTS_BY_ID[defId].buildTime * 1000).state
  }
  place('cityGate', GATE_TILE.x, GATE_TILE.y)
  // Main street from the gate into town and a cross street, meeting at the player's home in the middle.
  const underHome = (x: number, y: number) => x >= HOME_TILE.x && x < HOME_TILE.x + 2 && y >= HOME_TILE.y && y < HOME_TILE.y + 2
  for (let y = 13; y <= 22; y++) if (!underHome(18, y)) place('pavedPath', 18, y)
  for (let x = 12; x <= 23; x++) if (x !== 18 && !underHome(x, 17)) place('pavedPath', x, 17)
  place('pavedPath', 19, 18)
  place('starterHouse', HOME_TILE.x, HOME_TILE.y)
  place('bench', 16, 19)
  place('grocery', 19, 15)
  place('park', 20, 19)
  place('calendarBoard', CALENDAR_BOARD_TILE.x, CALENDAR_BOARD_TILE.y)
  for (const [x, y] of [[13, 13], [14, 13], [15, 13], [13, 14], [14, 14], [15, 14]]) place('field', x, y)
  place('oakTree', 12, 12)
  place('pineTree', 12, 16)
  place('oakTree', 23, 21)
  place('pineTree', 12, 22)
  place('oakTree', 14, 20)
  place('bush', 22, 18)
  place('lamp', 19, 22)

  const wheat = CROPS_BY_ID.wheat.growTime * 1000
  const fields = state.objects.filter((o) => o.defId === 'field')
  const seeded = [now - wheat, now - wheat, now - wheat * 0.5, now - wheat * 0.2]
  state = {
    ...state,
    objects: state.objects.map((o) => {
      const i = fields.indexOf(o)
      return i >= 0 && i < seeded.length ? { ...o, crop: { cropId: 'wheat', plantedAt: seeded[i], readyAt: seeded[i] + wheat } } : o
    }),
  }
  return refillOrders(state, now)
}

/** v1 was a farm whose starting land was the back district (0..11). The town now starts at the front
 *  (12..23), so the two swap places; then the gate and the new starter buildings are added. */
function migrateV1(save: GameState, now: number): GameState {
  const inBox = (o: PlacedObject, x0: number, y0: number) => o.x >= x0 && o.x < x0 + 12 && o.y >= y0 && o.y < y0 + 12
  let state: GameState = {
    ...save,
    version: 2,
    objects: save.objects.map((o) =>
      inBox(o, 0, 0) ? { ...o, x: o.x + 12, y: o.y + 12 } : inBox(o, 12, 12) ? { ...o, x: o.x - 12, y: o.y - 12 } : o,
    ),
  }
  // The gate's spot is fixed: anything standing there moves aside.
  const gateDef = OBJECTS_BY_ID.cityGate
  const underGate = (o: PlacedObject) => {
    const def = OBJECTS_BY_ID[o.defId]
    return o.x < GATE_TILE.x + gateDef.width && o.x + def.width > GATE_TILE.x && o.y < GATE_TILE.y + gateDef.height && o.y + def.height > GATE_TILE.y
  }
  const displaced = state.objects.filter(underGate)
  state = newObject({ ...state, objects: state.objects.filter((o) => !underGate(o)) }, 'cityGate', GATE_TILE.x, GATE_TILE.y, now - 1).state
  for (const o of displaced) {
    const spot = findFreeSpot(state, o.defId, o.x, o.y - 2)
    if (spot) state = { ...state, objects: [...state.objects, { ...o, ...spot }] }
  }
  for (const [defId, x, y] of [['starterHouse', 16, 19], ['grocery', 19, 15], ['park', 20, 19]] as const) {
    const spot = findFreeSpot(state, defId, x, y)
    if (spot) state = newObject(state, defId, spot.x, spot.y, now - 1 - OBJECTS_BY_ID[defId].buildTime * 1000).state
  }
  return state
}

/** v3 moved the player's home to the middle of town. Older saves move it there too, but only when
 *  nothing other than street tiles stands in the way (those make room). */
function migrateV2(save: GameState): GameState {
  const home = save.objects.find((o) => OBJECTS_BY_ID[o.defId]?.kind === 'home')
  const moved = { ...save, version: 3 }
  if (!home) return moved
  const { width: w, height: h } = OBJECTS_BY_ID[home.defId]
  const { x, y } = HOME_TILE
  const inTheWay = save.objects.filter((o) => {
    const def = OBJECTS_BY_ID[o.defId]
    return o !== home && o.x < x + w && o.x + def.width > x && o.y < y + h && o.y + def.height > y
  })
  if (inTheWay.some((o) => OBJECTS_BY_ID[o.defId].look.type !== 'path')) return moved
  return { ...moved, objects: save.objects.filter((o) => !inTheWay.includes(o)).map((o) => (o === home ? { ...o, x, y } : o)) }
}

/** v4 brought back the board (now the food calendar). Older saves get it at its usual spot, or the nearest free one. */
function migrateV3(save: GameState, now: number): GameState {
  const state = { ...save, version: 4 }
  if (state.objects.some((o) => o.defId === 'calendarBoard')) return state
  const spot = findFreeSpot(state, 'calendarBoard', CALENDAR_BOARD_TILE.x, CALENDAR_BOARD_TILE.y)
  return spot ? newObject(state, 'calendarBoard', spot.x, spot.y, now - 1).state : state
}

/** Plain JSON — the same shape can later be stored in Supabase/Firebase instead of localStorage. */
export function serialize(state: GameState): string {
  return JSON.stringify({ ...state, savedAt: Date.now() })
}

/** Parses a save and drops anything the current data files no longer know about. */
export function deserialize(raw: string): GameState | null {
  try {
    let parsed = JSON.parse(raw) as GameState
    if (!parsed || !parsed.player || !Array.isArray(parsed.objects)) return null
    parsed = { ...parsed, objects: parsed.objects.filter((o) => OBJECTS_BY_ID[o.defId]) }
    if (parsed.version === 1) parsed = migrateV1(parsed, Date.now())
    if (parsed.version === 2) parsed = migrateV2(parsed)
    if (parsed.version === 3) parsed = migrateV3(parsed, Date.now())
    if (parsed.version !== SAVE_VERSION) return null
    return {
      ...parsed,
      inventory: parsed.inventory ?? {},
      barnLevel: parsed.barnLevel ?? 0,
      unlockedAreas: parsed.unlockedAreas?.length ? parsed.unlockedAreas : ['home'],
      orderSlots: parsed.orderSlots ?? [],
      stats: parsed.stats ?? {},
      guards: Array.isArray(parsed.guards) ? parsed.guards : [],
      objects: parsed.objects.map((o) => (o.crop && !CROPS_BY_ID[o.crop.cropId] ? { ...o, crop: null } : o)),
    }
  } catch {
    return null
  }
}

/** Timers are stored as absolute timestamps, so anything that finished while the app was closed
 *  (crops, production, construction) is simply "ready" on load — no catch-up loop needed. */
export function loadGame(now: number): GameState {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    // storage unavailable (private mode) — start fresh, in memory only
  }
  const loaded = raw ? deserialize(raw) : null
  return refillOrders(loaded ?? createInitialState(now), now)
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state))
  } catch {
    // quota / private mode — the game keeps running from memory
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

import type { FarmError, GameState, Gain, PlacedObject, Result } from '../types'

export const ok = (state: GameState, gains: Gain[] = []): Result => ({ ok: true, state, gains })
export const fail = (error: FarmError): Result => ({ ok: false, error })

export function findObject(state: GameState, uid: string): PlacedObject | undefined {
  return state.objects.find((o) => o.uid === uid)
}

export function updateObject(state: GameState, uid: string, patch: (o: PlacedObject) => PlacedObject): GameState {
  return { ...state, objects: state.objects.map((o) => (o.uid === uid ? patch(o) : o)) }
}

export function bumpStat(state: GameState, key: string, by = 1): GameState {
  return { ...state, stats: { ...state.stats, [key]: (state.stats[key] ?? 0) + by } }
}

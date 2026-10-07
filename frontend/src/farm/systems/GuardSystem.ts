import { GUARD } from '../data/guards'
import type { GameState, GuardStay } from '../types'

/** Guards still on duty, in the order they stand at the gate. */
export function activeGuards(state: GameState, now: number): GuardStay[] {
  return state.guards.filter((g) => g.until > now)
}

/** New guards arrived from other players. When every spot is taken, the guard leaving soonest is swapped for the new one. */
export function addGuards(state: GameState, gifts: { id: string; from: string }[], now: number): GameState {
  let list = activeGuards(state, now)
  for (const gift of gifts) {
    if (list.some((g) => g.id === gift.id)) continue
    const stay: GuardStay = { id: gift.id, from: gift.from, until: now + GUARD.stayHours * 3600 * 1000 }
    if (list.length < GUARD.max) {
      list = [...list, stay]
    } else {
      const leaving = list.reduce((a, b) => (a.until <= b.until ? a : b))
      list = list.map((g) => (g === leaving ? stay : g))
    }
  }
  return { ...state, guards: list }
}

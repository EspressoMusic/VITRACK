import type { GameState } from '../types'

export type Currency = 'coins' | 'gems'

export function balance(state: GameState, currency: Currency = 'coins'): number {
  return state.player[currency]
}

export function canAfford(state: GameState, amount: number, currency: Currency = 'coins'): boolean {
  return state.player[currency] >= amount
}

/** Returns null when the player can't afford it. */
export function spend(state: GameState, amount: number, currency: Currency = 'coins'): GameState | null {
  if (!canAfford(state, amount, currency)) return null
  return { ...state, player: { ...state.player, [currency]: state.player[currency] - amount } }
}

export function earn(state: GameState, amount: number, currency: Currency = 'coins'): GameState {
  if (amount <= 0) return state
  return { ...state, player: { ...state.player, [currency]: state.player[currency] + amount } }
}

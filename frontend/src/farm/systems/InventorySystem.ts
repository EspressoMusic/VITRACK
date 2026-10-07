import { BARN_BASE_CAPACITY, BARN_CAPACITY_STEP, barnUpgradeCost } from '../data/config'
import { ITEMS_BY_ID } from '../data/items'
import type { GameState, ItemId, OrderLine, Result } from '../types'
import { earn, spend } from './EconomySystem'
import { addXp } from './LevelSystem'
import { bumpStat, fail, ok } from './result'

export function barnCapacity(state: GameState): number {
  return BARN_BASE_CAPACITY + state.barnLevel * BARN_CAPACITY_STEP
}

export function barnUsed(state: GameState): number {
  return Object.values(state.inventory).reduce((sum, n) => sum + n, 0)
}

export function itemCount(state: GameState, item: ItemId): number {
  return state.inventory[item] ?? 0
}

export function hasItems(state: GameState, lines: OrderLine[]): boolean {
  return lines.every((l) => itemCount(state, l.item) >= l.qty)
}

export function canStore(state: GameState, qty: number): boolean {
  return barnUsed(state) + qty <= barnCapacity(state)
}

/** Returns null when the barn (or the item's stack) has no room. */
export function addItem(state: GameState, item: ItemId, qty: number): GameState | null {
  const def = ITEMS_BY_ID[item]
  if (!def || !canStore(state, qty) || itemCount(state, item) + qty > def.maxStack) return null
  return { ...state, inventory: { ...state.inventory, [item]: itemCount(state, item) + qty } }
}

/** Returns null when something is missing. */
export function removeItems(state: GameState, lines: OrderLine[]): GameState | null {
  if (!hasItems(state, lines)) return null
  const inventory = { ...state.inventory }
  for (const { item, qty } of lines) {
    inventory[item] -= qty
    if (inventory[item] <= 0) delete inventory[item]
  }
  return { ...state, inventory }
}

export function sellItem(state: GameState, item: ItemId, qty: number): Result {
  const def = ITEMS_BY_ID[item]
  const removed = def && qty > 0 ? removeItems(state, [{ item, qty }]) : null
  if (!removed) return fail('missingItems')
  const coins = def.sellValue * qty
  const xp = Math.max(1, Math.floor(qty / 5))
  const next = bumpStat(addXp(earn(removed, coins), xp), 'sold', qty)
  return ok(next, [
    { kind: 'coins', amount: coins },
    { kind: 'xp', amount: xp },
  ])
}

export function upgradeBarn(state: GameState): Result {
  const paid = spend(state, barnUpgradeCost(state.barnLevel))
  if (!paid) return fail('noCoins')
  return ok({ ...paid, barnLevel: paid.barnLevel + 1 })
}

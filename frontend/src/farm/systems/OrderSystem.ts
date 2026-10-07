import {
  NPCS,
  ORDER_COIN_BONUS,
  ORDER_REFILL_AFTER_COMPLETE,
  ORDER_REFILL_AFTER_DISCARD,
  ORDER_SLOT_COUNT,
} from '../data/config'
import { CROPS } from '../data/crops'
import { ITEMS_BY_ID } from '../data/items'
import { RECIPES } from '../data/recipes'
import type { GameState, Order, OrderLine, Result } from '../types'
import { earn } from './EconomySystem'
import { removeItems } from './InventorySystem'
import { addXp } from './LevelSystem'
import { bumpStat, fail, ok } from './result'

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

/** Items the player can actually make right now: unlocked crops plus products of buildings they own. */
function orderableItems(state: GameState): { item: string; crafted: boolean }[] {
  const level = state.player.level
  const owned = new Set(state.objects.map((o) => o.defId))
  const crops = CROPS.filter((c) => c.requiredLevel <= level).map((c) => ({ item: c.id, crafted: false }))
  const products = RECIPES.filter((r) => r.requiredLevel <= level && owned.has(r.buildingId)).map((r) => ({
    item: r.output,
    crafted: true,
  }))
  return [...crops, ...products]
}

export function generateOrder(state: GameState): Order {
  const pool = [...orderableItems(state)].sort(() => Math.random() - 0.5)
  const lineCount = Math.min(pool.length, randInt(1, state.player.level >= 3 ? 3 : 2))
  const lines: OrderLine[] = pool.slice(0, lineCount).map(({ item, crafted }) => ({
    item,
    qty: crafted ? randInt(1, 2) : randInt(2, Math.min(6, 2 + state.player.level)),
  }))
  const value = lines.reduce((sum, l) => sum + ITEMS_BY_ID[l.item].sellValue * l.qty, 0)
  const xp = lines.reduce((sum, l) => sum + ITEMS_BY_ID[l.item].xpValue * l.qty, 0)
  return {
    id: `ord${Date.now().toString(36)}${randInt(0, 9999)}`,
    npc: randInt(0, NPCS.length - 1),
    lines,
    coins: Math.round(value * ORDER_COIN_BONUS),
    xp: Math.max(2, Math.round(xp * 1.2)),
  }
}

/** Fills empty order slots whose wait is over. Returns the same object when nothing changed. */
export function refillOrders(state: GameState, now: number): GameState {
  let slots = state.orderSlots
  if (slots.length < ORDER_SLOT_COUNT) {
    slots = [...slots, ...Array.from({ length: ORDER_SLOT_COUNT - slots.length }, () => ({ order: null, refillAt: now }))]
  }
  if (slots === state.orderSlots && !slots.some((s) => !s.order && now >= s.refillAt)) return state
  return {
    ...state,
    orderSlots: slots.map((s) => (!s.order && now >= s.refillAt ? { order: generateOrder(state), refillAt: 0 } : s)),
  }
}

export function completeOrder(state: GameState, slotIndex: number, now: number): Result {
  const order = state.orderSlots[slotIndex]?.order
  if (!order) return fail('blocked')
  const paid = removeItems(state, order.lines)
  if (!paid) return fail('missingItems')
  const rewarded = bumpStat(addXp(earn(paid, order.coins), order.xp), 'ordersCompleted')
  const orderSlots = rewarded.orderSlots.map((s, i) =>
    i === slotIndex ? { order: null, refillAt: now + ORDER_REFILL_AFTER_COMPLETE * 1000 } : s,
  )
  return ok({ ...rewarded, orderSlots }, [
    { kind: 'coins', amount: order.coins },
    { kind: 'xp', amount: order.xp },
  ])
}

export function discardOrder(state: GameState, slotIndex: number, now: number): Result {
  if (!state.orderSlots[slotIndex]?.order) return fail('blocked')
  const orderSlots = state.orderSlots.map((s, i) =>
    i === slotIndex ? { order: null, refillAt: now + ORDER_REFILL_AFTER_DISCARD * 1000 } : s,
  )
  return ok({ ...state, orderSlots })
}

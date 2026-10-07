import { GATE_LEVELS, GATE_REPAIR_COST_PER_HP, GERM } from '../data/city'
import { GERMS_BY_ID, germStatKey } from '../data/germs'
import { OBJECTS_BY_ID } from '../data/objects'
import type { GameState, PlacedObject, Result } from '../types'
import { objectLevel, upgradeObject } from './BuildingSystem'
import { earn, spend } from './EconomySystem'
import { bumpStat, fail, ok, updateObject } from './result'

/** The city gate's health. It slowly heals on its own (also while the app is closed);
 *  germs at the gate chip away at it. City Health / City Defense can grow out of this later. */

export function findGate(state: GameState): PlacedObject | null {
  return state.objects.find((o) => OBJECTS_BY_ID[o.defId]?.kind === 'gate') ?? null
}

export function gateStats(gate: PlacedObject) {
  return GATE_LEVELS[Math.min(GATE_LEVELS.length, objectLevel(gate)) - 1]
}

/** Current health, including what it regenerated since the last hit. */
export function gateHp(gate: PlacedObject, now: number): number {
  const { maxHp, regen } = gateStats(gate)
  if (gate.hp === undefined) return maxHp
  const healed = gate.hp + (regen * Math.max(0, now - (gate.hpAt ?? now))) / 1000
  return Math.min(maxHp, healed)
}

export function isGateBroken(gate: PlacedObject, now: number): boolean {
  return gateHp(gate, now) < 1
}

/** How much a germ's bite hurts: defense blocks part of it (unless the germ pierces it), but every bite does at least 1. */
export function biteDamage(gate: PlacedObject, attack: number, pierce = false): number {
  return pierce ? attack : Math.max(1, attack - gateStats(gate).defense)
}

/** How hard the gate's zap hits a germ with this much armor. */
export function zapDamage(gate: PlacedObject, armor: number): number {
  return Math.max(1, gateStats(gate).power - armor)
}

export function damageGate(state: GameState, amount: number, now: number): GameState {
  const gate = findGate(state)
  if (!gate) return state
  const hp = Math.max(0, gateHp(gate, now) - amount)
  return updateObject(state, gate.uid, (o) => ({ ...o, hp, hpAt: now }))
}

/** Coins a stopped germ pays: tough ones pay for every tap they'd take by hand, a Flu Bug's little ones a bit. */
export function germCoins(germId: string, mini: boolean): number {
  return mini ? GERM.miniCoins : GERM.killCoins * (GERMS_BY_ID[germId]?.taps ?? 1)
}

/** A germ was stopped — by a tap, the gate, a guard or a stone — and pays out. */
export function germStopped(state: GameState, germId: string, mini: boolean): Result {
  const coins = germCoins(germId, mini)
  const counted = bumpStat(bumpStat(state, 'germsStopped'), germStatKey(germId))
  return ok(earn(counted, coins), [{ kind: 'coins', amount: coins }])
}

export function repairCost(gate: PlacedObject, now: number): number {
  const missing = gateStats(gate).maxHp - gateHp(gate, now)
  return missing < 1 ? 0 : Math.max(1, Math.ceil(missing * GATE_REPAIR_COST_PER_HP))
}

export function repairGate(state: GameState, now: number): Result {
  const gate = findGate(state)
  if (!gate) return fail('blocked')
  const cost = repairCost(gate, now)
  if (cost === 0) return fail('blocked')
  const paid = spend(state, cost)
  if (!paid) return fail('noCoins')
  return ok(updateObject(paid, gate.uid, (o) => ({ ...o, hp: gateStats(o).maxHp, hpAt: now })))
}

/** Upgrading uses the normal building upgrade; the gate keeps its damage but gains the extra max health. */
export function upgradeGate(state: GameState, now: number): Result {
  const gate = findGate(state)
  if (!gate) return fail('blocked')
  const before = gateHp(gate, now)
  const oldMax = gateStats(gate).maxHp
  const result = upgradeObject(state, gate.uid)
  if (!result.ok) return result
  const next = updateObject(result.state, gate.uid, (o) => ({ ...o, hp: before + gateStats(o).maxHp - oldMax, hpAt: now }))
  return ok(next, result.gains)
}

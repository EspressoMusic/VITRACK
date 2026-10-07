import { AD_REWARD_COINS, ADS_PER_DAY } from '../data/config'
import type { GameState, Result } from '../types'
import { earn } from './EconomySystem'
import { fail, ok } from './result'

const DAY_KEY = 'adDay'
const COUNT_KEY = 'adCount'

/** Local calendar day as a number (20261006), so the daily limit resets at the player's midnight. */
function dayNumber(now: number): number {
  const d = new Date(now)
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

export function adsWatchedToday(state: GameState, now: number): number {
  return state.stats[DAY_KEY] === dayNumber(now) ? (state.stats[COUNT_KEY] ?? 0) : 0
}

export function adsLeftToday(state: GameState, now: number): number {
  return Math.max(0, ADS_PER_DAY - adsWatchedToday(state, now))
}

/** Pays out one watched ad. */
export function claimAdReward(state: GameState, now: number): Result {
  if (adsLeftToday(state, now) <= 0) return fail('limit')
  const watched = adsWatchedToday(state, now) + 1
  const next = { ...state, stats: { ...state.stats, [DAY_KEY]: dayNumber(now), [COUNT_KEY]: watched } }
  return ok(earn(next, AD_REWARD_COINS), [{ kind: 'coins', amount: AD_REWARD_COINS }])
}

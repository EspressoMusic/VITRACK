import type { Point } from '../types'

/** Guards are sent by other players: each one stands at the gate for a while and zaps germs that come close. */
export const GUARD = {
  /** Most guards a city can have at its gate at once. */
  max: 3,
  /** How long one guard stays, in hours. */
  stayHours: 8,
  /** Zap strength (a germ's armor blocks part of it, like the gate's zap). */
  power: 2,
  /** Seconds between two zaps. */
  every: 1.8,
  /** How far a guard reaches, in tiles. */
  range: 3.4,
  /** How many guards one player can send in a day — must match send_guard() in supabase/schema.sql. */
  sendsPerDay: 5,
  /** XP for sending a guard to someone. */
  sendXp: 10,
}

/** Where guards stand (tile coordinates): just outside the gate, on both sides of the germs' road. */
export const GUARD_SPOTS: Point[] = [
  { x: 16.4, y: 24.5 },
  { x: 20.6, y: 24.6 },
  { x: 20.9, y: 25.6 },
]

/** Outside decoration (dead trees, rocks) stays off these spots so it never hides a guard. */
export function nearGuardSpot(x: number, y: number): boolean {
  return GUARD_SPOTS.some((s) => Math.hypot(x - s.x, y - s.y) < 1)
}

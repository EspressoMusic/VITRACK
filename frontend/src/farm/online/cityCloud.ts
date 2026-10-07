import { type AvatarLook, getAvatarLook } from '../../avatar/look'
import { supabase } from '../../lib/supabase'
import { getGameState, onGameChange } from '../store/gameStore'
import type { GameState } from '../types'
import { cleanName, parseLook, parseSnapshot, toSnapshot } from './snapshot'

/** Online cities: every player's map is published (see city_snapshots in supabase/schema.sql) so others can visit it,
 *  and visitors can send a guard to help at the gate (guard_gifts, send_guard(), claim_guards()). */

export interface CityCard {
  userId: string
  /** Null until the player names their city — show `cityCode` instead. */
  name: string | null
  level: number
}

export interface VisitedCity extends CityCard {
  state: GameState
  look?: AvatarLook
}

export interface GuardGift {
  id: string
  fromUser: string
  fromName: string | null
}

export type SendResult = 'sent' | 'already' | 'limit' | 'blocked' | 'offline'

export const onlineAvailable = !!supabase

/** A stable 4-digit number for cities that have no name yet ("City #4821"). */
export function cityCode(userId: string): number {
  return (parseInt(userId.replace(/-/g, '').slice(0, 6), 16) % 9000) + 1000
}

export async function myUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

// ---------- Publishing this player's city ----------

const PUBLISH_EVERY_MS = 30_000
let lastPublished = ''
let publishTimer: ReturnType<typeof setTimeout> | undefined

async function publishNow(name?: string): Promise<boolean> {
  clearTimeout(publishTimer)
  publishTimer = undefined
  const id = await myUserId()
  if (!id || !supabase) return false
  const city = toSnapshot(getGameState(), Date.now())
  const look = getAvatarLook()
  const body = JSON.stringify([city, look])
  if (body === lastPublished && name === undefined) return true
  const row = { user_id: id, level: city.level, city, look, updated_at: new Date().toISOString(), ...(name !== undefined && { name }) }
  const { error } = await supabase.from('city_snapshots').upsert(row)
  if (error) {
    console.error('Failed to publish city:', error)
    return false
  }
  lastPublished = body
  return true
}

/** Keeps this player's city visible to others: published right away, then at most every 30 s while it changes. */
export function startCitySync(): () => void {
  if (!supabase) return () => {}
  void publishNow()
  const off = onGameChange(() => {
    publishTimer ??= setTimeout(() => void publishNow(), PUBLISH_EVERY_MS)
  })
  const onHide = () => {
    if (document.visibilityState === 'hidden' && publishTimer !== undefined) void publishNow()
  }
  document.addEventListener('visibilitychange', onHide)
  return () => {
    off()
    document.removeEventListener('visibilitychange', onHide)
    if (publishTimer !== undefined) void publishNow()
  }
}

export async function renameCity(name: string): Promise<boolean> {
  const clean = cleanName(name)
  return clean ? publishNow(clean) : false
}

export async function fetchMyCityName(): Promise<string | null> {
  const id = await myUserId()
  if (!id || !supabase) return null
  const { data } = await supabase.from('city_snapshots').select('name').eq('user_id', id).maybeSingle()
  return cleanName(data?.name)
}

// ---------- Visiting ----------

/** Recently active cities (not the player's own), or null when offline. */
export async function listCities(): Promise<CityCard[] | null> {
  if (!supabase) return null
  const id = await myUserId()
  let query = supabase.from('city_snapshots').select('user_id, name, level').order('updated_at', { ascending: false }).limit(40)
  if (id) query = query.neq('user_id', id)
  const { data, error } = await query
  if (error || !data) return null
  return data.map((r) => ({ userId: String(r.user_id), name: cleanName(r.name), level: Number(r.level) || 1 }))
}

export async function fetchCity(userId: string): Promise<VisitedCity | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('city_snapshots').select('user_id, name, level, city, look').eq('user_id', userId).maybeSingle()
  if (error || !data) return null
  const state = parseSnapshot(data.city, Date.now())
  if (!state) return null
  return { userId, name: cleanName(data.name), level: state.player.level, state, look: parseLook(data.look) }
}

// ---------- Guards ----------

/** The server's day (UTC) — the once-a-day limit counts by it. */
const todayUtc = () => new Date().toISOString().slice(0, 10)

/** Cities this player already sent a guard to today. */
export async function fetchSentToday(): Promise<Set<string>> {
  const id = await myUserId()
  if (!id || !supabase) return new Set()
  const { data } = await supabase.from('guard_gifts').select('to_user').eq('from_user', id).eq('sent_on', todayUtc())
  return new Set((data ?? []).map((r) => String(r.to_user)))
}

export async function sendGuard(toUser: string): Promise<SendResult> {
  if (!supabase) return 'offline'
  const { data, error } = await supabase.rpc('send_guard', { p_to: toUser })
  if (error) {
    console.error('Failed to send guard:', error)
    return 'offline'
  }
  return data === 'sent' || data === 'already' || data === 'limit' ? data : 'blocked'
}

/** Guards other players sent since the last check (each one is handed out only once). */
export async function claimGuards(): Promise<GuardGift[]> {
  if (!supabase || !(await myUserId())) return []
  const { data, error } = await supabase.rpc('claim_guards')
  if (error || !Array.isArray(data)) return []
  return data.map((r) => ({ id: String(r.id), fromUser: String(r.from_user), fromName: cleanName(r.from_name) }))
}

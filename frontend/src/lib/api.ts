import type { FunctionsHttpError } from '@supabase/supabase-js'
import type { IdentifiedFood, MacroAmounts, NutrientAmounts } from '../types'
import { supabase } from './supabase'

export interface AnalyzeResult {
  foods: IdentifiedFood[]
  nutrients: NutrientAmounts
  macros: MacroAmounts
  confidence: 'low' | 'medium' | 'high'
  isJunkFood?: boolean
  note?: string
}

export class AnalyzeError extends Error {}

/** Result of the lightweight "what food is this?" vision call — identification only, no nutrients. */
export interface FoodIdentification {
  /** Lowercase canonical food name, e.g. "banana". Empty string if no food was recognized. */
  food: string
  /** Human-readable capitalized name, e.g. "Banana". */
  displayName: string
  emoji: string
  confidence: number
  /** Other plausible names for the same item, most likely first. */
  alternatives: string[]
}

// In local dev always hit the local Express backend (kept in parity with the Supabase functions) so
// testing exercises the code actually being edited, instead of the last-deployed edge function.
// In production these are paid endpoints gated by the caller's Supabase session (see
// supabase/functions/_shared/subscription.ts), so they must go through supabase-js's
// `functions.invoke`, which attaches the signed-in user's access token automatically —
// a plain fetch() would call the function with no proof of who's asking.
const useSupabase = !import.meta.env.DEV && !!supabase

async function invokeEdgeFunction<T>(name: 'analyze' | 'identify-food' | 'nutrition-chat', body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.functions.invoke<T & { error?: string }>(name, { body })
  if (error) {
    const httpError = error as FunctionsHttpError
    const payload = await httpError.context?.json?.().catch(() => null)
    throw new AnalyzeError(payload?.error || error.message || 'Request failed.')
  }
  return data as T
}

// A dev-server hiccup (backend mid-restart, or a flaky phone-to-PC Wi-Fi hop when testing over
// the LAN) surfaces as either a 502-ish proxy status or a fetch() that throws outright before any
// response exists — retrying once clears most of these instead of failing the whole scan.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])
const MAX_ATTEMPTS = 2
const RETRY_DELAY_MS = 600

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function postLocal<T>(path: string, body: Record<string, unknown>): Promise<T> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const isLastAttempt = attempt === MAX_ATTEMPTS - 1
    let res: Response
    try {
      res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch (err) {
      if (isLastAttempt) throw new AnalyzeError('Could not reach the server. Check your connection and try again.')
      await sleep(RETRY_DELAY_MS)
      continue
    }

    if (!res.ok) {
      if (RETRYABLE_STATUS.has(res.status) && !isLastAttempt) {
        await sleep(RETRY_DELAY_MS)
        continue
      }
      const errBody = await res.json().catch(() => ({}))
      throw new AnalyzeError(errBody.error || `Request failed (${res.status})`)
    }

    return res.json()
  }
  throw new AnalyzeError('Request failed.')
}

export async function analyzeFoodImage(imageDataUrl: string): Promise<AnalyzeResult> {
  if (useSupabase) return invokeEdgeFunction<AnalyzeResult>('analyze', { image: imageDataUrl })
  return postLocal<AnalyzeResult>('/api/analyze', { image: imageDataUrl })
}

export async function analyzeFoodText(foodName: string, quantity: string): Promise<AnalyzeResult> {
  if (useSupabase) return invokeEdgeFunction<AnalyzeResult>('analyze', { foodName, quantity })
  return postLocal<AnalyzeResult>('/api/analyze', { foodName, quantity })
}

/** Identifies the food in a single camera frame — identification only, no nutrients. */
export async function identifyFood(imageDataUrl: string): Promise<FoodIdentification> {
  if (useSupabase) return invokeEdgeFunction<FoodIdentification>('identify-food', { image: imageDataUrl })
  return postLocal<FoodIdentification>('/api/identify-food', { image: imageDataUrl })
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatFoodSuggestion {
  name: string
  emoji: string
  tip: string
}

export interface ChatReply {
  reply: string
  foods: ChatFoodSuggestion[]
}

/** General nutrition Q&A for the Superfoods chat — sends the running conversation and gets
 *  back a conversational reply plus any specific foods worth showing as tappable cards. */
export async function askNutritionBot(messages: ChatMessage[], lang: string): Promise<ChatReply> {
  if (useSupabase) return invokeEdgeFunction<ChatReply>('nutrition-chat', { messages, lang })
  return postLocal<ChatReply>('/api/nutrition-chat', { messages, lang })
}

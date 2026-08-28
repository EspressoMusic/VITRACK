import type { FunctionsHttpError } from '@supabase/supabase-js'
import type { IdentifiedFood, NutrientAmounts } from '../types'
import { supabase } from './supabase'

export interface AnalyzeResult {
  foods: IdentifiedFood[]
  nutrients: NutrientAmounts
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

async function invokeEdgeFunction<T>(name: 'analyze' | 'identify-food', body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.functions.invoke<T & { error?: string }>(name, { body })
  if (error) {
    const httpError = error as FunctionsHttpError
    const payload = await httpError.context?.json?.().catch(() => null)
    throw new AnalyzeError(payload?.error || error.message || 'Request failed.')
  }
  return data as T
}

async function postLocal<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new AnalyzeError(errBody.error || `Request failed (${res.status})`)
  }

  return res.json()
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

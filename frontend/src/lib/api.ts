import type { IdentifiedFood, NutrientAmounts } from '../types'

export interface AnalyzeResult {
  foods: IdentifiedFood[]
  nutrients: NutrientAmounts
  confidence: 'low' | 'medium' | 'high'
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

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
// In local dev always hit the local Express backend (kept in parity with the Supabase functions) so
// testing exercises the code actually being edited, instead of the last-deployed edge function.
const useSupabase = !import.meta.env.DEV && SUPABASE_URL?.startsWith('http')
const ANALYZE_URL = useSupabase ? `${SUPABASE_URL}/functions/v1/analyze` : '/api/analyze'
const IDENTIFY_URL = useSupabase ? `${SUPABASE_URL}/functions/v1/identify-food` : '/api/identify-food'

export async function analyzeFoodImage(imageDataUrl: string): Promise<AnalyzeResult> {
  const res = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new AnalyzeError(body.error || `Analysis failed (${res.status})`)
  }

  return res.json()
}

export async function analyzeFoodText(foodName: string, quantity: string): Promise<AnalyzeResult> {
  const res = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foodName, quantity }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new AnalyzeError(body.error || `Analysis failed (${res.status})`)
  }

  return res.json()
}

/** Identifies the food in a single camera frame — identification only, no nutrients. */
export async function identifyFood(imageDataUrl: string): Promise<FoodIdentification> {
  const res = await fetch(IDENTIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new AnalyzeError(body.error || `Food identification failed (${res.status})`)
  }

  return res.json()
}

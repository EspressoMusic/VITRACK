import type { IdentifiedFood, NutrientAmounts } from '../types'

export interface AnalyzeResult {
  foods: IdentifiedFood[]
  nutrients: NutrientAmounts
  confidence: 'low' | 'medium' | 'high'
  note?: string
}

export class AnalyzeError extends Error {}

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const ANALYZE_URL = SUPABASE_URL?.startsWith('http') ? `${SUPABASE_URL}/functions/v1/analyze` : '/api/analyze'

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

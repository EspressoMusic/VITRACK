import type { IdentifiedFood, NutrientAmounts } from '../types'

export interface AnalyzeResult {
  foods: IdentifiedFood[]
  nutrients: NutrientAmounts
  confidence: 'low' | 'medium' | 'high'
  note?: string
}

export class AnalyzeError extends Error {}

export async function analyzeFoodImage(imageDataUrl: string): Promise<AnalyzeResult> {
  const res = await fetch('/api/analyze', {
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

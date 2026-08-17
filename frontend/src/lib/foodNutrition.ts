import type { NutrientAmounts } from '../types'
import { EMPTY_NUTRIENTS } from './nutrients'

/** Canonical display name for each raw detector class name. */
const CANONICAL_NAME: Record<string, string> = {
  banana: 'Banana',
  apple: 'Apple',
  sandwich: 'Sandwich',
  orange: 'Orange',
  broccoli: 'Broccoli',
  carrot: 'Carrot',
  'hot dog': 'Hot Dog',
  pizza: 'Pizza',
  donut: 'Donut',
  cake: 'Cake',
}

/**
 * Rough per-typical-serving nutrient estimates, keyed by normalized name — used only for the
 * live camera preview pipeline. This is a coarse lookup, not the authoritative source: a saved
 * meal still gets its real values from the AI vision analysis in lib/api.ts at capture time.
 */
const NUTRITION_TABLE: Record<string, Partial<NutrientAmounts>> = {
  Banana: {
    vitaminC: 10, vitaminE: 0.1, vitaminK: 0.6, vitaminB1: 0.04, vitaminB2: 0.09,
    vitaminB3: 0.8, vitaminB6: 0.4, vitaminB9: 24, calcium: 6, iron: 0.3, magnesium: 32, zinc: 0.2, potassium: 422,
  },
  Apple: {
    vitaminA: 5, vitaminC: 8, vitaminE: 0.3, vitaminK: 4, vitaminB1: 0.03, vitaminB2: 0.05,
    vitaminB3: 0.2, vitaminB6: 0.08, vitaminB9: 5, calcium: 11, iron: 0.2, magnesium: 9, zinc: 0.1, potassium: 195,
  },
  Sandwich: {
    vitaminA: 40, vitaminC: 3, vitaminD: 0.3, vitaminE: 0.5, vitaminK: 10, vitaminB1: 0.3, vitaminB2: 0.2,
    vitaminB3: 4, vitaminB6: 0.2, vitaminB9: 60, vitaminB12: 0.5, calcium: 100, iron: 2, magnesium: 30, zinc: 1.5, potassium: 250,
  },
  Orange: {
    vitaminA: 14, vitaminC: 70, vitaminE: 0.2, vitaminB1: 0.1, vitaminB2: 0.05, vitaminB3: 0.4,
    vitaminB6: 0.08, vitaminB9: 40, calcium: 52, iron: 0.1, magnesium: 13, zinc: 0.1, potassium: 237,
  },
  Broccoli: {
    vitaminA: 31, vitaminC: 81, vitaminE: 0.7, vitaminK: 92, vitaminB1: 0.06, vitaminB2: 0.1, vitaminB3: 0.6,
    vitaminB6: 0.16, vitaminB9: 57, calcium: 43, iron: 0.7, magnesium: 19, zinc: 0.4, potassium: 288,
  },
  Carrot: {
    vitaminA: 509, vitaminC: 4, vitaminE: 0.4, vitaminK: 8, vitaminB1: 0.04, vitaminB2: 0.03,
    vitaminB3: 0.6, vitaminB6: 0.07, vitaminB9: 12, calcium: 20, iron: 0.2, magnesium: 7, zinc: 0.1, potassium: 195,
  },
  'Hot Dog': {
    vitaminD: 0.1, vitaminE: 0.2, vitaminK: 1, vitaminB1: 0.3, vitaminB2: 0.15, vitaminB3: 3,
    vitaminB6: 0.1, vitaminB9: 40, vitaminB12: 0.5, calcium: 50, iron: 1.5, magnesium: 15, zinc: 1.5, potassium: 143,
  },
  Pizza: {
    vitaminA: 45, vitaminC: 1, vitaminD: 0.2, vitaminE: 0.7, vitaminK: 2, vitaminB1: 0.3, vitaminB2: 0.2,
    vitaminB3: 3, vitaminB6: 0.1, vitaminB9: 60, vitaminB12: 0.4, calcium: 150, iron: 1.5, magnesium: 20, zinc: 1.5, potassium: 180,
  },
  Donut: {
    vitaminA: 5, vitaminD: 0.2, vitaminE: 0.5, vitaminK: 1, vitaminB1: 0.15, vitaminB2: 0.1, vitaminB3: 1,
    vitaminB6: 0.02, vitaminB9: 30, vitaminB12: 0.1, calcium: 20, iron: 1, magnesium: 6, zinc: 0.2, potassium: 60,
  },
  Cake: {
    vitaminA: 30, vitaminD: 0.3, vitaminE: 0.3, vitaminK: 1, vitaminB1: 0.1, vitaminB2: 0.1, vitaminB3: 0.8,
    vitaminB6: 0.03, vitaminB9: 20, vitaminB12: 0.2, calcium: 30, iron: 0.8, magnesium: 8, zinc: 0.2, potassium: 70,
  },
}

/** Maps a raw detector class name (e.g. "hot dog") to its canonical display name (e.g. "Hot Dog"). */
export function normalizeFoodName(rawClassName: string): string {
  return CANONICAL_NAME[rawClassName] ?? (rawClassName.charAt(0).toUpperCase() + rawClassName.slice(1))
}

/** Rough nutrient estimate for a normalized food name, or null if it's not in the table. */
export function lookupNutrition(normalizedName: string): NutrientAmounts | null {
  const partial = NUTRITION_TABLE[normalizedName]
  if (!partial) return null
  return { ...EMPTY_NUTRIENTS, ...partial }
}

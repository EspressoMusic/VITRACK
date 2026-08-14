import type { MealEntry, NutrientAmounts } from '../types'
import { NUTRIENTS } from './nutrients'
import { addMeal } from './db'

const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;base64,' +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffe07a"/><stop offset="100%" stop-color="#d9a441"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/></svg>'
  )

const MEALS = [
  { foods: [{ name: 'Grilled salmon & greens', portion: '1 plate' }], quality: 1.1 },
  { foods: [{ name: 'Oatmeal with berries', portion: '1 bowl' }], quality: 0.8 },
  { foods: [{ name: 'Chicken Caesar wrap', portion: '1 wrap' }], quality: 0.55 },
  { foods: [{ name: 'Cheeseburger & fries', portion: '1 combo' }], quality: 0.25 },
  { foods: [{ name: 'Veggie stir-fry with tofu', portion: '1 bowl' }], quality: 0.95 },
  { foods: [{ name: 'Greek yogurt & granola', portion: '1 cup' }], quality: 0.7 },
  { foods: [{ name: 'Spaghetti with meatballs', portion: '1 plate' }], quality: 0.5 },
  { foods: [{ name: 'Avocado toast & eggs', portion: '2 slices' }], quality: 0.85 },
  { foods: [{ name: 'Sushi platter', portion: '10 pieces' }], quality: 0.75 },
]

function randomNutrients(quality: number): NutrientAmounts {
  const amounts = {} as NutrientAmounts
  for (const n of NUTRIENTS) {
    const jitter = 0.75 + Math.random() * 0.5
    amounts[n.id] = Math.round(n.rda * quality * jitter * 100) / 100
  }
  return amounts
}

/** Seeds a handful of realistic-looking demo meals across the last 9 days. */
export async function seedDemoMeals(): Promise<void> {
  const now = new Date()
  for (let daysAgo = 8; daysAgo >= 0; daysAgo--) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    const meal = MEALS[Math.floor(Math.random() * MEALS.length)]
    const createdAt = new Date(date)
    createdAt.setHours(12 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60))

    const entry: MealEntry = {
      id: crypto.randomUUID(),
      date: dateKey,
      createdAt: createdAt.toISOString(),
      imageDataUrl: PLACEHOLDER_PHOTO,
      foods: meal.foods,
      nutrients: randomNutrients(meal.quality),
      confidence: 'medium',
      analysisNote: 'Demo entry',
    }
    await addMeal(entry)
  }
}

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

function dateKeyFor(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function seedMealForDay(date: Date, hour: number, minute: number): Promise<void> {
  const meal = MEALS[Math.floor(Math.random() * MEALS.length)]
  const createdAt = new Date(date)
  createdAt.setHours(hour, minute)

  const entry: MealEntry = {
    id: crypto.randomUUID(),
    date: dateKeyFor(date),
    createdAt: createdAt.toISOString(),
    imageDataUrl: PLACEHOLDER_PHOTO,
    foods: meal.foods,
    nutrients: randomNutrients(meal.quality),
    confidence: 'medium',
    analysisNote: 'Demo entry',
  }
  await addMeal(entry)
}

/**
 * Seeds a handful of realistic-looking demo meals across the last 8 days, plus a
 * stacked 10-photo log for today so the day-detail card's internal scroll is visible.
 */
export async function seedDemoMeals(): Promise<void> {
  const now = new Date()
  for (let daysAgo = 8; daysAgo >= 1; daysAgo--) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    await seedMealForDay(date, 12 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60))
  }

  const todayStartHour = 7
  for (let i = 0; i < 10; i++) {
    await seedMealForDay(now, todayStartHour + i * 1.3, Math.floor(Math.random() * 60))
  }
}

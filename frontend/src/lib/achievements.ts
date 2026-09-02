import type { MealEntry } from '../types'
import { CORE_NUTRIENTS, coverageStatus, percentOfRda, sumNutrients } from './nutrients'
import { EMPTY_MACROS, percentOfMacroGoal, sumMacros } from './macros'

export interface AchievementTier {
  id: string
  /** Number of "goal met" days needed to unlock this doll. */
  threshold: number
  color: string
}

/** Colors reused from the app's core-vitamin palette (lib/nutrientColors.ts) so each doll ties
 *  back to the nutrients the app is actually about. */
export const ACHIEVEMENT_TIERS: AchievementTier[] = [
  { id: 'first-day', threshold: 1, color: '#f4a53f' },
  { id: 'three-days', threshold: 3, color: '#f2c94c' },
  { id: 'week', threshold: 7, color: '#f28b6a' },
  { id: 'two-weeks', threshold: 14, color: '#7bc9e0' },
  { id: 'month', threshold: 30, color: '#8fd694' },
  { id: 'two-months', threshold: 60, color: '#c792ea' },
  { id: 'three-months', threshold: 90, color: '#9fd0d6' },
  { id: 'six-months', threshold: 180, color: '#c65146' },
  { id: 'year', threshold: 365, color: '#e8863a' },
]

/** A day counts as "goal met" when every core vitamin — and, if calorie/macro tracking is on,
 *  the day's calories — reached the same "good" (>=90% of personal target) bar used everywhere
 *  else in the app for coverage (see coverageStatus in lib/nutrients.ts). */
function isGoalDay(dayMeals: MealEntry[], trackNutrition: boolean): boolean {
  if (dayMeals.length === 0) return false

  const totalNutrients = sumNutrients(dayMeals.map((m) => m.nutrients))
  const nutrientsMet = CORE_NUTRIENTS.every(
    (n) => coverageStatus(percentOfRda(n.id, totalNutrients[n.id])) === 'good'
  )
  if (!nutrientsMet) return false
  if (!trackNutrition) return true

  const totalMacros = sumMacros(dayMeals.map((m) => m.macros ?? EMPTY_MACROS))
  return percentOfMacroGoal('calories', totalMacros.calories) >= 90
}

/** Counts distinct logged days (any date, including today) that met the goal-day bar. */
export function countGoalDays(meals: MealEntry[], trackNutrition: boolean): number {
  const byDate = new Map<string, MealEntry[]>()
  for (const meal of meals) {
    const list = byDate.get(meal.date)
    if (list) list.push(meal)
    else byDate.set(meal.date, [meal])
  }

  let count = 0
  for (const dayMeals of byDate.values()) {
    if (isGoalDay(dayMeals, trackNutrition)) count++
  }
  return count
}

/** The next locked tier to work toward, or null once every doll is unlocked. */
export function nextTier(goalDayCount: number): AchievementTier | null {
  return ACHIEVEMENT_TIERS.find((t) => goalDayCount < t.threshold) ?? null
}

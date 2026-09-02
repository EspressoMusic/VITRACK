import type { MealEntry, NutrientId } from '../types'
import { daysAgoKey } from './date'
import { getVisibleNutrients, sumNutrients, percentOfRda } from './nutrients'

export const INSIGHTS_WINDOW_DAYS = 7

/** XP lost from the weekly-completion circle per junk-food meal (high sugar/fried/ultra-processed) logged in the window. */
const JUNK_FOOD_XP_PENALTY = 6

export interface RankedNutrient {
  id: NutrientId
  avgAmount: number
  percent: number
}

export interface WeeklyInsights {
  loggedDayCount: number
  ranked: RankedNutrient[]
  weeklyCompletion: number
}

/** Averages each nutrient over the last INSIGHTS_WINDOW_DAYS logged days and ranks them worst-first. */
export function computeWeeklyInsights(meals: MealEntry[]): WeeklyInsights {
  const windowDates = new Set<string>()
  for (let i = 0; i < INSIGHTS_WINDOW_DAYS; i++) windowDates.add(daysAgoKey(i))

  const inWindow = meals.filter((m) => windowDates.has(m.date))
  const loggedDays = new Set(inWindow.map((m) => m.date))

  if (loggedDays.size === 0) {
    return { loggedDayCount: 0, ranked: [], weeklyCompletion: 0 }
  }

  const total = sumNutrients(inWindow.map((m) => m.nutrients))
  const ranked = getVisibleNutrients().map((n) => {
    const avgAmount = total[n.id] / loggedDays.size
    return { id: n.id, avgAmount, percent: percentOfRda(n.id, avgAmount) }
  }).sort((a, b) => a.percent - b.percent)

  const rawCompletion = Math.round(ranked.reduce((sum, r) => sum + Math.min(100, r.percent), 0) / ranked.length)
  const junkFoodCount = inWindow.filter((m) => m.isJunkFood).length
  const weeklyCompletion = Math.max(0, rawCompletion - junkFoodCount * JUNK_FOOD_XP_PENALTY)

  return { loggedDayCount: loggedDays.size, ranked, weeklyCompletion }
}

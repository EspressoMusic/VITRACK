import type { MealEntry, NutrientId } from '../types'
import { daysAgoKey, todayKey } from './date'
import { coverageStatus, getVisibleNutrients, sumNutrients, percentOfRda } from './nutrients'

export const INSIGHTS_WINDOW_DAYS = 7

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

  const weeklyCompletion = Math.round(ranked.reduce((sum, r) => sum + Math.min(100, r.percent), 0) / ranked.length)

  return { loggedDayCount: loggedDays.size, ranked, weeklyCompletion }
}

export interface TodayFeeling {
  id: NutrientId
  amount: number
  percent: number
}

/** Today's worst-covered nutrient, judged against today's meals only (not the week's rolling
 *  average) — so the "why might I feel this way" callout stays grounded in what was actually
 *  eaten today. Returns null before anything has been logged today, since a totally empty day
 *  would otherwise flag every nutrient as deficient. */
export function computeTodayFeeling(meals: MealEntry[]): TodayFeeling | null {
  const todayMeals = meals.filter((m) => m.date === todayKey())
  if (todayMeals.length === 0) return null

  const total = sumNutrients(todayMeals.map((m) => m.nutrients))
  const deficient = getVisibleNutrients()
    .map((n) => ({ id: n.id, amount: total[n.id], percent: percentOfRda(n.id, total[n.id]) }))
    .filter((r) => coverageStatus(r.percent) !== 'good')
    .sort((a, b) => a.percent - b.percent)

  return deficient[0] ?? null
}

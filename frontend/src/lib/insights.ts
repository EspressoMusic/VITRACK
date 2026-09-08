import type { MealEntry, NutrientId, WorkoutEntry } from '../types'
import { daysAgoKey } from './date'
import { getVisibleNutrients, sumNutrients, percentOfRda } from './nutrients'
import { EMPTY_MACROS, percentOfMacroGoal, sumMacros } from './macros'

export const INSIGHTS_WINDOW_DAYS = 7

/** XP lost from the weekly-completion circle per junk-food meal (high sugar/fried/ultra-processed) logged in the window. */
const JUNK_FOOD_XP_PENALTY = 6

export interface RankedNutrient {
  id: NutrientId
  avgAmount: number
  percent: number
}

export interface MacroInsight {
  avgAmount: number
  percent: number
}

export interface WeeklyInsights {
  loggedDayCount: number
  ranked: RankedNutrient[]
  weeklyCompletion: number
  /** Average coverage across all tracked vitamins/minerals, uncapped by the junk-food XP penalty. */
  vitaminsPercent: number
  macros: Record<'proteinG' | 'carbsG' | 'fatG', MacroInsight>
}

/** Averages each nutrient over the last INSIGHTS_WINDOW_DAYS logged days and ranks them worst-first. */
export function computeWeeklyInsights(meals: MealEntry[], workouts: WorkoutEntry[] = []): WeeklyInsights {
  const windowDates = new Set<string>()
  for (let i = 0; i < INSIGHTS_WINDOW_DAYS; i++) windowDates.add(daysAgoKey(i))

  const inWindow = meals.filter((m) => windowDates.has(m.date))
  const loggedDays = new Set(inWindow.map((m) => m.date))

  if (loggedDays.size === 0) {
    return {
      loggedDayCount: 0,
      ranked: [],
      weeklyCompletion: 0,
      vitaminsPercent: 0,
      macros: {
        proteinG: { avgAmount: 0, percent: 0 },
        carbsG: { avgAmount: 0, percent: 0 },
        fatG: { avgAmount: 0, percent: 0 },
      },
    }
  }

  const total = sumNutrients(inWindow.map((m) => m.nutrients))
  const ranked = getVisibleNutrients().map((n) => {
    const avgAmount = total[n.id] / loggedDays.size
    return { id: n.id, avgAmount, percent: percentOfRda(n.id, avgAmount) }
  }).sort((a, b) => a.percent - b.percent)

  const vitaminsPercent = Math.round(ranked.reduce((sum, r) => sum + Math.min(100, r.percent), 0) / ranked.length)
  const junkFoodCount = inWindow.filter((m) => m.isJunkFood).length

  const macroTotal = sumMacros(inWindow.map((m) => m.macros ?? EMPTY_MACROS))
  const macros = {
    proteinG: {
      avgAmount: macroTotal.proteinG / loggedDays.size,
      percent: percentOfMacroGoal('proteinG', macroTotal.proteinG / loggedDays.size),
    },
    carbsG: {
      avgAmount: macroTotal.carbsG / loggedDays.size,
      percent: percentOfMacroGoal('carbsG', macroTotal.carbsG / loggedDays.size),
    },
    fatG: {
      avgAmount: macroTotal.fatG / loggedDays.size,
      percent: percentOfMacroGoal('fatG', macroTotal.fatG / loggedDays.size),
    },
  }

  // The ring is meant to reflect *every* category shown below it (macros, vitamins, workouts),
  // not just vitamin coverage — otherwise it can read 100% while macros are barely started.
  // Workouts are only folded in when the user actually logged one this window, so people who
  // don't track workouts aren't dragged down to 0 for a category they never use.
  const workoutsInWindow = workouts.filter((w) => windowDates.has(w.date))
  const workoutsPercent =
    workoutsInWindow.length > 0
      ? Math.round((workoutsInWindow.filter((w) => w.done).length / workoutsInWindow.length) * 100)
      : null

  const categoryPercents = [
    vitaminsPercent,
    Math.min(100, macros.proteinG.percent),
    Math.min(100, macros.carbsG.percent),
    Math.min(100, macros.fatG.percent),
    ...(workoutsPercent !== null ? [workoutsPercent] : []),
  ]
  const rawCompletion = Math.round(categoryPercents.reduce((sum, p) => sum + p, 0) / categoryPercents.length)
  const weeklyCompletion = Math.max(0, rawCompletion - junkFoodCount * JUNK_FOOD_XP_PENALTY)

  return { loggedDayCount: loggedDays.size, ranked, weeklyCompletion, vitaminsPercent, macros }
}

/** Share of the last INSIGHTS_WINDOW_DAYS' logged workouts that were marked done. */
export function computeWorkoutCompletion(workouts: WorkoutEntry[]): number {
  const windowDates = new Set<string>()
  for (let i = 0; i < INSIGHTS_WINDOW_DAYS; i++) windowDates.add(daysAgoKey(i))

  const inWindow = workouts.filter((w) => windowDates.has(w.date))
  if (inWindow.length === 0) return 0

  const doneCount = inWindow.filter((w) => w.done).length
  return Math.round((doneCount / inWindow.length) * 100)
}

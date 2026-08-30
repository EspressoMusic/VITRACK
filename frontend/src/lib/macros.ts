import type { MacroAmounts, MacroId } from '../types'

export interface MacroDef {
  id: MacroId
  unit: string
}

export const MACROS: MacroDef[] = [
  { id: 'calories', unit: 'kcal' },
  { id: 'carbsG', unit: 'g' },
  { id: 'fatG', unit: 'g' },
  { id: 'proteinG', unit: 'g' },
]

export const EMPTY_MACROS: MacroAmounts = { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 }

/** Generic adult fallback, used until the user has completed onboarding with personalized goals. */
export const DEFAULT_MACRO_GOALS: MacroAmounts = { calories: 2000, carbsG: 250, fatG: 65, proteinG: 90 }

export function sumMacros(entries: MacroAmounts[]): MacroAmounts {
  const total = { ...EMPTY_MACROS }
  for (const entry of entries) {
    total.calories += entry.calories ?? 0
    total.carbsG += entry.carbsG ?? 0
    total.fatG += entry.fatG ?? 0
    total.proteinG += entry.proteinG ?? 0
  }
  return total
}

let activeMacroGoals: MacroAmounts | null = null

/** Set by lib/profile.ts once the user's personalized daily macro targets are known. */
export function setActiveMacroGoals(goals: MacroAmounts | null): void {
  activeMacroGoals = goals
}

export function macroTargetFor(id: MacroId): number {
  return activeMacroGoals?.[id] ?? DEFAULT_MACRO_GOALS[id]
}

export function percentOfMacroGoal(id: MacroId, amount: number): number {
  const target = macroTargetFor(id)
  if (target <= 0) return 0
  return Math.min(200, Math.round((amount / target) * 100))
}

/** A single meal is only a fraction of the day, so its macros are judged against a per-meal
 *  share of the daily target rather than the full day — mirrors nutrients.ts's MEAL_TARGET_DIVISOR. */
export const MACRO_MEAL_TARGET_DIVISOR = 3

export function macroMealTargetFor(id: MacroId): number {
  return macroTargetFor(id) / MACRO_MEAL_TARGET_DIVISOR
}

export function percentOfMacroMealTarget(id: MacroId, amount: number): number {
  const target = macroMealTargetFor(id)
  if (target <= 0) return 0
  return Math.min(200, Math.round((amount / target) * 100))
}

const TRACK_NUTRITION_KEY = 'vitrack:trackNutrition'

/** Lets someone who only cares about vitamins/minerals hide calories/carbs/fat/protein
 *  everywhere they'd otherwise show up — the scan result, custom food entry, and the body
 *  gauge. On by default; off is an explicit opt-out from Settings. */
export function isMacroTrackingEnabled(): boolean {
  return localStorage.getItem(TRACK_NUTRITION_KEY) !== 'false'
}

export function setMacroTrackingEnabled(enabled: boolean): void {
  localStorage.setItem(TRACK_NUTRITION_KEY, enabled ? 'true' : 'false')
}

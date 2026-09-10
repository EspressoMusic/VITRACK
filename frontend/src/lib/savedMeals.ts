export interface SavedMeal {
  name: string
  emoji: string
  tip: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

const SAVED_MEALS_KEY = 'vitrack:savedMeals'

export function getSavedMeals(): SavedMeal[] {
  const raw = localStorage.getItem(SAVED_MEALS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setSavedMeals(meals: SavedMeal[]): void {
  localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(meals))
}

export function isMealSaved(name: string): boolean {
  return getSavedMeals().some((m) => m.name === name)
}

export function saveMeal(meal: SavedMeal): void {
  const existing = getSavedMeals().filter((m) => m.name !== meal.name)
  setSavedMeals([meal, ...existing])
}

export function unsaveMeal(name: string): void {
  setSavedMeals(getSavedMeals().filter((m) => m.name !== name))
}

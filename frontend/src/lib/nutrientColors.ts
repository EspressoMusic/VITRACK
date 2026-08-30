import type { MacroId, NutrientId } from '../types'

/** One distinct color per core vitamin, used for its liquid band in the body-fill gauge.
 *  Only the core set is colored — matches the app's default (non-advanced) nutrient list, so
 *  the gauge never has to squeeze in more bands than it can legibly show at once. */
export const CORE_NUTRIENT_COLOR: Partial<Record<NutrientId, string>> = {
  vitaminA: '#f4a53f',
  vitaminC: '#f2c94c',
  vitaminD: '#f28b6a',
  vitaminB6: '#7bc9e0',
  vitaminB9: '#8fd694',
  vitaminB12: '#c792ea',
}

export const MACRO_COLOR: Record<Exclude<MacroId, 'calories'>, string> = {
  carbsG: '#e8863a',
  fatG: '#f2d76e',
  proteinG: '#e26d6d',
}

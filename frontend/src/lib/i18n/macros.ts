import type { MacroId } from '../../types'
import type { Lang } from './lang'

/** Shared short labels for the 4 macro fields, reused by the custom-food form, the scan
 *  result's macro summary row, and the meal detail modal. */
export const MACRO_LABELS: Record<Lang, Record<MacroId, string>> = {
  en: {
    calories: 'Calories',
    carbsG: 'Carbs',
    fatG: 'Fat',
    proteinG: 'Protein',
  },
  he: {
    calories: 'קלוריות',
    carbsG: 'פחמימות',
    fatG: 'שומן',
    proteinG: 'חלבון',
  },
  ar: {
    calories: 'سعرات حرارية',
    carbsG: 'كربوهيدرات',
    fatG: 'دهون',
    proteinG: 'بروتين',
  },
}

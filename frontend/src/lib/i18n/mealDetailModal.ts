import type { Lang } from './lang'

export interface MealDetailModalStrings {
  closeAriaLabel: string
  noFoodDetected: string
  noNutrientData: string
  mealFallbackName: string
}

export const MEAL_DETAIL_MODAL_STRINGS: Record<Lang, MealDetailModalStrings> = {
  en: {
    closeAriaLabel: 'Close',
    noFoodDetected: 'No food detected.',
    noNutrientData: 'No nutrient data for this meal.',
    mealFallbackName: 'Meal',
  },
  he: {
    closeAriaLabel: 'סגירה',
    noFoodDetected: 'לא זוהה מזון.',
    noNutrientData: 'אין נתוני תזונה לארוחה הזו.',
    mealFallbackName: 'ארוחה',
  },
  ar: {
    closeAriaLabel: 'إغلاق',
    noFoodDetected: 'لم يتم التعرف على طعام.',
    noNutrientData: 'لا توجد بيانات غذائية لهذه الوجبة.',
    mealFallbackName: 'وجبة',
  },
}

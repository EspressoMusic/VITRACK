import type { Lang } from './lang'

export interface MealDetailModalStrings {
  title: string
  closeAriaLabel: string
  noFoodDetected: string
  foodsLabel: string
  nutrientsLabel: string
  noNutrientData: string
  mealFallbackName: string
  confidence: { high: string; medium: string; low: string }
}

export const MEAL_DETAIL_MODAL_STRINGS: Record<Lang, MealDetailModalStrings> = {
  en: {
    title: 'Meal details',
    closeAriaLabel: 'Close',
    noFoodDetected: 'No food detected.',
    foodsLabel: 'Foods',
    nutrientsLabel: 'Nutrients',
    noNutrientData: 'No nutrient data for this meal.',
    mealFallbackName: 'Meal',
    confidence: { high: 'High', medium: 'Medium', low: 'Low' },
  },
  he: {
    title: 'פרטי הארוחה',
    closeAriaLabel: 'סגירה',
    noFoodDetected: 'לא זוהה מזון.',
    foodsLabel: 'מזונות',
    nutrientsLabel: 'נוטריינטים',
    noNutrientData: 'אין נתוני תזונה לארוחה הזו.',
    mealFallbackName: 'ארוחה',
    confidence: { high: 'גבוהה', medium: 'בינונית', low: 'נמוכה' },
  },
  ar: {
    title: 'تفاصيل الوجبة',
    closeAriaLabel: 'إغلاق',
    noFoodDetected: 'لم يتم التعرف على طعام.',
    foodsLabel: 'الأطعمة',
    nutrientsLabel: 'العناصر الغذائية',
    noNutrientData: 'لا توجد بيانات غذائية لهذه الوجبة.',
    mealFallbackName: 'وجبة',
    confidence: { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' },
  },
}

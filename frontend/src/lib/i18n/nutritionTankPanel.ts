import type { Lang } from './lang'

export interface NutritionTankStrings {
  title: string
  calorieLabel: (consumed: number, goal: number) => string
  caloriesTitle: string
  historyAriaLabel: string
}

export const NUTRITION_TANK_STRINGS: Record<Lang, NutritionTankStrings> = {
  en: {
    title: "Today's intake",
    calorieLabel: (consumed, goal) => `${consumed.toLocaleString()} / ${goal.toLocaleString()} kcal`,
    caloriesTitle: 'Calories',
    historyAriaLabel: 'View calendar & meal history',
  },
  he: {
    title: 'הצריכה של היום',
    calorieLabel: (consumed, goal) => `${consumed.toLocaleString()} / ${goal.toLocaleString()} קק"ל`,
    caloriesTitle: 'קלוריות',
    historyAriaLabel: 'הצגת יומן והיסטוריית ארוחות',
  },
  ar: {
    title: 'استهلاك اليوم',
    calorieLabel: (consumed, goal) => `${consumed.toLocaleString()} / ${goal.toLocaleString()} سعرة`,
    caloriesTitle: 'السعرات',
    historyAriaLabel: 'عرض التقويم وسجل الوجبات',
  },
}

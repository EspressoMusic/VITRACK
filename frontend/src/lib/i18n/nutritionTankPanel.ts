import type { Lang } from './lang'

export interface NutritionTankStrings {
  title: string
  calorieLabel: (consumed: number, goal: number) => string
  historyAriaLabel: string
}

export const NUTRITION_TANK_STRINGS: Record<Lang, NutritionTankStrings> = {
  en: {
    title: "Today's intake",
    calorieLabel: (consumed, goal) => `${consumed.toLocaleString()} / ${goal.toLocaleString()} kcal`,
    historyAriaLabel: 'View calendar & meal history',
  },
  he: {
    title: 'הצריכה של היום',
    calorieLabel: (consumed, goal) => `${consumed.toLocaleString()} / ${goal.toLocaleString()} קק"ל`,
    historyAriaLabel: 'הצגת יומן והיסטוריית ארוחות',
  },
  ar: {
    title: 'استهلاك اليوم',
    calorieLabel: (consumed, goal) => `${consumed.toLocaleString()} / ${goal.toLocaleString()} سعرة`,
    historyAriaLabel: 'عرض التقويم وسجل الوجبات',
  },
}

import type { Lang } from './lang'

export interface CalendarPanelStrings {
  prevMonthAriaLabel: string
  nextMonthAriaLabel: string
  todayPrefix: string
  noMealsLoggedThisDay: string
  mealFallbackName: string
  richIn: (nutrientName: string) => string
  noStandoutNutrients: string
}

export const CALENDAR_PANEL_STRINGS: Record<Lang, CalendarPanelStrings> = {
  en: {
    prevMonthAriaLabel: 'Previous month',
    nextMonthAriaLabel: 'Next month',
    todayPrefix: 'Today',
    noMealsLoggedThisDay: 'No meals logged this day.',
    mealFallbackName: 'Meal',
    richIn: (name) => `Rich in ${name}`,
    noStandoutNutrients: 'No standout nutrients',
  },
  he: {
    prevMonthAriaLabel: 'חודש קודם',
    nextMonthAriaLabel: 'חודש הבא',
    todayPrefix: 'היום',
    noMealsLoggedThisDay: 'לא נרשמו ארוחות ביום הזה.',
    mealFallbackName: 'ארוחה',
    richIn: (name) => `עשיר ב${name}`,
    noStandoutNutrients: 'אין נוטריינטים בולטים',
  },
  ar: {
    prevMonthAriaLabel: 'الشهر السابق',
    nextMonthAriaLabel: 'الشهر التالي',
    todayPrefix: 'اليوم',
    noMealsLoggedThisDay: 'لم تُسجَّل أي وجبات في هذا اليوم.',
    mealFallbackName: 'وجبة',
    richIn: (name) => `غني بـ${name}`,
    noStandoutNutrients: 'لا توجد عناصر غذائية بارزة',
  },
}

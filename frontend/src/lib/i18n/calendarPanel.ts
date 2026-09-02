import type { Lang } from './lang'

export interface CalendarPanelStrings {
  prevMonthAriaLabel: string
  nextMonthAriaLabel: string
  todayPrefix: string
  noMealsLoggedThisDay: string
  mealFallbackName: string
  backAriaLabel: string
  backLabel: string
}

export const CALENDAR_PANEL_STRINGS: Record<Lang, CalendarPanelStrings> = {
  en: {
    prevMonthAriaLabel: 'Previous month',
    nextMonthAriaLabel: 'Next month',
    todayPrefix: 'Today',
    noMealsLoggedThisDay: 'No meals logged this day.',
    mealFallbackName: 'Meal',
    backAriaLabel: 'Back to month view',
    backLabel: 'Back',
  },
  he: {
    prevMonthAriaLabel: 'חודש קודם',
    nextMonthAriaLabel: 'חודש הבא',
    todayPrefix: 'היום',
    noMealsLoggedThisDay: 'לא נרשמו ארוחות ביום הזה.',
    mealFallbackName: 'ארוחה',
    backAriaLabel: 'חזרה לתצוגת החודש',
    backLabel: 'חזרה',
  },
  ar: {
    prevMonthAriaLabel: 'الشهر السابق',
    nextMonthAriaLabel: 'الشهر التالي',
    todayPrefix: 'اليوم',
    noMealsLoggedThisDay: 'لم تُسجَّل أي وجبات في هذا اليوم.',
    mealFallbackName: 'وجبة',
    backAriaLabel: 'العودة إلى عرض الشهر',
    backLabel: 'رجوع',
  },
}

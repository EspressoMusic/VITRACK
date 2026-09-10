import type { Lang } from './lang'

export interface CalendarPanelStrings {
  prevMonthAriaLabel: string
  nextMonthAriaLabel: string
  todayPrefix: string
  noMealsLoggedThisDay: string
  mealFallbackName: string
  backAriaLabel: string
  backLabel: string
  goalsTitle: string
  addGoalAriaLabel: string
  editGoalAriaLabel: string
  markDoneAriaLabel: string
  markNotDoneAriaLabel: string
  deleteGoalAriaLabel: string
  addModalTitle: string
  editModalTitle: string
  goalNamePlaceholder: string
  defaultGoalName: string
  templatesLabel: string
  saveButtonLabel: string
  closeAriaLabel: string
  completedGoalsAriaLabel: string
  completedModalTitle: string
  noCompletedChallenges: string
  challengeCompletedTitle: string
  challengeCompletedPrefix: string
  challengeCompletedSuffix: string
  challengeCompletedButtonLabel: string
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
    goalsTitle: 'Challenges',
    addGoalAriaLabel: 'Add challenge',
    editGoalAriaLabel: 'Edit challenge',
    markDoneAriaLabel: 'Mark as done',
    markNotDoneAriaLabel: 'Mark as not done',
    deleteGoalAriaLabel: 'Delete challenge',
    addModalTitle: 'Add weekly challenge',
    editModalTitle: 'Edit weekly challenge',
    goalNamePlaceholder: 'Custom goal',
    defaultGoalName: 'Challenge',
    templatesLabel: 'Quick start',
    saveButtonLabel: 'Save',
    closeAriaLabel: 'Close',
    completedGoalsAriaLabel: 'Completed challenges',
    completedModalTitle: 'Completed challenges',
    noCompletedChallenges: 'No completed challenges yet.',
    challengeCompletedTitle: 'Well done!',
    challengeCompletedPrefix: 'You completed',
    challengeCompletedSuffix: 'this week.',
    challengeCompletedButtonLabel: 'Nice!',
  },
  he: {
    prevMonthAriaLabel: 'חודש קודם',
    nextMonthAriaLabel: 'חודש הבא',
    todayPrefix: 'היום',
    noMealsLoggedThisDay: 'לא נרשמו ארוחות ביום הזה.',
    mealFallbackName: 'ארוחה',
    backAriaLabel: 'חזרה לתצוגת החודש',
    backLabel: 'חזרה',
    goalsTitle: 'אתגרים',
    addGoalAriaLabel: 'הוספת אתגר',
    editGoalAriaLabel: 'עריכת אתגר',
    markDoneAriaLabel: 'סימון כבוצע',
    markNotDoneAriaLabel: 'ביטול סימון',
    deleteGoalAriaLabel: 'מחיקת אתגר',
    addModalTitle: 'הוספת אתגר שבועי',
    editModalTitle: 'עריכת אתגר שבועי',
    goalNamePlaceholder: 'מטרה בהתאמה אישית',
    defaultGoalName: 'אתגר',
    templatesLabel: 'התחלה מהירה',
    saveButtonLabel: 'שמירה',
    closeAriaLabel: 'סגירה',
    completedGoalsAriaLabel: 'אתגרים שהושלמו',
    completedModalTitle: 'אתגרים שהושלמו',
    noCompletedChallenges: 'עדיין אין אתגרים שהושלמו.',
    challengeCompletedTitle: 'כל הכבוד!',
    challengeCompletedPrefix: 'השלמת את האתגר',
    challengeCompletedSuffix: 'השבוע 🎉',
    challengeCompletedButtonLabel: 'מעולה',
  },
  ar: {
    prevMonthAriaLabel: 'الشهر السابق',
    nextMonthAriaLabel: 'الشهر التالي',
    todayPrefix: 'اليوم',
    noMealsLoggedThisDay: 'لم تُسجَّل أي وجبات في هذا اليوم.',
    mealFallbackName: 'وجبة',
    backAriaLabel: 'العودة إلى عرض الشهر',
    backLabel: 'رجوع',
    goalsTitle: 'تحديات',
    addGoalAriaLabel: 'إضافة تحدي',
    editGoalAriaLabel: 'تعديل التحدي',
    markDoneAriaLabel: 'وضع علامة كمنجز',
    markNotDoneAriaLabel: 'إلغاء العلامة',
    deleteGoalAriaLabel: 'حذف التحدي',
    addModalTitle: 'إضافة تحدي أسبوعي',
    editModalTitle: 'تعديل التحدي الأسبوعي',
    goalNamePlaceholder: 'هدف مخصص',
    defaultGoalName: 'تحدي',
    templatesLabel: 'بداية سريعة',
    saveButtonLabel: 'حفظ',
    closeAriaLabel: 'إغلاق',
    completedGoalsAriaLabel: 'التحديات المكتملة',
    completedModalTitle: 'التحديات المكتملة',
    noCompletedChallenges: 'لا توجد تحديات مكتملة بعد.',
    challengeCompletedTitle: 'أحسنت!',
    challengeCompletedPrefix: 'أكملت تحدي',
    challengeCompletedSuffix: 'هذا الأسبوع 🎉',
    challengeCompletedButtonLabel: 'رائع',
  },
}

import type { Lang } from './lang'

export interface InsightsPanelStrings {
  nothingHereYet: string
  snapAMealPrompt: string
  niceWorkNoDeficiencies: string
  noDeficienciesNote: string
  closeAriaLabel: string
  claimReward: string
}

export const INSIGHTS_PANEL_STRINGS: Record<Lang, InsightsPanelStrings> = {
  en: {
    nothingHereYet: 'Nothing here yet',
    snapAMealPrompt: "Snap a meal to see how you're doing.",
    niceWorkNoDeficiencies: 'Nice work! no deficiencies',
    noDeficienciesNote: "You're getting everything your body needs this week.",
    closeAriaLabel: 'Close',
    claimReward: 'Claim',
  },
  he: {
    nothingHereYet: 'עדיין אין כאן כלום',
    snapAMealPrompt: 'צלמו ארוחה כדי לראות איך הולך.',
    niceWorkNoDeficiencies: 'כל הכבוד! אין חוסרים',
    noDeficienciesNote: 'אתם מקבלים השבוע את כל מה שהגוף צריך.',
    closeAriaLabel: 'סגירה',
    claimReward: 'קבל',
  },
  ar: {
    nothingHereYet: 'لا يوجد شيء هنا بعد',
    snapAMealPrompt: 'التقط صورة لوجبة لترى كيف تسير الأمور.',
    niceWorkNoDeficiencies: 'أحسنت! لا يوجد نقص',
    noDeficienciesNote: 'أنت تحصل هذا الأسبوع على كل ما يحتاجه جسمك.',
    closeAriaLabel: 'إغلاق',
    claimReward: 'استلم',
  },
}

import type { Lang } from './lang'

export interface InsightsPanelStrings {
  nothingHereYet: string
  snapAMealPrompt: string
  niceWorkNoDeficiencies: string
}

export const INSIGHTS_PANEL_STRINGS: Record<Lang, InsightsPanelStrings> = {
  en: {
    nothingHereYet: 'Nothing here yet',
    snapAMealPrompt: "Snap a meal to see how you're doing.",
    niceWorkNoDeficiencies: 'Nice work! no deficiencies',
  },
  he: {
    nothingHereYet: 'עדיין אין כאן כלום',
    snapAMealPrompt: 'צלמו ארוחה כדי לראות איך הולך.',
    niceWorkNoDeficiencies: 'כל הכבוד! אין חוסרים',
  },
  ar: {
    nothingHereYet: 'لا يوجد شيء هنا بعد',
    snapAMealPrompt: 'التقط صورة لوجبة لترى كيف تسير الأمور.',
    niceWorkNoDeficiencies: 'أحسنت! لا يوجد نقص',
  },
}

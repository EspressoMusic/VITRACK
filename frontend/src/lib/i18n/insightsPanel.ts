import type { Lang } from './lang'

export interface InsightsPanelStrings {
  nothingHereYet: string
  snapAMealPrompt: string
  niceWorkNoDeficiencies: string
  feelingSentence: (feeling: string) => string
  notEatenTodaySentence: string
}

export const INSIGHTS_PANEL_STRINGS: Record<Lang, InsightsPanelStrings> = {
  en: {
    nothingHereYet: 'Nothing here yet',
    snapAMealPrompt: "Snap a meal to see how you're doing.",
    niceWorkNoDeficiencies: 'Nice work! no deficiencies',
    feelingSentence: (feeling) => `${feeling.charAt(0).toUpperCase()}${feeling.slice(1)} lately 😴`,
    notEatenTodaySentence: "Wait, you haven't eaten today? 🤔",
  },
  he: {
    nothingHereYet: 'עדיין אין כאן כלום',
    snapAMealPrompt: 'צלמו ארוחה כדי לראות איך הולך.',
    niceWorkNoDeficiencies: 'כל הכבוד! אין חוסרים',
    feelingSentence: (feeling) => `${feeling} לאחרונה 😴`,
    notEatenTodaySentence: 'מה? לא אכלת היום? 🤔',
  },
  ar: {
    nothingHereYet: 'لا يوجد شيء هنا بعد',
    snapAMealPrompt: 'التقط صورة لوجبة لترى كيف تسير الأمور.',
    niceWorkNoDeficiencies: 'أحسنت! لا يوجد نقص',
    feelingSentence: (feeling) => `${feeling} مؤخرًا 😴`,
    notEatenTodaySentence: 'ماذا، ألم تأكل اليوم؟ 🤔',
  },
}

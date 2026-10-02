import type { Lang } from './lang'

export interface InsightsPanelStrings {
  niceWorkNoDeficiencies: string
  noDeficienciesNote: string
  closeAriaLabel: string
  claimReward: string
}

export const INSIGHTS_PANEL_STRINGS: Record<Lang, InsightsPanelStrings> = {
  en: {
    niceWorkNoDeficiencies: 'Nice work! no deficiencies',
    noDeficienciesNote: "You're getting everything your body needs this week.",
    closeAriaLabel: 'Close',
    claimReward: 'Claim',
  },
  he: {
    niceWorkNoDeficiencies: 'כל הכבוד! אין חוסרים',
    noDeficienciesNote: 'אתם מקבלים השבוע את כל מה שהגוף צריך.',
    closeAriaLabel: 'סגירה',
    claimReward: 'קבל',
  },
  ar: {
    niceWorkNoDeficiencies: 'أحسنت! لا يوجد نقص',
    noDeficienciesNote: 'أنت تحصل هذا الأسبوع على كل ما يحتاجه جسمك.',
    closeAriaLabel: 'إغلاق',
    claimReward: 'استلم',
  },
}

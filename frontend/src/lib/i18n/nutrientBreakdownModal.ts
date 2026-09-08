import type { Lang } from './lang'

export interface NutrientBreakdownModalStrings {
  title: string
  closeAriaLabel: string
}

export const NUTRIENT_BREAKDOWN_MODAL_STRINGS: Record<Lang, NutrientBreakdownModalStrings> = {
  en: {
    title: 'All vitamins & minerals',
    closeAriaLabel: 'Close',
  },
  he: {
    title: 'כל הויטמינים והמינרלים',
    closeAriaLabel: 'סגירה',
  },
  ar: {
    title: 'كل الفيتامينات والمعادن',
    closeAriaLabel: 'إغلاق',
  },
}

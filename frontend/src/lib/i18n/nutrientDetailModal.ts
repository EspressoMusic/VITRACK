import type { Lang } from './lang'

export interface NutrientDetailModalStrings {
  closeAriaLabel: string
  consumed: string
  remaining: string
  status: string
  goalMet: string
  /** `amountWithUnit` is already formatted, e.g. "3.2mg" — stays in Latin digits/unit per app convention. */
  toGo: (amountWithUnit: string) => string
  whyItMatters: string
  youAreCovered: string
  foodsToCloseTheGap: string
}

export const NUTRIENT_DETAIL_MODAL_STRINGS: Record<Lang, NutrientDetailModalStrings> = {
  en: {
    closeAriaLabel: 'Close',
    consumed: 'Consumed',
    remaining: 'Remaining',
    status: 'Status',
    goalMet: 'Goal met',
    toGo: (amount) => `${amount} to go`,
    whyItMatters: 'Why it matters',
    youAreCovered: "You're covered",
    foodsToCloseTheGap: 'Foods to close the gap',
  },
  he: {
    closeAriaLabel: 'סגירה',
    consumed: 'נצרך',
    remaining: 'נותר',
    status: 'סטטוס',
    goalMet: 'היעד הושג',
    toGo: (amount) => `עוד ${amount} להשלמה`,
    whyItMatters: 'למה זה חשוב',
    youAreCovered: 'אתם מכוסים',
    foodsToCloseTheGap: 'מזונות שיסגרו את הפער',
  },
  ar: {
    closeAriaLabel: 'إغلاق',
    consumed: 'المستهلك',
    remaining: 'المتبقي',
    status: 'الحالة',
    goalMet: 'تم تحقيق الهدف',
    toGo: (amount) => `متبقٍّ ${amount}`,
    whyItMatters: 'لماذا هذا مهم',
    youAreCovered: 'أنت مغطّى',
    foodsToCloseTheGap: 'أطعمة تسدّ الفجوة',
  },
}

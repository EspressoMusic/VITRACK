import type { Lang } from './lang'

export interface MissingToGoalModalStrings {
  title: string
  closeAriaLabel: string
  allDone: string
  /** Composes the trailing "<amount+unit> to go · <percent>%" line — amount is a formatted data value. */
  toGo: (amountWithUnit: string, percent: number) => string
}

export const MISSING_TO_GOAL_MODAL_STRINGS: Record<Lang, MissingToGoalModalStrings> = {
  en: {
    title: "What's missing to 100%",
    closeAriaLabel: 'Close',
    allDone: "You've hit 100% on everything this week.",
    toGo: (amountWithUnit, percent) => `${amountWithUnit} to go · ${percent}%`,
  },
  he: {
    title: 'מה חסר כדי להגיע ל-100%',
    closeAriaLabel: 'סגירה',
    allDone: 'השגת/ה 100% בכל הנוטריינטים השבוע.',
    toGo: (amountWithUnit, percent) => `נשארו ${amountWithUnit} · ${percent}%`,
  },
  ar: {
    title: 'الناقص للوصول إلى 100%',
    closeAriaLabel: 'إغلاق',
    allDone: 'لقد حقّقت 100% في كل شيء هذا الأسبوع.',
    toGo: (amountWithUnit, percent) => `متبقّي ${amountWithUnit} · ${percent}%`,
  },
}

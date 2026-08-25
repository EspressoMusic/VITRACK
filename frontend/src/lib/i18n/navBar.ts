import type { Lang } from './lang'

interface NavBarStrings {
  calendar: string
  insights: string
  camera: string
}

export const NAV_BAR_STRINGS: Record<Lang, NavBarStrings> = {
  en: {
    calendar: 'Calendar',
    insights: 'Insights',
    camera: 'Camera',
  },
  he: {
    calendar: 'יומן',
    insights: 'תובנות',
    camera: 'מצלמה',
  },
  ar: {
    calendar: 'التقويم',
    insights: 'التحليلات',
    camera: 'الكاميرا',
  },
}

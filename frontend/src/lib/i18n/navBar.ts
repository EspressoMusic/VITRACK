import type { Lang } from './lang'

interface NavBarStrings {
  calendar: string
  insights: string
  camera: string
  superfoods: string
  settings: string
}

export const NAV_BAR_STRINGS: Record<Lang, NavBarStrings> = {
  en: {
    calendar: 'Calendar',
    insights: 'Insights',
    camera: 'Camera',
    superfoods: 'Superfoods',
    settings: 'Settings',
  },
  he: {
    calendar: 'יומן',
    insights: 'תובנות',
    camera: 'מצלמה',
    superfoods: 'מאכלי על',
    settings: 'הגדרות',
  },
  ar: {
    calendar: 'التقويم',
    insights: 'التحليلات',
    camera: 'الكاميرا',
    superfoods: 'الأطعمة الخارقة',
    settings: 'الإعدادات',
  },
}

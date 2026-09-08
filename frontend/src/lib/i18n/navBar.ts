import type { Lang } from './lang'

interface NavBarStrings {
  calendar: string
  insights: string
  camera: string
  superfoods: string
  workouts: string
  settings: string
}

export const NAV_BAR_STRINGS: Record<Lang, NavBarStrings> = {
  en: {
    calendar: 'Calendar',
    insights: 'Insights',
    camera: 'Scan',
    superfoods: 'Superfoods',
    workouts: 'Workouts',
    settings: 'Settings',
  },
  he: {
    calendar: 'יומן',
    insights: 'תובנות',
    camera: 'מצלמה',
    superfoods: 'מאכלי על',
    workouts: 'אימונים',
    settings: 'הגדרות',
  },
  ar: {
    calendar: 'التقويم',
    insights: 'التحليلات',
    camera: 'الكاميرا',
    superfoods: 'الأطعمة الخارقة',
    workouts: 'التمارين',
    settings: 'الإعدادات',
  },
}

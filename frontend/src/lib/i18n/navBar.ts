import type { Lang } from './lang'

interface NavBarStrings {
  calendar: string
  insights: string
  camera: string
  superfoods: string
  chat: string
  settings: string
}

export const NAV_BAR_STRINGS: Record<Lang, NavBarStrings> = {
  en: {
    calendar: 'Calendar',
    insights: 'Insights',
    camera: 'Scan',
    superfoods: 'Superfoods',
    chat: 'Bot',
    settings: 'Settings',
  },
  he: {
    calendar: 'יומן',
    insights: 'תובנות',
    camera: 'מצלמה',
    superfoods: 'מאכלי על',
    chat: 'בוט',
    settings: 'הגדרות',
  },
  ar: {
    calendar: 'التقويم',
    insights: 'التحليلات',
    camera: 'الكاميرا',
    superfoods: 'الأطعمة الخارقة',
    chat: 'بوت',
    settings: 'الإعدادات',
  },
}

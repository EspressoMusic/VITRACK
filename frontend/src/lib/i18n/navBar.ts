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
    insights: 'התזונה שלי',
    camera: 'מצלמה',
    superfoods: 'האוכל שלי',
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

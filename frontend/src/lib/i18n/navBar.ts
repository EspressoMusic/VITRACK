import type { Lang } from './lang'

interface NavBarStrings {
  calendar: string
  insights: string
  superfoods: string
  chat: string
  settings: string
}

export const NAV_BAR_STRINGS: Record<Lang, NavBarStrings> = {
  en: {
    calendar: 'Calendar',
    insights: 'Insights',
    superfoods: 'Superfoods',
    chat: 'Bot',
    settings: 'Settings',
  },
  he: {
    calendar: 'יומן',
    insights: 'התזונה שלי',
    superfoods: 'האוכל שלי',
    chat: 'בוט',
    settings: 'הגדרות',
  },
  ar: {
    calendar: 'التقويم',
    insights: 'التحليلات',
    superfoods: 'الأطعمة الخارقة',
    chat: 'بوت',
    settings: 'الإعدادات',
  },
}

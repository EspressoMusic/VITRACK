import type { Lang } from './lang'

interface NavBarStrings {
  calendar: string
  insights: string
  superfoods: string
  chat: string
  farm: string
  settings: string
}

export const NAV_BAR_STRINGS: Record<Lang, NavBarStrings> = {
  en: {
    calendar: 'Calendar',
    insights: 'Insights',
    superfoods: 'Superfoods',
    chat: 'Bot',
    farm: 'Farm',
    settings: 'Settings',
  },
  he: {
    calendar: 'יומן',
    insights: 'התזונה שלי',
    superfoods: 'האוכל שלי',
    chat: 'בוט',
    farm: 'החווה',
    settings: 'הגדרות',
  },
  ar: {
    calendar: 'التقويم',
    insights: 'التحليلات',
    superfoods: 'الأطعمة الخارقة',
    chat: 'بوت',
    farm: 'المزرعة',
    settings: 'الإعدادات',
  },
}

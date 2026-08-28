import type { Lang } from './lang'

interface AppStrings {
  openSettingsAriaLabel: string
  openSuperfoodsAriaLabel: string
  closeSuperfoodsAriaLabel: string
}

export const APP_STRINGS: Record<Lang, AppStrings> = {
  en: {
    openSettingsAriaLabel: 'Open settings',
    openSuperfoodsAriaLabel: 'Open superfoods',
    closeSuperfoodsAriaLabel: 'Close superfoods',
  },
  he: {
    openSettingsAriaLabel: 'פתיחת ההגדרות',
    openSuperfoodsAriaLabel: 'פתיחת מאכלי על',
    closeSuperfoodsAriaLabel: 'סגירת מאכלי על',
  },
  ar: {
    openSettingsAriaLabel: 'فتح الإعدادات',
    openSuperfoodsAriaLabel: 'فتح الأطعمة الخارقة',
    closeSuperfoodsAriaLabel: 'إغلاق الأطعمة الخارقة',
  },
}

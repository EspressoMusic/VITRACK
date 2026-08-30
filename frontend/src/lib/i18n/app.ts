import type { Lang } from './lang'

interface AppStrings {
  openSettingsAriaLabel: string
  openSuperfoodsAriaLabel: string
  closeSuperfoodsAriaLabel: string
  openNutritionChatAriaLabel: string
}

export const APP_STRINGS: Record<Lang, AppStrings> = {
  en: {
    openSettingsAriaLabel: 'Open settings',
    openSuperfoodsAriaLabel: 'Open superfoods',
    closeSuperfoodsAriaLabel: 'Close superfoods',
    openNutritionChatAriaLabel: 'Ask the nutrition assistant',
  },
  he: {
    openSettingsAriaLabel: 'פתיחת ההגדרות',
    openSuperfoodsAriaLabel: 'פתיחת מאכלי על',
    closeSuperfoodsAriaLabel: 'סגירת מאכלי על',
    openNutritionChatAriaLabel: 'שאלו את עוזר התזונה',
  },
  ar: {
    openSettingsAriaLabel: 'فتح الإعدادات',
    openSuperfoodsAriaLabel: 'فتح الأطعمة الخارقة',
    closeSuperfoodsAriaLabel: 'إغلاق الأطعمة الخارقة',
    openNutritionChatAriaLabel: 'اسأل مساعد التغذية',
  },
}

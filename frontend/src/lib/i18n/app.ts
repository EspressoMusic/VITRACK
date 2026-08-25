import type { Lang } from './lang'

interface AppStrings {
  openSettingsAriaLabel: string
}

export const APP_STRINGS: Record<Lang, AppStrings> = {
  en: {
    openSettingsAriaLabel: 'Open settings',
  },
  he: {
    openSettingsAriaLabel: 'פתיחת ההגדרות',
  },
  ar: {
    openSettingsAriaLabel: 'فتح الإعدادات',
  },
}

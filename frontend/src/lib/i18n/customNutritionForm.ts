import type { Lang } from './lang'

export interface CustomNutritionFormStrings {
  namePlaceholder: string
}

export const CUSTOM_NUTRITION_FORM_STRINGS: Record<Lang, CustomNutritionFormStrings> = {
  en: {
    namePlaceholder: 'Food or supplement name…',
  },
  he: {
    namePlaceholder: 'הקלד/י שם של מזון או תוסף…',
  },
  ar: {
    namePlaceholder: 'اسم الطعام أو المكمّل…',
  },
}

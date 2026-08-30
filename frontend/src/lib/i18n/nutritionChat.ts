import type { Lang } from './lang'

export interface NutritionChatStrings {
  placeholder: string
  sendAriaLabel: string
  closeAriaLabel: string
  errorMessage: string
}

export const NUTRITION_CHAT_STRINGS: Record<Lang, NutritionChatStrings> = {
  en: {
    placeholder: 'Ask about a food or nutrient...',
    sendAriaLabel: 'Send',
    closeAriaLabel: 'Close',
    errorMessage: 'Something went wrong. Please try again.',
  },
  he: {
    placeholder: 'שאלו על מאכל או ויטמין...',
    sendAriaLabel: 'שליחה',
    closeAriaLabel: 'סגירה',
    errorMessage: 'משהו השתבש. נסו שוב.',
  },
  ar: {
    placeholder: 'اسأل عن طعام أو عنصر غذائي...',
    sendAriaLabel: 'إرسال',
    closeAriaLabel: 'إغلاق',
    errorMessage: 'حدث خطأ ما. حاول مرة أخرى.',
  },
}

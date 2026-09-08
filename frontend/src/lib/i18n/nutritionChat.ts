import type { Lang } from './lang'

export interface NutritionChatStrings {
  title: string
  placeholder: string
  sendAriaLabel: string
  closeAriaLabel: string
  errorMessage: string
  greeting: string
  startButton: string
  expandAriaLabel: string
  collapseAriaLabel: string
}

export const NUTRITION_CHAT_STRINGS: Record<Lang, NutritionChatStrings> = {
  en: {
    title: 'Nutrition Bot',
    placeholder: 'Ask about a food or nutrient...',
    sendAriaLabel: 'Send',
    closeAriaLabel: 'Close',
    errorMessage: 'Something went wrong. Please try again.',
    greeting: 'Hi! Ask me anything about food or nutrition 🙂',
    startButton: 'Ask the bot 💬',
    expandAriaLabel: 'Expand',
    collapseAriaLabel: 'Collapse',
  },
  he: {
    title: 'בוט התזונה',
    placeholder: 'שאלו על מאכל או ויטמין...',
    sendAriaLabel: 'שליחה',
    closeAriaLabel: 'סגירה',
    errorMessage: 'משהו השתבש. נסו שוב.',
    greeting: 'היי! אפשר לשאול אותי כל דבר על אוכל ותזונה 🙂',
    startButton: 'שאל את הבוט 💬',
    expandAriaLabel: 'הגדלה',
    collapseAriaLabel: 'הקטנה',
  },
  ar: {
    title: 'بوت التغذية',
    placeholder: 'اسأل عن طعام أو عنصر غذائي...',
    sendAriaLabel: 'إرسال',
    closeAriaLabel: 'إغلاق',
    errorMessage: 'حدث خطأ ما. حاول مرة أخرى.',
    greeting: 'مرحبًا! اسألني أي شيء عن الطعام والتغذية 🙂',
    startButton: 'اسأل البوت 💬',
    expandAriaLabel: 'تكبير',
    collapseAriaLabel: 'تصغير',
  },
}

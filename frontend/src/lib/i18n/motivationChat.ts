import type { Lang } from './lang'

export interface MotivationChatStrings {
  title: string
  greeting: string
  placeholder: string
  sendAriaLabel: string
  errorMessage: string
  expandAriaLabel: string
  collapseAriaLabel: string
}

export const MOTIVATION_CHAT_STRINGS: Record<Lang, MotivationChatStrings> = {
  en: {
    title: 'Jackie the Tough Coach',
    greeting: 'You showed up. Now stop stalling and move.',
    placeholder: 'Tell me how you feel…',
    sendAriaLabel: 'Send message',
    errorMessage: "Couldn't reach your coach right now. Try again in a bit.",
    expandAriaLabel: 'Expand',
    collapseAriaLabel: 'Collapse',
  },
  he: {
    title: "ג'קי המאמן הקשוח",
    greeting: 'הגעת. מספיק לפטפט, זוז.',
    placeholder: 'ספר לי איך אתה מרגיש…',
    sendAriaLabel: 'שליחת הודעה',
    errorMessage: 'לא הצלחתי להתחבר למאמן כרגע. נסה שוב בעוד רגע.',
    expandAriaLabel: 'הגדלה',
    collapseAriaLabel: 'הקטנה',
  },
  ar: {
    title: 'جاكي المدرب القاسي',
    greeting: 'وصلت. كفى كلامًا، تحرك.',
    placeholder: 'أخبرني كيف تشعر…',
    sendAriaLabel: 'إرسال رسالة',
    errorMessage: 'تعذّر الوصول إلى المدرب الآن. حاول مرة أخرى بعد قليل.',
    expandAriaLabel: 'تكبير',
    collapseAriaLabel: 'تصغير',
  },
}

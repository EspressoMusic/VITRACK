import type { Lang } from './i18n/lang'

export type ChallengeTemplateId =
  | 'reduceSugar'
  | 'moreVegetables'
  | 'moreWater'
  | 'moreProtein'
  | 'lessProcessed'
  | 'moreFiber'
  | 'lessSalt'
  | 'moreFruit'
  | 'lessSnacking'
  | 'lessCaffeine'
  | 'noSodaDrinks'
  | 'smallerPortions'

export const CHALLENGE_TEMPLATE_IDS: ChallengeTemplateId[] = [
  'reduceSugar',
  'moreVegetables',
  'moreWater',
  'moreProtein',
  'lessProcessed',
  'moreFiber',
  'lessSalt',
  'moreFruit',
  'lessSnacking',
  'lessCaffeine',
  'noSodaDrinks',
  'smallerPortions',
]

export interface ChallengeTemplate {
  emoji: string
  label: string
}

export const CHALLENGE_TEMPLATES: Record<Lang, Record<ChallengeTemplateId, ChallengeTemplate>> = {
  en: {
    reduceSugar: { emoji: '🍭', label: 'Less sugar' },
    moreVegetables: { emoji: '🥦', label: 'More veggies' },
    moreWater: { emoji: '💧', label: 'More water' },
    moreProtein: { emoji: '🍗', label: 'More protein' },
    lessProcessed: { emoji: '🚫', label: 'Less processed' },
    moreFiber: { emoji: '🌾', label: 'More fiber' },
    lessSalt: { emoji: '🧂', label: 'Less salt' },
    moreFruit: { emoji: '🍎', label: 'More fruit' },
    lessSnacking: { emoji: '🌙', label: 'Less snacking' },
    lessCaffeine: { emoji: '☕', label: 'Less caffeine' },
    noSodaDrinks: { emoji: '🥤', label: 'No sugary drinks' },
    smallerPortions: { emoji: '🍽️', label: 'Smaller portions' },
  },
  he: {
    reduceSugar: { emoji: '🍭', label: 'פחות סוכר' },
    moreVegetables: { emoji: '🥦', label: 'יותר ירקות' },
    moreWater: { emoji: '💧', label: 'יותר מים' },
    moreProtein: { emoji: '🍗', label: 'יותר חלבון' },
    lessProcessed: { emoji: '🚫', label: 'פחות מעובד' },
    moreFiber: { emoji: '🌾', label: 'יותר סיבים' },
    lessSalt: { emoji: '🧂', label: 'פחות מלח' },
    moreFruit: { emoji: '🍎', label: 'יותר פירות' },
    lessSnacking: { emoji: '🌙', label: 'פחות נשנושים' },
    lessCaffeine: { emoji: '☕', label: 'פחות קפאין' },
    noSodaDrinks: { emoji: '🥤', label: 'בלי משקאות ממותקים' },
    smallerPortions: { emoji: '🍽️', label: 'מנות קטנות' },
  },
  ar: {
    reduceSugar: { emoji: '🍭', label: 'سكر أقل' },
    moreVegetables: { emoji: '🥦', label: 'خضار أكثر' },
    moreWater: { emoji: '💧', label: 'ماء أكثر' },
    moreProtein: { emoji: '🍗', label: 'بروتين أكثر' },
    lessProcessed: { emoji: '🚫', label: 'أقل تصنيعاً' },
    moreFiber: { emoji: '🌾', label: 'ألياف أكثر' },
    lessSalt: { emoji: '🧂', label: 'ملح أقل' },
    moreFruit: { emoji: '🍎', label: 'فواكه أكثر' },
    lessSnacking: { emoji: '🌙', label: 'وجبات خفيفة أقل' },
    lessCaffeine: { emoji: '☕', label: 'كافيين أقل' },
    noSodaDrinks: { emoji: '🥤', label: 'بدون مشروبات سكرية' },
    smallerPortions: { emoji: '🍽️', label: 'حصص أصغر' },
  },
}

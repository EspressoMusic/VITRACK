import type { NutrientBucket } from '../nutrientBuckets'
import type { Lang } from './lang'

export interface NutrientFilterChrome {
  ariaLabel: string
  labels: Record<NutrientBucket, string>
  /** Labels for the specific vitamins shown as a food's headline nutrient amount (see superfoods.ts). */
  vitaminLabels: { vitaminC: string; vitaminA: string }
}

export const NUTRIENT_FILTER_CHROME: Record<Lang, NutrientFilterChrome> = {
  en: {
    ariaLabel: 'Filter',
    labels: { vitamins: 'Vitamins', protein: 'Protein', carbs: 'Carbs', fats: 'Fats' },
    vitaminLabels: { vitaminC: 'Vitamin C', vitaminA: 'Vitamin A' },
  },
  he: {
    ariaLabel: 'סינון',
    labels: { vitamins: 'ויטמינים', protein: 'חלבון', carbs: 'פחמימות', fats: 'שומנים' },
    vitaminLabels: { vitaminC: 'ויטמין C', vitaminA: 'ויטמין A' },
  },
  ar: {
    ariaLabel: 'تصفية',
    labels: { vitamins: 'فيتامينات', protein: 'بروتين', carbs: 'كربوهيدرات', fats: 'دهون' },
    vitaminLabels: { vitaminC: 'فيتامين C', vitaminA: 'فيتامين A' },
  },
}

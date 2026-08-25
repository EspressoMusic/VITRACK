import type { CoverageStatus } from '../nutrients'
import type { Lang } from './lang'

/**
 * Shared translated display copy used by several small nutrient components
 * (NutrientBar, and anywhere else that needs a translated status word or a
 * translated accessible label). `STATUS_LABEL` in lib/nutrients.ts stays
 * English-only and unedited — this is the translated counterpart.
 */
export const NUTRIENT_STATUS_LABEL: Record<Lang, Record<CoverageStatus, string>> = {
  en: {
    critical: 'Very low',
    serious: 'Low',
    warning: 'Slightly low',
    good: 'On track',
  },
  he: {
    critical: 'נמוך מאוד',
    serious: 'נמוך',
    warning: 'נמוך מעט',
    good: 'בקצב טוב',
  },
  ar: {
    critical: 'منخفض جدًا',
    serious: 'منخفض',
    warning: 'منخفض قليلًا',
    good: 'على المسار الصحيح',
  },
}

export interface NutrientBarStrings {
  /** Accessible label for the meal-target progress bar, e.g. "Vitamin C: 40% of meal target, Low". */
  ariaLabel: (nutrientName: string, percent: number, statusLabel: string) => string
}

export const NUTRIENT_BAR_STRINGS: Record<Lang, NutrientBarStrings> = {
  en: {
    ariaLabel: (name, percent, statusLabel) => `${name}: ${percent}% of meal target, ${statusLabel}`,
  },
  he: {
    ariaLabel: (name, percent, statusLabel) => `${name}: ${percent}% מיעד הארוחה, ${statusLabel}`,
  },
  ar: {
    ariaLabel: (name, percent, statusLabel) => `${name}: ${percent}% من هدف الوجبة، ${statusLabel}`,
  },
}

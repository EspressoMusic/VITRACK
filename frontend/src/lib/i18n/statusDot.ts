import type { Lang } from './lang'
import type { CoverageStatus } from '../nutrients'

export const STATUS_DOT_STRINGS: Record<Lang, Record<CoverageStatus, string>> = {
  en: {
    critical: 'Very low',
    serious: 'Low',
    warning: 'Slightly low',
    good: 'On track',
  },
  he: {
    critical: 'נמוך מאוד',
    serious: 'נמוך',
    warning: 'נמוך במקצת',
    good: 'במסלול',
  },
  ar: {
    critical: 'منخفض جدًا',
    serious: 'منخفض',
    warning: 'منخفض قليلًا',
    good: 'على المسار الصحيح',
  },
}

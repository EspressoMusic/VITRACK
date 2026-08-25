import type { Lang } from './lang'

interface LegalPanelStrings {
  title: string
  closeAria: string
  lastUpdatedPrefix: string
}

/**
 * Chrome-only strings for LegalPanel. The legal document body itself (LEGAL_PARTS in
 * ../legalContent.ts — part titles/tab labels, headings, and all paragraph text) stays
 * English-only by deliberate decision: it's the actual Terms of Use / Privacy Policy text,
 * long and legally load-bearing, and lives in a shared file outside this workstream's scope.
 * Only the panel's own UI chrome (header title, close button, "last updated" label) is translated.
 */
export const LEGAL_PANEL_STRINGS: Record<Lang, LegalPanelStrings> = {
  en: {
    title: 'Terms & Privacy Policy',
    closeAria: 'Close',
    lastUpdatedPrefix: 'Last updated:',
  },
  he: {
    title: 'תנאי שימוש ומדיניות פרטיות',
    closeAria: 'סגירה',
    lastUpdatedPrefix: 'עודכן לאחרונה:',
  },
  ar: {
    title: 'الشروط وسياسة الخصوصية',
    closeAria: 'إغلاق',
    lastUpdatedPrefix: 'آخر تحديث:',
  },
}

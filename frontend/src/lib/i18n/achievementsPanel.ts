import type { Lang } from './lang'

interface AchievementsPanelStrings {
  title: string
  closeAria: string
  progress: (have: number, need: number) => string
  allUnlocked: string
  tierLabel: (days: number) => string
  settingsRow: string
  settingsRowDesc: (unlocked: number, total: number) => string
}

export const ACHIEVEMENTS_PANEL_STRINGS: Record<Lang, AchievementsPanelStrings> = {
  en: {
    title: 'Achievements',
    closeAria: 'Close achievements',
    progress: (have, need) => `${have}/${need} goal days met to unlock the next doll`,
    allUnlocked: 'All dolls unlocked! Keep hitting your goals to stay in shape.',
    tierLabel: (days) => (days === 1 ? '1 day' : `${days} days`),
    settingsRow: 'Achievements',
    settingsRowDesc: (unlocked, total) => `${unlocked}/${total} dolls unlocked`,
  },
  he: {
    title: 'הישגים',
    closeAria: 'סגירת ההישגים',
    progress: (have, need) => `${have}/${need} ימי יעד כדי לפתוח את הבובה הבאה`,
    allUnlocked: 'כל הבובות נפתחו! תמשיכו לעמוד ביעדים כדי להישאר בכושר.',
    tierLabel: (days) => (days === 1 ? 'יום אחד' : `${days} ימים`),
    settingsRow: 'הישגים',
    settingsRowDesc: (unlocked, total) => `${unlocked}/${total} בובות נפתחו`,
  },
  ar: {
    title: 'الإنجازات',
    closeAria: 'إغلاق الإنجازات',
    progress: (have, need) => `${have}/${need} أيام تحقيق الهدف لفتح الدمية التالية`,
    allUnlocked: 'تم فتح كل الدمى! واصل تحقيق أهدافك للبقاء بلياقة.',
    tierLabel: (days) => (days === 1 ? 'يوم واحد' : `${days} أيام`),
    settingsRow: 'الإنجازات',
    settingsRowDesc: (unlocked, total) => `${unlocked}/${total} دمى مفتوحة`,
  },
}

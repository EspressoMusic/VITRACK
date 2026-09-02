import type { Lang } from './lang'

interface AchievementsPanelStrings {
  title: string
  closeAria: string
  progress: (have: number, need: number) => string
  allUnlocked: string
  tierLabel: (days: number) => string
  settingsRow: string
  settingsRowDesc: (unlocked: number, total: number) => string
  tierUnlockedHint: string
  tierNeededHint: (remaining: number) => string
  goalDayExplainer: string
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
    tierUnlockedHint: "You've unlocked this one. Nice work!",
    tierNeededHint: (remaining) => (remaining === 1 ? 'Hit 1 more goal day to unlock this.' : `Hit ${remaining} more goal days to unlock this.`),
    goalDayExplainer: 'A goal day is any day you hit all your vitamin goals.',
  },
  he: {
    title: 'הישגים',
    closeAria: 'סגירת ההישגים',
    progress: (have, need) => `${have}/${need} ימי יעד כדי לפתוח את הבובה הבאה`,
    allUnlocked: 'כל הבובות נפתחו! תמשיכו לעמוד ביעדים כדי להישאר בכושר.',
    tierLabel: (days) => (days === 1 ? 'יום אחד' : `${days} ימים`),
    settingsRow: 'הישגים',
    settingsRowDesc: (unlocked, total) => `${unlocked}/${total} בובות נפתחו`,
    tierUnlockedHint: 'פתחת את ההישג הזה. כל הכבוד!',
    tierNeededHint: (remaining) => (remaining === 1 ? 'עוד יום יעד אחד כדי לפתוח את זה.' : `עוד ${remaining} ימי יעד כדי לפתוח את זה.`),
    goalDayExplainer: 'יום יעד הוא כל יום שבו עמדתם בכל יעדי הויטמינים שלכם.',
  },
  ar: {
    title: 'الإنجازات',
    closeAria: 'إغلاق الإنجازات',
    progress: (have, need) => `${have}/${need} أيام تحقيق الهدف لفتح الدمية التالية`,
    allUnlocked: 'تم فتح كل الدمى! واصل تحقيق أهدافك للبقاء بلياقة.',
    tierLabel: (days) => (days === 1 ? 'يوم واحد' : `${days} أيام`),
    settingsRow: 'الإنجازات',
    settingsRowDesc: (unlocked, total) => `${unlocked}/${total} دمى مفتوحة`,
    tierUnlockedHint: 'لقد فتحت هذا الإنجاز. أحسنت!',
    tierNeededHint: (remaining) => (remaining === 1 ? 'يوم هدف واحد إضافي لفتح هذا.' : `${remaining} أيام هدف إضافية لفتح هذا.`),
    goalDayExplainer: 'يوم الهدف هو أي يوم حققت فيه كل أهداف الفيتامينات.',
  },
}

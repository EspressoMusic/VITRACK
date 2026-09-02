import type { Lang } from './lang'

interface AchievementsPanelStrings {
  title: string
  closeAria: string
  progress: (have: number, need: number) => string
  allUnlocked: string
  tierLabel: (days: number) => string
  tierName: (id: string) => string
  settingsRow: string
  settingsRowDesc: (unlocked: number, total: number) => string
  tierUnlockedHint: string
  tierNeededHint: (remaining: number) => string
  goalDayExplainer: string
}

/** Short medal titles per tier id, keyed to lib/achievements.ts's ACHIEVEMENT_TIERS. */
const TIER_NAMES: Record<Lang, Record<string, string>> = {
  en: {
    'first-day': 'Healthy Start',
    'three-days': 'Building the Habit',
    week: 'One Week Strong',
    'two-weeks': 'Consistent Nutrition',
    month: 'One Month Milestone',
    'two-months': 'Proper & Consistent Nutrition',
    'three-months': 'Quarter-Year Champion',
    'six-months': 'Half-Year Lifestyle',
    year: 'Full Year Legend',
  },
  he: {
    'first-day': 'התחלה בריאה',
    'three-days': 'בונים הרגל',
    week: 'שבוע של תזונה נכונה',
    'two-weeks': 'תזונה עקבית',
    month: 'חודש שלם של תזונה נכונה',
    'two-months': 'תזונה נכונה ועקבית',
    'three-months': 'רבע שנה של הצלחה',
    'six-months': 'אורח חיים בריא',
    year: 'שנה שלמה של מצוינות',
  },
  ar: {
    'first-day': 'بداية صحية',
    'three-days': 'بناء العادة',
    week: 'أسبوع من التغذية السليمة',
    'two-weeks': 'تغذية ثابتة',
    month: 'شهر كامل من التغذية السليمة',
    'two-months': 'تغذية سليمة ومنتظمة',
    'three-months': 'بطل ربع السنة',
    'six-months': 'أسلوب حياة صحي',
    year: 'عام كامل من التميز',
  },
}

export const ACHIEVEMENTS_PANEL_STRINGS: Record<Lang, AchievementsPanelStrings> = {
  en: {
    title: 'Achievements',
    closeAria: 'Close achievements',
    progress: (have, need) => `${have}/${need} goal days met to unlock the next medal`,
    allUnlocked: 'All medals unlocked! Keep hitting your goals to stay in shape.',
    tierLabel: (days) => (days === 1 ? '1 day' : `${days} days`),
    tierName: (id) => TIER_NAMES.en[id] ?? '',
    settingsRow: 'Achievements',
    settingsRowDesc: (unlocked, total) => `${unlocked}/${total} medals unlocked`,
    tierUnlockedHint: "You've unlocked this one. Nice work!",
    tierNeededHint: (remaining) => (remaining === 1 ? 'Hit 1 more goal day to unlock this.' : `Hit ${remaining} more goal days to unlock this.`),
    goalDayExplainer: 'A goal day is any day you hit all your vitamin goals.',
  },
  he: {
    title: 'הישגים',
    closeAria: 'סגירת ההישגים',
    progress: (have, need) => `${have}/${need} ימי יעד כדי לפתוח את המדליה הבאה`,
    allUnlocked: 'כל המדליות נפתחו! תמשיכו לעמוד ביעדים כדי להישאר בכושר.',
    tierLabel: (days) => (days === 1 ? 'יום אחד' : `${days} ימים`),
    tierName: (id) => TIER_NAMES.he[id] ?? '',
    settingsRow: 'הישגים',
    settingsRowDesc: (unlocked, total) => `${unlocked}/${total} מדליות נפתחו`,
    tierUnlockedHint: 'פתחת את ההישג הזה. כל הכבוד!',
    tierNeededHint: (remaining) => (remaining === 1 ? 'עוד יום יעד אחד כדי לפתוח את זה.' : `עוד ${remaining} ימי יעד כדי לפתוח את זה.`),
    goalDayExplainer: 'יום יעד הוא כל יום שבו עמדתם בכל יעדי הויטמינים שלכם.',
  },
  ar: {
    title: 'الإنجازات',
    closeAria: 'إغلاق الإنجازات',
    progress: (have, need) => `${have}/${need} أيام تحقيق الهدف لفتح الميدالية التالية`,
    allUnlocked: 'تم فتح كل الميداليات! واصل تحقيق أهدافك للبقاء بلياقة.',
    tierLabel: (days) => (days === 1 ? 'يوم واحد' : `${days} أيام`),
    tierName: (id) => TIER_NAMES.ar[id] ?? '',
    settingsRow: 'الإنجازات',
    settingsRowDesc: (unlocked, total) => `${unlocked}/${total} ميداليات مفتوحة`,
    tierUnlockedHint: 'لقد فتحت هذا الإنجاز. أحسنت!',
    tierNeededHint: (remaining) => (remaining === 1 ? 'يوم هدف واحد إضافي لفتح هذا.' : `${remaining} أيام هدف إضافية لفتح هذا.`),
    goalDayExplainer: 'يوم الهدف هو أي يوم حققت فيه كل أهداف الفيتامينات.',
  },
}

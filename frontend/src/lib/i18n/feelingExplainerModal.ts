import type { Lang } from './lang'

export interface FeelingExplainerModalStrings {
  closeAriaLabel: string
  todaySentence: (feeling: string) => string
  whyLabel: string
  /** Short, kid-simple cause: "Today you didn't get enough {name} — it's responsible for {role}." */
  whySentence: (nutrientName: string, role: string) => string
  helpLabel: string
  /** One concrete, casual food suggestion — not a nutritional recommendation, just an idea. */
  solutionSentence: (food: string) => string
  /** Small-print caveat shown right above the suggestion: general idea only, not medical advice,
   *  mind allergies. Keep terse — it sits in small muted text, not a full paragraph. */
  disclaimer: string
  gotIt: string
}

export const FEELING_EXPLAINER_MODAL_STRINGS: Record<Lang, FeelingExplainerModalStrings> = {
  en: {
    closeAriaLabel: 'Close',
    todaySentence: (feeling) => `${feeling.charAt(0).toUpperCase()}${feeling.slice(1)} today 😴`,
    whyLabel: 'Why?',
    whySentence: (name, role) => `Today you didn't get enough ${name} — it's responsible for ${role}.`,
    helpLabel: 'A tip for you',
    solutionSentence: (food) => `Maybe try eating a little ${food} today. 💡`,
    disclaimer: 'Just a general idea, not medical advice — mind any allergies.',
    gotIt: 'Got it!',
  },
  he: {
    closeAriaLabel: 'סגירה',
    todaySentence: (feeling) => `${feeling} היום 😴`,
    whyLabel: 'למה?',
    whySentence: (name, role) => `היום לא אכלת מספיק ${name} — זה אחראי על ${role}.`,
    helpLabel: 'טיפ בשבילך',
    solutionSentence: (food) => `אולי כדאי לנסות היום קצת ${food}. 💡`,
    disclaimer: 'רעיון כללי בלבד, לא המלצה רפואית — שימו לב לאלרגיות.',
    gotIt: 'הבנתי!',
  },
  ar: {
    closeAriaLabel: 'إغلاق',
    todaySentence: (feeling) => `${feeling} اليوم 😴`,
    whyLabel: 'لماذا؟',
    whySentence: (name, role) => `اليوم لم تحصل على ما يكفي من ${name} — وهو مسؤول عن ${role}.`,
    helpLabel: 'نصيحة لك',
    solutionSentence: (food) => `ربما جرّب تناول القليل من ${food} اليوم. 💡`,
    disclaimer: 'مجرد فكرة عامة، وليست نصيحة طبية — انتبه لأي حساسية.',
    gotIt: 'فهمت!',
  },
}

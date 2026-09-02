import type { Lang } from './lang'

interface ThankYouPageStrings {
  title: string
  subtitle: string
  getStarted: string
  savedTo: (email: string) => string
  signInWithGoogle: string
  continueWithoutSaving: string
  agreePrefix: string
  agreeLinkLabel: string
  agreeErrorToast: string
}

export const THANK_YOU_PAGE_STRINGS: Record<Lang, ThankYouPageStrings> = {
  en: {
    title: "You're in!",
    subtitle: 'Real food, real vitamins, real energy — your transformation starts today.',
    getStarted: 'Get started',
    savedTo: (email) => `Saved to ${email}`,
    signInWithGoogle: 'Sign in with Google',
    continueWithoutSaving: 'Continue without saving',
    agreePrefix: 'I agree to the ',
    agreeLinkLabel: 'Terms & Privacy Policy',
    agreeErrorToast: 'Please agree to the Terms of Use first',
  },
  he: {
    title: 'את/ה בפנים!',
    subtitle: 'אוכל אמיתי, ויטמינים אמיתיים, אנרגיה אמיתית — השינוי שלך מתחיל היום.',
    getStarted: 'בואו נתחיל',
    savedTo: (email) => `נשמר עבור ${email}`,
    signInWithGoogle: 'התחברות עם Google',
    continueWithoutSaving: 'המשך בלי לשמור',
    agreePrefix: 'אני מאשר/ת את ',
    agreeLinkLabel: 'תנאי השימוש ומדיניות הפרטיות',
    agreeErrorToast: 'יש לאשר קודם את תנאי השימוש',
  },
  ar: {
    title: 'مبروك الانضمام!',
    subtitle: 'طعام حقيقي، فيتامينات حقيقية، طاقة حقيقية — رحلة التحوّل تبدأ اليوم.',
    getStarted: 'ابدأ الآن',
    savedTo: (email) => `تم الحفظ في ${email}`,
    signInWithGoogle: 'تسجيل الدخول عبر Google',
    continueWithoutSaving: 'المتابعة بدون حفظ',
    agreePrefix: 'أوافق على ',
    agreeLinkLabel: 'الشروط وسياسة الخصوصية',
    agreeErrorToast: 'يرجى الموافقة على شروط الاستخدام أولاً',
  },
}

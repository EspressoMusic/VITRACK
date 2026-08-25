import type { Lang } from './lang'

interface PaywallPanelStrings {
  headline: string
  features: [string, string, string, string]
  yearly: { title: string; note: string; badge: string; period: string }
  monthly: { title: string; period: string }
  agreePrefix: string
  agreeLinkLabel: string
  agreeErrorModal: string
  subscribeCta: string
  processingCta: string
  footerNote: string
  alreadyPurchased: string
  errors: {
    accountSetup: string
    checkoutFailed: string
    checkoutUnavailable: string
  }
}

export const PAYWALL_PANEL_STRINGS: Record<Lang, PaywallPanelStrings> = {
  en: {
    headline: 'One step from a whole new you',
    features: [
      'Vitamin & mineral targets',
      'AI meal photo analysis',
      'Calendar history & insights',
      'Deficiency alerts & food tips',
    ],
    yearly: { title: 'Yearly', note: '≈ $8.25/mo', badge: 'Save 57%', period: '/year' },
    monthly: { title: 'Monthly', period: '/month' },
    agreePrefix: 'I agree to the ',
    agreeLinkLabel: 'Terms & Privacy Policy',
    agreeErrorModal: 'Please agree to the Terms of Use first',
    subscribeCta: 'Unlock my plan',
    processingCta: 'Processing…',
    footerNote: 'Auto-renews, cancel anytime. Secure checkout by Paddle.',
    alreadyPurchased: 'Already purchased?',
    errors: {
      accountSetup: 'Just a moment — setting up your account. Please try again.',
      checkoutFailed: 'Checkout failed. Please try again.',
      checkoutUnavailable: 'Checkout is unavailable right now. Please try again later.',
    },
  },
  he: {
    headline: 'צעד אחד מגרסה חדשה שלך',
    features: [
      'יעדי ויטמינים ומינרלים',
      'ניתוח תמונות ארוחה ב-AI',
      'היסטוריית לוח שנה ותובנות',
      'התראות על חוסרים וטיפים לתזונה',
    ],
    yearly: { title: 'שנתי', note: '≈ $8.25/חודש', badge: 'חיסכון של 57%', period: '/שנה' },
    monthly: { title: 'חודשי', period: '/חודש' },
    agreePrefix: 'אני מאשר/ת את ',
    agreeLinkLabel: 'תנאי השימוש ומדיניות הפרטיות',
    agreeErrorModal: 'יש לאשר קודם את תנאי השימוש',
    subscribeCta: 'לפתיחת התוכנית שלי',
    processingCta: 'מעבד…',
    footerNote: 'מתחדש אוטומטית, אפשר לבטל בכל עת. תשלום מאובטח דרך Paddle.',
    alreadyPurchased: 'כבר רכשת?',
    errors: {
      accountSetup: 'רגע אחד — מגדירים את החשבון שלך. נסו שוב.',
      checkoutFailed: 'התשלום נכשל. נסו שוב.',
      checkoutUnavailable: 'התשלום אינו זמין כרגע. נסו שוב מאוחר יותר.',
    },
  },
  ar: {
    headline: 'خطوة واحدة من نسختك الجديدة',
    features: [
      'أهداف الفيتامينات والمعادن',
      'تحليل صور الوجبات بالذكاء الاصطناعي',
      'سجل التقويم والرؤى',
      'تنبيهات النقص ونصائح غذائية',
    ],
    yearly: { title: 'سنوي', note: '≈ $8.25/شهريًا', badge: 'وفّر 57%', period: '/سنويًا' },
    monthly: { title: 'شهري', period: '/شهريًا' },
    agreePrefix: 'أوافق على ',
    agreeLinkLabel: 'الشروط وسياسة الخصوصية',
    agreeErrorModal: 'يرجى الموافقة على شروط الاستخدام أولاً',
    subscribeCta: 'افتح خطتي',
    processingCta: 'جارٍ المعالجة…',
    footerNote: 'يتجدد تلقائيًا، يمكن الإلغاء في أي وقت. دفع آمن عبر Paddle.',
    alreadyPurchased: 'اشتريت من قبل؟',
    errors: {
      accountSetup: 'لحظة واحدة — يتم إعداد حسابك. حاول مرة أخرى.',
      checkoutFailed: 'فشلت عملية الدفع. حاول مرة أخرى.',
      checkoutUnavailable: 'الدفع غير متاح حاليًا. حاول مرة أخرى لاحقًا.',
    },
  },
}

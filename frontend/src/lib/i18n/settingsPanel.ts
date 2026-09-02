import type { Lang } from './lang'

interface SettingsPanelStrings {
  title: string
  closeAriaLabel: string
  account: {
    heading: string
    signOut: string
    deleteAccount: string
    deleteConfirm: string
    cancel: string
    delete: string
    signInGoogle: string
    notConnected: string
    deleteAccountError: string
    agreePrefix: string
    agreeLinkLabel: string
    agreeErrorToast: string
  }
  subscription: {
    heading: string
    proPlan: (planLabel: string) => string
    yearly: string
    monthly: string
    manage: string
    freePlan: string
  }
  healthProfile: {
    heading: string
    retakeQuestionnaire: string
    retakeConfirm: string
    cancel: string
    retake: string
  }
  nutrients: {
    heading: string
    showAll: string
    showAllDesc: string
  }
  language: {
    heading: string
  }
  app: {
    heading: string
    downloadApp: string
    iosInstallHint: string
    vitaminReminders: string
    blockedInBrowser: string
  }
  data: {
    heading: string
    clearAllData: string
    clearConfirm: string
    cancel: string
    delete: string
  }
  support: {
    heading: string
    contactSupport: string
    termsAndPrivacy: string
  }
}

export const SETTINGS_PANEL_STRINGS: Record<Lang, SettingsPanelStrings> = {
  en: {
    title: 'Settings',
    closeAriaLabel: 'Close settings',
    account: {
      heading: 'Account',
      signOut: 'Sign out',
      deleteAccount: 'Delete account',
      deleteConfirm: "Deletes everything. Can't be undone.",
      cancel: 'Cancel',
      delete: 'Delete',
      signInGoogle: 'Sign in with Google',
      notConnected: 'Not connected yet.',
      deleteAccountError: 'Could not delete account.',
      agreePrefix: 'I agree to the ',
      agreeLinkLabel: 'Terms & Privacy Policy',
      agreeErrorToast: 'Please agree to the Terms of Use first',
    },
    subscription: {
      heading: 'Subscription',
      proPlan: (planLabel) => `Pro plan · ${planLabel}`,
      yearly: 'Yearly',
      monthly: 'Monthly',
      manage: 'Manage',
      freePlan: 'Free plan',
    },
    healthProfile: {
      heading: 'Health profile',
      retakeQuestionnaire: 'Retake questionnaire',
      retakeConfirm: 'This recalculates your targets from scratch.',
      cancel: 'Cancel',
      retake: 'Retake',
    },
    nutrients: {
      heading: 'Nutrients',
      showAll: 'Show all vitamins & minerals',
      showAllDesc: 'Off focuses the app on the 6 that matter most',
    },
    language: {
      heading: 'Language',
    },
    app: {
      heading: 'App',
      downloadApp: 'Download app',
      iosInstallHint: 'To install: tap the Share button in Safari, then "Add to Home Screen".',
      vitaminReminders: 'Vitamin reminders',
      blockedInBrowser: 'Blocked in browser settings',
    },
    data: {
      heading: 'Data',
      clearAllData: 'Clear all data',
      clearConfirm: "Deletes everything. Can't be undone.",
      cancel: 'Cancel',
      delete: 'Delete',
    },
    support: {
      heading: 'Support',
      contactSupport: 'Contact support',
      termsAndPrivacy: 'Terms & Privacy',
    },
  },
  he: {
    title: 'הגדרות',
    closeAriaLabel: 'סגירת ההגדרות',
    account: {
      heading: 'חשבון',
      signOut: 'התנתקות',
      deleteAccount: 'מחיקת חשבון',
      deleteConfirm: 'מוחק הכל. אי אפשר לבטל.',
      cancel: 'ביטול',
      delete: 'מחיקה',
      signInGoogle: 'התחברות עם Google',
      notConnected: 'עדיין לא מחובר.',
      deleteAccountError: 'לא הצלחנו למחוק את החשבון.',
      agreePrefix: 'אני מאשר/ת את ',
      agreeLinkLabel: 'תנאי השימוש ומדיניות הפרטיות',
      agreeErrorToast: 'יש לאשר קודם את תנאי השימוש',
    },
    subscription: {
      heading: 'מנוי',
      proPlan: (planLabel) => `מנוי Pro · ${planLabel}`,
      yearly: 'שנתי',
      monthly: 'חודשי',
      manage: 'ניהול',
      freePlan: 'מסלול חינמי',
    },
    healthProfile: {
      heading: 'פרופיל בריאותי',
      retakeQuestionnaire: 'מילוי השאלון מחדש',
      retakeConfirm: 'זה יחשב מחדש את היעדים שלך מאפס.',
      cancel: 'ביטול',
      retake: 'התחלה מחדש',
    },
    nutrients: {
      heading: 'נוטריינטים',
      showAll: 'הצגת כל הוויטמינים והמינרלים',
      showAllDesc: 'כבוי מתמקד ב-6 הכי חשובים',
    },
    language: {
      heading: 'שפה',
    },
    app: {
      heading: 'אפליקציה',
      downloadApp: 'הורדת האפליקציה',
      iosInstallHint: 'להתקנה: הקישו על כפתור השיתוף ב-Safari, ואז על "הוספה למסך הבית".',
      vitaminReminders: 'תזכורות ויטמינים',
      blockedInBrowser: 'חסום בהגדרות הדפדפן',
    },
    data: {
      heading: 'נתונים',
      clearAllData: 'מחיקת כל הנתונים',
      clearConfirm: 'מוחק הכל. אי אפשר לבטל.',
      cancel: 'ביטול',
      delete: 'מחיקה',
    },
    support: {
      heading: 'תמיכה',
      contactSupport: 'יצירת קשר עם התמיכה',
      termsAndPrivacy: 'תנאים ופרטיות',
    },
  },
  ar: {
    title: 'الإعدادات',
    closeAriaLabel: 'إغلاق الإعدادات',
    account: {
      heading: 'الحساب',
      signOut: 'تسجيل الخروج',
      deleteAccount: 'حذف الحساب',
      deleteConfirm: 'سيتم حذف كل شيء. لا يمكن التراجع.',
      cancel: 'إلغاء',
      delete: 'حذف',
      signInGoogle: 'تسجيل الدخول عبر Google',
      notConnected: 'غير متصل بعد.',
      deleteAccountError: 'تعذّر حذف الحساب.',
      agreePrefix: 'أوافق على ',
      agreeLinkLabel: 'الشروط وسياسة الخصوصية',
      agreeErrorToast: 'يرجى الموافقة على شروط الاستخدام أولاً',
    },
    subscription: {
      heading: 'الاشتراك',
      proPlan: (planLabel) => `اشتراك Pro · ${planLabel}`,
      yearly: 'سنوي',
      monthly: 'شهري',
      manage: 'إدارة',
      freePlan: 'الخطة المجانية',
    },
    healthProfile: {
      heading: 'الملف الصحي',
      retakeQuestionnaire: 'إعادة تعبئة الاستبيان',
      retakeConfirm: 'سيُعاد حساب أهدافك من الصفر.',
      cancel: 'إلغاء',
      retake: 'إعادة',
    },
    nutrients: {
      heading: 'العناصر الغذائية',
      showAll: 'إظهار كل الفيتامينات والمعادن',
      showAllDesc: 'عند الإيقاف يركّز التطبيق على أهم 6 فقط',
    },
    language: {
      heading: 'اللغة',
    },
    app: {
      heading: 'التطبيق',
      downloadApp: 'تنزيل التطبيق',
      iosInstallHint: 'للتثبيت: اضغط على زر المشاركة في Safari، ثم "إضافة إلى الشاشة الرئيسية".',
      vitaminReminders: 'تذكيرات الفيتامينات',
      blockedInBrowser: 'محظور في إعدادات المتصفح',
    },
    data: {
      heading: 'البيانات',
      clearAllData: 'مسح جميع البيانات',
      clearConfirm: 'سيتم حذف كل شيء. لا يمكن التراجع.',
      cancel: 'إلغاء',
      delete: 'حذف',
    },
    support: {
      heading: 'الدعم',
      contactSupport: 'التواصل مع الدعم',
      termsAndPrivacy: 'الشروط والخصوصية',
    },
  },
}

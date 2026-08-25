import type { Lang } from './lang'

export interface CameraPanelStrings {
  quantity: {
    gramsPlaceholder: string
    exactGrams: string
  }
  autocomplete: {
    namePlaceholder: string
    clearNameAriaLabel: string
  }
  cameraUnavailable: string
  scanErrors: {
    noFrame: string
    captureFailed: string
    readFailed: string
  }
  identify: {
    notRecognized: string
    serviceUnreachable: string
  }
  analyzeUnreachable: string
  overlay: {
    identifying: string
    gettingNutrients: string
  }
  /** Composes "<name> detected" — name is a live detector value, not translated. */
  detectedSuffix: (name: string) => string
  actions: {
    scanFood: string
    uploadPhoto: string
    logManually: string
  }
  confirm: {
    isCorrect: string
    confirm: string
    retakePhoto: string
  }
  quantityStage: {
    howMuch: string
    calculate: string
    back: string
  }
  manual: {
    cancel: string
    addCustomFood: string
  }
  custom: {
    useTheseValues: string
    backAriaLabel: string
  }
  result: {
    noFoodRecognized: string
    calculating: string
    getNutrients: string
    noStandoutNutrients: string
    save: string
    mealFallbackName: string
  }
  capturedMealAlt: string
  customEntryNote: string
  scaledFromCustomNote: string
}

export const CAMERA_PANEL_STRINGS: Record<Lang, CameraPanelStrings> = {
  en: {
    quantity: {
      gramsPlaceholder: 'grams',
      exactGrams: 'Exact grams',
    },
    autocomplete: {
      namePlaceholder: 'Type a food name…',
      clearNameAriaLabel: 'Clear food name',
    },
    cameraUnavailable: 'Camera unavailable or permission denied — use "Upload a photo" instead.',
    scanErrors: {
      noFrame: 'Could not capture a photo. Point the camera at the food and try again.',
      captureFailed: 'Could not capture a photo. Try again.',
      readFailed: 'Could not read that photo. Try a different one.',
    },
    identify: {
      notRecognized: "Couldn't recognize the food.",
      serviceUnreachable: 'Could not reach the food identification service. Check your connection and try again.',
    },
    analyzeUnreachable: 'Could not reach the analysis server. Is the backend running?',
    overlay: {
      identifying: 'Identifying food…',
      gettingNutrients: 'Getting nutrients…',
    },
    detectedSuffix: (name) => `${name} detected`,
    actions: {
      scanFood: 'Scan Food',
      uploadPhoto: 'Upload photo',
      logManually: 'Log manually',
    },
    confirm: {
      isCorrect: 'Is this correct?',
      confirm: 'Confirm',
      retakePhoto: 'Retake photo',
    },
    quantityStage: {
      howMuch: 'How much did you eat?',
      calculate: 'Calculate nutrients',
      back: 'Back',
    },
    manual: {
      cancel: 'Cancel',
      addCustomFood: 'Add custom food',
    },
    custom: {
      useTheseValues: 'Use these values',
      backAriaLabel: 'Back',
    },
    result: {
      noFoodRecognized: 'No food recognized in this photo. 😫',
      calculating: 'Calculating…',
      getNutrients: 'Get nutrients',
      noStandoutNutrients: 'No standout nutrients in this serving.',
      save: 'Save',
      mealFallbackName: 'Meal',
    },
    capturedMealAlt: 'Captured meal',
    customEntryNote: 'Nutrition facts entered manually from the product label.',
    scaledFromCustomNote: 'Calculated from your saved custom entry.',
  },
  he: {
    quantity: {
      gramsPlaceholder: 'גרם',
      exactGrams: 'גרמים מדויקים',
    },
    autocomplete: {
      namePlaceholder: 'הקלד/י שם של מזון…',
      clearNameAriaLabel: 'ניקוי שם המזון',
    },
    cameraUnavailable: 'המצלמה לא זמינה או שההרשאה נדחתה — השתמש/י ב"העלאת תמונה" במקום.',
    scanErrors: {
      noFrame: 'לא ניתן היה לצלם תמונה. כוון/י את המצלמה אל האוכל ונסה/י שוב.',
      captureFailed: 'לא ניתן היה לצלם תמונה. נסה/י שוב.',
      readFailed: 'לא ניתן היה לקרוא את התמונה. נסה/י תמונה אחרת.',
    },
    identify: {
      notRecognized: 'לא הצלחנו לזהות את המזון.',
      serviceUnreachable: 'לא ניתן להתחבר לשירות זיהוי המזון. בדוק/בדקי את החיבור ונסה/י שוב.',
    },
    analyzeUnreachable: 'לא ניתן להתחבר לשרת הניתוח. ייתכן שהשרת אינו פעיל.',
    overlay: {
      identifying: 'מזהים את המזון…',
      gettingNutrients: 'מחשבים נוטריינטים…',
    },
    detectedSuffix: (name) => `זוהה ${name}`,
    actions: {
      scanFood: 'סריקת מזון',
      uploadPhoto: 'העלאת תמונה',
      logManually: 'רישום ידני',
    },
    confirm: {
      isCorrect: 'זה נכון?',
      confirm: 'אישור',
      retakePhoto: 'צילום מחדש',
    },
    quantityStage: {
      howMuch: 'כמה אכלת?',
      calculate: 'חישוב נוטריינטים',
      back: 'חזרה',
    },
    manual: {
      cancel: 'ביטול',
      addCustomFood: 'הוספת מזון מותאם אישית',
    },
    custom: {
      useTheseValues: 'שימוש בערכים האלה',
      backAriaLabel: 'חזרה',
    },
    result: {
      noFoodRecognized: 'לא זוהה מזון בתמונה הזו. 😫',
      calculating: 'מחשבים…',
      getNutrients: 'קבלת נוטריינטים',
      noStandoutNutrients: 'אין נוטריינטים בולטים במנה הזו.',
      save: 'שמירה',
      mealFallbackName: 'ארוחה',
    },
    capturedMealAlt: 'תמונת הארוחה שצולמה',
    customEntryNote: 'ערכים תזונתיים שהוזנו ידנית מתווית המוצר.',
    scaledFromCustomNote: 'מחושב מהערך המותאם אישית ששמרת.',
  },
  ar: {
    quantity: {
      gramsPlaceholder: 'غرام',
      exactGrams: 'غرامات دقيقة',
    },
    autocomplete: {
      namePlaceholder: 'اكتب اسم الطعام…',
      clearNameAriaLabel: 'مسح اسم الطعام',
    },
    cameraUnavailable: 'الكاميرا غير متاحة أو تم رفض الإذن — استخدم "رفع صورة" بدلاً من ذلك.',
    scanErrors: {
      noFrame: 'تعذّر التقاط صورة. وجّه الكاميرا نحو الطعام وحاول مرة أخرى.',
      captureFailed: 'تعذّر التقاط صورة. حاول مرة أخرى.',
      readFailed: 'تعذّرت قراءة هذه الصورة. جرّب صورة أخرى.',
    },
    identify: {
      notRecognized: 'لم نتمكن من التعرف على الطعام.',
      serviceUnreachable: 'تعذّر الوصول إلى خدمة التعرّف على الطعام. تحقّق من اتصالك وحاول مرة أخرى.',
    },
    analyzeUnreachable: 'تعذّر الوصول إلى خادم التحليل. تأكّد من أن الخادم يعمل.',
    overlay: {
      identifying: 'جارٍ التعرّف على الطعام…',
      gettingNutrients: 'جارٍ حساب العناصر الغذائية…',
    },
    detectedSuffix: (name) => `تم التعرّف على ${name}`,
    actions: {
      scanFood: 'مسح الطعام',
      uploadPhoto: 'رفع صورة',
      logManually: 'تسجيل يدوي',
    },
    confirm: {
      isCorrect: 'هل هذا صحيح؟',
      confirm: 'تأكيد',
      retakePhoto: 'إعادة التصوير',
    },
    quantityStage: {
      howMuch: 'كم تناولت؟',
      calculate: 'حساب العناصر الغذائية',
      back: 'رجوع',
    },
    manual: {
      cancel: 'إلغاء',
      addCustomFood: 'إضافة طعام مخصّص',
    },
    custom: {
      useTheseValues: 'استخدام هذه القيم',
      backAriaLabel: 'رجوع',
    },
    result: {
      noFoodRecognized: 'لم يتم التعرّف على طعام في هذه الصورة. 😫',
      calculating: 'جارٍ الحساب…',
      getNutrients: 'الحصول على العناصر الغذائية',
      noStandoutNutrients: 'لا توجد عناصر غذائية بارزة في هذه الحصة.',
      save: 'حفظ',
      mealFallbackName: 'وجبة',
    },
    capturedMealAlt: 'صورة الوجبة الملتقطة',
    customEntryNote: 'قيم غذائية أُدخلت يدويًا من ملصق المنتج.',
    scaledFromCustomNote: 'مُحتسب من إدخالك المخصّص المحفوظ.',
  },
}

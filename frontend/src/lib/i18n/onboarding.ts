import type { Lang } from './lang'

interface OnboardingStrings {
  languageButtonLabel: string
  backAriaLabel: string
  welcomeCta: string
  summaryCta: string
  continueCta: string
  welcome: {
    title: string
    subtitle: string
    highlightWord: string
    badges: [string, string, string]
    benefits: [string, string, string, string]
  }
  age: { title: string; subtitle: string; unit: string }
  sex: {
    title: string
    subtitle: string
    options: { female: string; male: string; unspecified: string }
  }
  weight: { title: string; subtitle: string; unit: string }
  height: { title: string; subtitle: string; unit: string }
  activity: {
    title: string
    subtitle: string
    options: {
      sedentary: { label: string; desc: string }
      moderate: { label: string; desc: string }
      active: { label: string; desc: string }
    }
  }
  diet: {
    title: string
    subtitle: string
    options: {
      omnivore: { label: string; desc: string }
      pescatarian: { label: string; desc: string }
      vegetarian: { label: string; desc: string }
      vegan: { label: string; desc: string }
    }
  }
  goal: {
    title: string
    subtitle: string
    options: {
      lose: { label: string; desc: string }
      maintain: { label: string; desc: string }
      gain: { label: string; desc: string }
    }
  }
  calculating: { messages: [string, string, string] }
  summary: {
    title: string
    nutrientNames: { vitaminD: string; iron: string; vitaminB12: string }
    nutrientBenefits: { vitaminD: string; iron: string; vitaminB12: string }
    lockedMore: (count: number) => string
    disclaimer: string
  }
}

export const ONBOARDING_STRINGS: Record<Lang, OnboardingStrings> = {
  en: {
    languageButtonLabel: 'Language',
    backAriaLabel: 'Back',
    welcomeCta: "Let's go",
    summaryCta: 'See my plan',
    continueCta: 'Continue',
    welcome: {
      title: "Let's set up your targets",
      subtitle: 'Your body needs more than calories',
      highlightWord: 'more',
      badges: ['2-minute setup', 'Fully personalized', 'Private & secure'],
      benefits: ['Better sleep 😴', 'Better workouts 💪', 'More energy ⚡', 'Sharper focus 🎯'],
    },
    age: {
      title: 'How old are you?',
      subtitle: 'Your vitamin needs age too, just less gracefully.',
      unit: 'years',
    },
    sex: {
      title: 'Male or female?',
      subtitle: 'Biology plays favorites with a few nutrients.',
      options: { female: 'Female', male: 'Male', unspecified: 'Prefer not to say' },
    },
    weight: {
      title: "What's your weight?",
      subtitle: 'Bigger frame, bigger nutrient budget.',
      unit: 'kg',
    },
    height: {
      title: 'And your height?',
      subtitle: 'Tall or short, we still crunch the numbers.',
      unit: 'cm',
    },
    activity: {
      title: 'How active are you?',
      subtitle: 'Couch or gym — we adjust.',
      options: {
        sedentary: { label: 'Mostly still', desc: 'Little exercise, desk job' },
        moderate: { label: 'Somewhat active', desc: 'Active 1–3 times a week' },
        active: { label: 'Very active', desc: '4+ workouts a week' },
      },
    },
    diet: {
      title: "What's your diet?",
      subtitle: 'Salad fans, mind the B12.',
      options: {
        omnivore: { label: 'Omnivore', desc: 'Meat, fish, dairy — everything' },
        pescatarian: { label: 'Pescatarian', desc: 'Fish and dairy, no other meat' },
        vegetarian: { label: 'Vegetarian', desc: 'Dairy & eggs, no meat/fish' },
        vegan: { label: 'Vegan', desc: 'No animal products at all' },
      },
    },
    goal: {
      title: "What's your goal?",
      subtitle: 'This sets your daily calories, protein, carbs, and fat.',
      options: {
        lose: { label: 'Lose weight', desc: 'Eat a bit less than you burn' },
        maintain: { label: 'Maintain weight', desc: 'Stay around where you are' },
        gain: { label: 'Gain weight', desc: 'Eat a bit more, build muscle' },
      },
    },
    calculating: {
      messages: ['Analyzing your profile…', 'Calculating vitamin needs…', 'Personalizing your targets…'],
    },
    summary: {
      title: 'Your daily targets are ready',
      nutrientNames: { vitaminD: 'Vitamin D', iron: 'Iron', vitaminB12: 'Vitamin B12' },
      nutrientBenefits: {
        vitaminD: 'Bones, mood & immunity',
        iron: 'Energy & focus, less fatigue',
        vitaminB12: 'Nerve health & steady energy',
      },
      lockedMore: (count) => `+${count} more targets unlock next`,
      disclaimer: 'A rough estimate, not medical advice — check a doctor for anything specific.',
    },
  },
  he: {
    languageButtonLabel: 'שפה',
    backAriaLabel: 'חזרה',
    welcomeCta: 'בואו נתחיל',
    summaryCta: 'לצפייה בתוכנית שלי',
    continueCta: 'המשך',
    welcome: {
      title: 'בואו נגדיר את היעדים שלך',
      subtitle: 'הגוף שלך צריך יותר מקלוריות',
      highlightWord: 'יותר',
      badges: ['התקנה של 2 דקות', 'מותאם אישית לגמרי', 'פרטי ומאובטח'],
      benefits: ['שינה טובה יותר 😴', 'אימונים טובים יותר 💪', 'יותר אנרגיה ⚡', 'ריכוז חד יותר 🎯'],
    },
    age: {
      title: 'בן/בת כמה את/ה?',
      subtitle: 'גם לצרכי הוויטמינים שלך יש גיל, רק פחות בחן.',
      unit: 'שנים',
    },
    sex: {
      title: 'זכר או נקבה?',
      subtitle: 'לביולוגיה יש מועדפים כשמדובר בכמה נוטריינטים.',
      options: { female: 'נקבה', male: 'זכר', unspecified: 'מעדיפ/ה לא לומר' },
    },
    weight: {
      title: 'מה המשקל שלך?',
      subtitle: 'מסגרת גוף גדולה יותר, תקציב נוטריינטים גדול יותר.',
      unit: 'ק"ג',
    },
    height: {
      title: 'ומה הגובה שלך?',
      subtitle: 'גבוה או נמוך, אנחנו עדיין מחשבים את המספרים.',
      unit: 'ס"מ',
    },
    activity: {
      title: 'כמה את/ה פעיל/ה?',
      subtitle: 'ספה או חדר כושר — אנחנו מתאימים.',
      options: {
        sedentary: { label: 'כמעט ולא זז/ה', desc: 'מעט פעילות גופנית, עבודת משרד' },
        moderate: { label: 'פעיל/ה במידה', desc: 'פעיל/ה 1–3 פעמים בשבוע' },
        active: { label: 'פעיל/ה מאוד', desc: '4+ אימונים בשבוע' },
      },
    },
    diet: {
      title: 'מה התזונה שלך?',
      subtitle: 'לאוהבי הסלט — שימו לב ל-B12.',
      options: {
        omnivore: { label: 'אוכל הכל', desc: 'בשר, דגים, מוצרי חלב — הכל' },
        pescatarian: { label: 'פסקטריאני/ת', desc: 'דגים ומוצרי חלב, בלי בשר אחר' },
        vegetarian: { label: 'צמחוני/ת', desc: 'מוצרי חלב וביצים, בלי בשר/דגים' },
        vegan: { label: 'טבעוני/ת', desc: 'בלי מוצרים מן החי בכלל' },
      },
    },
    goal: {
      title: 'מה המטרה שלך?',
      subtitle: 'זה קובע את הקלוריות, החלבון, הפחמימות והשומן היומיים שלך.',
      options: {
        lose: { label: 'לרדת במשקל', desc: 'לאכול קצת פחות ממה שאת/ה שורפ/ת' },
        maintain: { label: 'לשמור על המשקל', desc: 'להישאר בערך באותו משקל' },
        gain: { label: 'לעלות במשקל', desc: 'לאכול קצת יותר, לבנות שריר' },
      },
    },
    calculating: {
      messages: ['מנתחים את הפרופיל שלך…', 'מחשבים את צרכי הוויטמינים…', 'מתאימים אישית את היעדים שלך…'],
    },
    summary: {
      title: 'היעדים היומיים שלך מוכנים',
      nutrientNames: { vitaminD: 'ויטמין D', iron: 'ברזל', vitaminB12: 'ויטמין B12' },
      nutrientBenefits: {
        vitaminD: 'עצמות, מצב רוח וחיסון',
        iron: 'אנרגיה וריכוז, פחות עייפות',
        vitaminB12: 'בריאות העצבים ואנרגיה יציבה',
      },
      lockedMore: (count) => `עוד ${count} יעדים ייפתחו בהמשך`,
      disclaimer: 'הערכה גסה, לא ייעוץ רפואי — לכל דבר ספציפי כדאי לפנות לרופא/ה.',
    },
  },
  ar: {
    languageButtonLabel: 'اللغة',
    backAriaLabel: 'رجوع',
    welcomeCta: 'لنبدأ',
    summaryCta: 'عرض خطتي',
    continueCta: 'متابعة',
    welcome: {
      title: 'لنُعِد ضبط أهدافك',
      subtitle: 'جسمك يحتاج أكثر من السعرات الحرارية',
      highlightWord: 'أكثر',
      badges: ['إعداد خلال دقيقتين', 'مخصص بالكامل', 'خاص وآمن'],
      benefits: ['نوم أفضل 😴', 'تمارين أفضل 💪', 'طاقة أكبر ⚡', 'تركيز أعلى 🎯'],
    },
    age: {
      title: 'كم عمرك؟',
      subtitle: 'احتياجاتك من الفيتامينات تتغيّر مع العمر أيضًا، لكن بأناقة أقل.',
      unit: 'سنة',
    },
    sex: {
      title: 'ذكر أم أنثى؟',
      subtitle: 'لعِلم الأحياء أفضليات عند بعض العناصر الغذائية.',
      options: { female: 'أنثى', male: 'ذكر', unspecified: 'أفضّل عدم القول' },
    },
    weight: {
      title: 'ما هو وزنك؟',
      subtitle: 'جسم أكبر يعني ميزانية أكبر من العناصر الغذائية.',
      unit: 'كغم',
    },
    height: {
      title: 'وما هو طولك؟',
      subtitle: 'طويلًا كنت أم قصيرًا، نحسب الأرقام على أي حال.',
      unit: 'سم',
    },
    activity: {
      title: 'ما مدى نشاطك؟',
      subtitle: 'أريكة أم صالة رياضية — نحن نتكيّف.',
      options: {
        sedentary: { label: 'قليل الحركة', desc: 'نشاط بدني قليل، عمل مكتبي' },
        moderate: { label: 'نشيط إلى حد ما', desc: 'نشاط 1–3 مرات أسبوعيًا' },
        active: { label: 'نشيط جدًا', desc: '4+ تمارين أسبوعيًا' },
      },
    },
    diet: {
      title: 'ما هو نظامك الغذائي؟',
      subtitle: 'لعشاق السلطة — انتبهوا لفيتامين B12.',
      options: {
        omnivore: { label: 'يأكل كل شيء', desc: 'لحوم وأسماك ومنتجات ألبان — كل شيء' },
        pescatarian: { label: 'نباتي مع أسماك', desc: 'أسماك ومنتجات ألبان، بدون لحوم أخرى' },
        vegetarian: { label: 'نباتي', desc: 'منتجات ألبان وبيض، بدون لحم أو سمك' },
        vegan: { label: 'نباتي صِرف', desc: 'بدون أي منتجات حيوانية على الإطلاق' },
      },
    },
    goal: {
      title: 'ما هو هدفك؟',
      subtitle: 'هذا يحدد السعرات الحرارية والبروتين والكربوهيدرات والدهون اليومية.',
      options: {
        lose: { label: 'إنقاص الوزن', desc: 'تناول أقل قليلًا مما تحرقه' },
        maintain: { label: 'الحفاظ على الوزن', desc: 'البقاء قريبًا من وزنك الحالي' },
        gain: { label: 'زيادة الوزن', desc: 'تناول أكثر قليلًا، وبناء العضلات' },
      },
    },
    calculating: {
      messages: ['نحلل ملفك الشخصي…', 'نحسب احتياجاتك من الفيتامينات…', 'نُخصّص أهدافك…'],
    },
    summary: {
      title: 'أهدافك اليومية جاهزة',
      nutrientNames: { vitaminD: 'فيتامين D', iron: 'الحديد', vitaminB12: 'فيتامين B12' },
      nutrientBenefits: {
        vitaminD: 'العظام والمزاج والمناعة',
        iron: 'الطاقة والتركيز، إرهاق أقل',
        vitaminB12: 'صحة الأعصاب وطاقة ثابتة',
      },
      lockedMore: (count) => `+${count} أهداف إضافية تُفتح لاحقًا`,
      disclaimer: 'تقدير تقريبي وليس نصيحة طبية — استشر طبيبًا لأي أمر خاص.',
    },
  },
}

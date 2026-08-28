import type { Lang } from './lang'
import type { SuperfoodCategory } from '../superfoods'
import type { NutrientId } from '../../types'

/** A run of plain text, or a mention of a tracked nutrient that can be tapped for an explanation. */
export type BenefitPart = string | { nutrient: NutrientId; label: string }

export interface SuperfoodContent {
  name: string
  /** Short, punchy "superpower" tag — the hook. Emoji goes at the end, after the text. */
  power: string
  /** The mechanism behind the power, broken into parts so any named vitamin/mineral can link to its explanation. */
  benefit: BenefitPart[]
}

export const SUPERFOOD_CONTENT: Record<Lang, Record<string, SuperfoodContent>> = {
  en: {
    avocado: { name: 'Avocado', power: 'Helps keep your heart healthy ❤️', benefit: ['Loaded with ', { nutrient: 'potassium', label: 'potassium' }, ' and heart-healthy monounsaturated fat that helps manage cholesterol.'] },
    banana: { name: 'Banana', power: 'Gives you more energy ⚡', benefit: ['A top source of ', { nutrient: 'potassium', label: 'potassium' }, ', which keeps muscles firing and nerves signaling smoothly.'] },
    cherries: { name: 'Cherries', power: 'Helps you sleep better 🌙', benefit: ['One of the few natural sources of melatonin, plus antioxidants that ease recovery.'] },
    grapes: { name: 'Grapes', power: 'Keeps your blood vessels healthy 🩸', benefit: ['Rich in resveratrol, an antioxidant linked to healthier blood vessels and circulation.'] },
    pineapple: { name: 'Pineapple', power: 'Helps your digestion 🍽️', benefit: ['Contains bromelain, an enzyme that helps break down protein and eases digestion.'] },
    watermelon: { name: 'Watermelon', power: 'Keeps you hydrated 💧', benefit: ['Over 90% water plus citrulline, an amino acid that helps muscles recover faster.'] },
    blueberries: { name: 'Blueberries', power: 'Sharpens your memory 🧠', benefit: ['Packed with anthocyanin antioxidants linked to sharper memory and brain aging protection.'] },
    spinach: { name: 'Spinach', power: 'Makes your bones stronger 💪', benefit: ['A powerhouse of ', { nutrient: 'vitaminK', label: 'vitamin K' }, ' and ', { nutrient: 'iron', label: 'iron' }, ', key for strong bones and healthy blood.'] },
    salmon: { name: 'Salmon', power: 'Good for your brain and heart 🐟', benefit: ['One of the best sources of omega-3 fats, which support heart rhythm and brain function.'] },
    walnuts: { name: 'Walnuts', power: 'Makes you more alert 🧠', benefit: ['Rich in plant-based omega-3s — fittingly, the only nut shaped like a brain.'] },
    kale: { name: 'Kale', power: 'Makes you stronger 💪', benefit: ['One of the most nutrient-dense vegetables around, loaded with vitamins ', { nutrient: 'vitaminA', label: 'A' }, ', ', { nutrient: 'vitaminC', label: 'C' }, ', ', { nutrient: 'vitaminK', label: 'K' }, ' and antioxidants.'] },
    broccoli: { name: 'Broccoli', power: 'Strengthens your immune system 🛡️', benefit: ['Packed with ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' and sulforaphane, a compound linked to strong immune and cell health.'] },
    sweetPotato: { name: 'Sweet Potato', power: 'Good for your eyesight 👁️', benefit: ['Rich in beta-carotene, which the body converts to ', { nutrient: 'vitaminA', label: 'vitamin A' }, ' for healthy eyes and skin.'] },
    garlic: { name: 'Garlic', power: 'Helps keep your heart healthy 🫀', benefit: ['Contains allicin, a compound studied for supporting heart health and immune defense.'] },
    eggs: { name: 'Eggs', power: 'Fuels your brain 🧠', benefit: ['A complete protein packed with choline, key for brain and cell health.'] },
    lentils: { name: 'Lentils', power: 'Keeps your digestion healthy 🌾', benefit: ['High in plant protein and fiber, which support steady blood sugar and gut health.'] },
    almonds: { name: 'Almonds', power: 'Good for your heart and skin ❤️', benefit: ['Rich in ', { nutrient: 'vitaminE', label: 'vitamin E' }, ' and healthy fats that support heart health and skin.'] },
    chiaSeeds: { name: 'Chia Seeds', power: 'Good for digestion and heart 💧', benefit: ['Tiny seeds packed with fiber and plant-based omega-3s that support digestion and heart health.'] },
    strawberries: { name: 'Strawberries', power: 'Strengthens your immune system ✨', benefit: ['One of the richest fruit sources of ', { nutrient: 'vitaminC', label: 'vitamin C' }, ', supporting skin and immune health.'] },
    kiwi: { name: 'Kiwi', power: 'Boosts your immunity 🧬', benefit: ['Packed with ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' and antioxidants — more ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' per bite than an orange.'] },
    orange: { name: 'Orange', power: 'Boosts your immunity 🍊', benefit: ['One of the most iconic sources of ', { nutrient: 'vitaminC', label: 'vitamin C' }, ', which also helps your body absorb iron.'] },
    tomato: { name: 'Tomato', power: 'Good for your heart and skin 🍅', benefit: ['Rich in lycopene, an antioxidant, plus a good dose of ', { nutrient: 'vitaminC', label: 'vitamin C' }, '.'] },
    mushrooms: { name: 'Mushrooms', power: 'Good for your bones and immunity 🍄', benefit: ['One of the few plant-based sources of ', { nutrient: 'vitaminD', label: 'vitamin D' }, ', which helps your body absorb calcium.'] },
    oats: { name: 'Oats', power: 'Keeps you full and energized 🥣', benefit: ['High in beta-glucan fiber that supports steady energy and a healthy heart.'] },
    yogurt: { name: 'Yogurt', power: 'Strengthens your bones and teeth 🥛', benefit: ['A great source of ', { nutrient: 'calcium', label: 'calcium' }, ' and probiotics that support gut health.'] },
    mango: { name: 'Mango', power: 'Good for your skin and eyes 🥭', benefit: ['Rich in ', { nutrient: 'vitaminA', label: 'vitamin A' }, ' and ', { nutrient: 'vitaminC', label: 'vitamin C' }, ', which support skin repair and healthy vision.'] },
    bellPepper: { name: 'Bell Pepper', power: 'Strengthens your immune system 🫑', benefit: ['One of the richest sources of ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' — even more than an orange.'] },
    ginger: { name: 'Ginger', power: 'Eases nausea and inflammation 🫚', benefit: ['Contains gingerol, a compound studied for easing nausea and reducing inflammation.'] },
  },
  he: {
    avocado: { name: 'אבוקדו', power: 'יעזור לך לשמור על לב בריא ❤️', benefit: ['עשיר ב', { nutrient: 'potassium', label: 'אשלגן' }, ' ובשומן חד-בלתי-רווי הידידותי ללב, שעוזר לאזן כולסטרול.'] },
    banana: { name: 'בננה', power: 'ייתן לך יותר אנרגיה ⚡', benefit: ['מקור מוביל ל', { nutrient: 'potassium', label: 'אשלגן' }, ', ששומר על שרירים ועצבים פועלים כמו שצריך.'] },
    cherries: { name: 'דובדבנים', power: 'יעזור לך לישון יותר טוב 🌙', benefit: ['אחד המקורות הטבעיים הבודדים למלטונין, בתוספת נוגדי חמצון שמסייעים להתאוששות.'] },
    grapes: { name: 'ענבים', power: 'ישמור על כלי הדם שלך בריאים 🩸', benefit: ['עשירים ברזברטרול, נוגד חמצון שמקושר לכלי דם בריאים יותר ולזרימת דם טובה.'] },
    pineapple: { name: 'אננס', power: 'יעזור לעיכול שלך 🍽️', benefit: ['מכיל ברומלין, אנזים שעוזר לפרק חלבון ומקל על העיכול.'] },
    watermelon: { name: 'אבטיח', power: 'ישמור עליך רווי מים 💧', benefit: ['מעל 90% מים בתוספת ציטרולין, חומצת אמינו שעוזרת לשרירים להתאושש מהר יותר.'] },
    blueberries: { name: 'אוכמניות', power: 'יחדד לך את הזיכרון 🧠', benefit: ['עמוסות בנוגדי חמצון אנתוציאנין המקושרים לזיכרון חד יותר ולהגנה על המוח מפני הזדקנות.'] },
    spinach: { name: 'תרד', power: 'יחזק לך את העצמות 💪', benefit: ['מקור עוצמתי ל', { nutrient: 'vitaminK', label: 'ויטמין K' }, ' ול', { nutrient: 'iron', label: 'ברזל' }, ', חיוניים לעצמות חזקות ולדם בריא.'] },
    salmon: { name: 'סלמון', power: 'טוב למוח וללב שלך 🐟', benefit: ['אחד המקורות הטובים ביותר לאומגה 3, התומכת בקצב לב תקין ובתפקוד המוח.'] },
    walnuts: { name: 'אגוזי מלך', power: 'יעזור לך להיות עירני יותר 🧠', benefit: ['עשירים באומגה 3 מהצומח — ולא במקרה, האגוז היחיד שנראה כמו מוח.'] },
    kale: { name: 'קייל', power: 'יעזור לך להתחזק 💪', benefit: ['אחד הירקות העשירים ביותר בערכים תזונתיים - עמוס בוויטמינים ', { nutrient: 'vitaminA', label: 'A' }, ', ', { nutrient: 'vitaminC', label: 'C' }, ', ', { nutrient: 'vitaminK', label: 'K' }, ' ונוגדי חמצון.'] },
    broccoli: { name: 'ברוקולי', power: 'יחזק את המערכת החיסונית שלך 🛡️', benefit: ['עשיר ב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' ובסולפורופאן, תרכובת המקושרת לחיזוק המערכת החיסונית ובריאות התאים.'] },
    sweetPotato: { name: 'בטטה', power: 'טוב לראייה שלך 👁️', benefit: ['עשירה בבטא-קרוטן, שהגוף הופך ל', { nutrient: 'vitaminA', label: 'ויטמין A' }, ' החיוני לעיניים ולעור בריאים.'] },
    garlic: { name: 'שום', power: 'יעזור לך לשמור על לב בריא 🫀', benefit: ['מכיל אליצין, תרכובת שנחקרה בזכות התמיכה שהיא מעניקה לבריאות הלב ולמערכת החיסונית.'] },
    eggs: { name: 'ביצים', power: 'ייתן דלק למוח שלך 🧠', benefit: ['חלבון מלא עתיר כולין, מרכיב מפתח לבריאות המוח והתאים.'] },
    lentils: { name: 'עדשים', power: 'ישמור על עיכול בריא 🌾', benefit: ['עתירות בחלבון צמחי ובסיבים תזונתיים, התומכים באיזון רמות הסוכר בדם ובבריאות מערכת העיכול.'] },
    almonds: { name: 'שקדים', power: 'טוב ללב ולעור שלך ❤️', benefit: ['עשירים ב', { nutrient: 'vitaminE', label: 'ויטמין E' }, ' ובשומנים בריאים התומכים בבריאות הלב והעור.'] },
    chiaSeeds: { name: 'זרעי צ׳יה', power: 'טוב לעיכול וללב שלך 💧', benefit: ['זרעים זעירים העמוסים בסיבים ובאומגה 3 מהצומח, התומכים בעיכול ובבריאות הלב.'] },
    strawberries: { name: 'תותים', power: 'יחזק את המערכת החיסונית שלך ✨', benefit: ['אחד המקורות העשירים ביותר ב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' בין הפירות, התומך בעור ובמערכת החיסונית.'] },
    kiwi: { name: 'קיווי', power: 'יחזק את החיסון שלך 🧬', benefit: ['עתיר ב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' ובנוגדי חמצון - יותר ', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' מתפוז לכל ביס.'] },
    orange: { name: 'תפוז', power: 'יחזק את החיסון שלך 🍊', benefit: ['אחד המקורות המוכרים ביותר ל', { nutrient: 'vitaminC', label: 'ויטמין C' }, ', שגם עוזר לגוף לספוג ברזל.'] },
    tomato: { name: 'עגבנייה', power: 'טוב ללב ולעור שלך 🍅', benefit: ['עשירה בליקופן, נוגד חמצון, ובתוספת מנה נאה של ', { nutrient: 'vitaminC', label: 'ויטמין C' }, '.'] },
    mushrooms: { name: 'פטריות', power: 'טוב לעצמות ולחיסון שלך 🍄', benefit: ['אחד המקורות הצמחיים הבודדים ל', { nutrient: 'vitaminD', label: 'ויטמין D' }, ', שעוזר לגוף לספוג סידן.'] },
    oats: { name: 'שיבולת שועל', power: 'ישמור עליך שבע ומלא באנרגיה 🥣', benefit: ['עשירה בסיבי בטא-גלוקן שתומכים באנרגיה יציבה ובלב בריא.'] },
    yogurt: { name: 'יוגורט', power: 'יחזק את העצמות והשיניים שלך 🥛', benefit: ['מקור מצוין ל', { nutrient: 'calcium', label: 'סידן' }, ' ולפרוביוטיקה שתומכת בבריאות מערכת העיכול.'] },
    mango: { name: 'מנגו', power: 'טוב לעור ולעיניים שלך 🥭', benefit: ['עשיר ב', { nutrient: 'vitaminA', label: 'ויטמין A' }, ' וב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ', שתומכים בתיקון העור ובראייה בריאה.'] },
    bellPepper: { name: 'פלפל מתוק', power: 'יחזק את המערכת החיסונית שלך 🫑', benefit: ['אחד המקורות העשירים ביותר ל', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' - אפילו יותר מתפוז.'] },
    ginger: { name: 'ג׳ינג׳ר', power: 'מקל על בחילה ודלקת 🫚', benefit: ['מכיל ג׳ינג׳רול, תרכובת שנחקרת בזכות ההקלה שהיא מעניקה על בחילה ודלקת.'] },
  },
  ar: {
    avocado: { name: 'أفوكادو', power: 'يساعدك على قلب سليم ❤️', benefit: ['غني ب', { nutrient: 'potassium', label: 'البوتاسيوم' }, ' والدهون الأحادية غير المشبعة المفيدة للقلب والتي تساعد في ضبط الكوليسترول.'] },
    banana: { name: 'موز', power: 'يمنحك المزيد من الطاقة ⚡', benefit: ['مصدر رئيسي ل', { nutrient: 'potassium', label: 'البوتاسيوم' }, ' الذي يبقي العضلات والأعصاب تعمل بسلاسة.'] },
    cherries: { name: 'كرز', power: 'يساعدك على النوم بشكل أفضل 🌙', benefit: ['أحد المصادر الطبيعية القليلة للميلاتونين، إلى جانب مضادات أكسدة تساعد على التعافي.'] },
    grapes: { name: 'عنب', power: 'يحافظ على صحة أوعيتك الدموية 🩸', benefit: ['غني بالريسفيراترول، مضاد أكسدة مرتبط بأوعية دموية أكثر صحة ودورة دموية أفضل.'] },
    pineapple: { name: 'أناناس', power: 'يساعد على هضمك 🍽️', benefit: ['يحتوي على البروميلين، إنزيم يساعد في تفكيك البروتين وتسهيل الهضم.'] },
    watermelon: { name: 'بطيخ', power: 'يحافظ على ترطيب جسمك 💧', benefit: ['أكثر من 90% ماء بالإضافة إلى السيترولين، حمض أميني يساعد العضلات على التعافي أسرع.'] },
    blueberries: { name: 'توت أزرق', power: 'يشحذ ذاكرتك 🧠', benefit: ['غني بمضادات أكسدة الأنثوسيانين المرتبطة بذاكرة أوضح وحماية الدماغ من الشيخوخة.'] },
    spinach: { name: 'سبانخ', power: 'يقوي عظامك 💪', benefit: ['مصدر قوي ل', { nutrient: 'vitaminK', label: 'فيتامين K' }, ' و', { nutrient: 'iron', label: 'الحديد' }, '، أساسيان لعظام قوية ودم صحي.'] },
    salmon: { name: 'سلمون', power: 'مفيد لدماغك وقلبك 🐟', benefit: ['من أفضل مصادر أوميغا 3 التي تدعم انتظام ضربات القلب ووظائف الدماغ.'] },
    walnuts: { name: 'جوز', power: 'يجعلك أكثر تركيزًا ونشاطًا 🧠', benefit: ['غني بأوميغا 3 النباتية — وهو المكسّر الوحيد الذي يشبه شكل الدماغ، بشكل ملائم.'] },
    kale: { name: 'كرنب مجعد (كيل)', power: 'يجعلك أقوى 💪', benefit: ['من أكثر الخضروات كثافة بالعناصر الغذائية، غني بفيتامينات ', { nutrient: 'vitaminA', label: 'A' }, ' و', { nutrient: 'vitaminC', label: 'C' }, ' و', { nutrient: 'vitaminK', label: 'K' }, ' ومضادات الأكسدة.'] },
    broccoli: { name: 'بروكلي', power: 'يقوي جهازك المناعي 🛡️', benefit: ['غني ب', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' وسولفورافان، مركّب مرتبط بتعزيز المناعة وصحة الخلايا.'] },
    sweetPotato: { name: 'بطاطا حلوة', power: 'مفيد لبصرك 👁️', benefit: ['غنية ببيتا كاروتين الذي يحوله الجسم إلى ', { nutrient: 'vitaminA', label: 'فيتامين A' }, ' الضروري للعينين والبشرة.'] },
    garlic: { name: 'ثوم', power: 'يساعدك على قلب سليم 🫀', benefit: ['يحتوي على الأليسين، مركّب مدروس لدعمه صحة القلب والمناعة.'] },
    eggs: { name: 'بيض', power: 'يمد دماغك بالطاقة 🧠', benefit: ['بروتين كامل غني بالكولين، أساسي لصحة الدماغ والخلايا.'] },
    lentils: { name: 'عدس', power: 'يحافظ على صحة هضمك 🌾', benefit: ['غني بالبروتين النباتي والألياف التي تدعم استقرار سكر الدم وصحة الأمعاء.'] },
    almonds: { name: 'لوز', power: 'مفيد لقلبك وبشرتك ❤️', benefit: ['غني ب', { nutrient: 'vitaminE', label: 'فيتامين E' }, ' والدهون الصحية التي تدعم صحة القلب والبشرة.'] },
    chiaSeeds: { name: 'بذور الشيا', power: 'مفيد لهضمك وقلبك 💧', benefit: ['بذور صغيرة غنية بالألياف وأوميغا 3 النباتية، تدعم الهضم وصحة القلب.'] },
    strawberries: { name: 'فراولة', power: 'يقوي جهازك المناعي ✨', benefit: ['من أغنى الفواكه ب', { nutrient: 'vitaminC', label: 'فيتامين C' }, '، يدعم صحة البشرة والمناعة.'] },
    kiwi: { name: 'كيوي', power: 'يعزز مناعتك 🧬', benefit: ['غني ب', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' ومضادات الأكسدة - يحتوي على ', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' أكثر من البرتقال لكل قضمة.'] },
    orange: { name: 'برتقال', power: 'يعزز مناعتك 🍊', benefit: ['أحد أشهر مصادر ', { nutrient: 'vitaminC', label: 'فيتامين C' }, '، الذي يساعد جسمك أيضًا على امتصاص الحديد.'] },
    tomato: { name: 'طماطم', power: 'مفيد لقلبك وبشرتك 🍅', benefit: ['غنية بالليكوبين، وهو مضاد أكسدة، بالإضافة إلى جرعة جيدة من ', { nutrient: 'vitaminC', label: 'فيتامين C' }, '.'] },
    mushrooms: { name: 'فطر', power: 'مفيد لعظامك ومناعتك 🍄', benefit: ['من المصادر النباتية القليلة ل', { nutrient: 'vitaminD', label: 'فيتامين D' }, ' الذي يساعد جسمك على امتصاص الكالسيوم.'] },
    oats: { name: 'شوفان', power: 'يبقيك ممتلئًا ونشيطًا 🥣', benefit: ['غني بألياف بيتا-غلوكان التي تدعم طاقة ثابتة وقلبًا سليمًا.'] },
    yogurt: { name: 'زبادي', power: 'يقوي عظامك وأسنانك 🥛', benefit: ['مصدر ممتاز ل', { nutrient: 'calcium', label: 'الكالسيوم' }, ' والبروبيوتيك الذي يدعم صحة الأمعاء.'] },
    mango: { name: 'مانجو', power: 'مفيد لبشرتك وعينيك 🥭', benefit: ['غني ب', { nutrient: 'vitaminA', label: 'فيتامين A' }, ' و', { nutrient: 'vitaminC', label: 'فيتامين C' }, '، اللذين يدعمان إصلاح البشرة وصحة الرؤية.'] },
    bellPepper: { name: 'فلفل حلو', power: 'يقوي جهازك المناعي 🫑', benefit: ['من أغنى مصادر ', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' - أكثر حتى من البرتقال.'] },
    ginger: { name: 'زنجبيل', power: 'يخفف الغثيان والالتهاب 🫚', benefit: ['يحتوي على الجينجرول، مركّب يُدرس لتخفيف الغثيان وتقليل الالتهاب.'] },
  },
}

interface SuperfoodsPanelChrome {
  todaysSuperfood: string
  filterAll: string
  categories: Record<SuperfoodCategory, string>
  noItemsInCategory: string
}

export const SUPERFOODS_PANEL_CHROME: Record<Lang, SuperfoodsPanelChrome> = {
  en: {
    todaysSuperfood: "Today's Superfood",
    filterAll: 'All',
    categories: { fruit: 'Fruits', vegetable: 'Veggies', protein: 'Protein', nuts: 'Nuts' },
    noItemsInCategory: 'Nothing in this category yet.',
  },
  he: {
    todaysSuperfood: 'מאכל העל של היום',
    filterAll: 'הכל',
    categories: { fruit: 'פירות', vegetable: 'ירקות', protein: 'חלבון', nuts: 'אגוזים' },
    noItemsInCategory: 'אין עדיין פריטים בקטגוריה הזו.',
  },
  ar: {
    todaysSuperfood: 'الطعام الخارق لليوم',
    filterAll: 'الكل',
    categories: { fruit: 'فواكه', vegetable: 'خضروات', protein: 'بروتين', nuts: 'مكسرات' },
    noItemsInCategory: 'لا توجد عناصر في هذه الفئة بعد.',
  },
}

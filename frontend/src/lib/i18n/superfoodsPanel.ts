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
    avocado: { name: 'Avocado', power: 'Helps keep your heart healthy ❤️', benefit: ['Loaded with ', { nutrient: 'potassium', label: 'potassium' }, ' and healthy fat that helps keep your cholesterol in check.'] },
    banana: { name: 'Banana', power: 'Gives you more energy ⚡', benefit: ['Packed with ', { nutrient: 'potassium', label: 'potassium' }, ', which helps your muscles and nerves work well.'] },
    cherries: { name: 'Cherries', power: 'Helps you sleep better 🌙', benefit: ['One of the few fruits with natural melatonin — the sleep hormone — plus antioxidants that help you recover.'] },
    grapes: { name: 'Grapes', power: 'Keeps your blood vessels healthy 🩸', benefit: ['Contains resveratrol, a natural antioxidant that helps keep your blood vessels healthy.'] },
    pineapple: { name: 'Pineapple', power: 'Helps your digestion 🍽️', benefit: ['Contains a natural enzyme that helps your stomach break down food more easily.'] },
    watermelon: { name: 'Watermelon', power: 'Keeps you hydrated 💧', benefit: ['Mostly water, plus a natural compound that helps your muscles recover faster.'] },
    blueberries: { name: 'Blueberries', power: 'Sharpens your memory 🧠', benefit: ['Packed with antioxidants that help keep your memory sharp as you age.'] },
    spinach: { name: 'Spinach', power: 'Makes your bones stronger 💪', benefit: ['Full of ', { nutrient: 'vitaminK', label: 'vitamin K' }, ' and ', { nutrient: 'iron', label: 'iron' }, ', which keep your bones strong and your blood healthy.'] },
    salmon: { name: 'Salmon', power: 'Good for your brain and heart 🐟', benefit: ['One of the best sources of omega-3 fat, which is great for your heart and brain.'] },
    walnuts: { name: 'Walnuts', power: 'Makes you more alert 🧠', benefit: ['Full of plant-based omega-3 fat that’s great for your brain — and it even looks like one.'] },
    kale: { name: 'Kale', power: 'Makes you stronger 💪', benefit: ['One of the healthiest vegetables around, full of vitamins ', { nutrient: 'vitaminA', label: 'A' }, ', ', { nutrient: 'vitaminC', label: 'C' }, ', ', { nutrient: 'vitaminK', label: 'K' }, ' and antioxidants.'] },
    broccoli: { name: 'Broccoli', power: 'Strengthens your immune system 🛡️', benefit: ['Packed with ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' and other compounds that help keep your immune system strong.'] },
    sweetPotato: { name: 'Sweet Potato', power: 'Good for your eyesight 👁️', benefit: ['Rich in beta-carotene, which your body turns into ', { nutrient: 'vitaminA', label: 'vitamin A' }, ' for healthy eyes and skin.'] },
    garlic: { name: 'Garlic', power: 'Helps keep your heart healthy 🫀', benefit: ['Contains a natural compound that helps keep your heart and immune system healthy.'] },
    eggs: { name: 'Eggs', power: 'Fuels your brain 🧠', benefit: ['A complete protein packed with nutrients that are great for your brain and cells.'] },
    lentils: { name: 'Lentils', power: 'Keeps your digestion healthy 🌾', benefit: ['High in plant protein and fiber, which keep your blood sugar steady and your gut healthy.'] },
    almonds: { name: 'Almonds', power: 'Good for your heart and skin ❤️', benefit: ['Rich in ', { nutrient: 'vitaminE', label: 'vitamin E' }, ' and healthy fats that are good for your heart and skin.'] },
    chiaSeeds: { name: 'Chia Seeds', power: 'Good for digestion and heart 💧', benefit: ['Tiny seeds packed with fiber and plant-based omega-3s that are good for digestion and your heart.'] },
    strawberries: { name: 'Strawberries', power: 'Strengthens your immune system ✨', benefit: ['One of the richest fruit sources of ', { nutrient: 'vitaminC', label: 'vitamin C' }, ', which is great for your skin and immune system.'] },
    kiwi: { name: 'Kiwi', power: 'Boosts your immunity 🧬', benefit: ['Packed with ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' and antioxidants — more ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' per bite than an orange.'] },
    orange: { name: 'Orange', power: 'Boosts your immunity 🍊', benefit: ['One of the best-known sources of ', { nutrient: 'vitaminC', label: 'vitamin C' }, ', which also helps your body absorb iron.'] },
    tomato: { name: 'Tomato', power: 'Good for your heart and skin 🍅', benefit: ['Rich in antioxidants, plus a good dose of ', { nutrient: 'vitaminC', label: 'vitamin C' }, '.'] },
    mushrooms: { name: 'Mushrooms', power: 'Good for your bones and immunity 🍄', benefit: ['One of the few plant foods with ', { nutrient: 'vitaminD', label: 'vitamin D' }, ', which helps your body absorb calcium.'] },
    oats: { name: 'Oats', power: 'Keeps you full and energized 🥣', benefit: ['High in a special fiber that keeps your energy steady and your heart healthy.'] },
    yogurt: { name: 'Yogurt', power: 'Strengthens your bones and teeth 🥛', benefit: ['A great source of ', { nutrient: 'calcium', label: 'calcium' }, ' and probiotics that are good for your gut.'] },
    mango: { name: 'Mango', power: 'Good for your skin and eyes 🥭', benefit: ['Rich in ', { nutrient: 'vitaminA', label: 'vitamin A' }, ' and ', { nutrient: 'vitaminC', label: 'vitamin C' }, ', which help repair your skin and keep your eyes healthy.'] },
    bellPepper: { name: 'Bell Pepper', power: 'Strengthens your immune system 🫑', benefit: ['One of the richest sources of ', { nutrient: 'vitaminC', label: 'vitamin C' }, ' — even more than an orange.'] },
    ginger: { name: 'Ginger', power: 'Eases nausea and inflammation 🫚', benefit: ['Contains a natural compound that helps ease nausea and calm inflammation.'] },
  },
  he: {
    avocado: { name: 'אבוקדו', power: 'יעזור לך לשמור על לב בריא ❤️', benefit: ['עשיר ב', { nutrient: 'potassium', label: 'אשלגן' }, ' ובשומן בריא שעוזר לשמור על רמת כולסטרול תקינה.'] },
    banana: { name: 'בננה', power: 'ייתן לך יותר אנרגיה ⚡', benefit: ['עמוסה ב', { nutrient: 'potassium', label: 'אשלגן' }, ', שעוזר לשרירים ולעצבים שלך לעבוד טוב.'] },
    cherries: { name: 'דובדבנים', power: 'יעזור לך לישון יותר טוב 🌙', benefit: ['אחד הפירות היחידים עם מלטונין טבעי - הורמון השינה - בתוספת נוגדי חמצון שעוזרים לך להתאושש.'] },
    grapes: { name: 'ענבים', power: 'ישמור על כלי הדם שלך בריאים 🩸', benefit: ['מכילים רזברטרול, נוגד חמצון טבעי שעוזר לשמור על כלי הדם שלך בריאים.'] },
    pineapple: { name: 'אננס', power: 'יעזור לעיכול שלך 🍽️', benefit: ['מכיל אנזים טבעי שעוזר לקיבה שלך לפרק אוכל בקלות.'] },
    watermelon: { name: 'אבטיח', power: 'ישמור עליך רווי מים 💧', benefit: ['בעיקר מים, בתוספת חומר טבעי שעוזר לשרירים שלך להתאושש מהר יותר.'] },
    blueberries: { name: 'אוכמניות', power: 'יחדד לך את הזיכרון 🧠', benefit: ['עמוסות בנוגדי חמצון שעוזרים לשמור על זיכרון חד ככל שמתבגרים.'] },
    spinach: { name: 'תרד', power: 'יחזק לך את העצמות 💪', benefit: ['עשיר ב', { nutrient: 'vitaminK', label: 'ויטמין K' }, ' וב', { nutrient: 'iron', label: 'ברזל' }, ', ששומרים על עצמות חזקות ועל דם בריא.'] },
    salmon: { name: 'סלמון', power: 'טוב למוח וללב שלך 🐟', benefit: ['אחד המקורות הטובים ביותר לשומן אומגה 3, שטוב מאוד ללב ולמוח שלך.'] },
    walnuts: { name: 'אגוזי מלך', power: 'יעזור לך להיות עירני יותר 🧠', benefit: ['עשירים בשומן אומגה 3 מהצומח שטוב למוח - ולא במקרה נראה כמו אחד.'] },
    kale: { name: 'קייל', power: 'יעזור לך להתחזק 💪', benefit: ['אחד הירקות הבריאים ביותר שיש, עמוס בוויטמינים ', { nutrient: 'vitaminA', label: 'A' }, ', ', { nutrient: 'vitaminC', label: 'C' }, ', ', { nutrient: 'vitaminK', label: 'K' }, ' ונוגדי חמצון.'] },
    broccoli: { name: 'ברוקולי', power: 'יחזק את המערכת החיסונית שלך 🛡️', benefit: ['עשיר ב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' ובחומרים נוספים ששומרים על מערכת חיסון חזקה.'] },
    sweetPotato: { name: 'בטטה', power: 'טוב לראייה שלך 👁️', benefit: ['עשירה בבטא-קרוטן, שהגוף הופך ל', { nutrient: 'vitaminA', label: 'ויטמין A' }, ' לעיניים ולעור בריאים.'] },
    garlic: { name: 'שום', power: 'יעזור לך לשמור על לב בריא 🫀', benefit: ['מכיל חומר טבעי שעוזר לשמור על לב ומערכת חיסון בריאים.'] },
    eggs: { name: 'ביצים', power: 'ייתן דלק למוח שלך 🧠', benefit: ['חלבון מלא עמוס בחומרים מזינים שטובים למוח ולתאים שלך.'] },
    lentils: { name: 'עדשים', power: 'ישמור על עיכול בריא 🌾', benefit: ['עשירות בחלבון צמחי ובסיבים תזונתיים, ששומרים על רמת סוכר יציבה בדם ועל מעיים בריאים.'] },
    almonds: { name: 'שקדים', power: 'טוב ללב ולעור שלך ❤️', benefit: ['עשירים ב', { nutrient: 'vitaminE', label: 'ויטמין E' }, ' ובשומנים בריאים שטובים ללב ולעור.'] },
    chiaSeeds: { name: 'זרעי צ׳יה', power: 'טוב לעיכול וללב שלך 💧', benefit: ['זרעים זעירים עמוסים בסיבים ובאומגה 3 מהצומח, שטובים לעיכול וללב.'] },
    strawberries: { name: 'תותים', power: 'יחזק את המערכת החיסונית שלך ✨', benefit: ['אחד המקורות העשירים ביותר ב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' בין הפירות, שטוב לעור ולמערכת החיסון.'] },
    kiwi: { name: 'קיווי', power: 'יחזק את החיסון שלך 🧬', benefit: ['עשיר ב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' ובנוגדי חמצון - יותר ', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' מתפוז לכל ביס.'] },
    orange: { name: 'תפוז', power: 'יחזק את החיסון שלך 🍊', benefit: ['אחד המקורות המוכרים ביותר ל', { nutrient: 'vitaminC', label: 'ויטמין C' }, ', שגם עוזר לגוף לספוג ברזל.'] },
    tomato: { name: 'עגבנייה', power: 'טוב ללב ולעור שלך 🍅', benefit: ['עשירה בנוגדי חמצון, בתוספת מנה נאה של ', { nutrient: 'vitaminC', label: 'ויטמין C' }, '.'] },
    mushrooms: { name: 'פטריות', power: 'טוב לעצמות ולחיסון שלך 🍄', benefit: ['אחד המאכלים הצמחיים הבודדים עם ', { nutrient: 'vitaminD', label: 'ויטמין D' }, ', שעוזר לגוף לספוג סידן.'] },
    oats: { name: 'שיבולת שועל', power: 'ישמור עליך שבע ומלא באנרגיה 🥣', benefit: ['עשירה בסיב מיוחד ששומר על אנרגיה יציבה ועל לב בריא.'] },
    yogurt: { name: 'יוגורט', power: 'יחזק את העצמות והשיניים שלך 🥛', benefit: ['מקור מצוין ל', { nutrient: 'calcium', label: 'סידן' }, ' ולפרוביוטיקה שטובה למעיים שלך.'] },
    mango: { name: 'מנגו', power: 'טוב לעור ולעיניים שלך 🥭', benefit: ['עשיר ב', { nutrient: 'vitaminA', label: 'ויטמין A' }, ' וב', { nutrient: 'vitaminC', label: 'ויטמין C' }, ', שעוזרים לתקן את העור ולשמור על ראייה בריאה.'] },
    bellPepper: { name: 'פלפל מתוק', power: 'יחזק את המערכת החיסונית שלך 🫑', benefit: ['אחד המקורות העשירים ביותר ל', { nutrient: 'vitaminC', label: 'ויטמין C' }, ' - אפילו יותר מתפוז.'] },
    ginger: { name: 'ג׳ינג׳ר', power: 'מקל על בחילה ודלקת 🫚', benefit: ['מכיל חומר טבעי שעוזר להקל על בחילה ולהרגיע דלקת.'] },
  },
  ar: {
    avocado: { name: 'أفوكادو', power: 'يساعدك على قلب سليم ❤️', benefit: ['غني ب', { nutrient: 'potassium', label: 'البوتاسيوم' }, ' والدهون الصحية التي تساعد في ضبط الكوليسترول.'] },
    banana: { name: 'موز', power: 'يمنحك المزيد من الطاقة ⚡', benefit: ['غني ب', { nutrient: 'potassium', label: 'البوتاسيوم' }, '، الذي يساعد عضلاتك وأعصابك على العمل بشكل جيد.'] },
    cherries: { name: 'كرز', power: 'يساعدك على النوم بشكل أفضل 🌙', benefit: ['من الفواكه القليلة التي تحتوي على الميلاتونين الطبيعي - هرمون النوم - بالإضافة إلى مضادات أكسدة تساعدك على التعافي.'] },
    grapes: { name: 'عنب', power: 'يحافظ على صحة أوعيتك الدموية 🩸', benefit: ['يحتوي على الريسفيراترول، مضاد أكسدة طبيعي يساعد على صحة أوعيتك الدموية.'] },
    pineapple: { name: 'أناناس', power: 'يساعد على هضمك 🍽️', benefit: ['يحتوي على إنزيم طبيعي يساعد معدتك على هضم الطعام بسهولة.'] },
    watermelon: { name: 'بطيخ', power: 'يحافظ على ترطيب جسمك 💧', benefit: ['أغلبه ماء، بالإضافة إلى مادة طبيعية تساعد عضلاتك على التعافي بشكل أسرع.'] },
    blueberries: { name: 'توت أزرق', power: 'يشحذ ذاكرتك 🧠', benefit: ['غني بمضادات أكسدة تساعد على الحفاظ على ذاكرة حادة مع التقدم في العمر.'] },
    spinach: { name: 'سبانخ', power: 'يقوي عظامك 💪', benefit: ['غني ب', { nutrient: 'vitaminK', label: 'فيتامين K' }, ' و', { nutrient: 'iron', label: 'الحديد' }, '، اللذان يحافظان على عظام قوية ودم صحي.'] },
    salmon: { name: 'سلمون', power: 'مفيد لدماغك وقلبك 🐟', benefit: ['من أفضل مصادر أوميغا 3 المفيدة جدًا لقلبك ودماغك.'] },
    walnuts: { name: 'جوز', power: 'يجعلك أكثر تركيزًا ونشاطًا 🧠', benefit: ['غني بأوميغا 3 النباتية المفيدة للدماغ - وشكله يشبه الدماغ أيضًا.'] },
    kale: { name: 'كرنب مجعد (كيل)', power: 'يجعلك أقوى 💪', benefit: ['من أكثر الخضروات فائدة، غني بفيتامينات ', { nutrient: 'vitaminA', label: 'A' }, ' و', { nutrient: 'vitaminC', label: 'C' }, ' و', { nutrient: 'vitaminK', label: 'K' }, ' ومضادات الأكسدة.'] },
    broccoli: { name: 'بروكلي', power: 'يقوي جهازك المناعي 🛡️', benefit: ['غني ب', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' ومواد أخرى تساعد في تقوية جهاز المناعة.'] },
    sweetPotato: { name: 'بطاطا حلوة', power: 'مفيد لبصرك 👁️', benefit: ['غنية ببيتا كاروتين الذي يحوله جسمك إلى ', { nutrient: 'vitaminA', label: 'فيتامين A' }, ' لعينين وبشرة صحية.'] },
    garlic: { name: 'ثوم', power: 'يساعدك على قلب سليم 🫀', benefit: ['يحتوي على مادة طبيعية تساعد في الحفاظ على صحة قلبك وجهازك المناعي.'] },
    eggs: { name: 'بيض', power: 'يمد دماغك بالطاقة 🧠', benefit: ['بروتين كامل غني بمواد مفيدة لدماغك وخلاياك.'] },
    lentils: { name: 'عدس', power: 'يحافظ على صحة هضمك 🌾', benefit: ['غني بالبروتين النباتي والألياف، التي تحافظ على استقرار سكر الدم وصحة الأمعاء.'] },
    almonds: { name: 'لوز', power: 'مفيد لقلبك وبشرتك ❤️', benefit: ['غني ب', { nutrient: 'vitaminE', label: 'فيتامين E' }, ' والدهون الصحية المفيدة لقلبك وبشرتك.'] },
    chiaSeeds: { name: 'بذور الشيا', power: 'مفيد لهضمك وقلبك 💧', benefit: ['بذور صغيرة غنية بالألياف وأوميغا 3 النباتية، مفيدة للهضم والقلب.'] },
    strawberries: { name: 'فراولة', power: 'يقوي جهازك المناعي ✨', benefit: ['من أغنى الفواكه ب', { nutrient: 'vitaminC', label: 'فيتامين C' }, '، وهو مفيد لبشرتك وجهازك المناعي.'] },
    kiwi: { name: 'كيوي', power: 'يعزز مناعتك 🧬', benefit: ['غني ب', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' ومضادات الأكسدة - يحتوي على ', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' أكثر من البرتقال لكل قضمة.'] },
    orange: { name: 'برتقال', power: 'يعزز مناعتك 🍊', benefit: ['من أشهر مصادر ', { nutrient: 'vitaminC', label: 'فيتامين C' }, '، الذي يساعد جسمك أيضًا على امتصاص الحديد.'] },
    tomato: { name: 'طماطم', power: 'مفيد لقلبك وبشرتك 🍅', benefit: ['غنية بمضادات الأكسدة، بالإضافة إلى جرعة جيدة من ', { nutrient: 'vitaminC', label: 'فيتامين C' }, '.'] },
    mushrooms: { name: 'فطر', power: 'مفيد لعظامك ومناعتك 🍄', benefit: ['من الأطعمة النباتية القليلة التي تحتوي على ', { nutrient: 'vitaminD', label: 'فيتامين D' }, '، الذي يساعد جسمك على امتصاص الكالسيوم.'] },
    oats: { name: 'شوفان', power: 'يبقيك ممتلئًا ونشيطًا 🥣', benefit: ['غني بألياف خاصة تحافظ على طاقة ثابتة وقلب سليم.'] },
    yogurt: { name: 'زبادي', power: 'يقوي عظامك وأسنانك 🥛', benefit: ['مصدر ممتاز ل', { nutrient: 'calcium', label: 'الكالسيوم' }, ' والبروبيوتيك المفيد لأمعائك.'] },
    mango: { name: 'مانجو', power: 'مفيد لبشرتك وعينيك 🥭', benefit: ['غني ب', { nutrient: 'vitaminA', label: 'فيتامين A' }, ' و', { nutrient: 'vitaminC', label: 'فيتامين C' }, '، اللذان يساعدان في إصلاح البشرة والحفاظ على رؤية صحية.'] },
    bellPepper: { name: 'فلفل حلو', power: 'يقوي جهازك المناعي 🫑', benefit: ['من أغنى مصادر ', { nutrient: 'vitaminC', label: 'فيتامين C' }, ' - أكثر حتى من البرتقال.'] },
    ginger: { name: 'زنجبيل', power: 'يخفف الغثيان والالتهاب 🫚', benefit: ['يحتوي على مادة طبيعية تساعد في تخفيف الغثيان وتهدئة الالتهاب.'] },
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

import type { NutrientId } from '../../types'
import type { Lang } from './lang'

/**
 * Translated display copy for the nutrient catalog (lib/nutrients.ts). `shortLabel`, `unit`,
 * and `rda` stay in lib/nutrients.ts unchanged across languages — they're scientific notation
 * (mg/mcg, element symbols) used the same way in Hebrew/Arabic nutrition contexts.
 */
export interface NutrientContent {
  name: string
  benefit: string
  foodSources: string[]
}

export const NUTRIENT_CONTENT: Record<Lang, Record<NutrientId, NutrientContent>> = {
  en: {
    vitaminA: {
      name: 'Vitamin A',
      benefit: 'Supports healthy vision, immune defense, and skin repair.',
      foodSources: [
        'Carrots', 'Sweet potatoes', 'Spinach', 'Kale', 'Eggs', 'Mango',
        'Butternut squash', 'Cantaloupe', 'Apricots', 'Red bell peppers', 'Liver', 'Butter',
      ],
    },
    vitaminC: {
      name: 'Vitamin C',
      benefit: 'Boosts immune function and helps your body absorb iron and repair tissue.',
      foodSources: [
        'Oranges', 'Bell peppers', 'Strawberries', 'Broccoli', 'Kiwi',
        'Brussels sprouts', 'Grapefruit', 'Papaya', 'Pineapple', 'Tomatoes', 'Cauliflower', 'Guava',
      ],
    },
    vitaminD: {
      name: 'Vitamin D',
      benefit: 'Helps your body absorb calcium for strong bones and supports immune health.',
      foodSources: [
        'Sunlight exposure', 'Salmon', 'Mackerel', 'Egg yolks', 'Mushrooms',
        'Sardines', 'Tuna', 'Fortified milk', 'Fortified orange juice', 'Cod liver oil', 'Fortified cereal',
      ],
    },
    vitaminE: {
      name: 'Vitamin E',
      benefit: 'An antioxidant that protects your cells from damage and supports immune function.',
      foodSources: [
        'Almonds', 'Sunflower seeds', 'Spinach', 'Avocado',
        'Hazelnuts', 'Peanut butter', 'Olive oil', 'Butternut squash', 'Kiwi', 'Broccoli',
      ],
    },
    vitaminK: {
      name: 'Vitamin K',
      benefit: 'Essential for normal blood clotting and helps keep bones strong.',
      foodSources: [
        'Kale', 'Spinach', 'Broccoli', 'Brussels sprouts',
        'Cabbage', 'Asparagus', 'Green beans', 'Lettuce', 'Parsley', 'Olive oil',
      ],
    },
    vitaminB1: {
      name: 'Vitamin B1',
      benefit: 'Helps convert food into energy and supports healthy nerve function.',
      foodSources: [
        'Whole grains', 'Pork', 'Legumes', 'Sunflower seeds',
        'Brown rice', 'Oats', 'Trout', 'Green peas', 'Flax seeds', 'Macadamia nuts',
      ],
    },
    vitaminB2: {
      name: 'Vitamin B2',
      benefit: 'Helps your body produce energy and supports healthy skin and eyes.',
      foodSources: [
        'Eggs', 'Milk', 'Almonds', 'Leafy greens',
        'Yogurt', 'Mushrooms', 'Beef', 'Quinoa', 'Fortified cereal', 'Spinach',
      ],
    },
    vitaminB3: {
      name: 'Vitamin B3',
      benefit: 'Supports energy metabolism and helps keep skin, nerves, and digestion healthy.',
      foodSources: [
        'Chicken', 'Tuna', 'Peanuts', 'Whole grains',
        'Turkey', 'Salmon', 'Mushrooms', 'Brown rice', 'Avocado', 'Sunflower seeds',
      ],
    },
    vitaminB5: {
      name: 'Vitamin B5',
      benefit: 'Helps convert food into usable energy and supports hormone and cholesterol production.',
      foodSources: [
        'Chicken', 'Beef', 'Mushrooms', 'Avocado', 'Sweet potatoes',
        'Broccoli', 'Eggs', 'Whole grains', 'Sunflower seeds', 'Lentils',
      ],
    },
    vitaminB6: {
      name: 'Vitamin B6',
      benefit: 'Supports brain development, mood regulation, and a healthy immune system.',
      foodSources: [
        'Chickpeas', 'Poultry', 'Potatoes', 'Bananas',
        'Salmon', 'Beef liver', 'Fortified cereal', 'Spinach', 'Sunflower seeds', 'Pistachios',
      ],
    },
    vitaminB7: {
      name: 'Vitamin B7',
      benefit: 'Supports healthy hair, skin, and nails, and helps your body metabolize fats and carbs.',
      foodSources: [
        'Eggs', 'Almonds', 'Salmon', 'Sweet potatoes', 'Spinach',
        'Liver', 'Avocado', 'Peanuts', 'Mushrooms', 'Broccoli',
      ],
    },
    vitaminB9: {
      name: 'Vitamin B9',
      benefit: 'Important for cell growth and DNA production, especially during pregnancy.',
      foodSources: [
        'Leafy greens', 'Beans', 'Lentils', 'Avocado',
        'Asparagus', 'Broccoli', 'Peanuts', 'Oranges', 'Fortified bread', 'Brussels sprouts',
      ],
    },
    vitaminB12: {
      name: 'Vitamin B12',
      benefit: 'Keeps nerve cells healthy and helps make red blood cells and DNA.',
      foodSources: [
        'Fish', 'Meat', 'Eggs', 'Dairy', 'Fortified cereal',
        'Clams', 'Salmon', 'Tuna', 'Beef liver', 'Yogurt', 'Nutritional yeast',
      ],
    },
    calcium: {
      name: 'Calcium',
      benefit: 'Builds and maintains strong bones and teeth, and supports muscle and nerve function.',
      foodSources: [
        'Dairy', 'Tofu', 'Leafy greens', 'Almonds',
        'Yogurt', 'Cheese', 'Sardines', 'Fortified plant milk', 'Kale', 'Chia seeds',
      ],
    },
    iron: {
      name: 'Iron',
      benefit: 'Helps red blood cells carry oxygen through the body and prevents fatigue.',
      foodSources: [
        'Red meat', 'Lentils', 'Spinach', 'Pumpkin seeds',
        'Chickpeas', 'Tofu', 'Quinoa', 'Dark chocolate', 'Cashews', 'Beef liver',
      ],
    },
    magnesium: {
      name: 'Magnesium',
      benefit: 'Supports muscle and nerve function, energy production, and healthy bones.',
      foodSources: [
        'Nuts', 'Seeds', 'Whole grains', 'Dark chocolate',
        'Spinach', 'Black beans', 'Avocado', 'Almonds', 'Cashews', 'Brown rice',
      ],
    },
    zinc: {
      name: 'Zinc',
      benefit: 'Supports immune function, wound healing, and helps your body process nutrients.',
      foodSources: [
        'Meat', 'Shellfish', 'Legumes', 'Seeds',
        'Oysters', 'Cashews', 'Chickpeas', 'Pumpkin seeds', 'Yogurt', 'Oats',
      ],
    },
    potassium: {
      name: 'Potassium',
      benefit: 'Helps regulate fluid balance, muscle contractions, and a healthy heartbeat.',
      foodSources: [
        'Bananas', 'Potatoes', 'Beans', 'Avocado',
        'Sweet potatoes', 'Spinach', 'Oranges', 'Coconut water', 'Salmon', 'Yogurt',
      ],
    },
    phosphorus: {
      name: 'Phosphorus',
      benefit: 'Works with calcium to build strong bones and teeth and helps cells produce energy.',
      foodSources: [
        'Dairy', 'Meat', 'Fish', 'Eggs', 'Lentils',
        'Nuts', 'Whole grains', 'Pumpkin seeds', 'Beans', 'Poultry',
      ],
    },
    copper: {
      name: 'Copper',
      benefit: 'Helps form red blood cells and connective tissue and supports iron absorption.',
      foodSources: [
        'Shellfish', 'Nuts', 'Seeds', 'Whole grains', 'Dark chocolate',
        'Organ meats', 'Mushrooms', 'Lentils', 'Potatoes', 'Leafy greens',
      ],
    },
    manganese: {
      name: 'Manganese',
      benefit: 'Supports bone formation and helps the body process cholesterol, carbs, and protein.',
      foodSources: [
        'Whole grains', 'Nuts', 'Leafy greens', 'Tea', 'Pineapple',
        'Legumes', 'Brown rice', 'Oats', 'Chickpeas', 'Sweet potatoes',
      ],
    },
    selenium: {
      name: 'Selenium',
      benefit: 'An antioxidant that protects cells from damage and supports thyroid and immune function.',
      foodSources: [
        'Brazil nuts', 'Tuna', 'Sardines', 'Eggs', 'Turkey',
        'Sunflower seeds', 'Mushrooms', 'Brown rice', 'Chicken', 'Spinach',
      ],
    },
    iodine: {
      name: 'Iodine',
      benefit: 'Essential for producing thyroid hormones that regulate metabolism and growth.',
      foodSources: [
        'Iodized salt', 'Seaweed', 'Cod', 'Dairy', 'Eggs',
        'Shrimp', 'Tuna', 'Prunes', 'Potatoes', 'Turkey',
      ],
    },
  },
  he: {
    vitaminA: {
      name: 'ויטמין A',
      benefit: 'תומך בראייה בריאה, בהגנה חיסונית ובתיקון העור.',
      foodSources: ['גזר', 'בטטה', 'תרד', 'קייל', 'ביצים', 'מנגו', 'דלעת חמאה', 'מלון קנטלופ', 'משמשים', 'פלפל אדום', 'כבד', 'חמאה'],
    },
    vitaminC: {
      name: 'ויטמין C',
      benefit: 'מחזק את מערכת החיסון ועוזר לגוף לספוג ברזל ולתקן רקמות.',
      foodSources: ['תפוזים', 'פלפלים', 'תותים', 'ברוקולי', 'קיווי', 'כרוב ניצנים', 'אשכוליות', 'פפאיה', 'אננס', 'עגבניות', 'כרובית', 'גויאבה'],
    },
    vitaminD: {
      name: 'ויטמין D',
      benefit: 'עוזר לגוף לספוג סידן לעצמות חזקות ותומך בבריאות המערכת החיסונית.',
      foodSources: ['חשיפה לשמש', 'סלמון', 'מקרל', 'חלמון ביצה', 'פטריות', 'סרדינים', 'טונה', 'חלב מועשר', 'מיץ תפוזים מועשר', 'שמן כבד בקלה', 'דגני בוקר מועשרים'],
    },
    vitaminE: {
      name: 'ויטמין E',
      benefit: 'נוגד חמצון שמגן על התאים מנזק ותומך בתפקוד המערכת החיסונית.',
      foodSources: ['שקדים', 'גרעיני חמנייה', 'תרד', 'אבוקדו', 'אגוזי לוז', 'חמאת בוטנים', 'שמן זית', 'דלעת חמאה', 'קיווי', 'ברוקולי'],
    },
    vitaminK: {
      name: 'ויטמין K',
      benefit: 'חיוני לקרישת דם תקינה ועוזר לשמור על עצמות חזקות.',
      foodSources: ['קייל', 'תרד', 'ברוקולי', 'כרוב ניצנים', 'כרוב', 'אספרגוס', 'שעועית ירוקה', 'חסה', 'פטרוזיליה', 'שמן זית'],
    },
    vitaminB1: {
      name: 'ויטמין B1',
      benefit: 'עוזר להפוך מזון לאנרגיה ותומך בתפקוד עצבי תקין.',
      foodSources: ['דגנים מלאים', 'בשר חזיר', 'קטניות', 'גרעיני חמנייה', 'אורז מלא', 'שיבולת שועל', 'פורל', 'אפונה ירוקה', 'זרעי פשתן', 'אגוזי מקדמיה'],
    },
    vitaminB2: {
      name: 'ויטמין B2',
      benefit: 'עוזר לגוף לייצר אנרגיה ותומך בעור ובעיניים בריאים.',
      foodSources: ['ביצים', 'חלב', 'שקדים', 'ירקות עלים ירוקים', 'יוגורט', 'פטריות', 'בקר', 'קינואה', 'דגני בוקר מועשרים', 'תרד'],
    },
    vitaminB3: {
      name: 'ויטמין B3',
      benefit: 'תומך בחילוף החומרים האנרגטי ועוזר לשמור על עור, עצבים ועיכול בריאים.',
      foodSources: ['עוף', 'טונה', 'בוטנים', 'דגנים מלאים', 'הודו', 'סלמון', 'פטריות', 'אורז מלא', 'אבוקדו', 'גרעיני חמנייה'],
    },
    vitaminB5: {
      name: 'ויטמין B5',
      benefit: 'עוזר להפוך מזון לאנרגיה זמינה ותומך בייצור הורמונים וכולסטרול.',
      foodSources: ['עוף', 'בקר', 'פטריות', 'אבוקדו', 'בטטה', 'ברוקולי', 'ביצים', 'דגנים מלאים', 'גרעיני חמנייה', 'עדשים'],
    },
    vitaminB6: {
      name: 'ויטמין B6',
      benefit: 'תומך בהתפתחות המוח, בוויסות מצב הרוח ובמערכת חיסון בריאה.',
      foodSources: ['חומוס', 'עוף', 'תפוחי אדמה', 'בננות', 'סלמון', 'כבד בקר', 'דגני בוקר מועשרים', 'תרד', 'גרעיני חמנייה', 'פיסטוקים'],
    },
    vitaminB7: {
      name: 'ויטמין B7',
      benefit: 'תומך בשיער, עור וציפורניים בריאים ועוזר לגוף לפרק שומנים ופחמימות.',
      foodSources: ['ביצים', 'שקדים', 'סלמון', 'בטטה', 'תרד', 'כבד', 'אבוקדו', 'בוטנים', 'פטריות', 'ברוקולי'],
    },
    vitaminB9: {
      name: 'ויטמין B9',
      benefit: 'חשוב לצמיחת תאים וייצור DNA, בייחוד במהלך היריון.',
      foodSources: ['ירקות עלים ירוקים', 'שעועית', 'עדשים', 'אבוקדו', 'אספרגוס', 'ברוקולי', 'בוטנים', 'תפוזים', 'לחם מועשר', 'כרוב ניצנים'],
    },
    vitaminB12: {
      name: 'ויטמין B12',
      benefit: 'שומר על תאי עצב בריאים ועוזר בייצור תאי דם אדומים ו-DNA.',
      foodSources: ['דגים', 'בשר', 'ביצים', 'מוצרי חלב', 'דגני בוקר מועשרים', 'צדפות', 'סלמון', 'טונה', 'כבד בקר', 'יוגורט', 'שמרי בירה תזונתיים'],
    },
    calcium: {
      name: 'סידן',
      benefit: 'בונה ושומר על עצמות ושיניים חזקות, ותומך בתפקוד השרירים והעצבים.',
      foodSources: ['מוצרי חלב', 'טופו', 'ירקות עלים ירוקים', 'שקדים', 'יוגורט', 'גבינה', 'סרדינים', 'חלב צמחי מועשר', 'קייל', 'זרעי צ׳יה'],
    },
    iron: {
      name: 'ברזל',
      benefit: 'עוזר לתאי הדם האדומים לשאת חמצן בגוף ומונע עייפות.',
      foodSources: ['בשר אדום', 'עדשים', 'תרד', 'גרעיני דלעת', 'חומוס', 'טופו', 'קינואה', 'שוקולד מריר', 'קשיו', 'כבד בקר'],
    },
    magnesium: {
      name: 'מגנזיום',
      benefit: 'תומך בתפקוד השרירים והעצבים, בייצור אנרגיה ובעצמות בריאות.',
      foodSources: ['אגוזים', 'זרעים', 'דגנים מלאים', 'שוקולד מריר', 'תרד', 'שעועית שחורה', 'אבוקדו', 'שקדים', 'קשיו', 'אורז מלא'],
    },
    zinc: {
      name: 'אבץ',
      benefit: 'תומך בתפקוד המערכת החיסונית ובריפוי פצעים, ועוזר לגוף לעבד רכיבים תזונתיים.',
      foodSources: ['בשר', 'פירות ים', 'קטניות', 'זרעים', 'צדפות', 'קשיו', 'חומוס', 'גרעיני דלעת', 'יוגורט', 'שיבולת שועל'],
    },
    potassium: {
      name: 'אשלגן',
      benefit: 'עוזר לווסת את איזון הנוזלים, את התכווצות השרירים ואת קצב הלב התקין.',
      foodSources: ['בננות', 'תפוחי אדמה', 'שעועית', 'אבוקדו', 'בטטה', 'תרד', 'תפוזים', 'מי קוקוס', 'סלמון', 'יוגורט'],
    },
    phosphorus: {
      name: 'זרחן',
      benefit: 'פועל יחד עם הסידן לבניית עצמות ושיניים חזקות ועוזר לתאים לייצר אנרגיה.',
      foodSources: ['מוצרי חלב', 'בשר', 'דגים', 'ביצים', 'עדשים', 'אגוזים', 'דגנים מלאים', 'גרעיני דלעת', 'שעועית', 'עוף'],
    },
    copper: {
      name: 'נחושת',
      benefit: 'עוזר ביצירת תאי דם אדומים ורקמת חיבור ותומך בספיגת ברזל.',
      foodSources: ['פירות ים', 'אגוזים', 'זרעים', 'דגנים מלאים', 'שוקולד מריר', 'נתחי פנים', 'פטריות', 'עדשים', 'תפוחי אדמה', 'ירקות עלים ירוקים'],
    },
    manganese: {
      name: 'מנגן',
      benefit: 'תומך בהיווצרות עצם ועוזר לגוף לעבד כולסטרול, פחמימות וחלבון.',
      foodSources: ['דגנים מלאים', 'אגוזים', 'ירקות עלים ירוקים', 'תה', 'אננס', 'קטניות', 'אורז מלא', 'שיבולת שועל', 'חומוס', 'בטטה'],
    },
    selenium: {
      name: 'סלניום',
      benefit: 'נוגד חמצון שמגן על התאים מנזק ותומך בתפקוד בלוטת התריס והמערכת החיסונית.',
      foodSources: ['אגוזי ברזיל', 'טונה', 'סרדינים', 'ביצים', 'הודו', 'גרעיני חמנייה', 'פטריות', 'אורז מלא', 'עוף', 'תרד'],
    },
    iodine: {
      name: 'יוד',
      benefit: 'חיוני לייצור הורמוני בלוטת התריס המווסתים את חילוף החומרים והצמיחה.',
      foodSources: ['מלח מיודד', 'אצות ים', 'בקלה', 'מוצרי חלב', 'ביצים', 'שרימפס', 'טונה', 'שזיפים מיובשים', 'תפוחי אדמה', 'הודו'],
    },
  },
  ar: {
    vitaminA: {
      name: 'فيتامين A',
      benefit: 'يدعم صحة البصر، والدفاع المناعي، وإصلاح الجلد.',
      foodSources: ['الجزر', 'البطاطا الحلوة', 'السبانخ', 'الكيل', 'البيض', 'المانجو', 'اليقطين', 'الشمام', 'المشمش', 'الفلفل الأحمر', 'الكبد', 'الزبدة'],
    },
    vitaminC: {
      name: 'فيتامين C',
      benefit: 'يعزز وظيفة المناعة ويساعد الجسم على امتصاص الحديد وإصلاح الأنسجة.',
      foodSources: ['البرتقال', 'الفلفل الحلو', 'الفراولة', 'البروكلي', 'الكيوي', 'كرنب بروكسل', 'الجريب فروت', 'البابايا', 'الأناناس', 'الطماطم', 'القرنبيط', 'الجوافة'],
    },
    vitaminD: {
      name: 'فيتامين D',
      benefit: 'يساعد الجسم على امتصاص الكالسيوم لعظام قوية ويدعم صحة المناعة.',
      foodSources: ['التعرض لأشعة الشمس', 'السلمون', 'الماكريل', 'صفار البيض', 'الفطر', 'السردين', 'التونة', 'الحليب المدعم', 'عصير البرتقال المدعم', 'زيت كبد سمك القد', 'الحبوب المدعمة'],
    },
    vitaminE: {
      name: 'فيتامين E',
      benefit: 'مضاد أكسدة يحمي خلاياك من التلف ويدعم وظيفة المناعة.',
      foodSources: ['اللوز', 'بذور دوار الشمس', 'السبانخ', 'الأفوكادو', 'البندق', 'زبدة الفول السوداني', 'زيت الزيتون', 'اليقطين', 'الكيوي', 'البروكلي'],
    },
    vitaminK: {
      name: 'فيتامين K',
      benefit: 'ضروري لتخثر الدم الطبيعي ويساعد في الحفاظ على قوة العظام.',
      foodSources: ['الكيل', 'السبانخ', 'البروكلي', 'كرنب بروكسل', 'الملفوف', 'الهليون', 'الفاصوليا الخضراء', 'الخس', 'البقدونس', 'زيت الزيتون'],
    },
    vitaminB1: {
      name: 'فيتامين B1',
      benefit: 'يساعد على تحويل الطعام إلى طاقة ويدعم وظيفة الأعصاب السليمة.',
      foodSources: ['الحبوب الكاملة', 'لحم الخنزير', 'البقوليات', 'بذور دوار الشمس', 'الأرز البني', 'الشوفان', 'سمك التراوت', 'البازلاء الخضراء', 'بذور الكتان', 'جوز المكاديميا'],
    },
    vitaminB2: {
      name: 'فيتامين B2',
      benefit: 'يساعد الجسم على إنتاج الطاقة ويدعم صحة الجلد والعينين.',
      foodSources: ['البيض', 'الحليب', 'اللوز', 'الخضروات الورقية', 'الزبادي', 'الفطر', 'لحم البقر', 'الكينوا', 'الحبوب المدعمة', 'السبانخ'],
    },
    vitaminB3: {
      name: 'فيتامين B3',
      benefit: 'يدعم عملية التمثيل الغذائي للطاقة ويساعد في الحفاظ على صحة الجلد والأعصاب والهضم.',
      foodSources: ['الدجاج', 'التونة', 'الفول السوداني', 'الحبوب الكاملة', 'الديك الرومي', 'السلمون', 'الفطر', 'الأرز البني', 'الأفوكادو', 'بذور دوار الشمس'],
    },
    vitaminB5: {
      name: 'فيتامين B5',
      benefit: 'يساعد على تحويل الطعام إلى طاقة قابلة للاستخدام ويدعم إنتاج الهرمونات والكوليسترول.',
      foodSources: ['الدجاج', 'لحم البقر', 'الفطر', 'الأفوكادو', 'البطاطا الحلوة', 'البروكلي', 'البيض', 'الحبوب الكاملة', 'بذور دوار الشمس', 'العدس'],
    },
    vitaminB6: {
      name: 'فيتامين B6',
      benefit: 'يدعم نمو الدماغ، وتنظيم المزاج، وجهاز المناعة السليم.',
      foodSources: ['الحمص', 'الدواجن', 'البطاطس', 'الموز', 'السلمون', 'كبد البقر', 'الحبوب المدعمة', 'السبانخ', 'بذور دوار الشمس', 'الفستق'],
    },
    vitaminB7: {
      name: 'فيتامين B7',
      benefit: 'يدعم صحة الشعر والجلد والأظافر ويساعد الجسم على استقلاب الدهون والكربوهيدرات.',
      foodSources: ['البيض', 'اللوز', 'السلمون', 'البطاطا الحلوة', 'السبانخ', 'الكبد', 'الأفوكادو', 'الفول السوداني', 'الفطر', 'البروكلي'],
    },
    vitaminB9: {
      name: 'فيتامين B9',
      benefit: 'مهم لنمو الخلايا وإنتاج الحمض النووي، خاصة أثناء الحمل.',
      foodSources: ['الخضروات الورقية', 'الفاصوليا', 'العدس', 'الأفوكادو', 'الهليون', 'البروكلي', 'الفول السوداني', 'البرتقال', 'الخبز المدعم', 'كرنب بروكسل'],
    },
    vitaminB12: {
      name: 'فيتامين B12',
      benefit: 'يحافظ على صحة الخلايا العصبية ويساعد في تكوين خلايا الدم الحمراء والحمض النووي.',
      foodSources: ['السمك', 'اللحوم', 'البيض', 'منتجات الألبان', 'الحبوب المدعمة', 'المحار', 'السلمون', 'التونة', 'كبد البقر', 'الزبادي', 'خميرة التغذية'],
    },
    calcium: {
      name: 'الكالسيوم',
      benefit: 'يبني ويحافظ على قوة العظام والأسنان، ويدعم وظيفة العضلات والأعصاب.',
      foodSources: ['منتجات الألبان', 'التوفو', 'الخضروات الورقية', 'اللوز', 'الزبادي', 'الجبن', 'السردين', 'حليب نباتي مدعم', 'الكيل', 'بذور الشيا'],
    },
    iron: {
      name: 'الحديد',
      benefit: 'يساعد خلايا الدم الحمراء على حمل الأكسجين في الجسم ويمنع الإرهاق.',
      foodSources: ['اللحوم الحمراء', 'العدس', 'السبانخ', 'بذور اليقطين', 'الحمص', 'التوفو', 'الكينوا', 'الشوكولاتة الداكنة', 'الكاجو', 'كبد البقر'],
    },
    magnesium: {
      name: 'المغنيسيوم',
      benefit: 'يدعم وظيفة العضلات والأعصاب، وإنتاج الطاقة، وصحة العظام.',
      foodSources: ['المكسرات', 'البذور', 'الحبوب الكاملة', 'الشوكولاتة الداكنة', 'السبانخ', 'الفاصوليا السوداء', 'الأفوكادو', 'اللوز', 'الكاجو', 'الأرز البني'],
    },
    zinc: {
      name: 'الزنك',
      benefit: 'يدعم وظيفة المناعة، وشفاء الجروح، ويساعد الجسم على معالجة العناصر الغذائية.',
      foodSources: ['اللحوم', 'المأكولات البحرية', 'البقوليات', 'البذور', 'المحار', 'الكاجو', 'الحمص', 'بذور اليقطين', 'الزبادي', 'الشوفان'],
    },
    potassium: {
      name: 'البوتاسيوم',
      benefit: 'يساعد في تنظيم توازن السوائل، وانقباضات العضلات، ونبضات قلب سليمة.',
      foodSources: ['الموز', 'البطاطس', 'الفاصوليا', 'الأفوكادو', 'البطاطا الحلوة', 'السبانخ', 'البرتقال', 'ماء جوز الهند', 'السلمون', 'الزبادي'],
    },
    phosphorus: {
      name: 'الفوسفور',
      benefit: 'يعمل مع الكالسيوم لبناء عظام وأسنان قوية ويساعد الخلايا على إنتاج الطاقة.',
      foodSources: ['منتجات الألبان', 'اللحوم', 'السمك', 'البيض', 'العدس', 'المكسرات', 'الحبوب الكاملة', 'بذور اليقطين', 'الفاصوليا', 'الدواجن'],
    },
    copper: {
      name: 'النحاس',
      benefit: 'يساعد في تكوين خلايا الدم الحمراء والنسيج الضام ويدعم امتصاص الحديد.',
      foodSources: ['المأكولات البحرية', 'المكسرات', 'البذور', 'الحبوب الكاملة', 'الشوكولاتة الداكنة', 'أعضاء اللحوم الداخلية', 'الفطر', 'العدس', 'البطاطس', 'الخضروات الورقية'],
    },
    manganese: {
      name: 'المنغنيز',
      benefit: 'يدعم تكوين العظام ويساعد الجسم على معالجة الكوليسترول والكربوهيدرات والبروتين.',
      foodSources: ['الحبوب الكاملة', 'المكسرات', 'الخضروات الورقية', 'الشاي', 'الأناناس', 'البقوليات', 'الأرز البني', 'الشوفان', 'الحمص', 'البطاطا الحلوة'],
    },
    selenium: {
      name: 'السيلينيوم',
      benefit: 'مضاد أكسدة يحمي الخلايا من التلف ويدعم وظيفة الغدة الدرقية والمناعة.',
      foodSources: ['جوز البرازيل', 'التونة', 'السردين', 'البيض', 'الديك الرومي', 'بذور دوار الشمس', 'الفطر', 'الأرز البني', 'الدجاج', 'السبانخ'],
    },
    iodine: {
      name: 'اليود',
      benefit: 'ضروري لإنتاج هرمونات الغدة الدرقية التي تنظم عملية التمثيل الغذائي والنمو.',
      foodSources: ['الملح المعالج باليود', 'الأعشاب البحرية', 'القد', 'منتجات الألبان', 'البيض', 'الروبيان', 'التونة', 'الخوخ المجفف', 'البطاطس', 'الديك الرومي'],
    },
  },
}

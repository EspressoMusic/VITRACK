import type { Lang } from './i18n/lang'

// [English, Hebrew, Arabic]
const FOODS: [string, string, string][] = [
  ['Apple', 'תפוח', 'تفاح'], ['Banana', 'בננה', 'موز'], ['Orange', 'תפוז', 'برتقال'], ['Grapes', 'ענבים', 'عنب'],
  ['Strawberries', 'תותים', 'فراولة'], ['Blueberries', 'אוכמניות', 'توت أزرق'], ['Watermelon', 'אבטיח', 'بطيخ'],
  ['Mango', 'מנגו', 'مانجو'], ['Pineapple', 'אננס', 'أناناس'], ['Pear', 'אגס', 'كمثرى'], ['Peach', 'אפרסק', 'خوخ'],
  ['Plum', 'שזיף', 'برقوق'], ['Cherries', 'דובדבנים', 'كرز'], ['Kiwi', 'קיווי', 'كيوي'], ['Avocado', 'אבוקדו', 'أفوكادو'],
  ['Lemon', 'לימון', 'ليمون'], ['Grapefruit', 'אשכולית', 'جريب فروت'], ['Pomegranate', 'רימון', 'رمان'],
  ['Fig', 'תאנה', 'تين'], ['Date', 'תמר', 'تمر'],
  ['Broccoli', 'ברוקולי', 'بروكلي'], ['Carrot', 'גזר', 'جزر'], ['Spinach', 'תרד', 'سبانخ'], ['Kale', 'קייל', 'كرنب أجعد'],
  ['Lettuce', 'חסה', 'خس'], ['Cucumber', 'מלפפון', 'خيار'], ['Tomato', 'עגבנייה', 'طماطم'], ['Bell pepper', 'פלפל', 'فلفل رومي'],
  ['Onion', 'בצל', 'بصل'], ['Garlic', 'שום', 'ثوم'], ['Potato', 'תפוח אדמה', 'بطاطس'], ['Sweet potato', 'בטטה', 'بطاطا حلوة'],
  ['Corn', 'תירס', 'ذرة'], ['Peas', 'אפונה', 'بازلاء'], ['Green beans', 'שעועית ירוקה', 'فاصوليا خضراء'],
  ['Cauliflower', 'כרובית', 'قرنبيط'], ['Zucchini', 'קישוא', 'كوسا'], ['Eggplant', 'חציל', 'باذنجان'],
  ['Mushroom', 'פטריות', 'فطر'], ['Beet', 'סלק', 'شمندر'],
  ['Chicken breast', 'חזה עוף', 'صدر دجاج'], ['Chicken thigh', 'ירך עוף', 'فخذ دجاج'], ['Ground beef', 'בשר בקר טחון', 'لحم بقري مفروم'],
  ['Beef steak', 'סטייק בקר', 'ستيك لحم بقري'], ['Pork chop', 'צלע חזיר', 'ضلع خنزير'], ['Turkey breast', 'חזה הודו', 'صدر ديك رومي'],
  ['Salmon', 'סלמון', 'سلمون'], ['Tuna', 'טונה', 'تونة'], ['Shrimp', 'שרימפס', 'روبيان'], ['Cod', 'בקלה', 'سمك القد'],
  ['Egg', 'ביצה', 'بيضة'], ['Boiled egg', 'ביצה קשה', 'بيضة مسلوقة'], ['Fried egg', 'ביצת עין', 'بيضة مقلية'],
  ['Scrambled eggs', 'ביצים מקושקשות', 'بيض مخفوق'], ['Omelette', 'חביתה', 'عجة'], ['Tofu', 'טופו', 'توفو'], ['Tempeh', 'טמפה', 'تمبيه'],
  ['Lentils', 'עדשים', 'عدس'], ['Chickpeas', 'גרגרי חומוס', 'حمص حب'], ['Black beans', 'שעועית שחורה', 'فاصوليا سوداء'],
  ['Kidney beans', 'שעועית אדומה', 'فاصوليا حمراء'],
  ['White rice', 'אורז לבן', 'أرز أبيض'], ['Brown rice', 'אורז מלא', 'أرز بني'], ['Quinoa', 'קינואה', 'كينوا'],
  ['Oatmeal', 'דייסת שיבולת שועל', 'شوفان'], ['Pasta', 'פסטה', 'معكرونة'], ['Spaghetti', 'ספגטי', 'سباغيتي'],
  ['Bread', 'לחם', 'خبز'], ['Whole wheat bread', 'לחם מלא', 'خبز قمح كامل'], ['Pita', 'פיתה', 'خبز عربي'],
  ['Bagel', 'בייגל', 'بيغل'], ['Tortilla', 'טורטייה', 'تورتيلا'],
  ['Milk', 'חלב', 'حليب'], ['Yogurt', 'יוגורט', 'زبادي'], ['Greek yogurt', 'יוגורט יווני', 'زبادي يوناني'], ['Cheese', 'גבינה', 'جبن'],
  ['Cottage cheese', 'קוטג׳', 'جبن قريش'], ['Labneh', 'לבנה', 'لبنة'], ['Butter', 'חמאה', 'زبدة'], ['Cream cheese', 'גבינת שמנת', 'جبن كريمي'],
  ['Almond milk', 'חלב שקדים', 'حليب اللوز'], ['Soy milk', 'חלב סויה', 'حليب الصويا'], ['Ice cream', 'גלידה', 'آيس كريم'],
  ['Almonds', 'שקדים', 'لوز'], ['Walnuts', 'אגוזי מלך', 'جوز'], ['Cashews', 'קשיו', 'كاجو'], ['Peanuts', 'בוטנים', 'فول سوداني'],
  ['Peanut butter', 'חמאת בוטנים', 'زبدة الفول السوداني'], ['Sunflower seeds', 'גרעיני חמנייה', 'بذور عباد الشمس'],
  ['Chia seeds', 'זרעי צ׳יה', 'بذور الشيا'], ['Flax seeds', 'זרעי פשתן', 'بذور الكتان'], ['Pistachios', 'פיסטוקים', 'فستق'],
  ['Pecans', 'פקאנים', 'بيكان'], ['Tahini', 'טחינה', 'طحينة'],
  ['Pizza', 'פיצה', 'بيتزا'], ['Hamburger', 'המבורגר', 'همبرغر'], ['Cheeseburger', 'צ׳יזבורגר', 'تشيز برغر'],
  ['French fries', 'צ׳יפס', 'بطاطس مقلية'], ['Hot dog', 'נקניקייה', 'هوت دوغ'], ['Sandwich', 'כריך', 'ساندويتش'],
  ['Sushi', 'סושי', 'سوشي'], ['Burrito', 'בוריטו', 'بوريتو'], ['Taco', 'טאקו', 'تاكو'], ['Salad', 'סלט', 'سلطة'],
  ['Soup', 'מרק', 'شوربة'], ['Chicken soup', 'מרק עוף', 'شوربة دجاج'], ['Steak', 'סטייק', 'ستيك'],
  ['Grilled chicken', 'עוף בגריל', 'دجاج مشوي'], ['Fried chicken', 'עוף מטוגן', 'دجاج مقلي'], ['Schnitzel', 'שניצל', 'شنيتسل'],
  ['Rice and beans', 'אורז ושעועית', 'أرز وفاصوليا'], ['Stir fry', 'מוקפץ', 'قلي سريع'], ['Curry', 'קארי', 'كاري'],
  ['Falafel', 'פלאפל', 'فلافل'], ['Hummus', 'חומוס', 'حمص'], ['Shakshuka', 'שקשוקה', 'شكشوكة'], ['Shawarma', 'שווארמה', 'شاورما'],
  ['Majadra', 'מג׳דרה', 'مجدرة'], ['Bourekas', 'בורקס', 'بوريك'],
  ['Chocolate', 'שוקולד', 'شوكولاتة'], ['Dark chocolate', 'שוקולד מריר', 'شوكولاتة داكنة'], ['Cookie', 'עוגייה', 'بسكويت'],
  ['Cake', 'עוגה', 'كيك'], ['Muffin', 'מאפין', 'مافن'], ['Donut', 'סופגנייה', 'دونات'], ['Pancakes', 'פנקייק', 'بان كيك'],
  ['Waffles', 'וופל', 'وافل'], ['Granola bar', 'חטיף גרנולה', 'لوح جرانولا'], ['Protein bar', 'חטיף חלבון', 'لوح بروتين'],
  ['Orange juice', 'מיץ תפוזים', 'عصير برتقال'], ['Apple juice', 'מיץ תפוחים', 'عصير تفاح'], ['Coffee', 'קפה', 'قهوة'],
  ['Tea', 'תה', 'شاي'], ['Green tea', 'תה ירוק', 'شاي أخضر'], ['Coconut water', 'מי קוקוס', 'ماء جوز الهند'],
  ['Smoothie', 'שייק פירות', 'سموذي'], ['Protein shake', 'שייק חלבון', 'مخفوق بروتين'], ['Water', 'מים', 'ماء'],
  ['Soda', 'משקה מוגז', 'مشروب غازي'],
  ['Popcorn', 'פופקורן', 'فشار'], ['Chips', 'תפוצ׳יפס', 'رقائق البطاطس'], ['Pretzels', 'בייגלה', 'بريتزل'],
  ['Crackers', 'קרקרים', 'بسكويت مالح'], ['Trail mix', 'תערובת אגוזים', 'مكسرات مشكلة'], ['Dried apricots', 'משמש מיובש', 'مشمش مجفف'],
  ['Raisins', 'צימוקים', 'زبيب'], ['Coconut', 'קוקוס', 'جوز الهند'], ['Olive oil', 'שמן זית', 'زيت الزيتون'], ['Honey', 'דבש', 'عسل'],
]

const LANG_INDEX: Record<Lang, 0 | 1 | 2> = { en: 0, he: 1, ar: 2 }

const FINAL_LETTERS: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }

// Hebrew final letters and geresh vs. a plain apostrophe shouldn't block a match mid-typing.
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[ךםןףץ]/g, (c) => FINAL_LETTERS[c]).replace(/[׳`’]/g, "'").replace(/״/g, '"')
}

// Matches the typed text against the food's name in the current language and in English
// (so Latin typing still works), and always returns the name in the current language.
export function searchFoodNames(query: string, lang: Lang, limit = 6): string[] {
  const q = normalize(query)
  if (!q) return []
  const i = LANG_INDEX[lang]
  const startsWith: string[] = []
  const includes: string[] = []
  for (const food of FOODS) {
    const local = normalize(food[i])
    const en = food[0].toLowerCase()
    if (local.startsWith(q) || en.startsWith(q)) startsWith.push(food[i])
    else if (local.includes(q) || en.includes(q)) includes.push(food[i])
  }
  return [...startsWith, ...includes].slice(0, limit)
}

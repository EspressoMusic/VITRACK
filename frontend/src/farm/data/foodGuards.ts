import type { LocalizedText, Point } from '../types'

/**
 * Food guards: every food the player ate this week sends an archer to stand outside the city wall
 * and shoot arrows at the germs, until the week ends. The healthier the food, the stronger its guard.
 * (Not to be confused with the guards other players send — see ./guards.)
 */

/** Body outline of a guard: the food itself, with little legs and a bow. */
export type FoodGuardShape = 'round' | 'long' | 'cone' | 'puff' | 'drop' | 'curve' | 'egg' | 'fish' | 'bean' | 'bowl' | 'cup' | 'drumstick' | 'loaf'
/** Something on top of the head. */
export type FoodGuardTop = 'calyx' | 'stem' | 'tuft' | 'crown' | 'sprout'
/** Detail painted on the body (kept inside its outline). */
export type FoodGuardPattern = 'stripes' | 'seeds' | 'dots' | 'holes' | 'pit' | 'kernels' | 'rings' | 'scales' | 'band' | 'crust' | 'dent'

/** 1 good · 2 great · 3 super healthy. */
export type FoodGuardTier = 1 | 2 | 3

export interface FoodGuardDef {
  id: string
  icon: string
  name: LocalizedText
  tier: FoodGuardTier
  /** Lowercase bits of a food name (any language) that make this guard. A leading '=' means a whole word. */
  keywords: string[]
  look: {
    shape: FoodGuardShape
    color: string
    /** Second color: stripes, seeds, a bowl's filling, a cup's lid… */
    accent: string
    top?: FoodGuardTop
    pattern?: FoodGuardPattern
  }
}

export const FOOD_GUARD = {
  /** Most food guards standing outside the wall at once (the strongest ones get the spots). */
  max: 10,
  /** How far a guard can shoot, in tiles. */
  range: 7,
  /** Seconds between two arrows, for a food eaten once this week. */
  reload: 3,
  /** Each more time the same food was eaten this week shoots this much faster (up to `maxServings`). */
  reloadPerServing: 0.35,
  maxServings: 3,
  /** Seconds a guard holds its bow drawn before letting go. */
  aimTime: 0.3,
}

/** Arrow strength by tier (a germ's armor blocks part of it, like the gate's zap). */
export const FOOD_GUARD_POWER: Record<FoodGuardTier, number> = { 1: 1, 2: 2, 3: 3 }

/** Where food guards stand (tile coordinates), best spot first: outside the wall, mostly left of the gate,
 *  clear of the germs' road, the germ library's signpost and the spots guards from other players use. */
export const FOOD_GUARD_SPOTS: Point[] = [
  { x: 15.3, y: 24.45 },
  { x: 22.95, y: 24.45 },
  { x: 14.25, y: 24.45 },
  { x: 23.85, y: 24.45 },
  { x: 14.8, y: 25.2 },
  { x: 13.2, y: 24.45 },
  { x: 15.85, y: 25.2 },
  { x: 13.75, y: 25.2 },
  { x: 12.15, y: 24.45 },
  { x: 12.7, y: 25.2 },
]

/** Keeps the wild land's dead trees and rocks off the guards' spots. */
export function nearFoodGuardSpot(x: number, y: number): boolean {
  return FOOD_GUARD_SPOTS.some((s) => Math.hypot(x - s.x, y - s.y) < 1)
}

/** Sweets, fried food and fizzy drinks: they don't send a guard. */
export const JUNK_KEYWORDS = [
  'pizza', 'burger', 'fries', 'chips', 'crisps', 'cake', 'cookie', 'donut', 'doughnut', 'candy', 'sweets', 'chocolate', 'soda', 'cola',
  '=coke', 'ice cream', 'nugget', 'hot dog', 'nutella', 'popcorn', 'waffle', 'croissant', 'pastry', 'muffin', 'cupcake', 'brownie',
  'energy drink', 'gummy', 'jelly bean', 'marshmallow', 'lollipop', 'milkshake',
  'פיצה', 'המבורגר', 'בורגר', "צ'יפס", 'צ׳יפס', 'ציפס', 'עוגה', 'עוגת', 'עוגיות', 'עוגיה', 'עוגייה', 'סופגני', 'דונאט', 'ממתק', 'סוכרי',
  'שוקולד', 'קולה', 'מוגז', 'גלידה', 'נקניקי', 'נאגטס', 'נוטלה', 'במבה', 'ביסלי', 'פופקורן', '=ופל', '=וופל', 'וופלים', 'קרואסון', 'מאפה', 'בורקס', 'מאפין',
  'בראוניז', 'מרשמלו', '=טורט', 'מילקשייק',
  'بيتزا', 'برجر', 'برغر', 'همبرغر', 'مقلية', 'شيبس', 'كعك', 'كيك', 'بسكويت', 'دونات', 'حلوى', 'حلويات', 'سكاكر', 'شوكولات', 'كولا',
  'غازي', 'آيس كريم', 'ايس كريم', 'بوظة', 'نقانق', 'ناجتس', 'نوتيلا', 'فشار', 'وافل', 'كرواسون', 'معجنات', 'مافن', 'براونيز',
]

/** Drinks and spices: no guard, even when the name also mentions a food ("coffee with milk", "black pepper"). */
export const NOT_FOOD_KEYWORDS = [
  '=water', 'coffee', '=tea', 'black pepper', '=מים', 'קפה', '=תה', 'פלפל שחור', '=ماء', '=مياه', 'قهوة', '=شاي', 'فلفل أسود',
]

/** Oils, sauces and sweeteners: no guard of their own, but a food in the same name still counts ("pasta in tomato sauce"). */
export const TOPPING_KEYWORDS = [
  'olive oil', '=oil', '=salt', 'sauce', 'ketchup', 'mayo', 'dressing', 'spice', 'sugar', 'honey', '=jam',
  'שמן', '=מלח', 'רוטב', 'קטשופ', 'מיונז', 'תבלין', 'סוכר', 'דבש', 'ריבה',
  '=زيت', 'زيت زيتون', '=ملح', 'صلصة', 'كاتشب', 'مايونيز', 'بهارات', '=سكر', 'عسل', 'مربى',
]

const g = (def: FoodGuardDef) => def

/** Most specific first: a guard's keywords use up the words they match, so later guards can't match them again
 *  (e.g. sweet potato before potato, potato before apple — "תפוח אדמה"). */
export const FOOD_GUARDS: FoodGuardDef[] = [
  // ---------- super healthy ----------
  g({
    id: 'broccoli',
    icon: '🥦',
    name: { en: 'Broccoli Guard', he: 'שומר ברוקולי', ar: 'حارس البروكلي' },
    tier: 3,
    keywords: ['broccoli', 'ברוקולי', 'بروكلي', 'بروكلى'],
    look: { shape: 'puff', color: '#5fae3e', accent: '#3f8a2a' },
  }),
  g({
    id: 'greens',
    icon: '🥬',
    name: { en: 'Leafy Greens Guard', he: 'שומר עלים ירוקים', ar: 'حارس الورقيات' },
    tier: 3,
    keywords: ['spinach', 'kale', 'lettuce', 'arugula', 'chard', 'leafy', 'תרד', 'קייל', 'חסה', 'רוקט', 'מנגולד', 'עלי בייבי', 'سبانخ', '=خس', 'جرجير', 'سلق', 'كرنب'],
    look: { shape: 'puff', color: '#8fd45a', accent: '#5fae3e' },
  }),
  g({
    id: 'strawberry',
    icon: '🍓',
    name: { en: 'Strawberry Guard', he: 'שומר תות', ar: 'حارس الفراولة' },
    tier: 2,
    keywords: ['strawberr', 'תות', 'فراولة', 'فراوله'],
    look: { shape: 'cone', color: '#ff4f6d', accent: '#ffe27a', top: 'calyx', pattern: 'seeds' },
  }),
  g({
    id: 'berries',
    icon: '🫐',
    name: { en: 'Blueberry Guard', he: 'שומר אוכמניות', ar: 'حارس التوت' },
    tier: 3,
    keywords: ['blueberr', 'blackberr', 'raspberr', 'berries', 'berry', 'אוכמני', 'פטל', 'פירות יער', 'توت'],
    look: { shape: 'round', color: '#4f5bd5', accent: '#8d97ff', top: 'crown' },
  }),
  g({
    id: 'fish',
    icon: '🐟',
    name: { en: 'Fish Guard', he: 'שומר דג', ar: 'حارس السمك' },
    tier: 3,
    keywords: [
      'salmon', 'tuna', 'sardine', 'mackerel', 'trout', '=cod', '=fish', 'fish fillet', 'סלמון', 'טונה', 'סרדינ', 'מקרל', 'אמנון', 'דניס', 'לברק',
      'בורי', 'טרוטה', '=דג', '=דגים', 'פילה דג', 'سلمون', 'تونة', 'تونا', 'سردين', 'ماكريل', '=سمك', 'فيليه سمك',
    ],
    look: { shape: 'fish', color: '#ff9a76', accent: '#ffd9c9', pattern: 'scales' },
  }),
  g({
    id: 'legumes',
    icon: '🫘',
    name: { en: 'Bean Guard', he: 'שומר קטניות', ar: 'حارس البقوليات' },
    tier: 3,
    keywords: [
      'lentil', 'bean', 'chickpea', 'hummus', 'edamame', 'falafel', 'עדשים', 'עדשה', 'שעועית', 'חומוס', 'גרגירי', 'אדממה', '=פול', 'פלאפל',
      'عدس', 'فاصوليا', 'فاصولياء', '=فول', '=حمص', 'فلافل',
    ],
    look: { shape: 'bean', color: '#c9813f', accent: '#9a5a26', top: 'sprout', pattern: 'dent' },
  }),
  g({
    id: 'avocado',
    icon: '🥑',
    name: { en: 'Avocado Guard', he: 'שומר אבוקדו', ar: 'حارس الأفوكادو' },
    tier: 3,
    keywords: ['avocado', 'guacamole', 'אבוקדו', 'גוואקמולי', 'أفوكادو', 'افوكادو'],
    look: { shape: 'drop', color: '#5f9e3a', accent: '#d9ec8f', pattern: 'pit' },
  }),
  g({
    id: 'nuts',
    icon: '🌰',
    name: { en: 'Nut Guard', he: 'שומר אגוזים', ar: 'حارس المكسرات' },
    tier: 3,
    keywords: [
      'almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut', '=nuts', 'mixed nuts', 'seeds', 'tahini', 'שקד', 'אגוז', 'קשיו', 'פיסטוק', 'פקאן',
      'טחינה', 'זרעי', 'لوز', '=جوز', 'كاجو', 'فستق', 'بندق', 'مكسرات', 'طحينة', 'بذور',
    ],
    look: { shape: 'egg', color: '#c98a4b', accent: '#a4683a', top: 'sprout', pattern: 'dent' },
  }),

  // ---------- great ----------
  g({
    id: 'cucumber',
    icon: '🥒',
    name: { en: 'Cucumber Guard', he: 'שומר מלפפון', ar: 'حارس الخيار' },
    tier: 2,
    keywords: ['cucumber', 'zucchini', 'מלפפון', 'מלפפונים', 'קישוא', 'خيار', 'كوسا'],
    look: { shape: 'long', color: '#5fae4a', accent: '#a6dc7c', pattern: 'stripes' },
  }),
  g({
    id: 'tomato',
    icon: '🍅',
    name: { en: 'Tomato Guard', he: 'שומר עגבניה', ar: 'حارس الطماطم' },
    tier: 2,
    keywords: ['cherry tomato', 'tomato', 'עגבני', 'طماطم', 'بندورة', 'بندوره'],
    look: { shape: 'round', color: '#ef4b3c', accent: '#ff9a8c', top: 'calyx' },
  }),
  g({
    id: 'carrot',
    icon: '🥕',
    name: { en: 'Carrot Guard', he: 'שומר גזר', ar: 'حارس الجزر' },
    tier: 2,
    keywords: ['carrot', 'גזר', 'جزر'],
    look: { shape: 'cone', color: '#ff8a2a', accent: '#d96a12', top: 'tuft', pattern: 'rings' },
  }),
  g({
    id: 'eggplant',
    icon: '🍆',
    name: { en: 'Eggplant Guard', he: 'שומר חציל', ar: 'حارس الباذنجان' },
    tier: 2,
    keywords: ['eggplant', 'aubergine', 'חציל', 'باذنجان'],
    look: { shape: 'long', color: '#7b4bb3', accent: '#a57ad9', top: 'calyx' },
  }),
  g({
    id: 'pepper',
    icon: '🫑',
    name: { en: 'Pepper Guard', he: 'שומר פלפל', ar: 'حارس الفلفل' },
    tier: 2,
    keywords: ['bell pepper', '=pepper', '=peppers', 'פלפל', 'فلفل'],
    look: { shape: 'round', color: '#ffc83a', accent: '#ffe48a', top: 'stem' },
  }),
  g({
    id: 'sweetPotato',
    icon: '🍠',
    name: { en: 'Sweet Potato Guard', he: 'שומר בטטה', ar: 'حارس البطاطا الحلوة' },
    tier: 2,
    keywords: ['sweet potato', 'בטטה', 'بطاطا حلوة', 'بطاطا حلوه'],
    look: { shape: 'bean', color: '#c0603a', accent: '#ff9a5a', pattern: 'dent' },
  }),
  g({
    id: 'potato',
    icon: '🥔',
    name: { en: 'Potato Guard', he: 'שומר תפוח אדמה', ar: 'حارس البطاطا' },
    tier: 1,
    keywords: ['potato', 'תפוח אדמה', 'תפוחי אדמה', 'תפו"א', 'תפוא', 'פירה', 'بطاطا', 'بطاطس'],
    look: { shape: 'egg', color: '#c9a06a', accent: '#a77c47', pattern: 'dots' },
  }),
  g({
    id: 'orange',
    icon: '🍊',
    name: { en: 'Orange Guard', he: 'שומר תפוז', ar: 'حارس البرتقال' },
    tier: 2,
    keywords: ['orange', 'mandarin', 'clementine', 'tangerine', 'grapefruit', 'citrus', 'תפוז', 'קלמנטינ', 'מנדרינ', 'אשכולית', 'برتقال', 'يوسفي', 'جريب فروت'],
    look: { shape: 'round', color: '#ff9f1c', accent: '#e07f00', top: 'stem', pattern: 'dots' },
  }),
  g({
    id: 'fruit',
    icon: '🍑',
    name: { en: 'Fruit Guard', he: 'שומר פירות', ar: 'حارس الفاكهة' },
    tier: 2,
    keywords: [
      'pineapple', 'fruit', 'watermelon', 'melon', 'mango', 'kiwi', '=pear', '=pears', 'peach', 'grape', '=plum', 'pomegranate', 'apricot', 'cherr',
      'papaya', 'persimmon', '=fig', '=figs', '=date', '=dates', 'nectarine', 'אננס', '=פרי', 'פירות', 'אבטיח', 'מלון', 'מנגו', 'קיווי', 'אגס', 'אפרסק',
      'ענב', 'שזיף', 'רימון', 'משמש', 'דובדבן', 'אפרסמון', 'תאנ', 'תמר', 'נקטרינ', 'أناناس', 'اناناس', 'فاكهة', 'فواكه', 'بطيخ', 'شمام', 'مانجو',
      'كيوي', 'إجاص', 'اجاص', 'كمثرى', 'خوخ', 'عنب', 'برقوق', 'رمان', 'مشمش', 'كرز', '=تين', '=تمر',
    ],
    look: { shape: 'round', color: '#ffad7a', accent: '#ff7f6a', top: 'stem' },
  }),
  g({
    id: 'apple',
    icon: '🍎',
    name: { en: 'Apple Guard', he: 'שומר תפוח', ar: 'حارس التفاح' },
    tier: 2,
    keywords: ['apple', 'תפוח', 'تفاح'],
    look: { shape: 'round', color: '#e8423f', accent: '#ff8f7f', top: 'stem' },
  }),
  g({
    id: 'banana',
    icon: '🍌',
    name: { en: 'Banana Guard', he: 'שומר בננה', ar: 'حارس الموز' },
    tier: 2,
    keywords: ['banana', 'בננ', '=موز'],
    look: { shape: 'curve', color: '#ffd84a', accent: '#c99a1a' },
  }),
  g({
    id: 'egg',
    icon: '🥚',
    name: { en: 'Egg Guard', he: 'שומר ביצה', ar: 'حارس البيض' },
    tier: 2,
    keywords: ['=egg', '=eggs', 'omelet', 'shakshuka', 'ביצ', 'חביתה', 'שקשוקה', '=بيض', '=بيضة', 'عجة', 'شكشوكة'],
    look: { shape: 'egg', color: '#fff6e0', accent: '#ffd166' },
  }),
  g({
    id: 'oats',
    icon: '🥣',
    name: { en: 'Oat Guard', he: 'שומר שיבולת שועל', ar: 'حارس الشوفان' },
    tier: 2,
    keywords: ['=oat', '=oats', 'oatmeal', 'porridge', 'quinoa', 'buckwheat', 'שיבולת', 'קוואקר', 'דייסה', 'קינואה', 'כוסמת', 'شوفان', 'كينوا'],
    look: { shape: 'bowl', color: '#f3e2bf', accent: '#d9b77a' },
  }),
  g({
    id: 'yogurt',
    icon: '🥛',
    name: { en: 'Yogurt Guard', he: 'שומר יוגורט', ar: 'حارس الزبادي' },
    tier: 2,
    keywords: ['yogurt', 'yoghurt', 'kefir', 'cottage', '=milk', 'skyr', 'labneh', 'יוגורט', 'קפיר', 'קוטג', '=חלב', 'גבינה לבנה', 'לבנה', 'زبادي', 'لبنة', '=لبن', '=حليب'],
    look: { shape: 'cup', color: '#ffffff', accent: '#7cc5ff', pattern: 'band' },
  }),
  g({
    id: 'chicken',
    icon: '🍗',
    name: { en: 'Chicken Guard', he: 'שומר עוף', ar: 'حارس الدجاج' },
    tier: 2,
    keywords: ['chicken', 'turkey', 'עוף', 'הודו', 'פרגית', 'دجاج', 'فراخ', 'ديك رومي'],
    look: { shape: 'drumstick', color: '#e9a85f', accent: '#fff3dc' },
  }),
  g({
    id: 'salad',
    icon: '🥗',
    name: { en: 'Salad Guard', he: 'שומר סלט', ar: 'حارس السلطة' },
    tier: 2,
    keywords: ['salad', 'vegetable', 'veggie', 'סלט', 'ירקות', 'سلطة', 'سلطه', 'خضار'],
    look: { shape: 'bowl', color: '#ffffff', accent: '#6cc04a', top: 'sprout' },
  }),

  // ---------- good ----------
  g({
    id: 'corn',
    icon: '🌽',
    name: { en: 'Corn Guard', he: 'שומר תירס', ar: 'حارس الذرة' },
    tier: 1,
    keywords: ['corn', 'תירס', 'ذرة'],
    look: { shape: 'long', color: '#ffd84a', accent: '#e8b020', top: 'tuft', pattern: 'kernels' },
  }),
  g({
    id: 'rice',
    icon: '🍚',
    name: { en: 'Rice Guard', he: 'שומר אורז', ar: 'حارس الأرز' },
    tier: 1,
    keywords: ['=rice', 'risotto', 'sushi', 'אורז', 'סושי', 'مجدرة', 'أرز', 'ارز', '=رز', 'سوشي'],
    look: { shape: 'bowl', color: '#7fc8e8', accent: '#fffdf5' },
  }),
  g({
    id: 'pasta',
    icon: '🍝',
    name: { en: 'Pasta Guard', he: 'שומר פסטה', ar: 'حارس المعكرونة' },
    tier: 1,
    keywords: ['pasta', 'spaghetti', 'noodle', 'macaroni', 'penne', 'פסטה', 'ספגטי', 'אטריות', 'מקרוני', 'פתיתים', 'معكرونة', 'مكرونة', 'باستا', 'نودلز'],
    look: { shape: 'bowl', color: '#ff8a5c', accent: '#ffd56b' },
  }),
  g({
    id: 'bread',
    icon: '🍞',
    name: { en: 'Bread Guard', he: 'שומר לחם', ar: 'حارس الخبز' },
    tier: 1,
    keywords: ['bread', 'toast', 'pita', 'sandwich', 'bagel', 'wrap', 'tortilla', 'לחם', 'פיתה', 'טוסט', 'כריך', 'סנדוויץ', 'בייגל', 'טורטיי', 'לאפה', 'خبز', 'توست', 'ساندويش', 'شطيرة', 'تورتيلا'],
    look: { shape: 'loaf', color: '#e3a65a', accent: '#ffe2b0', pattern: 'crust' },
  }),
  g({
    id: 'cheese',
    icon: '🧀',
    name: { en: 'Cheese Guard', he: 'שומר גבינה', ar: 'حارس الجبن' },
    tier: 1,
    keywords: ['cheese', 'גבינ', 'جبن'],
    look: { shape: 'loaf', color: '#ffd23f', accent: '#e8b020', pattern: 'holes' },
  }),
]

/** Healthy food that isn't in the list above (a home-cooked dish, a stew…). */
export const MEAL_GUARD: FoodGuardDef = {
  id: 'meal',
  icon: '🍽️',
  name: { en: 'Meal Guard', he: 'שומר ארוחה', ar: 'حارس الوجبة' },
  tier: 1,
  keywords: [],
  look: { shape: 'bowl', color: '#f4e6c8', accent: '#f6b35b', top: 'sprout' },
}

export const FOOD_GUARDS_BY_ID: Record<string, FoodGuardDef> = Object.fromEntries([...FOOD_GUARDS, MEAL_GUARD].map((d) => [d.id, d]))

import type { LocalizedText } from '../types'
import type { JunkShape } from './junkFoods'

/** What makes a germ type special on the map. */
export type GermPower =
  /** No trick, just bites. */
  | 'none'
  /** Runs and bites fast. */
  | 'fast'
  /** Tough skin: needs several taps and the gate's zap does less. */
  | 'armor'
  /** Splits into two small germs when it pops. */
  | 'split'
  /** Stops on the road and spits goo at the gate from afar. */
  | 'spit'
  /** Keeps fading out: while faded it can't be tapped or zapped. */
  | 'fade'
  /** Its bite goes right through the gate's defense. */
  | 'pierce'
  /** Heals the germs around it. */
  | 'heal'
  /** The boss: huge, strong, needs many taps. */
  | 'boss'
  /** Junk food (./junkFoods): stops in front of the wall and throws bits of itself at the food friends on top of it. */
  | 'lob'

export type GermShape = 'round' | 'cube' | 'blob' | 'flu' | 'rod' | 'ghost' | 'dry' | 'couch' | 'king'
export type FoeShape = GermShape | JunkShape

/** What anything that walks up to attack the city needs on the map: the germs, and the junk food (./junkFoods). */
export interface FoeDef {
  id: string
  power: GermPower
  hp: number
  attack: number
  /** World units per second along the road. */
  speed: number
  /** Seconds between two bites (or spits). */
  attackEvery: number
  /** Taps it takes to squish it by hand. */
  taps: number
  /** Taken off the gate's zap. */
  armor: number
  /** Body radius, world units (the basic germ is 8). */
  radius: number
  /** Relative chance to be the next one out of the swamp. */
  weight: number
  /** Player level from which it starts to show up. */
  minLevel: number
  color: string
  shape: FoeShape
}

export interface GermDef extends FoeDef {
  name: LocalizedText
  /** The power in a few words. */
  powerName: LocalizedText
  /** What the power does on the map. */
  powerInfo: LocalizedText
  /** What makes it grow in real life. */
  cause: LocalizedText
  /** What beats it in real life. */
  cure: LocalizedText
  /** Foods and habits that beat it. */
  cureIcons: string[]
  shape: GermShape
}

export const GERMS: GermDef[] = [
  {
    id: 'sniffle',
    name: { en: 'Sniffles', he: 'נזלתון', ar: 'زُكامون' },
    powerName: { en: 'Regular', he: 'רגיל', ar: 'عادي' },
    powerInfo: { en: 'Walks to the gate and bites it.', he: 'הולך עד השער ונושך אותו.', ar: 'يمشي إلى البوابة ويعضها.' },
    cause: {
      en: 'Spreads from sneezes and coughs, and from hands that were not washed.',
      he: 'עובר מעיטושים ושיעולים, ומידיים שלא נשטפו.',
      ar: 'ينتقل من العطس والسعال ومن الأيدي غير المغسولة.',
    },
    cure: {
      en: 'Washing hands with soap, sneezing into your elbow, and fruit with vitamin C.',
      he: 'שטיפת ידיים עם סבון, עיטוש לתוך המרפק, ופירות עם ויטמין C.',
      ar: 'غسل اليدين بالصابون، العطس في الكوع، وفواكه فيها فيتامين C.',
    },
    cureIcons: ['🧼', '💪', '🍊'],
    power: 'none',
    hp: 4,
    attack: 3,
    speed: 17,
    attackEvery: 1.3,
    taps: 1,
    armor: 0,
    radius: 8,
    weight: 3,
    minLevel: 1,
    color: '#8fd14f',
    shape: 'round',
  },
  {
    id: 'sugar',
    name: { en: 'Sugar Bug', he: 'סוכרון', ar: 'سُكّرون' },
    powerName: { en: 'Super fast', he: 'מהיר במיוחד', ar: 'سريع جدًا' },
    powerInfo: { en: 'Runs twice as fast and bites quickly.', he: 'רץ פי שתיים מהר ונושך בקצב.', ar: 'يركض بضعف السرعة ويعض بسرعة.' },
    cause: {
      en: 'Grows from candy, sweets and sugary drinks.',
      he: 'גדל מסוכריות, ממתקים ומשקאות מתוקים.',
      ar: 'ينمو من الحلوى والسكاكر والمشروبات المحلّاة.',
    },
    cure: {
      en: 'Water instead of sweet drinks, fruit instead of candy, and brushing your teeth.',
      he: 'מים במקום משקה מתוק, פרי במקום ממתק, וצחצוח שיניים.',
      ar: 'الماء بدل المشروب الحلو، الفاكهة بدل الحلوى، وتنظيف الأسنان.',
    },
    cureIcons: ['💧', '🍎', '🪥'],
    power: 'fast',
    hp: 3,
    attack: 2,
    speed: 36,
    attackEvery: 0.7,
    taps: 1,
    armor: 0,
    radius: 7,
    weight: 2,
    minLevel: 1,
    color: '#ff8fb8',
    shape: 'cube',
  },
  {
    id: 'grease',
    name: { en: 'Grease Blob', he: 'שומנון', ar: 'دُهنون' },
    powerName: { en: 'Armored', he: 'משוריין', ar: 'مُدرّع' },
    powerInfo: {
      en: 'Thick skin: the gate hurts it less, and it takes 3 taps.',
      he: 'עור עבה: השער פוגע בו פחות, וצריך 3 נגיעות.',
      ar: 'جلد سميك: البوابة تؤذيه أقل، ويحتاج 3 نقرات.',
    },
    cause: {
      en: 'Grows from fried food, chips and lots of fast food.',
      he: 'גדל מאוכל מטוגן, חטיפים והרבה ג׳אנק פוד.',
      ar: 'ينمو من الأكل المقلي والشيبس والكثير من الوجبات السريعة.',
    },
    cure: {
      en: 'Vegetables, a fresh salad and food cooked at home.',
      he: 'ירקות, סלט טרי ואוכל שמבשלים בבית.',
      ar: 'الخضار، سلطة طازجة وأكل مطبوخ في البيت.',
    },
    cureIcons: ['🥦', '🥗', '🍳'],
    power: 'armor',
    hp: 6,
    attack: 4,
    speed: 10,
    attackEvery: 1.6,
    taps: 3,
    armor: 1,
    radius: 9.5,
    weight: 1.5,
    minLevel: 1,
    color: '#f2c14e',
    shape: 'blob',
  },
  {
    id: 'flu',
    name: { en: 'Flu Bug', he: 'שפעתון', ar: 'إنفلونزون' },
    powerName: { en: 'Splits in two', he: 'מתפצל לשניים', ar: 'ينقسم لاثنين' },
    powerInfo: {
      en: 'When it pops, two small ones come out.',
      he: 'כשמפוצצים אותו, יוצאים ממנו שניים קטנים.',
      ar: 'عندما ينفجر يخرج منه اثنان صغيران.',
    },
    cause: {
      en: 'Spreads in crowded places in winter, mostly when the body is tired.',
      he: 'עובר במקומות צפופים בחורף, בעיקר כשהגוף עייף.',
      ar: 'ينتقل في الأماكن المزدحمة في الشتاء، خاصة عندما يكون الجسم متعبًا.',
    },
    cure: {
      en: 'Rest, a good night of sleep, lots of drinking and a warm soup.',
      he: 'מנוחה, שינה טובה, הרבה שתייה ומרק חם.',
      ar: 'الراحة، نوم جيد، شرب كثير وشوربة دافئة.',
    },
    cureIcons: ['😴', '🍲', '🍵'],
    power: 'split',
    hp: 4,
    attack: 3,
    speed: 15,
    attackEvery: 1.3,
    taps: 1,
    armor: 0,
    radius: 8.5,
    weight: 2,
    minLevel: 1,
    color: '#6fa8ff',
    shape: 'flu',
  },
  {
    id: 'tummy',
    name: { en: 'Tummy Bug', he: 'בטנון', ar: 'بطنون' },
    powerName: { en: 'Spits from afar', he: 'יורק מרחוק', ar: 'يبصق من بعيد' },
    powerInfo: {
      en: 'Stops on the road and spits goo at the gate.',
      he: 'נעצר בדרך ויורק רפש על השער.',
      ar: 'يتوقف في الطريق ويبصق لزوجة على البوابة.',
    },
    cause: {
      en: 'Grows on fruit and vegetables that were not washed, and on food left out of the fridge.',
      he: 'גדל על פירות וירקות שלא נשטפו, ועל אוכל שנשאר מחוץ למקרר.',
      ar: 'ينمو على الفواكه والخضار غير المغسولة، وعلى الأكل المتروك خارج الثلاجة.',
    },
    cure: {
      en: 'Washing fruit and vegetables, keeping food in the fridge, and yogurt for the tummy.',
      he: 'שוטפים פירות וירקות, שומרים אוכל במקרר, ויוגורט לבטן.',
      ar: 'غسل الفواكه والخضار، حفظ الأكل في الثلاجة، واللبن للبطن.',
    },
    cureIcons: ['🚰', '🧊', '🥛'],
    power: 'spit',
    hp: 3,
    attack: 3,
    speed: 15,
    attackEvery: 2.1,
    taps: 1,
    armor: 0,
    radius: 8,
    weight: 1.5,
    minLevel: 1,
    color: '#b98cff',
    shape: 'rod',
  },
  {
    id: 'sleepy',
    name: { en: 'Sleepy Ghost', he: 'עייפון', ar: 'نعسان' },
    powerName: { en: 'Disappears', he: 'נעלם', ar: 'يختفي' },
    powerInfo: {
      en: "Keeps fading away. While it's gone you can't hit it.",
      he: 'כל הזמן נעלם. כשהוא שקוף אי אפשר לפגוע בו.',
      ar: 'يختفي كل الوقت. عندما يكون شفافًا لا يمكن ضربه.',
    },
    cause: {
      en: 'Grows when you go to bed late and look at screens before sleep.',
      he: 'גדל כשהולכים לישון מאוחר ומסתכלים במסכים לפני השינה.',
      ar: 'ينمو عندما ننام متأخرين وننظر إلى الشاشات قبل النوم.',
    },
    cure: {
      en: 'Going to bed on time, no screens at night, and playing outside in the sun.',
      he: 'הולכים לישון בזמן, בלי מסכים בלילה, ומשחקים בחוץ בשמש.',
      ar: 'النوم في الوقت، بلا شاشات في الليل، واللعب في الخارج تحت الشمس.',
    },
    cureIcons: ['🛏️', '📵', '☀️'],
    power: 'fade',
    hp: 4,
    attack: 3,
    speed: 14,
    attackEvery: 1.4,
    taps: 1,
    armor: 0,
    radius: 8,
    weight: 1.5,
    minLevel: 1,
    color: '#c7b5ff',
    shape: 'ghost',
  },
  {
    id: 'thirsty',
    name: { en: 'Dry Bug', he: 'יובשון', ar: 'جفّافون' },
    powerName: { en: 'Breaks defense', he: 'שובר הגנה', ar: 'يكسر الدفاع' },
    powerInfo: {
      en: "Its bite goes right through the gate's defense.",
      he: 'הנשיכה שלו עוברת ישר דרך ההגנה של השער.',
      ar: 'عضته تمر مباشرة من دفاع البوابة.',
    },
    cause: {
      en: "Grows when you don't drink enough water during the day.",
      he: 'גדל כשלא שותים מספיק מים במשך היום.',
      ar: 'ينمو عندما لا نشرب ما يكفي من الماء خلال اليوم.',
    },
    cure: {
      en: 'Drinking water all day long, and juicy fruit like watermelon and cucumber.',
      he: 'שותים מים לאורך כל היום, ופירות עסיסיים כמו אבטיח ומלפפון.',
      ar: 'شرب الماء طوال اليوم، وفواكه عصيرية مثل البطيخ والخيار.',
    },
    cureIcons: ['💧', '🍉', '🥒'],
    power: 'pierce',
    hp: 4,
    attack: 3,
    speed: 17,
    attackEvery: 1.3,
    taps: 1,
    armor: 0,
    radius: 8,
    weight: 1.5,
    minLevel: 1,
    color: '#e8b26a',
    shape: 'dry',
  },
  {
    id: 'couch',
    name: { en: 'Couch Bug', he: 'עצלון', ar: 'كسلون' },
    powerName: { en: 'Heals friends', he: 'מרפא חברים', ar: 'يعالج أصدقاءه' },
    powerInfo: {
      en: 'Gives energy back to the germs around it. Get it first!',
      he: 'מחזיר כוח לחיידקים שלידו. כדאי לעצור אותו ראשון!',
      ar: 'يعيد القوة للجراثيم القريبة منه. أوقفه أولًا!',
    },
    cause: {
      en: 'Grows when you sit all day and hardly move.',
      he: 'גדל כשיושבים כל היום וכמעט לא זזים.',
      ar: 'ينمو عندما نجلس طوال اليوم ولا نتحرك تقريبًا.',
    },
    cure: {
      en: 'Running, dancing, riding a bike and playing outside.',
      he: 'ריצה, ריקוד, רכיבה על אופניים ומשחק בחוץ.',
      ar: 'الركض، الرقص، ركوب الدراجة واللعب في الخارج.',
    },
    cureIcons: ['🏃', '💃', '🚲'],
    power: 'heal',
    hp: 5,
    attack: 2,
    speed: 11,
    attackEvery: 1.5,
    taps: 2,
    armor: 0,
    radius: 8.5,
    weight: 1.2,
    minLevel: 1,
    color: '#ff9f5a',
    shape: 'couch',
  },
  {
    id: 'king',
    name: { en: 'Germ King', he: 'מלך החיידקים', ar: 'ملك الجراثيم' },
    powerName: { en: 'The boss', he: 'הבוס', ar: 'الزعيم' },
    powerInfo: {
      en: 'Huge and strong, bites hard and takes 6 taps.',
      he: 'ענק וחזק, נושך חזק וצריך 6 נגיעות.',
      ar: 'ضخم وقوي، يعض بقوة ويحتاج 6 نقرات.',
    },
    cause: {
      en: 'Shows up when all the bad habits come together: junk food, no sleep and no moving.',
      he: 'מגיע כשכל ההרגלים הרעים מתחברים: ג׳אנק, בלי שינה ובלי תנועה.',
      ar: 'يظهر عندما تجتمع كل العادات السيئة: أكل سريع، بلا نوم وبلا حركة.',
    },
    cure: {
      en: 'A healthy day: good food, water, movement and sleep.',
      he: 'יום בריא: אוכל טוב, מים, תנועה ושינה.',
      ar: 'يوم صحي: أكل جيد، ماء، حركة ونوم.',
    },
    cureIcons: ['🥗', '💧', '🏃', '😴'],
    power: 'boss',
    hp: 16,
    attack: 6,
    speed: 8,
    attackEvery: 2,
    taps: 6,
    armor: 1,
    radius: 13,
    weight: 0.5,
    minLevel: 3,
    color: '#e0565b',
    shape: 'king',
  },
]

export const GERMS_BY_ID: Record<string, GermDef> = Object.fromEntries(GERMS.map((g) => [g.id, g]))

/** Lifetime count of one germ type stopped, in `GameState.stats`. */
export const germStatKey = (id: string) => `germ:${id}`

/** Small germs that come out of a popped Flu Bug. */
export const MINI_GERM = { hp: 1, attack: 2, speedFactor: 1.4, sizeFactor: 0.62 }

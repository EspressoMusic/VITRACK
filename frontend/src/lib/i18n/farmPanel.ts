import type { FarmError } from '../../farm/types'
import type { Lang } from './lang'

export type FarmShopTab = 'buildings' | 'crops' | 'production' | 'decorations'

interface FarmStrings {
  shop: string
  barn: string
  orders: string
  shopTabs: Record<FarmShopTab, string>
  plant: string
  produce: string
  open: string
  move: string
  remove: string
  /** Second tap on Remove — the object is gone for good, with no refund. */
  removeConfirm: string
  unlock: string
  deliver: string
  place: string
  cancel: string
  done: string
  sell: string
  great: string
  close: string
  levelShort: (n: number) => string
  fromLevel: (n: number) => string
  readyIn: (time: string) => string
  ready: string
  /** Field menu: the crop got water and grows faster. */
  watered: string
  /** Field menu: still dry — the character will come water it. */
  thirsty: string
  building: (time: string) => string
  plantingHint: (crop: string) => string
  placingHint: string
  barnSpace: (used: number, cap: number) => string
  barnEmpty: string
  upgradeBarn: (n: number) => string
  sellFor: (n: number) => string
  queueTitle: string
  freeSlot: string
  newOrderIn: (time: string) => string
  levelUpTitle: (n: number) => string
  unlockedTitle: string
  nothingNew: string
  lockedLand: string
  maxForNow: string
  pickSeed: string
  gateHealth: string
  gateBroken: string
  defense: (n: number) => string
  germsStopped: (n: number) => string
  upgrade: string
  repair: string
  maxLevel: string
  enterHouse: string
  houseTitle: string
  houseSoon: string
  roomSize: (w: number, h: number) => string
  germLibrary: string
  germLibraryTitle: string
  germPower: string
  germCause: string
  germCure: string
  germHealth: string
  germBite: string
  germSpeed: string
  germStoppedCount: (n: number) => string
  germFromLevel: (n: number) => string
  germFound: (name: string) => string
  neighbors: string
  neighborsTitle: string
  myCity: string
  cityNumber: (n: number) => string
  nameYourCity: string
  save: string
  visit: string
  otherCities: string
  findingCities: string
  noCities: string
  offline: string
  guardsHint: (n: number) => string
  helpedToday: string
  backHome: string
  /** Visit bar: step inside the visited player's home. */
  visitHouse: string
  openingCity: string
  cityFailed: string
  sendGuard: string
  guardSent: string
  guardOnTheWay: (name: string) => string
  guardLimit: (n: number) => string
  guardsArrived: (from: string[]) => string
  /** A land was bought and the food friend caged there broke free. */
  friendFreed: (name: string) => string
  /** The player tapped a food friend living in town. */
  friendHello: (name: string) => string
  /** Locked land menu: who is waiting in the cage there. */
  friendCaged: (name: string) => string
  getCoins: string
  adPays: (n: number) => string
  adsLeft: (left: number, total: number) => string
  watchAd: string
  adsDoneToday: string
  adLabel: string
  adEndsIn: (s: number) => string
  adThanks: string
  collect: (n: number) => string
  errors: Record<FarmError, string>
}

export const FARM_STRINGS: Record<Lang, FarmStrings> = {
  en: {
    shop: 'Shop',
    barn: 'Barn',
    orders: 'Orders',
    shopTabs: { buildings: 'Buildings', crops: 'Crops', production: 'Crafts', decorations: 'Decor' },
    plant: 'Plant',
    produce: 'Produce',
    open: 'Open',
    move: 'Move',
    remove: 'Remove',
    removeConfirm: 'Sure? Remove',
    unlock: 'Unlock',
    deliver: 'Deliver',
    place: 'Place',
    cancel: 'Cancel',
    done: 'Done',
    sell: 'Sell',
    great: 'Great!',
    close: 'Close',
    levelShort: (n) => `Lv ${n}`,
    fromLevel: (n) => `Level ${n}`,
    readyIn: (time) => `Ready in ${time}`,
    ready: 'Ready!',
    watered: 'Watered, growing faster 💧',
    thirsty: 'Needs water 💧',
    building: (time) => `Building… ${time}`,
    plantingHint: (crop) => `Tap empty fields to plant ${crop}`,
    placingHint: 'Drag it or tap a spot',
    barnSpace: (used, cap) => `${used}/${cap}`,
    barnEmpty: 'Your barn is empty. Harvest something first 🌾',
    upgradeBarn: (n) => `+${n} space`,
    sellFor: (n) => `Sell for ${n}`,
    queueTitle: 'In the oven',
    freeSlot: 'Free',
    newOrderIn: (time) => `New order in ${time}`,
    levelUpTitle: (n) => `Level ${n}!`,
    unlockedTitle: 'New for you',
    nothingNew: 'Keep going, more is on the way 🌱',
    lockedLand: 'Grow your city here',
    maxForNow: 'Max for now',
    pickSeed: 'What to plant?',
    gateHealth: 'Gate health',
    gateBroken: 'The gate is broken, germs are piling up!',
    defense: (n) => `Defense ${n}`,
    germsStopped: (n) => `Germs stopped: ${n}`,
    upgrade: 'Upgrade',
    repair: 'Repair',
    maxLevel: 'Top level',
    enterHouse: 'Enter house',
    houseTitle: 'My house',
    houseSoon: 'Soon you can decorate your home here ✨',
    roomSize: (w, h) => `Room ${w}×${h}`,
    germLibrary: 'Library',
    germLibraryTitle: 'Germ Library',
    germPower: 'Power',
    germCause: 'Where does it come from?',
    germCure: 'What destroys it?',
    germHealth: 'Health',
    germBite: 'Bite',
    germSpeed: 'Speed',
    germStoppedCount: (n) => `You stopped ${n}`,
    germFromLevel: (n) => `Shows up from level ${n}`,
    germFound: (name) => `New germ: ${name}! Tap to meet it 📖`,
    neighbors: 'Neighbors',
    neighborsTitle: 'Visit other cities',
    myCity: 'Your city',
    cityNumber: (n) => `City #${n}`,
    nameYourCity: 'Name your city',
    save: 'Save',
    visit: 'Visit',
    otherCities: 'Other cities 🔄',
    findingCities: 'Looking for cities…',
    noCities: 'No other cities yet. Check back soon 🏙️',
    offline: 'No connection. Check the internet and try again 📶',
    guardsHint: (n) => `Send a guard to help a city. You can send ${n} a day 💂`,
    helpedToday: 'Helped',
    backHome: 'Home',
    visitHouse: 'Their home 🛋️',
    openingCity: 'Walking over…',
    cityFailed: "This city didn't open. Try another one",
    sendGuard: 'Send a guard 💂',
    guardSent: 'Guard sent ✓',
    guardOnTheWay: (name) => `Your guard is on the way to ${name} 💂`,
    guardLimit: (n) => `You sent ${n} guards today. You can send more tomorrow 🌙`,
    guardsArrived: (from) => (from.length === 1 ? `${from[0]} sent a guard to help you 💂` : `${from.length} guards came to help you 💂`),
    friendFreed: (name) => `You set ${name} free! Now it lives in your city 🎉`,
    friendHello: (name) => `${name} says hi 👋`,
    friendCaged: (name) => `${name} is stuck in a cage here. Unlock to set it free 🔓`,
    getCoins: 'Get coins',
    adPays: (n) => `Watch a short ad and get ${n} coins`,
    adsLeft: (left, total) => `${left} of ${total} left today`,
    watchAd: 'Watch an ad ▶',
    adsDoneToday: 'That is all for today. Come back tomorrow 🌙',
    adLabel: 'Ad',
    adEndsIn: (s) => `Your coins are coming in ${s}…`,
    adThanks: 'Thanks for watching 🎉',
    collect: (n) => `Collect +${n}`,
    errors: {
      noCoins: 'Not enough coins 💰',
      barnFull: 'Your barn is full. Sell something to make room 📦',
      missingItems: 'You are missing some items',
      blocked: "You can't put that here",
      levelLow: 'Reach a higher level first ⭐',
      limit: 'You have the most you can for now',
      queueFull: 'The queue is full',
      notReady: 'Not ready yet ⏳',
      maxLevel: 'Already at the top level ⭐',
    },
  },
  he: {
    shop: 'חנות',
    barn: 'אסם',
    orders: 'הזמנות',
    shopTabs: { buildings: 'מבנים', crops: 'גידולים', production: 'ייצור', decorations: 'קישוטים' },
    plant: 'לשתול',
    produce: 'לייצר',
    open: 'לפתוח',
    move: 'להזיז',
    remove: 'להסיר',
    removeConfirm: 'בטוח? להסיר',
    unlock: 'לפתוח',
    deliver: 'למסור',
    place: 'למקם',
    cancel: 'ביטול',
    done: 'סיום',
    sell: 'למכור',
    great: 'יופי!',
    close: 'סגירה',
    levelShort: (n) => `רמה ${n}`,
    fromLevel: (n) => `מרמה ${n}`,
    readyIn: (time) => `מוכן בעוד ${time}`,
    ready: 'מוכן!',
    watered: 'הושקה, גדל מהר יותר 💧',
    thirsty: 'צריך מים 💧',
    building: (time) => `בבנייה… ${time}`,
    plantingHint: (crop) => `ללחוץ על חלקה ריקה כדי לשתול ${crop}`,
    placingHint: 'לגרור או ללחוץ על מקום',
    barnSpace: (used, cap) => `${used}/${cap}`,
    barnEmpty: 'האסם ריק. קודם קוצרים משהו מהשדה 🌾',
    upgradeBarn: (n) => `+${n} מקום`,
    sellFor: (n) => `למכור ב-${n}`,
    queueTitle: 'בתנור',
    freeSlot: 'פנוי',
    newOrderIn: (time) => `הזמנה חדשה בעוד ${time}`,
    levelUpTitle: (n) => `עלית לרמה ${n}!`,
    unlockedTitle: 'חדש בשבילך',
    nothingNew: 'ממשיכים ככה, עוד דברים בדרך 🌱',
    lockedLand: 'כאן אפשר להרחיב את העיר',
    maxForNow: 'מקסימום כרגע',
    pickSeed: 'מה לשתול?',
    gateHealth: 'חוזק השער',
    gateBroken: 'השער שבור והחיידקים מצטברים!',
    defense: (n) => `הגנה ${n}`,
    germsStopped: (n) => `חיידקים שנעצרו: ${n}`,
    upgrade: 'לשדרג',
    repair: 'לתקן',
    maxLevel: 'רמה מקסימלית',
    enterHouse: 'להיכנס לבית',
    houseTitle: 'הבית שלי',
    houseSoon: 'בקרוב אפשר יהיה לעצב כאן את הבית ✨',
    roomSize: (w, h) => `חדר ${w}×${h}`,
    germLibrary: 'ספרייה',
    germLibraryTitle: 'ספריית החיידקים',
    germPower: 'כוח',
    germCause: 'ממה הוא נגרם?',
    germCure: 'מה משמיד אותו?',
    germHealth: 'חוזק',
    germBite: 'נשיכה',
    germSpeed: 'מהירות',
    germStoppedCount: (n) => `עצרת ${n}`,
    germFromLevel: (n) => `מופיע מרמה ${n}`,
    germFound: (name) => `חיידק חדש: ${name}! לחצו כדי להכיר אותו 📖`,
    neighbors: 'שכנים',
    neighborsTitle: 'לבקר בערים אחרות',
    myCity: 'העיר שלך',
    cityNumber: (n) => `עיר #${n}`,
    nameYourCity: 'שם לעיר שלך',
    save: 'לשמור',
    visit: 'לבקר',
    otherCities: 'ערים אחרות 🔄',
    findingCities: 'מחפשים ערים…',
    noCities: 'עוד אין ערים אחרות. כדאי לבדוק שוב בקרוב 🏙️',
    offline: 'אין חיבור. כדאי לבדוק את האינטרנט ולנסות שוב 📶',
    guardsHint: (n) => `אפשר לשלוח שומר שיעזור לעיר. עד ${n} ביום 💂`,
    helpedToday: 'עזרת',
    backHome: 'הביתה',
    visitHouse: 'לבית שלהם 🛋️',
    openingCity: 'בדרך לעיר…',
    cityFailed: 'העיר הזאת לא נפתחה. אפשר לנסות עיר אחרת',
    sendGuard: 'לשלוח שומר 💂',
    guardSent: 'השומר נשלח ✓',
    guardOnTheWay: (name) => `השומר שלך בדרך אל ${name} 💂`,
    guardLimit: (n) => `שלחת היום ${n} שומרים. מחר אפשר לשלוח עוד 🌙`,
    guardsArrived: (from) => (from.length === 1 ? `${from[0]} שלחו לך שומר לעזרה 💂` : `${from.length} שומרים באו לעזור לך 💂`),
    friendFreed: (name) => `שחררת את ${name}! מעכשיו גרים יחד בעיר 🎉`,
    friendHello: (name) => `שלום מ${name} 👋`,
    friendCaged: (name) => `יש כאן ${name} בכלוב. פותחים את האזור ומשחררים 🔓`,
    getCoins: 'להשיג מטבעות',
    adPays: (n) => `צפו במודעה קצרה וקבלו ${n} מטבעות`,
    adsLeft: (left, total) => `נשארו היום ${left} מתוך ${total}`,
    watchAd: 'לצפות במודעה ▶',
    adsDoneToday: 'זהו להיום. מחר יש עוד 🌙',
    adLabel: 'מודעה',
    adEndsIn: (s) => `המטבעות מגיעים בעוד ${s}…`,
    adThanks: 'תודה שצפיתם 🎉',
    collect: (n) => `לאסוף +${n}`,
    errors: {
      noCoins: 'אין מספיק מטבעות 💰',
      barnFull: 'האסם מלא. אפשר למכור משהו כדי לפנות מקום 📦',
      missingItems: 'חסרים לך כמה דברים',
      blocked: 'אי אפשר לשים את זה כאן',
      levelLow: 'צריך לעלות רמה קודם ⭐',
      limit: 'יש לך את המקסימום כרגע',
      queueFull: 'התור מלא',
      notReady: 'עוד לא מוכן ⏳',
      maxLevel: 'זה כבר ברמה הכי גבוהה ⭐',
    },
  },
  ar: {
    shop: 'المتجر',
    barn: 'الحظيرة',
    orders: 'الطلبات',
    shopTabs: { buildings: 'مبانٍ', crops: 'محاصيل', production: 'إنتاج', decorations: 'زينة' },
    plant: 'ازرع',
    produce: 'أنتج',
    open: 'افتح',
    move: 'انقل',
    remove: 'أزل',
    removeConfirm: 'متأكد؟ أزل',
    unlock: 'افتح',
    deliver: 'سلّم',
    place: 'ضع',
    cancel: 'إلغاء',
    done: 'تم',
    sell: 'بيع',
    great: 'رائع!',
    close: 'إغلاق',
    levelShort: (n) => `مستوى ${n}`,
    fromLevel: (n) => `من مستوى ${n}`,
    readyIn: (time) => `جاهز بعد ${time}`,
    ready: 'جاهز!',
    watered: 'تم سقيه، ينمو أسرع 💧',
    thirsty: 'يحتاج إلى ماء 💧',
    building: (time) => `قيد البناء… ${time}`,
    plantingHint: (crop) => `اضغط على حقل فارغ لزراعة ${crop}`,
    placingHint: 'اسحبه أو اضغط على مكان',
    barnSpace: (used, cap) => `${used}/${cap}`,
    barnEmpty: 'الحظيرة فارغة. احصد شيئًا أولًا 🌾',
    upgradeBarn: (n) => `+${n} مساحة`,
    sellFor: (n) => `بيع بـ ${n}`,
    queueTitle: 'في الفرن',
    freeSlot: 'فارغ',
    newOrderIn: (time) => `طلب جديد بعد ${time}`,
    levelUpTitle: (n) => `المستوى ${n}!`,
    unlockedTitle: 'جديد لك',
    nothingNew: 'استمر، المزيد في الطريق 🌱',
    lockedLand: 'هنا يمكنك توسيع مدينتك',
    maxForNow: 'الحد الأقصى حاليًا',
    pickSeed: 'ماذا تزرع؟',
    gateHealth: 'قوة البوابة',
    gateBroken: 'البوابة مكسورة والجراثيم تتجمع!',
    defense: (n) => `دفاع ${n}`,
    germsStopped: (n) => `جراثيم تم إيقافها: ${n}`,
    upgrade: 'طوّر',
    repair: 'أصلح',
    maxLevel: 'أعلى مستوى',
    enterHouse: 'ادخل البيت',
    houseTitle: 'بيتي',
    houseSoon: 'قريبًا يمكنك تزيين بيتك هنا ✨',
    roomSize: (w, h) => `غرفة ${w}×${h}`,
    germLibrary: 'المكتبة',
    germLibraryTitle: 'مكتبة الجراثيم',
    germPower: 'القوة',
    germCause: 'ممّا تنتج؟',
    germCure: 'ما الذي يقضي عليها؟',
    germHealth: 'الصحة',
    germBite: 'العضة',
    germSpeed: 'السرعة',
    germStoppedCount: (n) => `أوقفت ${n}`,
    germFromLevel: (n) => `تظهر من المستوى ${n}`,
    germFound: (name) => `جرثومة جديدة: ${name}! اضغط لتتعرف عليها 📖`,
    neighbors: 'الجيران',
    neighborsTitle: 'زيارة مدن أخرى',
    myCity: 'مدينتك',
    cityNumber: (n) => `مدينة #${n}`,
    nameYourCity: 'سمِّ مدينتك',
    save: 'حفظ',
    visit: 'زيارة',
    otherCities: 'مدن أخرى 🔄',
    findingCities: 'نبحث عن مدن…',
    noCities: 'لا توجد مدن أخرى بعد. عُد قريبًا 🏙️',
    offline: 'لا يوجد اتصال. تحقق من الإنترنت وحاول مرة أخرى 📶',
    guardsHint: (n) => `أرسل حارسًا لمساعدة مدينة. حتى ${n} في اليوم 💂`,
    helpedToday: 'ساعدت',
    backHome: 'العودة',
    visitHouse: 'إلى بيتهم 🛋️',
    openingCity: 'في الطريق…',
    cityFailed: 'لم تُفتح هذه المدينة. جرّب مدينة أخرى',
    sendGuard: 'أرسل حارسًا 💂',
    guardSent: 'تم إرسال الحارس ✓',
    guardOnTheWay: (name) => `حارسك في الطريق إلى ${name} 💂`,
    guardLimit: (n) => `أرسلت ${n} حراس اليوم. يمكنك إرسال المزيد غدًا 🌙`,
    guardsArrived: (from) => (from.length === 1 ? `${from[0]} أرسل لك حارسًا للمساعدة 💂` : `جاء ${from.length} حراس لمساعدتك 💂`),
    friendFreed: (name) => `حررت ${name}! من الآن تعيشان معًا في المدينة 🎉`,
    friendHello: (name) => `مرحبًا من ${name} 👋`,
    friendCaged: (name) => `${name} محبوس هنا في قفص. افتح الأرض لتحريره 🔓`,
    getCoins: 'احصل على عملات',
    adPays: (n) => `شاهد إعلانًا قصيرًا واحصل على ${n} عملة`,
    adsLeft: (left, total) => `بقي ${left} من ${total} اليوم`,
    watchAd: 'شاهد إعلانًا ▶',
    adsDoneToday: 'هذا كل شيء لليوم. عد غدًا 🌙',
    adLabel: 'إعلان',
    adEndsIn: (s) => `عملاتك تصل بعد ${s}…`,
    adThanks: 'شكرًا على المشاهدة 🎉',
    collect: (n) => `اجمع +${n}`,
    errors: {
      noCoins: 'لا توجد عملات كافية 💰',
      barnFull: 'الحظيرة ممتلئة. بع شيئًا لتفريغ مكان 📦',
      missingItems: 'تنقصك بعض الأشياء',
      blocked: 'لا يمكن وضعه هنا',
      levelLow: 'عليك الوصول لمستوى أعلى أولًا ⭐',
      limit: 'لديك الحد الأقصى حاليًا',
      queueFull: 'الطابور ممتلئ',
      notReady: 'ليس جاهزًا بعد ⏳',
      maxLevel: 'وصل لأعلى مستوى ⭐',
    },
  },
}

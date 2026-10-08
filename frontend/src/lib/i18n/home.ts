import type { FurnitureCategory } from '../../farm/types'
import type { Lang } from './lang'

export type HomeTab = FurnitureCategory | 'style'
/** Furniture drawer filter: everything, only what the player bought, or only what's still in the shop. */
export type HomeFilter = 'all' | 'mine' | 'shop'

export interface HomeStrings {
  title: string
  close: string
  exit: string
  furniture: string
  filters: Record<HomeFilter, string>
  emptyMine: string
  emptyShop: string
  /** Subtitle while looking around someone else's home. */
  visiting: string
  tabs: Record<HomeTab, string>
  /** Shown while a piece is picked up. */
  movingHint: string
  noRoom: string
  turn: string
  putAway: string
  cancel: string
  place: string
  done: string
  inStorage: (n: number) => string
  inUse: string
  owned: string
  wall: string
  floor: string
  prevPage: string
  nextPage: string
}

export const HOME_STRINGS: Record<Lang, HomeStrings> = {
  en: {
    title: 'My home',
    close: 'Close',
    exit: 'Exit',
    furniture: 'Furniture',
    filters: { all: 'All', mine: 'Bought', shop: 'To buy' },
    emptyMine: 'Nothing bought here yet',
    emptyShop: 'You have it all! ✨',
    visiting: 'Visiting their home',
    tabs: { living: 'Living room', bedroom: 'Bedroom', kitchen: 'Kitchen', health: 'Health corner', decor: 'Decor', style: 'Walls & floors' },
    movingHint: 'Drag it, or tap a spot on the floor',
    noRoom: 'No room here',
    turn: 'Turn',
    putAway: 'Store',
    cancel: 'Cancel',
    place: 'Place',
    done: 'Done',
    inStorage: (n) => `Stored: ${n}`,
    inUse: 'In use',
    owned: 'Yours',
    wall: 'Wall',
    floor: 'Floor',
    prevPage: 'Previous',
    nextPage: 'Next',
  },
  he: {
    title: 'הבית שלי',
    close: 'סגירה',
    exit: 'יציאה',
    furniture: 'רהיטים',
    filters: { all: 'הכול', mine: 'קניתי', shop: 'לקנייה' },
    emptyMine: 'עוד לא קנית מפה כלום',
    emptyShop: 'כבר יש לך הכול ✨',
    visiting: 'ביקור בבית',
    tabs: { living: 'סלון', bedroom: 'חדר שינה', kitchen: 'מטבח', health: 'פינת בריאות', decor: 'קישוטים', style: 'קירות ורצפה' },
    movingHint: 'גוררים, או נוגעים במקום על הרצפה',
    noRoom: 'אין פה מקום',
    turn: 'סיבוב',
    putAway: 'למחסן',
    cancel: 'ביטול',
    place: 'להציב',
    done: 'סיום',
    inStorage: (n) => `במחסן: ${n}`,
    inUse: 'בשימוש',
    owned: 'שלך',
    wall: 'קיר',
    floor: 'רצפה',
    prevPage: 'הקודם',
    nextPage: 'הבא',
  },
  ar: {
    title: 'بيتي',
    close: 'إغلاق',
    exit: 'خروج',
    furniture: 'الأثاث',
    filters: { all: 'الكل', mine: 'اشتريته', shop: 'للشراء' },
    emptyMine: 'لم تشترِ شيئًا من هنا بعد',
    emptyShop: 'عندك كل شيء ✨',
    visiting: 'زيارة البيت',
    tabs: { living: 'غرفة الجلوس', bedroom: 'غرفة النوم', kitchen: 'المطبخ', health: 'ركن الصحة', decor: 'زينة', style: 'جدران وأرضيات' },
    movingHint: 'اسحبها، أو المس مكانًا على الأرض',
    noRoom: 'لا يوجد مكان هنا',
    turn: 'تدوير',
    putAway: 'للمخزن',
    cancel: 'إلغاء',
    place: 'ضع',
    done: 'تم',
    inStorage: (n) => `في المخزن: ${n}`,
    inUse: 'مستخدم',
    owned: 'لك',
    wall: 'جدار',
    floor: 'أرضية',
    prevPage: 'السابق',
    nextPage: 'التالي',
  },
}

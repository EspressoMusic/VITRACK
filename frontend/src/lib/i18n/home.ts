import type { FurnitureCategory } from '../../farm/types'
import type { Lang } from './lang'

export type HomeTab = FurnitureCategory | 'style'

export interface HomeStrings {
  title: string
  close: string
  tabs: Record<HomeTab, string>
  /** Shown when nothing is picked up. */
  hint: string
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
    title: 'My home 🏠',
    close: 'Close',
    tabs: { living: 'Living room', bedroom: 'Bedroom', kitchen: 'Kitchen', health: 'Health corner', decor: 'Decor', style: 'Walls & floors' },
    hint: 'Tap furniture to move it, or pick something new below',
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
    title: 'הבית שלי 🏠',
    close: 'סגירה',
    tabs: { living: 'סלון', bedroom: 'חדר שינה', kitchen: 'מטבח', health: 'פינת בריאות', decor: 'קישוטים', style: 'קירות ורצפה' },
    hint: 'נוגעים ברהיט כדי להזיז אותו, או בוחרים משהו חדש למטה',
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
    title: 'بيتي 🏠',
    close: 'إغلاق',
    tabs: { living: 'غرفة الجلوس', bedroom: 'غرفة النوم', kitchen: 'المطبخ', health: 'ركن الصحة', decor: 'زينة', style: 'جدران وأرضيات' },
    hint: 'المس قطعة أثاث لتحريكها، أو اختر شيئًا جديدًا من الأسفل',
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

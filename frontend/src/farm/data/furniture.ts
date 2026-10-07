import type { FurnitureCategory, FurnitureDef, HomeInterior, RoomStyleDef } from '../types'

type Base = Omit<FurnitureDef, 'category'>

const group = (category: FurnitureCategory, defs: Base[]): FurnitureDef[] => defs.map((d) => ({ ...d, category }))

/** Everything that can go inside the home. Drawn in game/furnitureSprites.ts (one painter per id). */
export const FURNITURE: FurnitureDef[] = [
  ...group('living', [
    { id: 'sofa', name: { en: 'Sofa', he: 'ספה', ar: 'كنبة' }, cost: 120, requiredLevel: 1, xpReward: 4, width: 2, height: 1, tall: 26 },
    { id: 'armchair', name: { en: 'Armchair', he: 'כורסה', ar: 'كرسي بذراعين' }, cost: 70, requiredLevel: 1, xpReward: 3, width: 1, height: 1, tall: 24 },
    { id: 'coffeeTable', name: { en: 'Coffee table', he: 'שולחן סלון', ar: 'طاولة قهوة' }, cost: 50, requiredLevel: 1, xpReward: 2, width: 1, height: 1, tall: 16 },
    { id: 'tv', name: { en: 'TV', he: 'טלוויזיה', ar: 'تلفاز' }, cost: 150, requiredLevel: 2, xpReward: 5, width: 2, height: 1, tall: 46 },
    { id: 'bookshelf', name: { en: 'Bookshelf', he: 'כוננית ספרים', ar: 'مكتبة' }, cost: 90, requiredLevel: 1, xpReward: 3, width: 1, height: 1, tall: 58 },
    { id: 'floorLamp', name: { en: 'Floor lamp', he: 'מנורה עומדת', ar: 'مصباح أرضي' }, cost: 40, requiredLevel: 1, xpReward: 2, width: 1, height: 1, tall: 56 },
    { id: 'beanbag', name: { en: 'Beanbag', he: 'פוף', ar: 'كيس جلوس' }, cost: 45, requiredLevel: 1, xpReward: 2, width: 1, height: 1, tall: 18 },
    { id: 'aquarium', name: { en: 'Aquarium', he: 'אקווריום', ar: 'حوض سمك' }, cost: 220, requiredLevel: 4, xpReward: 8, width: 2, height: 1, tall: 44 },
  ]),
  ...group('bedroom', [
    { id: 'bed', name: { en: 'Bed', he: 'מיטה', ar: 'سرير' }, cost: 160, requiredLevel: 1, xpReward: 5, width: 2, height: 2, tall: 30 },
    { id: 'nightstand', name: { en: 'Nightstand', he: 'שידת לילה', ar: 'كومودينو' }, cost: 40, requiredLevel: 1, xpReward: 2, width: 1, height: 1, tall: 28 },
    { id: 'wardrobe', name: { en: 'Wardrobe', he: 'ארון בגדים', ar: 'خزانة ملابس' }, cost: 140, requiredLevel: 2, xpReward: 5, width: 2, height: 1, tall: 62 },
    { id: 'desk', name: { en: 'Desk', he: 'שולחן כתיבה', ar: 'مكتب' }, cost: 110, requiredLevel: 2, xpReward: 4, width: 2, height: 1, tall: 36 },
    { id: 'teddy', name: { en: 'Teddy bear', he: 'דובי', ar: 'دبدوب' }, cost: 35, requiredLevel: 1, xpReward: 2, width: 1, height: 1, tall: 22 },
  ]),
  ...group('kitchen', [
    { id: 'fridge', name: { en: 'Fridge', he: 'מקרר', ar: 'ثلاجة' }, cost: 160, requiredLevel: 3, xpReward: 6, width: 1, height: 1, tall: 58 },
    { id: 'stove', name: { en: 'Stove', he: 'כיריים', ar: 'موقد' }, cost: 130, requiredLevel: 3, xpReward: 5, width: 1, height: 1, tall: 28 },
    { id: 'counter', name: { en: 'Sink counter', he: 'משטח עם כיור', ar: 'مغسلة مطبخ' }, cost: 80, requiredLevel: 2, xpReward: 3, width: 1, height: 1, tall: 32 },
    { id: 'diningTable', name: { en: 'Dining table', he: 'שולחן אוכל', ar: 'طاولة طعام' }, cost: 90, requiredLevel: 1, xpReward: 3, width: 2, height: 1, tall: 26 },
    { id: 'chair', name: { en: 'Chair', he: 'כיסא', ar: 'كرسي' }, cost: 30, requiredLevel: 1, xpReward: 1, width: 1, height: 1, tall: 30 },
  ]),
  ...group('health', [
    { id: 'fruitBowl', name: { en: 'Fruit table', he: 'שולחן פירות', ar: 'طاولة فواكه' }, cost: 60, requiredLevel: 1, xpReward: 3, width: 1, height: 1, tall: 28 },
    { id: 'waterCooler', name: { en: 'Water cooler', he: 'מתקן מים', ar: 'مبرد ماء' }, cost: 70, requiredLevel: 1, xpReward: 3, width: 1, height: 1, tall: 48 },
    { id: 'yogaMat', name: { en: 'Yoga mat', he: 'מזרן יוגה', ar: 'سجادة يوغا' }, cost: 40, requiredLevel: 1, xpReward: 2, width: 1, height: 2, tall: 3, flat: true },
    { id: 'exerciseBike', name: { en: 'Exercise bike', he: 'אופני כושר', ar: 'دراجة رياضية' }, cost: 180, requiredLevel: 3, xpReward: 6, width: 1, height: 1, tall: 36 },
  ]),
  ...group('decor', [
    { id: 'plant', name: { en: 'Plant', he: 'עציץ', ar: 'نبتة' }, cost: 30, requiredLevel: 1, xpReward: 1, width: 1, height: 1, tall: 40 },
    { id: 'rug', name: { en: 'Round rug', he: 'שטיח עגול', ar: 'سجادة دائرية' }, cost: 60, requiredLevel: 1, xpReward: 2, width: 2, height: 2, tall: 3, flat: true },
    { id: 'runner', name: { en: 'Striped rug', he: 'שטיח פסים', ar: 'سجادة مخططة' }, cost: 45, requiredLevel: 1, xpReward: 2, width: 1, height: 2, tall: 3, flat: true },
    { id: 'flowerVase', name: { en: 'Flower vase', he: 'אגרטל פרחים', ar: 'مزهرية' }, cost: 35, requiredLevel: 2, xpReward: 2, width: 1, height: 1, tall: 34 },
  ]),
]

export const FURNITURE_BY_ID: Record<string, FurnitureDef> = Object.fromEntries(FURNITURE.map((f) => [f.id, f]))

export const ROOM_STYLES: RoomStyleDef[] = [
  { id: 'wallCream', kind: 'wall', name: { en: 'Cream', he: 'קרם', ar: 'كريمي' }, cost: 0, requiredLevel: 1, colors: ['#f6e7cf', '#ead5b4'], pattern: 'plain' },
  { id: 'wallSky', kind: 'wall', name: { en: 'Sky', he: 'שמיים', ar: 'سماوي' }, cost: 30, requiredLevel: 1, colors: ['#dbeafe', '#bfdbfe'], pattern: 'plain' },
  { id: 'wallMint', kind: 'wall', name: { en: 'Mint stripes', he: 'פסי מנטה', ar: 'خطوط نعناعية' }, cost: 40, requiredLevel: 1, colors: ['#d8f3dc', '#b7e4c7'], pattern: 'stripes' },
  { id: 'wallPink', kind: 'wall', name: { en: 'Pink dots', he: 'נקודות ורודות', ar: 'نقاط وردية' }, cost: 40, requiredLevel: 1, colors: ['#ffe5ec', '#ffc2d1'], pattern: 'dots' },
  { id: 'wallSun', kind: 'wall', name: { en: 'Sunny stripes', he: 'פסי שמש', ar: 'خطوط مشمسة' }, cost: 50, requiredLevel: 2, colors: ['#fff3b0', '#ffe066'], pattern: 'stripes' },
  { id: 'wallLilac', kind: 'wall', name: { en: 'Lilac dots', he: 'נקודות לילך', ar: 'نقاط ليلكية' }, cost: 60, requiredLevel: 3, colors: ['#ede4ff', '#d6c4fb'], pattern: 'dots' },
  { id: 'floorOak', kind: 'floor', name: { en: 'Oak planks', he: 'פרקט אלון', ar: 'خشب البلوط' }, cost: 0, requiredLevel: 1, colors: ['#d9a86c', '#cf9d60'], pattern: 'planks' },
  { id: 'floorChecker', kind: 'floor', name: { en: 'Checker tiles', he: 'משבצות', ar: 'بلاط مربعات' }, cost: 40, requiredLevel: 1, colors: ['#f4f4f2', '#d5dce4'], pattern: 'tiles' },
  { id: 'floorCarpet', kind: 'floor', name: { en: 'Soft carpet', he: 'שטיח מקיר לקיר', ar: 'موكيت ناعم' }, cost: 40, requiredLevel: 1, colors: ['#bfe3d6', '#a8d5c5'], pattern: 'carpet' },
  { id: 'floorWalnut', kind: 'floor', name: { en: 'Dark wood', he: 'עץ כהה', ar: 'خشب داكن' }, cost: 50, requiredLevel: 2, colors: ['#a47148', '#93623c'], pattern: 'planks' },
  { id: 'floorRose', kind: 'floor', name: { en: 'Rose tiles', he: 'אריחים ורודים', ar: 'بلاط وردي' }, cost: 60, requiredLevel: 3, colors: ['#ffe0e8', '#ffc4d3'], pattern: 'tiles' },
]

export const ROOM_STYLES_BY_ID: Record<string, RoomStyleDef> = Object.fromEntries(ROOM_STYLES.map((s) => [s.id, s]))

/** The room the player finds the first time they walk in (a 6×6 home). */
export function starterInterior(): HomeInterior {
  const furniture = [
    { defId: 'plant', x: 0, y: 0 },
    { defId: 'bed', x: 3, y: 0 },
    { defId: 'nightstand', x: 5, y: 0 },
    { defId: 'rug', x: 1, y: 3 },
    { defId: 'sofa', x: 0, y: 3, turned: true },
    { defId: 'coffeeTable', x: 2, y: 3 },
  ].map((f, i) => ({ id: `f${i + 1}`, ...f }))
  return { furniture, stored: {}, wall: 'wallCream', floor: 'floorOak', styles: [], nextId: furniture.length + 1 }
}

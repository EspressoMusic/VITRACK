import type { AreaDef, FeatureKind, LocalizedText, Point, WorldTheme } from '../types'

/** Buildable land: four 12×12 districts. */
export const MAP_WIDTH = 24
export const MAP_HEIGHT = 24

/** The wild land outside the city wall (beyond the gate). It's drawn, but nothing can be built there. */
export const OUTSIDE = { x: 0, y: MAP_HEIGHT, w: MAP_WIDTH, h: 6 }

/** The city in tiles: the districts plus the outside strip. */
export const ISLAND = { w: MAP_WIDTH, h: MAP_HEIGHT + OUTSIDE.h }

/** All the land, in tiles: the city in the middle, wild land around it, and the other worlds out toward the edges — one continent, no sea in between. */
export const CONTINENT = { x: -24, y: -24, w: 72, h: 78 }

/** Footprint (w × h tiles) of each wild zone's feature. */
const FEATURE_SIZE: Record<FeatureKind, [number, number]> = {
  observatory: [2, 2],
  frozenPond: [3, 2],
  treehouse: [2, 2],
  stoneCircle: [3, 3],
  balloon: [1, 1],
  pond: [3, 2],
  windmill: [2, 2],
  beehives: [2, 2],
  ruins: [2, 2],
  mushrooms: [2, 2],
  campsite: [2, 2],
  orchard: [3, 2],
  well: [1, 1],
  treasure: [1, 1],
  scarecrow: [2, 2],
  signpost: [1, 1],
  hotSpring: [3, 2],
  geode: [2, 2],
  oasis: [3, 3],
}

/** The city starts as the Town Center, at the front of the island; the other districts expand it. */
export const AREAS: AreaDef[] = [
  {
    id: 'home',
    name: { en: 'Town Center', he: 'מרכז העיר', ar: 'وسط المدينة' },
    rect: { x: 12, y: 12, w: 12, h: 12 },
    requiredLevel: 1,
    cost: 0,
  },
  {
    id: 'sunnyHill',
    name: { en: 'Residential Area', he: 'שכונת המגורים', ar: 'الحي السكني' },
    rect: { x: 12, y: 0, w: 12, h: 12 },
    requiredLevel: 5,
    cost: 2000,
  },
  {
    id: 'willowCreek',
    name: { en: 'Park & Garden District', he: 'רובע הפארקים', ar: 'حي الحدائق' },
    rect: { x: 0, y: 12, w: 12, h: 12 },
    requiredLevel: 8,
    cost: 5000,
  },
  {
    id: 'pineValley',
    name: { en: 'Future District', he: 'רובע העתיד', ar: 'حي المستقبل' },
    rect: { x: 0, y: 0, w: 12, h: 12 },
    requiredLevel: 12,
    cost: 10000,
  },
  ...zones(),
  ...worlds(),
]

/** The wild land between the city and the worlds, zone by zone (with the city and the worlds they tile the continent).
 *  Each opens like a district — nearest the gate first — and is then all buildable except its feature (at fx, fy) and any neighbor village's spot. */
function zones(): AreaDef[] {
  const zone = (id: string, feature: FeatureKind, name: LocalizedText, x: number, y: number, h: number, fx: number, fy: number, requiredLevel: number, cost: number): AreaDef => {
    const [w, fh] = FEATURE_SIZE[feature]
    return { id, name, rect: { x, y, w: 12, h }, requiredLevel, cost, zone: { feature, spot: { x: fx, y: fy, w, h: fh } } }
  }
  return [
    zone('crossroads', 'signpost', { en: 'Crossroads', he: 'צומת השלטים', ar: 'مفترق الطرق' }, 12, 30, 12, 22, 40, 3, 800),
    zone('wellMeadow', 'well', { en: 'Well Meadow', he: 'אחו הבאר', ar: 'مرج البئر' }, 0, 30, 12, 1, 40, 4, 1200),
    zone('balloonField', 'balloon', { en: 'Balloon Field', he: 'שדה הכדור הפורח', ar: 'حقل المنطاد' }, 24, 15, 15, 34, 28, 6, 2500),
    zone('pumpkinPatch', 'scarecrow', { en: 'Pumpkin Patch', he: 'שדה הדלעות', ar: 'حقل اليقطين' }, -12, 15, 15, -11, 27, 7, 3000),
    zone('orchard', 'orchard', { en: 'The Orchard', he: 'המטע', ar: 'البستان' }, 24, 0, 15, 32, 1, 9, 4000),
    zone('campfireGrove', 'campsite', { en: 'Campfire Grove', he: 'חורשת המדורה', ar: 'بستان المخيم' }, -12, 0, 15, -7, 6, 10, 5000),
    zone('windmillHill', 'windmill', { en: 'Windmill Hill', he: 'גבעת טחנת הרוח', ar: 'تلة الطاحونة' }, 12, -12, 12, 21, -11, 11, 6000),
    zone('duckPond', 'pond', { en: 'Duck Pond', he: 'בריכת הברווזים', ar: 'بركة البط' }, 0, -12, 12, 1, -11, 13, 7000),
    zone('tentValley', 'campsite', { en: 'Tent Valley', he: 'עמק האוהלים', ar: 'وادي الخيام' }, 24, 30, 12, 33, 39, 14, 8000),
    zone('oldRuins', 'ruins', { en: 'Old Ruins', he: 'החורבות העתיקות', ar: 'الأطلال القديمة' }, -12, 30, 12, -7, 34, 16, 10000),
    zone('honeyMeadow', 'beehives', { en: 'Honey Meadow', he: 'אחו הדבש', ar: 'مرج العسل' }, 24, -12, 12, 30, -6, 17, 11000),
    zone('skyMeadow', 'balloon', { en: 'Sky Meadow', he: 'אחו השמיים', ar: 'مرج السماء' }, -12, -12, 12, -6, -6, 19, 13000),
    zone('stoneCircle', 'stoneCircle', { en: 'Stone Circle', he: 'מעגל האבנים', ar: 'دائرة الحجارة' }, 36, 15, 15, 41, 21, 20, 15000),
    zone('treasureHollow', 'treasure', { en: 'Treasure Hollow', he: 'גיא המטמון', ar: 'وادي الكنز' }, -24, 15, 15, -20, 22, 21, 16000),
    zone('wishingWell', 'well', { en: 'Wishing Well', he: 'באר המשאלות', ar: 'بئر الأمنيات' }, 36, 0, 15, 42, 8, 23, 18000),
    zone('mushroomForest', 'mushrooms', { en: 'Mushroom Forest', he: 'יער הפטריות', ar: 'غابة الفطر' }, -24, 0, 15, -19, 6, 24, 20000),
    zone('toadstoolDell', 'mushrooms', { en: 'Toadstool Dell', he: 'עמק הפטריות', ar: 'وادي الفطر' }, 12, 42, 12, 16, 48, 25, 22000),
    zone('frozenPond', 'frozenPond', { en: 'Frozen Pond', he: 'האגם הקפוא', ar: 'البحيرة المتجمدة' }, 0, -24, 12, 5, -20, 27, 25000),
    zone('millFields', 'windmill', { en: 'Mill Fields', he: 'שדות הטחנה', ar: 'حقول الطاحونة' }, 36, 30, 12, 40, 34, 28, 28000),
    zone('lostRuins', 'ruins', { en: 'Lost Ruins', he: 'החורבות האבודות', ar: 'الأطلال المفقودة' }, 36, -12, 12, 40, -6, 29, 30000),
    zone('hotSprings', 'hotSpring', { en: 'Hot Springs', he: 'המעיינות החמים', ar: 'الينابيع الحارة' }, -24, 30, 12, -21, 34, 31, 33000),
    zone('ancientStones', 'stoneCircle', { en: 'Ancient Stones', he: 'אבני הקדמונים', ar: 'الحجارة القديمة' }, -24, -12, 12, -19, -9, 32, 36000),
    zone('geodeCave', 'geode', { en: 'Geode Cave', he: 'מערת הגאודה', ar: 'كهف الجيود' }, -12, 42, 12, -8, 47, 33, 40000),
    zone('oasis', 'oasis', { en: 'The Oasis', he: 'נווה המדבר', ar: 'الواحة' }, 24, 42, 12, 27, 45, 34, 44000),
    zone('treehouseWoods', 'treehouse', { en: 'Treehouse Woods', he: 'יער בית העץ', ar: 'غابة بيت الشجرة' }, 24, -24, 12, 28, -20, 36, 48000),
    zone('starHill', 'observatory', { en: 'Star Hill', he: 'גבעת הכוכבים', ar: 'تلة النجوم' }, -12, -24, 12, -6, -20, 38, 55000),
  ]
}

/** Other worlds at the edges of the continent, 12×12 each, with a band of wild land between them and the city.
 *  Building goes on the inner 9×9; the rim keeps the world's landmark and wild look. */
function worlds(): AreaDef[] {
  const world = (id: string, theme: WorldTheme, name: LocalizedText, x: number, y: number, requiredLevel: number, cost: number): AreaDef => ({
    id,
    name,
    rect: { x: x + 2, y: y + 2, w: 9, h: 9 },
    requiredLevel,
    cost,
    world: { theme, island: { x, y, w: 12, h: 12 } },
  })
  return [
    world('jungle', 'jungle', { en: 'Jungle World', he: "עולם הג'ונגל", ar: 'عالم الغابة' }, 36, -24, 15, 15000),
    world('desert', 'desert', { en: 'Desert World', he: 'עולם המדבר', ar: 'عالم الصحراء' }, 36, 42, 18, 20000),
    world('snow', 'snow', { en: 'Snow World', he: 'עולם השלג', ar: 'عالم الثلج' }, 12, -24, 22, 30000),
    world('crystal', 'crystal', { en: 'Crystal World', he: 'עולם הקריסטלים', ar: 'عالم الكريستال' }, 0, 42, 26, 40000),
    world('volcano', 'volcano', { en: 'Volcano World', he: 'עולם הר הגעש', ar: 'عالم البركان' }, -24, 42, 30, 55000),
    world('moon', 'moon', { en: 'Moon World', he: 'עולם הירח', ar: 'عالم القمر' }, -24, -24, 35, 75000),
  ]
}

export const WORLDS = AREAS.filter((a) => a.world)
export const ZONES = AREAS.filter((a) => a.zone)
/** The city's own districts (inside the main map). */
export const DISTRICTS = AREAS.filter((a) => !a.world && !a.zone)

/** All the land an area covers once bought — a world's rim included. The city's fence wraps these. */
export const ownedRect = (a: AreaDef) => a.world?.island ?? a.rect

export const AREAS_BY_ID: Record<string, AreaDef> = Object.fromEntries(AREAS.map((a) => [a.id, a]))

/** Where the city gate stands: in the Town Center's front wall, facing the outside. */
export const GATE_TILE = { x: 17, y: 23 }

/** The player's home stands in the middle of the Town Center, where the two main streets meet. */
export const HOME_TILE = { x: 17, y: 17 }

/** Germs crawl out of the swamp and follow this road (tile coordinates) up to the gate. */
export const GERM_ROAD: Point[] = [
  { x: 22.4, y: 27.7 },
  { x: 21.0, y: 27.0 },
  { x: 19.7, y: 26.2 },
  { x: 18.6, y: 25.2 },
  { x: 18.5, y: 24.35 },
]

/** Junk food marches out of the candy cave along this road (tile coordinates), left of the germs' one, and stops
 *  in front of the wall to throw at the food friends on top of it. */
export const JUNK_ROAD: Point[] = [
  { x: 19.6, y: 29.2 },
  { x: 18.7, y: 28.0 },
  { x: 17.9, y: 27.0 },
  { x: 17.3, y: 26.35 },
]

/** Signpost beside the germs' road (tile coordinates of its foot); tapping it opens the germ library. */
export const GERM_SIGN: Point = { x: 23.0, y: 26.2 }

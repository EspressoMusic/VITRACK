import type { CropDef } from '../types'

const STAGES: CropDef['growthStages'] = [0.2, 0.4, 0.7, 1]

/** Watering a growing crop leaves this share of its time left. */
export const WATER_SPEEDUP = 0.5

/** Add a crop by adding an object here — planting, growth, harvest, shop, orders and the barn
 *  all read from this list. */
export const CROPS: CropDef[] = [
  {
    id: 'wheat',
    name: { en: 'Wheat', he: 'חיטה', ar: 'قمح' },
    icon: '🌾',
    seedPrice: 1,
    sellPrice: 3,
    growTime: 30,
    xpReward: 1,
    requiredLevel: 1,
    yield: 1,
    growthStages: STAGES,
    look: { shape: 'grain', leaf: '#7cbf4a', fruit: '#f2c94c' },
  },
  {
    id: 'corn',
    name: { en: 'Corn', he: 'תירס', ar: 'ذرة' },
    icon: '🌽',
    seedPrice: 3,
    sellPrice: 8,
    growTime: 120,
    xpReward: 3,
    requiredLevel: 2,
    yield: 1,
    growthStages: STAGES,
    look: { shape: 'stalk', leaf: '#5fae3e', fruit: '#ffd84a' },
  },
  {
    id: 'carrot',
    name: { en: 'Carrot', he: 'גזר', ar: 'جزر' },
    icon: '🥕',
    seedPrice: 5,
    sellPrice: 13,
    growTime: 300,
    xpReward: 5,
    requiredLevel: 3,
    yield: 1,
    growthStages: STAGES,
    look: { shape: 'root', leaf: '#4fa83a', fruit: '#f28c28' },
  },
  {
    id: 'tomato',
    name: { en: 'Tomato', he: 'עגבנייה', ar: 'طماطم' },
    icon: '🍅',
    seedPrice: 8,
    sellPrice: 20,
    growTime: 600,
    xpReward: 7,
    requiredLevel: 5,
    yield: 1,
    growthStages: STAGES,
    look: { shape: 'bush', leaf: '#3f9a3a', fruit: '#e8443a' },
  },
  {
    id: 'potato',
    name: { en: 'Potato', he: 'תפוח אדמה', ar: 'بطاطا' },
    icon: '🥔',
    seedPrice: 10,
    sellPrice: 26,
    growTime: 900,
    xpReward: 9,
    requiredLevel: 6,
    yield: 1,
    growthStages: STAGES,
    look: { shape: 'root', leaf: '#5a9e44', fruit: '#c9955a' },
  },
  {
    id: 'strawberry',
    name: { en: 'Strawberry', he: 'תות', ar: 'فراولة' },
    icon: '🍓',
    seedPrice: 14,
    sellPrice: 36,
    growTime: 1500,
    xpReward: 12,
    requiredLevel: 7,
    yield: 1,
    growthStages: STAGES,
    look: { shape: 'berry', leaf: '#3c9446', fruit: '#ef3b52' },
  },
]

export const CROPS_BY_ID: Record<string, CropDef> = Object.fromEntries(CROPS.map((c) => [c.id, c]))

import type { ObjectDef, ObjectLook } from '../types'

const many = () => 99

function deco(
  id: string,
  name: ObjectDef['name'],
  icon: string,
  cost: number,
  requiredLevel: number,
  look: ObjectLook,
  size = 1,
): ObjectDef {
  return {
    id,
    name,
    icon,
    kind: 'decoration',
    shopCategory: 'decorations',
    cost,
    requiredLevel,
    width: size,
    height: size,
    buildTime: 0,
    productionSlots: 0,
    recipes: [],
    xpReward: 1,
    maxCount: many,
    look,
  }
}

/** Decorations and roads don't produce anything — they're for making the city yours. */
export const DECORATIONS: ObjectDef[] = [
  deco('pavedPath', { en: 'Sidewalk', he: 'מדרכה', ar: 'رصيف' }, '⬜', 3, 1, { type: 'path', base: '#ece4d6', detail: '#d3c8b4', pattern: 'pavers' }),
  deco('dirtPath', { en: 'Dirt Path', he: 'שביל עפר', ar: 'ممر ترابي' }, '🟤', 2, 1, { type: 'path', base: '#c99a62', detail: '#b0844f' }),
  deco('oakTree', { en: 'Tree', he: 'עץ', ar: 'شجرة' }, '🌳', 10, 1, { type: 'tree', leaf: '#5cb85c' }),
  deco('bush', { en: 'Bush', he: 'שיח', ar: 'شجيرة' }, '🌿', 6, 1, { type: 'bush', leaf: '#4caf50' }),
  deco('fence', { en: 'Fence', he: 'גדר', ar: 'سياج' }, '🪵', 3, 2, { type: 'fence' }),
  deco('hayBale', { en: 'Hay Bale', he: 'חבילת קש', ar: 'بالة قش' }, '🟨', 8, 2, { type: 'hay' }),
  deco('pineTree', { en: 'Pine', he: 'אורן', ar: 'صنوبر' }, '🌲', 12, 3, { type: 'pine', leaf: '#3f8f5a' }),
  deco('stonePath', { en: 'Stone Path', he: 'שביל אבן', ar: 'ممر حجري' }, '⬜', 4, 3, { type: 'path', base: '#c9c3b6', detail: '#a39d90' }),
  deco('bench', { en: 'Bench', he: 'ספסל', ar: 'مقعد' }, '🪑', 15, 4, { type: 'bench' }),
  deco('woodPath', { en: 'Wood Path', he: 'שביל עץ', ar: 'ممر خشبي' }, '🟫', 5, 4, { type: 'path', base: '#b07a45', detail: '#8a5a33' }),
  deco('lamp', { en: 'Lamp', he: 'פנס', ar: 'مصباح' }, '🏮', 20, 5, { type: 'lamp' }),
  deco('sign', { en: 'Sign', he: 'שלט', ar: 'لافتة' }, '🪧', 10, 5, { type: 'sign' }),
  deco('pond', { en: 'Pond', he: 'בריכה', ar: 'بركة' }, '💧', 60, 6, { type: 'pond' }, 2),
]

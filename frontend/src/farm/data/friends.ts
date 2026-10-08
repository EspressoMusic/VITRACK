import type { LocalizedText } from '../types'
import { FOOD_GUARDS_BY_ID, type FoodGuardDef } from './foodGuards'

/**
 * Food friends: every locked land holds one food character locked in a cage. Buying the land breaks the cage,
 * and the friend jumps over to the city to live there with the player's character.
 * Nothing is saved for them — a land's friend is free exactly when the land is bought.
 */

export interface FriendDef {
  /** The land whose cage holds it. */
  areaId: string
  name: LocalizedText
  /** Its look (the same food art as the guards, minus the weapons). */
  look: FoodGuardDef
}

/** Fruit that only show up as friends (not as guards from meals). */
const extra = (id: string, icon: string, look: FoodGuardDef['look']): FoodGuardDef => ({
  id,
  icon,
  name: { en: id, he: id, ar: id },
  tier: 2,
  keywords: [],
  look,
})

const LOOKS: Record<string, FoodGuardDef> = {
  ...FOOD_GUARDS_BY_ID,
  watermelon: extra('watermelon', '🍉', { shape: 'round', color: '#4fae4a', accent: '#2f7d32', top: 'stem', pattern: 'stripes' }),
  lemon: extra('lemon', '🍋', { shape: 'egg', color: '#ffe14d', accent: '#f2c200', top: 'stem', pattern: 'dots' }),
  pear: extra('pear', '🍐', { shape: 'drop', color: '#c9dc5a', accent: '#a8bf3a', top: 'stem' }),
  kiwi: extra('kiwi', '🥝', { shape: 'egg', color: '#9a6f3f', accent: '#7dc242', pattern: 'dots' }),
  grapes: extra('grapes', '🍇', { shape: 'puff', color: '#8e5bd1', accent: '#6b3fb0', top: 'stem' }),
}

const friend = (areaId: string, look: string, en: string, he: string, ar: string): FriendDef => ({ areaId, name: { en, he, ar }, look: LOOKS[look] })

export const FRIENDS: FriendDef[] = [
  // the city's own districts
  friend('sunnyHill', 'apple', 'Apple', 'תפוח', 'تفاحة'),
  friend('willowCreek', 'strawberry', 'Strawberry', 'תות', 'فراولة'),
  friend('pineValley', 'broccoli', 'Broccoli', 'ברוקולי', 'بروكلي'),
  // the wild zones
  friend('crossroads', 'carrot', 'Carrot', 'גזר', 'جزرة'),
  friend('wellMeadow', 'cucumber', 'Cucumber', 'מלפפון', 'خيارة'),
  friend('balloonField', 'tomato', 'Tomato', 'עגבנייה', 'طماطم'),
  friend('pumpkinPatch', 'sweetPotato', 'Sweet Potato', 'בטטה', 'بطاطا حلوة'),
  friend('orchard', 'orange', 'Orange', 'תפוז', 'برتقالة'),
  friend('campfireGrove', 'corn', 'Corn', 'תירס', 'ذرة'),
  friend('windmillHill', 'bread', 'Bread', 'לחם', 'خبز'),
  friend('duckPond', 'fish', 'Fish', 'דג', 'سمكة'),
  friend('tentValley', 'egg', 'Egg', 'ביצה', 'بيضة'),
  friend('oldRuins', 'potato', 'Potato', 'תפוח אדמה', 'بطاطس'),
  friend('honeyMeadow', 'yogurt', 'Yogurt', 'יוגורט', 'زبادي'),
  friend('skyMeadow', 'berries', 'Blueberry', 'אוכמנייה', 'توتة'),
  friend('stoneCircle', 'nuts', 'Nut', 'אגוז', 'جوزة'),
  friend('treasureHollow', 'chicken', 'Drumstick', 'שוק עוף', 'دجاجة'),
  friend('wishingWell', 'greens', 'Lettuce', 'חסה', 'خس'),
  friend('mushroomForest', 'legumes', 'Bean', 'שעועית', 'فاصولياء'),
  friend('toadstoolDell', 'salad', 'Salad', 'סלט', 'سلطة'),
  friend('frozenPond', 'rice', 'Rice', 'אורז', 'أرز'),
  friend('millFields', 'oats', 'Oats', 'שיבולת שועל', 'شوفان'),
  friend('lostRuins', 'pasta', 'Pasta', 'פסטה', 'معكرونة'),
  friend('hotSprings', 'meal', 'Soup', 'מרק', 'شوربة'),
  friend('ancientStones', 'avocado', 'Avocado', 'אבוקדו', 'أفوكادو'),
  friend('geodeCave', 'fruit', 'Peach', 'אפרסק', 'خوخة'),
  friend('oasis', 'watermelon', 'Watermelon', 'אבטיח', 'بطيخة'),
  friend('treehouseWoods', 'kiwi', 'Kiwi', 'קיווי', 'كيوي'),
  friend('starHill', 'grapes', 'Grapes', 'ענבים', 'عنب'),
  // the worlds
  friend('jungle', 'banana', 'Banana', 'בננה', 'موزة'),
  friend('desert', 'lemon', 'Lemon', 'לימון', 'ليمونة'),
  friend('snow', 'pear', 'Pear', 'אגס', 'إجاصة'),
  friend('crystal', 'eggplant', 'Eggplant', 'חציל', 'باذنجان'),
  friend('volcano', 'pepper', 'Pepper', 'פלפל', 'فلفل'),
  friend('moon', 'cheese', 'Cheese', 'גבינה', 'جبنة'),
]

export const FRIENDS_BY_AREA: Record<string, FriendDef> = Object.fromEntries(FRIENDS.map((f) => [f.areaId, f]))

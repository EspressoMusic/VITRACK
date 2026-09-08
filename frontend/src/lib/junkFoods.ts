import type { NutrientScores } from './nutrientBuckets'

export interface JunkFoodDef {
  id: string
  emoji: string
  /** Relative strength (1-10) per dominant nutrient, used by the top-left nutrient filter to
   *  decide both which foods match a filter and how they rank within it (highest first). */
  nutrients: NutrientScores
  /** How much the weekly-completion XP circle loses from eating this, scaled to how processed/sugary/fried it is (-4 to -10). */
  xp: number
}

export const JUNK_FOODS: JunkFoodDef[] = [
  { id: 'soda', emoji: '🥤', nutrients: { carbs: 9 }, xp: -8 },
  { id: 'candy', emoji: '🍬', nutrients: { carbs: 9 }, xp: -6 },
  { id: 'fries', emoji: '🍟', nutrients: { fats: 7, carbs: 6 }, xp: -7 },
  { id: 'donut', emoji: '🍩', nutrients: { carbs: 7, fats: 7 }, xp: -9 },
  { id: 'burger', emoji: '🍔', nutrients: { fats: 7, protein: 6, carbs: 5 }, xp: -9 },
  { id: 'iceCream', emoji: '🍦', nutrients: { carbs: 6, fats: 6 }, xp: -6 },
  { id: 'energyDrink', emoji: '⚡', nutrients: { carbs: 8 }, xp: -10 },
  { id: 'instantNoodles', emoji: '🍜', nutrients: { carbs: 7 }, xp: -7 },
  { id: 'pastry', emoji: '🥐', nutrients: { fats: 7, carbs: 6 }, xp: -8 },
  { id: 'friedChicken', emoji: '🍗', nutrients: { fats: 8, protein: 7 }, xp: -8 },
  { id: 'cookies', emoji: '🍪', nutrients: { carbs: 6, fats: 6 }, xp: -6 },
  { id: 'cake', emoji: '🍰', nutrients: { carbs: 7, fats: 6 }, xp: -7 },
  { id: 'pizza', emoji: '🍕', nutrients: { carbs: 6, fats: 6, protein: 5 }, xp: -7 },
  { id: 'chocolateBar', emoji: '🍫', nutrients: { carbs: 6, fats: 6 }, xp: -6 },
  { id: 'hotDog', emoji: '🌭', nutrients: { fats: 7, protein: 5, carbs: 5 }, xp: -8 },
  { id: 'bacon', emoji: '🥓', nutrients: { fats: 9, protein: 5 }, xp: -8 },
  { id: 'whiteBread', emoji: '🍞', nutrients: { carbs: 7 }, xp: -4 },
  { id: 'popcorn', emoji: '🍿', nutrients: { fats: 5, carbs: 5 }, xp: -5 },
  { id: 'bubbleTea', emoji: '🧋', nutrients: { carbs: 8 }, xp: -7 },
  { id: 'juiceBox', emoji: '🧃', nutrients: { carbs: 7 }, xp: -6 },
  { id: 'potatoChips', emoji: '🥔', nutrients: { fats: 7, carbs: 5 }, xp: -7 },
  { id: 'pancakesSyrup', emoji: '🥞', nutrients: { carbs: 8 }, xp: -6 },
  { id: 'pretzel', emoji: '🥨', nutrients: { carbs: 6 }, xp: -5 },
]

/** Same junk food for everyone on a given calendar day, rotating deterministically —
 *  no server state needed. */
export function junkFoodOfTheDay(dateKey: string): JunkFoodDef {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i) + 7) >>> 0
  return JUNK_FOODS[hash % JUNK_FOODS.length]
}

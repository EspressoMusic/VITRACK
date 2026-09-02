export interface JunkFoodDef {
  id: string
  emoji: string
  /** How much the weekly-completion XP circle loses from eating this, scaled to how processed/sugary/fried it is (-4 to -10). */
  xp: number
}

export const JUNK_FOODS: JunkFoodDef[] = [
  { id: 'soda', emoji: '🥤', xp: -8 },
  { id: 'candy', emoji: '🍬', xp: -6 },
  { id: 'fries', emoji: '🍟', xp: -7 },
  { id: 'donut', emoji: '🍩', xp: -9 },
  { id: 'burger', emoji: '🍔', xp: -9 },
  { id: 'iceCream', emoji: '🍦', xp: -6 },
  { id: 'energyDrink', emoji: '⚡', xp: -10 },
  { id: 'instantNoodles', emoji: '🍜', xp: -7 },
  { id: 'pastry', emoji: '🥐', xp: -8 },
  { id: 'friedChicken', emoji: '🍗', xp: -8 },
  { id: 'cookies', emoji: '🍪', xp: -6 },
  { id: 'cake', emoji: '🍰', xp: -7 },
  { id: 'pizza', emoji: '🍕', xp: -7 },
  { id: 'chocolateBar', emoji: '🍫', xp: -6 },
  { id: 'hotDog', emoji: '🌭', xp: -8 },
  { id: 'bacon', emoji: '🥓', xp: -8 },
  { id: 'whiteBread', emoji: '🍞', xp: -4 },
  { id: 'popcorn', emoji: '🍿', xp: -5 },
  { id: 'bubbleTea', emoji: '🧋', xp: -7 },
  { id: 'juiceBox', emoji: '🧃', xp: -6 },
  { id: 'potatoChips', emoji: '🥔', xp: -7 },
  { id: 'pancakesSyrup', emoji: '🥞', xp: -6 },
  { id: 'pretzel', emoji: '🥨', xp: -5 },
]

/** Same junk food for everyone on a given calendar day, rotating deterministically —
 *  no server state needed. */
export function junkFoodOfTheDay(dateKey: string): JunkFoodDef {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i) + 7) >>> 0
  return JUNK_FOODS[hash % JUNK_FOODS.length]
}

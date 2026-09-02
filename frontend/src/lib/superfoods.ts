export type SuperfoodCategory = 'fruit' | 'vegetable' | 'protein' | 'nuts'

export const SUPERFOOD_CATEGORIES: SuperfoodCategory[] = ['fruit', 'vegetable', 'protein', 'nuts']

export interface SuperfoodDef {
  id: string
  emoji: string
  /** Path under /public to a real photo, once one has been supplied — falls back to the
   *  emoji above until then, so dropping a PNG in later needs no code change. */
  imageSrc: string | null
  category: SuperfoodCategory
  /** How much the weekly-completion XP circle gains from eating this, scaled to how nutrient-dense it is (4-12). */
  xp: number
}

export const SUPERFOODS: SuperfoodDef[] = [
  { id: 'avocado', emoji: '🥑', imageSrc: '/icons/fruits/avocado.png', category: 'fruit', xp: 10 },
  { id: 'banana', emoji: '🍌', imageSrc: '/icons/fruits/bananas.png', category: 'fruit', xp: 7 },
  { id: 'cherries', emoji: '🍒', imageSrc: '/icons/fruits/cherries.png', category: 'fruit', xp: 6 },
  { id: 'grapes', emoji: '🍇', imageSrc: '/icons/fruits/grapes.png', category: 'fruit', xp: 5 },
  { id: 'pineapple', emoji: '🍍', imageSrc: '/icons/fruits/pineapple.png', category: 'fruit', xp: 5 },
  { id: 'watermelon', emoji: '🍉', imageSrc: '/icons/fruits/watermelon.png', category: 'fruit', xp: 4 },
  { id: 'blueberries', emoji: '🫐', imageSrc: null, category: 'fruit', xp: 9 },
  { id: 'spinach', emoji: '🥬', imageSrc: null, category: 'vegetable', xp: 10 },
  { id: 'salmon', emoji: '🐟', imageSrc: null, category: 'protein', xp: 12 },
  { id: 'walnuts', emoji: '🌰', imageSrc: null, category: 'nuts', xp: 9 },
  { id: 'kale', emoji: '🥬', imageSrc: null, category: 'vegetable', xp: 11 },
  { id: 'broccoli', emoji: '🥦', imageSrc: null, category: 'vegetable', xp: 10 },
  { id: 'sweetPotato', emoji: '🍠', imageSrc: null, category: 'vegetable', xp: 8 },
  { id: 'garlic', emoji: '🧄', imageSrc: null, category: 'vegetable', xp: 7 },
  { id: 'eggs', emoji: '🥚', imageSrc: null, category: 'protein', xp: 10 },
  { id: 'lentils', emoji: '🫘', imageSrc: null, category: 'protein', xp: 9 },
  { id: 'almonds', emoji: '🥜', imageSrc: null, category: 'nuts', xp: 8 },
  { id: 'chiaSeeds', emoji: '🌱', imageSrc: null, category: 'nuts', xp: 8 },
  { id: 'strawberries', emoji: '🍓', imageSrc: null, category: 'fruit', xp: 8 },
  { id: 'kiwi', emoji: '🥝', imageSrc: null, category: 'fruit', xp: 8 },
  { id: 'orange', emoji: '🍊', imageSrc: null, category: 'fruit', xp: 7 },
  { id: 'tomato', emoji: '🍅', imageSrc: null, category: 'vegetable', xp: 6 },
  { id: 'mushrooms', emoji: '🍄', imageSrc: null, category: 'vegetable', xp: 7 },
  { id: 'oats', emoji: '🥣', imageSrc: null, category: 'protein', xp: 8 },
  { id: 'yogurt', emoji: '🥛', imageSrc: null, category: 'protein', xp: 7 },
  { id: 'mango', emoji: '🥭', imageSrc: null, category: 'fruit', xp: 6 },
  { id: 'bellPepper', emoji: '🫑', imageSrc: null, category: 'vegetable', xp: 8 },
  { id: 'ginger', emoji: '🫚', imageSrc: null, category: 'vegetable', xp: 5 },
  { id: 'apple', emoji: '🍎', imageSrc: null, category: 'fruit', xp: 6 },
  { id: 'pear', emoji: '🍐', imageSrc: null, category: 'fruit', xp: 5 },
  { id: 'peach', emoji: '🍑', imageSrc: null, category: 'fruit', xp: 5 },
  { id: 'lemon', emoji: '🍋', imageSrc: null, category: 'fruit', xp: 6 },
  { id: 'coconut', emoji: '🥥', imageSrc: null, category: 'fruit', xp: 6 },
  { id: 'papaya', emoji: '🍈', imageSrc: null, category: 'fruit', xp: 5 },
  { id: 'carrot', emoji: '🥕', imageSrc: null, category: 'vegetable', xp: 8 },
  { id: 'cucumber', emoji: '🥒', imageSrc: null, category: 'vegetable', xp: 5 },
  { id: 'onion', emoji: '🧅', imageSrc: null, category: 'vegetable', xp: 6 },
  { id: 'pumpkin', emoji: '🎃', imageSrc: null, category: 'vegetable', xp: 7 },
  { id: 'eggplant', emoji: '🍆', imageSrc: null, category: 'vegetable', xp: 6 },
  { id: 'corn', emoji: '🌽', imageSrc: null, category: 'vegetable', xp: 6 },
  { id: 'chickenBreast', emoji: '🐔', imageSrc: null, category: 'protein', xp: 9 },
  { id: 'turkey', emoji: '🦃', imageSrc: null, category: 'protein', xp: 8 },
  { id: 'tuna', emoji: '🐟', imageSrc: null, category: 'protein', xp: 10 },
  { id: 'chickpeas', emoji: '🫘', imageSrc: null, category: 'protein', xp: 8 },
  { id: 'quinoa', emoji: '🌾', imageSrc: null, category: 'protein', xp: 9 },
  { id: 'cashews', emoji: '🥜', imageSrc: null, category: 'nuts', xp: 8 },
  { id: 'pistachios', emoji: '🌰', imageSrc: null, category: 'nuts', xp: 8 },
  { id: 'sunflowerSeeds', emoji: '🌻', imageSrc: null, category: 'nuts', xp: 7 },
]

/** Same superfood for everyone on a given calendar day, rotating deterministically —
 *  no server state needed. */
export function superfoodOfTheDay(dateKey: string): SuperfoodDef {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  return SUPERFOODS[hash % SUPERFOODS.length]
}

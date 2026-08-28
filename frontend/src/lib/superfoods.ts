export type SuperfoodCategory = 'fruit' | 'vegetable' | 'protein' | 'nuts'

export const SUPERFOOD_CATEGORIES: SuperfoodCategory[] = ['fruit', 'vegetable', 'protein', 'nuts']

export interface SuperfoodDef {
  id: string
  emoji: string
  /** Path under /public to a real photo, once one has been supplied — falls back to the
   *  emoji above until then, so dropping a PNG in later needs no code change. */
  imageSrc: string | null
  category: SuperfoodCategory
}

export const SUPERFOODS: SuperfoodDef[] = [
  { id: 'avocado', emoji: '🥑', imageSrc: '/icons/fruits/avocado.png', category: 'fruit' },
  { id: 'banana', emoji: '🍌', imageSrc: '/icons/fruits/bananas.png', category: 'fruit' },
  { id: 'cherries', emoji: '🍒', imageSrc: '/icons/fruits/cherries.png', category: 'fruit' },
  { id: 'grapes', emoji: '🍇', imageSrc: '/icons/fruits/grapes.png', category: 'fruit' },
  { id: 'pineapple', emoji: '🍍', imageSrc: '/icons/fruits/pineapple.png', category: 'fruit' },
  { id: 'watermelon', emoji: '🍉', imageSrc: '/icons/fruits/watermelon.png', category: 'fruit' },
  { id: 'blueberries', emoji: '🫐', imageSrc: null, category: 'fruit' },
  { id: 'spinach', emoji: '🥬', imageSrc: null, category: 'vegetable' },
  { id: 'salmon', emoji: '🐟', imageSrc: null, category: 'protein' },
  { id: 'walnuts', emoji: '🌰', imageSrc: null, category: 'nuts' },
  { id: 'kale', emoji: '🥬', imageSrc: null, category: 'vegetable' },
  { id: 'broccoli', emoji: '🥦', imageSrc: null, category: 'vegetable' },
  { id: 'sweetPotato', emoji: '🍠', imageSrc: null, category: 'vegetable' },
  { id: 'garlic', emoji: '🧄', imageSrc: null, category: 'vegetable' },
  { id: 'eggs', emoji: '🥚', imageSrc: null, category: 'protein' },
  { id: 'lentils', emoji: '🫘', imageSrc: null, category: 'protein' },
  { id: 'almonds', emoji: '🥜', imageSrc: null, category: 'nuts' },
  { id: 'chiaSeeds', emoji: '🌱', imageSrc: null, category: 'nuts' },
  { id: 'strawberries', emoji: '🍓', imageSrc: null, category: 'fruit' },
  { id: 'kiwi', emoji: '🥝', imageSrc: null, category: 'fruit' },
  { id: 'orange', emoji: '🍊', imageSrc: null, category: 'fruit' },
  { id: 'tomato', emoji: '🍅', imageSrc: null, category: 'vegetable' },
  { id: 'mushrooms', emoji: '🍄', imageSrc: null, category: 'vegetable' },
  { id: 'oats', emoji: '🥣', imageSrc: null, category: 'protein' },
  { id: 'yogurt', emoji: '🥛', imageSrc: null, category: 'protein' },
  { id: 'mango', emoji: '🥭', imageSrc: null, category: 'fruit' },
  { id: 'bellPepper', emoji: '🫑', imageSrc: null, category: 'vegetable' },
  { id: 'ginger', emoji: '🫚', imageSrc: null, category: 'vegetable' },
]

/** Same superfood for everyone on a given calendar day, rotating deterministically —
 *  no server state needed. */
export function superfoodOfTheDay(dateKey: string): SuperfoodDef {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  return SUPERFOODS[hash % SUPERFOODS.length]
}

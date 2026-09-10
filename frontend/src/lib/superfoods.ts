import type { NutrientScores } from './nutrientBuckets'

export type SuperfoodCategory = 'fruit' | 'vegetable' | 'protein' | 'nuts' | 'superfood'

export const SUPERFOOD_CATEGORIES: SuperfoodCategory[] = ['fruit', 'vegetable', 'protein', 'nuts', 'superfood']

/** The single most notable nutrient of a food, shown on its card as a real amount instead of
 *  an abstract score — e.g. salmon shows "22g Protein", carrots show "835mcg Vitamin A". */
export type HeadlineNutrientKind = 'protein' | 'carbs' | 'fats' | 'vitaminC' | 'vitaminA'

export interface NutrientHeadline {
  kind: HeadlineNutrientKind
  /** Amount per 100g of the food (edible, typically-eaten form — cooked where that's the norm). */
  amount: number
  unit: 'g' | 'mg' | 'mcg'
}

export interface SuperfoodDef {
  id: string
  emoji: string
  /** Path under /public to a real photo, once one has been supplied — falls back to the
   *  emoji above until then, so dropping a PNG in later needs no code change. */
  imageSrc: string | null
  category: SuperfoodCategory
  /** Relative strength (1-10) per dominant nutrient, used by the top-left nutrient filter to
   *  decide both which foods match a filter and how they rank within it (highest first). */
  nutrients: NutrientScores
  /** Real per-100g amount of this food's standout nutrient, shown on its card. */
  headline: NutrientHeadline
}

export const SUPERFOODS: SuperfoodDef[] = [
  { id: 'avocado', emoji: '🥑', imageSrc: '/icons/fruits/avocado.png', category: 'superfood', nutrients: { fats: 9, vitamins: 6, carbs: 4 }, headline: { kind: 'fats', amount: 15, unit: 'g' } },
  { id: 'banana', emoji: '🍌', imageSrc: '/icons/fruits/bananas.png', category: 'fruit', nutrients: { carbs: 8, vitamins: 4 }, headline: { kind: 'carbs', amount: 23, unit: 'g' } },
  { id: 'cherries', emoji: '🍒', imageSrc: '/icons/fruits/cherries.png', category: 'fruit', nutrients: { carbs: 6, vitamins: 5 }, headline: { kind: 'carbs', amount: 16, unit: 'g' } },
  { id: 'grapes', emoji: '🍇', imageSrc: '/icons/fruits/grapes.png', category: 'fruit', nutrients: { carbs: 7, vitamins: 3 }, headline: { kind: 'carbs', amount: 18, unit: 'g' } },
  { id: 'pineapple', emoji: '🍍', imageSrc: '/icons/fruits/pineapple.png', category: 'fruit', nutrients: { carbs: 6, vitamins: 7 }, headline: { kind: 'vitaminC', amount: 48, unit: 'mg' } },
  { id: 'watermelon', emoji: '🍉', imageSrc: '/icons/fruits/watermelon.png', category: 'fruit', nutrients: { carbs: 5, vitamins: 5 }, headline: { kind: 'carbs', amount: 8, unit: 'g' } },
  { id: 'blueberries', emoji: '🫐', imageSrc: null, category: 'superfood', nutrients: { vitamins: 8, carbs: 5 }, headline: { kind: 'vitaminC', amount: 10, unit: 'mg' } },
  { id: 'spinach', emoji: '🥬', imageSrc: null, category: 'superfood', nutrients: { vitamins: 10, protein: 4 }, headline: { kind: 'vitaminA', amount: 469, unit: 'mcg' } },
  { id: 'salmon', emoji: '🐟', imageSrc: null, category: 'superfood', nutrients: { protein: 9, fats: 8, vitamins: 6 }, headline: { kind: 'protein', amount: 22, unit: 'g' } },
  { id: 'walnuts', emoji: '🌰', imageSrc: null, category: 'superfood', nutrients: { fats: 9, protein: 5 }, headline: { kind: 'fats', amount: 65, unit: 'g' } },
  { id: 'kale', emoji: '🍃', imageSrc: null, category: 'superfood', nutrients: { vitamins: 10, protein: 3 }, headline: { kind: 'vitaminC', amount: 120, unit: 'mg' } },
  { id: 'broccoli', emoji: '🥦', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 9, protein: 3 }, headline: { kind: 'vitaminC', amount: 89, unit: 'mg' } },
  { id: 'sweetPotato', emoji: '🍠', imageSrc: null, category: 'vegetable', nutrients: { carbs: 8, vitamins: 9 }, headline: { kind: 'vitaminA', amount: 709, unit: 'mcg' } },
  { id: 'garlic', emoji: '🧄', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 5 }, headline: { kind: 'vitaminC', amount: 31, unit: 'mg' } },
  { id: 'eggs', emoji: '🥚', imageSrc: null, category: 'protein', nutrients: { protein: 8, fats: 6, vitamins: 5 }, headline: { kind: 'protein', amount: 13, unit: 'g' } },
  { id: 'lentils', emoji: '🫘', imageSrc: null, category: 'protein', nutrients: { protein: 8, carbs: 6, vitamins: 5 }, headline: { kind: 'protein', amount: 9, unit: 'g' } },
  { id: 'almonds', emoji: '🥜', imageSrc: null, category: 'nuts', nutrients: { fats: 8, protein: 6, vitamins: 6 }, headline: { kind: 'fats', amount: 49, unit: 'g' } },
  { id: 'chiaSeeds', emoji: '🌱', imageSrc: null, category: 'superfood', nutrients: { fats: 7, carbs: 6, protein: 5 }, headline: { kind: 'fats', amount: 31, unit: 'g' } },
  { id: 'strawberries', emoji: '🍓', imageSrc: null, category: 'fruit', nutrients: { vitamins: 8, carbs: 4 }, headline: { kind: 'vitaminC', amount: 59, unit: 'mg' } },
  { id: 'kiwi', emoji: '🥝', imageSrc: null, category: 'fruit', nutrients: { vitamins: 9, carbs: 4 }, headline: { kind: 'vitaminC', amount: 93, unit: 'mg' } },
  { id: 'orange', emoji: '🍊', imageSrc: null, category: 'fruit', nutrients: { vitamins: 8, carbs: 5 }, headline: { kind: 'vitaminC', amount: 53, unit: 'mg' } },
  { id: 'tomato', emoji: '🍅', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 6, carbs: 2 }, headline: { kind: 'vitaminC', amount: 14, unit: 'mg' } },
  { id: 'mushrooms', emoji: '🍄', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 5, protein: 4 }, headline: { kind: 'protein', amount: 3, unit: 'g' } },
  { id: 'oats', emoji: '🥣', imageSrc: null, category: 'protein', nutrients: { carbs: 7, protein: 5, fats: 2 }, headline: { kind: 'carbs', amount: 66, unit: 'g' } },
  { id: 'yogurt', emoji: '🥛', imageSrc: null, category: 'protein', nutrients: { protein: 7, carbs: 3, fats: 3 }, headline: { kind: 'protein', amount: 10, unit: 'g' } },
  { id: 'mango', emoji: '🥭', imageSrc: null, category: 'fruit', nutrients: { carbs: 7, vitamins: 7 }, headline: { kind: 'carbs', amount: 15, unit: 'g' } },
  { id: 'bellPepper', emoji: '🫑', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 9, carbs: 3 }, headline: { kind: 'vitaminC', amount: 128, unit: 'mg' } },
  { id: 'ginger', emoji: '🫚', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 3 }, headline: { kind: 'vitaminC', amount: 5, unit: 'mg' } },
  { id: 'apple', emoji: '🍎', imageSrc: null, category: 'fruit', nutrients: { carbs: 6, vitamins: 4 }, headline: { kind: 'carbs', amount: 14, unit: 'g' } },
  { id: 'pear', emoji: '🍐', imageSrc: null, category: 'fruit', nutrients: { carbs: 6, vitamins: 3 }, headline: { kind: 'carbs', amount: 15, unit: 'g' } },
  { id: 'peach', emoji: '🍑', imageSrc: null, category: 'fruit', nutrients: { carbs: 5, vitamins: 5 }, headline: { kind: 'carbs', amount: 10, unit: 'g' } },
  { id: 'lemon', emoji: '🍋', imageSrc: null, category: 'fruit', nutrients: { vitamins: 8 }, headline: { kind: 'vitaminC', amount: 53, unit: 'mg' } },
  { id: 'coconut', emoji: '🥥', imageSrc: null, category: 'fruit', nutrients: { fats: 8, carbs: 3 }, headline: { kind: 'fats', amount: 33, unit: 'g' } },
  { id: 'papaya', emoji: '🍈', imageSrc: null, category: 'fruit', nutrients: { vitamins: 8, carbs: 4 }, headline: { kind: 'vitaminC', amount: 61, unit: 'mg' } },
  { id: 'carrot', emoji: '🥕', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 9, carbs: 4 }, headline: { kind: 'vitaminA', amount: 835, unit: 'mcg' } },
  { id: 'cucumber', emoji: '🥒', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 3 }, headline: { kind: 'vitaminC', amount: 3, unit: 'mg' } },
  { id: 'onion', emoji: '🧅', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 4, carbs: 3 }, headline: { kind: 'vitaminC', amount: 7, unit: 'mg' } },
  { id: 'pumpkin', emoji: '🎃', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 8, carbs: 5 }, headline: { kind: 'vitaminA', amount: 426, unit: 'mcg' } },
  { id: 'eggplant', emoji: '🍆', imageSrc: null, category: 'vegetable', nutrients: { vitamins: 4, carbs: 3 }, headline: { kind: 'vitaminC', amount: 2, unit: 'mg' } },
  { id: 'corn', emoji: '🌽', imageSrc: null, category: 'vegetable', nutrients: { carbs: 7, vitamins: 3 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'chickenBreast', emoji: '🐔', imageSrc: null, category: 'protein', nutrients: { protein: 9, fats: 2 }, headline: { kind: 'protein', amount: 31, unit: 'g' } },
  { id: 'turkey', emoji: '🦃', imageSrc: null, category: 'protein', nutrients: { protein: 9, fats: 2 }, headline: { kind: 'protein', amount: 29, unit: 'g' } },
  { id: 'tuna', emoji: '🍣', imageSrc: null, category: 'protein', nutrients: { protein: 9, fats: 3 }, headline: { kind: 'protein', amount: 26, unit: 'g' } },
  { id: 'chickpeas', emoji: '🧆', imageSrc: null, category: 'protein', nutrients: { protein: 7, carbs: 6 }, headline: { kind: 'protein', amount: 9, unit: 'g' } },
  { id: 'quinoa', emoji: '🌾', imageSrc: null, category: 'superfood', nutrients: { carbs: 6, protein: 7 }, headline: { kind: 'protein', amount: 4, unit: 'g' } },
  { id: 'cashews', emoji: '🌙', imageSrc: null, category: 'nuts', nutrients: { fats: 7, protein: 6, carbs: 4 }, headline: { kind: 'fats', amount: 44, unit: 'g' } },
  { id: 'pistachios', emoji: '🫛', imageSrc: null, category: 'nuts', nutrients: { fats: 7, protein: 6, vitamins: 4 }, headline: { kind: 'fats', amount: 45, unit: 'g' } },
  { id: 'sunflowerSeeds', emoji: '🌻', imageSrc: null, category: 'nuts', nutrients: { fats: 8, protein: 5, vitamins: 7 }, headline: { kind: 'fats', amount: 51, unit: 'g' } },
]

/** Same superfood for everyone on a given calendar day, rotating deterministically —
 *  no server state needed. */
export function superfoodOfTheDay(dateKey: string): SuperfoodDef {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  return SUPERFOODS[hash % SUPERFOODS.length]
}

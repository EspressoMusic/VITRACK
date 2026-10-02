import type { NutrientScores } from './nutrientBuckets'

/** Every category ties a food to a training purpose — this app is about fueling and
 *  recovering from workouts, not general healthy eating. */
export type SuperfoodCategory = 'muscleBuilding' | 'recovery' | 'energy' | 'hydration' | 'meal'

export const SUPERFOOD_CATEGORIES: SuperfoodCategory[] = ['muscleBuilding', 'recovery', 'energy', 'hydration', 'meal']

/** Which training purpose a `meal`-category item is built for — used by the meals tab's filter chips. */
export type MealPurpose = 'preWorkout' | 'postWorkout' | 'muscleBuilding' | 'endurance'

export const MEAL_PURPOSES: MealPurpose[] = ['preWorkout', 'postWorkout', 'muscleBuilding', 'endurance']

/** Shown next to the meal-purpose label on a meal's detail card. */
export const MEAL_PURPOSE_EMOJI: Record<MealPurpose, string> = {
  preWorkout: '⚡',
  postWorkout: '🔧',
  muscleBuilding: '💪',
  endurance: '🔥',
}

/** The single most notable nutrient of a food, shown on its card as a real amount instead of
 *  an abstract score — e.g. salmon shows "22g Protein", sweet potato shows "709mcg Vitamin A". */
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
   *  emoji above until then, so dropping a WebP in later needs no code change. */
  imageSrc: string | null
  category: SuperfoodCategory
  /** Relative strength (1-10) per dominant nutrient, used by the top-left nutrient filter to
   *  decide both which foods match a filter and how they rank within it (highest first). */
  nutrients: NutrientScores
  /** Real per-100g amount of this food's standout nutrient, shown on its card. */
  headline: NutrientHeadline
  /** Set only for `category: 'meal'` items — which training purpose they're built for. */
  mealPurpose?: MealPurpose
}

export const SUPERFOODS: SuperfoodDef[] = [
  // Muscle building — high-protein foods that give your muscles what they need to grow and repair.
  { id: 'chickenBreast', emoji: '🐔', imageSrc: null, category: 'muscleBuilding', nutrients: { protein: 9, fats: 2 }, headline: { kind: 'protein', amount: 31, unit: 'g' } },
  { id: 'turkey', emoji: '🦃', imageSrc: null, category: 'muscleBuilding', nutrients: { protein: 9, fats: 2 }, headline: { kind: 'protein', amount: 29, unit: 'g' } },
  { id: 'tuna', emoji: '🍣', imageSrc: null, category: 'muscleBuilding', nutrients: { protein: 9, fats: 3 }, headline: { kind: 'protein', amount: 26, unit: 'g' } },
  { id: 'eggs', emoji: '🥚', imageSrc: null, category: 'muscleBuilding', nutrients: { protein: 8, fats: 6, vitamins: 5 }, headline: { kind: 'protein', amount: 13, unit: 'g' } },
  { id: 'yogurt', emoji: '🥛', imageSrc: null, category: 'muscleBuilding', nutrients: { protein: 7, carbs: 3, fats: 3 }, headline: { kind: 'protein', amount: 10, unit: 'g' } },
  { id: 'lentils', emoji: '🫘', imageSrc: null, category: 'muscleBuilding', nutrients: { protein: 8, carbs: 6, vitamins: 5 }, headline: { kind: 'protein', amount: 9, unit: 'g' } },
  { id: 'chickpeas', emoji: '🧆', imageSrc: null, category: 'muscleBuilding', nutrients: { protein: 7, carbs: 6 }, headline: { kind: 'protein', amount: 9, unit: 'g' } },
  { id: 'quinoa', emoji: '🌾', imageSrc: null, category: 'muscleBuilding', nutrients: { carbs: 6, protein: 7 }, headline: { kind: 'protein', amount: 4, unit: 'g' } },

  // Recovery — foods that calm inflammation, ease soreness, and help muscle repair after training.
  { id: 'salmon', emoji: '🐟', imageSrc: null, category: 'recovery', nutrients: { protein: 9, fats: 8, vitamins: 6 }, headline: { kind: 'protein', amount: 22, unit: 'g' } },
  { id: 'walnuts', emoji: '🌰', imageSrc: null, category: 'recovery', nutrients: { fats: 9, protein: 5 }, headline: { kind: 'fats', amount: 65, unit: 'g' } },
  { id: 'almonds', emoji: '🥜', imageSrc: null, category: 'recovery', nutrients: { fats: 8, protein: 6, vitamins: 6 }, headline: { kind: 'fats', amount: 49, unit: 'g' } },
  { id: 'avocado', emoji: '🥑', imageSrc: '/icons/fruits/avocado.png', category: 'recovery', nutrients: { fats: 9, vitamins: 6, carbs: 4 }, headline: { kind: 'fats', amount: 15, unit: 'g' } },
  { id: 'blueberries', emoji: '🫐', imageSrc: null, category: 'recovery', nutrients: { vitamins: 8, carbs: 5 }, headline: { kind: 'vitaminC', amount: 10, unit: 'mg' } },
  { id: 'spinach', emoji: '🥬', imageSrc: null, category: 'recovery', nutrients: { vitamins: 10, protein: 4 }, headline: { kind: 'vitaminA', amount: 469, unit: 'mcg' } },
  { id: 'kale', emoji: '🍃', imageSrc: null, category: 'recovery', nutrients: { vitamins: 10, protein: 3 }, headline: { kind: 'vitaminC', amount: 120, unit: 'mg' } },
  { id: 'cherries', emoji: '🍒', imageSrc: '/icons/fruits/cherries.png', category: 'recovery', nutrients: { carbs: 6, vitamins: 5 }, headline: { kind: 'carbs', amount: 16, unit: 'g' } },
  { id: 'pineapple', emoji: '🍍', imageSrc: '/icons/fruits/pineapple.png', category: 'recovery', nutrients: { carbs: 6, vitamins: 7 }, headline: { kind: 'vitaminC', amount: 48, unit: 'mg' } },
  { id: 'ginger', emoji: '🫚', imageSrc: null, category: 'recovery', nutrients: { vitamins: 3 }, headline: { kind: 'vitaminC', amount: 5, unit: 'mg' } },
  { id: 'bellPepper', emoji: '🫑', imageSrc: null, category: 'recovery', nutrients: { vitamins: 9, carbs: 3 }, headline: { kind: 'vitaminC', amount: 128, unit: 'mg' } },
  { id: 'strawberries', emoji: '🍓', imageSrc: null, category: 'recovery', nutrients: { vitamins: 8, carbs: 4 }, headline: { kind: 'vitaminC', amount: 59, unit: 'mg' } },

  // Energy — carbs that fuel a workout, before or during.
  { id: 'banana', emoji: '🍌', imageSrc: '/icons/fruits/bananas.png', category: 'energy', nutrients: { carbs: 8, vitamins: 4 }, headline: { kind: 'carbs', amount: 23, unit: 'g' } },
  { id: 'oats', emoji: '🥣', imageSrc: null, category: 'energy', nutrients: { carbs: 7, protein: 5, fats: 2 }, headline: { kind: 'carbs', amount: 66, unit: 'g' } },
  { id: 'sweetPotato', emoji: '🍠', imageSrc: null, category: 'energy', nutrients: { carbs: 8, vitamins: 9 }, headline: { kind: 'vitaminA', amount: 709, unit: 'mcg' } },
  { id: 'coconut', emoji: '🥥', imageSrc: null, category: 'energy', nutrients: { fats: 8, carbs: 3 }, headline: { kind: 'fats', amount: 33, unit: 'g' } },
  { id: 'corn', emoji: '🌽', imageSrc: null, category: 'energy', nutrients: { carbs: 7, vitamins: 3 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'grapes', emoji: '🍇', imageSrc: '/icons/fruits/grapes.png', category: 'energy', nutrients: { carbs: 7, vitamins: 3 }, headline: { kind: 'carbs', amount: 18, unit: 'g' } },
  { id: 'apple', emoji: '🍎', imageSrc: null, category: 'energy', nutrients: { carbs: 6, vitamins: 4 }, headline: { kind: 'carbs', amount: 14, unit: 'g' } },
  { id: 'mango', emoji: '🥭', imageSrc: null, category: 'energy', nutrients: { carbs: 7, vitamins: 7 }, headline: { kind: 'carbs', amount: 15, unit: 'g' } },

  // Hydration — replaces the fluid and electrolytes a workout burns through.
  { id: 'watermelon', emoji: '🍉', imageSrc: '/icons/fruits/watermelon.png', category: 'hydration', nutrients: { carbs: 5, vitamins: 5 }, headline: { kind: 'carbs', amount: 8, unit: 'g' } },
  { id: 'cucumber', emoji: '🥒', imageSrc: null, category: 'hydration', nutrients: { vitamins: 3 }, headline: { kind: 'vitaminC', amount: 3, unit: 'mg' } },
  { id: 'orange', emoji: '🍊', imageSrc: null, category: 'hydration', nutrients: { vitamins: 8, carbs: 5 }, headline: { kind: 'vitaminC', amount: 53, unit: 'mg' } },
  { id: 'lemon', emoji: '🍋', imageSrc: null, category: 'hydration', nutrients: { vitamins: 8 }, headline: { kind: 'vitaminC', amount: 53, unit: 'mg' } },

  // Meals — each one built for a specific training purpose.
  { id: 'oatmealBananaBowl', emoji: '🥣', imageSrc: '/icons/meals/oatmealBananaBowl.png', category: 'meal', mealPurpose: 'preWorkout', nutrients: { carbs: 8, protein: 3, vitamins: 4 }, headline: { kind: 'carbs', amount: 52, unit: 'g' } },
  { id: 'bananaPeanutButterToast', emoji: '🍞', imageSrc: null, category: 'meal', mealPurpose: 'preWorkout', nutrients: { carbs: 7, protein: 5, fats: 5 }, headline: { kind: 'carbs', amount: 45, unit: 'g' } },
  { id: 'riceCakesWithAlmondButter', emoji: '🍘', imageSrc: null, category: 'meal', mealPurpose: 'preWorkout', nutrients: { carbs: 6, fats: 6, protein: 3 }, headline: { kind: 'carbs', amount: 28, unit: 'g' } },
  { id: 'turkeyVeggieWrap', emoji: '🌯', imageSrc: null, category: 'meal', mealPurpose: 'preWorkout', nutrients: { protein: 7, carbs: 5, vitamins: 4 }, headline: { kind: 'protein', amount: 25, unit: 'g' } },

  { id: 'proteinSmoothieBowl', emoji: '🥤', imageSrc: null, category: 'meal', mealPurpose: 'postWorkout', nutrients: { protein: 7, carbs: 6, vitamins: 6 }, headline: { kind: 'protein', amount: 22, unit: 'g' } },
  { id: 'chocolateProteinShake', emoji: '🍫', imageSrc: null, category: 'meal', mealPurpose: 'postWorkout', nutrients: { protein: 9, carbs: 4 }, headline: { kind: 'protein', amount: 28, unit: 'g' } },
  { id: 'recoveryChocolateMilk', emoji: '🧃', imageSrc: null, category: 'meal', mealPurpose: 'postWorkout', nutrients: { protein: 6, carbs: 6 }, headline: { kind: 'protein', amount: 8, unit: 'g' } },
  { id: 'greekYogurtParfait', emoji: '🍨', imageSrc: '/icons/meals/greekYogurtParfait.png', category: 'meal', mealPurpose: 'postWorkout', nutrients: { protein: 6, carbs: 5, vitamins: 4 }, headline: { kind: 'protein', amount: 18, unit: 'g' } },

  { id: 'chickenSweetPotatoPlate', emoji: '🍗', imageSrc: '/icons/meals/chickenSweetPotatoPlate.png', category: 'meal', mealPurpose: 'muscleBuilding', nutrients: { protein: 9, carbs: 6, vitamins: 7 }, headline: { kind: 'protein', amount: 38, unit: 'g' } },
  { id: 'steakVeggieStirFry', emoji: '🥩', imageSrc: null, category: 'meal', mealPurpose: 'muscleBuilding', nutrients: { protein: 9, fats: 5, vitamins: 6 }, headline: { kind: 'protein', amount: 36, unit: 'g' } },
  { id: 'beefBroccoliBowl', emoji: '🥢', imageSrc: null, category: 'meal', mealPurpose: 'muscleBuilding', nutrients: { protein: 8, carbs: 6, vitamins: 6 }, headline: { kind: 'protein', amount: 33, unit: 'g' } },
  { id: 'eggWhiteVeggieScramble', emoji: '🥘', imageSrc: null, category: 'meal', mealPurpose: 'muscleBuilding', nutrients: { protein: 8, fats: 3, vitamins: 6 }, headline: { kind: 'protein', amount: 24, unit: 'g' } },

  { id: 'salmonQuinoaBowl', emoji: '🍱', imageSrc: '/icons/meals/salmonQuinoaBowl.png', category: 'meal', mealPurpose: 'endurance', nutrients: { protein: 8, fats: 6, carbs: 5, vitamins: 5 }, headline: { kind: 'protein', amount: 34, unit: 'g' } },
  { id: 'lentilSoupWholegrain', emoji: '🍲', imageSrc: null, category: 'meal', mealPurpose: 'endurance', nutrients: { protein: 6, carbs: 7, vitamins: 5 }, headline: { kind: 'protein', amount: 16, unit: 'g' } },
  { id: 'quinoaChickpeaSalad', emoji: '🥗', imageSrc: null, category: 'meal', mealPurpose: 'endurance', nutrients: { protein: 6, carbs: 6, vitamins: 6 }, headline: { kind: 'protein', amount: 14, unit: 'g' } },
  { id: 'chickenRiceBowl', emoji: '🍛', imageSrc: null, category: 'meal', mealPurpose: 'endurance', nutrients: { protein: 8, carbs: 7, vitamins: 5 }, headline: { kind: 'protein', amount: 32, unit: 'g' } },
]

/** Same superfood for everyone on a given calendar day, rotating deterministically —
 *  no server state needed. */
export function superfoodOfTheDay(dateKey: string): SuperfoodDef {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  return SUPERFOODS[hash % SUPERFOODS.length]
}

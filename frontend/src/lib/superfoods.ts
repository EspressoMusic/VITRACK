import type { IdentifiedFood, NutrientId } from '../types'
import type { NutrientScores } from './nutrientBuckets'
import { SUPERFOOD_CONTENT } from './i18n/superfoodsPanel'

/** Groups foods by what they mostly give you. This is an everyday nutrition app, not a
 *  fitness app — food copy should not tie back to workouts. */
export type SuperfoodCategory = 'muscleBuilding' | 'recovery' | 'energy' | 'hydration' | 'meal' | 'treat'

export const SUPERFOOD_CATEGORIES: SuperfoodCategory[] = ['muscleBuilding', 'recovery', 'energy', 'hydration', 'meal', 'treat']

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
 *  an abstract score — e.g. banana shows "23g Carbs", melon shows "169mcg Vitamin A". */
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
  /** The vitamin or mineral this food gives the most of, ranked by share of the daily need (not raw
   *  weight). `amount` is per 100g as typically eaten (cooked for beans and grains), in the unit lib/nutrients.ts uses for that nutrient (USDA data). */
  topMicronutrient: { nutrient: NutrientId; amount: number }
  /** Set only for `category: 'meal'` items — which training purpose they're built for. */
  mealPurpose?: MealPurpose
}

export const SUPERFOODS: SuperfoodDef[] = [
  // Muscle building — protein that helps keep muscles strong.
  { id: 'lentils', emoji: '🟢', imageSrc: '/legumes/lentils.webp', category: 'muscleBuilding', nutrients: { protein: 7, carbs: 6 }, topMicronutrient: { nutrient: 'vitaminB9', amount: 181 }, headline: { kind: 'protein', amount: 9, unit: 'g' } },
  { id: 'chickpeas', emoji: '🫘', imageSrc: '/legumes/chickpeas.webp', category: 'muscleBuilding', nutrients: { protein: 7, carbs: 7 }, topMicronutrient: { nutrient: 'vitaminB9', amount: 172 }, headline: { kind: 'protein', amount: 8.9, unit: 'g' } },
  { id: 'blackBeans', emoji: '🫘', imageSrc: '/legumes/black-beans.webp', category: 'muscleBuilding', nutrients: { protein: 7, carbs: 6 }, topMicronutrient: { nutrient: 'vitaminB9', amount: 149 }, headline: { kind: 'protein', amount: 8.9, unit: 'g' } },
  { id: 'kidneyBeans', emoji: '🫘', imageSrc: '/legumes/kidney-beans.webp', category: 'muscleBuilding', nutrients: { protein: 7, carbs: 6 }, topMicronutrient: { nutrient: 'vitaminB9', amount: 130 }, headline: { kind: 'protein', amount: 8.7, unit: 'g' } },
  { id: 'edamame', emoji: '🫛', imageSrc: '/legumes/edamame.webp', category: 'muscleBuilding', nutrients: { protein: 8, vitamins: 6, carbs: 3 }, topMicronutrient: { nutrient: 'vitaminB9', amount: 311 }, headline: { kind: 'protein', amount: 12, unit: 'g' } },
  { id: 'peas', emoji: '🫛', imageSrc: '/legumes/peas.webp', category: 'muscleBuilding', nutrients: { protein: 5, carbs: 5, vitamins: 5 }, topMicronutrient: { nutrient: 'manganese', amount: 0.53 }, headline: { kind: 'protein', amount: 5.4, unit: 'g' } },
  { id: 'quinoa', emoji: '🍚', imageSrc: '/grains/quinoa.webp', category: 'muscleBuilding', nutrients: { carbs: 6, protein: 5 }, topMicronutrient: { nutrient: 'manganese', amount: 0.63 }, headline: { kind: 'protein', amount: 4.4, unit: 'g' } },
  { id: 'almonds', emoji: '🌰', imageSrc: '/seeds/almonds.webp', category: 'muscleBuilding', nutrients: { fats: 8, protein: 7, vitamins: 6 }, topMicronutrient: { nutrient: 'vitaminE', amount: 25.6 }, headline: { kind: 'protein', amount: 21, unit: 'g' } },
  { id: 'pumpkinSeeds', emoji: '🌱', imageSrc: '/seeds/pumpkin-seeds.webp', category: 'muscleBuilding', nutrients: { protein: 9, fats: 8 }, topMicronutrient: { nutrient: 'manganese', amount: 4.5 }, headline: { kind: 'protein', amount: 30, unit: 'g' } },
  { id: 'cashews', emoji: '🥜', imageSrc: '/seeds/cashews.webp', category: 'muscleBuilding', nutrients: { fats: 8, protein: 6 }, topMicronutrient: { nutrient: 'copper', amount: 2.2 }, headline: { kind: 'protein', amount: 18, unit: 'g' } },
  { id: 'pistachios', emoji: '🥜', imageSrc: '/seeds/pistachios.webp', category: 'muscleBuilding', nutrients: { fats: 8, protein: 7, vitamins: 5 }, topMicronutrient: { nutrient: 'copper', amount: 1.3 }, headline: { kind: 'protein', amount: 20, unit: 'g' } },
  { id: 'peanuts', emoji: '🥜', imageSrc: '/seeds/peanuts.webp', category: 'muscleBuilding', nutrients: { protein: 9, fats: 9 }, topMicronutrient: { nutrient: 'copper', amount: 1.14 }, headline: { kind: 'protein', amount: 26, unit: 'g' } },
  { id: 'tofu', emoji: '⬜', imageSrc: '/legumes/tofu.webp', category: 'muscleBuilding', nutrients: { protein: 7, vitamins: 4 }, topMicronutrient: { nutrient: 'calcium', amount: 350 }, headline: { kind: 'protein', amount: 8.1, unit: 'g' } },
  { id: 'hummus', emoji: '🫘', imageSrc: '/legumes/hummus.webp', category: 'muscleBuilding', nutrients: { protein: 6, carbs: 6, fats: 6 }, topMicronutrient: { nutrient: 'vitaminB9', amount: 83 }, headline: { kind: 'protein', amount: 7.9, unit: 'g' } },
  { id: 'egg', emoji: '🍳', imageSrc: '/proteins/egg.webp', category: 'muscleBuilding', nutrients: { protein: 8, fats: 6, vitamins: 6 }, topMicronutrient: { nutrient: 'selenium', amount: 34 }, headline: { kind: 'protein', amount: 13.6, unit: 'g' } },
  { id: 'chickenBreast', emoji: '🍗', imageSrc: '/proteins/chicken-breast.webp', category: 'muscleBuilding', nutrients: { protein: 10, vitamins: 5 }, topMicronutrient: { nutrient: 'vitaminB3', amount: 13.7 }, headline: { kind: 'protein', amount: 31, unit: 'g' } },
  { id: 'turkey', emoji: '🦃', imageSrc: '/proteins/turkey.webp', category: 'muscleBuilding', nutrients: { protein: 10 }, topMicronutrient: { nutrient: 'vitaminB3', amount: 11.8 }, headline: { kind: 'protein', amount: 29, unit: 'g' } },
  { id: 'salmon', emoji: '🐟', imageSrc: '/proteins/salmon.webp', category: 'muscleBuilding', nutrients: { protein: 9, fats: 7, vitamins: 7 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 2.8 }, headline: { kind: 'protein', amount: 22, unit: 'g' } },
  { id: 'tuna', emoji: '🐟', imageSrc: '/proteins/tuna.webp', category: 'muscleBuilding', nutrients: { protein: 9, vitamins: 5 }, topMicronutrient: { nutrient: 'selenium', amount: 80 }, headline: { kind: 'protein', amount: 25.5, unit: 'g' } },
  { id: 'sardines', emoji: '🐟', imageSrc: '/proteins/sardines.webp', category: 'muscleBuilding', nutrients: { protein: 9, fats: 6, vitamins: 8 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 8.9 }, headline: { kind: 'protein', amount: 25, unit: 'g' } },
  { id: 'whiteFish', emoji: '🐟', imageSrc: '/proteins/white-fish.webp', category: 'muscleBuilding', nutrients: { protein: 9, vitamins: 3 }, topMicronutrient: { nutrient: 'selenium', amount: 38 }, headline: { kind: 'protein', amount: 23, unit: 'g' } },
  { id: 'steak', emoji: '🥩', imageSrc: '/proteins/steak.webp', category: 'muscleBuilding', nutrients: { protein: 10, fats: 5, vitamins: 5 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 2.6 }, headline: { kind: 'protein', amount: 28, unit: 'g' } },
  { id: 'groundBeef', emoji: '🥩', imageSrc: '/proteins/ground-beef.webp', category: 'muscleBuilding', nutrients: { protein: 9, fats: 7, vitamins: 5 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 2.6 }, headline: { kind: 'protein', amount: 26, unit: 'g' } },
  { id: 'meatballs', emoji: '🍖', imageSrc: '/proteins/meatballs.webp', category: 'muscleBuilding', nutrients: { protein: 7, fats: 6, carbs: 3 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 1.5 }, headline: { kind: 'protein', amount: 16, unit: 'g' } },
  { id: 'kebab', emoji: '🍢', imageSrc: '/proteins/kebab.webp', category: 'muscleBuilding', nutrients: { protein: 7, fats: 7 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 2 }, headline: { kind: 'protein', amount: 17, unit: 'g' } },
  { id: 'shawarma', emoji: '🥙', imageSrc: '/proteins/shawarma.webp', category: 'muscleBuilding', nutrients: { protein: 7, fats: 6 }, topMicronutrient: { nutrient: 'vitaminB3', amount: 8 }, headline: { kind: 'protein', amount: 20, unit: 'g' } },
  { id: 'schnitzel', emoji: '🍗', imageSrc: '/proteins/schnitzel.webp', category: 'muscleBuilding', nutrients: { protein: 8, fats: 6, carbs: 4 }, topMicronutrient: { nutrient: 'vitaminB3', amount: 9 }, headline: { kind: 'protein', amount: 22, unit: 'g' } },
  { id: 'yogurt', emoji: '🥣', imageSrc: '/dairy/yogurt.webp', category: 'muscleBuilding', nutrients: { protein: 6, vitamins: 5 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 0.56 }, headline: { kind: 'protein', amount: 5.3, unit: 'g' } },
  { id: 'cottageCheese', emoji: '🥣', imageSrc: '/dairy/cottage-cheese.webp', category: 'muscleBuilding', nutrients: { protein: 8 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 0.5 }, headline: { kind: 'protein', amount: 11, unit: 'g' } },
  { id: 'milk', emoji: '🥛', imageSrc: '/dairy/milk.webp', category: 'muscleBuilding', nutrients: { protein: 5, vitamins: 4, carbs: 3 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 0.45 }, headline: { kind: 'protein', amount: 3.3, unit: 'g' } },
  { id: 'yellowCheese', emoji: '🧀', imageSrc: '/dairy/yellow-cheese.webp', category: 'muscleBuilding', nutrients: { protein: 8, fats: 8 }, topMicronutrient: { nutrient: 'calcium', amount: 700 }, headline: { kind: 'protein', amount: 25, unit: 'g' } },
  { id: 'feta', emoji: '🧀', imageSrc: '/dairy/feta.webp', category: 'muscleBuilding', nutrients: { protein: 6, fats: 7 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 1.69 }, headline: { kind: 'protein', amount: 14, unit: 'g' } },
  { id: 'labneh', emoji: '🥣', imageSrc: '/dairy/labneh.webp', category: 'muscleBuilding', nutrients: { protein: 5, fats: 5 }, topMicronutrient: { nutrient: 'calcium', amount: 150 }, headline: { kind: 'protein', amount: 6, unit: 'g' } },
  { id: 'peanutButter', emoji: '🥜', imageSrc: '/seeds/peanut-butter.webp', category: 'muscleBuilding', nutrients: { fats: 9, protein: 8 }, topMicronutrient: { nutrient: 'vitaminB3', amount: 13.1 }, headline: { kind: 'protein', amount: 22, unit: 'g' } },

  // Energy — carbs that give steady energy through the day.
  { id: 'oats', emoji: '🥣', imageSrc: '/grains/oats.webp', category: 'energy', nutrients: { carbs: 9, protein: 4 }, topMicronutrient: { nutrient: 'manganese', amount: 4.9 }, headline: { kind: 'carbs', amount: 66, unit: 'g' } },
  { id: 'sweetPotato', emoji: '🍠', imageSrc: '/veggies/sweet-potato.webp', category: 'energy', nutrients: { carbs: 8, vitamins: 9 }, topMicronutrient: { nutrient: 'vitaminA', amount: 709 }, headline: { kind: 'vitaminA', amount: 709, unit: 'mcg' } },
  { id: 'potato', emoji: '🥔', imageSrc: '/veggies/potato.webp', category: 'energy', nutrients: { carbs: 7, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminB6', amount: 0.31 }, headline: { kind: 'carbs', amount: 21, unit: 'g' } },
  { id: 'corn', emoji: '🌽', imageSrc: '/veggies/corn.webp', category: 'energy', nutrients: { carbs: 7, vitamins: 3, protein: 2 }, topMicronutrient: { nutrient: 'vitaminB5', amount: 0.72 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'chia', emoji: '⚫', imageSrc: '/seeds/chia.webp', category: 'energy', nutrients: { fats: 7, protein: 5, carbs: 4 }, topMicronutrient: { nutrient: 'manganese', amount: 2.7 }, headline: { kind: 'fats', amount: 31, unit: 'g' } },
  { id: 'banana', emoji: '🍌', imageSrc: '/fruits/banana.webp', category: 'energy', nutrients: { carbs: 7, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminB6', amount: 0.37 }, headline: { kind: 'carbs', amount: 23, unit: 'g' } },
  { id: 'apple', emoji: '🍎', imageSrc: '/fruits/apple.webp', category: 'energy', nutrients: { carbs: 5, vitamins: 3 }, topMicronutrient: { nutrient: 'vitaminC', amount: 4.6 }, headline: { kind: 'carbs', amount: 14, unit: 'g' } },
  { id: 'mango', emoji: '🥭', imageSrc: '/fruits/mango.webp', category: 'energy', nutrients: { carbs: 6, vitamins: 8 }, topMicronutrient: { nutrient: 'vitaminC', amount: 36.4 }, headline: { kind: 'vitaminC', amount: 36, unit: 'mg' } },
  { id: 'peach', emoji: '🍑', imageSrc: '/fruits/peach.webp', category: 'energy', nutrients: { carbs: 5, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 6.6 }, headline: { kind: 'carbs', amount: 10, unit: 'g' } },
  { id: 'cherries', emoji: '🍒', imageSrc: '/fruits/cherries.webp', category: 'energy', nutrients: { carbs: 5, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 7 }, headline: { kind: 'carbs', amount: 16, unit: 'g' } },
  { id: 'plum', emoji: '🟣', imageSrc: '/fruits/plum.webp', category: 'energy', nutrients: { carbs: 5, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 9.5 }, headline: { kind: 'carbs', amount: 11, unit: 'g' } },
  { id: 'persimmon', emoji: '🟠', imageSrc: '/fruits/persimmon.webp', category: 'energy', nutrients: { carbs: 6, vitamins: 6 }, topMicronutrient: { nutrient: 'manganese', amount: 0.36 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'fig', emoji: '🟣', imageSrc: '/fruits/fig.webp', category: 'energy', nutrients: { carbs: 6, vitamins: 3 }, topMicronutrient: { nutrient: 'copper', amount: 0.07 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'coconut', emoji: '🥥', imageSrc: '/fruits/coconut.webp', category: 'energy', nutrients: { fats: 8, carbs: 4 }, topMicronutrient: { nutrient: 'manganese', amount: 1.5 }, headline: { kind: 'fats', amount: 33, unit: 'g' } },
  { id: 'pasta', emoji: '🍝', imageSrc: '/dishes/pasta.webp', category: 'energy', nutrients: { carbs: 8, protein: 3 }, topMicronutrient: { nutrient: 'selenium', amount: 26.4 }, headline: { kind: 'carbs', amount: 31, unit: 'g' } },
  { id: 'sushi', emoji: '🍣', imageSrc: '/dishes/sushi.webp', category: 'energy', nutrients: { carbs: 7, protein: 2 }, topMicronutrient: { nutrient: 'manganese', amount: 0.38 }, headline: { kind: 'carbs', amount: 28, unit: 'g' } },
  { id: 'whiteRice', emoji: '🍚', imageSrc: '/grains/white-rice.webp', category: 'energy', nutrients: { carbs: 7 }, topMicronutrient: { nutrient: 'manganese', amount: 0.47 }, headline: { kind: 'carbs', amount: 28, unit: 'g' } },
  { id: 'brownRice', emoji: '🍚', imageSrc: '/grains/brown-rice.webp', category: 'energy', nutrients: { carbs: 7, vitamins: 3 }, topMicronutrient: { nutrient: 'manganese', amount: 0.9 }, headline: { kind: 'carbs', amount: 23, unit: 'g' } },
  { id: 'bread', emoji: '🍞', imageSrc: '/grains/bread.webp', category: 'energy', nutrients: { carbs: 8, protein: 4 }, topMicronutrient: { nutrient: 'manganese', amount: 2 }, headline: { kind: 'carbs', amount: 43, unit: 'g' } },
  { id: 'pita', emoji: '🫓', imageSrc: '/grains/pita.webp', category: 'energy', nutrients: { carbs: 8, protein: 3 }, topMicronutrient: { nutrient: 'vitaminB1', amount: 0.6 }, headline: { kind: 'carbs', amount: 56, unit: 'g' } },
  { id: 'couscous', emoji: '🥣', imageSrc: '/grains/couscous.webp', category: 'energy', nutrients: { carbs: 7, protein: 3 }, topMicronutrient: { nutrient: 'selenium', amount: 27.5 }, headline: { kind: 'carbs', amount: 23, unit: 'g' } },
  { id: 'bulgur', emoji: '🌾', imageSrc: '/grains/bulgur.webp', category: 'energy', nutrients: { carbs: 6, vitamins: 2 }, topMicronutrient: { nutrient: 'manganese', amount: 0.61 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'granola', emoji: '🥣', imageSrc: '/grains/granola.webp', category: 'energy', nutrients: { carbs: 8, fats: 5, protein: 4 }, topMicronutrient: { nutrient: 'manganese', amount: 2.9 }, headline: { kind: 'carbs', amount: 60, unit: 'g' } },
  { id: 'riceCakes', emoji: '🍘', imageSrc: '/grains/rice-cakes.webp', category: 'energy', nutrients: { carbs: 8 }, topMicronutrient: { nutrient: 'magnesium', amount: 131 }, headline: { kind: 'carbs', amount: 82, unit: 'g' } },
  { id: 'smoothie', emoji: '🥤', imageSrc: '/drinks/smoothie.webp', category: 'energy', nutrients: { carbs: 5, vitamins: 5 }, topMicronutrient: { nutrient: 'vitaminC', amount: 20 }, headline: { kind: 'carbs', amount: 14, unit: 'g' } },

  // Recovery — antioxidants, vitamins and good fats for the immune system, bones and heart.
  { id: 'spinach', emoji: '🥬', imageSrc: '/veggies/spinach.webp', category: 'recovery', nutrients: { vitamins: 10, protein: 2 }, topMicronutrient: { nutrient: 'vitaminK', amount: 483 }, headline: { kind: 'vitaminA', amount: 469, unit: 'mcg' } },
  { id: 'broccoli', emoji: '🥦', imageSrc: '/veggies/broccoli.webp', category: 'recovery', nutrients: { vitamins: 10, protein: 3 }, topMicronutrient: { nutrient: 'vitaminC', amount: 89 }, headline: { kind: 'vitaminC', amount: 89, unit: 'mg' } },
  { id: 'bellPepper', emoji: '🫑', imageSrc: '/veggies/bell-pepper.webp', category: 'recovery', nutrients: { vitamins: 9, carbs: 3 }, topMicronutrient: { nutrient: 'vitaminC', amount: 128 }, headline: { kind: 'vitaminC', amount: 128, unit: 'mg' } },
  { id: 'blueberry', emoji: '🫐', imageSrc: '/fruits/blueberry.webp', category: 'recovery', nutrients: { vitamins: 7, carbs: 5 }, topMicronutrient: { nutrient: 'vitaminK', amount: 19 }, headline: { kind: 'vitaminC', amount: 10, unit: 'mg' } },
  { id: 'avocado', emoji: '🥑', imageSrc: '/fruits/avocado.webp', category: 'recovery', nutrients: { fats: 9, vitamins: 6, carbs: 2 }, topMicronutrient: { nutrient: 'vitaminB5', amount: 1.39 }, headline: { kind: 'fats', amount: 15, unit: 'g' } },
  { id: 'walnuts', emoji: '🌰', imageSrc: '/seeds/walnuts.webp', category: 'recovery', nutrients: { fats: 9, protein: 4 }, topMicronutrient: { nutrient: 'copper', amount: 1.59 }, headline: { kind: 'fats', amount: 65, unit: 'g' } },
  { id: 'pumpkin', emoji: '🎃', imageSrc: '/veggies/pumpkin.webp', category: 'recovery', nutrients: { vitamins: 8, carbs: 3 }, topMicronutrient: { nutrient: 'vitaminA', amount: 426 }, headline: { kind: 'vitaminA', amount: 426, unit: 'mcg' } },
  { id: 'ginger', emoji: '🫚', imageSrc: '/veggies/ginger.webp', category: 'recovery', nutrients: { carbs: 3, vitamins: 2 }, topMicronutrient: { nutrient: 'copper', amount: 0.23 }, headline: { kind: 'carbs', amount: 18, unit: 'g' } },
  { id: 'onion', emoji: '🧅', imageSrc: '/veggies/onion.webp', category: 'recovery', nutrients: { vitamins: 3, carbs: 2 }, topMicronutrient: { nutrient: 'vitaminC', amount: 7.4 }, headline: { kind: 'vitaminC', amount: 7.4, unit: 'mg' } },
  { id: 'kiwi', emoji: '🥝', imageSrc: '/fruits/kiwi.webp', category: 'recovery', nutrients: { vitamins: 10, carbs: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 92.7 }, headline: { kind: 'vitaminC', amount: 93, unit: 'mg' } },
  { id: 'pomegranate', emoji: '🔴', imageSrc: '/fruits/pomegranate.webp', category: 'recovery', nutrients: { vitamins: 7, carbs: 5 }, topMicronutrient: { nutrient: 'copper', amount: 0.16 }, headline: { kind: 'vitaminC', amount: 10, unit: 'mg' } },
  { id: 'cauliflower', emoji: '🥦', imageSrc: '/veggies/cauliflower.webp', category: 'recovery', nutrients: { vitamins: 8, carbs: 2 }, topMicronutrient: { nutrient: 'vitaminC', amount: 48.2 }, headline: { kind: 'vitaminC', amount: 48, unit: 'mg' } },
  { id: 'asparagus', emoji: '🌱', imageSrc: '/veggies/asparagus.webp', category: 'recovery', nutrients: { vitamins: 8, protein: 2 }, topMicronutrient: { nutrient: 'vitaminK', amount: 50.6 }, headline: { kind: 'protein', amount: 2.4, unit: 'g' } },
  { id: 'mushroom', emoji: '🍄', imageSrc: '/veggies/mushroom.webp', category: 'recovery', nutrients: { vitamins: 6, protein: 3 }, topMicronutrient: { nutrient: 'copper', amount: 0.32 }, headline: { kind: 'protein', amount: 3.1, unit: 'g' } },
  { id: 'radish', emoji: '🔴', imageSrc: '/veggies/radish.webp', category: 'recovery', nutrients: { vitamins: 4, carbs: 1 }, topMicronutrient: { nutrient: 'vitaminC', amount: 14.8 }, headline: { kind: 'vitaminC', amount: 15, unit: 'mg' } },
  { id: 'apricot', emoji: '🍑', imageSrc: '/fruits/apricot.webp', category: 'recovery', nutrients: { vitamins: 6, carbs: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 10 }, headline: { kind: 'vitaminA', amount: 96, unit: 'mcg' } },
  { id: 'papaya', emoji: '🧡', imageSrc: '/fruits/papaya.webp', category: 'recovery', nutrients: { vitamins: 9, carbs: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 60.9 }, headline: { kind: 'vitaminC', amount: 61, unit: 'mg' } },
  { id: 'melon', emoji: '🍈', imageSrc: '/fruits/melon.webp', category: 'recovery', nutrients: { vitamins: 8, carbs: 3 }, topMicronutrient: { nutrient: 'vitaminC', amount: 36.7 }, headline: { kind: 'vitaminA', amount: 169, unit: 'mcg' } },
  { id: 'lychee', emoji: '🔴', imageSrc: '/fruits/lychee.webp', category: 'recovery', nutrients: { vitamins: 9, carbs: 5 }, topMicronutrient: { nutrient: 'vitaminC', amount: 71.5 }, headline: { kind: 'vitaminC', amount: 72, unit: 'mg' } },
  { id: 'olives', emoji: '🫒', imageSrc: '/fruits/olives.webp', category: 'recovery', nutrients: { fats: 8, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminE', amount: 3.8 }, headline: { kind: 'fats', amount: 15, unit: 'g' } },
  { id: 'nori', emoji: '🟩', imageSrc: '/veggies/nori.webp', category: 'recovery', nutrients: { vitamins: 7, protein: 2 }, topMicronutrient: { nutrient: 'vitaminC', amount: 39 }, headline: { kind: 'vitaminC', amount: 39, unit: 'mg' } },
  { id: 'vegetableSoup', emoji: '🍲', imageSrc: '/dishes/vegetable-soup.webp', category: 'recovery', nutrients: { vitamins: 7, carbs: 3 }, topMicronutrient: { nutrient: 'vitaminA', amount: 120 }, headline: { kind: 'vitaminA', amount: 120, unit: 'mcg' } },
  { id: 'liver', emoji: '🟤', imageSrc: '/proteins/liver.webp', category: 'recovery', nutrients: { vitamins: 10, protein: 8 }, topMicronutrient: { nutrient: 'vitaminA', amount: 3981 }, headline: { kind: 'vitaminA', amount: 3981, unit: 'mcg' } },
  { id: 'sunflowerSeeds', emoji: '🌻', imageSrc: '/seeds/sunflower-seeds.webp', category: 'recovery', nutrients: { fats: 8, protein: 6, vitamins: 8 }, topMicronutrient: { nutrient: 'vitaminE', amount: 26 }, headline: { kind: 'fats', amount: 50, unit: 'g' } },
  { id: 'hazelnuts', emoji: '🌰', imageSrc: '/seeds/hazelnuts.webp', category: 'recovery', nutrients: { fats: 9, protein: 5, vitamins: 6 }, topMicronutrient: { nutrient: 'manganese', amount: 6.2 }, headline: { kind: 'fats', amount: 61, unit: 'g' } },
  { id: 'flaxSeeds', emoji: '🟤', imageSrc: '/seeds/flax-seeds.webp', category: 'recovery', nutrients: { fats: 8, protein: 5, carbs: 3 }, topMicronutrient: { nutrient: 'vitaminB1', amount: 1.64 }, headline: { kind: 'fats', amount: 42, unit: 'g' } },
  { id: 'tahini', emoji: '🥣', imageSrc: '/seeds/tahini.webp', category: 'recovery', nutrients: { fats: 9, protein: 6, vitamins: 5 }, topMicronutrient: { nutrient: 'copper', amount: 1.61 }, headline: { kind: 'fats', amount: 54, unit: 'g' } },

  // Hydration — drinks, for the water your body needs through the day.
  { id: 'water', emoji: '💧', imageSrc: '/drinks/water.webp', category: 'hydration', nutrients: {}, topMicronutrient: { nutrient: 'calcium', amount: 3 }, headline: { kind: 'carbs', amount: 0, unit: 'g' } },
  { id: 'tea', emoji: '🍵', imageSrc: '/drinks/tea.webp', category: 'hydration', nutrients: {}, topMicronutrient: { nutrient: 'manganese', amount: 0.22 }, headline: { kind: 'carbs', amount: 0, unit: 'g' } },
  { id: 'coffee', emoji: '☕', imageSrc: '/drinks/coffee.webp', category: 'hydration', nutrients: {}, topMicronutrient: { nutrient: 'vitaminB2', amount: 0.08 }, headline: { kind: 'carbs', amount: 0, unit: 'g' } },
  { id: 'coconutWater', emoji: '🥥', imageSrc: '/drinks/coconut-water.webp', category: 'hydration', nutrients: { carbs: 2, vitamins: 2 }, topMicronutrient: { nutrient: 'potassium', amount: 250 }, headline: { kind: 'carbs', amount: 3.7, unit: 'g' } },
  { id: 'orangeJuice', emoji: '🧃', imageSrc: '/drinks/orange-juice.webp', category: 'hydration', nutrients: { vitamins: 7, carbs: 5 }, topMicronutrient: { nutrient: 'vitaminC', amount: 50 }, headline: { kind: 'vitaminC', amount: 50, unit: 'mg' } },

  // Treats — honest cards for the junk food people eat anyway, so they know what it does to them.
  { id: 'hamburger', emoji: '🍔', imageSrc: '/treats/hamburger.webp', category: 'treat', nutrients: { fats: 5, carbs: 4, protein: 3 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 1 }, headline: { kind: 'fats', amount: 12, unit: 'g' } },
  { id: 'pizza', emoji: '🍕', imageSrc: '/treats/pizza.webp', category: 'treat', nutrients: { carbs: 5, fats: 4, protein: 3 }, topMicronutrient: { nutrient: 'selenium', amount: 25.6 }, headline: { kind: 'carbs', amount: 33, unit: 'g' } },
  { id: 'fries', emoji: '🍟', imageSrc: '/treats/fries.webp', category: 'treat', nutrients: { carbs: 5, fats: 5 }, topMicronutrient: { nutrient: 'vitaminB6', amount: 0.37 }, headline: { kind: 'carbs', amount: 41, unit: 'g' } },
  { id: 'donut', emoji: '🍩', imageSrc: '/treats/donut.webp', category: 'treat', nutrients: { carbs: 5, fats: 5 }, topMicronutrient: { nutrient: 'vitaminB1', amount: 0.32 }, headline: { kind: 'carbs', amount: 51, unit: 'g' } },
  { id: 'croissant', emoji: '🥐', imageSrc: '/treats/croissant.webp', category: 'treat', nutrients: { carbs: 4, fats: 5 }, topMicronutrient: { nutrient: 'vitaminB1', amount: 0.39 }, headline: { kind: 'fats', amount: 21, unit: 'g' } },
  { id: 'cookie', emoji: '🍪', imageSrc: '/treats/cookie.webp', category: 'treat', nutrients: { carbs: 5, fats: 5 }, topMicronutrient: { nutrient: 'vitaminB1', amount: 0.26 }, headline: { kind: 'carbs', amount: 64, unit: 'g' } },
  { id: 'cake', emoji: '🍰', imageSrc: '/treats/cake.webp', category: 'treat', nutrients: { carbs: 5, fats: 5 }, topMicronutrient: { nutrient: 'copper', amount: 0.33 }, headline: { kind: 'carbs', amount: 55, unit: 'g' } },
  { id: 'cupcake', emoji: '🧁', imageSrc: '/treats/cupcake.webp', category: 'treat', nutrients: { carbs: 5, fats: 5 }, topMicronutrient: { nutrient: 'vitaminB2', amount: 0.17 }, headline: { kind: 'carbs', amount: 58, unit: 'g' } },
  { id: 'chocolate', emoji: '🍫', imageSrc: '/treats/chocolate.webp', category: 'treat', nutrients: { carbs: 5, fats: 5 }, topMicronutrient: { nutrient: 'copper', amount: 0.49 }, headline: { kind: 'carbs', amount: 59, unit: 'g' } },
  { id: 'iceCream', emoji: '🍦', imageSrc: '/treats/ice-cream.webp', category: 'treat', nutrients: { carbs: 5, fats: 4 }, topMicronutrient: { nutrient: 'vitaminB2', amount: 0.24 }, headline: { kind: 'carbs', amount: 24, unit: 'g' } },
  { id: 'gummies', emoji: '🐻', imageSrc: '/treats/gummies.webp', category: 'treat', nutrients: { carbs: 6 }, topMicronutrient: { nutrient: 'iron', amount: 0.4 }, headline: { kind: 'carbs', amount: 77, unit: 'g' } },
  { id: 'lollipop', emoji: '🍭', imageSrc: '/treats/lollipop.webp', category: 'treat', nutrients: { carbs: 6 }, topMicronutrient: { nutrient: 'iron', amount: 0.3 }, headline: { kind: 'carbs', amount: 98, unit: 'g' } },
  { id: 'pretzel', emoji: '🥨', imageSrc: '/treats/pretzel.webp', category: 'treat', nutrients: { carbs: 7, protein: 2 }, topMicronutrient: { nutrient: 'vitaminB1', amount: 0.41 }, headline: { kind: 'carbs', amount: 69, unit: 'g' } },
  { id: 'muffin', emoji: '🧁', imageSrc: '/treats/muffin.webp', category: 'treat', nutrients: { carbs: 5, fats: 5 }, topMicronutrient: { nutrient: 'copper', amount: 0.3 }, headline: { kind: 'carbs', amount: 52, unit: 'g' } },
  { id: 'nuggets', emoji: '🍗', imageSrc: '/treats/nuggets.webp', category: 'treat', nutrients: { fats: 5, protein: 4, carbs: 4 }, topMicronutrient: { nutrient: 'vitaminB3', amount: 6 }, headline: { kind: 'fats', amount: 18, unit: 'g' } },
  { id: 'hotDog', emoji: '🌭', imageSrc: '/treats/hot-dog.webp', category: 'treat', nutrients: { fats: 5, carbs: 4, protein: 3 }, topMicronutrient: { nutrient: 'vitaminB12', amount: 0.6 }, headline: { kind: 'fats', amount: 15, unit: 'g' } },
  { id: 'burekas', emoji: '🥟', imageSrc: '/treats/burekas.webp', category: 'treat', nutrients: { carbs: 5, fats: 6, protein: 2 }, topMicronutrient: { nutrient: 'vitaminB1', amount: 0.3 }, headline: { kind: 'fats', amount: 22, unit: 'g' } },
  { id: 'waffle', emoji: '🧇', imageSrc: '/treats/waffle.webp', category: 'treat', nutrients: { carbs: 5, fats: 4 }, topMicronutrient: { nutrient: 'iron', amount: 2.5 }, headline: { kind: 'carbs', amount: 41, unit: 'g' } },
  { id: 'chips', emoji: '🥔', imageSrc: '/treats/chips.webp', category: 'treat', nutrients: { carbs: 5, fats: 6 }, topMicronutrient: { nutrient: 'vitaminB6', amount: 0.36 }, headline: { kind: 'fats', amount: 34, unit: 'g' } },
  { id: 'popcorn', emoji: '🍿', imageSrc: '/treats/popcorn.webp', category: 'treat', nutrients: { carbs: 5, fats: 5 }, topMicronutrient: { nutrient: 'manganese', amount: 0.8 }, headline: { kind: 'carbs', amount: 58, unit: 'g' } },
  { id: 'cola', emoji: '🥤', imageSrc: '/drinks/cola.webp', category: 'treat', nutrients: { carbs: 5 }, topMicronutrient: { nutrient: 'phosphorus', amount: 10 }, headline: { kind: 'carbs', amount: 11, unit: 'g' } },
  { id: 'energyDrink', emoji: '⚡', imageSrc: '/drinks/energy-drink.webp', category: 'treat', nutrients: { carbs: 5 }, topMicronutrient: { nutrient: 'vitaminB3', amount: 8 }, headline: { kind: 'carbs', amount: 11, unit: 'g' } },
]

/** Same superfood for everyone on a given calendar day, rotating deterministically —
 *  no server state needed. Treats are never featured. */
export function superfoodOfTheDay(dateKey: string): SuperfoodDef {
  const pool = SUPERFOODS.filter((food) => food.category !== 'treat')
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  return pool[hash % pool.length]
}

/** Lowercased, punctuation-free, with a trailing English/Hebrew plural ending dropped — so
 *  "Strawberries" ~ "strawberry" and "תותים" ~ "תות". */
function normalizeFoodName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ies$/, 'y')
    .replace(/(o|ch|sh)es$/, '$1')
    .replace(/(s|ים|ות)$/u, '')
}

const SUPERFOOD_BY_NAME: Map<string, SuperfoodDef> = (() => {
  const map = new Map<string, SuperfoodDef>()
  for (const food of SUPERFOODS) {
    for (const content of Object.values(SUPERFOOD_CONTENT)) {
      const name = content[food.id]?.name
      if (name) map.set(normalizeFoodName(name), food)
    }
  }
  return map
})()

/** The card food a scanned item is, if any. Trusts the AI's `cardId` first; otherwise only an exact
 *  name match (in any app language) counts, so "banana bread" never borrows the banana photo. */
export function matchSuperfood(food: IdentifiedFood): SuperfoodDef | null {
  if (food.cardId) {
    const byId = SUPERFOODS.find((s) => s.id === food.cardId)
    if (byId) return byId
  }
  return SUPERFOOD_BY_NAME.get(normalizeFoodName(food.name)) ?? null
}

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
  // Muscle building — plant protein that helps keep muscles strong.
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

  // Energy — carbs that give steady energy through the day.
  { id: 'oats', emoji: '🥣', imageSrc: '/grains/oats.webp', category: 'energy', nutrients: { carbs: 9, protein: 4 }, topMicronutrient: { nutrient: 'manganese', amount: 4.9 }, headline: { kind: 'carbs', amount: 66, unit: 'g' } },
  { id: 'sweetPotato', emoji: '🍠', imageSrc: '/veggies/sweet-potato.webp', category: 'energy', nutrients: { carbs: 8, vitamins: 9 }, topMicronutrient: { nutrient: 'vitaminA', amount: 709 }, headline: { kind: 'vitaminA', amount: 709, unit: 'mcg' } },
  { id: 'potato', emoji: '🥔', imageSrc: '/veggies/potato.webp', category: 'energy', nutrients: { carbs: 7, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminB6', amount: 0.31 }, headline: { kind: 'carbs', amount: 21, unit: 'g' } },
  { id: 'corn', emoji: '🌽', imageSrc: '/veggies/corn.webp', category: 'energy', nutrients: { carbs: 7, vitamins: 3, protein: 2 }, topMicronutrient: { nutrient: 'vitaminB5', amount: 0.72 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'chia', emoji: '⚫', imageSrc: '/seeds/chia.webp', category: 'energy', nutrients: { fats: 7, protein: 5, carbs: 4 }, topMicronutrient: { nutrient: 'manganese', amount: 2.7 }, headline: { kind: 'fats', amount: 31, unit: 'g' } },
  { id: 'mango', emoji: '🥭', imageSrc: '/fruits/mango.webp', category: 'energy', nutrients: { carbs: 6, vitamins: 8 }, topMicronutrient: { nutrient: 'vitaminC', amount: 36.4 }, headline: { kind: 'vitaminC', amount: 36, unit: 'mg' } },
  { id: 'peach', emoji: '🍑', imageSrc: '/fruits/peach.webp', category: 'energy', nutrients: { carbs: 5, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 6.6 }, headline: { kind: 'carbs', amount: 10, unit: 'g' } },
  { id: 'cherries', emoji: '🍒', imageSrc: '/fruits/cherries.webp', category: 'energy', nutrients: { carbs: 5, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 7 }, headline: { kind: 'carbs', amount: 16, unit: 'g' } },
  { id: 'plum', emoji: '🟣', imageSrc: '/fruits/plum.webp', category: 'energy', nutrients: { carbs: 5, vitamins: 4 }, topMicronutrient: { nutrient: 'vitaminC', amount: 9.5 }, headline: { kind: 'carbs', amount: 11, unit: 'g' } },
  { id: 'persimmon', emoji: '🟠', imageSrc: '/fruits/persimmon.webp', category: 'energy', nutrients: { carbs: 6, vitamins: 6 }, topMicronutrient: { nutrient: 'manganese', amount: 0.36 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'fig', emoji: '🟣', imageSrc: '/fruits/fig.webp', category: 'energy', nutrients: { carbs: 6, vitamins: 3 }, topMicronutrient: { nutrient: 'copper', amount: 0.07 }, headline: { kind: 'carbs', amount: 19, unit: 'g' } },
  { id: 'coconut', emoji: '🥥', imageSrc: '/fruits/coconut.webp', category: 'energy', nutrients: { fats: 8, carbs: 4 }, topMicronutrient: { nutrient: 'manganese', amount: 1.5 }, headline: { kind: 'fats', amount: 33, unit: 'g' } },

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

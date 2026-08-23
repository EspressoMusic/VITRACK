import type { NutrientAmounts, NutrientId } from '../types'

export interface NutrientDef {
  id: NutrientId
  name: string
  shortLabel: string
  unit: string
  /** General adult recommended daily allowance, used as the 100% target. */
  rda: number
  /** Natural, whole-food sources rich in this nutrient. */
  foodSources: string[]
  /** Short, plain-language explanation of why this nutrient matters for the body. */
  benefit: string
  /** One of the handful of highest-impact nutrients shown by default outside advanced mode. */
  core?: boolean
}

export const NUTRIENTS: NutrientDef[] = [
  {
    id: 'vitaminA',
    name: 'Vitamin A',
    shortLabel: 'Vit A',
    unit: 'mcg',
    rda: 900,
    foodSources: [
      'Carrots', 'Sweet potatoes', 'Spinach', 'Kale', 'Eggs', 'Mango',
      'Butternut squash', 'Cantaloupe', 'Apricots', 'Red bell peppers', 'Liver', 'Butter',
    ],
    benefit: 'Supports healthy vision, immune defense, and skin repair.',
    core: true,
  },
  {
    id: 'vitaminC',
    name: 'Vitamin C',
    shortLabel: 'Vit C',
    unit: 'mg',
    rda: 90,
    foodSources: [
      'Oranges', 'Bell peppers', 'Strawberries', 'Broccoli', 'Kiwi',
      'Brussels sprouts', 'Grapefruit', 'Papaya', 'Pineapple', 'Tomatoes', 'Cauliflower', 'Guava',
    ],
    benefit: 'Boosts immune function and helps your body absorb iron and repair tissue.',
    core: true,
  },
  {
    id: 'vitaminD',
    name: 'Vitamin D',
    shortLabel: 'Vit D',
    unit: 'mcg',
    rda: 20,
    foodSources: [
      'Sunlight exposure', 'Salmon', 'Mackerel', 'Egg yolks', 'Mushrooms',
      'Sardines', 'Tuna', 'Fortified milk', 'Fortified orange juice', 'Cod liver oil', 'Fortified cereal',
    ],
    benefit: 'Helps your body absorb calcium for strong bones and supports immune health.',
    core: true,
  },
  {
    id: 'vitaminE',
    name: 'Vitamin E',
    shortLabel: 'Vit E',
    unit: 'mg',
    rda: 15,
    foodSources: [
      'Almonds', 'Sunflower seeds', 'Spinach', 'Avocado',
      'Hazelnuts', 'Peanut butter', 'Olive oil', 'Butternut squash', 'Kiwi', 'Broccoli',
    ],
    benefit: 'An antioxidant that protects your cells from damage and supports immune function.',
  },
  {
    id: 'vitaminK',
    name: 'Vitamin K',
    shortLabel: 'Vit K',
    unit: 'mcg',
    rda: 120,
    foodSources: [
      'Kale', 'Spinach', 'Broccoli', 'Brussels sprouts',
      'Cabbage', 'Asparagus', 'Green beans', 'Lettuce', 'Parsley', 'Olive oil',
    ],
    benefit: 'Essential for normal blood clotting and helps keep bones strong.',
  },
  {
    id: 'vitaminB1',
    name: 'Vitamin B1',
    shortLabel: 'B1',
    unit: 'mg',
    rda: 1.2,
    foodSources: [
      'Whole grains', 'Pork', 'Legumes', 'Sunflower seeds',
      'Brown rice', 'Oats', 'Trout', 'Green peas', 'Flax seeds', 'Macadamia nuts',
    ],
    benefit: 'Helps convert food into energy and supports healthy nerve function.',
  },
  {
    id: 'vitaminB2',
    name: 'Vitamin B2',
    shortLabel: 'B2',
    unit: 'mg',
    rda: 1.3,
    foodSources: [
      'Eggs', 'Milk', 'Almonds', 'Leafy greens',
      'Yogurt', 'Mushrooms', 'Beef', 'Quinoa', 'Fortified cereal', 'Spinach',
    ],
    benefit: 'Helps your body produce energy and supports healthy skin and eyes.',
  },
  {
    id: 'vitaminB3',
    name: 'Vitamin B3',
    shortLabel: 'B3',
    unit: 'mg',
    rda: 16,
    foodSources: [
      'Chicken', 'Tuna', 'Peanuts', 'Whole grains',
      'Turkey', 'Salmon', 'Mushrooms', 'Brown rice', 'Avocado', 'Sunflower seeds',
    ],
    benefit: 'Supports energy metabolism and helps keep skin, nerves, and digestion healthy.',
  },
  {
    id: 'vitaminB5',
    name: 'Vitamin B5',
    shortLabel: 'B5',
    unit: 'mg',
    rda: 5,
    foodSources: [
      'Chicken', 'Beef', 'Mushrooms', 'Avocado', 'Sweet potatoes',
      'Broccoli', 'Eggs', 'Whole grains', 'Sunflower seeds', 'Lentils',
    ],
    benefit: 'Helps convert food into usable energy and supports hormone and cholesterol production.',
  },
  {
    id: 'vitaminB6',
    name: 'Vitamin B6',
    shortLabel: 'B6',
    unit: 'mg',
    rda: 1.7,
    foodSources: [
      'Chickpeas', 'Poultry', 'Potatoes', 'Bananas',
      'Salmon', 'Beef liver', 'Fortified cereal', 'Spinach', 'Sunflower seeds', 'Pistachios',
    ],
    benefit: 'Supports brain development, mood regulation, and a healthy immune system.',
    core: true,
  },
  {
    id: 'vitaminB7',
    name: 'Vitamin B7',
    shortLabel: 'B7',
    unit: 'mcg',
    rda: 30,
    foodSources: [
      'Eggs', 'Almonds', 'Salmon', 'Sweet potatoes', 'Spinach',
      'Liver', 'Avocado', 'Peanuts', 'Mushrooms', 'Broccoli',
    ],
    benefit: 'Supports healthy hair, skin, and nails, and helps your body metabolize fats and carbs.',
  },
  {
    id: 'vitaminB9',
    name: 'Vitamin B9',
    shortLabel: 'B9',
    unit: 'mcg',
    rda: 400,
    foodSources: [
      'Leafy greens', 'Beans', 'Lentils', 'Avocado',
      'Asparagus', 'Broccoli', 'Peanuts', 'Oranges', 'Fortified bread', 'Brussels sprouts',
    ],
    benefit: 'Important for cell growth and DNA production, especially during pregnancy.',
    core: true,
  },
  {
    id: 'vitaminB12',
    name: 'Vitamin B12',
    shortLabel: 'B12',
    unit: 'mcg',
    rda: 2.4,
    foodSources: [
      'Fish', 'Meat', 'Eggs', 'Dairy', 'Fortified cereal',
      'Clams', 'Salmon', 'Tuna', 'Beef liver', 'Yogurt', 'Nutritional yeast',
    ],
    benefit: 'Keeps nerve cells healthy and helps make red blood cells and DNA.',
    core: true,
  },
  {
    id: 'calcium',
    name: 'Calcium',
    shortLabel: 'Ca',
    unit: 'mg',
    rda: 1000,
    foodSources: [
      'Dairy', 'Tofu', 'Leafy greens', 'Almonds',
      'Yogurt', 'Cheese', 'Sardines', 'Fortified plant milk', 'Kale', 'Chia seeds',
    ],
    benefit: 'Builds and maintains strong bones and teeth, and supports muscle and nerve function.',
  },
  {
    id: 'iron',
    name: 'Iron',
    shortLabel: 'Fe',
    unit: 'mg',
    rda: 18,
    foodSources: [
      'Red meat', 'Lentils', 'Spinach', 'Pumpkin seeds',
      'Chickpeas', 'Tofu', 'Quinoa', 'Dark chocolate', 'Cashews', 'Beef liver',
    ],
    benefit: 'Helps red blood cells carry oxygen through the body and prevents fatigue.',
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    shortLabel: 'Mg',
    unit: 'mg',
    rda: 400,
    foodSources: [
      'Nuts', 'Seeds', 'Whole grains', 'Dark chocolate',
      'Spinach', 'Black beans', 'Avocado', 'Almonds', 'Cashews', 'Brown rice',
    ],
    benefit: 'Supports muscle and nerve function, energy production, and healthy bones.',
  },
  {
    id: 'zinc',
    name: 'Zinc',
    shortLabel: 'Zn',
    unit: 'mg',
    rda: 11,
    foodSources: [
      'Meat', 'Shellfish', 'Legumes', 'Seeds',
      'Oysters', 'Cashews', 'Chickpeas', 'Pumpkin seeds', 'Yogurt', 'Oats',
    ],
    benefit: 'Supports immune function, wound healing, and helps your body process nutrients.',
  },
  {
    id: 'potassium',
    name: 'Potassium',
    shortLabel: 'K',
    unit: 'mg',
    rda: 4700,
    foodSources: [
      'Bananas', 'Potatoes', 'Beans', 'Avocado',
      'Sweet potatoes', 'Spinach', 'Oranges', 'Coconut water', 'Salmon', 'Yogurt',
    ],
    benefit: 'Helps regulate fluid balance, muscle contractions, and a healthy heartbeat.',
  },
  {
    id: 'phosphorus',
    name: 'Phosphorus',
    shortLabel: 'P',
    unit: 'mg',
    rda: 700,
    foodSources: [
      'Dairy', 'Meat', 'Fish', 'Eggs', 'Lentils',
      'Nuts', 'Whole grains', 'Pumpkin seeds', 'Beans', 'Poultry',
    ],
    benefit: 'Works with calcium to build strong bones and teeth and helps cells produce energy.',
  },
  {
    id: 'copper',
    name: 'Copper',
    shortLabel: 'Cu',
    unit: 'mg',
    rda: 0.9,
    foodSources: [
      'Shellfish', 'Nuts', 'Seeds', 'Whole grains', 'Dark chocolate',
      'Organ meats', 'Mushrooms', 'Lentils', 'Potatoes', 'Leafy greens',
    ],
    benefit: 'Helps form red blood cells and connective tissue and supports iron absorption.',
  },
  {
    id: 'manganese',
    name: 'Manganese',
    shortLabel: 'Mn',
    unit: 'mg',
    rda: 2.3,
    foodSources: [
      'Whole grains', 'Nuts', 'Leafy greens', 'Tea', 'Pineapple',
      'Legumes', 'Brown rice', 'Oats', 'Chickpeas', 'Sweet potatoes',
    ],
    benefit: 'Supports bone formation and helps the body process cholesterol, carbs, and protein.',
  },
  {
    id: 'selenium',
    name: 'Selenium',
    shortLabel: 'Se',
    unit: 'mcg',
    rda: 55,
    foodSources: [
      'Brazil nuts', 'Tuna', 'Sardines', 'Eggs', 'Turkey',
      'Sunflower seeds', 'Mushrooms', 'Brown rice', 'Chicken', 'Spinach',
    ],
    benefit: 'An antioxidant that protects cells from damage and supports thyroid and immune function.',
  },
  {
    id: 'iodine',
    name: 'Iodine',
    shortLabel: 'I',
    unit: 'mcg',
    rda: 150,
    foodSources: [
      'Iodized salt', 'Seaweed', 'Cod', 'Dairy', 'Eggs',
      'Shrimp', 'Tuna', 'Prunes', 'Potatoes', 'Turkey',
    ],
    benefit: 'Essential for producing thyroid hormones that regulate metabolism and growth.',
  },
]

export const NUTRIENT_MAP: Record<NutrientId, NutrientDef> = Object.fromEntries(
  NUTRIENTS.map((n) => [n.id, n])
) as Record<NutrientId, NutrientDef>

export const EMPTY_NUTRIENTS: NutrientAmounts = Object.fromEntries(
  NUTRIENTS.map((n) => [n.id, 0])
) as NutrientAmounts

export function sumNutrients(entries: NutrientAmounts[]): NutrientAmounts {
  const total = { ...EMPTY_NUTRIENTS }
  for (const entry of entries) {
    for (const n of NUTRIENTS) {
      total[n.id] += entry[n.id] ?? 0
    }
  }
  return total
}

export type CoverageStatus = 'critical' | 'serious' | 'warning' | 'good'

export function coverageStatus(percent: number): CoverageStatus {
  if (percent < 40) return 'critical'
  if (percent < 70) return 'serious'
  if (percent < 90) return 'warning'
  return 'good'
}

export const STATUS_LABEL: Record<CoverageStatus, string> = {
  critical: 'Very low',
  serious: 'Low',
  warning: 'Slightly low',
  good: 'On track',
}

/** Generic adult RDA, used until the user has completed onboarding with personalized goals. */
export const DEFAULT_GOALS: NutrientAmounts = Object.fromEntries(
  NUTRIENTS.map((n) => [n.id, n.rda])
) as NutrientAmounts

let activeGoals: NutrientAmounts | null = null

/** Set by lib/profile.ts once the user's personalized daily targets are known. */
export function setActiveGoals(goals: NutrientAmounts | null): void {
  activeGoals = goals
}

export function targetFor(id: NutrientId): number {
  return activeGoals?.[id] ?? DEFAULT_GOALS[id]
}

export function percentOfRda(id: NutrientId, amount: number): number {
  const target = targetFor(id)
  if (target <= 0) return 0
  return Math.min(200, Math.round((amount / target) * 100))
}

/** A single meal is only a fraction of the day, so its nutrients are judged against a per-meal
 *  share of the daily target rather than the full day — otherwise every meal looks deficient. */
export const MEAL_TARGET_DIVISOR = 3

export function mealTargetFor(id: NutrientId): number {
  return targetFor(id) / MEAL_TARGET_DIVISOR
}

export function percentOfMealTarget(id: NutrientId, amount: number): number {
  const target = mealTargetFor(id)
  if (target <= 0) return 0
  return Math.min(200, Math.round((amount / target) * 100))
}

/** A single food is only one part of a meal, so it was never going to cover a meal's whole
 *  share on its own — judging it with the same critical/serious/red thresholds as a full meal
 *  or day total reads as alarming for what's actually a normal, healthy contribution. This
 *  scale stays in the green/amber range: any amount present is a positive contribution, never
 *  a "deficiency" to flag red. */
export function contributionStatus(percent: number): CoverageStatus {
  return percent >= 20 ? 'good' : 'warning'
}

/** The 6 vitamins with the strongest, most broadly-relevant effect on the body — shown by
 *  default so the app stays focused instead of overwhelming with all 23 nutrients. */
export const CORE_NUTRIENTS: NutrientDef[] = NUTRIENTS.filter((n) => n.core)

const ADVANCED_MODE_KEY = 'vitrack:advancedNutrients'

/** Advanced mode reveals every tracked vitamin/mineral instead of just the core set. */
export function isAdvancedMode(): boolean {
  return localStorage.getItem(ADVANCED_MODE_KEY) === 'true'
}

export function setAdvancedMode(enabled: boolean): void {
  localStorage.setItem(ADVANCED_MODE_KEY, enabled ? 'true' : 'false')
}

/** The nutrient list the UI should render right now — core-only unless advanced mode is on. */
export function getVisibleNutrients(): NutrientDef[] {
  return isAdvancedMode() ? NUTRIENTS : CORE_NUTRIENTS
}

/** Below this share of a meal's target, an amount reads as a trace rather than something
 *  worth surfacing — keeps a scanned food's nutrient list from being cluttered with near-zero
 *  values that don't help the user make any decision. */
export const MIN_MEAL_DISPLAY_PERCENT = 10

export function hasRespectableAmount(id: NutrientId, amount: number): boolean {
  return percentOfMealTarget(id, amount) >= MIN_MEAL_DISPLAY_PERCENT
}

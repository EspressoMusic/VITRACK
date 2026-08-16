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
  },
  {
    id: 'vitaminB1',
    name: 'Vitamin B1 (Thiamin)',
    shortLabel: 'B1',
    unit: 'mg',
    rda: 1.2,
    foodSources: [
      'Whole grains', 'Pork', 'Legumes', 'Sunflower seeds',
      'Brown rice', 'Oats', 'Trout', 'Green peas', 'Flax seeds', 'Macadamia nuts',
    ],
  },
  {
    id: 'vitaminB2',
    name: 'Vitamin B2 (Riboflavin)',
    shortLabel: 'B2',
    unit: 'mg',
    rda: 1.3,
    foodSources: [
      'Eggs', 'Milk', 'Almonds', 'Leafy greens',
      'Yogurt', 'Mushrooms', 'Beef', 'Quinoa', 'Fortified cereal', 'Spinach',
    ],
  },
  {
    id: 'vitaminB3',
    name: 'Vitamin B3 (Niacin)',
    shortLabel: 'B3',
    unit: 'mg',
    rda: 16,
    foodSources: [
      'Chicken', 'Tuna', 'Peanuts', 'Whole grains',
      'Turkey', 'Salmon', 'Mushrooms', 'Brown rice', 'Avocado', 'Sunflower seeds',
    ],
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
  },
  {
    id: 'vitaminB9',
    name: 'Vitamin B9 (Folate)',
    shortLabel: 'B9',
    unit: 'mcg',
    rda: 400,
    foodSources: [
      'Leafy greens', 'Beans', 'Lentils', 'Avocado',
      'Asparagus', 'Broccoli', 'Peanuts', 'Oranges', 'Fortified bread', 'Brussels sprouts',
    ],
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
  return (activeGoals ?? DEFAULT_GOALS)[id]
}

export function percentOfRda(id: NutrientId, amount: number): number {
  const target = targetFor(id)
  if (target <= 0) return 0
  return Math.min(200, Math.round((amount / target) * 100))
}

export type NutrientId =
  | 'vitaminA'
  | 'vitaminC'
  | 'vitaminD'
  | 'vitaminE'
  | 'vitaminK'
  | 'vitaminB1'
  | 'vitaminB2'
  | 'vitaminB3'
  | 'vitaminB5'
  | 'vitaminB6'
  | 'vitaminB7'
  | 'vitaminB9'
  | 'vitaminB12'
  | 'calcium'
  | 'iron'
  | 'magnesium'
  | 'zinc'
  | 'potassium'
  | 'phosphorus'
  | 'copper'
  | 'manganese'
  | 'selenium'
  | 'iodine'

export type NutrientAmounts = Record<NutrientId, number>

export interface IdentifiedFood {
  name: string
  portion: string
}

export interface MealEntry {
  id: string
  /** ISO date string, e.g. 2026-08-14 (local day the meal was logged) */
  date: string
  /** ISO timestamp of when the entry was created */
  createdAt: string
  imageDataUrl: string
  foods: IdentifiedFood[]
  nutrients: NutrientAmounts
  confidence: 'low' | 'medium' | 'high'
  analysisNote?: string
}

export type ThemeMode = 'light' | 'dark'

export type Sex = 'male' | 'female' | 'unspecified'

export type ActivityLevel = 'sedentary' | 'moderate' | 'active'

export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian'

export interface OnboardingProfile {
  age: number
  sex: Sex
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  diet: DietType
}

export type BillingPlan = 'monthly' | 'yearly'

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

export type MacroId = 'calories' | 'carbsG' | 'fatG' | 'proteinG'

export type MacroAmounts = Record<MacroId, number>

export interface MealEntry {
  id: string
  /** ISO date string, e.g. 2026-08-14 (local day the meal was logged) */
  date: string
  /** ISO timestamp of when the entry was created */
  createdAt: string
  imageDataUrl: string
  foods: IdentifiedFood[]
  nutrients: NutrientAmounts
  /** Calories + carbs/fat/protein for this meal. Absent on entries logged before this field existed. */
  macros?: MacroAmounts
  confidence: 'low' | 'medium' | 'high'
  analysisNote?: string
  /** AI-judged: ultra-processed/fried/sugary/refined. Drives the weekly-completion XP penalty. */
  isJunkFood?: boolean
}

export type ThemeMode = 'light' | 'dark'

export type Sex = 'male' | 'female' | 'unspecified'

export type ActivityLevel = 'sedentary' | 'moderate' | 'active'

export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian'

/** What the user is optimizing for — shifts the calorie target and protein/carb/fat split. */
export type WeightGoal = 'lose' | 'maintain' | 'gain'

export interface OnboardingProfile {
  age: number
  sex: Sex
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  diet: DietType
  goal: WeightGoal
}

export type BillingPlan = 'monthly' | 'yearly'

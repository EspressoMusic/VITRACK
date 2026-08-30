import type { ActivityLevel, MacroAmounts, NutrientAmounts, OnboardingProfile, WeightGoal } from '../types'
import { NUTRIENTS } from './nutrients'

/** Calorie adjustment off TDEE for each goal — a moderate, sustainable pace in either direction. */
const CALORIE_ADJUSTMENT: Record<WeightGoal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
}

/** Protein target in g/kg body weight — higher for both cutting and bulking, where preserving
 *  or building muscle matters most, per common sports-nutrition guidance (~0.8g/kg is only
 *  the sedentary-maintenance minimum). */
const PROTEIN_PER_KG: Record<WeightGoal, number> = {
  lose: 1.8,
  maintain: 1.4,
  gain: 1.8,
}

/** Fat as a share of total calories — kept steady across goals; protein is set directly by body
 *  weight above, and carbs absorb whatever calories are left over. */
const FAT_CALORIE_SHARE = 0.3

/** Standard activity-level multipliers (PAL) used with Mifflin-St Jeor to estimate daily energy use. */
const PAL: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  moderate: 1.55,
  active: 1.8,
}

function estimateTdee(profile: OnboardingProfile): number {
  const bmr =
    profile.sex === 'male'
      ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
      : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161
  return bmr * PAL[profile.activityLevel]
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function round0(n: number): number {
  return Math.round(n)
}

/**
 * Rough, non-medical estimate of daily nutrient targets from the onboarding questionnaire.
 * Loosely follows published sex/age RDA splits (NIH ODS) plus a few defensible adjustments:
 * energy-linked B-vitamins scale with estimated TDEE, iron is scaled up for
 * vegetarian/vegan diets (lower non-heme absorption), and magnesium blends the
 * age/sex baseline with a body-weight estimate. This is a wellness approximation,
 * not a clinical calculation.
 */
export function computeNutrientGoals(profile: OnboardingProfile): NutrientAmounts {
  if (profile.sex === 'unspecified') {
    const male = computeNutrientGoals({ ...profile, sex: 'male' })
    const female = computeNutrientGoals({ ...profile, sex: 'female' })
    const blended = {} as NutrientAmounts
    for (const n of NUTRIENTS) blended[n.id] = round1((male[n.id] + female[n.id]) / 2)
    return blended
  }

  const goals = {} as NutrientAmounts
  for (const n of NUTRIENTS) goals[n.id] = n.rda

  const female = profile.sex === 'female'
  const tdee = estimateTdee(profile)
  const energyFactor = Math.max(0.7, Math.min(1.6, tdee / 2000))

  goals.vitaminA = female ? 700 : 900
  goals.vitaminC = female ? 75 : 90
  goals.vitaminD = profile.age >= 71 ? 20 : 15
  goals.vitaminE = 15
  goals.vitaminK = female ? 90 : 120

  goals.vitaminB1 = round1((female ? 1.1 : 1.2) * energyFactor)
  goals.vitaminB2 = round1((female ? 1.1 : 1.3) * energyFactor)
  goals.vitaminB3 = round1((female ? 14 : 16) * energyFactor)
  goals.vitaminB6 = profile.age <= 50 ? 1.3 : female ? 1.5 : 1.7
  goals.vitaminB9 = 400
  goals.vitaminB12 = 2.4

  goals.calcium = profile.age >= 51 && female ? 1200 : profile.age >= 71 ? 1200 : 1000

  const ironBase = female && profile.age < 51 ? 18 : 8
  const vegetarianLike = profile.diet === 'vegetarian' || profile.diet === 'vegan'
  goals.iron = vegetarianLike ? round0(ironBase * 1.8) : ironBase

  const magnesiumBaseline = female ? (profile.age >= 31 ? 320 : 310) : profile.age >= 31 ? 420 : 400
  goals.magnesium = round0((magnesiumBaseline + profile.weightKg * 4.3) / 2)

  goals.zinc = female ? 8 : 11
  goals.potassium = female ? 2600 : 3400
  goals.manganese = female ? 1.8 : 2.3

  return goals
}

/**
 * Rough, non-medical daily calories/protein/carbs/fat targets from the onboarding questionnaire.
 * Calories start from estimated TDEE, shifted by the stated goal; protein is set directly from
 * body weight (most reliable driver of muscle preservation/growth), fat is a fixed share of
 * calories, and carbs take whatever calories remain. A wellness approximation, not a clinical plan.
 */
export function computeMacroGoals(profile: OnboardingProfile): MacroAmounts {
  // Pre-existing stored profiles predate the goal question, so default gracefully.
  const goal = profile.goal ?? 'maintain'
  const calories = Math.max(1200, round0(estimateTdee(profile) + CALORIE_ADJUSTMENT[goal]))
  const proteinG = round0(profile.weightKg * PROTEIN_PER_KG[goal])
  const fatG = round0((calories * FAT_CALORIE_SHARE) / 9)
  const proteinCalories = proteinG * 4
  const fatCalories = fatG * 9
  const carbsG = Math.max(0, round0((calories - proteinCalories - fatCalories) / 4))

  return { calories, carbsG, fatG, proteinG }
}

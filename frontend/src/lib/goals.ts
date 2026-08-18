import type { ActivityLevel, NutrientAmounts, OnboardingProfile } from '../types'
import { NUTRIENTS } from './nutrients'

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

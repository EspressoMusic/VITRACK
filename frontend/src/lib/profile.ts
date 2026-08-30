import type { BillingPlan, NutrientAmounts, OnboardingProfile } from '../types'
import { computeMacroGoals, computeNutrientGoals } from './goals'
import { setActiveGoals } from './nutrients'
import { setActiveMacroGoals } from './macros'

const PROFILE_KEY = 'vitrack:profile'
const GOALS_KEY = 'vitrack:goals'
const ONBOARDED_KEY = 'vitrack:onboarded'
const SUBSCRIBED_KEY = 'vitrack:subscribed'
const PLAN_KEY = 'vitrack:plan'

export function hasOnboarded(): boolean {
  return localStorage.getItem(ONBOARDED_KEY) === 'true'
}

export function getStoredProfile(): OnboardingProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY)
  return raw ? (JSON.parse(raw) as OnboardingProfile) : null
}

export function getStoredGoals(): NutrientAmounts | null {
  const raw = localStorage.getItem(GOALS_KEY)
  return raw ? (JSON.parse(raw) as NutrientAmounts) : null
}

/** Loads any previously-computed goals into lib/nutrients.ts and lib/macros.ts. Call once on app start. */
export function loadPersistedGoals(): void {
  setActiveGoals(getStoredGoals())
  const profile = getStoredProfile()
  setActiveMacroGoals(profile ? computeMacroGoals(profile) : null)
}

export function completeOnboarding(profile: OnboardingProfile): NutrientAmounts {
  const goals = computeNutrientGoals(profile)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  localStorage.setItem(ONBOARDED_KEY, 'true')
  setActiveGoals(goals)
  setActiveMacroGoals(computeMacroGoals(profile))
  return goals
}

/** Clears onboarding so the questionnaire runs again (e.g. user wants to update their profile). */
export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDED_KEY)
}

/** Dev-only: marks onboarding as done with a sample profile, so screens that expect goals (e.g. the
 * paywall's nutrient preview) render the same as they would for a real onboarded user. */
export function devSkipOnboarding(): void {
  localStorage.setItem(ONBOARDED_KEY, 'true')
  if (!getStoredGoals()) {
    const sampleProfile: OnboardingProfile = {
      age: 30,
      sex: 'unspecified',
      weightKg: 70,
      heightCm: 170,
      activityLevel: 'moderate',
      diet: 'omnivore',
      goal: 'maintain',
    }
    const goals = computeNutrientGoals(sampleProfile)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(sampleProfile))
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
    setActiveGoals(goals)
    setActiveMacroGoals(computeMacroGoals(sampleProfile))
  }
}

export function isSubscribed(): boolean {
  return localStorage.getItem(SUBSCRIBED_KEY) === 'true'
}

export function getBillingPlan(): BillingPlan | null {
  const plan = localStorage.getItem(PLAN_KEY)
  return plan === 'monthly' || plan === 'yearly' ? plan : null
}

/** Records a Paddle checkout that has completed and unlocks the app. */
export function activateSubscription(plan: BillingPlan): void {
  localStorage.setItem(SUBSCRIBED_KEY, 'true')
  localStorage.setItem(PLAN_KEY, plan)
}

/** Revokes local Pro access — used when the server's own subscription record says it lapsed. */
export function deactivateSubscription(): void {
  localStorage.removeItem(SUBSCRIBED_KEY)
  localStorage.removeItem(PLAN_KEY)
}

/** Applies a subscription/goals snapshot pulled from the cloud (e.g. after signing in on a new device). */
export function applyCloudProfile(data: {
  goals?: NutrientAmounts | null
  profile?: OnboardingProfile | null
  subscribed?: boolean | null
  plan?: BillingPlan | null
}): void {
  if (data.profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile))
    setActiveMacroGoals(computeMacroGoals(data.profile))
  }
  if (data.goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(data.goals))
    setActiveGoals(data.goals)
  }
  if (data.subscribed) {
    localStorage.setItem(ONBOARDED_KEY, 'true')
    localStorage.setItem(SUBSCRIBED_KEY, 'true')
  }
  if (data.plan) localStorage.setItem(PLAN_KEY, data.plan)
}

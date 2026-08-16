import type { BillingPlan, NutrientAmounts, OnboardingProfile } from '../types'
import { computeNutrientGoals } from './goals'
import { setActiveGoals } from './nutrients'

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

/** Loads any previously-computed goals into lib/nutrients.ts. Call once on app start. */
export function loadPersistedGoals(): void {
  setActiveGoals(getStoredGoals())
}

export function completeOnboarding(profile: OnboardingProfile): NutrientAmounts {
  const goals = computeNutrientGoals(profile)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  localStorage.setItem(ONBOARDED_KEY, 'true')
  setActiveGoals(goals)
  return goals
}

/** Clears onboarding so the questionnaire runs again (e.g. user wants to update their profile). */
export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDED_KEY)
}

export function isSubscribed(): boolean {
  return localStorage.getItem(SUBSCRIBED_KEY) === 'true'
}

export function getBillingPlan(): BillingPlan | null {
  const plan = localStorage.getItem(PLAN_KEY)
  return plan === 'monthly' || plan === 'yearly' ? plan : null
}

/**
 * Mock checkout — no payment processor is wired up yet, so this just records the
 * choice locally and unlocks the app. Swap this out once real billing is connected.
 */
export function activateMockSubscription(plan: BillingPlan): void {
  localStorage.setItem(SUBSCRIBED_KEY, 'true')
  localStorage.setItem(PLAN_KEY, plan)
}

import type { BillingPlan, NutrientAmounts, OnboardingProfile } from '../types'
import { supabase } from './supabase'
import { applyCloudProfile, getBillingPlan, getStoredGoals, getStoredProfile, isSubscribed } from './profile'

interface ProfileRow {
  subscribed: boolean
  plan: BillingPlan | null
  goals: NutrientAmounts | null
  onboarding_profile: OnboardingProfile | null
}

/** Uploads this device's onboarding + subscription state so it survives a device switch. */
async function pushLocalProfileToCloud(userId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('profiles').upsert({
    user_id: userId,
    subscribed: isSubscribed(),
    plan: getBillingPlan(),
    goals: getStoredGoals(),
    onboarding_profile: getStoredProfile(),
    updated_at: new Date().toISOString(),
  })
  if (error) console.error('Failed to push profile to cloud:', error)
}

/** Restores a previously-paid subscription + goals onto a new device. Returns true if it found and applied one. */
async function pullCloudProfileToLocal(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle()
  if (error || !data) return false
  const row = data as ProfileRow
  if (!row.subscribed) return false

  applyCloudProfile({ goals: row.goals, profile: row.onboarding_profile, subscribed: row.subscribed, plan: row.plan })
  return true
}

/**
 * Runs right after sign-in: restores a paid account onto a fresh device if the cloud already has one,
 * otherwise saves this device's just-completed purchase up to the account. Returns true if local state
 * was changed by a restore (caller should reload so the app re-reads it).
 */
export async function syncProfileWithCloud(userId: string): Promise<boolean> {
  const restored = await pullCloudProfileToLocal(userId)
  if (restored) return true
  if (isSubscribed()) await pushLocalProfileToCloud(userId)
  return false
}

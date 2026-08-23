import type { BillingPlan, NutrientAmounts, OnboardingProfile } from '../types'
import { supabase } from './supabase'
import { paddleFunctionName } from './paddle'
import {
  activateSubscription,
  deactivateSubscription,
  applyCloudProfile,
  getBillingPlan,
  getStoredGoals,
  getStoredProfile,
  isSubscribed,
} from './profile'

interface ProfileRow {
  goals: NutrientAmounts | null
  onboarding_profile: OnboardingProfile | null
}

interface SubscriptionStatus {
  subscribed: boolean
  plan: BillingPlan | null
  /** True only when the server has a definitive record for this account (linked at checkout
   *  or found by matching email). False means "no evidence either way" and must never be used
   *  to revoke a local unlock — see supabase/functions/link-paddle-subscription. */
  authoritative: boolean
}

/** Uploads this device's onboarding answers + goals so they survive a device switch. */
async function pushProfilePrefsToCloud(userId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('profiles').upsert({
    user_id: userId,
    goals: getStoredGoals(),
    onboarding_profile: getStoredProfile(),
    updated_at: new Date().toISOString(),
  })
  if (error) console.error('Failed to push profile to cloud:', error)
}

/** Restores previously-saved goals/onboarding answers onto a new device. Returns true if applied. */
async function pullProfilePrefsFromCloud(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.from('profiles').select('goals, onboarding_profile').eq('user_id', userId).maybeSingle()
  if (error || !data) return false
  const row = data as ProfileRow
  if (!row.goals && !row.onboarding_profile) return false

  applyCloudProfile({ goals: row.goals, profile: row.onboarding_profile })
  return true
}

/**
 * Asks the server for this account's real subscription status — never trusts localStorage
 * or anything the client itself claims. See supabase/functions/link-paddle-subscription.
 */
export async function fetchServerSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (!supabase) return { subscribed: false, plan: null, authoritative: false }
  const { data, error } = await supabase.functions.invoke<SubscriptionStatus>(paddleFunctionName('link-paddle-subscription'))
  if (error || !data) return { subscribed: false, plan: null, authoritative: false }
  return data
}

/**
 * Polls the server right after a Paddle checkout completes, since the webhook that links
 * the purchase to this account can lag the client-side "checkout.completed" event by a
 * couple of seconds. link-paddle-subscription also falls back to looking the purchase up
 * directly by the account's email, so this resolves even before the webhook lands. Used so
 * the paid AI endpoints (which check the server record, not localStorage) work immediately
 * after paying instead of erroring until the next app reload.
 */
export async function waitForServerSubscription(maxAttempts = 6, delayMs = 1500): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await fetchServerSubscriptionStatus()
    if (status.subscribed) return true
    if (attempt < maxAttempts - 1) await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return false
}

/**
 * Runs after sign-in (and on session restore): reconciles local Pro access against the
 * server-verified subscription record. Only an `authoritative` response can revoke access
 * (e.g. after a cancellation the webhook recorded on an already-linked account) — a
 * non-authoritative "not found" can legitimately mean the Paddle checkout used a different
 * email than the Google account, so it may only grant, never revoke.
 */
async function reconcileSubscription(): Promise<boolean> {
  const server = await fetchServerSubscriptionStatus()
  if (server.subscribed && server.plan) {
    if (!isSubscribed() || getBillingPlan() !== server.plan) {
      activateSubscription(server.plan)
      return true
    }
    return false
  }
  if (server.authoritative && isSubscribed()) {
    deactivateSubscription()
    return true
  }
  return false
}

/**
 * Runs right after sign-in and on session restore: reconciles subscription status with the
 * server, restores a paid account onto a fresh device if the cloud already has one, otherwise
 * saves this device's goals/profile up to the account. Returns true if local state changed
 * (caller should reload so the app re-reads it).
 *
 * Only pulls from the cloud when this device has no local profile/goals at all — i.e. a
 * genuinely fresh device. Otherwise this device's data wins and gets pushed up instead. This
 * matters because "retake questionnaire" clears only the onboarded flag (not the saved
 * profile/goals); if a pull-and-restore ran unconditionally here, it would fetch the old cloud
 * profile right back down, report "changed", and reload — undoing the retake and, since the
 * onboarded flag is still cleared afterward, doing so again on every subsequent load.
 */
export async function syncProfileWithCloud(userId: string): Promise<boolean> {
  let changed = await reconcileSubscription()

  const hasLocalProfile = getStoredProfile() !== null || getStoredGoals() !== null
  if (!hasLocalProfile) {
    const restoredPrefs = await pullProfilePrefsFromCloud(userId)
    if (restoredPrefs) changed = true
    else await pushProfilePrefsToCloud(userId)
  } else {
    await pushProfilePrefsToCloud(userId)
  }

  return changed
}

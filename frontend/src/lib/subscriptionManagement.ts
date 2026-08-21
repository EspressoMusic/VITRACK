import type { BillingPlan } from '../types'
import { supabase } from './supabase'
import { activateSubscription, deactivateSubscription } from './profile'

export interface SubscriptionDetails {
  status: string
  plan: BillingPlan | null
  currentPeriodEnd: string | null
  /** True once cancellation is scheduled: access continues until cancelEffectiveAt, then billing stops for good. */
  cancelAtPeriodEnd: boolean
  cancelEffectiveAt: string | null
  updatePaymentMethodUrl: string | null
}

type Action = 'status' | 'change_plan' | 'cancel' | 'resume'

async function callManageSubscription(action: Action, plan?: BillingPlan): Promise<SubscriptionDetails> {
  if (!supabase) throw new Error('Subscription management is not available.')
  const { data, error } = await supabase.functions.invoke<SubscriptionDetails & { error?: string }>('manage-subscription', {
    body: { action, plan },
  })
  if (error || !data) throw new Error('Could not reach the server. Please try again.')
  if (data.error) throw new Error(data.error)

  // Keep the local unlock flag in sync with the server's live answer, same as the
  // reconciliation done on sign-in (see lib/cloudProfile.ts).
  const subscribed = data.status === 'active' || data.status === 'trialing'
  if (subscribed && data.plan) activateSubscription(data.plan)
  else if (!subscribed) deactivateSubscription()

  return data
}

export function getSubscriptionDetails(): Promise<SubscriptionDetails> {
  return callManageSubscription('status')
}

export function changeSubscriptionPlan(plan: BillingPlan): Promise<SubscriptionDetails> {
  return callManageSubscription('change_plan', plan)
}

/** Schedules cancellation at the end of the current paid period — access continues until then, no further charges after. */
export function cancelSubscription(): Promise<SubscriptionDetails> {
  return callManageSubscription('cancel')
}

/** Undoes a pending cancellation while the subscription is still within its paid period. */
export function resumeSubscription(): Promise<SubscriptionDetails> {
  return callManageSubscription('resume')
}

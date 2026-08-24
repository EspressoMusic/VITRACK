import type { BillingPlan } from '../types'
import { supabase } from './supabase'
import { activateSubscription, deactivateSubscription } from './profile'
import { paddleFunctionName } from './paddle'

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

// Dev-only preview of the cancel/resume/switch-plan flow against fake data instead of a real
// linked Paddle subscription: visit `?demo=1`. Compiled out of production builds, same as
// `?unlock=1`/`?paywall=1` in App.tsx.
const DEMO_MODE = import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === '1'
let demoDetails: SubscriptionDetails = {
  status: 'active',
  plan: 'yearly',
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
  cancelEffectiveAt: null,
  updatePaymentMethodUrl: null,
}

async function callManageSubscription(action: Action, plan?: BillingPlan): Promise<SubscriptionDetails> {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    if (action === 'cancel') {
      demoDetails = { ...demoDetails, cancelAtPeriodEnd: true, cancelEffectiveAt: demoDetails.currentPeriodEnd }
    } else if (action === 'resume') {
      demoDetails = { ...demoDetails, cancelAtPeriodEnd: false, cancelEffectiveAt: null }
    } else if (action === 'change_plan' && plan) {
      demoDetails = { ...demoDetails, plan }
    }
    const subscribed = demoDetails.status === 'active'
    if (subscribed && demoDetails.plan) activateSubscription(demoDetails.plan)
    return demoDetails
  }

  if (!supabase) throw new Error('Subscription management is not available.')
  const { data, error } = await supabase.functions.invoke<SubscriptionDetails & { error?: string }>(
    paddleFunctionName('manage-subscription'),
    { body: { action, plan } }
  )
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

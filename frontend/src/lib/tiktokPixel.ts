import type { BillingPlan } from '../types'

interface TtqGlobal {
  track: (event: string, payload?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    ttq?: TtqGlobal
  }
}

export interface PlanPurchaseDetails {
  plan: BillingPlan
  /** Paddle price id actually charged — used as TikTok's content_id. */
  priceId: string
  /** Real transaction amount from Paddle's checkout event, not the marketing display price. */
  value: number
  /** ISO 4217 code from Paddle's checkout event (e.g. "USD"). */
  currency: string
}

function planContents({ plan, priceId }: PlanPurchaseDetails) {
  return [
    {
      content_id: priceId,
      content_type: 'product' as const,
      content_name: plan === 'yearly' ? 'Vitrack Yearly Subscription' : 'Vitrack Monthly Subscription',
    },
  ]
}

function track(event: string, details: PlanPurchaseDetails): void {
  window.ttq?.track(event, {
    contents: planContents(details),
    value: details.value,
    currency: details.currency,
  })
}

/** Buyer opened the Paddle checkout overlay for a plan. */
export function trackInitiateCheckout(details: PlanPurchaseDetails): void {
  track('InitiateCheckout', details)
}

/** Paddle reports the buyer selected/entered a payment method during checkout. */
export function trackAddPaymentInfo(details: PlanPurchaseDetails): void {
  track('AddPaymentInfo', details)
}

/**
 * Only call this once something outside the client has independently confirmed the charge
 * actually settled (see `waitForServerSubscription` / `reconcileSubscription` in
 * cloudProfile.ts). Paddle's client-side "checkout.completed" callback alone is not enough —
 * it can fire without a real payment (e.g. a user invoking it directly from devtools).
 */
export function trackPurchase(details: PlanPurchaseDetails): void {
  track('Purchase', details)
}

const PENDING_PURCHASE_KEY = 'vitrack:pendingTikTokPurchase'

/**
 * A buyer can complete a Paddle checkout while signed out; the purchase is only linked to
 * their account once they sign in afterward (PaywallPanel's "needsSignIn" step), which
 * reloads the page. This stashes the confirmed transaction's real value/currency across that
 * reload so Purchase can still fire exactly once, at the point sign-in actually links it —
 * see the pending-purchase check in cloudProfile.ts's reconcileSubscription.
 */
export function storePendingPurchase(details: PlanPurchaseDetails): void {
  try {
    sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(details))
  } catch {
    // sessionStorage unavailable (e.g. privacy mode) — the deferred Purchase signal is lost;
    // nothing else depends on it.
  }
}

/** Reads and clears the pending purchase left by `storePendingPurchase`, if any. */
export function takePendingPurchase(): PlanPurchaseDetails | null {
  try {
    const raw = sessionStorage.getItem(PENDING_PURCHASE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PENDING_PURCHASE_KEY)
    return JSON.parse(raw) as PlanPurchaseDetails
  } catch {
    return null
  }
}

import type { BillingPlan } from '../types'

declare global {
  interface Window {
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void }
  }
}

const PLAN_VALUE: Record<BillingPlan, number> = { monthly: 19, yearly: 99 }
const PLAN_NAME: Record<BillingPlan, string> = { monthly: 'Vitrack Monthly', yearly: 'Vitrack Yearly' }

/**
 * Fires TikTok's CompletePayment event right when a Paddle checkout finishes, so TikTok Ads
 * can attribute the purchase and use it as an optimization/lookalike signal. The pixel base
 * code only calls `ttq.page()` once on load (see index.html) — this SPA never reloads on
 * checkout, so without an explicit track() call here no purchase signal would ever reach
 * TikTok.
 */
export function trackTikTokPurchase(plan: BillingPlan): void {
  window.ttq?.track('CompletePayment', {
    contents: [{ content_id: plan, content_type: 'product', content_name: PLAN_NAME[plan] }],
    value: PLAN_VALUE[plan],
    currency: 'USD',
  })
}

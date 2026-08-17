import { initializePaddle, type Paddle, type PaddleEventData } from '@paddle/paddle-js'
import type { BillingPlan } from '../types'

const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined
const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production'

export const isPaddleConfigured = Boolean(clientToken)

export const PADDLE_PRICE_IDS: Record<BillingPlan, string | undefined> = {
  monthly: import.meta.env.VITE_PADDLE_PRICE_MONTHLY as string | undefined,
  yearly: import.meta.env.VITE_PADDLE_PRICE_YEARLY as string | undefined,
}

type CheckoutListener = (event: PaddleEventData) => void

let checkoutListener: CheckoutListener | null = null
let paddlePromise: Promise<Paddle | undefined> | null = null

function getPaddle(): Promise<Paddle | undefined> {
  if (!clientToken) return Promise.resolve(undefined)
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment,
      token: clientToken,
      eventCallback: (data) => checkoutListener?.(data),
    })
  }
  return paddlePromise
}

/** Opens the Paddle Checkout overlay for a plan and streams checkout events to `onEvent`. */
export async function openPaddleCheckout(plan: BillingPlan, onEvent: CheckoutListener): Promise<void> {
  const priceId = PADDLE_PRICE_IDS[plan]
  if (!priceId) throw new Error(`Missing Paddle price id for plan "${plan}"`)
  checkoutListener = onEvent
  const paddle = await getPaddle()
  if (!paddle) throw new Error('Paddle failed to initialize')
  paddle.Checkout.open({ items: [{ priceId, quantity: 1 }] })
}

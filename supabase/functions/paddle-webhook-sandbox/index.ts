// Deploy with: supabase functions deploy paddle-webhook-sandbox --no-verify-jwt
//
// Sandbox-only twin of paddle-webhook — same logic, but reads PADDLE_SANDBOX_WEBHOOK_SECRET /
// PADDLE_SANDBOX_PRICE_* so testing never touches the live PADDLE_WEBHOOK_SECRET used by the
// production function. Point the Paddle Sandbox notification destination at this function's
// URL, not at paddle-webhook (which stays wired to Live).
import { createClient } from 'jsr:@supabase/supabase-js@2'

const PRICE_PLAN: Record<string, 'monthly' | 'yearly'> = {}
const monthlyPrice = Deno.env.get('PADDLE_SANDBOX_PRICE_MONTHLY')
const yearlyPrice = Deno.env.get('PADDLE_SANDBOX_PRICE_YEARLY')
if (monthlyPrice) PRICE_PLAN[monthlyPrice] = 'monthly'
if (yearlyPrice) PRICE_PLAN[yearlyPrice] = 'yearly'

const MAX_TIMESTAMP_SKEW_SECONDS = 300

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

async function verifyPaddleSignature(rawBody: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false
  const parts = Object.fromEntries(
    header.split(';').map((p) => {
      const [k, v] = p.split('=')
      return [k, v]
    })
  )
  const ts = parts.ts
  const h1 = parts.h1
  if (!ts || !h1) return false

  const tsNum = Number(ts)
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > MAX_TIMESTAMP_SKEW_SECONDS) return false

  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}:${rawBody}`))
  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return timingSafeEqualHex(computed, h1)
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('PADDLE_SANDBOX_WEBHOOK_SECRET')
  if (!secret) {
    console.error('PADDLE_SANDBOX_WEBHOOK_SECRET is not set')
    return new Response('Webhook not configured', { status: 500 })
  }

  const rawBody = await req.text()
  const isValid = await verifyPaddleSignature(rawBody, req.headers.get('paddle-signature'), secret)
  if (!isValid) return new Response('Invalid signature', { status: 401 })

  let event: { event_type?: string; data?: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (typeof event.event_type === 'string' && event.event_type.startsWith('subscription.') && event.data) {
    const data = event.data as {
      id: string
      customer_id: string
      status: string
      items?: { price?: { id?: string } }[]
      current_billing_period?: { ends_at?: string } | null
      custom_data?: { supabase_user_id?: string } | null
    }

    const priceId = data.items?.[0]?.price?.id
    const plan = priceId ? PRICE_PLAN[priceId] ?? null : null
    const userId = typeof data.custom_data?.supabase_user_id === 'string' ? data.custom_data.supabase_user_id : null

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { error } = await admin.rpc('paddle_upsert_subscription', {
      p_subscription_id: data.id,
      p_customer_id: data.customer_id,
      p_status: data.status,
      p_plan: plan,
      p_current_period_end: data.current_billing_period?.ends_at ?? null,
      p_user_id: userId,
    })
    if (error) {
      console.error('Failed to record Paddle sandbox subscription:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  return new Response('ok', { status: 200 })
})

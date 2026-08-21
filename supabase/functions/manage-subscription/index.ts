// Deploy with: supabase functions deploy manage-subscription
//
// Lets a signed-in user manage their own Paddle subscription: check its live status,
// switch between the monthly/yearly plan, cancel it (access continues until the paid
// period ends, then billing stops for good), or resume a subscription that's scheduled
// to cancel. All mutations go through the Paddle API using the server-only PADDLE_API_KEY
// — the client never talks to Paddle directly for this, so it can't be spoofed.
//
// After every mutation we also upsert `paddle_subscriptions` ourselves with Paddle's
// response instead of waiting for the webhook, so the Settings screen reflects the change
// immediately (the webhook can lag a couple of seconds — same reasoning as
// link-paddle-subscription).
import { createClient } from 'jsr:@supabase/supabase-js@2'

const PADDLE_ENV = Deno.env.get('PADDLE_ENVIRONMENT') === 'sandbox' ? 'sandbox-api' : 'api'
const PADDLE_API_BASE = `https://${PADDLE_ENV}.paddle.com`

const PLAN_PRICE: Record<'monthly' | 'yearly', string | undefined> = {
  monthly: Deno.env.get('PADDLE_PRICE_MONTHLY'),
  yearly: Deno.env.get('PADDLE_PRICE_YEARLY'),
}
const PRICE_PLAN: Record<string, 'monthly' | 'yearly'> = {}
if (PLAN_PRICE.monthly) PRICE_PLAN[PLAN_PRICE.monthly] = 'monthly'
if (PLAN_PRICE.yearly) PRICE_PLAN[PLAN_PRICE.yearly] = 'yearly'

interface PaddleSubscription {
  id: string
  customer_id: string
  status: string
  items?: { price?: { id?: string } }[]
  current_billing_period?: { ends_at?: string } | null
  scheduled_change?: { action?: string; effective_at?: string } | null
  management_urls?: { update_payment_method?: string } | null
}

async function paddleRequest(path: string, apiKey: string, init?: RequestInit): Promise<{ data: PaddleSubscription }> {
  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Paddle API error ${res.status}: ${body}`)
  }
  return res.json()
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

function describe(sub: PaddleSubscription) {
  const priceId = sub.items?.[0]?.price?.id
  const cancelScheduled = sub.scheduled_change?.action === 'cancel'
  return {
    status: sub.status,
    plan: priceId ? PRICE_PLAN[priceId] ?? null : null,
    currentPeriodEnd: sub.current_billing_period?.ends_at ?? null,
    cancelAtPeriodEnd: cancelScheduled,
    cancelEffectiveAt: cancelScheduled ? sub.scheduled_change?.effective_at ?? null : null,
    updatePaymentMethodUrl: sub.management_urls?.update_payment_method ?? null,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return jsonResponse({ error: 'Missing Authorization header' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const paddleApiKey = Deno.env.get('PADDLE_API_KEY')
  if (!paddleApiKey) return jsonResponse({ error: 'Subscription management is not configured.' }, 500)

  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) return jsonResponse({ error: 'Invalid session' }, 401)

  let body: { action?: string; plan?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }
  const action = body.action
  if (action !== 'status' && action !== 'change_plan' && action !== 'cancel' && action !== 'resume') {
    return jsonResponse({ error: 'Unknown action' }, 400)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data: row } = await admin
    .from('paddle_subscriptions')
    .select('paddle_subscription_id')
    .eq('user_id', userData.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!row) return jsonResponse({ error: 'No subscription found on this account.' }, 404)
  const subscriptionId = row.paddle_subscription_id as string

  try {
    let sub: PaddleSubscription

    if (action === 'status') {
      const res = await paddleRequest(`/subscriptions/${subscriptionId}`, paddleApiKey)
      sub = res.data
    } else if (action === 'change_plan') {
      const plan = body.plan
      if (plan !== 'monthly' && plan !== 'yearly') return jsonResponse({ error: 'plan must be "monthly" or "yearly"' }, 400)
      const priceId = PLAN_PRICE[plan]
      if (!priceId) return jsonResponse({ error: `Missing Paddle price id for plan "${plan}"` }, 500)
      const res = await paddleRequest(`/subscriptions/${subscriptionId}`, paddleApiKey, {
        method: 'PATCH',
        body: JSON.stringify({
          items: [{ price_id: priceId, quantity: 1 }],
          proration_billing_mode: 'prorated_immediately',
        }),
      })
      sub = res.data
    } else if (action === 'cancel') {
      const res = await paddleRequest(`/subscriptions/${subscriptionId}/cancel`, paddleApiKey, {
        method: 'POST',
        body: JSON.stringify({ effective_from: 'next_billing_period' }),
      })
      sub = res.data
    } else {
      // resume: clear a pending cancellation
      const res = await paddleRequest(`/subscriptions/${subscriptionId}`, paddleApiKey, {
        method: 'PATCH',
        body: JSON.stringify({ scheduled_change: null }),
      })
      sub = res.data
    }

    const details = describe(sub)
    if (action !== 'status') {
      await admin.rpc('paddle_upsert_subscription', {
        p_subscription_id: sub.id,
        p_customer_id: sub.customer_id,
        p_status: sub.status,
        p_plan: details.plan,
        p_current_period_end: details.currentPeriodEnd,
        p_user_id: userData.user.id,
      })
    }

    return jsonResponse(details)
  } catch (err) {
    console.error(`manage-subscription (${action}) failed:`, err)
    return jsonResponse({ error: 'Could not reach Paddle. Please try again.' }, 502)
  }
})

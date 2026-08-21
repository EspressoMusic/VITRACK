// Deploy with: supabase functions deploy link-paddle-subscription
//
// Called by a signed-in user (after Google sign-in, or on app load) to find out
// their real, server-verified subscription status. Two paths:
//  1. A row in `paddle_subscriptions` already linked to this account (set at
//     checkout via customData.supabase_user_id, kept fresh by paddle-webhook) —
//     the fast, authoritative path.
//  2. No linked row yet, which happens when a purchase was completed anonymously
//     before the user signed in. In that case we look the buyer up directly with
//     Paddle's API by the account's own email, and link it if found. We never
//     trust anything the client claims about its own purchase.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const PADDLE_ENV = Deno.env.get('PADDLE_ENVIRONMENT') === 'sandbox' ? 'sandbox-api' : 'api'
const PADDLE_API_BASE = `https://${PADDLE_ENV}.paddle.com`

const PRICE_PLAN: Record<string, 'monthly' | 'yearly'> = {}
const monthlyPrice = Deno.env.get('PADDLE_PRICE_MONTHLY')
const yearlyPrice = Deno.env.get('PADDLE_PRICE_YEARLY')
if (monthlyPrice) PRICE_PLAN[monthlyPrice] = 'monthly'
if (yearlyPrice) PRICE_PLAN[yearlyPrice] = 'yearly'

async function paddleGet(path: string, apiKey: string): Promise<{ data?: unknown[] }> {
  const res = await fetch(`${PADDLE_API_BASE}${path}`, { headers: { Authorization: `Bearer ${apiKey}` } })
  if (!res.ok) throw new Error(`Paddle API error ${res.status}`)
  return res.json()
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return jsonResponse({ error: 'Missing Authorization header' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const paddleApiKey = Deno.env.get('PADDLE_API_KEY')

  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) return jsonResponse({ error: 'Invalid session' }, 401)

  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { data: linkedRow } = await admin
    .from('paddle_subscriptions')
    .select('status, plan')
    .eq('user_id', userData.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (linkedRow) {
    // A row already linked to this account is a definitive signal either way — trust it to
    // both grant and revoke access (e.g. after a cancellation the webhook recorded).
    const subscribed = linkedRow.status === 'active' || linkedRow.status === 'trialing'
    return jsonResponse({ subscribed, plan: subscribed ? linkedRow.plan : null, authoritative: true })
  }

  const email = userData.user.email
  // No linked row yet and nothing to look up with — this is NOT a definitive "not
  // subscribed": the caller must not use this to revoke an existing local unlock.
  if (!paddleApiKey || !email) return jsonResponse({ subscribed: false, plan: null, authoritative: false })

  try {
    const customers = await paddleGet(`/customers?email=${encodeURIComponent(email)}`, paddleApiKey)
    const customerIds = ((customers.data ?? []) as { id: string }[]).map((c) => c.id)

    for (const customerId of customerIds) {
      const subs = await paddleGet(`/subscriptions?customer_id=${customerId}&per_page=10`, paddleApiKey)
      for (const sub of (subs.data ?? []) as {
        id: string
        status: string
        items?: { price?: { id?: string } }[]
        current_billing_period?: { ends_at?: string } | null
      }[]) {
        if (sub.status !== 'active' && sub.status !== 'trialing') continue

        const priceId = sub.items?.[0]?.price?.id
        const plan = priceId ? PRICE_PLAN[priceId] ?? null : null

        await admin.rpc('paddle_upsert_subscription', {
          p_subscription_id: sub.id,
          p_customer_id: customerId,
          p_status: sub.status,
          p_plan: plan,
          p_current_period_end: sub.current_billing_period?.ends_at ?? null,
          p_user_id: userData.user.id,
        })

        return jsonResponse({ subscribed: true, plan, authoritative: true })
      }
    }
  } catch (err) {
    console.error('Paddle lookup failed:', err)
  }

  // No active subscription found under this email in Paddle. This is still NOT authoritative
  // for revocation: the purchase may have used a different email than the Google account, so
  // it can only grant (above), never revoke a local unlock the app already believes is valid.
  return jsonResponse({ subscribed: false, plan: null, authoritative: false })
})

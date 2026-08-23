// Deploy with: supabase functions deploy link-paddle-subscription-sandbox
//
// Sandbox-only twin of link-paddle-subscription — same logic, but hardcoded to Paddle's
// sandbox API and reading the PADDLE_SANDBOX_* secrets, so testing never touches the live
// PADDLE_API_KEY / PADDLE_PRICE_* secrets used by the production function.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const PADDLE_API_BASE = 'https://sandbox-api.paddle.com'

const PRICE_PLAN: Record<string, 'monthly' | 'yearly'> = {}
const monthlyPrice = Deno.env.get('PADDLE_SANDBOX_PRICE_MONTHLY')
const yearlyPrice = Deno.env.get('PADDLE_SANDBOX_PRICE_YEARLY')
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
  const paddleApiKey = Deno.env.get('PADDLE_SANDBOX_API_KEY')

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
    const subscribed = linkedRow.status === 'active' || linkedRow.status === 'trialing'
    return jsonResponse({ subscribed, plan: subscribed ? linkedRow.plan : null, authoritative: true })
  }

  const email = userData.user.email
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
    console.error('Paddle sandbox lookup failed:', err)
  }

  return jsonResponse({ subscribed: false, plan: null, authoritative: false })
})

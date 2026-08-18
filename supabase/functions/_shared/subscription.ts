// Shared by the paid AI endpoints (analyze, identify-food). Verifies the caller is a
// signed-in Supabase user with an active/trialing row in `paddle_subscriptions` — the
// server-side source of truth written only by paddle-webhook / link-paddle-subscription.
// The client's own "subscribed" localStorage flag is a UX convenience only and must
// never be trusted here: without this check, anyone could set that flag in devtools and
// use the paid AI features for free.
import { createClient } from 'jsr:@supabase/supabase-js@2'

export interface SubscriptionCheck {
  ok: boolean
  status: number
  error?: string
}

export async function requireActiveSubscription(req: Request): Promise<SubscriptionCheck> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return { ok: false, status: 401, error: 'Sign in and subscribe to use this feature.' }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) {
    return { ok: false, status: 401, error: 'Sign in and subscribe to use this feature.' }
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data: row } = await admin
    .from('paddle_subscriptions')
    .select('status')
    .eq('user_id', userData.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const subscribed = row?.status === 'active' || row?.status === 'trialing'
  if (!subscribed) {
    return {
      ok: false,
      status: 402,
      error: "We couldn't verify an active subscription on this account. If you just subscribed, wait a few seconds and try again.",
    }
  }

  return { ok: true, status: 200 }
}

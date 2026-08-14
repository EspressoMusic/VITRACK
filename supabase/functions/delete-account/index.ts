// Deploy with: supabase functions deploy delete-account
// Deletes the calling user's row data and their auth account. Runs with the
// service-role key (server-side only) so it must never be called from the
// client with anything other than the caller's own access token.
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  await adminClient.from('meals').delete().eq('user_id', userData.user.id)
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id)
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false
  try {
    return /^https?:$/.test(new URL(value).protocol)
  } catch {
    return false
  }
}

export const isSupabaseConfigured = isValidHttpUrl(url) && Boolean(anonKey)

// A malformed env var (stray whitespace/quotes from a copy-paste) must not
// crash the whole app at module load — fall back to unconfigured/guest mode.
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!) : null

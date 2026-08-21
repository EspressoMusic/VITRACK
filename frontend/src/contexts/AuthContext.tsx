import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { setCurrentUserId } from '../lib/db'
import { syncLocalMealsToCloud } from '../lib/cloudDb'
import { syncProfileWithCloud } from '../lib/cloudProfile'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            nonce: string
            use_fedcm_for_prompt?: boolean
            callback: (response: { credential: string }) => void
          }) => void
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean
              isSkippedMoment: () => boolean
            }) => void,
          ) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()

let googleScriptPromise: Promise<void> | null = null

// Loads the Google Identity Services library used for the branded (non-redirect) sign-in
// flow — this is what lets the Google account picker show our own domain instead of the
// Supabase project's supabase.co URL.
function loadGoogleIdentityScript(): Promise<void> {
  if (googleScriptPromise) return googleScriptPromise
  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google sign-in.'))
    document.head.appendChild(script)
  })
  return googleScriptPromise
}

async function createNonce(): Promise<{ nonce: string; hashedNonce: string }> {
  const nonce = crypto.randomUUID()
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce))
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return { nonce, hashedNonce }
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      setCurrentUserId(sessionUser?.id ?? null)
      setLoading(false)
      // Re-verify subscription status on every app load (not just fresh sign-in), so a
      // cancellation or chargeback on Paddle's side eventually revokes local access too.
      if (sessionUser) {
        syncProfileWithCloud(sessionUser.id)
          .then((changed) => {
            if (changed) window.location.reload()
          })
          .catch((err) => console.error('Profile sync failed:', err))
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setCurrentUserId(session?.user?.id ?? null)
      if (event === 'SIGNED_IN' && session?.user) {
        syncLocalMealsToCloud().catch((err) => console.error('Sync to cloud failed:', err))
        syncProfileWithCloud(session.user.id)
          .then((restored) => {
            if (restored) window.location.reload()
          })
          .catch((err) => console.error('Profile sync failed:', err))
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Supabase is not configured.')

    // Fall back to the classic redirect flow (shows the supabase.co domain in Google's
    // account picker) if the branded client isn't configured or the script fails to load.
    if (!GOOGLE_CLIENT_ID) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      return
    }

    await loadGoogleIdentityScript()
    const { nonce, hashedNonce } = await createNonce()

    await new Promise<void>((resolve, reject) => {
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
        callback: (response) => {
          supabase!.auth
            .signInWithIdToken({ provider: 'google', token: response.credential, nonce })
            .then(({ error }) => (error ? reject(error) : resolve()))
        },
      })

      // One Tap can be silently skipped (e.g. the user dismissed it recently) — when that
      // happens, fall back to the redirect flow so sign-in still works.
      window.google!.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          supabase!.auth
            .signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
            .then(({ error }) => (error ? reject(error) : resolve()))
        }
      })
    })
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function deleteAccount() {
    if (!supabase || !user) return
    const { error } = await supabase.functions.invoke('delete-account')
    if (error) throw error
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

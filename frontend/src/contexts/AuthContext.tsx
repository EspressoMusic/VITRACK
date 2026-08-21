import type { User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
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
          renderButton: (
            parent: HTMLElement,
            options: { type?: string; theme?: string; size?: string; width?: number },
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
  /** Renders a real (invisible) Google sign-in button into `container` — meant to sit on top
   *  of a custom-styled button so the actual click lands on Google's own element. This is what
   *  lets the account picker show our own domain instead of the Supabase project's supabase.co
   *  URL; the classic redirect flow (which shows supabase.co) is used only as a fallback. */
  renderGoogleButton: (container: HTMLElement) => void
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

  const renderGoogleButton = useCallback((container: HTMLElement) => {
    if (!supabase) return

    // No branded client configured (e.g. local dev without the env var) — fall back to the
    // classic redirect flow so sign-in still works, just showing the supabase.co domain.
    if (!GOOGLE_CLIENT_ID) {
      container.style.pointerEvents = 'auto'
      container.onclick = () => {
        supabase!.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
      }
      return
    }

    loadGoogleIdentityScript()
      .then(() => createNonce())
      .then(({ nonce, hashedNonce }) => {
        window.google!.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
          callback: (response) => {
            supabase!.auth
              .signInWithIdToken({ provider: 'google', token: response.credential, nonce })
              .catch((err) => console.error('Google sign-in failed:', err))
          },
        })
        const width = Math.round(container.getBoundingClientRect().width) || 320
        window.google!.accounts.id.renderButton(container, { type: 'standard', width })
      })
      .catch((err) => console.error('Google sign-in button failed to render:', err))
  }, [])

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
    <AuthContext.Provider value={{ user, loading, renderGoogleButton, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

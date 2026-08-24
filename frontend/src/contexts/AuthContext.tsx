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

/** Anonymous sessions don't get cloud meal storage (see db.ts's useCloud) — only a real,
 *  linked identity does. Otherwise every anonymous visitor, including ones who never
 *  subscribe, would start writing meal rows to Postgres instead of the local IndexedDB. */
function cloudDbUserId(u: User | null): string | null {
  return u && !u.is_anonymous ? u.id : null
}

let anonSignInPromise: Promise<User | null> | null = null

/** De-duped so React StrictMode's double-invoked effect (or any other accidental re-run of
 *  the mount effect below) can't fire two concurrent signInAnonymously() calls — that raced
 *  in testing and left the client's active session pointing at a different user than the id
 *  a caller had just captured, which then failed RLS on the next write. */
function ensureAnonymousSession(): Promise<User | null> {
  if (!anonSignInPromise) {
    anonSignInPromise = supabase!.auth.signInAnonymously().then(({ data, error }) => {
      if (error) {
        console.error('Anonymous sign-in failed:', error)
        anonSignInPromise = null
        return null
      }
      return data.user
    })
  }
  return anonSignInPromise
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(async ({ data }) => {
      let sessionUser = data.session?.user ?? null

      // No session at all (first launch, or a cleared one) — sign in anonymously so every
      // visitor has a real auth.uid() before they ever reach checkout. That id rides along
      // in the Paddle customData from the very first purchase attempt, so the webhook can
      // link the subscription immediately and nobody is forced through a Google sign-in
      // just to redeem what they already paid for.
      if (!sessionUser) {
        sessionUser = await ensureAnonymousSession()
      }

      setUser(sessionUser)
      setCurrentUserId(cloudDbUserId(sessionUser))
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
      setCurrentUserId(cloudDbUserId(session?.user ?? null))
      if (event === 'SIGNED_IN' && session?.user) {
        // Only migrate local meals up on a real sign-in (e.g. linking Google on a device that
        // already had local history) — not on the automatic anonymous sign-in every visitor
        // now gets, which would otherwise push a fresh anonymous user's (empty) local data for
        // no reason, or an existing free user's whole history into a table nothing reads back
        // from while they're still anonymous.
        if (!session.user.is_anonymous) {
          syncLocalMealsToCloud().catch((err) => console.error('Sync to cloud failed:', err))
        }
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
    // Re-establish an anonymous session right away so the rest of the app (checkout above
    // all) can keep assuming a signed-in user always exists rather than handling a null gap.
    const { error } = await supabase.auth.signInAnonymously()
    if (error) console.error('Anonymous sign-in failed:', error)
  }

  async function deleteAccount() {
    if (!supabase || !user) return
    const { error } = await supabase.functions.invoke('delete-account')
    if (error) throw error
    await signOut()
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

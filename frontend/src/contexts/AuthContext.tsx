import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { setCurrentUserId } from '../lib/db'
import { syncLocalMealsToCloud } from '../lib/cloudDb'

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
      setUser(data.session?.user ?? null)
      setCurrentUserId(data.session?.user?.id ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setCurrentUserId(session?.user?.id ?? null)
      if (event === 'SIGNED_IN' && session?.user) {
        syncLocalMealsToCloud().catch((err) => console.error('Sync to cloud failed:', err))
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Supabase is not configured.')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
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

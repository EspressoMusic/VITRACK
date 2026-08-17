import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { ConfettiBurst } from './ConfettiBurst'
import { SparkleIcon, UserIcon } from './icons'

/** Static post-purchase landing screen at #thank-you — used as the TikTok ad conversion URL. */
export function ThankYouPage({ onContinue }: { onContinue: () => void }) {
  const { user, signInWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  async function handleSave() {
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      setSigningIn(false)
    }
  }

  return (
    <div
      className="relative mx-auto flex h-dvh w-full max-w-md flex-col items-center justify-center overflow-hidden px-6 py-6"
      style={{
        backgroundColor: 'var(--surface-0)',
        backgroundImage: "url('/background-calendar.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <ConfettiBurst />
      <div
        className="relative z-10 flex w-full flex-col items-center gap-3 rounded-3xl px-7 py-9 text-center"
        style={{
          backgroundColor: '#e5c184',
          border: '3px solid var(--accent-strong)',
          boxShadow: '0 10px 26px rgba(11,11,11,0.16)',
        }}
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--accent-strong)', color: '#fff' }}
        >
          <SparkleIcon className="h-7 w-7" />
        </span>
        <div>
          <h1 className="mb-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome to Vitrack
          </h1>
          <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
            You're all set. Let's start tracking what your body actually needs.
          </p>
        </div>
        <button
          onClick={onContinue}
          className="mt-2 w-full rounded-full py-2.5 text-base font-semibold text-white transition"
          style={{ backgroundColor: 'var(--accent-strong)' }}
        >
          Get started
        </button>

        {isSupabaseConfigured &&
          (user ? (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Saved to {user.email}
            </p>
          ) : (
            <button
              onClick={handleSave}
              disabled={signingIn}
              className="flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full py-2 text-[11px] font-medium transition"
              style={{ color: 'var(--text-secondary)', opacity: signingIn ? 0.6 : undefined }}
            >
              <UserIcon className="h-3.5 w-3.5 shrink-0" /> {signingIn ? 'Opening Google…' : 'Save my plan with Google'}
            </button>
          ))}
      </div>
    </div>
  )
}

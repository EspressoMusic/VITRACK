import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { ConfettiBurst } from './ConfettiBurst'
import { GoogleSignInOverlay } from './GoogleSignInOverlay'
import { SparkleIcon, UserIcon } from './icons'

/** Static post-purchase landing screen at #thank-you — used as the TikTok ad conversion URL. */
export function ThankYouPage({ onContinue }: { onContinue: () => void }) {
  const { user } = useAuth()

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
        className="panel-enter relative z-10 flex w-full flex-col items-center gap-3 rounded-3xl px-7 py-9 text-center"
        style={{
          backgroundColor: '#e5c184',
          border: '2px solid var(--accent-strong)',
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
            You're in!
          </h1>
          <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
            Real food, real vitamins, real energy — your transformation starts today.
          </p>
        </div>
        <button
          onClick={onContinue}
          className="mt-2 w-full rounded-full py-2.5 text-base font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
          style={{ backgroundColor: 'var(--accent-strong)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
        >
          Get started
        </button>

        {isSupabaseConfigured &&
          (user ? (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Saved to {user.email}
            </p>
          ) : (
            <div className="relative mx-auto w-fit">
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                style={{
                  backgroundColor: 'var(--surface-cream)',
                  color: 'var(--text-primary)',
                  border: '2px solid #1a1a19',
                  boxShadow: '0 2px 0 #1a1a19',
                }}
              >
                <UserIcon className="h-3.5 w-3.5 shrink-0" /> Save my plan with Google
              </button>
              <GoogleSignInOverlay />
            </div>
          ))}
      </div>
    </div>
  )
}

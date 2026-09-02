import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { ConfettiBurst } from './ConfettiBurst'
import { GoogleConsentGate } from './GoogleConsentGate'
import { SparkleIcon } from './icons'
import { useLanguage } from '../contexts/LanguageContext'
import { THANK_YOU_PAGE_STRINGS } from '../lib/i18n/thankYouPage'

/** Static post-purchase landing screen at #thank-you — used as the TikTok ad conversion URL. */
export function ThankYouPage({ onContinue }: { onContinue: () => void }) {
  const { user } = useAuth()
  const { lang, dir } = useLanguage()
  const t = THANK_YOU_PAGE_STRINGS[lang]

  return (
    <div
      className="relative mx-auto flex h-svh w-full max-w-md flex-col items-center justify-center overflow-hidden px-6 py-6"
      style={{
        backgroundColor: 'var(--surface-0)',
        backgroundImage: "url('/background-calendar.png?v=3')",
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
            {t.title}
          </h1>
          <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
            {t.subtitle}
          </p>
        </div>
        {isSupabaseConfigured && user && !user.is_anonymous ? (
          <>
            <button
              onClick={onContinue}
              className="mt-2 w-full rounded-full py-2.5 text-base font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: 'var(--accent-strong)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
            >
              {t.getStarted}
            </button>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {t.savedTo(user.email ?? '')}
            </p>
          </>
        ) : isSupabaseConfigured ? (
          <>
            <div className="mt-2 w-full">
              <GoogleConsentGate t={t} dir={dir}>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="w-full rounded-full py-2.5 text-base font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
                  style={{ backgroundColor: 'var(--accent-strong)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
                >
                  {t.signInWithGoogle}
                </button>
              </GoogleConsentGate>
            </div>
            <button type="button" onClick={onContinue} className="text-xs underline" style={{ color: 'var(--text-secondary)' }}>
              {t.continueWithoutSaving}
            </button>
          </>
        ) : (
          <button
            onClick={onContinue}
            className="mt-2 w-full rounded-full py-2.5 text-base font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
            style={{ backgroundColor: 'var(--accent-strong)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
          >
            {t.getStarted}
          </button>
        )}
      </div>
    </div>
  )
}

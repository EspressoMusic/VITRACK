import { useEffect, useState, type ReactNode } from 'react'
import { GoogleSignInOverlay } from './GoogleSignInOverlay'
import { LegalPanel } from './LegalPanel'

export interface GoogleConsentStrings {
  agreePrefix: string
  agreeLinkLabel: string
  agreeErrorToast: string
}

/**
 * Wraps a visible (aria-hidden) Google sign-in button with a required, off-by-default
 * "I agree to the Terms & Privacy Policy" toggle. Signing in with Google creates or links a
 * real account, so consent must be captured before the click ever reaches Google's button —
 * not just implied by using the app. Pass the styled button as `children`; this component
 * supplies the `relative` wrapper and the gated GoogleSignInOverlay itself.
 */
export function GoogleConsentGate({ t, dir, children }: { t: GoogleConsentStrings; dir: 'ltr' | 'rtl'; children: ReactNode }) {
  const [agreed, setAgreed] = useState(false)
  const [legalOpen, setLegalOpen] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (!showError) return
    const id = setTimeout(() => setShowError(false), 2200)
    return () => clearTimeout(id)
  }, [showError])

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-center gap-2 text-center">
        <button
          type="button"
          role="switch"
          aria-checked={agreed}
          onClick={() => setAgreed((a) => !a)}
          className="relative flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors"
          style={{ backgroundColor: agreed ? 'var(--accent-strong)' : 'var(--surface-1)', border: '2px solid #222' }}
        >
          <span
            className="h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
            style={{
              transform: agreed ? `translateX(calc(${dir === 'rtl' ? '-1' : '1'} * 0.875rem))` : 'translateX(0px)',
              border: '1px solid #222',
            }}
          />
        </button>
        <span className="whitespace-nowrap text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          {t.agreePrefix}
          <button type="button" onClick={() => setLegalOpen(true)} style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
            {t.agreeLinkLabel}
          </button>
        </span>
      </div>

      <div className="relative w-full">
        {children}
        <GoogleSignInOverlay disabled={!agreed} onBlockedClick={() => setShowError(true)} />
      </div>

      {legalOpen && <LegalPanel onClose={() => setLegalOpen(false)} />}

      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div
            className="modal-card-enter rounded-2xl px-5 py-4 text-center"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--accent-strong)', boxShadow: '0 10px 26px rgba(11,11,11,0.25)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t.agreeErrorToast}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

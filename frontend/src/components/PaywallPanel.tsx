import { useEffect, useState } from 'react'
import type { BillingPlan } from '../types'
import { activateSubscription, getStoredGoals } from '../lib/profile'
import { openPaddleCheckout } from '../lib/paddle'
import { NUTRIENTS } from '../lib/nutrients'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { CheckIcon, ClockIcon, LockIcon } from './icons'
import { LegalPanel } from './LegalPanel'
import { ConfettiBurst } from './ConfettiBurst'

const FEATURES = [
  'Vitamin & mineral targets',
  'AI meal photo analysis',
  'Calendar history & insights',
  'Deficiency alerts & food tips',
]

const OFFER_DEADLINE_KEY = 'vitrack:offerDeadline'
const OFFER_WINDOW_MS = 24 * 60 * 60 * 1000

/** Persists a 24h deadline on first view so the countdown survives reloads instead of resetting. */
function getOfferDeadline(): number {
  const stored = Number(localStorage.getItem(OFFER_DEADLINE_KEY))
  if (Number.isFinite(stored) && stored > Date.now()) return stored
  const deadline = Date.now() + OFFER_WINDOW_MS
  localStorage.setItem(OFFER_DEADLINE_KEY, String(deadline))
  return deadline
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function PaywallPanel({ onSubscribed }: { onSubscribed: () => void }) {
  const { signInWithGoogle } = useAuth()
  const [plan, setPlan] = useState<BillingPlan>('yearly')
  const [processing, setProcessing] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [legalOpen, setLegalOpen] = useState(false)
  const [showAgreeError, setShowAgreeError] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [offerDeadline] = useState(getOfferDeadline)
  const [now, setNow] = useState(Date.now())
  const goals = getStoredGoals()

  async function handleRestore() {
    setRestoring(true)
    try {
      await signInWithGoogle()
    } catch {
      setRestoring(false)
    }
  }

  useEffect(() => {
    if (!showAgreeError) return
    const t = setTimeout(() => setShowAgreeError(false), 2200)
    return () => clearTimeout(t)
  }, [showAgreeError])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  async function handleSubscribe() {
    if (!agreed) {
      setShowAgreeError(true)
      return
    }
    setCheckoutError(null)
    setProcessing(true)
    try {
      await openPaddleCheckout(plan, (event) => {
        if (event.name === 'checkout.completed') {
          activateSubscription(plan)
          onSubscribed()
        } else if (event.name === 'checkout.closed') {
          setProcessing(false)
        } else if (event.name === 'checkout.error') {
          setProcessing(false)
          setCheckoutError('Checkout failed. Please try again.')
        }
      })
    } catch {
      setProcessing(false)
      setCheckoutError('Checkout is unavailable right now. Please try again later.')
    }
  }

  return (
    <div
      className="relative mx-auto flex h-dvh w-full max-w-md flex-col items-center justify-center overflow-hidden px-3 py-2"
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
        className="relative z-10 flex w-full min-h-0 max-h-full flex-col items-center gap-1.5 overflow-hidden rounded-3xl px-5 py-3 text-center"
        style={{
          backgroundColor: '#e5c184',
          border: '3px solid var(--accent-strong)',
          boxShadow: '0 10px 26px rgba(11,11,11,0.16)',
        }}
      >
        <div className="shrink-0 text-center">
          <h1 className="whitespace-nowrap text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            One step from a whole new you
          </h1>
          <p className="mx-auto max-w-[85%] text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
            More energy, clearer skin, sharper focus — {NUTRIENTS.length} targets ready to unlock.
          </p>
        </div>

        {goals && (
          <div className="relative w-full shrink-0 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border-strong)' }}>
            <div className="grid grid-cols-4 gap-1 p-0.5" style={{ filter: 'blur(3px)', backgroundColor: 'var(--surface-1)' }}>
              {NUTRIENTS.slice(0, 4).map((n) => (
                <div key={n.id} className="rounded-lg px-1 py-0.5" style={{ backgroundColor: 'var(--surface-tint)' }}>
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {n.shortLabel}
                  </div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {goals[n.id]}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(11,11,11,0.32)' }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: 'var(--accent-strong)' }}
              >
                <LockIcon className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        )}

        <div className="flex w-full shrink-0 flex-col gap-1 text-left">
          {FEATURES.map((f, i) => (
            <div key={f} className="flex items-center gap-2">
              <span
                className="feature-check-chase flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                <CheckIcon className="h-2 w-2" />
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-primary)' }}>
                {f}
              </span>
            </div>
          ))}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-1">
          <PlanCard
            featured
            selected={plan === 'yearly'}
            onSelect={() => setPlan('yearly')}
            title="Yearly"
            price="$99"
            period="/year"
            note="≈ $8.25/mo"
            badge="Save 57%"
            countdown={formatCountdown(offerDeadline - now)}
          />
          <PlanCard selected={plan === 'monthly'} onSelect={() => setPlan('monthly')} title="Monthly" price="$19" period="/month" />
        </div>

        <div className="w-full shrink-0">
          <div className="mb-1 flex items-center gap-2 text-left">
            <button
              type="button"
              role="switch"
              aria-checked={agreed}
              onClick={() => setAgreed((a) => !a)}
              className="relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
              style={{ backgroundColor: agreed ? 'var(--accent-strong)' : 'var(--surface-1)', border: '3px solid #222' }}
            >
              <span
                className="h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                style={{ transform: agreed ? 'translateX(20px)' : 'translateX(1px)', border: '2px solid #222' }}
              />
            </button>
            <span className="whitespace-nowrap text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setLegalOpen(true)}
                style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
              >
                Terms & Privacy Policy
              </button>
            </span>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={processing}
            className={`w-full rounded-full py-1.5 text-sm font-semibold text-white transition ${!agreed ? 'opacity-40' : ''}`}
            style={{
              backgroundColor: 'var(--accent-strong)',
              border: '3px solid #222',
              opacity: processing ? 0.7 : undefined,
            }}
          >
            {processing ? 'Processing…' : 'Unlock my plan'}
          </button>
          {checkoutError && (
            <p className="mt-1 text-center text-[10px] font-medium" style={{ color: 'var(--status-critical)' }}>
              {checkoutError}
            </p>
          )}
          <p className="mt-1 whitespace-nowrap text-center text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            Secure checkout by Paddle.
            {isSupabaseConfigured && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={restoring}
                  className="underline"
                  style={{ opacity: restoring ? 0.6 : undefined }}
                >
                  {restoring ? 'Opening Google…' : 'Already purchased?'}
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="relative z-10 mt-1.5 shrink-0 text-center text-[10px]" style={{ color: 'var(--text-secondary)' }}>
        Just for fun & motivation — not medical advice.
      </p>

      {legalOpen && <LegalPanel onClose={() => setLegalOpen(false)} />}

      {showAgreeError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div
            className="modal-card-enter rounded-2xl px-5 py-4 text-center"
            style={{ backgroundColor: 'var(--surface-1)', border: '2px solid var(--accent-strong)', boxShadow: '0 10px 26px rgba(11,11,11,0.25)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Please agree to the Terms of Use first
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function PlanCard({
  selected,
  onSelect,
  title,
  price,
  period,
  note,
  badge,
  featured,
  countdown,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  price: string
  period: string
  note?: string
  badge?: string
  featured?: boolean
  countdown?: string
}) {
  const isGold = featured && selected
  const textColor = isGold ? '#2c1a04' : 'var(--text-primary)'
  return (
    <button
      onClick={onSelect}
      className="relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-2 text-left transition"
      style={{
        backgroundColor: isGold ? '#d1a350' : selected ? '#e8bd72' : '#f7ead0',
        border: isGold ? '3px solid #7a4c14' : selected ? '3px solid #6b3f10' : '3px solid var(--accent-strong)',
        boxShadow: isGold ? '0 6px 18px rgba(122,76,20,0.35)' : undefined,
      }}
    >
      {isGold && <span className="shine-sweep pointer-events-none" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-sm font-semibold" style={{ color: textColor }}>
            {title}
          </span>
          {badge && (
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: 'var(--status-good)' }}
            >
              {badge}
            </span>
          )}
          {countdown && (
            <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold" style={{ color: 'var(--status-critical)' }}>
              <ClockIcon className="h-2.5 w-2.5" />
              {countdown}
            </span>
          )}
        </div>
        {note && (
          <div className="truncate text-xs" style={{ color: isGold ? '#5c3d10' : 'var(--text-secondary)' }}>
            {note}
          </div>
        )}
      </div>
      <div className="ml-1 flex shrink-0 items-baseline gap-1">
        <span className="text-lg font-bold" style={{ color: textColor }}>
          {price}
        </span>
        <span className="text-xs" style={{ color: isGold ? '#6b4a18' : 'var(--text-muted)' }}>
          {period}
        </span>
      </div>
    </button>
  )
}

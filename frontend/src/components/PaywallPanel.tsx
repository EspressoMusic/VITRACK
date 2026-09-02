import { useEffect, useRef, useState } from 'react'
import type { PaddleEventData } from '@paddle/paddle-js'
import type { BillingPlan } from '../types'
import { activateSubscription } from '../lib/profile'
import { openPaddleCheckout } from '../lib/paddle'
import { waitForServerSubscription } from '../lib/cloudProfile'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { CheckIcon, HeadsetIcon } from './icons'
import { GoogleSignInOverlay } from './GoogleSignInOverlay'
import { LegalPanel } from './LegalPanel'
import { ConfettiBurst } from './ConfettiBurst'
import { useLanguage } from '../contexts/LanguageContext'
import { PAYWALL_PANEL_STRINGS } from '../lib/i18n/paywallPanel'
import {
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  storePendingPurchase,
  type PlanPurchaseDetails,
} from '../lib/tiktokPixel'

type CheckoutData = NonNullable<PaddleEventData['data']>
type PaywallStrings = (typeof PAYWALL_PANEL_STRINGS)['en']

/** Pulls the real charged amount/currency/price-id out of a Paddle checkout event — never
 *  the marketing display price — for accurate TikTok Pixel reporting. */
function purchaseDetailsFromCheckout(data: CheckoutData | undefined, plan: BillingPlan): PlanPurchaseDetails | null {
  const item = data?.items[0]
  if (!data || !item) return null
  return { plan, priceId: item.price_id, value: data.totals.total, currency: data.currency_code }
}

export function PaywallPanel({ onSubscribed }: { onSubscribed: () => void }) {
  const { user } = useAuth()
  const { lang, dir } = useLanguage()
  const t = PAYWALL_PANEL_STRINGS[lang]
  const [plan, setPlan] = useState<BillingPlan>('yearly')
  const [processing, setProcessing] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [legalOpen, setLegalOpen] = useState(false)
  const [showAgreeError, setShowAgreeError] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  useEffect(() => {
    if (!showAgreeError) return
    const t = setTimeout(() => setShowAgreeError(false), 2200)
    return () => clearTimeout(t)
  }, [showAgreeError])

  // The paid AI features check the server's own subscription record, not this local flag
  // (see supabase/functions/_shared/subscription.ts) — a purchase only actually works once
  // it's linked to a signed-in account. Paddle's own "checkout.completed" event fires
  // client-side and can't prove that on its own, so this reconciles with the server before
  // letting the user into the app.
  async function handleCheckoutCompleted(checkoutData: CheckoutData | undefined) {
    const purchaseDetails = purchaseDetailsFromCheckout(checkoutData, plan)

    // No accounts system configured at all (self-hosted, fully local build) — there's no
    // server record to check against, so we can't independently confirm the charge settled.
    // The local unlock is all there is; TikTok's Purchase event is skipped here since it must
    // never fire on an unverified client-side signal alone.
    if (!isSupabaseConfigured) {
      activateSubscription(plan)
      onSubscribed()
      return
    }

    if (!user) {
      // Safety valve for the rare case anonymous sign-in itself failed (offline, blocked
      // storage, etc.) — never leave someone who already paid stuck behind a sign-in wall.
      // Stash the real transaction amount so Purchase can still fire, exactly once, at the
      // point a real sign-in later links this payment to an account (see cloudProfile.ts).
      if (purchaseDetails) storePendingPurchase(purchaseDetails)
      activateSubscription(plan)
      setProcessing(false)
      onSubscribed()
      return
    }

    // Signed in already (checkout carried supabase_user_id): the webhook that links the
    // purchase can lag a couple of seconds, so poll briefly rather than dropping the user
    // into a "subscription required" error immediately after paying. Only once the server
    // itself confirms the subscription is active do we activate locally and report Purchase —
    // Paddle's client-side "checkout.completed" alone is not proof a real charge went through.
    const confirmed = await waitForServerSubscription()
    setProcessing(false)
    if (confirmed) {
      activateSubscription(plan)
      if (purchaseDetails) trackPurchase(purchaseDetails)
    }
    onSubscribed()
  }

  async function handleSubscribe() {
    if (!agreed) {
      setShowAgreeError(true)
      return
    }
    // Without a user id (anonymous or real) to attach, this purchase could never be linked
    // to any account afterward — an anonymous user has no email to fall back to matching by
    // (see link-paddle-subscription), so it would become permanently unmanageable: no way to
    // see it or cancel it from Settings. Block checkout entirely rather than let that happen;
    // the button below is disabled for the same reason, this is just defense in depth.
    if (isSupabaseConfigured && !user) {
      setCheckoutError(t.errors.accountSetup)
      return
    }
    setCheckoutError(null)
    setProcessing(true)
    try {
      await openPaddleCheckout(
        plan,
        (event) => {
          if (event.name === 'checkout.loaded') {
            const details = purchaseDetailsFromCheckout(event.data, plan)
            if (details) trackInitiateCheckout(details)
          } else if (event.name === 'checkout.payment.selected') {
            const details = purchaseDetailsFromCheckout(event.data, plan)
            if (details) trackAddPaymentInfo(details)
          } else if (event.name === 'checkout.completed') {
            void handleCheckoutCompleted(event.data)
          } else if (event.name === 'checkout.closed') {
            setProcessing(false)
          } else if (event.name === 'checkout.error') {
            setProcessing(false)
            setCheckoutError(t.errors.checkoutFailed)
          }
        },
        user ? { supabase_user_id: user.id } : undefined
      )
    } catch {
      setProcessing(false)
      setCheckoutError(t.errors.checkoutUnavailable)
    }
  }

  return (
    <div
      className="relative mx-auto flex h-svh w-full max-w-md flex-col items-center justify-center overflow-hidden px-3 py-2"
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
        className="relative z-10 flex w-full min-h-0 max-h-full flex-col items-center gap-1.5 overflow-hidden rounded-3xl px-5 py-3 text-center"
        style={{
          backgroundColor: '#e5c184',
          border: '2px solid var(--accent-strong)',
          boxShadow: '0 10px 26px rgba(11,11,11,0.16)',
        }}
      >
        <div className="shrink-0 text-center">
          <h1 className="headline-anim text-base font-bold leading-snug">
            {t.headline}
          </h1>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-1 text-start">
          {t.features.map((f, i) => (
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
            title={t.yearly.title}
            originalPrice="$120"
            price="$89"
            period={t.yearly.period}
            note={t.yearly.note}
          />
          <PlanCard
            selected={plan === 'monthly'}
            onSelect={() => setPlan('monthly')}
            title={t.monthly.title}
            price="$19.9"
            period={t.monthly.period}
            note={t.monthly.note}
          />
        </div>

        <div className="w-full shrink-0">
          <div className="mb-1 flex items-center gap-2 text-start">
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
                  transform: agreed
                    ? `translateX(calc(${dir === 'rtl' ? '-1' : '1'} * 0.875rem))`
                    : 'translateX(0px)',
                  border: '1px solid #222',
                }}
              />
            </button>
            <span className="whitespace-nowrap text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              {t.agreePrefix}
              <button
                type="button"
                onClick={() => setLegalOpen(true)}
                style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
              >
                {t.agreeLinkLabel}
              </button>
            </span>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={processing || (isSupabaseConfigured && !user)}
            className={`w-full rounded-full py-1.5 text-sm font-semibold text-white transition ${!agreed ? 'opacity-40' : ''}`}
            style={{
              backgroundColor: 'var(--accent-strong)',
              border: '2px solid #222', boxShadow: '0 2px 0 #222',
              opacity: processing ? 0.7 : undefined,
            }}
          >
            {processing ? t.processingCta : t.subscribeCta}
          </button>
          {checkoutError && (
            <p className="mt-1 text-center text-[10px] font-medium" style={{ color: 'var(--status-critical)' }}>
              {checkoutError}
            </p>
          )}
          <p className="mt-1 text-center text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
            {t.footerNote}
            {isSupabaseConfigured && (
              <>
                {' '}
                <span className="relative inline-block">
                  <button type="button" tabIndex={-1} aria-hidden="true" className="underline">
                    {t.alreadyPurchased}
                  </button>
                  <GoogleSignInOverlay />
                </span>
              </>
            )}
          </p>
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                activateSubscription(plan)
                onSubscribed()
              }}
              className="mt-1.5 w-full rounded-full py-1 text-[10px] font-semibold"
              style={{ color: 'var(--text-secondary)', border: '1px dashed var(--text-secondary)' }}
            >
              Dev: skip payment
            </button>
          )}
        </div>
      </div>

      <div className="absolute top-0 end-0 z-20 p-3" style={{ pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <SupportMenu t={t} dir={dir} />
        </div>
      </div>

      {legalOpen && <LegalPanel onClose={() => setLegalOpen(false)} />}

      {showAgreeError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div
            className="modal-card-enter rounded-2xl px-5 py-4 text-center"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--accent-strong)', boxShadow: '0 10px 26px rgba(11,11,11,0.25)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t.agreeErrorModal}
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
  originalPrice,
  price,
  period,
  note,
  featured,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  originalPrice?: string
  price: string
  period: string
  note?: string
  featured?: boolean
}) {
  const isGold = featured && selected
  const textColor = isGold ? '#2c1a04' : 'var(--text-primary)'
  return (
    <button
      onClick={onSelect}
      className="relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-2 text-start transition"
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
        </div>
        {note && (
          <div className="truncate text-xs" style={{ color: isGold ? '#5c3d10' : 'var(--text-secondary)' }}>
            {note}
          </div>
        )}
      </div>
      <div className="ms-1 flex shrink-0 items-baseline gap-1">
        {originalPrice && (
          <span
            className="text-xs line-through opacity-70"
            style={{ color: isGold ? '#6b4a18' : 'var(--text-muted)' }}
          >
            {originalPrice}
          </span>
        )}
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

function SupportMenu({ t, dir }: { t: PaywallStrings; dir: 'ltr' | 'rtl' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative" dir={dir}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.supportAriaLabel}
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.55)', color: 'var(--text-primary)' }}
      >
        <HeadsetIcon className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute end-0 top-10 z-30 flex flex-col overflow-hidden rounded-2xl py-1"
          style={{
            backgroundColor: 'var(--surface-cream)',
            border: '1.5px solid var(--accent-strong)',
            boxShadow: '0 8px 20px rgba(11,11,11,0.18)',
            minWidth: 170,
          }}
        >
          <a
            href="mailto:shilohdhd1@gmail.com"
            className="whitespace-nowrap px-4 py-2 text-start text-xs font-medium"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setOpen(false)}
          >
            {t.supportEmailLabel}
          </a>
          <a
            href="https://wa.me/972586122187"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-4 py-2 text-start text-xs font-medium"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setOpen(false)}
          >
            {t.supportWhatsappLabel}
          </a>
        </div>
      )}
    </div>
  )
}

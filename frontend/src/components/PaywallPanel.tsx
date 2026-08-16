import { useState } from 'react'
import type { BillingPlan } from '../types'
import { activateMockSubscription } from '../lib/profile'
import { CheckIcon, SparkleIcon } from './icons'

const FEATURES = [
  'Personalized daily vitamin & mineral targets',
  'AI meal photo analysis',
  'Calendar history & weekly insights',
  'Deficiency alerts with food suggestions',
]

export function PaywallPanel({ onSubscribed }: { onSubscribed: () => void }) {
  const [plan, setPlan] = useState<BillingPlan>('yearly')
  const [processing, setProcessing] = useState(false)

  function handleSubscribe() {
    setProcessing(true)
    // Mock checkout — no payment processor is connected yet. Replace with real
    // Stripe/App Store billing (and gate on webhook confirmation) before launch.
    setTimeout(() => {
      activateMockSubscription(plan)
      onSubscribed()
    }, 600)
  }

  return (
    <div
      className="mx-auto flex h-screen w-full max-w-md flex-col overflow-y-auto px-6 py-8"
      style={{ backgroundColor: 'var(--surface-0)' }}
    >
      <div className="flex flex-1 flex-col items-center text-center">
        <span
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
        >
          <SparkleIcon className="h-7 w-7" />
        </span>
        <h1 className="mb-1 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Unlock Vitrack
        </h1>
        <p className="mb-6 max-w-[85%] text-sm" style={{ color: 'var(--text-secondary)' }}>
          Subscribe to start tracking meals against your personalized targets.
        </p>

        <div className="mb-6 flex w-full flex-col gap-2 text-left">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--status-good-soft)', color: 'var(--status-good)' }}
              >
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {f}
              </span>
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col gap-3">
          <PlanCard
            selected={plan === 'yearly'}
            onSelect={() => setPlan('yearly')}
            title="Yearly"
            price="$99"
            period="/year"
            note="≈ $8.25/mo"
            badge="Save 57%"
          />
          <PlanCard selected={plan === 'monthly'} onSelect={() => setPlan('monthly')} title="Monthly" price="$19" period="/month" />
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={handleSubscribe}
          disabled={processing}
          className="w-full rounded-full py-3.5 text-base font-semibold text-white transition"
          style={{ backgroundColor: 'var(--accent-strong)', opacity: processing ? 0.7 : 1 }}
        >
          {processing ? 'Processing…' : plan === 'yearly' ? 'Subscribe — $99/year' : 'Subscribe — $19/month'}
        </button>
        <p className="mt-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Cancel anytime. Demo checkout for now — no card is charged.
        </p>
      </div>
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
}: {
  selected: boolean
  onSelect: () => void
  title: string
  price: string
  period: string
  note?: string
  badge?: string
}) {
  return (
    <button
      onClick={onSelect}
      className="relative flex items-center justify-between rounded-2xl px-4 py-3.5 text-left transition"
      style={{
        backgroundColor: selected ? 'var(--accent-soft)' : 'var(--surface-1)',
        border: selected ? '2px solid var(--accent-strong)' : '1px solid var(--border-strong)',
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </span>
          {badge && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: 'var(--status-good)' }}
            >
              {badge}
            </span>
          )}
        </div>
        {note && (
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {note}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {price}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {period}
        </span>
      </div>
    </button>
  )
}

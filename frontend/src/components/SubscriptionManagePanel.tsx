import { useEffect, useState } from 'react'
import type { BillingPlan } from '../types'
import {
  cancelSubscription,
  getSubscriptionDetails,
  changeSubscriptionPlan,
  resumeSubscription,
  type SubscriptionDetails,
} from '../lib/subscriptionManagement'
import { CloseIcon, SwapIcon } from './icons'
import { useLanguage } from '../contexts/LanguageContext'
import { SUBSCRIPTION_MANAGE_PANEL_STRINGS } from '../lib/i18n/subscriptionManagePanel'
import type { Lang } from '../lib/i18n/lang'

const PLAN_PRICE: Record<BillingPlan, string> = {
  yearly: '$99',
  monthly: '$19',
}

function formatDate(iso: string | null, lang: Lang): string {
  if (!iso) return ''
  const locale = lang === 'he' ? 'he-IL' : lang === 'ar' ? 'ar' : 'en-US'
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function SubscriptionManagePanel({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const { lang } = useLanguage()
  const t = SUBSCRIPTION_MANAGE_PANEL_STRINGS[lang]
  const [details, setDetails] = useState<SubscriptionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null)
  const [confirmingSwitch, setConfirmingSwitch] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    getSubscriptionDetails()
      .then((d) => {
        if (cancelled) return
        setDetails(d)
        setSelectedPlan(d.plan)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t.errors.load)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [t])

  async function handleSwitchPlan() {
    if (!selectedPlan) return
    setBusy(true)
    setError(null)
    try {
      const d = await changeSubscriptionPlan(selectedPlan)
      setDetails(d)
      setConfirmingSwitch(false)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.switch)
    } finally {
      setBusy(false)
    }
  }

  async function handleCancel() {
    setBusy(true)
    setError(null)
    try {
      const d = await cancelSubscription()
      setDetails(d)
      setConfirmingCancel(false)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.cancel)
    } finally {
      setBusy(false)
    }
  }

  async function handleResume() {
    setBusy(true)
    setError(null)
    try {
      const d = await resumeSubscription()
      setDetails(d)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.resume)
    } finally {
      setBusy(false)
    }
  }

  const canSwitchPlans = !!details && !details.cancelAtPeriodEnd
  const otherPlan: BillingPlan | null = details?.plan === 'yearly' ? 'monthly' : details?.plan === 'monthly' ? 'yearly' : null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-3.5"
        style={{ backgroundColor: '#e5c184', border: '1px solid #1a1a19' }}
      >
        <div className="relative mb-2 flex shrink-0 items-center justify-center">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t.title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t.closeAria}
            className="absolute end-0 flex h-6 w-6 items-center justify-center rounded-full"
            style={{ color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pb-1 pe-1">
          {loading && (
            <p className="text-center text-[13px]" style={{ color: 'var(--text-primary)' }}>
              {t.loading}
            </p>
          )}

          {!loading && !details && (
            <p className="text-center text-[13px]" style={{ color: 'var(--status-critical)' }}>
              {error || t.noSubscription}
            </p>
          )}

          {details && (
            <>
              {details.cancelAtPeriodEnd ? (
                <div
                  className="flex flex-col gap-2 rounded-xl p-2.5"
                  style={{ backgroundColor: 'var(--status-critical-soft)', border: '2px solid #000000' }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--status-critical)' }}>
                    {t.cancelsOn(formatDate(details.cancelEffectiveAt, lang))}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    {t.cancelNotice}
                  </p>
                  <button
                    onClick={handleResume}
                    disabled={busy}
                    className="rounded-xl py-2 text-[13px] font-semibold transition-transform active:translate-y-1 active:shadow-none"
                    style={{
                      backgroundColor: 'var(--surface-cream)',
                      border: '2px solid #000000',
                      boxShadow: '0 2px 0 #000000',
                      color: 'var(--text-primary)',
                      opacity: busy ? 0.7 : undefined,
                    }}
                  >
                    {busy ? t.working : t.keepMySubscription}
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between rounded-xl p-2.5"
                  style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
                >
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {t.planInfo[details.plan === 'yearly' ? 'yearly' : 'monthly'].title}
                  </span>
                  {details.currentPeriodEnd && (
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {t.renews(formatDate(details.currentPeriodEnd, lang))}
                    </span>
                  )}
                </div>
              )}

              {canSwitchPlans && otherPlan && (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                    {t.billingCycle}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {(['yearly', 'monthly'] as const).map((p) => {
                      const info = t.planInfo[p]
                      const isSelected = selectedPlan === p
                      const isCurrent = details.plan === p
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setSelectedPlan(p)
                            setConfirmingSwitch(false)
                          }}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-start transition"
                          style={{
                            backgroundColor: isSelected ? '#e8bd72' : 'var(--surface-cream)',
                            border: isSelected ? '3px solid #6b3f10' : '2px solid #000000',
                          }}
                        >
                          <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                            {info.title}
                            {isCurrent && <span style={{ color: 'var(--text-secondary)' }}> · {t.current}</span>}
                          </span>
                          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {PLAN_PRICE[p]}
                            <span className="text-[11px] font-normal" style={{ color: 'var(--text-secondary)' }}>
                              {info.period}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {selectedPlan && selectedPlan !== details.plan && (
                    <div className="mt-2 flex flex-col gap-2">
                      {!confirmingSwitch ? (
                        <button
                          onClick={() => setConfirmingSwitch(true)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
                          style={{ backgroundColor: 'var(--accent-strong)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
                        >
                          <SwapIcon className="h-4 w-4" /> {t.switchTo(t.planInfo[selectedPlan].title)}
                        </button>
                      ) : (
                        <>
                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                            {t.switchConfirm(t.planInfo[selectedPlan].title, PLAN_PRICE[selectedPlan], t.planInfo[selectedPlan].period)}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setConfirmingSwitch(false)
                                setSelectedPlan(details.plan)
                              }}
                              className="flex-1 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                              style={{ border: '2px solid #000000', boxShadow: '0 2px 0 #000000', color: 'var(--text-primary)' }}
                            >
                              {t.cancelAction}
                            </button>
                            <button
                              onClick={handleSwitchPlan}
                              disabled={busy}
                              className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
                              style={{
                                backgroundColor: 'var(--accent-strong)',
                                border: '2px solid #000000',
                                boxShadow: '0 2px 0 #000000',
                                opacity: busy ? 0.7 : undefined,
                              }}
                            >
                              {busy ? t.switching : t.confirm}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {details.updatePaymentMethodUrl && (
                <a
                  href={details.updatePaymentMethodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                  style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
                >
                  {t.updatePaymentMethod}
                </a>
              )}

              {!details.cancelAtPeriodEnd && (
                <div>
                  {!confirmingCancel ? (
                    <button
                      onClick={() => setConfirmingCancel(true)}
                      className="flex w-full items-center justify-center rounded-xl py-2 text-[13px] font-medium underline"
                      style={{ color: 'var(--status-critical)' }}
                    >
                      {t.cancelSubscriptionLink}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 rounded-xl p-2.5" style={{ backgroundColor: 'var(--status-critical-soft)', border: '2px solid #000000' }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--status-critical)' }}>
                        {details.currentPeriodEnd
                          ? t.cancelConfirmWithDate(formatDate(details.currentPeriodEnd, lang))
                          : t.cancelConfirmNoDate}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmingCancel(false)}
                          className="flex-1 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                          style={{ border: '2px solid #000000', boxShadow: '0 2px 0 #000000', color: 'var(--text-primary)' }}
                        >
                          {t.keepSubscriptionAction}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={busy}
                          className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
                          style={{
                            backgroundColor: 'var(--status-critical)',
                            border: '2px solid #000000',
                            boxShadow: '0 2px 0 #000000',
                            opacity: busy ? 0.7 : undefined,
                          }}
                        >
                          {busy ? t.canceling : t.cancelSubscriptionButton}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-center text-xs font-medium" style={{ color: 'var(--status-critical)' }}>
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

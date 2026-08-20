import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { clearAllMeals } from '../lib/db'
import { getBillingPlan, isSubscribed, resetOnboarding } from '../lib/profile'
import { isInstallable, isStandalone, isIOS, onInstallabilityChange, promptInstall } from '../lib/pwa'
import {
  isNotificationSupported,
  getNotificationPermission,
  getNotificationPref,
  setNotificationPref,
  requestNotificationPermission,
} from '../lib/notifications'
import { CloseIcon, DocumentIcon, LogOutIcon, StarIcon, TrashIcon, UserIcon, DownloadIcon, BellIcon } from './icons'
import { LegalPanel } from './LegalPanel'

export function SettingsPanel({ onClose, onDataCleared }: { onClose: () => void; onDataCleared: () => void }) {
  const { user, signInWithGoogle, signOut, deleteAccount } = useAuth()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [confirmingDeleteAccount, setConfirmingDeleteAccount] = useState(false)
  const [confirmingRetake, setConfirmingRetake] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [legalOpen, setLegalOpen] = useState(false)
  const [installable, setInstallable] = useState(isInstallable)
  const [notifPref, setNotifPref] = useState(getNotificationPref)
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission)
  const isPro = isSubscribed()
  const plan = getBillingPlan()

  useEffect(() => onInstallabilityChange(() => setInstallable(isInstallable())), [])

  async function handleInstall() {
    if (installable) {
      await promptInstall()
      setInstallable(isInstallable())
    }
  }

  async function handleToggleNotifications() {
    if (notifPref) {
      setNotifPref(false)
      setNotificationPref(false)
      return
    }
    const permission = await requestNotificationPermission()
    setNotifPermission(permission)
    const enabled = permission === 'granted'
    setNotifPref(enabled)
    setNotificationPref(enabled)
  }

  function handleRetakeQuestionnaire() {
    resetOnboarding()
    window.location.reload()
  }

  async function handleClear() {
    await clearAllMeals()
    setConfirmingClear(false)
    onDataCleared()
    onClose()
  }

  async function handleSignIn() {
    setAuthError(null)
    try {
      await signInWithGoogle()
    } catch {
      setAuthError('Sign-in not set up yet.')
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount()
      setConfirmingDeleteAccount(false)
      onClose()
    } catch {
      setAuthError('Could not delete account.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-3.5"
        style={{ backgroundColor: '#e5c184', border: '1px solid #1a1a19' }}
      >
        <div className="relative mb-2 flex shrink-0 items-center justify-center">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="absolute right-0 flex h-6 w-6 items-center justify-center rounded-full"
            style={{ color: 'var(--text-primary)' }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pb-1 pr-1">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Account
            </p>

            {user ? (
              <div className="flex flex-col gap-2">
                <div
                  className="flex items-center gap-2 rounded-xl p-2"
                  style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <span className="truncate text-[13px]" style={{ color: 'var(--text-primary)' }}>
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                  style={{ border: '2px solid #000000', boxShadow: '0 2px 0 #000000', color: 'var(--text-primary)' }}
                >
                  <LogOutIcon className="h-4 w-4" /> Sign out
                </button>

                {!confirmingDeleteAccount ? (
                  <button
                    onClick={() => setConfirmingDeleteAccount(true)}
                    className="text-center text-xs font-medium underline"
                    style={{ color: 'var(--status-critical)' }}
                  >
                    Delete account
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--status-critical)' }}>
                      Deletes everything. Can't be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmingDeleteAccount(false)}
                        className="flex-1 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                        style={{ border: '2px solid #000000', boxShadow: '0 2px 0 #000000', color: 'var(--text-primary)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
                        style={{ backgroundColor: 'var(--status-critical)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSignIn}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                  style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
                >
                  <UserIcon className="h-4 w-4" /> Sign in with Google
                </button>
                {!isSupabaseConfigured && (
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    Not connected yet.
                  </p>
                )}
              </div>
            )}
            {authError && (
              <p className="mt-2 text-xs" style={{ color: 'var(--status-critical)' }}>
                {authError}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Subscription
            </p>
            <div
              className="flex items-center justify-between rounded-xl p-2"
              style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: isPro ? 'var(--accent)' : 'var(--text-primary)' }}>
                  <StarIcon className="h-4 w-4" />
                </span>
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {isPro ? `Pro plan · ${plan === 'yearly' ? 'Yearly' : 'Monthly'}` : 'Free plan'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Health profile
            </p>
            {!confirmingRetake ? (
              <button
                onClick={() => setConfirmingRetake(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000', color: 'var(--text-primary)' }}
              >
                Retake questionnaire
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                  This recalculates your targets from scratch.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingRetake(false)}
                    className="flex-1 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                    style={{ border: '2px solid #000000', boxShadow: '0 2px 0 #000000', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRetakeQuestionnaire}
                    className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
                    style={{ backgroundColor: 'var(--accent-strong)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
                  >
                    Retake
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              App
            </p>
            <div className="flex flex-col gap-2">
              {installable && (
                <button
                  onClick={handleInstall}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                  style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
                >
                  <DownloadIcon className="h-4 w-4" /> Download app
                </button>
              )}
              {!installable && isIOS() && !isStandalone() && (
                <p
                  className="rounded-xl p-2 text-xs"
                  style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000', color: 'var(--text-primary)' }}
                >
                  To install: tap the Share button in Safari, then "Add to Home Screen".
                </p>
              )}

              {isNotificationSupported() && (
                <div
                  className="flex items-center justify-between rounded-xl p-2"
                  style={{ backgroundColor: 'var(--surface-cream)', border: '2px solid #000000' }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-primary)' }}>
                      <BellIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        Vitamin reminders
                      </p>
                      {notifPermission === 'denied' && (
                        <p className="text-[11px]" style={{ color: 'var(--status-critical)' }}>
                          Blocked in browser settings
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifPref}
                    onClick={handleToggleNotifications}
                    disabled={notifPermission === 'denied'}
                    className="relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: notifPref ? 'var(--accent-strong)' : 'var(--surface-1)',
                      border: '2px solid #000000',
                      opacity: notifPermission === 'denied' ? 0.5 : 1,
                    }}
                  >
                    <span
                      className="h-5 w-5 rounded-full bg-white shadow transition-transform"
                      style={{ transform: notifPref ? 'translateX(21px)' : 'translateX(1px)' }}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Data
            </p>
            <div className="flex flex-col gap-2">
              {!confirmingClear ? (
                <button
                  onClick={() => setConfirmingClear(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                  style={{ backgroundColor: 'var(--status-critical-soft)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000', color: 'var(--status-critical)' }}
                >
                  <TrashIcon className="h-4 w-4" /> Clear all data
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium" style={{ color: 'var(--status-critical)' }}>
                    Deletes everything. Can't be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmingClear(false)}
                      className="flex-1 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                      style={{ border: '2px solid #000000', boxShadow: '0 2px 0 #000000', color: 'var(--text-primary)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClear}
                      className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
                      style={{ backgroundColor: 'var(--status-critical)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Support
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:shilohdhd1@gmail.com"
                className="flex w-full items-center justify-center rounded-xl py-2 text-[13px] font-medium"
                style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000' }}
              >
                Contact support
              </a>
              <button
                onClick={() => setLegalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-medium transition-transform active:translate-y-1 active:shadow-none"
                style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
              >
                <DocumentIcon className="h-4 w-4" /> Terms & Privacy
              </button>
            </div>
          </div>
        </div>
      </div>

      {legalOpen && <LegalPanel onClose={() => setLegalOpen(false)} />}
    </div>
  )
}

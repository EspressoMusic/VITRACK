import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { clearAllMeals } from '../lib/db'
import { getBillingPlan, isSubscribed, resetOnboarding } from '../lib/profile'
import { CloseIcon, LogOutIcon, StarIcon, TrashIcon, UserIcon } from './icons'

export function SettingsPanel({ onClose, onDataCleared }: { onClose: () => void; onDataCleared: () => void }) {
  const { user, signInWithGoogle, signOut, deleteAccount } = useAuth()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [confirmingDeleteAccount, setConfirmingDeleteAccount] = useState(false)
  const [confirmingRetake, setConfirmingRetake] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const isPro = isSubscribed()
  const plan = getBillingPlan()

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
        className="modal-card-enter relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl p-5"
        style={{ backgroundColor: '#f7e4ad', border: '2px solid #1a1a19' }}
      >
        <div className="relative mb-5 flex items-center justify-center">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: 'var(--text-secondary)' }}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Account
          </p>

          {user ? (
            <div className="flex flex-col gap-2">
              <div
                className="flex items-center gap-2 rounded-xl p-3"
                style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  <UserIcon className="h-5 w-5" />
                </span>
                <span className="truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium"
                style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
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
                      className="flex-1 rounded-full py-2.5 text-sm font-medium"
                      style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white"
                      style={{ backgroundColor: 'var(--status-critical)' }}
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
                className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
              >
                <UserIcon className="h-4 w-4" /> Sign in with Google
              </button>
              {!isSupabaseConfigured && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
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

        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Subscription
          </p>
          <div
            className="flex items-center justify-between rounded-xl p-3"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: isPro ? 'var(--accent)' : 'var(--text-muted)' }}>
                <StarIcon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {isPro ? `Pro plan · ${plan === 'yearly' ? 'Yearly' : 'Monthly'}` : 'Free plan'}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Demo checkout — no card has been charged.
          </p>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Health profile
          </p>
          <p className="mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Your daily vitamin & mineral targets are based on the questionnaire you answered at sign-up.
          </p>
          {!confirmingRetake ? (
            <button
              onClick={() => setConfirmingRetake(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
            >
              Retake questionnaire
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                This recalculates your targets from scratch.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingRetake(false)}
                  className="flex-1 rounded-full py-2.5 text-sm font-medium"
                  style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetakeQuestionnaire}
                  className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent-strong)' }}
                >
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Data
          </p>
          <p className="mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {user ? 'Synced to your account.' : 'Stored on this device only.'}
          </p>

          {!confirmingClear ? (
            <button
              onClick={() => setConfirmingClear(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium"
              style={{ border: '1px solid var(--status-critical)', color: 'var(--status-critical)' }}
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
                  className="flex-1 rounded-full py-2.5 text-sm font-medium"
                  style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--status-critical)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Support
          </p>
          <a
            href="mailto:shilohdhd1@gmail.com"
            className="flex w-full items-center justify-center rounded-full py-2.5 text-sm font-medium"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
          >
            Contact support
          </a>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Credits
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Icons by{' '}
            <a
              href="https://www.flaticon.com/free-icons/avocado"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}
            >
              justicon - Flaticon
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

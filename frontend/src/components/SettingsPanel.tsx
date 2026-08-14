import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { clearAllMeals } from '../lib/db'
import { CloseIcon, LogOutIcon, StarIcon, TrashIcon, UserIcon } from './icons'

export function SettingsPanel({ onClose, onDataCleared }: { onClose: () => void; onDataCleared: () => void }) {
  const { user, signInWithGoogle, signOut, deleteAccount } = useAuth()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [confirmingDeleteAccount, setConfirmingDeleteAccount] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

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
      setAuthError('Sign-in is not set up yet — connect Supabase in backend/.env first.')
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount()
      setConfirmingDeleteAccount(false)
      onClose()
    } catch {
      setAuthError('Could not delete the account. Try again later.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div
        className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl p-5"
        style={{ backgroundColor: '#f7e4ad', border: '1px solid var(--border)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-8 w-8 items-center justify-center rounded-full"
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
                    This permanently deletes your account and all synced meal data. This can't be undone.
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
                      Delete account
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Sign in to sync your meal history across devices.
              </p>
              <button
                onClick={handleSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
              >
                <UserIcon className="h-4 w-4" /> Sign in with Google
              </button>
              {!isSupabaseConfigured && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Not connected yet — add Supabase credentials to enable sign-in.
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
                {isPro ? 'Pro plan' : 'Free plan'}
              </span>
            </div>
            {!isPro && (
              <button
                onClick={() => setIsPro(true)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Upgrade
              </button>
            )}
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Payments aren't live yet — this is a preview of the upgrade screen.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Data
          </p>
          <p className="mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {user
              ? 'Your meal photos and nutrition history sync to your account.'
              : 'All meal photos and nutrition history are stored only on this device, in this browser.'}
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
                This permanently deletes every logged meal. This can't be undone.
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
                  Delete everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

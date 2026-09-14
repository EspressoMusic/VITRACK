const KEY = 'vitrack:pendingChallengeAnnounce'
const COMPLETED_KEY = 'vitrack:pendingChallengeCompleted'

/** Called when a new weekly challenge is started, so the chat bot can greet it next time the
 *  user opens the chat tab (ChatPanel remounts fresh on every tab switch, so this can't just
 *  live in component state). */
export function setPendingChallengeAnnounce(challengeName: string): void {
  localStorage.setItem(KEY, challengeName)
}

/** Reads and clears the pending announcement — one-shot, so switching back to chat later
 *  doesn't repeat the greeting. */
export function consumePendingChallengeAnnounce(): string | null {
  const name = localStorage.getItem(KEY)
  if (name) localStorage.removeItem(KEY)
  return name
}

/** Same one-shot handoff, for when a weekly challenge is fully completed (all 7 days done). */
export function setPendingChallengeCompleted(challengeName: string): void {
  localStorage.setItem(COMPLETED_KEY, challengeName)
}

export function consumePendingChallengeCompleted(): string | null {
  const name = localStorage.getItem(COMPLETED_KEY)
  if (name) localStorage.removeItem(COMPLETED_KEY)
  return name
}

/** Non-destructive read, for App.tsx to check whether a challenge announcement is waiting
 *  without stealing it from ChatPanel's own one-shot consume on next chat-tab open. */
export function peekPendingChallengeAnnounce(): string | null {
  return localStorage.getItem(KEY)
}

export function peekPendingChallengeCompleted(): string | null {
  return localStorage.getItem(COMPLETED_KEY)
}

const TOAST_SEEN_KEY = 'vitrack:pendingChallengeToastSeenFor'

/** Dedupe key is separate from the pending flags themselves — the flag must survive until the
 *  user actually opens chat (so ChatPanel can still greet them there), but the heads-up toast
 *  should only pop once per item instead of on every tab switch while it's still unread. */
export function shouldShowChallengeToast(kind: 'started' | 'completed', name: string): boolean {
  return localStorage.getItem(TOAST_SEEN_KEY) !== `${kind}|${name}`
}

export function markChallengeToastSeen(kind: 'started' | 'completed', name: string): void {
  localStorage.setItem(TOAST_SEEN_KEY, `${kind}|${name}`)
}

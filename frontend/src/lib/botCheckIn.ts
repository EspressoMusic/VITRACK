const KEY = 'vitrack:lastBotCheckIn'
const ROLL_KEY = 'vitrack:pendingBotCheckInRoll'
const MIN_GAP_MS = 6 * 60 * 60 * 1000
// How long a dice roll stays valid. Needs to outlive the gap between App.tsx flagging the nav
// badge and the user actually tapping into the chat tab, so both land on the same answer.
const ROLL_TTL_MS = 10 * 60 * 1000
const CHANCE = 0.35

function withinCooldown(): boolean {
  const last = localStorage.getItem(KEY)
  return !!last && Date.now() - Number(last) < MIN_GAP_MS
}

/** The roll is cached for a few minutes instead of re-rolled on every call, so App.tsx (deciding
 *  whether to light up the chat tab badge) and ChatPanel (deciding whether to actually insert the
 *  message on open) always agree — otherwise each side rolls independently and the badge can miss
 *  a check-in that fires anyway, or promise one that never comes. */
function rolledPending(): boolean {
  if (withinCooldown()) return false
  const cached = localStorage.getItem(ROLL_KEY)
  if (cached) {
    const [ts, val] = cached.split(':')
    if (Date.now() - Number(ts) < ROLL_TTL_MS) return val === '1'
  }
  const decided = Math.random() < CHANCE
  localStorage.setItem(ROLL_KEY, `${Date.now()}:${decided ? '1' : '0'}`)
  return decided
}

/** Occasionally, when the chat tab opens, the bot sends an unprompted check-in message — not
 *  tied to any specific event, just a periodic "how's it going". Gated by both a minimum gap
 *  since the last one (so it can't fire twice in the same sitting) and a random roll (so it
 *  doesn't show up every single time and feel scripted). */
export function shouldSendCheckIn(): boolean {
  return rolledPending()
}

/** Non-destructive read of the same decision, for App.tsx to light up the chat tab badge before
 *  the user opens chat — mirrors how challenge start/complete greetings are peeked. */
export function peekShouldSendCheckIn(): boolean {
  return rolledPending()
}

export function markCheckInSent(): void {
  localStorage.setItem(KEY, String(Date.now()))
  localStorage.removeItem(ROLL_KEY)
}

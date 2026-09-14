const KEY = 'vitrack:lastBotCheckIn'
const MIN_GAP_MS = 6 * 60 * 60 * 1000
const CHANCE = 0.35

/** Occasionally, when the chat tab opens, the bot sends an unprompted check-in message — not
 *  tied to any specific event, just a periodic "how's it going". Gated by both a minimum gap
 *  since the last one (so it can't fire twice in the same sitting) and a random roll (so it
 *  doesn't show up every single time and feel scripted). */
export function shouldSendCheckIn(): boolean {
  const last = localStorage.getItem(KEY)
  if (last && Date.now() - Number(last) < MIN_GAP_MS) return false
  return Math.random() < CHANCE
}

export function markCheckInSent(): void {
  localStorage.setItem(KEY, String(Date.now()))
}

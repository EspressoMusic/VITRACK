import { todayKey } from './date'

const KEY = 'vitrack:botAlertToastSeenFor'

interface MoodSignatureInput {
  junkFoodName: string | null
  challengeBroken: boolean
  challengeName: string | null
}

/** Signature of "what the bot is currently upset about" — lets the heads-up toast show once
 *  per distinct trigger instead of on every render while the underlying condition still holds
 *  (e.g. every tab switch for the same already-seen junk food / broken challenge). Includes
 *  today's date so an identical food/challenge name on a later day is treated as new. */
function signatureFor(mood: MoodSignatureInput): string {
  if (!mood.junkFoodName && !mood.challengeBroken) return ''
  return `${todayKey()}|${mood.junkFoodName ?? ''}|${mood.challengeBroken ? mood.challengeName ?? '' : ''}`
}

export function shouldShowBotAlertToast(mood: MoodSignatureInput): boolean {
  const sig = signatureFor(mood)
  if (!sig) return false
  return localStorage.getItem(KEY) !== sig
}

export function markBotAlertToastSeen(mood: MoodSignatureInput): void {
  const sig = signatureFor(mood)
  if (sig) localStorage.setItem(KEY, sig)
}

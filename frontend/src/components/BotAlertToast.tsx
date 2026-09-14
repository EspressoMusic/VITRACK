import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { NUTRITION_CHAT_STRINGS } from '../lib/i18n/nutritionChat'
import { askNutritionBot, AnalyzeError } from '../lib/api'
import type { BotMoodStatus } from '../lib/botMood'
import type { BotPersonality } from '../lib/botPersonality'
import { pickBotRant } from '../lib/botRant'
import { BotIcon, CloseIcon, SendIcon } from './icons'

const AUTO_DISMISS_MS = 8000

export type BotAlertPayload =
  | { kind: 'angry'; mood: BotMoodStatus }
  | { kind: 'challengeStarted'; challengeName: string }
  | { kind: 'challengeCompleted'; challengeName: string }

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** WhatsApp-style heads-up card: pops up over whatever tab the user is on whenever the bot has
 *  something to say that would otherwise just sit queued until the next chat-tab visit — an
 *  angry rant, or a challenge-started/completed greeting. Tapping the card body opens the real
 *  chat tab; the inline reply field lets them fire back without leaving what they were doing.
 *  That one exchange lives only in this card — ChatPanel's own history already resets on every
 *  tab switch, so there's nothing to keep in sync. */
export function BotAlertToast({
  alert,
  personality,
  onOpenChat,
  onDismiss,
}: {
  alert: BotAlertPayload
  personality: BotPersonality
  onOpenChat: () => void
  onDismiss: () => void
}) {
  const { lang, dir } = useLanguage()
  const t = NUTRITION_CHAT_STRINGS[lang]
  const isGrumpy = personality === 'angry' || personality === 'superAngry'
  const isAngry = alert.kind === 'angry'
  const [rantText] = useState(() => {
    if (alert.kind === 'angry') return pickBotRant(alert.mood, t)
    if (alert.kind === 'challengeStarted') {
      return pickRandom(isGrumpy ? t.challengeStartedGrumpy : t.challengeStartedGentle).replace('{challenge}', alert.challengeName)
    }
    return pickRandom(isGrumpy ? t.challengeCompletedGrumpy : t.challengeCompletedGentle).replace('{challenge}', alert.challengeName)
  })
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [botReply, setBotReply] = useState<string | null>(null)

  // Auto-hide if ignored, like a real notification — but once the user gets a reply, leave it
  // up until they close it themselves so they have time to read it.
  useEffect(() => {
    if (botReply) return
    const id = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botReply])

  async function handleSend() {
    const text = replyText.trim()
    if (!text || sending) return
    setSending(true)
    try {
      const res = await askNutritionBot(
        [
          { role: 'assistant', content: rantText },
          { role: 'user', content: text },
        ],
        lang,
        'nutrition',
        personality
      )
      setBotReply(res.reply)
    } catch (err) {
      setBotReply(err instanceof AnalyzeError ? err.message : t.errorMessage)
    } finally {
      setSending(false)
      setReplyText('')
    }
  }

  return (
    <div
      className="absolute inset-x-3 top-3 z-40 flex flex-col gap-2 rounded-2xl p-3"
      style={{ backgroundColor: '#e5c184', border: '2.5px solid #000000', boxShadow: '0 4px 0 #000000' }}
    >
      <div className="flex items-start gap-2">
        <button type="button" onClick={onOpenChat} className="flex min-w-0 flex-1 items-start gap-2 text-start">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isAngry ? 'bot-angry-shake' : ''}`}
            style={{ backgroundColor: isAngry ? 'var(--status-critical)' : '#6b4423', color: '#f5deb3' }}
          >
            <BotIcon className="h-5 w-5" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t.title}
            </span>
            <span
              className="text-xs leading-snug"
              style={{ color: botReply ? 'var(--text-primary)' : isAngry ? 'var(--status-critical)' : 'var(--text-primary)' }}
            >
              {sending ? '…' : botReply ?? rantText}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t.closeAriaLabel}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
        >
          <CloseIcon className="h-3 w-3" />
        </button>
      </div>
      {!botReply && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-1.5"
        >
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t.placeholder}
            dir={dir}
            lang={lang}
            disabled={sending}
            className="min-w-0 flex-1 rounded-full px-3 py-1.5 text-xs outline-none"
            style={{ backgroundColor: 'var(--surface-cream)', color: 'var(--text-primary)', border: '1.5px solid #000000' }}
          />
          <button
            type="submit"
            aria-label={t.sendAriaLabel}
            disabled={sending || !replyText.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: '#6b4423', color: '#f5deb3', opacity: sending || !replyText.trim() ? 0.5 : 1 }}
          >
            <SendIcon className="h-3 w-3" />
          </button>
        </form>
      )}
    </div>
  )
}

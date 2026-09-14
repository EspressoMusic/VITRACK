import type { ChatFoodSuggestion, ChatMealSuggestion } from './api'
import type { ChallengeTemplateId } from './nutritionChallengeTemplates'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
  options?: string[]
  foods?: ChatFoodSuggestion[]
  meals?: ChatMealSuggestion[]
  /** Rendered in the bot's angry red styling instead of the normal bubble. */
  angry?: boolean
  /** Set when "options" is a confirm/different-one choice for this locally-generated challenge
   *  suggestion, so picking one of those options is handled locally instead of being sent to
   *  the nutrition Q&A bot (which knows nothing about challenges and would just answer as if
   *  asked a food question). */
  challengeSuggestionId?: ChallengeTemplateId
}

const KEY = 'vitrack:chatHistory'
const TTL_MS = 48 * 60 * 60 * 1000

/** ChatPanel remounts on every tab switch, so its turns live here instead of only in component
 *  state — otherwise leaving the chat tab and coming back wipes the whole conversation. Expires
 *  after 48h of inactivity so an abandoned chat doesn't linger forever. */
export function getChatHistory(): ChatTurn[] | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.turns) || typeof parsed.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(KEY)
      return null
    }
    return parsed.turns
  } catch {
    return null
  }
}

export function setChatHistory(turns: ChatTurn[]): void {
  localStorage.setItem(KEY, JSON.stringify({ turns, savedAt: Date.now() }))
}

export type BotPersonality = 'veryNice' | 'normal' | 'angry' | 'superAngry'

const KEY = 'vitrack:botPersonality'

export function getBotPersonality(): BotPersonality {
  const v = localStorage.getItem(KEY)
  return v === 'veryNice' || v === 'normal' || v === 'angry' || v === 'superAngry' ? v : 'normal'
}

export function setBotPersonality(personality: BotPersonality): void {
  localStorage.setItem(KEY, personality)
}

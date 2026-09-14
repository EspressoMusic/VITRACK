export interface SavedChatFood {
  name: string
  emoji: string
  tip: string
}

const SAVED_CHAT_FOODS_KEY = 'vitrack:savedChatFoods'

export function getSavedChatFoods(): SavedChatFood[] {
  const raw = localStorage.getItem(SAVED_CHAT_FOODS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setSavedChatFoods(foods: SavedChatFood[]): void {
  localStorage.setItem(SAVED_CHAT_FOODS_KEY, JSON.stringify(foods))
}

export function saveChatFood(food: SavedChatFood): void {
  const existing = getSavedChatFoods().filter((f) => f.name !== food.name)
  setSavedChatFoods([food, ...existing])
}

export function unsaveChatFood(name: string): void {
  setSavedChatFoods(getSavedChatFoods().filter((f) => f.name !== name))
}

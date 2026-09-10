const SAVED_SUPERFOODS_KEY = 'vitrack:savedSuperfoods'

export function getSavedSuperfoodIds(): string[] {
  const raw = localStorage.getItem(SAVED_SUPERFOODS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setSavedSuperfoodIds(ids: string[]): void {
  localStorage.setItem(SAVED_SUPERFOODS_KEY, JSON.stringify(ids))
}

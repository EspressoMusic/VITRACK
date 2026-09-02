export const MAX_FOCUS_ITEMS = 3

const SUPERFOODS_KEY = 'vitrack:focusSuperfoods'
const JUNK_FOODS_KEY = 'vitrack:focusJunkFoods'

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(0, MAX_FOCUS_ITEMS) : []
  } catch {
    return []
  }
}

/** Adds/removes id from the focus list at `key`, capped at MAX_FOCUS_ITEMS — adding past the cap is a no-op. */
function toggleId(key: string, id: string): string[] {
  const current = readIds(key)
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : current.length < MAX_FOCUS_ITEMS
      ? [...current, id]
      : current
  localStorage.setItem(key, JSON.stringify(next))
  return next
}

/** Adds id to the focus list at `key` if it isn't already there, capped at MAX_FOCUS_ITEMS — a no-op past the cap. */
function addId(key: string, id: string): string[] {
  const current = readIds(key)
  if (current.includes(id) || current.length >= MAX_FOCUS_ITEMS) return current
  const next = [...current, id]
  localStorage.setItem(key, JSON.stringify(next))
  return next
}

export const getFocusedSuperfoodIds = () => readIds(SUPERFOODS_KEY)
export const getFocusedJunkFoodIds = () => readIds(JUNK_FOODS_KEY)
export const toggleFocusedSuperfood = (id: string) => toggleId(SUPERFOODS_KEY, id)
export const toggleFocusedJunkFood = (id: string) => toggleId(JUNK_FOODS_KEY, id)
export const addFocusedSuperfood = (id: string) => addId(SUPERFOODS_KEY, id)
export const addFocusedJunkFood = (id: string) => addId(JUNK_FOODS_KEY, id)

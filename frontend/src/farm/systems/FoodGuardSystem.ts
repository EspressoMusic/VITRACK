import type { MealFoods } from '../../lib/db'
import {
  FOOD_GUARD,
  FOOD_GUARD_POWER,
  FOOD_GUARDS,
  type FoodGuardDef,
  JUNK_KEYWORDS,
  MEAL_GUARD,
  NOT_FOOD_KEYWORDS,
  TOPPING_KEYWORDS,
} from '../data/foodGuards'

/** Food guards come from what the player ate this week (see data/foodGuards.ts). Nothing about them is in the
 *  game save: they're worked out from the week's meals every time the map opens, so they leave when the week ends. */

export interface FoodGuardSpec {
  /** One guard per kind of food, so this is the guard type's id. */
  id: string
  def: FoodGuardDef
  /** How many meals this week had this kind of food. */
  servings: number
  /** The food's name as it was logged (the first time this week). */
  food: string
  /** Arrow strength. */
  power: number
  /** Seconds between arrows. */
  reload: number
}

/** Hebrew sticks "and / the / in / to / from…" to the front of a word; Arabic does the same with "and / the". */
const HE_PREFIXES = 'והבלמשכ'
const AR_PREFIXES = ['وال', 'بال', 'ال', 'و']

function wordForms(word: string): string[] {
  const forms = [word]
  if (word.length > 2 && HE_PREFIXES.includes(word[0])) forms.push(word.slice(1))
  for (const p of AR_PREFIXES) if (word.length > p.length + 1 && word.startsWith(p)) forms.push(word.slice(p.length))
  return forms
}

const WORD = /[\p{L}\p{N}"'׳]+/gu

/** Where `keyword` is in `text` ([start, end)), or null. A leading '=' means a whole word. */
function findKeyword(text: string, keyword: string): [number, number] | null {
  if (!keyword.startsWith('=')) {
    const i = text.indexOf(keyword)
    return i < 0 ? null : [i, i + keyword.length]
  }
  const target = keyword.slice(1)
  for (const m of text.matchAll(WORD)) if (wordForms(m[0]).includes(target)) return [m.index, m.index + m[0].length]
  return null
}

/** Every guard a food's name calls for ("salad with tomato and cucumber" → three), or none for junk food, drinks
 *  and toppings. Words are used up as they match, so "potato" (תפוח אדמה) doesn't also count as an apple (תפוח).
 *  Healthy food that isn't in the list sends a Meal Guard (unless the meal as a whole was junk). */
export function guardsForFood(name: string, junkMeal = false): FoodGuardDef[] {
  let text = name.toLowerCase()
  const any = (keywords: string[]) => keywords.some((k) => findKeyword(text, k))
  if (!text.trim() || any(JUNK_KEYWORDS) || any(NOT_FOOD_KEYWORDS)) return []
  const found: FoodGuardDef[] = []
  for (const def of FOOD_GUARDS) {
    for (const keyword of def.keywords) {
      for (let at = findKeyword(text, keyword); at; at = findKeyword(text, keyword)) {
        if (!found.includes(def)) found.push(def)
        text = text.slice(0, at[0]) + ' '.repeat(at[1] - at[0]) + text.slice(at[1])
      }
    }
  }
  if (found.length) return found
  return junkMeal || any(TOPPING_KEYWORDS) ? [] : [MEAL_GUARD]
}

/** This week's guards, strongest first (healthier food first, then food eaten more often), at most FOOD_GUARD.max. */
export function buildFoodGuards(meals: MealFoods[]): FoodGuardSpec[] {
  const byId = new Map<string, FoodGuardSpec>()
  const ordered = [...meals].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  for (const meal of ordered) {
    // Tomatoes in the salad and in the sandwich are still one serving.
    const counted = new Set<string>()
    for (const food of meal.foods ?? []) {
      for (const def of guardsForFood(food.name ?? '', !!meal.isJunkFood)) {
        if (counted.has(def.id)) continue
        counted.add(def.id)
        const spec = byId.get(def.id)
        if (spec) spec.servings += 1
        else byId.set(def.id, { id: def.id, def, servings: 1, food: food.name.trim(), power: 0, reload: 0 })
      }
    }
  }
  const list = [...byId.values()]
  for (const spec of list) {
    spec.power = FOOD_GUARD_POWER[spec.def.tier]
    spec.reload = FOOD_GUARD.reload - FOOD_GUARD.reloadPerServing * (Math.min(spec.servings, FOOD_GUARD.maxServings) - 1)
  }
  return list.sort((a, b) => b.def.tier - a.def.tier || b.servings - a.servings).slice(0, FOOD_GUARD.max)
}

// ---------- which guards the player has already seen arrive ----------

const SEEN_KEY = 'vitrack-farm-food-guards-seen'

/** Guards that weren't on the map last time the player looked (this week). They're remembered as seen from now on. */
export function takeNewArrivals(weekStart: string, ids: string[]): string[] {
  let seen: string[] = []
  try {
    const saved = JSON.parse(localStorage.getItem(SEEN_KEY) ?? 'null') as { week?: string; ids?: string[] } | null
    if (saved?.week === weekStart && Array.isArray(saved.ids)) seen = saved.ids
  } catch {
    // no storage — every guard just arrives once per visit
  }
  const fresh = ids.filter((id) => !seen.includes(id))
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify({ week: weekStart, ids: [...new Set([...seen, ...ids])] }))
  } catch {
    // ignore
  }
  return fresh
}

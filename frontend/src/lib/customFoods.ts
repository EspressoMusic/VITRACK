import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { NutrientAmounts } from '../types'
import { NUTRIENTS } from './nutrients'

/** A food/supplement the user typed in themselves, with nutrients keyed to one base portion. */
export interface CustomFood {
  /** Normalized (lowercase, trimmed) name — also the store key. */
  key: string
  name: string
  portionLabel: string
  unitLabel: string
  unitCount: number
  nutrients: NutrientAmounts
  updatedAt: string
}

interface CustomFoodsDB extends DBSchema {
  foods: { key: string; value: CustomFood }
}

const DB_NAME = 'vitatrack-custom-foods'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<CustomFoodsDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<CustomFoodsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('foods', { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}

// IndexedDB reads are async, but the manual-entry search needs to filter on every
// keystroke, so a warm in-memory cache is kept in sync with the store on every write.
let cache: CustomFood[] = []
const listeners = new Set<() => void>()

async function loadCache() {
  const db = await getDb()
  cache = await db.getAll('foods')
  listeners.forEach((fn) => fn())
}

void loadCache()

/** Notifies on cache changes — used to re-render search results once the initial load lands. */
export function onCustomFoodsChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Splits a free-typed portion like "2 bowls" or "30g" into a count and a unit label. */
export function parsePortion(portionLabel: string): { unitCount: number; unitLabel: string } {
  const trimmed = portionLabel.trim()
  const match = /^(\d+(?:\.\d+)?)\s*(.*)$/.exec(trimmed)
  if (match && match[2].trim()) return { unitCount: parseFloat(match[1]), unitLabel: match[2].trim() }
  if (match) return { unitCount: parseFloat(match[1]), unitLabel: 'serving' }
  return { unitCount: 1, unitLabel: trimmed || 'serving' }
}

export function findCustomFood(name: string): CustomFood | undefined {
  const key = name.trim().toLowerCase()
  if (!key) return undefined
  return cache.find((f) => f.key === key)
}

export function searchCustomFoods(query: string, limit = 6): CustomFood[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const startsWith = cache.filter((f) => f.key.startsWith(q))
  const includes = cache.filter((f) => !f.key.startsWith(q) && f.key.includes(q))
  return [...startsWith, ...includes].slice(0, limit)
}

/** Saves (or updates) a custom food definition so it can be found and re-scaled later. */
export async function saveCustomFood(name: string, portionLabel: string, nutrients: NutrientAmounts): Promise<void> {
  const key = name.trim().toLowerCase()
  if (!key) return
  const { unitCount, unitLabel } = parsePortion(portionLabel)
  const record: CustomFood = {
    key,
    name: name.trim(),
    portionLabel: portionLabel.trim() || `1 ${unitLabel}`,
    unitLabel,
    unitCount: unitCount || 1,
    nutrients,
    updatedAt: new Date().toISOString(),
  }
  const db = await getDb()
  await db.put('foods', record)
  const idx = cache.findIndex((f) => f.key === key)
  if (idx >= 0) cache[idx] = record
  else cache.push(record)
  listeners.forEach((fn) => fn())
}

function pluralizeUnit(label: string, count: number): string {
  if (count === 1) return label
  return label.endsWith('s') ? label : `${label}s`
}

/**
 * Maps a QuantityPicker value ("N whole", a fraction preset, or exact grams) onto a multiplier
 * of the custom food's base portion. Exact-grams entries can't be related to a non-gram base
 * unit, so those return null and the caller should fall back to the AI estimator.
 */
function quantityMultiplier(quantity: string, food: CustomFood): number | null {
  const wholeMatch = /^(\d+(?:\.\d+)?) whole$/.exec(quantity)
  if (wholeMatch) return parseFloat(wholeMatch[1]) / food.unitCount
  if (quantity === 'half') return 0.5 / food.unitCount
  if (quantity === 'a third') return 1 / 3 / food.unitCount
  if (quantity === 'a quarter') return 0.25 / food.unitCount
  if (/^\d+(?:\.\d+)?$/.test(quantity.trim()) && /g(ram)?s?$/i.test(food.unitLabel)) {
    return parseFloat(quantity.trim()) / food.unitCount
  }
  return null
}

function describeQuantity(quantity: string, food: CustomFood): string {
  const wholeMatch = /^(\d+(?:\.\d+)?) whole$/.exec(quantity)
  if (wholeMatch) {
    const count = parseFloat(wholeMatch[1])
    return `${wholeMatch[1]} ${pluralizeUnit(food.unitLabel, count)}`
  }
  if (quantity === 'half') return `½ ${food.unitLabel}`
  if (quantity === 'a third') return `⅓ ${food.unitLabel}`
  if (quantity === 'a quarter') return `¼ ${food.unitLabel}`
  return `${quantity.trim()} ${food.unitLabel}`
}

/** Computes nutrients for a saved custom food at the given quantity, scaled from its base portion. */
export function scaleCustomFood(
  food: CustomFood,
  quantity: string
): { foods: { name: string; portion: string }[]; nutrients: NutrientAmounts; confidence: 'high'; note: string } | null {
  const multiplier = quantityMultiplier(quantity, food)
  if (multiplier === null) return null

  const nutrients = Object.fromEntries(
    NUTRIENTS.map((n) => [n.id, Math.round(food.nutrients[n.id] * multiplier * 100) / 100])
  ) as NutrientAmounts

  return {
    foods: [{ name: food.name, portion: describeQuantity(quantity, food) }],
    nutrients,
    confidence: 'high',
    note: 'Calculated from your saved custom entry.',
  }
}

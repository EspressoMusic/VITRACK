import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { MealEntry } from '../types'
import { isSupabaseConfigured } from './supabase'

interface VitrackDB extends DBSchema {
  meals: {
    key: string
    value: MealEntry
    indexes: { 'by-date': string }
  }
}

const DB_NAME = 'vitatrack'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<VitrackDB>> | null = null
let currentUserId: string | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<VitrackDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('meals', { keyPath: 'id' })
        store.createIndex('by-date', 'date')
      },
    })
  }
  return dbPromise
}

/** Called by AuthContext whenever the signed-in user changes. */
export function setCurrentUserId(id: string | null): void {
  currentUserId = id
}

function useCloud(): boolean {
  return isSupabaseConfigured && currentUserId !== null
}

export async function addMeal(entry: MealEntry): Promise<void> {
  if (useCloud()) {
    const { cloudAddMeal } = await import('./cloudDb')
    return cloudAddMeal(entry, currentUserId!)
  }
  const db = await getDb()
  await db.put('meals', entry)
}

export async function deleteMeal(id: string): Promise<void> {
  if (useCloud()) {
    const { cloudDeleteMeal } = await import('./cloudDb')
    return cloudDeleteMeal(id)
  }
  const db = await getDb()
  await db.delete('meals', id)
}

export async function getAllMeals(): Promise<MealEntry[]> {
  if (useCloud()) {
    const { cloudGetAllMeals } = await import('./cloudDb')
    return cloudGetAllMeals()
  }
  return getAllLocalMeals()
}

export async function getAllLocalMeals(): Promise<MealEntry[]> {
  const db = await getDb()
  const all = await db.getAll('meals')
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function getMealsByDate(date: string): Promise<MealEntry[]> {
  if (useCloud()) {
    const { cloudGetMealsByDate } = await import('./cloudDb')
    return cloudGetMealsByDate(date)
  }
  const db = await getDb()
  return db.getAllFromIndex('meals', 'by-date', date)
}

export async function clearAllMeals(): Promise<void> {
  if (useCloud()) {
    const { cloudClearAllMeals } = await import('./cloudDb')
    return cloudClearAllMeals(currentUserId!)
  }
  const db = await getDb()
  await db.clear('meals')
}

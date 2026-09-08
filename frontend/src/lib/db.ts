import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { MealEntry, WorkoutEntry } from '../types'
import { isSupabaseConfigured } from './supabase'

interface VitrackDB extends DBSchema {
  meals: {
    key: string
    value: MealEntry
    indexes: { 'by-date': string }
  }
  workouts: {
    key: string
    value: WorkoutEntry
    indexes: { 'by-date': string }
  }
}

const DB_NAME = 'vitatrack'
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<VitrackDB>> | null = null
let currentUserId: string | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<VitrackDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('meals', { keyPath: 'id' })
          store.createIndex('by-date', 'date')
        }
        if (oldVersion < 2) {
          const store = db.createObjectStore('workouts', { keyPath: 'id' })
          store.createIndex('by-date', 'date')
        }
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

export async function addWorkout(entry: WorkoutEntry): Promise<void> {
  if (useCloud()) {
    const { cloudAddWorkout } = await import('./cloudWorkouts')
    return cloudAddWorkout(entry, currentUserId!)
  }
  const db = await getDb()
  await db.put('workouts', entry)
}

export async function updateWorkout(entry: WorkoutEntry): Promise<void> {
  return addWorkout(entry)
}

export async function deleteWorkout(id: string): Promise<void> {
  if (useCloud()) {
    const { cloudDeleteWorkout } = await import('./cloudWorkouts')
    return cloudDeleteWorkout(id)
  }
  const db = await getDb()
  await db.delete('workouts', id)
}

export async function getAllWorkouts(): Promise<WorkoutEntry[]> {
  if (useCloud()) {
    const { cloudGetAllWorkouts } = await import('./cloudWorkouts')
    return cloudGetAllWorkouts()
  }
  return getAllLocalWorkouts()
}

export async function getAllLocalWorkouts(): Promise<WorkoutEntry[]> {
  const db = await getDb()
  const all = await db.getAll('workouts')
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function getWorkoutsByDate(date: string): Promise<WorkoutEntry[]> {
  if (useCloud()) {
    const { cloudGetWorkoutsByDate } = await import('./cloudWorkouts')
    return cloudGetWorkoutsByDate(date)
  }
  const db = await getDb()
  return db.getAllFromIndex('workouts', 'by-date', date)
}

export async function clearAllWorkouts(): Promise<void> {
  if (useCloud()) {
    const { cloudClearAllWorkouts } = await import('./cloudWorkouts')
    return cloudClearAllWorkouts(currentUserId!)
  }
  const db = await getDb()
  await db.clear('workouts')
}

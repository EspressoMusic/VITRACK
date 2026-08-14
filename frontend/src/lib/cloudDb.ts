import type { MealEntry } from '../types'
import { supabase } from './supabase'
import { getAllLocalMeals } from './db'

interface MealRow {
  id: string
  date: string
  created_at: string
  image_data_url: string
  foods: MealEntry['foods']
  nutrients: MealEntry['nutrients']
  confidence: MealEntry['confidence']
  analysis_note: string | null
}

function fromRow(row: MealRow): MealEntry {
  return {
    id: row.id,
    date: row.date,
    createdAt: row.created_at,
    imageDataUrl: row.image_data_url,
    foods: row.foods,
    nutrients: row.nutrients,
    confidence: row.confidence,
    analysisNote: row.analysis_note ?? undefined,
  }
}

function toRow(entry: MealEntry, userId: string): Omit<MealRow, 'created_at'> & { created_at: string; user_id: string } {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    created_at: entry.createdAt,
    image_data_url: entry.imageDataUrl,
    foods: entry.foods,
    nutrients: entry.nutrients,
    confidence: entry.confidence,
    analysis_note: entry.analysisNote ?? null,
  }
}

export async function cloudAddMeal(entry: MealEntry, userId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('meals').upsert(toRow(entry, userId))
  if (error) throw error
}

export async function cloudDeleteMeal(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('meals').delete().eq('id', id)
  if (error) throw error
}

export async function cloudGetAllMeals(): Promise<MealEntry[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('meals').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data as MealRow[]).map(fromRow)
}

export async function cloudGetMealsByDate(date: string): Promise<MealEntry[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('meals').select('*').eq('date', date)
  if (error) throw error
  return (data as MealRow[]).map(fromRow)
}

export async function cloudClearAllMeals(userId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('meals').delete().eq('user_id', userId)
  if (error) throw error
}

/** One-time best-effort push of any locally-stored meals up to the cloud after sign-in. */
export async function syncLocalMealsToCloud(): Promise<void> {
  if (!supabase) return
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return

  const localMeals = await getAllLocalMeals()
  if (localMeals.length === 0) return

  const rows = localMeals.map((m) => toRow(m, userId))
  const { error } = await supabase.from('meals').upsert(rows)
  if (error) console.error('Failed to sync local meals to cloud:', error)
}

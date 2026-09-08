import type { WorkoutEntry, WorkoutExercise } from '../types'
import { supabase } from './supabase'
import { getAllLocalWorkouts } from './db'

interface WorkoutRow {
  id: string
  date: string
  created_at: string
  name: string
  done: boolean
  exercises: WorkoutExercise[]
}

function fromRow(row: WorkoutRow): WorkoutEntry {
  return {
    id: row.id,
    date: row.date,
    createdAt: row.created_at,
    name: row.name,
    done: row.done,
    exercises: row.exercises ?? [],
  }
}

function toRow(entry: WorkoutEntry, userId: string): WorkoutRow & { user_id: string } {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    created_at: entry.createdAt,
    name: entry.name,
    done: entry.done,
    exercises: entry.exercises ?? [],
  }
}

export async function cloudAddWorkout(entry: WorkoutEntry, userId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('workouts').upsert(toRow(entry, userId))
  if (error) throw error
}

export async function cloudDeleteWorkout(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (error) throw error
}

export async function cloudGetAllWorkouts(): Promise<WorkoutEntry[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('workouts').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data as WorkoutRow[]).map(fromRow)
}

export async function cloudGetWorkoutsByDate(date: string): Promise<WorkoutEntry[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('workouts').select('*').eq('date', date)
  if (error) throw error
  return (data as WorkoutRow[]).map(fromRow)
}

export async function cloudClearAllWorkouts(userId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('workouts').delete().eq('user_id', userId)
  if (error) throw error
}

/** One-time best-effort push of any locally-stored workouts up to the cloud after sign-in. */
export async function syncLocalWorkoutsToCloud(): Promise<void> {
  if (!supabase) return
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return

  const localWorkouts = await getAllLocalWorkouts()
  if (localWorkouts.length === 0) return

  const rows = localWorkouts.map((w) => toRow(w, userId))
  const { error } = await supabase.from('workouts').upsert(rows)
  if (error) console.error('Failed to sync local workouts to cloud:', error)
}

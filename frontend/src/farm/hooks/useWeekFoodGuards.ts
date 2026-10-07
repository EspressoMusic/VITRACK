import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getWeekDateKeys, todayKey } from '../../lib/date'
import { getMealFoodsBetween } from '../../lib/db'
import { type FoodGuardSpec, buildFoodGuards, takeNewArrivals } from '../systems/FoodGuardSystem'

export interface WeekFoodGuards {
  guards: FoodGuardSpec[]
  /** Guards the player hasn't seen arrive yet. */
  arrivals: string[]
}

/** Food guards from this week's meals; null until they're loaded. When a new week starts they're worked out again (and the old ones leave). */
export function useWeekFoodGuards(): WeekFoodGuards | null {
  const { loading } = useAuth()
  const [week, setWeek] = useState(() => getWeekDateKeys(todayKey()))
  const [result, setResult] = useState<WeekFoodGuards | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = getWeekDateKeys(todayKey())
      setWeek((prev) => (prev[0] === next[0] ? prev : next))
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    // Meals are read from the cloud only once the signed-in user is known (see db.ts).
    if (loading) return
    let live = true
    getMealFoodsBetween(week[0], week[6])
      .then((meals) => {
        if (!live) return
        const guards = buildFoodGuards(meals)
        setResult({ guards, arrivals: takeNewArrivals(week[0], guards.map((g) => g.id)) })
      })
      .catch(() => {
        if (live) setResult({ guards: [], arrivals: [] })
      })
    return () => {
      live = false
    }
  }, [loading, week])

  return result
}

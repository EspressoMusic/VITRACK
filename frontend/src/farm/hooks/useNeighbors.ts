import { useEffect, useState } from 'react'
import { NEIGHBOR_SLOTS } from '../data/neighbors'
import { type CityCard, fetchSentToday, listCities } from '../online/cityCloud'

export interface Neighbor extends CityCard {
  /** This player already sent them a guard today. */
  helped: boolean
}

// Picked once per session, so the islands don't reshuffle on every tab switch.
let picked: Neighbor[] | null = null

function shuffled<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Other players' cities that sit as islands around this one: a random few of the recently active. */
export function useNeighbors() {
  const [neighbors, setNeighbors] = useState(picked)

  useEffect(() => {
    if (picked) return
    let alive = true
    Promise.all([listCities(), fetchSentToday()]).then(([cities, sent]) => {
      // Offline: try again next time the city opens.
      if (!cities) return
      picked = shuffled(cities)
        .slice(0, NEIGHBOR_SLOTS.length)
        .map((c) => ({ ...c, helped: sent.has(c.userId) }))
      if (alive) setNeighbors(picked)
    })
    return () => {
      alive = false
    }
  }, [])

  const markHelped = (userId: string) => {
    picked = picked?.map((n) => (n.userId === userId ? { ...n, helped: true } : n)) ?? null
    setNeighbors(picked)
  }

  return { neighbors, markHelped }
}

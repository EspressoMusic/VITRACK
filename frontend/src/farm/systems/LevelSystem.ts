import { AREAS } from '../data/areas'
import { CROPS } from '../data/crops'
import { ITEMS_BY_ID } from '../data/items'
import { MAX_LEVEL, xpToNextLevel } from '../data/levels'
import { OBJECTS } from '../data/objects'
import { RECIPES } from '../data/recipes'
import type { GameState, LocalizedText } from '../types'

/** Adds XP and rolls over as many levels as it covers. */
export function addXp(state: GameState, amount: number): GameState {
  if (amount <= 0) return state
  let { level, xp } = state.player
  xp += amount
  while (level < MAX_LEVEL && xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level)
    level += 1
  }
  return { ...state, player: { ...state.player, level, xp } }
}

export function levelProgress(state: GameState): { xp: number; needed: number; fraction: number } {
  const needed = xpToNextLevel(state.player.level)
  return { xp: state.player.xp, needed, fraction: Math.min(1, state.player.xp / needed) }
}

export interface LevelUnlock {
  icon: string
  name: LocalizedText
  /** Set for buildings/decorations, so the UI can show their sprite. */
  objectId?: string
}

/** Everything that becomes available exactly at `level`, read straight from the data files. */
export function unlocksAtLevel(level: number): LevelUnlock[] {
  const at = (required: number) => required === level
  return [
    ...CROPS.filter((c) => at(c.requiredLevel)).map(({ icon, name }) => ({ icon, name })),
    ...RECIPES.filter((r) => at(r.requiredLevel)).map((r) => ({ icon: ITEMS_BY_ID[r.output].icon, name: ITEMS_BY_ID[r.output].name })),
    ...OBJECTS.filter((o) => o.shopCategory && o.kind !== 'field' && at(o.requiredLevel)).map(({ id, icon, name }) => ({ icon, name, objectId: id })),
    ...AREAS.filter((a) => a.cost > 0 && at(a.requiredLevel)).map(({ name }) => ({ icon: '🗺️', name })),
  ]
}

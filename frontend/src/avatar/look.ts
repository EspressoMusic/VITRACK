import { useSyncExternalStore } from 'react'

/**
 * Everything the player can change about their 3D animal: which animal and its fur color, plus an
 * optional outfit, shoes and hat (each with its own fixed colors), and the vegetable it holds and
 * throws at germs. It goes bare by default (just fur).
 */
export interface AvatarLook {
  animal: AnimalKind
  /** Fur color, hex. */
  fur: string
  outfit: OutfitStyle
  shoes: ShoeStyle
  hat: HatStyle
  veggie: VeggieKind
}

/** The sculpted heroes: each keeps its own cape, mask or suit, so fur color, outfit, shoes and hat don't apply. */
export const HEROES = ['cucumber', 'onion', 'panda', 'bellpepper', 'agent'] as const
export const ANIMALS = ['bunny', 'kitten', 'puppy', 'bear', ...HEROES] as const
export const OUTFIT_STYLES = ['none', 'cape', 'hoodie', 'sport', 'raincoat', 'summer'] as const
export const SHOE_STYLES = ['none', 'sneakers', 'boots'] as const
export const HAT_STYLES = ['none', 'straw', 'cap', 'beanie', 'crown', 'flower'] as const
export const VEGGIES = ['carrot', 'broccoli', 'tomato', 'corn', 'eggplant', 'pepper'] as const

export type AnimalKind = (typeof ANIMALS)[number]
export type HeroKind = (typeof HEROES)[number]
export type OutfitStyle = (typeof OUTFIT_STYLES)[number]
export type ShoeStyle = (typeof SHOE_STYLES)[number]
export type HatStyle = (typeof HAT_STYLES)[number]
export type VeggieKind = (typeof VEGGIES)[number]

export const isHero = (animal: AnimalKind): animal is HeroKind => (HEROES as readonly string[]).includes(animal)

/** Heroes shown in the picker as a black silhouette, not pickable yet. */
export const LOCKED_HEROES: readonly HeroKind[] = ['agent']
export const PLAYABLE_HEROES = HEROES.filter((h) => !LOCKED_HEROES.includes(h))
export const isPlayable = (animal: AnimalKind): animal is HeroKind =>
  isHero(animal) && !LOCKED_HEROES.includes(animal)

export const FUR_COLORS = ['#fbf7f0', '#f3e3c6', '#f6b77e', '#d29a62', '#94603e', '#bdb8bf', '#5a5258', '#f7c9d8']

export const DEFAULT_LOOK: AvatarLook = {
  animal: 'cucumber',
  fur: FUR_COLORS[0],
  outfit: 'none',
  shoes: 'none',
  hat: 'none',
  veggie: 'carrot',
}

const KEY = 'vitrack:avatar:v2'
/** Saves from when the character was a dressed-up person; only the animal's own traits carry over. */
const OLD_KEY = 'vitrack:avatar'

function pick<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

/** Fills in anything missing or invalid, so an old or hand-edited save never breaks the build. */
export function sanitizeLook(raw: Partial<Record<keyof AvatarLook, unknown>>): AvatarLook {
  const d = DEFAULT_LOOK
  return {
    // Only the unlocked heroes are offered for now, so anything else becomes the default hero.
    animal: pick(PLAYABLE_HEROES, raw.animal, d.animal),
    fur: color(raw.fur, d.fur),
    outfit: pick(OUTFIT_STYLES, raw.outfit, d.outfit),
    shoes: pick(SHOE_STYLES, raw.shoes, d.shoes),
    hat: pick(HAT_STYLES, raw.hat, d.hat),
    veggie: pick(VEGGIES, raw.veggie, d.veggie),
  }
}

function load(): AvatarLook {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return sanitizeLook(JSON.parse(raw))
    const old = localStorage.getItem(OLD_KEY)
    if (old) {
      const { animal, fur } = JSON.parse(old)
      return sanitizeLook({ animal, fur })
    }
  } catch {
    // Storage blocked or corrupt — fall back to the default look.
  }
  return DEFAULT_LOOK
}

let look: AvatarLook | null = null
const listeners = new Set<() => void>()

export function getAvatarLook(): AvatarLook {
  look ??= load()
  return look
}

export function setAvatarLook(next: AvatarLook): void {
  look = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage blocked — the outfit just won't survive a reload.
  }
  listeners.forEach((l) => l())
}

export function subscribeAvatarLook(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useAvatarLook(): AvatarLook {
  return useSyncExternalStore(subscribeAvatarLook, getAvatarLook)
}

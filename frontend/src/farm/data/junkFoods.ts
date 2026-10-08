import type { LocalizedText } from '../types'
import type { FoeDef } from './germs'

/**
 * Junk food: it marches out of the candy cave (left of the germs' swamp), stops in front of the wall and throws bits
 * of itself at the food friends standing on top (the wall crew). A friend hit too often gets knocked down for a while
 * and stops throwing stones. It's stopped just like a germ — taps, stones, arrows — and pays out the same way.
 */

export type JunkShape = 'chocolate' | 'cake' | 'donut'

export interface JunkFoodDef extends FoeDef {
  name: LocalizedText
  shape: JunkShape
  /** Color of the bits it throws (and their splat). */
  treat: string
}

export const JUNK_FOODS: JunkFoodDef[] = [
  {
    id: 'chocolate',
    name: { en: 'Chocolate Bar', he: 'שוקולד', ar: 'شوكولاتة' },
    power: 'lob',
    hp: 4,
    attack: 1,
    speed: 15,
    attackEvery: 2.2,
    taps: 1,
    armor: 0,
    radius: 8,
    weight: 3,
    minLevel: 1,
    color: '#7b4a2e',
    treat: '#6b3f26',
    shape: 'chocolate',
  },
  {
    id: 'cake',
    name: { en: 'Cake', he: 'עוגה', ar: 'كعكة' },
    power: 'lob',
    hp: 6,
    attack: 1,
    speed: 10,
    attackEvery: 2.8,
    taps: 2,
    armor: 1,
    radius: 9.5,
    weight: 1.5,
    minLevel: 1,
    color: '#fbe3c4',
    treat: '#fff6ea',
    shape: 'cake',
  },
  {
    id: 'donut',
    name: { en: 'Donut', he: 'דונאט', ar: 'دونات' },
    power: 'lob',
    hp: 3,
    attack: 1,
    speed: 24,
    attackEvery: 1.8,
    taps: 1,
    armor: 0,
    radius: 7.5,
    weight: 2,
    minLevel: 1,
    color: '#e8a960',
    treat: '#ff8fb8',
    shape: 'donut',
  },
]

export const JUNK_FOODS_BY_ID: Record<string, JunkFoodDef> = Object.fromEntries(JUNK_FOODS.map((d) => [d.id, d]))

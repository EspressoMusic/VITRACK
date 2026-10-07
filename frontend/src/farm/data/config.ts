import type { NpcDef } from '../types'

export const SAVE_VERSION = 4

export const START_COINS = 50

/** Coins for watching one ad, and how many ads pay out per day. */
export const AD_REWARD_COINS = 30
export const ADS_PER_DAY = 5

export const BARN_BASE_CAPACITY = 50
export const BARN_CAPACITY_STEP = 25
export const barnUpgradeCost = (barnLevel: number) => 150 * (barnLevel + 1)

export const ORDER_SLOT_COUNT = 3
/** Seconds until a new order shows up after one is delivered / thrown away. */
export const ORDER_REFILL_AFTER_COMPLETE = 5
export const ORDER_REFILL_AFTER_DISCARD = 45
/** Orders pay this much more than selling the same goods in the barn. */
export const ORDER_COIN_BONUS = 1.5

export const NPCS: NpcDef[] = [
  { face: '👩‍🌾', name: { en: 'Maya', he: 'מאיה', ar: 'مايا' } },
  { face: '👨‍🍳', name: { en: 'Tom', he: 'תום', ar: 'توم' } },
  { face: '👴', name: { en: 'Grandpa Sami', he: 'סבא סמי', ar: 'الجد سامي' } },
  { face: '👧', name: { en: 'Noa', he: 'נועה', ar: 'نوعا' } },
  { face: '🧔', name: { en: 'Ben', he: 'בן', ar: 'بن' } },
  { face: '👵', name: { en: 'Grandma Lila', he: 'סבתא לילה', ar: 'الجدة ليلى' } },
]

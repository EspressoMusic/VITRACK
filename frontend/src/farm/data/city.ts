import type { ObjectDef } from '../types'

const one = () => 1

/** Base for city buildings: everything here is placed from the shop's Buildings tab. */
function cityBuilding(def: Pick<ObjectDef, 'id' | 'name' | 'icon' | 'cost' | 'requiredLevel' | 'buildTime' | 'xpReward' | 'look'> & Partial<ObjectDef>): ObjectDef {
  return {
    kind: 'city',
    shopCategory: 'buildings',
    width: 2,
    height: 2,
    productionSlots: 0,
    recipes: [],
    maxCount: (level) => Math.min(10, 1 + Math.ceil(level / 2)),
    ...def,
  }
}

export const CITY_BUILDINGS: ObjectDef[] = [
  {
    id: 'cityGate',
    name: { en: 'City Gate', he: 'שער העיר', ar: 'بوابة المدينة' },
    icon: '🏰',
    kind: 'gate',
    shopCategory: null,
    cost: 0,
    requiredLevel: 1,
    width: 3,
    height: 1,
    buildTime: 0,
    productionSlots: 0,
    recipes: [],
    xpReward: 0,
    maxCount: one,
    movable: false,
    look: { type: 'gate' },
    upgrades: [
      { cost: 250, requiredLevel: 3 },
      { cost: 900, requiredLevel: 6 },
    ],
  },
  {
    id: 'starterHouse',
    name: { en: 'My House', he: 'הבית שלי', ar: 'بيتي' },
    icon: '🏠',
    kind: 'home',
    shopCategory: null,
    cost: 0,
    requiredLevel: 1,
    width: 2,
    height: 2,
    buildTime: 0,
    productionSlots: 0,
    recipes: [],
    xpReward: 0,
    maxCount: one,
    home: { tier: 1, interior: { w: 6, h: 6 } },
    look: { type: 'house', wall: '#fff4e2', roof: '#5aa9e6', trim: '#ff8fab', wallHeight: 26, roofHeight: 22, chimney: true },
  },
  cityBuilding({
    id: 'cityHouse',
    name: { en: 'House', he: 'בית', ar: 'منزل' },
    icon: '🏡',
    cost: 120,
    requiredLevel: 2,
    buildTime: 30,
    xpReward: 8,
    maxCount: (level) => Math.min(12, 2 + level),
    look: { type: 'house', wall: '#ffe3ea', roof: '#ef7f9b', trim: '#ffffff', wallHeight: 24, roofHeight: 20 },
  }),
  cityBuilding({
    id: 'grocery',
    name: { en: 'Grocery', he: 'מכולת', ar: 'بقالة' },
    icon: '🍎',
    cost: 150,
    requiredLevel: 1,
    buildTime: 30,
    xpReward: 10,
    look: { type: 'shop', wall: '#fff6e6', roof: '#7ac74f', awning: ['#7ac74f', '#ffffff'], sign: '🍎', wallHeight: 30 },
  }),
  cityBuilding({
    id: 'park',
    name: { en: 'Park', he: 'פארק', ar: 'حديقة' },
    icon: '🌳',
    cost: 80,
    requiredLevel: 1,
    buildTime: 0,
    xpReward: 6,
    look: { type: 'park' },
  }),
  cityBuilding({
    id: 'playground',
    name: { en: 'Playground', he: 'גינת משחקים', ar: 'ملعب أطفال' },
    icon: '🛝',
    cost: 110,
    requiredLevel: 3,
    buildTime: 20,
    xpReward: 8,
    look: { type: 'playground' },
  }),
  cityBuilding({
    id: 'cafe',
    name: { en: 'Cafe', he: 'בית קפה', ar: 'مقهى' },
    icon: '☕',
    cost: 180,
    requiredLevel: 4,
    buildTime: 40,
    xpReward: 12,
    look: { type: 'shop', wall: '#fdf0dc', roof: '#c9784a', awning: ['#e8604c', '#fff6e6'], sign: '☕', wallHeight: 28, terrace: true },
  }),
]

/** Stats of the city gate per level (index 0 = level 1). */
export const GATE_LEVELS = [
  { maxHp: 100, defense: 1, power: 2, regen: 0.25 },
  { maxHp: 160, defense: 2, power: 3, regen: 0.4 },
  { maxHp: 250, defense: 3, power: 5, regen: 0.6 },
]

/** Germs are runtime-only visitors: they're not saved, only the damage they do to the gate is.
 *  Each germ type's own stats live in ./germs. */
export const GERM = {
  /** Seconds between two germs coming out of the swamp. */
  spawnMin: 6,
  spawnMax: 11,
  maxAlive: 6,
  /** Coins for every germ stopped, whoever stopped it (a tap, the gate, a guard, a stone);
   *  tough germs pay this once for every tap they'd take by hand. */
  killCoins: 100,
  /** Coins for each of a Flu Bug's two little ones. */
  miniCoins: 25,
}

/** Junk food comes out of the candy cave on its own clock (each type's stats live in ./junkFoods). */
export const JUNK_RAID = {
  /** Seconds between two junk foods coming out. */
  spawnMin: 9,
  spawnMax: 15,
  maxAlive: 4,
  /** How far junk food can throw, in tiles. */
  range: 6.5,
}

/** Food characters standing on top of the front wall beside the gate, throwing stones at germs on the road.
 *  The crew grows with the gate: gate level + 1 of them, filling `spots` in order. */
export const WALL_CREW = {
  /** Tile x on the front wall of each thrower, and which food it is (an id from ./foodGuards), first ones first. */
  spots: [
    { x: 16.5, guard: 'apple' },
    { x: 20.5, guard: 'carrot' },
    { x: 14.5, guard: 'broccoli' },
    { x: 22.5, guard: 'banana' },
  ],
  /** How far a stone flies, in tiles. */
  range: 6,
  /** Seconds between two stones from the same thrower. */
  reload: 3.2,
  /** Stone strength (a germ's armor blocks part of it, like the gate's zap). */
  power: 1,
  /** Seconds a thrower holds the stone up before letting go. */
  windUp: 0.35,
  /** Hits from junk food a thrower takes before it's knocked down. */
  hp: 3,
  /** Seconds a knocked-down thrower stays dizzy (no throwing) before it's back up with full health. */
  downTime: 6,
  /** A hurt thrower gets one health point back after this many seconds without being hit. */
  healEvery: 8,
}

/** A food friend standing on top of the gate, animated like the player's character, throwing its food at germs.
 *  It's meant to be a vegetable the player logged eating; for now (demo) it's always a tomato. */
export const GATE_BUDDY = {
  /** How far it throws, in tiles. */
  range: 6,
  /** Seconds between two throws. */
  reload: 2.4,
  /** Strength of each hit (a germ's armor blocks part of it, like a stone). */
  power: 2,
}

/** Coins per missing health point when repairing the gate. */
export const GATE_REPAIR_COST_PER_HP = 0.2

import type { Lang } from '../lib/i18n/lang'

export type LocalizedText = Record<Lang, string>
export type ItemId = string

// ---------- Static data definitions (see ./data) ----------

export type ItemCategory = 'crop' | 'product' | 'animalProduct' | 'material'

export interface ItemDef {
  id: ItemId
  name: LocalizedText
  icon: string
  category: ItemCategory
  sellValue: number
  maxStack: number
  requiredLevel: number
  /** XP this item is "worth" — used to size order rewards. */
  xpValue: number
}

export type CropShape = 'grain' | 'stalk' | 'root' | 'bush' | 'berry'

export interface CropDef {
  id: ItemId
  name: LocalizedText
  icon: string
  seedPrice: number
  sellPrice: number
  /** Seconds from planting to ready. */
  growTime: number
  xpReward: number
  requiredLevel: number
  /** How many units one harvest puts in the barn. */
  yield: number
  /** Progress (0..1) at which stages Sprout, Medium, Almost Ready and Ready begin. */
  growthStages: [number, number, number, number]
  look: { shape: CropShape; leaf: string; fruit: string }
}

/** 0 Seed · 1 Sprout · 2 Medium · 3 Almost Ready · 4 Ready */
export type GrowthStage = 0 | 1 | 2 | 3 | 4

export type ShopCategory = 'crops' | 'buildings' | 'animals' | 'decorations' | 'production' | 'storage'

/** gate = the city gate in the wall · home = the main character's house · city = plain city buildings (houses, shops, parks). */
export type ObjectKind = 'field' | 'barn' | 'calendarBoard' | 'production' | 'decoration' | 'gate' | 'home' | 'city'

export type ObjectLook =
  | { type: 'field' }
  | { type: 'board' }
  | { type: 'house'; wall: string; roof: string; trim: string; wallHeight: number; roofHeight: number; chimney?: boolean }
  | { type: 'tree'; leaf: string }
  | { type: 'pine'; leaf: string }
  | { type: 'bush'; leaf: string }
  | { type: 'flowers'; colors: string[] }
  | { type: 'fence' }
  | { type: 'hay' }
  | { type: 'bench' }
  | { type: 'lamp' }
  | { type: 'pond' }
  | { type: 'sign' }
  | { type: 'path'; base: string; detail: string; pattern?: 'stones' | 'pavers' }
  | { type: 'gate' }
  | { type: 'shop'; wall: string; roof: string; awning: [string, string]; sign: string; wallHeight: number; terrace?: boolean; goods?: string[] }
  | { type: 'park' }
  | { type: 'playground' }
  /** One of the wild-land features (windmill, beehives…) bought for town. */
  | { type: 'feature'; kind: FeatureKind }
  | { type: 'palm' }
  | { type: 'fruitTree'; leaf: string; fruit: string; oval?: boolean }
  | { type: 'hedge'; leaf: string }
  | { type: 'pot'; color: string; bloom: string }
  | { type: 'waterTap' }
  | { type: 'mailbox' }
  | { type: 'bins' }
  | { type: 'bikes' }
  | { type: 'picnic' }
  | { type: 'cart' }
  | { type: 'hoop' }
  | { type: 'trampoline' }
  | { type: 'fountain' }
  | { type: 'statue'; figure: 'carrot' | 'heart' }
  | { type: 'clinic'; floors: number }
  | { type: 'gym' }
  | { type: 'tower'; wall: string; trim: string; floors: number }
  | { type: 'pool' }
  | { type: 'pitch' }
  | { type: 'market' }

/** One step up a building's level ladder (index 0 = going from level 1 to level 2). */
export interface UpgradeDef {
  cost: number
  requiredLevel: number
}

/** Extra data for houses the main character can live in. */
export interface HomeDef {
  /** 1 = Starter House; higher tiers (Modern House, Large House, Villa…) can be added later. */
  tier: number
  /** Floor size of the inside of the house, in tiles (the decorating room). */
  interior: { w: number; h: number }
}

export type FurnitureCategory = 'living' | 'bedroom' | 'kitchen' | 'health' | 'decor'

/** A piece of furniture for the inside of the home (see data/furniture.ts). */
export interface FurnitureDef {
  id: string
  name: LocalizedText
  category: FurnitureCategory
  cost: number
  requiredLevel: number
  xpReward: number
  /** Footprint in room tiles, before turning. */
  width: number
  height: number
  /** How high it stands, in world units — used to pick it with a tap. */
  tall: number
  /** Lies flat on the floor (rugs, mats): other furniture can stand on it. */
  flat?: boolean
}

/** Wallpaper or floor for the home. */
export interface RoomStyleDef {
  id: string
  kind: 'wall' | 'floor'
  name: LocalizedText
  cost: number
  requiredLevel: number
  colors: [string, string]
  pattern: 'plain' | 'stripes' | 'dots' | 'planks' | 'tiles' | 'carpet'
}

export interface PlacedFurniture {
  id: string
  defId: string
  x: number
  y: number
  /** Turned a quarter: the footprint's width and height swap. */
  turned?: boolean
}

export interface HomeInterior {
  furniture: PlacedFurniture[]
  /** Furniture that was bought and put away, by def id — placing it again is free. */
  stored: Record<string, number>
  wall: string
  floor: string
  /** Wallpapers and floors bought so far (the free ones are always owned). */
  styles: string[]
  nextId: number
}

/** Anything that can be placed on the grid: fields, buildings and decorations. */
export interface ObjectDef {
  id: string
  name: LocalizedText
  icon: string
  kind: ObjectKind
  /** Shop tab it's sold under, or null if it can't be bought (e.g. the starting barn). */
  shopCategory: ShopCategory | null
  cost: number
  /** Added to the price for every copy already owned. */
  costStep?: number
  requiredLevel: number
  width: number
  height: number
  /** Seconds of construction; 0 = ready instantly. */
  buildTime: number
  productionSlots: number
  recipes: string[]
  xpReward: number
  /** How many the player may own at a given level. */
  maxCount: (level: number) => number
  look: ObjectLook
  /** false = fixed in place (the city gate). Defaults to true. */
  movable?: boolean
  /** Building levels beyond level 1. */
  upgrades?: UpgradeDef[]
  home?: HomeDef
}

export interface RecipeDef {
  id: string
  buildingId: string
  output: ItemId
  outputQty: number
  inputs: { item: ItemId; qty: number }[]
  /** Seconds. */
  time: number
  xpReward: number
  requiredLevel: number
}

export type WorldTheme = 'jungle' | 'desert' | 'snow' | 'volcano' | 'moon' | 'crystal'

/** Something to find out in a wild zone (drawn in game/features.ts). */
export type FeatureKind =
  | 'observatory'
  | 'frozenPond'
  | 'treehouse'
  | 'stoneCircle'
  | 'balloon'
  | 'pond'
  | 'windmill'
  | 'beehives'
  | 'ruins'
  | 'mushrooms'
  | 'campsite'
  | 'orchard'
  | 'well'
  | 'treasure'
  | 'scarecrow'
  | 'signpost'
  | 'hotSpring'
  | 'geode'
  | 'oasis'

export interface AreaDef {
  id: string
  name: LocalizedText
  /** The buildable tiles. */
  rect: { x: number; y: number; w: number; h: number }
  requiredLevel: number
  cost: number
  /** Set on the far-off worlds: their whole land (rim included), drawn in this style. */
  world?: { theme: WorldTheme; island: { x: number; y: number; w: number; h: number } }
  /** Set on the wild zones between the city and the worlds: the feature standing there (its tiles can't be built on). */
  zone?: { feature: FeatureKind; spot: { x: number; y: number; w: number; h: number } }
}

export interface NpcDef {
  face: string
  name: LocalizedText
}

// ---------- Saved game state ----------

export interface CropSlot {
  cropId: ItemId
  plantedAt: number
  readyAt: number
  /** When the character watered it (missing = still dry). Watering cuts the time left — see WATER_SPEEDUP. */
  wateredAt?: number
}

export interface ProductionJob {
  recipeId: string
  startAt: number
  endAt: number
}

export interface PlacedObject {
  uid: string
  defId: string
  x: number
  y: number
  /** Construction finishes at this timestamp (equal to placement time for instant objects). */
  builtAt: number
  crop?: CropSlot | null
  queue?: ProductionJob[]
  /** Building level for upgradable objects (missing = 1). */
  level?: number
  /** Health for objects that can take damage (the gate). It regenerates from `hpAt` on — see DefenseSystem. */
  hp?: number
  hpAt?: number
  /** The decorated inside of a home (missing = the starter room). */
  interior?: HomeInterior
}

export interface OrderLine {
  item: ItemId
  qty: number
}

export interface Order {
  id: string
  npc: number
  lines: OrderLine[]
  coins: number
  xp: number
}

export interface OrderSlot {
  order: Order | null
  /** When `order` is null, a fresh order arrives at this timestamp. */
  refillAt: number
}

export interface PlayerState {
  level: number
  /** XP earned inside the current level (resets on level up). */
  xp: number
  coins: number
  /** Premium currency — reserved, not earned anywhere yet. */
  gems: number
}

/** A guard another player sent to stand at this city's gate for a while. */
export interface GuardStay {
  /** Id of the gift on the server (unique per guard). */
  id: string
  /** Name of the city that sent it. */
  from: string
  /** Goes home at this timestamp. */
  until: number
}

export interface GameState {
  version: number
  player: PlayerState
  inventory: Record<ItemId, number>
  barnLevel: number
  objects: PlacedObject[]
  unlockedAreas: string[]
  orderSlots: OrderSlot[]
  nextUid: number
  /** Lifetime counters (harvests, products, orders) — groundwork for tasks/achievements. */
  stats: Record<string, number>
  /** Guards from other players helping at the gate (see GuardSystem). */
  guards: GuardStay[]
  savedAt: number
}

// ---------- System results ----------

export type FarmError =
  | 'noCoins'
  | 'barnFull'
  | 'missingItems'
  | 'blocked'
  | 'levelLow'
  | 'limit'
  | 'queueFull'
  | 'notReady'
  | 'maxLevel'

export type Gain =
  | { kind: 'item'; item: ItemId; amount: number }
  | { kind: 'coins'; amount: number }
  | { kind: 'xp'; amount: number }

export type Result = { ok: true; state: GameState; gains: Gain[] } | { ok: false; error: FarmError }

export interface Point {
  x: number
  y: number
}

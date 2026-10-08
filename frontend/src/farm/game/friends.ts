import { MAP_WIDTH } from '../data/areas'
import { FRIENDS, FRIENDS_BY_AREA, type FriendDef } from '../data/friends'
import type { FoodGuardDef } from '../data/foodGuards'
import type { GameState, Point } from '../types'
import { pathTo, search, walkableGrid } from './avatarWalker'
import { type GuardPose, drawFoodGuard, guardBox } from './foodGuards'
import type { GermDrawable } from './germs'
import { boxAround, inkForSize } from './ink'
import { tileToWorld } from './iso'
import { CAGE_SPOTS, landDepth } from './land'
import { OUTLINE, ellipse, softFx } from './sprites'

/**
 * Food friends (see data/friends.ts). While a land is locked its friend sits in a cage there, under the lock badge.
 * Buying the land rattles the cage open; the friend cheers, leaps over to the city and lands next to the player's
 * character, then lives in town: strolling the streets and often coming over to hang out with the character.
 * Pictures are drawn once per pose and cached; walking only moves them.
 */

type Ctx = CanvasRenderingContext2D

/** How tall a cage stands (world units), for the lock badge floating over it. */
export const CAGE_RISE = 66

const CAGE_R = { x: 18, y: 9 }
/** Height of the cage's floor (its wooden base) and of the ring its bars hold up. */
const FLOOR = -5
const TOP = -46
const CAGE_BOX = boxAround(0, 0, 28, CAGE_RISE + 2, 14)
const CAGE_INK = inkForSize(40, 60)
const FRIEND_BOX = guardBox({ x: 0, y: 0 })

/** Tiles per second. */
const SPEED = 1.15
const WANDER_RADIUS = 5
/** Chance a stroll heads over to the player's character rather than somewhere random. */
const BUDDY_CHANCE = 0.4
const SHAKE_MS = 750
const CHEER_MS = 1500
const HOP_MS = 450

type Stage = 'shake' | 'cheer' | 'fly' | 'town'

/** shake: the cage rattles open; cheer: free, jumping for joy at the cage; fly: leaping over to town; town: living there. */
interface Friend {
  def: FriendDef
  stage: Stage
  stageAt: number
  /** Feet, tile coordinates. */
  x: number
  y: number
  /** The leap: from the cage (world units) to a tile in town. */
  from: Point
  to: Point
  flyMs: number
  path: Point[]
  /** The stroll ends beside the character: face it on arrival. */
  toBuddy: boolean
  face: 1 | -1
  idleUntil: number
  walk: number
  hopAt: number
  cheerUntil: number
}

/** cageBroken: a cage burst open (the land was just bought); landed: its friend touched down in town. */
export type FriendEvent = { type: 'cageBroken' | 'landed'; areaId: string; at: Point; tile: Point }

export class TownFriends {
  private friends: Friend[] = []
  /** Lands whose friend is already out of its cage. */
  private freed = new Set<string>()
  private areas: unknown = null
  private last = 0
  private cache: { objects: unknown; areas: unknown; grid: Uint8Array } | null = null

  private grid(state: GameState): Uint8Array {
    if (!this.cache || this.cache.objects !== state.objects || this.cache.areas !== state.unlockedAreas) {
      this.cache = { objects: state.objects, areas: state.unlockedAreas, grid: walkableGrid(state) }
    }
    return this.cache.grid
  }

  /** Friends of lands bought before this view opened are already in town; a land bought while watching sets its friend free. */
  private sync(state: GameState, grid: Uint8Array, buddy: Point, now: number) {
    if (this.areas === state.unlockedAreas) return
    const first = this.areas === null
    this.areas = state.unlockedAreas
    const unlocked = new Set(state.unlockedAreas)
    this.friends = this.friends.filter((f) => unlocked.has(f.def.areaId))
    for (const id of [...this.freed]) if (!unlocked.has(id)) this.freed.delete(id)
    for (const id of state.unlockedAreas) {
      const def = FRIENDS_BY_AREA[id]
      if (!def || this.freed.has(id)) continue
      this.freed.add(id)
      const spot = CAGE_SPOTS[id]
      const f: Friend = {
        def,
        stage: first ? 'town' : 'shake',
        stageAt: now,
        x: spot.x,
        y: spot.y,
        from: tileToWorld(spot.x, spot.y),
        to: spot,
        flyMs: 0,
        path: [],
        toBuddy: false,
        face: 1,
        idleUntil: now + Math.random() * 4000,
        walk: 0,
        hopAt: -Infinity,
        cheerUntil: 0,
      }
      if (first) {
        const at = randomTile(grid) ?? spotNear(grid, buddy)
        f.x = at.x + 0.5
        f.y = at.y + 0.5
      }
      this.friends.push(f)
    }
  }

  /** Moves everyone on; `buddy` is where the player's character stands (tile coordinates). */
  update(state: GameState, buddy: Point, now: number): FriendEvent[] {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0
    this.last = now
    const grid = this.grid(state)
    this.sync(state, grid, buddy, now)
    const events: FriendEvent[] = []
    for (const f of this.friends) {
      const age = now - f.stageAt
      if (f.stage === 'shake' && age >= SHAKE_MS) {
        f.stage = 'cheer'
        f.stageAt = now
        events.push({ type: 'cageBroken', areaId: f.def.areaId, at: f.from, tile: { x: f.x, y: f.y } })
      } else if (f.stage === 'cheer' && age >= CHEER_MS) {
        const land = spotNear(grid, buddy)
        f.to = { x: land.x + 0.5, y: land.y + 0.5 }
        const to = tileToWorld(f.to.x, f.to.y)
        f.flyMs = Math.min(2600, 1000 + Math.hypot(to.x - f.from.x, to.y - f.from.y) * 0.5)
        f.face = to.x >= f.from.x ? 1 : -1
        f.stage = 'fly'
        f.stageAt = now
      } else if (f.stage === 'fly' && age >= f.flyMs) {
        f.stage = 'town'
        f.stageAt = now
        f.x = f.to.x
        f.y = f.to.y
        f.hopAt = now
        f.cheerUntil = now + 1400
        f.idleUntil = now + 2500
        f.toBuddy = true
        this.faceToward(f, buddy)
        events.push({ type: 'landed', areaId: f.def.areaId, at: tileToWorld(f.x, f.y), tile: { x: f.x, y: f.y } })
      } else if (f.stage === 'town') {
        this.stroll(f, grid, buddy, now, dt)
      }
    }
    return events
  }

  private stroll(f: Friend, grid: Uint8Array, buddy: Point, now: number, dt: number) {
    const next = f.path[0]
    if (next) {
      const tx = next.x + 0.5
      const ty = next.y + 0.5
      const dx = tx - f.x
      const dy = ty - f.y
      const dist = Math.hypot(dx, dy)
      const step = SPEED * dt
      if (dist <= step) {
        f.x = tx
        f.y = ty
        f.path.shift()
      } else {
        f.x += (dx / dist) * step
        f.y += (dy / dist) * step
      }
      // on screen, +x goes right-down and +y left-down
      if (Math.abs(dx - dy) > 0.01) f.face = dx - dy > 0 ? 1 : -1
      f.walk += dt
      if (!f.path.length) {
        f.idleUntil = now + 2500 + Math.random() * 5000
        if (f.toBuddy) {
          this.faceToward(f, buddy)
          if (Math.random() < 0.5) f.cheerUntil = now + 1100
        }
      }
      return
    }
    if (now < f.idleUntil) return
    const from = { x: Math.floor(f.x), y: Math.floor(f.y) }
    f.toBuddy = Math.random() < BUDDY_CHANCE
    let goal: number | undefined
    const { prev, dist, reached } = search(grid, from, WANDER_RADIUS + 6)
    if (f.toBuddy) {
      const b = { x: Math.floor(buddy.x), y: Math.floor(buddy.y) }
      // a free tile right around the character
      const around = reached.filter((k) => {
        const kx = k % MAP_WIDTH
        const ky = Math.floor(k / MAP_WIDTH)
        const ring = Math.max(Math.abs(kx - b.x), Math.abs(ky - b.y))
        return ring >= 1 && ring <= 2 && grid[k]
      })
      goal = around[Math.floor(Math.random() * around.length)]
    }
    if (goal === undefined) {
      f.toBuddy = false
      const near = reached.filter((k) => dist[k] > 0 && dist[k] <= WANDER_RADIUS && grid[k])
      goal = near[Math.floor(Math.random() * near.length)]
    }
    if (goal === undefined) {
      f.idleUntil = now + 3000
      return
    }
    f.path = pathTo(prev, goal)
  }

  private faceToward(f: Friend, p: Point) {
    const d = p.x - f.x - (p.y - f.y)
    if (Math.abs(d) > 0.05) f.face = d > 0 ? 1 : -1
  }

  /** The friend living in town under a world point, if any (its land's id). */
  friendAt(wx: number, wy: number): string | null {
    for (const f of this.friends) {
      if (f.stage !== 'town') continue
      const p = tileToWorld(f.x, f.y)
      if (Math.abs(wx - p.x) < 13 && wy < p.y + 5 && wy > p.y - 34) return f.def.areaId
    }
    return null
  }

  /** Tapped: a happy hop. */
  poke(areaId: string, now: number): Point | null {
    const f = this.friends.find((g) => g.def.areaId === areaId)
    if (!f) return null
    f.hopAt = now
    f.cheerUntil = now + 1100
    const p = tileToWorld(f.x, f.y)
    return { x: p.x, y: p.y - 36 }
  }

  /** Cages on the lands still locked, the cage breaking open, and the friends cheering, leaping and strolling. */
  drawables(state: GameState, now: number): GermDrawable[] {
    const list: GermDrawable[] = []
    const t = now / 1000
    const unlocked = new Set(state.unlockedAreas)
    for (const [i, def] of FRIENDS.entries()) {
      if (unlocked.has(def.areaId) || this.freed.has(def.areaId)) continue
      // now and then it rattles the bars
      const rattle = (t + i * 1.37) % 5 > 4.4 ? Math.sin(t * 45) * 0.9 : 0
      list.push(cage(def, 'sad', rattle))
    }
    for (const f of this.friends) {
      const age = now - f.stageAt
      const id = f.def.areaId
      if (f.stage === 'shake') {
        const k = age / SHAKE_MS
        list.push(cage(f.def, 'cheer', Math.sin(age / 22) * (0.6 + k * 2.2)))
        continue
      }
      const look = f.def.look
      if (f.stage === 'cheer') {
        const k = age / CHEER_MS
        const spot = CAGE_SPOTS[id]
        list.push(friendSprite(look, id, 'cheer', f.face, f.from, landDepth(Math.floor(spot.x), Math.floor(spot.y)) + 0.01, Math.abs(Math.sin(k * Math.PI * 3)) * 11))
        continue
      }
      if (f.stage === 'fly') {
        const k = Math.min(1, age / f.flyMs)
        const to = tileToWorld(f.to.x, f.to.y)
        const at = { x: f.from.x + (to.x - f.from.x) * k, y: f.from.y + (to.y - f.from.y) * k }
        const height = 90 + Math.hypot(to.x - f.from.x, to.y - f.from.y) * 0.22
        list.push(friendSprite(look, id, 'cheer', f.face, at, 5000, Math.sin(k * Math.PI) * height))
        continue
      }
      const hop = (now - f.hopAt) / HOP_MS
      const lift = hop < 1 ? Math.sin(hop * Math.PI) * 9 : f.path.length ? Math.abs(Math.sin(f.walk * 9)) * 2.4 : 0
      const pose: GuardPose = now < f.cheerUntil ? 'cheer' : 'idle'
      list.push(friendSprite(look, id, pose, f.face, tileToWorld(f.x, f.y), f.x + f.y - 1 + 0.02, lift))
    }
    return list
  }
}

/** A walkable tile picked at random (null if there's none). */
function randomTile(grid: Uint8Array): Point | null {
  const open: number[] = []
  grid.forEach((v, k) => v && open.push(k))
  const k = open[Math.floor(Math.random() * open.length)]
  return k === undefined ? null : { x: k % MAP_WIDTH, y: Math.floor(k / MAP_WIDTH) }
}

/** A walkable tile one or two steps from `p` (or the closest one there is). */
function spotNear(grid: Uint8Array, p: Point): Point {
  const from = { x: Math.floor(p.x), y: Math.floor(p.y) }
  const { dist, reached } = search(new Uint8Array(grid.length).fill(1), from, 8)
  const open = reached.filter((k) => grid[k] && dist[k] >= 1)
  const close = open.filter((k) => dist[k] <= 2)
  const k = close[Math.floor(Math.random() * close.length)] ?? open[0]
  return k === undefined ? from : { x: k % MAP_WIDTH, y: Math.floor(k / MAP_WIDTH) }
}

function friendSprite(look: FoodGuardDef, id: string, pose: GuardPose, face: 1 | -1, feet: Point, depth: number, lift: number): GermDrawable {
  return {
    depth,
    at: feet,
    box: FRIEND_BOX,
    shift: feet,
    lift,
    alpha: 1,
    cache: { id: `friend:${id}:${pose}:${face}`, key: '' },
    draw: (c: Ctx) => drawFoodGuard(c, { x: 0, y: 0 }, look, pose, face, 'none'),
  }
}

/** A land's cage with its friend inside; `shake` jiggles it sideways (world units). */
function cage(def: FriendDef, pose: GuardPose, shake: number): GermDrawable {
  const spot = CAGE_SPOTS[def.areaId]
  const feet = tileToWorld(spot.x, spot.y)
  return {
    depth: landDepth(Math.floor(spot.x), Math.floor(spot.y)) + 0.01,
    at: feet,
    box: CAGE_BOX,
    shift: { x: feet.x + shake, y: feet.y },
    alpha: 1,
    ink: CAGE_INK,
    cache: { id: `cage:${def.areaId}`, key: pose },
    draw: (c: Ctx) => drawCage(c, def.look, pose),
  }
}

// ---------- art (feet at 0, 0) ----------

function solid(c: Ctx, path: () => void, fill: string, lw = 1.4) {
  path()
  c.strokeStyle = OUTLINE
  c.lineWidth = lw * 2
  c.lineJoin = 'round'
  c.stroke()
  path()
  c.fillStyle = fill
  c.fill()
}

const BARS = 8
const BAR = '#a3abbd'
const IRON = '#6b7385'

/** A round iron birdcage on a wooden base, its friend inside, a little gold padlock on the front. */
export function drawCage(c: Ctx, look: FoodGuardDef, pose: GuardPose) {
  const { x: rx, y: ry } = CAGE_R
  // a warm glow on the ground, so a cage shows up on the dark locked land
  softFx(c, 'under', (g) => {
    const grad = g.createRadialGradient(0, 0, 4, 0, 0, 36)
    grad.addColorStop(0, 'rgba(255,214,120,0.5)')
    grad.addColorStop(1, 'rgba(255,214,120,0)')
    g.save()
    g.scale(1, 0.5)
    g.beginPath()
    g.arc(0, 0, 36, 0, Math.PI * 2)
    g.fillStyle = grad
    g.fill()
    g.restore()
  })
  // wooden base: a short round block
  solid(c, () => {
    c.beginPath()
    c.moveTo(-rx - 2, FLOOR)
    c.lineTo(-rx - 2, 0)
    c.ellipse(0, 0, rx + 2, ry + 1, 0, Math.PI, 0, true)
    c.lineTo(rx + 2, FLOOR)
    c.ellipse(0, FLOOR, rx + 2, ry + 1, 0, 0, Math.PI, false)
    c.closePath()
  }, '#7a4a24')
  solid(c, () => ellipse(c, 0, FLOOR, rx + 2, ry + 1), '#b07a43', 1)
  c.strokeStyle = 'rgba(90,50,20,0.45)'
  c.lineWidth = 0.8
  ellipse(c, 0, FLOOR, rx - 3, ry - 1.5)
  c.stroke()

  const bars = Array.from({ length: BARS }, (_, i) => (i + 0.5) * ((Math.PI * 2) / BARS))
  const bar = (a: number) => {
    const x = Math.cos(a) * rx
    const y = Math.sin(a) * ry
    for (const [w, color] of [
      [2.8, OUTLINE],
      [1.3, BAR],
    ] as const) {
      c.strokeStyle = color
      c.lineWidth = w
      c.lineCap = 'round'
      c.beginPath()
      c.moveTo(x, FLOOR + y)
      c.lineTo(x, TOP + y)
      c.stroke()
    }
  }
  const ring = (front: boolean) => {
    for (const [w, color] of [
      [3.6, OUTLINE],
      [1.9, IRON],
    ] as const) {
      c.strokeStyle = color
      c.lineWidth = w
      c.beginPath()
      c.ellipse(0, TOP, rx, ry, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2)
      c.stroke()
    }
  }

  ring(false)
  for (const a of bars) if (Math.sin(a) < 0) bar(a)
  drawFoodGuard(c, { x: 0, y: FLOOR + 1 }, look, pose, 1, 'none')
  for (const a of bars) if (Math.sin(a) >= 0) bar(a)
  ring(true)

  // domed top with a knob and a hanging ring
  solid(c, () => {
    c.beginPath()
    c.moveTo(-rx, TOP)
    c.bezierCurveTo(-rx, TOP - 15, rx, TOP - 15, rx, TOP)
    c.ellipse(0, TOP, rx, ry, 0, 0, Math.PI, false)
    c.closePath()
  }, IRON)
  c.beginPath()
  c.ellipse(-6, TOP - 5, 5, 2.2, -0.35, 0, Math.PI * 2)
  c.fillStyle = 'rgba(255,255,255,0.35)'
  c.fill()
  c.strokeStyle = OUTLINE
  c.lineWidth = 2.6
  ellipse(c, 0, TOP - 16, 2.6, 2.6)
  c.stroke()
  c.strokeStyle = '#ffcf4a'
  c.lineWidth = 1.1
  c.stroke()
  solid(c, () => ellipse(c, 0, TOP - 11.5, 2.4, 2.4), '#ffcf4a', 1)

  // gold padlock on the door
  const py = FLOOR + ry - 8
  c.strokeStyle = OUTLINE
  c.lineWidth = 2.6
  c.beginPath()
  c.arc(0, py - 1, 2.1, Math.PI, 0)
  c.stroke()
  c.strokeStyle = '#d9a520'
  c.lineWidth = 1.1
  c.stroke()
  solid(c, () => {
    c.beginPath()
    c.roundRect(-3, py - 1, 6, 5, 1.3)
  }, '#ffcf4a', 0.9)
  ellipse(c, 0, py + 1.3, 0.7, 0.9)
  c.fillStyle = OUTLINE
  c.fill()
}

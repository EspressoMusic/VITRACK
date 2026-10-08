import type { AvatarPose } from '../../avatar/model'
import { MAP_HEIGHT, MAP_WIDTH } from '../data/areas'
import { OBJECTS_BY_ID } from '../data/objects'
import { type PointOfInterest, buildOccupancy, isTileUnlocked, pointsOfInterest } from '../systems/MapSystem'
import type { GameState, Point } from '../types'
import { CHORE_MS, CHORE_RANK, type Chore, choreStillNeeded } from './chores'
import { tileToWorld } from './iso'

/** Tiles per second. */
const SPEED = 1.7
/** Model yaw that faces the viewer (toward tile +x+y, i.e. down the screen). */
const FACE_VIEWER = Math.PI / 4
const WAVE_MS = 1300
/** One whole throw (wind-up, fling, settle); the vegetable leaves the paw at THROW_RELEASE of it. */
export const THROW_MS = 480
const WANDER_RADIUS = 6
/** Farm world units per model unit — makes the character about 50 units tall, just under a tree. */
export const AVATAR_WORLD_SCALE = 22

const DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
const key = (x: number, y: number) => y * MAP_WIDTH + x
const inMap = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT

/** 1 = the character may stand here: open land with nothing on it, or a path. */
export function walkableGrid(state: GameState): Uint8Array {
  const byUid = new Map(state.objects.map((o) => [o.uid, o]))
  const occupied = buildOccupancy(state)
  const grid = new Uint8Array(MAP_WIDTH * MAP_HEIGHT)
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (!isTileUnlocked(state, x, y)) continue
      const uid = occupied.get(key(x, y))
      const obj = uid ? byUid.get(uid) : undefined
      if (obj && OBJECTS_BY_ID[obj.defId]?.look.type !== 'path') continue
      grid[key(x, y)] = 1
    }
  }
  return grid
}

/** Breadth-first search over walkable tiles (8 directions, no corner cutting). The start tile may be blocked. */
export function search(grid: Uint8Array, from: Point, maxDist = Infinity) {
  const prev = new Int32Array(grid.length).fill(-1)
  const dist = new Int16Array(grid.length).fill(-1)
  const start = key(from.x, from.y)
  dist[start] = 0
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]
    if (dist[cur] >= maxDist) continue
    const cx = cur % MAP_WIDTH
    const cy = Math.floor(cur / MAP_WIDTH)
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx
      const ny = cy + dy
      if (!inMap(nx, ny)) continue
      const k = key(nx, ny)
      if (!grid[k] || dist[k] !== -1) continue
      if (dx && dy && (!grid[key(cx + dx, cy)] || !grid[key(cx, cy + dy)])) continue
      dist[k] = dist[cur] + 1
      prev[k] = cur
      queue.push(k)
    }
  }
  return { prev, dist, reached: queue }
}

/** Tiles to work a field from: right beside it (best from behind, so the field is in front of the character),
 *  or reaching over from two tiles off when it's boxed in by other fields. */
function standSpots(f: Point): { x: number; y: number; bias: number }[] {
  const spots = []
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const ring = Math.max(Math.abs(dx), Math.abs(dy))
      if (!ring) continue
      spots.push({ x: f.x + dx, y: f.y + dy, bias: ring === 2 ? 5 : dx + dy > 0 ? 1 : dx + dy === 0 ? 0.5 : 0 })
    }
  }
  return spots
}

export function pathTo(prev: Int32Array, goal: number): Point[] {
  const path: Point[] = []
  for (let k = goal; prev[k] !== -1; k = prev[k]) path.push({ x: k % MAP_WIDTH, y: Math.floor(k / MAP_WIDTH) })
  return path.reverse()
}

/** The townsperson: tends the fields (harvests, waters, sows), strolls the streets — often to a house,
 *  shop, park or the gate — and walks to wherever the player taps. */
export class AvatarWalker {
  /** Fractional tile coordinates of the feet; a tile's center is (n + 0.5). */
  x: number
  y: number
  yaw = FACE_VIEWER
  private walkBlend = 0
  private walkPhase = 0
  private targetYaw = FACE_VIEWER
  private path: Point[] = []
  private idleUntil = 0
  private arrivedAt = 0
  private waveAt = -Infinity
  private throwAt = -Infinity
  /** Where the current walk is headed, when it's a place rather than a random spot. */
  private visit: PointOfInterest | null = null
  private insideUntil = 0
  /** Field work under way: walking over (`until` 0), then working until `until`. */
  private chore: { job: Chore; until: number } | null = null
  private workBlend = 0
  /** Lists the fields that want work (set for the player's own city; a visited city has none). */
  chores: ((state: GameState, now: number) => Chore[]) | null = null
  private last = 0
  private cache: { objects: unknown; areas: unknown; grid: Uint8Array } | null = null

  constructor(state: GameState) {
    // Main street, in front of the player's house.
    this.x = 18.5
    this.y = 20.5
    this.placeNear(this.grid(state), { x: 18, y: 20 })
  }

  /** Jumps straight to the walkable tile closest to `near`. */
  private placeNear(grid: Uint8Array, near: Point) {
    const { reached } = search(new Uint8Array(grid.length).fill(1), near)
    const spot = reached.find((k) => grid[k])
    if (spot === undefined) return
    this.x = (spot % MAP_WIDTH) + 0.5
    this.y = Math.floor(spot / MAP_WIDTH) + 0.5
    this.path = []
  }

  private grid(state: GameState): Uint8Array {
    if (!this.cache || this.cache.objects !== state.objects || this.cache.areas !== state.unlockedAreas) {
      this.cache = { objects: state.objects, areas: state.unlockedAreas, grid: walkableGrid(state) }
    }
    return this.cache.grid
  }

  private tile(): Point {
    return { x: Math.floor(this.x), y: Math.floor(this.y) }
  }

  private route(state: GameState, tx: number, ty: number): boolean {
    const grid = this.grid(state)
    if (!inMap(tx, ty) || !grid[key(tx, ty)]) return false
    const { prev, dist } = search(grid, this.tile())
    if (dist[key(tx, ty)] < 0) return false
    this.path = pathTo(prev, key(tx, ty))
    return true
  }

  /** Heads for (tx, ty), dropping whatever it was doing. Returns false when there's no way to get there. */
  walkTo(state: GameState, tx: number, ty: number, now: number): boolean {
    if (!this.route(state, tx, ty)) return false
    this.visit = null
    this.chore = null
    this.insideUntil = 0
    this.idleUntil = now + 9000
    return true
  }

  /** The field job under way, and whether it's being worked on yet (false = still walking over). */
  get task(): { job: Chore; working: boolean } | null {
    return this.chore && { job: this.chore.job, working: this.chore.until > 0 }
  }

  /** Picks the cheapest chore (near and urgent first) and sets off. False when no field can be reached. */
  private startChore(grid: Uint8Array, here: Point, chores: Chore[], now: number): boolean {
    const { prev, dist } = search(grid, here)
    let best: { job: Chore; k: number } | null = null
    let bestCost = Infinity
    for (const job of chores) {
      for (const s of standSpots(job)) {
        const k = key(s.x, s.y)
        if (!inMap(s.x, s.y) || !grid[k] || dist[k] < 0) continue
        const cost = dist[k] + s.bias + CHORE_RANK[job.kind] * 6
        if (cost < bestCost) {
          bestCost = cost
          best = { job, k }
        }
      }
    }
    if (!best) return false
    this.path = pathTo(prev, best.k)
    this.visit = null
    this.chore = { job: best.job, until: 0 }
    this.arrivedAt = now
    return true
  }

  /** Gone indoors for a moment (after walking home). */
  get hidden(): boolean {
    return this.insideUntil > this.last
  }

  wave(now: number) {
    this.waveAt = now
    this.path = []
    this.visit = null
    this.chore = null
    this.targetYaw = FACE_VIEWER
    this.idleUntil = now + 5000
  }

  /** Stops and throws the held vegetable toward tile point `at`, turning to face it at once. */
  throwToward(at: Point, now: number) {
    this.throwAt = now
    this.path = []
    this.visit = null
    this.chore = null
    this.targetYaw = this.yaw = Math.atan2(at.x - this.x, at.y - this.y)
    this.idleUntil = now + 4000
  }

  /** Whether world point (wx, wy) lands on the character. */
  hit(wx: number, wy: number): boolean {
    if (this.hidden) return false
    const p = tileToWorld(this.x, this.y)
    const s = AVATAR_WORLD_SCALE
    return Math.abs(wx - p.x) < 0.7 * s && wy < p.y + 0.3 * s && wy > p.y - 2.5 * s
  }

  /** Moves the character on; returns a chore the moment its work is done (for the owner to carry out). */
  update(state: GameState, now: number): Chore | null {
    let finished: Chore | null = null
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0
    this.last = now
    const grid = this.grid(state)
    const here = this.tile()

    // Something was built on top of us — step off to the nearest free tile.
    if (!this.path.length && !grid[key(here.x, here.y)]) {
      const { prev, reached } = search(grid, here)
      if (reached.length > 1) this.path = pathTo(prev, reached[1])
      else this.placeNear(grid, here)
    }

    if (this.path.length) {
      const next = this.path[0]
      if (!grid[key(next.x, next.y)]) {
        // The way got blocked mid-walk: re-route to the same goal, or give up.
        const goal = this.path[this.path.length - 1]
        this.path = []
        this.route(state, goal.x, goal.y)
      } else {
        const dx = next.x + 0.5 - this.x
        const dy = next.y + 0.5 - this.y
        const dist = Math.hypot(dx, dy)
        const step = SPEED * dt
        if (dist <= step) {
          this.x = next.x + 0.5
          this.y = next.y + 0.5
          this.path.shift()
          if (!this.path.length) this.arrive(now)
        } else {
          this.x += (dx / dist) * step
          this.y += (dy / dist) * step
        }
        if (dist > 0.001) this.targetYaw = Math.atan2(dx, dy)
      }
    } else if (this.chore) {
      const chore = this.chore
      if (!chore.until) {
        // Standing at the field (or the way there got cut off): start the work if it's still wanted.
        const near = Math.max(Math.abs(here.x - chore.job.x), Math.abs(here.y - chore.job.y)) <= 2
        if (near && choreStillNeeded(state, chore.job, now)) {
          chore.until = now + CHORE_MS[chore.job.kind]
          this.targetYaw = Math.atan2(chore.job.x + 0.5 - this.x, chore.job.y + 0.5 - this.y)
        } else {
          this.chore = null
          this.idleUntil = now + 400
        }
      } else if (now >= chore.until) {
        finished = chore.job
        this.chore = null
        this.arrivedAt = now
        this.idleUntil = now + 450 + Math.random() * 450
      }
    } else if (now > this.idleUntil) {
      const chores = this.hidden ? null : this.chores?.(state, now)
      if (!chores?.length || !this.startChore(grid, here, chores, now)) this.wander(state, grid, here, now)
    } else if (now - this.arrivedAt > 900 && (!this.visit || (this.visit.kind === 'home' && !this.hidden))) {
      // Turn to the viewer — except while looking at a place (but do once back out of the house).
      this.targetYaw = FACE_VIEWER
    }

    const moving = this.path.length > 0
    this.walkBlend += ((moving ? 1 : 0) - this.walkBlend) * Math.min(1, dt * 8)
    this.workBlend += ((this.chore?.until ? 1 : 0) - this.workBlend) * Math.min(1, dt * 7)
    if (moving) this.walkPhase += dt * 11
    const turn = Math.atan2(Math.sin(this.targetYaw - this.yaw), Math.cos(this.targetYaw - this.yaw))
    this.yaw += turn * Math.min(1, dt * 10)
    return finished
  }

  private arrive(now: number) {
    this.arrivedAt = now
    if (this.chore) return
    const visit = this.visit
    if (!visit) {
      this.idleUntil = Math.max(this.idleUntil, now + 2500 + Math.random() * 5000)
      return
    }
    this.targetYaw = Math.atan2(visit.face.x, visit.face.y)
    if (visit.kind === 'home') {
      // Pop inside for a bit, then come back out the door.
      this.insideUntil = now + 3500 + Math.random() * 3000
      this.yaw = this.targetYaw
      this.idleUntil = this.insideUntil + 1500
    } else {
      this.idleUntil = now + 4000 + Math.random() * 4000
    }
  }

  /** Half the time heads for a place in town, otherwise strolls to a random nearby spot. */
  private wander(state: GameState, grid: Uint8Array, here: Point, now: number) {
    this.visit = null
    this.idleUntil = now + 4000
    const { prev, dist, reached } = search(grid, here)
    if (Math.random() < 0.5) {
      const places = pointsOfInterest(state).filter((p) => {
        const k = key(p.tile.x, p.tile.y)
        return grid[k] && dist[k] > 0
      })
      if (places.length) {
        const place = places[Math.floor(Math.random() * places.length)]
        this.path = pathTo(prev, key(place.tile.x, place.tile.y))
        this.visit = place
        return
      }
    }
    const options = reached.filter((k) => dist[k] >= 2 && dist[k] <= WANDER_RADIUS)
    if (options.length) this.path = pathTo(prev, options[Math.floor(Math.random() * options.length)])
  }

  pose(now: number): AvatarPose {
    return {
      t: now / 1000,
      walk: this.walkBlend,
      walkPhase: this.walkPhase,
      wave: (now - this.waveAt) / WAVE_MS,
      throw: (now - this.throwAt) / THROW_MS,
      work: this.workBlend,
    }
  }
}

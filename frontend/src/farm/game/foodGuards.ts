import { FOOD_GUARD, FOOD_GUARD_SPOTS, type FoodGuardDef, type FoodGuardShape, type FoodGuardTier } from '../data/foodGuards'
import type { FoodGuardSpec } from '../systems/FoodGuardSystem'
import type { Point } from '../types'
import { type Germ, type GermDrawable, type GermEvent, type GermSwarm, OUTSIDE_DEPTH } from './germs'
import { type Box, boxAround } from './ink'
import { tileToWorld } from './iso'
import { OUTLINE, ellipse, shade, softFx } from './sprites'

/** Food guards stand outside the wall and shoot arrows at germs on the road (see data/foodGuards.ts).
 *  Kept light: a guard's picture is drawn once per pose and cached by the renderer; only arrows are drawn every frame. */

type Ctx = CanvasRenderingContext2D
/** aim: bow drawn / stone raised to throw; throw: the stone just left the hand (stone throwers only). */
export type GuardPose = 'idle' | 'aim' | 'throw'
type Pose = GuardPose
/** Archers outside the wall carry a bow; the crew on top of the wall throws stones. */
export type GuardWeapon = 'bow' | 'stones'

/** guardLanded: a new guard touched down (`tile` where it stands, `at` its feet in world units). */
export type FoodGuardEvent = GermEvent | { type: 'guardLanded'; tile: Point; at: Point; color: string }

interface Guard {
  spec: FoodGuardSpec
  spot: Point
  /** Feet, world units. */
  feet: Point
  /** 1 = faces right on screen, -1 = left (always toward the gate's road). */
  face: 1 | -1
  cooldown: number
  /** Seconds left with the bow drawn; below 0 = not aiming. */
  aim: number
  target: Germ | null
  /** Drops in from the sky at this time (ms). */
  landAt: number
  landed: boolean
  hopAt: number
  phase: number
}

interface Arrow {
  from: Point
  to: Point
  target: Germ
  t: number
  dur: number
  power: number
  arc: number
}

const DROP_MS = 650
const ARRIVE_GAP_MS = 420
const HOP_MS = 420
/** The germs' road meets the gate here (tile x): guards left of it face right, the others face left. */
const ROAD_X = 18.5
const TIER_SCALE: Record<FoodGuardTier, number> = { 1: 0.9, 2: 1, 3: 1.1 }
const BOW_COLOR: Record<FoodGuardTier, string> = { 1: '#a0683a', 2: '#c9d3df', 3: '#ffcf4a' }

export class FoodGuardSquad {
  private guards: Guard[] = []
  private arrows: Arrow[] = []
  private last = 0

  /** The week's guards; ones listed in `arrivals` drop in one after another, the rest are just there. */
  setRoster(specs: FoodGuardSpec[], arrivals: readonly string[], now: number) {
    const before = new Map(this.guards.map((g) => [g.spec.id, g]))
    let wave = 0
    this.guards = specs.slice(0, FOOD_GUARD_SPOTS.length).map((spec, i) => {
      const spot = FOOD_GUARD_SPOTS[i]
      const prev = before.get(spec.id)
      const arriving = !prev && arrivals.includes(spec.id)
      return {
        spec,
        spot,
        feet: tileToWorld(spot.x, spot.y),
        face: spot.x < ROAD_X ? 1 : -1,
        cooldown: prev?.cooldown ?? 0.5 + i * 0.37,
        aim: -1,
        target: null,
        landAt: arriving ? now + 250 + wave++ * ARRIVE_GAP_MS : 0,
        landed: !arriving,
        hopAt: -Infinity,
        phase: i * 1.7,
      }
    })
  }

  /** Where guard `id` stands (tile coordinates), if it's on the map. */
  spotOf(id: string): Point | null {
    return this.guards.find((g) => g.spec.id === id)?.spot ?? null
  }

  update(germs: GermSwarm | null, now: number): FoodGuardEvent[] {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0
    this.last = now
    const events: FoodGuardEvent[] = []
    // Damage already flying at each germ, so guards don't all pile arrows on one that's about to pop.
    const incoming = new Map<Germ, number>()
    for (const a of this.arrows) incoming.set(a.target, (incoming.get(a.target) ?? 0) + Math.max(1, a.power - a.target.def.armor))
    const doomed = (g: Germ) => (incoming.get(g) ?? 0) >= g.hp

    for (const g of this.guards) {
      if (!g.landed) {
        if (now >= g.landAt + DROP_MS) {
          g.landed = true
          events.push({ type: 'guardLanded', tile: g.spot, at: g.feet, color: g.spec.def.look.color })
        }
        continue
      }
      if (!germs) continue
      g.cooldown -= dt
      if (g.aim >= 0) {
        g.aim -= dt
        if (g.aim < 0) {
          const target = g.target && germs.aimPoint(g.target) ? g.target : germs.aimAt(g.spot, FOOD_GUARD.range, doomed)
          g.target = null
          if (target) {
            this.shoot(g, target, germs)
            incoming.set(target, (incoming.get(target) ?? 0) + Math.max(1, g.spec.power - target.def.armor))
            g.cooldown = g.spec.reload
          } else {
            g.cooldown = 0.4
          }
        }
      } else if (g.cooldown <= 0) {
        g.target = germs.aimAt(g.spot, FOOD_GUARD.range, doomed)
        if (g.target) g.aim = FOOD_GUARD.aimTime
        else g.cooldown = 0.3
      }
    }

    for (const a of this.arrows) {
      a.t += dt / a.dur
      const p = germs?.aimPoint(a.target)
      if (p) a.to = p
      if (a.t >= 1 && germs) events.push(...germs.arrowHit(a.target, a.power))
    }
    this.arrows = this.arrows.filter((a) => a.t < 1)
    return events
  }

  private shoot(g: Guard, target: Germ, germs: GermSwarm) {
    const to = germs.aimPoint(target)
    if (!to) return
    const s = TIER_SCALE[g.spec.def.tier]
    const from = { x: g.feet.x + g.face * 15 * s, y: g.feet.y - 14 * s }
    const dist = Math.hypot(to.x - from.x, to.y - from.y)
    this.arrows.push({ from, to, target, t: 0, dur: 0.3 + dist / 520, power: g.spec.power, arc: 8 + dist * 0.16 })
  }

  /** The guard under a world point (only ones standing on the ground). */
  guardAt(wx: number, wy: number): string | null {
    for (const g of this.guards) {
      if (!g.landed) continue
      const s = TIER_SCALE[g.spec.def.tier]
      if (Math.abs(wx - g.feet.x) < 13 * s && wy < g.feet.y + 3 && wy > g.feet.y - 30 * s) return g.spec.id
    }
    return null
  }

  /** A little jump, e.g. when tapped. */
  hop(id: string) {
    const g = this.guards.find((x) => x.spec.id === id)
    if (g) g.hopAt = performance.now()
  }

  /** Guards (cached per pose) and flying arrows, for the renderer's outside pass. */
  drawables(now: number): GermDrawable[] {
    const list: GermDrawable[] = []
    const t = now / 1000
    const hopNow = performance.now()
    for (const g of this.guards) {
      let lift = Math.max(0, Math.sin(t * 2.4 + g.phase)) * 0.8
      if (!g.landed) {
        const p = (now - g.landAt) / DROP_MS
        if (p < 0) continue
        lift = (1 - Math.min(1, p)) ** 2 * 110
      }
      const hop = (hopNow - g.hopAt) / HOP_MS
      if (hop >= 0 && hop < 1) lift += Math.sin(hop * Math.PI) * 9
      const pose: Pose = g.aim >= 0 ? 'aim' : 'idle'
      const { def } = g.spec
      list.push({
        depth: OUTSIDE_DEPTH + g.spot.x + g.spot.y - 1,
        at: g.feet,
        box: guardBox(g.feet),
        alpha: 1,
        lift,
        cache: { id: `foodGuard:${def.id}:${pose}`, key: `${g.spot.x},${g.spot.y}` },
        draw: (c: Ctx) => drawFoodGuard(c, g.feet, def, pose, g.face),
      })
    }
    for (const a of this.arrows) {
      const k = Math.min(1, a.t)
      const p = { x: a.from.x + (a.to.x - a.from.x) * k, y: a.from.y + (a.to.y - a.from.y) * k - Math.sin(k * Math.PI) * a.arc }
      const angle = Math.atan2(a.to.y - a.from.y - Math.cos(k * Math.PI) * Math.PI * a.arc, a.to.x - a.from.x)
      list.push({ depth: OUTSIDE_DEPTH + 600, at: p, box: boxAround(p.x, p.y, 16, 16, 16), alpha: 1, noInk: true, draw: (c: Ctx) => drawArrow(c, p, angle) })
    }
    return list
  }
}

export function guardBox(feet: Point): Box {
  return boxAround(feet.x, feet.y, 25, 38, 5)
}

// ---------- art (local coordinates: feet at 0,0, facing right) ----------

/** Fills a path with a dark outline around it. Compound shapes (several circles) get one clean outline. */
function solid(c: Ctx, path: () => void, fill: string, lw = 1.5) {
  path()
  c.strokeStyle = OUTLINE
  c.lineWidth = lw * 2
  c.lineJoin = 'round'
  c.stroke()
  path()
  c.fillStyle = fill
  c.fill()
}

function stroke(c: Ctx, width: number, color: string, draw: () => void) {
  c.strokeStyle = color
  c.lineWidth = width
  c.lineCap = 'round'
  c.beginPath()
  draw()
  c.stroke()
}

interface ShapeArt {
  path: (c: Ctx) => void
  /** Middle of the face. */
  face: [number, number]
  /** Where a top (stem, leaves) sits. */
  top: [number, number]
  shine: [number, number, number, number]
  /** Drawn before the body (a bowl's food, a fish's tail, a drumstick's bone…). */
  back?: (c: Ctx, def: FoodGuardDef) => void
}

const SHAPES: Record<FoodGuardShape, ShapeArt> = {
  round: {
    path: (c) => ellipse(c, 0, -15, 8.6, 8.4),
    face: [1.2, -15.5],
    top: [0, -23.2],
    shine: [-3.8, -19.4, 2.2, 1.4],
  },
  long: {
    path: (c) => {
      c.beginPath()
      c.roundRect(-6.2, -27, 12.4, 21, 6.2)
    },
    face: [1, -18],
    top: [0, -26.6],
    shine: [-3, -22.4, 1.4, 2.4],
  },
  cone: {
    path: (c) => {
      c.beginPath()
      c.moveTo(-8, -23)
      c.quadraticCurveTo(0, -27, 8, -23)
      c.quadraticCurveTo(7, -12, 1.2, -5.5)
      c.quadraticCurveTo(0, -4.4, -1.2, -5.5)
      c.quadraticCurveTo(-7, -12, -8, -23)
      c.closePath()
    },
    face: [0.8, -18.6],
    top: [0, -25],
    shine: [-4.4, -21.4, 1.8, 1.2],
  },
  puff: {
    path: (c) => {
      c.beginPath()
      for (const [x, y, r] of [
        [-5.2, -17.2, 5],
        [5.2, -17.2, 5],
        [0, -21.6, 5.6],
        [0, -15.4, 6.2],
      ]) {
        c.moveTo(x + r, y)
        c.arc(x, y, r, 0, Math.PI * 2)
      }
    },
    face: [0.8, -16.4],
    top: [0, -26.8],
    shine: [-2.6, -24.4, 1.8, 1.1],
    back: (c, def) => {
      // the stalk
      solid(c, () => {
        c.beginPath()
        c.roundRect(-3.4, -12, 6.8, 6.6, 2.4)
      }, shade(def.look.color, 1.45))
    },
  },
  drop: {
    path: (c) => {
      c.beginPath()
      c.moveTo(0, -27)
      c.bezierCurveTo(5.5, -27, 5, -19, 8.6, -12.5)
      c.bezierCurveTo(11, -4.5, -11, -4.5, -8.6, -12.5)
      c.bezierCurveTo(-5, -19, -5.5, -27, 0, -27)
      c.closePath()
    },
    face: [0.6, -17.4],
    top: [0, -26.6],
    shine: [-2.4, -23.4, 1.2, 1.8],
  },
  curve: {
    path: (c) => {
      c.beginPath()
      c.moveTo(-2, -27.5)
      c.bezierCurveTo(-13, -22, -12, -5, 6, -6)
      c.quadraticCurveTo(9.4, -6.2, 8.6, -8.8)
      c.bezierCurveTo(-0.5, -10, -1, -20, 1.6, -26.4)
      c.quadraticCurveTo(0.6, -28.6, -2, -27.5)
      c.closePath()
    },
    face: [-4.4, -15.6],
    top: [-0.6, -27.4],
    shine: [-8, -17, 1.1, 2.6],
  },
  egg: {
    path: (c) => ellipse(c, 0, -15.5, 7.6, 9.6),
    face: [1, -15.8],
    top: [0, -25],
    shine: [-3.2, -20.4, 1.6, 2.2],
  },
  fish: {
    path: (c) => ellipse(c, 1.6, -15, 9.6, 7.4),
    face: [4.2, -16],
    top: [0, -22],
    shine: [-1, -19.4, 2.4, 1.2],
    back: (c, def) => {
      // tail and top fin
      solid(c, () => {
        c.beginPath()
        c.moveTo(-6, -15)
        c.lineTo(-13.4, -21.6)
        c.quadraticCurveTo(-11, -15, -13.4, -8.4)
        c.closePath()
      }, shade(def.look.color, 0.86))
      solid(c, () => {
        c.beginPath()
        c.moveTo(-3, -21)
        c.quadraticCurveTo(0, -26.4, 4.6, -21.6)
        c.closePath()
      }, shade(def.look.color, 0.86))
    },
  },
  bean: {
    path: (c) => {
      c.beginPath()
      c.moveTo(-5.5, -25)
      c.bezierCurveTo(1, -28, 9, -24, 8.4, -15)
      c.bezierCurveTo(8, -6, -2, -3.6, -7, -7.5)
      c.bezierCurveTo(-10, -10, -7.6, -13.5, -5.4, -15.5)
      c.bezierCurveTo(-3.6, -17.2, -10, -21.5, -5.5, -25)
      c.closePath()
    },
    face: [1.8, -16.2],
    top: [-1.4, -26],
    shine: [-2.6, -23.4, 2, 1.1],
  },
  bowl: {
    path: (c) => {
      c.beginPath()
      c.moveTo(-9.8, -17.2)
      c.lineTo(9.8, -17.2)
      c.bezierCurveTo(9.8, -4.6, -9.8, -4.6, -9.8, -17.2)
      c.closePath()
    },
    face: [0.8, -12.6],
    top: [0, -21.8],
    shine: [-6.4, -15, 1.1, 1.6],
    back: (c, def) => {
      // what's in the bowl, heaped over the rim
      solid(c, () => {
        c.beginPath()
        c.ellipse(0, -17.2, 8.6, 4.8, 0, Math.PI, Math.PI * 2)
        c.closePath()
      }, def.look.accent)
      c.fillStyle = shade(def.look.accent, 0.84)
      for (const [x, y] of [
        [-4.6, -18.6],
        [0.4, -20.4],
        [4.4, -18.4],
      ]) {
        ellipse(c, x, y, 1.3, 0.9)
        c.fill()
      }
    },
  },
  cup: {
    path: (c) => {
      c.beginPath()
      c.moveTo(-7.4, -25)
      c.lineTo(7.4, -25)
      c.lineTo(6, -6.8)
      c.quadraticCurveTo(5.8, -5.8, 4.8, -5.8)
      c.lineTo(-4.8, -5.8)
      c.quadraticCurveTo(-5.8, -5.8, -6, -6.8)
      c.closePath()
    },
    face: [0.8, -18],
    top: [0, -27.4],
    shine: [-4.6, -20, 1, 2.4],
  },
  drumstick: {
    path: (c) => {
      c.beginPath()
      c.moveTo(0, -23.6)
      c.bezierCurveTo(7, -24, 9.4, -15, 8.4, -11)
      c.bezierCurveTo(7.2, -6, -7.2, -6, -8.4, -11)
      c.bezierCurveTo(-9.4, -15, -7, -24, 0, -23.6)
      c.closePath()
    },
    face: [0.4, -14.6],
    top: [0, -23.4],
    shine: [-3.6, -19.6, 2, 1.3],
    back: (c, def) => {
      // the bone, sticking up like a hat
      stroke(c, 4.6, OUTLINE, () => {
        c.moveTo(1.4, -20)
        c.lineTo(4.6, -27.6)
      })
      stroke(c, 2.2, def.look.accent, () => {
        c.moveTo(1.4, -20)
        c.lineTo(4.6, -27.6)
      })
      for (const [x, y] of [
        [3.2, -29],
        [6.2, -28],
      ]) solid(c, () => ellipse(c, x, y, 1.9, 1.9), def.look.accent, 1)
    },
  },
  loaf: {
    path: (c) => {
      c.beginPath()
      c.moveTo(-8.6, -6)
      c.lineTo(-8.6, -18.5)
      c.bezierCurveTo(-12, -26.5, -3, -28.5, 0, -25.6)
      c.bezierCurveTo(3, -28.5, 12, -26.5, 8.6, -18.5)
      c.lineTo(8.6, -6)
      c.closePath()
    },
    face: [0.8, -15.4],
    top: [0, -26],
    shine: [-5.4, -22.4, 1.8, 1.1],
  },
}

function star(c: Ctx, x: number, y: number, r: number, inner: number, squash = 1) {
  c.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? inner : r
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * squash)
  }
  c.closePath()
}

const LEAF = '#5fae3e'

function drawTop(c: Ctx, def: FoodGuardDef, x: number, y: number) {
  switch (def.look.top) {
    case 'calyx':
      stroke(c, 3, OUTLINE, () => {
        c.moveTo(x, y)
        c.lineTo(x + 0.6, y - 3.4)
      })
      stroke(c, 1.4, '#3f7f2a', () => {
        c.moveTo(x, y)
        c.lineTo(x + 0.6, y - 3.4)
      })
      solid(c, () => star(c, x, y + 0.6, 4.8, 1.7, 0.6), LEAF, 0.9)
      return
    case 'stem':
      stroke(c, 3, OUTLINE, () => {
        c.moveTo(x, y + 0.6)
        c.quadraticCurveTo(x + 0.2, y - 2, x + 1, y - 3.6)
      })
      stroke(c, 1.4, '#7a4e2c', () => {
        c.moveTo(x, y + 0.6)
        c.quadraticCurveTo(x + 0.2, y - 2, x + 1, y - 3.6)
      })
      solid(c, () => ellipse(c, x + 3.4, y - 2.6, 2.7, 1.3, -0.5), LEAF, 0.9)
      return
    case 'tuft':
      for (const [dx, dy, rx, ry, rot] of [
        [-2.3, -3.2, 1.4, 3.6, -0.5],
        [2.3, -3.2, 1.4, 3.6, 0.5],
        [0, -4.2, 1.6, 4.2, 0],
      ]) solid(c, () => ellipse(c, x + dx, y + dy, rx, ry, rot), LEAF, 0.9)
      return
    case 'crown':
      solid(c, () => star(c, x, y + 0.4, 3, 1.2, 0.6), shade(def.look.color, 0.6), 0.9)
      return
    case 'sprout':
      stroke(c, 2.6, OUTLINE, () => {
        c.moveTo(x, y + 0.5)
        c.lineTo(x, y - 3)
      })
      stroke(c, 1.1, '#4f9e35', () => {
        c.moveTo(x, y + 0.5)
        c.lineTo(x, y - 3)
      })
      solid(c, () => ellipse(c, x - 1.9, y - 3.6, 2.1, 1.1, 0.5), '#7ccf55', 0.8)
      solid(c, () => ellipse(c, x + 1.9, y - 3.9, 2.1, 1.1, -0.5), '#7ccf55', 0.8)
  }
}

/** Detail inside the body's outline (the body path is already the clip). */
function drawPattern(c: Ctx, def: FoodGuardDef) {
  const { accent, color } = def.look
  const dots = (fill: string, list: number[][]) => {
    c.fillStyle = fill
    for (const [x, y, rx, ry = rx] of list) {
      ellipse(c, x, y, rx, ry)
      c.fill()
    }
  }
  switch (def.look.pattern) {
    case 'stripes':
      for (const x of [-3.6, 0, 3.6]) stroke(c, 1.3, accent, () => {
        c.moveTo(x, -27)
        c.lineTo(x, -6)
      })
      return
    case 'seeds':
      dots(accent, [
        [-4.6, -21.4, 0.5, 0.8],
        [-0.8, -22.6, 0.5, 0.8],
        [3.6, -21.6, 0.5, 0.8],
        [-5, -14.4, 0.5, 0.8],
        [5.2, -15, 0.5, 0.8],
        [-2.4, -10.6, 0.5, 0.8],
        [2.6, -10.2, 0.5, 0.8],
        [0.2, -7.6, 0.45, 0.7],
      ])
      return
    case 'dots':
      dots(accent, [
        [-5, -18, 0.6],
        [5.4, -12.6, 0.6],
        [-3.4, -10.4, 0.5],
        [3.6, -21, 0.5],
        [-6.2, -13.4, 0.45],
      ])
      return
    case 'holes':
      dots(shade(color, 0.86), [
        [-5, -21, 1.6],
        [5, -9.6, 2],
        [-4.8, -9.4, 1.2],
        [6, -20.6, 1.2],
      ])
      return
    case 'pit':
      ellipse(c, 0, -13.4, 6.2, 6.8)
      c.fillStyle = accent
      c.fill()
      solid(c, () => ellipse(c, 0, -10.2, 3.1, 3), '#8a5a33', 0.8)
      return
    case 'kernels':
      for (let row = 0; row < 7; row++) {
        for (const x of [-3.6, 0, 3.6]) {
          ellipse(c, x + (row % 2) * 0.6, -25 + row * 2.9, 1.5, 1.2)
          c.fillStyle = accent
          c.fill()
        }
      }
      return
    case 'rings':
      for (const y of [-20.4, -15.6, -11]) {
        stroke(c, 1, accent, () => {
          c.moveTo(-7.2, y)
          c.lineTo(-4.4, y + 0.6)
          c.moveTo(4.6, y + 0.4)
          c.lineTo(7, y - 0.2)
        })
      }
      return
    case 'scales':
      ellipse(c, 3, -10.6, 7.4, 3.2)
      c.fillStyle = accent
      c.fill()
      for (const [x, y] of [
        [-4.6, -17.4],
        [-4.6, -13],
        [-1.6, -15.2],
      ]) {
        stroke(c, 0.9, shade(color, 0.8), () => c.arc(x, y, 1.8, -Math.PI / 2, Math.PI / 2))
      }
      return
    case 'band':
      c.fillStyle = accent
      c.fillRect(-8, -13.4, 16, 3.6)
      return
    case 'crust':
      c.save()
      c.translate(0, -15)
      c.scale(0.76, 0.78)
      c.translate(0, 15)
      SHAPES.loaf.path(c)
      c.fillStyle = accent
      c.fill()
      c.restore()
      return
    case 'dent':
      stroke(c, 1, shade(color, 0.68), () => {
        c.moveTo(-5.2, -13.6)
        c.quadraticCurveTo(-3.4, -10.2, -0.4, -9.2)
      })
  }
}

function drawFace(c: Ctx, x: number, y: number, pose: Pose) {
  for (const dx of [-2.8, 2.8]) {
    ellipse(c, x + dx, y, 1.3, pose === 'idle' ? 1.7 : 1.25)
    c.fillStyle = OUTLINE
    c.fill()
    ellipse(c, x + dx + 0.45, y - 0.6, 0.45, 0.45)
    c.fillStyle = '#ffffff'
    c.fill()
  }
  if (pose !== 'idle') {
    stroke(c, 1, OUTLINE, () => {
      c.moveTo(x - 4.2, y - 3)
      c.lineTo(x - 1.6, y - 2.1)
      c.moveTo(x + 4.2, y - 3)
      c.lineTo(x + 1.6, y - 2.1)
    })
    stroke(c, 1, OUTLINE, () => {
      c.moveTo(x - 1.2, y + 3)
      c.lineTo(x + 1.4, y + 2.8)
    })
  } else {
    stroke(c, 1, OUTLINE, () => {
      c.moveTo(x - 1.6, y + 2.5)
      c.quadraticCurveTo(x, y + 4.1, x + 1.6, y + 2.5)
    })
  }
  c.fillStyle = 'rgba(255,110,130,0.5)'
  for (const dx of [-4.9, 4.9]) {
    ellipse(c, x + dx, y + 2.3, 1.3, 0.85)
    c.fill()
  }
}

function drawBow(c: Ctx, tier: FoodGuardTier, pose: Pose, skin: string) {
  const cx = 6.5
  const cy = -14
  const r = 8.5
  const a = 1.05
  const top = { x: cx + Math.cos(-a) * r, y: cy + Math.sin(-a) * r }
  const bottom = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  const pull = pose === 'aim' ? { x: 7.6, y: cy } : null
  // string
  stroke(c, 0.8, '#fff8e6', () => {
    c.moveTo(top.x, top.y)
    if (pull) c.lineTo(pull.x, pull.y)
    c.lineTo(bottom.x, bottom.y)
  })
  // the bow itself
  for (const [w, color] of [
    [3.2, OUTLINE],
    [1.5, BOW_COLOR[tier]],
  ] as const) {
    stroke(c, w, color, () => c.arc(cx, cy, r, -a, a))
  }
  if (pull) {
    // arrow on the string
    stroke(c, 2.2, OUTLINE, () => {
      c.moveTo(pull.x, cy)
      c.lineTo(18.4, cy)
    })
    stroke(c, 0.9, '#d9a066', () => {
      c.moveTo(pull.x, cy)
      c.lineTo(18.4, cy)
    })
    solid(c, () => {
      c.beginPath()
      c.moveTo(21, cy)
      c.lineTo(18, cy - 1.8)
      c.lineTo(18, cy + 1.8)
      c.closePath()
    }, '#dfe5ec', 0.7)
  }
  // hands
  solid(c, () => ellipse(c, cx + r - 0.2, cy + 0.4, 1.7, 1.7), skin, 0.8)
  if (pull) solid(c, () => ellipse(c, pull.x, pull.y + 0.3, 1.6, 1.6), skin, 0.8)
}

const STONE = '#a3abb5'
export const STONE_DUST = '#b9b0a2'

/** A lumpy little stone of radius `r` centered on (x, y). */
export function drawStone(c: Ctx, x: number, y: number, r: number, lw = 0.8) {
  solid(c, () => {
    c.beginPath()
    c.moveTo(x - r, y + r * 0.2)
    c.quadraticCurveTo(x - r * 0.9, y - r * 0.9, x + r * 0.1, y - r)
    c.quadraticCurveTo(x + r * 1.05, y - r * 0.6, x + r, y + r * 0.3)
    c.quadraticCurveTo(x + r * 0.5, y + r, x - r * 0.3, y + r * 0.85)
    c.quadraticCurveTo(x - r * 1.05, y + r * 0.7, x - r, y + r * 0.2)
    c.closePath()
  }, STONE, lw)
  ellipse(c, x - r * 0.35, y - r * 0.4, r * 0.38, r * 0.24, -0.5)
  c.fillStyle = 'rgba(255,255,255,0.6)'
  c.fill()
}

/** A stone thrower's arms behind the body: idle holds a stone out front, aim winds up with it raised behind the head,
 *  throw follows through with the front arm. Returns what goes over the body (front hand, held stone). */
function stoneArms(c: Ctx, pose: Pose, skin: string): () => void {
  if (pose === 'aim') {
    stroke(c, 2, OUTLINE, () => {
      c.moveTo(-5, -16)
      c.lineTo(-10.4, -24.4)
      c.moveTo(3, -14)
      c.lineTo(10.8, -17.4)
    })
    drawStone(c, -11.4, -27.2, 2.7)
    solid(c, () => ellipse(c, -10.4, -24.6, 1.6, 1.6), skin, 0.8)
    return () => solid(c, () => ellipse(c, 11, -17.5, 1.6, 1.6), skin, 0.8)
  }
  stroke(c, 2, OUTLINE, () => {
    c.moveTo(-6, -13)
    c.lineTo(-9.4, -10.4)
    c.moveTo(3, -13)
    if (pose === 'throw') c.lineTo(12.2, -19)
    else c.lineTo(9.8, -11.2)
  })
  solid(c, () => ellipse(c, -9.6, -10.2, 1.6, 1.6), skin, 0.8)
  if (pose === 'throw') return () => solid(c, () => ellipse(c, 12.4, -19.2, 1.6, 1.6), skin, 0.8)
  return () => {
    drawStone(c, 11.4, -13.4, 2.4)
    solid(c, () => ellipse(c, 10, -11.2, 1.6, 1.6), skin, 0.8)
  }
}

/** Paints a food guard standing with its feet at `feet` (world units), facing `face`. */
export function drawFoodGuard(ctx: Ctx, feet: Point, def: FoodGuardDef, pose: Pose, face: 1 | -1, weapon: GuardWeapon = 'bow') {
  softFx(ctx, 'under', (s) => {
    ellipse(s, feet.x, feet.y, 9.5, 3.4)
    s.fillStyle = 'rgba(40,30,20,0.24)'
    s.fill()
  })
  const art = SHAPES[def.look.shape]
  const scale = TIER_SCALE[def.tier]
  const skin = shade(def.look.color, 0.9)
  const c = ctx
  c.save()
  c.translate(feet.x, feet.y)
  c.scale(face * scale, scale)
  c.lineCap = 'round'
  c.lineJoin = 'round'

  if (weapon === 'stones') {
    // a little pile of spare stones at the heels
    for (const [x, y, r] of [
      [-8.4, -1.6, 1.9],
      [-5.8, -1.2, 1.6],
      [-7.2, -3.8, 1.5],
    ]) drawStone(c, x, y, r, 0.7)
  } else {
    drawQuiver(c)
  }

  // legs and boots
  stroke(c, 2.4, OUTLINE, () => {
    c.moveTo(-2.8, -8)
    c.lineTo(-3.2, -1.4)
    c.moveTo(2.8, -8)
    c.lineTo(3.2, -1.4)
  })
  for (const x of [-3.6, 3.8]) solid(c, () => ellipse(c, x, -1, 2.4, 1.4), '#6b4423', 0.9)
  // arms (behind the body, so they never cross the face)
  let hands: (() => void) | null = null
  if (weapon === 'stones') {
    hands = stoneArms(c, pose, skin)
  } else {
    // the back one hangs, the front one holds the bow's grip
    stroke(c, 2, OUTLINE, () => {
      c.moveTo(-6, -13)
      c.lineTo(-9.4, -10.4)
      c.moveTo(3, -13)
      c.lineTo(14.6, -13.4)
    })
    solid(c, () => ellipse(c, -9.6, -10.2, 1.6, 1.6), skin, 0.8)
  }

  art.back?.(c, def)
  solid(c, () => art.path(c), def.look.color)
  if (def.look.pattern) {
    c.save()
    art.path(c)
    c.clip()
    drawPattern(c, def)
    c.restore()
  }
  const [sx, sy, srx, sry] = art.shine
  ellipse(c, sx, sy, srx, sry, -0.5)
  c.fillStyle = 'rgba(255,255,255,0.55)'
  c.fill()
  if (def.look.top) drawTop(c, def, art.top[0], art.top[1])
  drawFace(c, art.face[0], art.face[1], pose)
  if (hands) hands()
  else drawBow(c, def.tier, pose, skin)
  c.restore()
}

/** Quiver on an archer's back, two arrows poking out over the shoulder. */
function drawQuiver(c: Ctx) {
  for (const [x0, y0, x1, y1] of [
    [-6.6, -21, -10.6, -26.4],
    [-5, -21.6, -7.6, -27.6],
  ]) {
    stroke(c, 2.2, OUTLINE, () => {
      c.moveTo(x0, y0)
      c.lineTo(x1, y1)
    })
    const a = Math.atan2(y1 - y0, x1 - x0)
    solid(c, () => {
      c.beginPath()
      c.moveTo(x1 - Math.cos(a) * 3.2, y1 - Math.sin(a) * 3.2)
      c.lineTo(x1 + Math.cos(a + 2.5) * 2.2, y1 + Math.sin(a + 2.5) * 2.2)
      c.lineTo(x1 + Math.cos(a) * 0.6, y1 + Math.sin(a) * 0.6)
      c.lineTo(x1 + Math.cos(a - 2.5) * 2.2, y1 + Math.sin(a - 2.5) * 2.2)
      c.closePath()
    }, '#ff5d7a', 0.7)
  }
  solid(c, () => {
    c.save()
    c.translate(-6.4, -17.6)
    c.rotate(-0.32)
    c.beginPath()
    c.roundRect(-2.2, -5.4, 4.4, 10.8, 1.6)
    c.restore()
  }, '#a0623a', 1)
}

function drawArrow(c: Ctx, p: Point, angle: number) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  const tail = { x: p.x - dx * 14, y: p.y - dy * 14 }
  stroke(c, 2.8, OUTLINE, () => {
    c.moveTo(tail.x, tail.y)
    c.lineTo(p.x, p.y)
  })
  stroke(c, 1.3, '#d9a066', () => {
    c.moveTo(tail.x, tail.y)
    c.lineTo(p.x, p.y)
  })
  c.beginPath()
  c.moveTo(p.x + dx * 3.8, p.y + dy * 3.8)
  c.lineTo(p.x - dy * 2.3, p.y + dx * 2.3)
  c.lineTo(p.x + dy * 2.3, p.y - dx * 2.3)
  c.closePath()
  c.fillStyle = '#dfe5ec'
  c.fill()
  c.strokeStyle = OUTLINE
  c.lineWidth = 0.8
  c.stroke()
  c.fillStyle = '#ff5d7a'
  for (const side of [-1, 1]) {
    c.beginPath()
    c.moveTo(tail.x + dx * 3, tail.y + dy * 3)
    c.lineTo(tail.x - side * dy * 2.4 - dx * 0.6, tail.y + side * dx * 2.4 - dy * 0.6)
    c.lineTo(tail.x, tail.y)
    c.closePath()
    c.fill()
  }
}

/** World box a still guard needs, with its feet at (0, 0). */
export const FOOD_GUARD_PORTRAIT_BOX: Box = boxAround(0, 0, 23, 33, 3)

/** A guard standing still with its feet at (0, 0), for the toast. */
export function paintFoodGuardPortrait(ctx: Ctx, def: FoodGuardDef) {
  drawFoodGuard(ctx, { x: 0, y: 0 }, def, 'idle', 1)
}

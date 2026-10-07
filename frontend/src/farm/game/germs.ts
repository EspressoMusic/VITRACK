import { GERM_ROAD } from '../data/areas'
import { GERM } from '../data/city'
import { GERMS, GERMS_BY_ID, type GermDef, MINI_GERM } from '../data/germs'
import { biteDamage, findGate, gateHp, zapDamage } from '../systems/DefenseSystem'
import type { GameState, Point } from '../types'
import { type Box, type InkWeight, boxAround } from './ink'
import { tileToWorld } from './iso'
import { OUTLINE, ellipse, fillStroke, shade, softFx } from './sprites'

/** Germs crawl out of the swamp, follow the road to the city gate and bite it until the gate zaps them.
 *  Every germ type (see data/germs.ts) has its own look and power.
 *  They live only while the map is on screen — nothing about them is saved except the gate's damage. */

type Ctx = CanvasRenderingContext2D

export type GermEvent =
  | { type: 'bite'; damage: number; at: Point }
  | { type: 'zap'; at: Point }
  | { type: 'pop'; at: Point; color: string; germId: string; mini: boolean }
  /** A tough germ took a tap but is still standing. */
  | { type: 'hit'; at: Point; color: string }
  /** A healer gave a germ some health back. */
  | { type: 'heal'; at: Point }
  /** Spit landed on the gate. */
  | { type: 'splat'; at: Point }

/** What's needed to paint a germ — a live one, or a still one for the germ library. */
interface GermLook {
  def: GermDef
  radius: number
  speed: number
  state: 'walk' | 'attack' | 'pop'
  /** Seconds in the current state (attack: since the last bite). */
  timer: number
  flash: number
  /** Healer's pulse, 1 right after it heals. */
  glow: number
  phase: number
}

export interface Germ extends GermLook {
  id: number
  mini: boolean
  hp: number
  maxHp: number
  tapsLeft: number
  attack: number
  /** Distance travelled along the road, world units. */
  dist: number
  /** Where it stops walking: at the gate, or (spitters) further down the road. */
  stopAt: number
  /** Where along the gate this germ ends up (tile offset), so a crowd spreads out. */
  lane: number
  /** Seconds alive (drives fading). */
  age: number
  /** Seconds since the last heal (healers). */
  skill: number
  x: number
  y: number
}

interface Spit {
  from: Point
  to: Point
  /** 0..1 along the flight. */
  t: number
  damage: number
}

export interface GermDrawable {
  depth: number
  at: Point
  box: Box
  alpha: number
  draw: (c: Ctx) => void
  /** Outline weight (germs: thin). */
  ink?: InkWeight
  /** A picture that doesn't change every frame (food guards): inked once and reused while `key` stays the same. */
  cache?: { id: string; key: string }
  /** Drawn this many world units higher (a hop or a drop-in), without redrawing a cached picture. */
  lift?: number
  /** Drawn as-is, without an ink outline (arrows). */
  noInk?: boolean
}

const LANES = [0, -0.6, 0.6, -1.05, 1.05]
/** Body radius of the basic germ; every germ is drawn at this size and scaled. */
const BASE_R = 8
const POP_TIME = 0.35
const SPIT_RANGE = 50
const SPIT_TIME = 0.6
const HEAL_EVERY = 2.4
const HEAL_RANGE = 52
const GOO = '#9be15d'
/** Outside things are always in front of the city (see renderer depth notes). */
export const OUTSIDE_DEPTH = 1000

const ROAD_WORLD = GERM_ROAD.map((p) => tileToWorld(p.x, p.y))
const SEGMENTS = ROAD_WORLD.slice(1).map((p, i) => Math.hypot(p.x - ROAD_WORLD[i].x, p.y - ROAD_WORLD[i].y))
const ROAD_LENGTH = SEGMENTS.reduce((a, b) => a + b, 0)
const GATE_FRONT = ROAD_WORLD[ROAD_WORLD.length - 1]

function roadPoint(dist: number): Point {
  let d = Math.max(0, Math.min(ROAD_LENGTH, dist))
  for (let i = 0; i < SEGMENTS.length; i++) {
    if (d <= SEGMENTS[i] || i === SEGMENTS.length - 1) {
      const k = SEGMENTS[i] ? Math.min(1, d / SEGMENTS[i]) : 0
      const a = GERM_ROAD[i]
      const b = GERM_ROAD[i + 1]
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
    }
    d -= SEGMENTS[i]
  }
  return GERM_ROAD[GERM_ROAD.length - 1]
}

/** Sleepy germs keep fading out and back in. */
function fadeAlpha(g: Germ): number {
  if (g.def.power !== 'fade' || g.state === 'pop') return 1
  const k = (g.age + g.phase) % 4.6
  if (k < 2.8) return 1
  if (k < 3.2) return 1 - ((k - 2.8) / 0.4) * 0.8
  if (k < 4.2) return 0.2
  return 0.2 + ((k - 4.2) / 0.4) * 0.8
}

const isHidden = (g: Germ) => fadeAlpha(g) < 0.6

export class GermSwarm {
  germs: Germ[] = []
  private spits: Spit[] = []
  private clock = 0
  private nextSpawn = 1.5
  private nextId = 1
  private last = 0

  constructor() {
    // One germ already on its way, so the outside never looks empty when the map opens.
    this.spawn(this.pickType(1), ROAD_LENGTH * 0.45)
  }

  /** A random germ type the player is ready for; only one king at a time. */
  private pickType(level: number): GermDef {
    const kingOut = this.germs.some((g) => g.def.power === 'boss' && g.state !== 'pop')
    const pool = GERMS.filter((d) => d.minLevel <= level && !(d.power === 'boss' && kingOut))
    let r = Math.random() * pool.reduce((sum, d) => sum + d.weight, 0)
    for (const d of pool) if ((r -= d.weight) <= 0) return d
    return pool[0]
  }

  private spawn(def: GermDef, dist = 0, mini?: { lane: number }) {
    const used = this.germs.filter((g) => g.state !== 'pop').map((g) => g.lane)
    const lane = mini?.lane ?? LANES.find((l) => !used.includes(l)) ?? 0
    const p = roadPoint(dist)
    const hp = mini ? MINI_GERM.hp : def.hp
    this.germs.push({
      id: this.nextId++,
      def,
      mini: !!mini,
      hp,
      maxHp: hp,
      tapsLeft: mini ? 1 : def.taps,
      attack: mini ? MINI_GERM.attack : def.attack,
      speed: def.speed * (mini ? MINI_GERM.speedFactor : 1),
      radius: def.radius * (mini ? MINI_GERM.sizeFactor : 1),
      dist,
      stopAt: def.power === 'spit' ? ROAD_LENGTH - SPIT_RANGE : ROAD_LENGTH,
      lane,
      state: 'walk',
      timer: 0,
      age: 0,
      skill: 0,
      flash: 0,
      glow: 0,
      phase: Math.random() * 10,
      x: p.x,
      y: p.y,
    })
  }

  update(state: GameState, now: number): GermEvent[] {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0
    this.last = now
    const gate = findGate(state)
    if (!gate) {
      this.germs = []
      this.spits = []
      return []
    }
    const events: GermEvent[] = []
    this.clock += dt
    const alive = this.germs.filter((g) => g.state !== 'pop').length
    if (this.clock >= this.nextSpawn) {
      if (alive < GERM.maxAlive) this.spawn(this.pickType(state.player.level))
      this.nextSpawn = this.clock + GERM.spawnMin + Math.random() * (GERM.spawnMax - GERM.spawnMin)
    }
    // A standing gate fights back; a broken one can't, and germs pile up until it's repaired.
    const standing = gateHp(gate, now) >= 1

    // Copy: popping a Flu Bug adds its two little ones to the list.
    for (const g of [...this.germs]) {
      g.timer += dt
      g.age += dt
      g.flash = Math.max(0, g.flash - dt * 4)
      g.glow = Math.max(0, g.glow - dt * 1.6)
      if (g.state === 'walk') {
        g.dist += g.speed * dt
        if (g.dist >= g.stopAt) {
          g.dist = g.stopAt
          g.state = 'attack'
          g.timer = g.def.attackEvery * 0.6
        }
      } else if (g.state === 'attack' && g.timer >= g.def.attackEvery) {
        g.timer = 0
        if (g.def.power === 'spit') {
          const from = this.bodyCenter(g)
          const to = { x: GATE_FRONT.x + (Math.random() - 0.5) * 22, y: GATE_FRONT.y - 14 - Math.random() * 10 }
          this.spits.push({ from: { x: from.x - 3, y: from.y + 1 }, to, t: 0, damage: biteDamage(gate, g.attack) })
        } else {
          const at = tileToWorld(g.x, g.y - 0.3)
          events.push({ type: 'bite', damage: biteDamage(gate, g.attack, g.def.power === 'pierce'), at: { x: at.x, y: at.y - g.radius * 2 } })
        }
        // Faded germs dodge the zap.
        if (standing && !isHidden(g)) {
          g.hp -= zapDamage(gate, g.def.armor)
          g.flash = 1
          events.push({ type: 'zap', at: this.bodyCenter(g) })
          if (g.hp <= 0) this.pop(g, events)
        }
      }
      if (g.def.power === 'heal' && g.state !== 'pop' && (g.skill += dt) >= HEAL_EVERY) {
        g.skill = 0
        this.heal(g, events)
      }
      // Spread out over the last stretch before the stop.
      const p = roadPoint(g.dist)
      const spread = Math.max(0, Math.min(1, (g.dist - g.stopAt * 0.6) / (g.stopAt * 0.4)))
      const lunge = g.state === 'attack' && g.def.power !== 'spit' ? Math.max(0, Math.sin((g.timer / 0.35) * Math.PI)) * (g.timer < 0.35 ? 0.16 : 0) : 0
      g.x = p.x + g.lane * spread
      g.y = p.y + Math.abs(g.lane) * 0.12 * spread - lunge
    }

    for (const s of this.spits) {
      s.t += dt / SPIT_TIME
      if (s.t >= 1) {
        events.push({ type: 'bite', damage: s.damage, at: { x: s.to.x, y: s.to.y - 8 } })
        events.push({ type: 'splat', at: s.to })
      }
    }
    this.spits = this.spits.filter((s) => s.t < 1)
    this.germs = this.germs.filter((g) => g.state !== 'pop' || g.timer < POP_TIME)
    return events
  }

  /** Healers give one health point back to every hurt germ near them. */
  private heal(healer: Germ, events: GermEvent[]) {
    const c = this.bodyCenter(healer)
    for (const g of this.germs) {
      if (g === healer || g.state === 'pop' || g.hp >= g.maxHp) continue
      const o = this.bodyCenter(g)
      if (Math.hypot(o.x - c.x, o.y - c.y) > HEAL_RANGE) continue
      g.hp += 1
      healer.glow = 1
      events.push({ type: 'heal', at: o })
    }
  }

  private pop(g: Germ, events: GermEvent[]) {
    g.state = 'pop'
    g.timer = 0
    events.push({ type: 'pop', at: this.bodyCenter(g), color: g.def.color, germId: g.def.id, mini: g.mini })
    if (g.def.power === 'split' && !g.mini) {
      for (const side of [-1, 1]) this.spawn(g.def, Math.max(0, g.dist - 4 - (side + 1) * 3), { lane: g.lane + side * 0.42 })
    }
  }

  private bodyCenter(g: Germ): Point {
    const p = tileToWorld(g.x, g.y)
    return { x: p.x, y: p.y - g.radius - 3 }
  }

  /** Germ under a world point (taps are generous — they're small and moving). Faded germs can't be caught. */
  germAt(wx: number, wy: number): Germ | null {
    let best: Germ | null = null
    let bestD = Infinity
    for (const g of this.germs) {
      if (g.state === 'pop' || isHidden(g)) continue
      const c = this.bodyCenter(g)
      const d = Math.hypot(wx - c.x, wy - c.y)
      if (d < g.radius + 9 && d < bestD) {
        best = g
        bestD = d
      }
    }
    return best
  }

  /** The germ furthest down the road (closest to the gate) within `range` tiles of tile point `from`, for an archer.
   *  Faded germs dodge, and so do ones `skip` rules out (e.g. already doomed by arrows in the air). */
  aimAt(from: Point, range: number, skip?: (g: Germ) => boolean): Germ | null {
    let best: Germ | null = null
    for (const g of this.germs) {
      if (g.state === 'pop' || isHidden(g) || skip?.(g)) continue
      if (Math.hypot(g.x - from.x, g.y - from.y) > range) continue
      if (!best || g.dist > best.dist) best = g
    }
    return best
  }

  /** Middle of a germ's body (world units), or null once it has popped. */
  aimPoint(g: Germ): Point | null {
    return g.state === 'pop' ? null : this.bodyCenter(g)
  }

  /** An arrow or a stone reached germ `g`: armor blocks part of it; a faded germ is missed. */
  arrowHit(g: Germ, power: number): GermEvent[] {
    const events: GermEvent[] = []
    if (g.state === 'pop' || isHidden(g)) return events
    g.hp -= Math.max(1, power - g.def.armor)
    g.flash = 1
    if (g.hp <= 0) this.pop(g, events)
    else events.push({ type: 'hit', at: this.bodyCenter(g), color: g.def.color })
    return events
  }

  /** A guard standing at tile point `from` zaps the closest germ within `range` tiles (faded ones dodge it).
   *  Returns where the zap landed, or null when no germ is close enough. */
  strike(from: Point, range: number, power: number): { at: Point; events: GermEvent[] } | null {
    let target: Germ | null = null
    let bestD = range
    for (const g of this.germs) {
      if (g.state === 'pop' || isHidden(g)) continue
      const d = Math.hypot(g.x - from.x, g.y - from.y)
      if (d <= bestD) {
        target = g
        bestD = d
      }
    }
    if (!target) return null
    const events: GermEvent[] = []
    target.hp -= Math.max(1, power - target.def.armor)
    target.flash = 1
    if (target.hp <= 0) this.pop(target, events)
    return { at: this.bodyCenter(target), events }
  }

  /** The player tapped a germ: most pop at once, tough ones get knocked back and need more taps. */
  squish(g: Germ): GermEvent[] {
    const events: GermEvent[] = []
    if (g.state === 'pop') return events
    g.tapsLeft -= 1
    if (g.tapsLeft <= 0) {
      this.pop(g, events)
      return events
    }
    g.flash = 1
    g.dist = Math.max(0, g.dist - 7)
    if (g.state === 'attack') g.state = 'walk'
    events.push({ type: 'hit', at: this.bodyCenter(g), color: g.def.color })
    return events
  }

  /** Each germ and flying spit as a drawable: `at` is its feet in world units, `draw` paints it into any context. */
  drawables(t: number): GermDrawable[] {
    const list: GermDrawable[] = this.germs.map((g) => {
      const at = tileToWorld(g.x, g.y)
      const pop = g.state === 'pop' ? 1 - g.timer / POP_TIME : 1
      return {
        depth: OUTSIDE_DEPTH + g.x + g.y - 1,
        at,
        box: boxAround(at.x, at.y, g.radius * 2.6 + 6, g.radius * 4.4 + 8, 10),
        alpha: fadeAlpha(g) * pop,
        draw: (c: Ctx) => drawGerm(c, at, g, t),
      }
    })
    for (const s of this.spits) {
      const p = { x: s.from.x + (s.to.x - s.from.x) * s.t, y: s.from.y + (s.to.y - s.from.y) * s.t - Math.sin(s.t * Math.PI) * 26 }
      list.push({ depth: OUTSIDE_DEPTH + 500, at: p, box: boxAround(p.x, p.y, 8, 8, 8), alpha: 1, draw: (c: Ctx) => drawSpit(c, p, t) })
    }
    return list
  }
}

function drawSpit(ctx: Ctx, p: Point, t: number) {
  const wob = Math.sin(t * 30) * 0.4
  ellipse(ctx, p.x, p.y, 3.4 + wob, 3.4 - wob)
  fillStroke(ctx, GOO, OUTLINE, 1.2)
  ellipse(ctx, p.x - 1, p.y - 1.2, 1, 0.7)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fill()
}

// ---------- germ art (drawn at BASE_R, around the body's center) ----------

let fxQueue: { layer: 'under' | 'over'; draw: (c: Ctx) => void }[] = []

/** Glows and speed lines from inside the germ art, in its local coordinates; drawGerm passes them on to softFx. */
function fx(layer: 'under' | 'over', draw: (c: Ctx) => void) {
  fxQueue.push({ layer, draw })
}

type Mood = 'grumpy' | 'wild' | 'tough' | 'sleepy' | 'dry' | 'lazy' | 'royal' | 'drool'

interface ShapeArt {
  /** Spikes and tails, behind the body. */
  back?: (c: Ctx, g: GermLook, t: number) => void
  /** The body's outline (path only). */
  body: (c: Ctx, g: GermLook, t: number) => void
  /** Spots, face and hats, on top of the body. */
  front: (c: Ctx, g: GermLook, t: number) => void
}

function spikes(c: Ctx, g: GermLook, t: number, n: number, len: number, knob: (i: number, x: number, y: number) => void) {
  c.lineCap = 'round'
  const dark = shade(g.def.color, 0.62)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.sin(t * 2 + g.phase) * 0.15
    const ix = Math.cos(a) * BASE_R * 0.75
    const iy = Math.sin(a) * BASE_R * 0.75
    const ox = Math.cos(a) * (BASE_R + len)
    const oy = Math.sin(a) * (BASE_R + len)
    c.strokeStyle = OUTLINE
    c.lineWidth = 2.6
    c.beginPath()
    c.moveTo(ix, iy)
    c.lineTo(ox, oy)
    c.stroke()
    c.strokeStyle = dark
    c.lineWidth = 1.2
    c.stroke()
    knob(i, ox, oy)
  }
}

function roundKnob(color: string) {
  return (c: Ctx, x: number, y: number, r = 2) => {
    ellipse(c, x, y, r, r)
    fillStroke(c, color, OUTLINE, 1)
  }
}

function highlight(c: Ctx, x = -2.8, y = -3.2, rx = 2.2, ry = 1.45) {
  ellipse(c, x, y, rx, ry, -0.5)
  c.fillStyle = 'rgba(255,255,255,0.55)'
  c.fill()
}

function dots(c: Ctx, color: string, list: [number, number, number][]) {
  c.fillStyle = color
  for (const [x, y, r] of list) {
    ellipse(c, x, y, r, r)
    c.fill()
  }
}

function line(c: Ctx, width: number, draw: () => void, color = OUTLINE) {
  c.strokeStyle = color
  c.lineWidth = width
  c.lineCap = 'round'
  c.beginPath()
  draw()
  c.stroke()
}

function eyes(c: Ctx, dx = 0, look = 0.5) {
  for (const ex of [-2.9, 2.9]) {
    ellipse(c, dx + ex, -1, 2.3, 2.8)
    fillStroke(c, '#ffffff', OUTLINE, 0.9)
    ellipse(c, dx + ex + look, -1.8, 1.1, 1.3)
    c.fillStyle = OUTLINE
    c.fill()
  }
}

function face(c: Ctx, mood: Mood, g: GermLook, t: number, dx = 0) {
  switch (mood) {
    case 'grumpy':
    case 'drool':
      eyes(c, dx)
      line(c, 1.3, () => {
        c.moveTo(dx - 5, -5.6)
        c.lineTo(dx - 1.3, -4.2)
        c.moveTo(dx + 5, -5.6)
        c.lineTo(dx + 1.3, -4.2)
      })
      if (mood === 'drool' && g.state === 'attack' && g.timer < 0.35) {
        // mouth wide open: it just spat
        ellipse(c, dx, 3.4, 1.9, 1.6)
        fillStroke(c, '#5a2340', OUTLINE, 1)
      } else {
        line(c, 1.3, () => {
          c.moveTo(dx - 2.2, 3.6)
          c.quadraticCurveTo(dx, 2.2, dx + 2.2, 3.6)
        })
      }
      if (mood === 'drool') {
        const drip = 1.2 + ((t * 0.8 + g.phase) % 1) * 1.6
        ellipse(c, dx + 1.6, 4 + drip, 0.9, drip * 0.7)
        fillStroke(c, GOO, OUTLINE, 0.7)
      }
      return
    case 'wild':
      for (const ex of [-3, 3]) {
        ellipse(c, dx + ex, -1.4, 2.7, 3)
        fillStroke(c, '#ffffff', OUTLINE, 0.9)
        ellipse(c, dx + ex + Math.sin(t * 9 + g.phase) * 0.7, -1.4, 0.8, 0.8)
        c.fillStyle = OUTLINE
        c.fill()
      }
      // big grin with teeth
      c.beginPath()
      c.moveTo(dx - 3.2, 2.4)
      c.quadraticCurveTo(dx, 6.6, dx + 3.2, 2.4)
      c.closePath()
      fillStroke(c, '#7a1f3d', OUTLINE, 1)
      c.fillStyle = '#ffffff'
      c.fillRect(dx - 1.6, 2.5, 1.3, 1.1)
      c.fillRect(dx + 0.3, 2.5, 1.3, 1.1)
      return
    case 'tough':
      for (const ex of [-2.9, 2.9]) {
        ellipse(c, dx + ex, -0.6, 2.2, 1.6)
        fillStroke(c, '#ffffff', OUTLINE, 0.9)
        ellipse(c, dx + ex + 0.4, -0.6, 1, 1)
        c.fillStyle = OUTLINE
        c.fill()
      }
      line(c, 2, () => {
        c.moveTo(dx - 5.4, -3.6)
        c.lineTo(dx, -2.2)
        c.lineTo(dx + 5.4, -3.6)
      })
      line(c, 1.3, () => {
        c.moveTo(dx - 2.6, 3.6)
        c.lineTo(dx + 2.6, 3.4)
      })
      c.fillStyle = '#ffffff'
      c.fillRect(dx + 0.6, 3.5, 1.2, 1.2)
      return
    case 'sleepy':
      line(c, 1.2, () => {
        for (const ex of [-2.9, 2.9]) {
          c.moveTo(dx + ex - 2, -1)
          c.quadraticCurveTo(dx + ex, 0.6, dx + ex + 2, -1)
        }
      })
      ellipse(c, dx, 3.4, 1.2 + Math.sin(t * 1.5 + g.phase) * 0.3, 1.5)
      fillStroke(c, '#4a3a6e', OUTLINE, 0.9)
      return
    case 'dry':
      line(c, 1.2, () => {
        for (const ex of [-2.9, 2.9]) {
          c.moveTo(dx + ex - 2, -0.2)
          c.lineTo(dx + ex, -1.8)
          c.lineTo(dx + ex + 2, -0.2)
        }
      })
      ellipse(c, dx, 2.8, 2.2, 1.3)
      fillStroke(c, '#6b2a1a', OUTLINE, 0.9)
      // tongue hanging out
      c.beginPath()
      c.moveTo(dx - 1.3, 3)
      c.lineTo(dx - 1.3, 5 + Math.sin(t * 6 + g.phase) * 0.4)
      c.quadraticCurveTo(dx, 6.6, dx + 1.3, 5 + Math.sin(t * 6 + g.phase) * 0.4)
      c.lineTo(dx + 1.3, 3)
      fillStroke(c, '#ff7f9e', OUTLINE, 0.9)
      return
    case 'lazy':
      for (const ex of [-2.9, 2.9]) {
        ellipse(c, dx + ex, -0.6, 2.2, 2.4)
        fillStroke(c, '#ffffff', OUTLINE, 0.9)
        ellipse(c, dx + ex + 0.3, 0.2, 1, 1)
        c.fillStyle = OUTLINE
        c.fill()
        // heavy eyelid
        c.beginPath()
        c.ellipse(dx + ex, -0.6, 2.2, 2.4, 0, Math.PI, Math.PI * 2)
        c.closePath()
        fillStroke(c, shade(g.def.color, 0.85), OUTLINE, 0.9)
      }
      line(c, 1.2, () => {
        c.moveTo(dx - 2.4, 3.4)
        c.quadraticCurveTo(dx + 0.4, 4.8, dx + 2.6, 2.8)
      })
      return
    case 'royal':
      for (const ex of [-2.9, 2.9]) {
        ellipse(c, dx + ex, -0.8, 2.3, 2.6)
        fillStroke(c, '#fff3c4', OUTLINE, 0.9)
        ellipse(c, dx + ex + 0.4, -1.4, 1.1, 1.3)
        c.fillStyle = '#b3001b'
        c.fill()
      }
      line(c, 1.8, () => {
        c.moveTo(dx - 5.4, -5.4)
        c.lineTo(dx - 1, -3.4)
        c.moveTo(dx + 5.4, -5.4)
        c.lineTo(dx + 1, -3.4)
      })
      c.beginPath()
      c.moveTo(dx - 3.4, 2.6)
      c.quadraticCurveTo(dx, 5.6, dx + 3.4, 2.6)
      c.closePath()
      fillStroke(c, '#4a0d14', OUTLINE, 1)
      c.fillStyle = '#ffffff'
      for (const fx of [-1.9, 1.9]) {
        c.beginPath()
        c.moveTo(dx + fx - 0.8, 2.8)
        c.lineTo(dx + fx, 4.6)
        c.lineTo(dx + fx + 0.8, 2.8)
        c.fill()
      }
  }
}

const circleBody = (c: Ctx) => ellipse(c, 0, 0, BASE_R, BASE_R)

function roundedRect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
}

const SPRINKLES: [number, number, number, string][] = [
  [-4.2, -4.6, 0.6, '#ffffff'],
  [3.8, -5.2, -0.5, '#7fd6e8'],
  [5.2, 1.6, 0.9, '#ffe066'],
  [-5.4, 2.6, -0.8, '#8fd14f'],
  [0.4, -6, 0.2, '#b98cff'],
  [-1.6, 5.8, 0.4, '#ffffff'],
]

const ART: Record<GermDef['shape'], ShapeArt> = {
  round: {
    back: (c, g, t) => spikes(c, g, t, 8, 3.2, (_, x, y) => roundKnob(g.def.color)(c, x, y)),
    body: circleBody,
    front: (c, g, t) => {
      highlight(c)
      dots(c, shade(g.def.color, 0.62), [
        [3.2, 2.8, 1.4],
        [-3.6, 2, 1],
      ])
      face(c, 'grumpy', g, t)
      // runny nose
      ellipse(c, -3.8, 3.3 + Math.sin(t * 3 + g.phase) * 0.4, 0.9, 1.4)
      fillStroke(c, '#a6dcff', OUTLINE, 0.7)
    },
  },
  cube: {
    back: (c, g, t) => {
      // speed lines trailing behind
      fx('under', (s) => {
        for (const [y, len] of [
          [-3, 6],
          [1, 8],
          [5, 5],
        ]) {
          const k = (t * 4 + g.phase + y) % 1
          line(s, 1.4, () => {
            s.moveTo(9 + k * 3, y + 3)
            s.lineTo(9 + len + k * 3, y + 6)
          }, 'rgba(255,255,255,0.85)')
        }
      })
      spikes(c, g, t, 4, 2.6, (_, x, y) => roundKnob('#ffffff')(c, x * 1.04, y * 1.04, 1.7))
    },
    body: (c) => roundedRect(c, -7.6, -7.6, 15.2, 15.2, 3.6),
    front: (c, g, t) => {
      for (const [x, y, a, color] of SPRINKLES) {
        line(c, 1.1, () => {
          c.moveTo(x - Math.cos(a) * 1.2, y - Math.sin(a) * 1.2)
          c.lineTo(x + Math.cos(a) * 1.2, y + Math.sin(a) * 1.2)
        }, color)
      }
      highlight(c, -4, -4.4, 2, 1.2)
      face(c, 'wild', g, t)
    },
  },
  blob: {
    body: (c, g, t) => {
      c.beginPath()
      for (let i = 0; i <= 28; i++) {
        const a = (i / 28) * Math.PI * 2
        const rr = BASE_R + Math.sin(a * 5 + t * 3 + g.phase) * 0.5
        const x = Math.cos(a) * rr * 1.12
        // drips hang off the bottom
        const drip = Math.max(0, Math.sin(a)) * (Math.max(0, Math.cos(a * 3 + 0.4)) ** 6) * 3.2
        const y = Math.sin(a) * rr * 0.94 + drip
        if (i) c.lineTo(x, y)
        else c.moveTo(x, y)
      }
      c.closePath()
    },
    front: (c, g, t) => {
      // armor helmet across the top
      c.beginPath()
      c.ellipse(0, -1.6, 8.4, 6.6, 0, Math.PI * 1.08, Math.PI * 1.92)
      c.ellipse(0, -1.6, 6.2, 4.4, 0, Math.PI * 1.92, Math.PI * 1.08, true)
      c.closePath()
      fillStroke(c, '#a7b3c2', OUTLINE, 1)
      dots(c, '#e9eef5', [
        [-4.4, -6, 0.6],
        [0, -7.4, 0.6],
        [4.4, -6, 0.6],
      ])
      highlight(c, -4.6, 1.6, 1.6, 1)
      dots(c, shade(g.def.color, 0.75), [
        [4.6, 3.4, 1.2],
        [-5.4, 4.2, 0.8],
      ])
      face(c, 'tough', g, t)
    },
  },
  flu: {
    back: (c, g, t) =>
      spikes(c, g, t, 10, 3.6, (i, x, y) => {
        if (i % 2) {
          roundKnob('#ff6b6b')(c, x, y, 1.8)
        } else {
          const a = Math.atan2(y, x) + Math.PI / 2
          line(c, 2.6, () => {
            c.moveTo(x - Math.cos(a) * 1.8, y - Math.sin(a) * 1.8)
            c.lineTo(x + Math.cos(a) * 1.8, y + Math.sin(a) * 1.8)
          })
          line(c, 1.2, () => {
            c.moveTo(x - Math.cos(a) * 1.5, y - Math.sin(a) * 1.5)
            c.lineTo(x + Math.cos(a) * 1.5, y + Math.sin(a) * 1.5)
          }, '#ffd166')
        }
      }),
    body: circleBody,
    front: (c, g, t) => {
      highlight(c)
      dots(c, 'rgba(255,110,130,0.55)', [
        [-5, 2, 1.5],
        [5, 2, 1.5],
      ])
      face(c, 'grumpy', g, t)
      // thermometer in the mouth
      line(c, 2.2, () => {
        c.moveTo(1, 3.4)
        c.lineTo(6.8, 5.4)
      })
      line(c, 1, () => {
        c.moveTo(1, 3.4)
        c.lineTo(6.8, 5.4)
      }, '#ffffff')
      ellipse(c, 7.2, 5.5, 1.2, 1.2)
      fillStroke(c, '#ff4d4d', OUTLINE, 0.8)
    },
  },
  rod: {
    back: (c, g, t) => {
      for (const [y0, k] of [
        [-2.5, 0],
        [1, 1.3],
        [4, 2.6],
      ]) {
        const wig = (x: number) => Math.sin(x * 0.9 - t * 9 - k - g.phase) * 1.4
        for (const [w, color] of [
          [2.2, OUTLINE],
          [0.9, shade(g.def.color, 0.7)],
        ] as const) {
          line(c, w, () => {
            c.moveTo(8, y0)
            for (let x = 9; x <= 16; x++) c.lineTo(x, y0 + wig(x) + (x - 8) * 0.25)
          }, color)
        }
      }
    },
    body: (c) => roundedRect(c, -10, -6.6, 20, 13.2, 6.6),
    front: (c, g, t) => {
      highlight(c, -5, -3.2, 2.8, 1.3)
      dots(c, shade(g.def.color, 0.7), [
        [4.8, -2.4, 1.2],
        [6.4, 2.2, 0.9],
        [3, 3.6, 0.7],
      ])
      face(c, 'drool', g, t, -2.6)
    },
  },
  ghost: {
    body: (c, g, t) => {
      c.beginPath()
      c.moveTo(-BASE_R, 0)
      c.arc(0, 0, BASE_R, Math.PI, 0)
      c.lineTo(BASE_R, 6)
      for (let i = 0; i < 4; i++) {
        const x0 = BASE_R - i * 4
        const bob = Math.sin(t * 5 + i + g.phase) * 0.8
        c.quadraticCurveTo(x0 - 1, 9.5 + bob, x0 - 2, 7 + bob * 0.4)
        c.quadraticCurveTo(x0 - 3, 4.8, x0 - 4, 6.4)
      }
      c.closePath()
    },
    front: (c, g, t) => {
      highlight(c, -3, -3.6)
      dots(c, 'rgba(255,140,190,0.5)', [
        [-5, 1.8, 1.3],
        [5, 1.8, 1.3],
      ])
      face(c, 'sleepy', g, t)
      // nightcap flopping to the side
      c.beginPath()
      c.moveTo(-6.6, -4.6)
      c.quadraticCurveTo(-1, -10.6, 5.4, -6.6)
      c.quadraticCurveTo(9.6, -8.6, 10.6, -3.4)
      c.quadraticCurveTo(7.8, -5.4, 6, -4.8)
      c.quadraticCurveTo(0, -6.4, -6.6, -4.6)
      fillStroke(c, '#5b6fd6', OUTLINE, 1)
      ellipse(c, 10.6, -3, 1.8, 1.8)
      fillStroke(c, '#ffffff', OUTLINE, 0.9)
      fx('over', (s) => {
        s.fillStyle = 'rgba(255,255,255,0.9)'
        s.strokeStyle = OUTLINE
        s.lineWidth = 0.8
        s.font = 'bold 5px sans-serif'
        for (let i = 0; i < 2; i++) {
          const k = (t * 0.45 + i / 2 + g.phase) % 1
          s.globalAlpha = Math.sin(k * Math.PI)
          s.strokeText('z', 9 + k * 4, -9 - k * 9)
          s.fillText('z', 9 + k * 4, -9 - k * 9)
        }
        s.globalAlpha = 1
      })
    },
  },
  dry: {
    back: (c, g, t) =>
      spikes(c, g, t, 7, 2.4, (_, x, y) => {
        const a = Math.atan2(y, x)
        c.beginPath()
        c.moveTo(x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2)
        c.lineTo(x + Math.cos(a + 2.2) * 1.6, y + Math.sin(a + 2.2) * 1.6)
        c.lineTo(x + Math.cos(a - 2.2) * 1.6, y + Math.sin(a - 2.2) * 1.6)
        c.closePath()
        fillStroke(c, shade(g.def.color, 0.8), OUTLINE, 0.9)
      }),
    body: circleBody,
    front: (c, g, t) => {
      // cracks
      line(c, 0.8, () => {
        c.moveTo(-7.8, -2)
        c.lineTo(-5.6, -3.2)
        c.lineTo(-5, -5.4)
        c.moveTo(7.6, 1)
        c.lineTo(5.6, 2.6)
        c.lineTo(5.8, 4.6)
        c.moveTo(1.2, -7.9)
        c.lineTo(0.6, -6.2)
        c.lineTo(2, -5.2)
      }, shade(g.def.color, 0.5))
      highlight(c, -2.6, -4, 1.8, 1.1)
      face(c, 'dry', g, t)
      // sweat drop
      ellipse(c, 6.2, -4.6, 1.1, 1.6)
      fillStroke(c, '#a6dcff', OUTLINE, 0.7)
    },
  },
  couch: {
    back: (c, g) => {
      fx('under', (s) => {
        if (g.glow <= 0) return
        const k = 1 - g.glow
        ellipse(s, 0, 2, 9 + k * 16, 7 + k * 12)
        s.strokeStyle = `rgba(120,230,120,${g.glow * 0.9})`
        s.lineWidth = 2
        s.stroke()
      })
      // its cushion
      roundedRect(c, -10.4, 3.6, 20.8, 6, 3)
      fillStroke(c, '#d94f6a', OUTLINE, 1.2)
      dots(c, '#ffd0da', [
        [-6, 6.6, 0.6],
        [0, 6.6, 0.6],
        [6, 6.6, 0.6],
      ])
    },
    body: (c) => ellipse(c, 0, 0, 9.4, 7.4),
    front: (c, g, t) => {
      highlight(c, -3.6, -3.4)
      ellipse(c, 0, 3.4, 4.6, 2.6)
      c.fillStyle = shade(g.def.color, 1.25)
      c.fill()
      dots(c, '#c98a3a', [
        [-6.2, 3, 0.6],
        [6.4, 1.6, 0.5],
      ])
      face(c, 'lazy', g, t)
      if (g.glow > 0) {
        fx('over', (s) => {
          s.globalAlpha = g.glow
          line(s, 1.6, () => {
            s.moveTo(9, -8 - (1 - g.glow) * 5)
            s.lineTo(13, -8 - (1 - g.glow) * 5)
            s.moveTo(11, -10 - (1 - g.glow) * 5)
            s.lineTo(11, -6 - (1 - g.glow) * 5)
          }, '#3fbf5a')
          s.globalAlpha = 1
        })
      }
    },
  },
  king: {
    back: (c, g, t) => spikes(c, g, t, 10, 3.4, (_, x, y) => roundKnob('#7a1f3d')(c, x, y, 1.9)),
    body: circleBody,
    front: (c, g, t) => {
      highlight(c)
      dots(c, shade(g.def.color, 0.65), [
        [4.4, 3.4, 1.2],
        [-4.8, 3.2, 0.9],
        [5.4, -2.6, 0.7],
      ])
      face(c, 'royal', g, t)
      // crown
      c.beginPath()
      c.moveTo(-5.4, -6)
      c.lineTo(-6, -11.6)
      c.lineTo(-3, -8.8)
      c.lineTo(0, -12.6)
      c.lineTo(3, -8.8)
      c.lineTo(6, -11.6)
      c.lineTo(5.4, -6)
      c.quadraticCurveTo(0, -7.2, -5.4, -6)
      fillStroke(c, '#ffcf4a', OUTLINE, 1)
      dots(c, '#e8423f', [[0, -8, 0.9]])
      dots(c, '#5bc0eb', [
        [-3.6, -7.2, 0.6],
        [3.6, -7.2, 0.6],
      ])
    },
  },
}

/** Paints a germ standing with its feet at `p`. */
function drawGerm(ctx: Ctx, p: Point, g: GermLook, t: number) {
  const popping = g.state === 'pop'
  const k = popping ? g.timer / POP_TIME : 0
  const r = g.radius * (1 + k * 0.6)
  const s = r / BASE_R
  const pace = Math.min(2, g.speed / 17)
  const hop = popping
    ? 0
    : g.state === 'walk'
      ? Math.abs(Math.sin(t * 7 * pace + g.phase)) * 3.5 * s * (g.def.shape === 'couch' ? 0.3 : 1)
      : Math.abs(Math.sin(t * 3 + g.phase)) * 1.5 * s
  const squash = 1 + (g.state === 'walk' ? Math.sin(t * 14 * pace + g.phase * 2) * 0.06 : 0)
  softFx(ctx, 'under', (c) => {
    ellipse(c, p.x, p.y, r * 0.95, r * 0.36)
    c.fillStyle = 'rgba(40,30,20,0.22)'
    c.fill()
  })
  const art = ART[g.def.shape]
  const cy = p.y - r - 2 - hop
  const sx = s / squash
  const sy = s * squash
  fxQueue = []
  ctx.save()
  ctx.translate(p.x, cy)
  ctx.scale(sx, sy)
  art.back?.(ctx, g, t)
  art.body(ctx, g, t)
  fillStroke(ctx, g.def.color, OUTLINE, 1.6)
  art.front(ctx, g, t)
  if (g.flash > 0) {
    art.body(ctx, g, t)
    ctx.fillStyle = `rgba(255,255,255,${g.flash * 0.75})`
    ctx.fill()
  }
  ctx.restore()
  for (const f of fxQueue) {
    softFx(ctx, f.layer, (c) => {
      c.save()
      c.translate(p.x, cy)
      c.scale(sx, sy)
      f.draw(c)
      c.restore()
    })
  }
  fxQueue = []
}

/** The world box a still germ of this type needs, with its feet at (0, 0). */
export function germPortraitBox(def: GermDef): Box {
  return boxAround(0, 0, def.radius * 2.1, def.radius * 3.4, 2)
}

/** A germ standing still with its feet at (0, 0), for the germ library. */
export function paintGermPortrait(ctx: Ctx, germId: string, t: number) {
  const def = GERMS_BY_ID[germId]
  if (!def) return
  drawGerm(ctx, { x: 0, y: 0 }, { def, radius: def.radius, speed: def.speed, state: 'attack', timer: 1, flash: 0, glow: 0, phase: 0 }, t)
}

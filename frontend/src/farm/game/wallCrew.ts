import { OUTSIDE } from '../data/areas'
import { WALL_CREW } from '../data/city'
import { FOOD_GUARDS_BY_ID, type FoodGuardDef } from '../data/foodGuards'
import { objectLevel } from '../systems/BuildingSystem'
import { findGate } from '../systems/DefenseSystem'
import type { GameState, Point } from '../types'
import { WALL_H } from './citySprites'
import { type GuardPose, drawFoodGuard, drawStone, guardBox } from './foodGuards'
import { type Germ, type GermDrawable, type GermEvent, type GermSwarm, OUTSIDE_DEPTH } from './germs'
import { boxAround } from './ink'
import { tileToWorld } from './iso'
import { up } from './sprites'

/** Food characters standing on top of the front wall beside the gate, throwing stones at germs on the road
 *  (see WALL_CREW in data/city.ts). Same food art as the archers outside, drawn once per pose and cached;
 *  only the stones are drawn every frame. */

type Ctx = CanvasRenderingContext2D

interface Thrower {
  def: FoodGuardDef
  /** Where it stands, tile coordinates (on the wall's top). */
  spot: Point
  /** Feet, world units (raised to the top of the wall). */
  feet: Point
  /** 1 = faces right on screen, -1 = left (toward the germs' road). */
  face: 1 | -1
  cooldown: number
  /** Seconds left holding the stone up; below 0 = not winding up. */
  windUp: number
  /** Seconds left in the follow-through after a throw. */
  follow: number
  target: Germ | null
  phase: number
}

interface Stone {
  from: Point
  to: Point
  target: Germ
  t: number
  dur: number
  arc: number
  spin: number
}

/** The wall's top line, just inside its front face (tile y). */
const TOP_Y = OUTSIDE.y - 0.07
/** The germs' road meets the gate here (tile x): throwers left of it face right, the others face left. */
const ROAD_X = 18.5
const FOLLOW_TIME = 0.25

export class WallCrew {
  private throwers: Thrower[] = []
  private stones: Stone[] = []
  private last = 0

  /** One thrower per gate level + 1 (none without a gate); ones already up there keep their timing. */
  private muster(state: GameState) {
    const gate = findGate(state)
    const n = gate ? Math.min(WALL_CREW.spots.length, objectLevel(gate) + 1) : 0
    if (n === this.throwers.length) return
    this.throwers = WALL_CREW.spots.slice(0, n).map((s, i) => {
      const prev = this.throwers[i]
      if (prev) return prev
      const spot = { x: s.x, y: TOP_Y }
      return {
        def: FOOD_GUARDS_BY_ID[s.guard],
        spot,
        feet: up(tileToWorld(spot.x, spot.y), WALL_H),
        face: s.x < ROAD_X ? 1 : -1,
        cooldown: 0.8 + i * 0.9,
        windUp: -1,
        follow: 0,
        target: null,
        phase: i * 2.3,
      }
    })
  }

  /** Throws and lands stones: the germ events of each hit, and where each stone landed (for a puff of dust). */
  update(state: GameState, germs: GermSwarm, now: number): { events: GermEvent[]; puffs: Point[] } {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0
    this.last = now
    this.muster(state)
    const events: GermEvent[] = []
    const puffs: Point[] = []
    // Damage already flying at each germ, so the crew doesn't pile stones on one that's about to pop.
    const incoming = new Map<Germ, number>()
    const hurt = (g: Germ) => Math.max(1, WALL_CREW.power - g.def.armor)
    for (const s of this.stones) incoming.set(s.target, (incoming.get(s.target) ?? 0) + hurt(s.target))
    const doomed = (g: Germ) => (incoming.get(g) ?? 0) >= g.hp

    for (const th of this.throwers) {
      th.cooldown -= dt
      th.follow = Math.max(0, th.follow - dt)
      if (th.windUp >= 0) {
        th.windUp -= dt
        if (th.windUp >= 0) continue
        const target = th.target && germs.aimPoint(th.target) ? th.target : germs.aimAt(th.spot, WALL_CREW.range, doomed)
        th.target = null
        if (target) {
          this.throw(th, target, germs)
          incoming.set(target, (incoming.get(target) ?? 0) + hurt(target))
          th.cooldown = WALL_CREW.reload
          th.follow = FOLLOW_TIME
        } else {
          th.cooldown = 0.4
        }
      } else if (th.cooldown <= 0) {
        th.target = germs.aimAt(th.spot, WALL_CREW.range, doomed)
        if (th.target) th.windUp = WALL_CREW.windUp
        else th.cooldown = 0.3
      }
    }

    for (const s of this.stones) {
      s.t += dt / s.dur
      const p = germs.aimPoint(s.target)
      if (p) s.to = p
      if (s.t < 1) continue
      events.push(...germs.arrowHit(s.target, WALL_CREW.power))
      puffs.push(s.to)
    }
    this.stones = this.stones.filter((s) => s.t < 1)
    return { events, puffs }
  }

  private throw(th: Thrower, target: Germ, germs: GermSwarm) {
    const to = germs.aimPoint(target)
    if (!to) return
    const from = { x: th.feet.x + th.face * 4, y: th.feet.y - 30 }
    const dist = Math.hypot(to.x - from.x, to.y - from.y)
    this.stones.push({ from, to, target, t: 0, dur: 0.35 + dist / 420, arc: 18 + dist * 0.22, spin: th.face * (8 + Math.random() * 4) })
  }

  /** Throwers (cached per pose) and stones in the air, for the renderer. */
  drawables(now: number): GermDrawable[] {
    const list: GermDrawable[] = []
    const t = now / 1000
    for (const th of this.throwers) {
      const pose: GuardPose = th.windUp >= 0 ? 'aim' : th.follow > 0 ? 'throw' : 'idle'
      const { def, feet, face } = th
      list.push({
        // Just in front of the wall piece it stands on.
        depth: th.spot.x + OUTSIDE.y - 1 + 0.02,
        at: feet,
        box: guardBox(feet),
        alpha: 1,
        lift: pose === 'idle' ? Math.max(0, Math.sin(t * 2.4 + th.phase)) * 0.8 : 0,
        cache: { id: `wallCrew:${def.id}:${pose}`, key: `${th.spot.x}` },
        draw: (c: Ctx) => drawFoodGuard(c, feet, def, pose, face, 'stones'),
      })
    }
    for (const s of this.stones) {
      const k = Math.min(1, s.t)
      const p = { x: s.from.x + (s.to.x - s.from.x) * k, y: s.from.y + (s.to.y - s.from.y) * k - Math.sin(k * Math.PI) * s.arc }
      const angle = s.spin * s.t * s.dur
      list.push({
        depth: OUTSIDE_DEPTH + 640,
        at: p,
        box: boxAround(p.x, p.y, 6, 6, 6),
        alpha: 1,
        noInk: true,
        draw: (c: Ctx) => {
          c.save()
          c.translate(p.x, p.y)
          c.rotate(angle)
          drawStone(c, 0, 0, 2.6)
          c.restore()
        },
      })
    }
    return list
  }
}

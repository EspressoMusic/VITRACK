import { OUTSIDE } from '../data/areas'
import { WALL_CREW } from '../data/city'
import { FOOD_GUARDS_BY_ID, type FoodGuardDef } from '../data/foodGuards'
import { objectLevel } from '../systems/BuildingSystem'
import { findGate } from '../systems/DefenseSystem'
import type { GameState, Point } from '../types'
import { WALL_H, drawHeart } from './citySprites'
import { type GuardPose, drawFoodGuard, drawStone, guardBox } from './foodGuards'
import { type Germ, type GermDrawable, type GermEvent, type GermSwarm, OUTSIDE_DEPTH, type WallTarget } from './germs'
import { boxAround } from './ink'
import { tileToWorld } from './iso'
import { OUTLINE, fillStroke, up } from './sprites'

/** Food characters standing on top of the front wall beside the gate, throwing stones at germs on the road
 *  (see WALL_CREW in data/city.ts). Junk food throws back at them: hit too often, one is knocked down dizzy
 *  for a while and stops throwing. Same food art as the archers outside, drawn once per pose and cached;
 *  only the stones, hearts and dizzy stars are drawn every frame. */

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
  hp: number
  /** Seconds left with the hurt face after a hit. */
  hurt: number
  /** Seconds left knocked down; 0 = standing. */
  down: number
  /** Seconds since the last hit (a hurt thrower slowly heals). */
  calm: number
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
const HURT_TIME = 0.4
/** Middle of a thrower's body above its feet, and where its hearts and dizzy stars float. */
const BODY_RISE = 15
const HEARTS_RISE = 38

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
        hp: WALL_CREW.hp,
        hurt: 0,
        down: 0,
        calm: 0,
      }
    })
  }

  /** The throwers as things junk food can throw at. */
  targets(): WallTarget[] {
    return this.throwers.map((th) => ({
      spot: th.spot,
      body: { x: th.feet.x, y: th.feet.y - BODY_RISE },
      up: th.down <= 0,
      hit: (damage) => this.hit(th, damage),
    }))
  }

  private hit(th: Thrower, damage: number) {
    if (th.down > 0) return
    th.hp -= damage
    th.calm = 0
    th.hurt = HURT_TIME
    if (th.hp > 0) return
    th.hp = 0
    th.down = WALL_CREW.downTime
    th.windUp = -1
    th.follow = 0
    th.target = null
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
      th.hurt = Math.max(0, th.hurt - dt)
      if (th.down > 0) {
        // back on its feet, all better
        if ((th.down -= dt) <= 0) {
          th.down = 0
          th.hp = WALL_CREW.hp
          th.cooldown = 0.6
        }
        continue
      }
      if (th.hp < WALL_CREW.hp && (th.calm += dt) >= WALL_CREW.healEvery) {
        th.hp += 1
        th.calm = 0
      }
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

  /** Throwers (cached per pose), their hearts or dizzy stars, and stones in the air, for the renderer. */
  drawables(now: number): GermDrawable[] {
    const list: GermDrawable[] = []
    const t = now / 1000
    for (const th of this.throwers) {
      const pose: GuardPose = th.down > 0 ? 'dizzy' : th.hurt > 0 ? 'hurt' : th.windUp >= 0 ? 'aim' : th.follow > 0 ? 'throw' : 'idle'
      const { def, feet, face } = th
      // Just in front of the wall piece it stands on.
      const depth = th.spot.x + OUTSIDE.y - 1 + 0.02
      list.push({
        depth,
        at: feet,
        box: guardBox(feet),
        alpha: 1,
        lift: pose === 'idle' ? Math.max(0, Math.sin(t * 2.4 + th.phase)) * 0.8 : 0,
        cache: { id: `wallCrew:${def.id}:${pose}`, key: `${th.spot.x}` },
        draw: (c: Ctx) => drawFoodGuard(c, feet, def, pose, face, 'stones'),
      })
      if (th.down > 0 || th.hp < WALL_CREW.hp) {
        const hp = th.hp
        list.push({
          depth: depth + 0.001,
          at: feet,
          box: boxAround(feet.x, feet.y, 16, HEARTS_RISE + 6, 0),
          alpha: 1,
          noInk: true,
          // the dizzy one leans back (see drawFoodGuard), so its stars circle over where its head ended up
          draw: (c: Ctx) => (th.down > 0 ? drawDizzyStars(c, { x: feet.x - face * 9, y: feet.y - 30 }, t) : drawHearts(c, feet, hp)),
        })
      }
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

/** A row of hearts over a hurt thrower's head: full ones for the health it has left. */
function drawHearts(c: Ctx, feet: Point, hp: number) {
  for (let i = 0; i < WALL_CREW.hp; i++) {
    const x = feet.x + (i - (WALL_CREW.hp - 1) / 2) * 6.4
    drawHeart(c, x, feet.y - HEARTS_RISE, 2.6, i < hp ? '#ff5a6e' : '#d8cfc2')
  }
}

/** Little stars circling over a knocked-down thrower's head. */
function drawDizzyStars(c: Ctx, head: Point, t: number) {
  for (let i = 0; i < 3; i++) {
    const a = t * 4 + (i * Math.PI * 2) / 3
    const x = head.x + Math.cos(a) * 8
    const y = head.y + Math.sin(a) * 2.6
    c.beginPath()
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 1.1 : 2.6
      const b = -Math.PI / 2 + (k * Math.PI) / 5
      c.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r)
    }
    c.closePath()
    fillStroke(c, '#ffd84a', OUTLINE, 0.8)
  }
}

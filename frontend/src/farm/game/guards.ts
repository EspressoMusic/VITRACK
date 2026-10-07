import { GUARD, GUARD_SPOTS } from '../data/guards'
import { activeGuards } from '../systems/GuardSystem'
import type { GameState, Point } from '../types'
import { type GermDrawable, type GermEvent, type GermSwarm, OUTSIDE_DEPTH } from './germs'
import { type InkWeight, boxAround } from './ink'
import { tileToWorld } from './iso'
import { OUTLINE, ellipse, fillStroke, softFx } from './sprites'

/** Guards other players sent: they stand outside the gate and zap germs that come close.
 *  Like germs, they only act while the map is on screen; what's saved is just who sent them and until when. */

type Ctx = CanvasRenderingContext2D

/** A bold sticker outline, like the character's. */
const GUARD_INK: InkWeight = { width: 1.5, inset: 0.6 }
const PLUMES = ['#e8604c', '#8f6ae0', '#4fb3a9']
const SKIN = '#f7cfae'
const UNIFORM = '#4f8de8'
const ORB = '#7fe7dc'
/** The wand's orb, relative to the feet. */
const WAND_TIP = { x: 8.6, y: -30 }

export interface GuardZap {
  /** World points: the wand's orb and the germ it hit. */
  from: Point
  to: Point
  events: GermEvent[]
}

interface Post {
  wait: number
  /** 1 right after a zap (wand raised), easing back to 0. */
  swing: number
}

export class GuardSquad {
  private posts = new Map<string, Post>()
  private last = 0

  /** Every guard whose wand is charged zaps the closest germ in reach. */
  update(state: GameState, now: number, germs: GermSwarm): GuardZap[] {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0
    this.last = now
    const zaps: GuardZap[] = []
    activeGuards(state, now)
      .slice(0, GUARD_SPOTS.length)
      .forEach((g, i) => {
        let post = this.posts.get(g.id)
        if (!post) this.posts.set(g.id, (post = { wait: 0.6 + i * 0.5, swing: 0 }))
        post.swing = Math.max(0, post.swing - dt * 3)
        if ((post.wait -= dt) > 0) return
        const spot = GUARD_SPOTS[i]
        const hit = germs.strike(spot, GUARD.range, GUARD.power)
        if (!hit) {
          post.wait = 0.25
          return
        }
        post.wait = GUARD.every
        post.swing = 1
        const feet = tileToWorld(spot.x, spot.y)
        zaps.push({ from: { x: feet.x + WAND_TIP.x, y: feet.y + WAND_TIP.y }, to: hit.at, events: hit.events })
      })
    return zaps
  }

  drawables(state: GameState, now: number, t: number): GermDrawable[] {
    return activeGuards(state, now)
      .slice(0, GUARD_SPOTS.length)
      .map((g, i) => {
        const spot = GUARD_SPOTS[i]
        const at = tileToWorld(spot.x, spot.y)
        const swing = this.posts.get(g.id)?.swing ?? 0
        return {
          depth: OUTSIDE_DEPTH + spot.x + spot.y - 1,
          at,
          box: boxAround(at.x, at.y, 16, 40, 6),
          alpha: 1,
          ink: GUARD_INK,
          draw: (c: Ctx) => drawGuard(c, at, t, i, swing),
        }
      })
  }
}

/** A little health guard: gold helmet with a plume, a shield with a green cross, and a zapping wand. */
export function drawGuard(c: Ctx, p: Point, t: number, index: number, swing: number) {
  const bob = Math.sin(t * 3 + index * 1.7) * 0.6
  const hy = p.y - 21.5 + bob
  const raise = swing * 3

  softFx(c, 'under', (s) => {
    ellipse(s, p.x, p.y, 9, 3.4)
    s.fillStyle = 'rgba(40,30,20,0.22)'
    s.fill()
  })

  // Boots.
  for (const dx of [-3.2, 3.2]) {
    ellipse(c, p.x + dx, p.y - 1.6, 2.8, 2)
    fillStroke(c, '#3b2a1e', OUTLINE, 1)
  }

  // Body, with a belt kept inside it.
  ellipse(c, p.x, p.y - 10, 7.2, 7.6)
  fillStroke(c, UNIFORM, OUTLINE, 1.4)
  c.save()
  ellipse(c, p.x, p.y - 10, 7.2, 7.6)
  c.clip()
  c.fillStyle = '#6b4423'
  c.fillRect(p.x - 8, p.y - 9.6, 16, 2.1)
  c.restore()

  // Wand (behind the hand), raised a little when it zaps.
  c.lineCap = 'round'
  for (const [w, color] of [[2.6, OUTLINE], [1.3, '#a8672e']] as const) {
    c.strokeStyle = color
    c.lineWidth = w
    c.beginPath()
    c.moveTo(p.x + 7.4, p.y - 6)
    c.lineTo(p.x + WAND_TIP.x, p.y + WAND_TIP.y + bob - raise + 2.4)
    c.stroke()
  }
  ellipse(c, p.x + WAND_TIP.x, p.y + WAND_TIP.y + bob - raise, 2.6, 2.6)
  fillStroke(c, ORB, OUTLINE, 1)
  if (swing > 0) {
    softFx(c, 'over', (s) => {
      ellipse(s, p.x + WAND_TIP.x, p.y + WAND_TIP.y + bob - raise, 7, 7)
      s.fillStyle = `rgba(127,231,220,${0.5 * swing})`
      s.fill()
    })
  }
  ellipse(c, p.x + 7.4, p.y - 9.5, 1.9, 1.9)
  fillStroke(c, SKIN, OUTLINE, 1)

  // Shield with a green cross.
  ellipse(c, p.x - 6.6, p.y - 9.5, 5.2, 5.4)
  fillStroke(c, '#fffaf0', OUTLINE, 1.3)
  c.fillStyle = '#3fae4a'
  c.fillRect(p.x - 7.7, p.y - 12.8, 2.2, 6.6)
  c.fillRect(p.x - 9.9, p.y - 10.6, 6.6, 2.2)

  // Plume, then the head and helmet over its base.
  ellipse(c, p.x, hy - 8.4, 2.2, 3.4)
  fillStroke(c, PLUMES[index % PLUMES.length], OUTLINE, 1)
  ellipse(c, p.x, hy, 6, 5.6)
  fillStroke(c, SKIN, OUTLINE, 1.3)
  c.beginPath()
  c.arc(p.x, hy - 0.8, 6.6, Math.PI, 0)
  c.closePath()
  fillStroke(c, '#ffcf4a', OUTLINE, 1.2)
  ellipse(c, p.x, hy - 0.8, 7.4, 1.7)
  fillStroke(c, '#e0a92a', OUTLINE, 1)

  // Face.
  c.fillStyle = OUTLINE
  for (const dx of [-2.1, 2.1]) {
    ellipse(c, p.x + dx, hy + 1.6, 0.95, 1.1)
    c.fill()
  }
  c.fillStyle = 'rgba(242,140,184,0.55)'
  for (const dx of [-3.8, 3.8]) {
    ellipse(c, p.x + dx, hy + 3.2, 1.3, 0.8)
    c.fill()
  }
  c.strokeStyle = OUTLINE
  c.lineWidth = 0.8
  c.beginPath()
  c.arc(p.x, hy + 2.8, 1.4, 0.2 * Math.PI, 0.8 * Math.PI)
  c.stroke()
}

import type { VeggieKind } from '../../avatar/look'
import type { Point } from '../types'
import { type Germ, type GermDrawable, type GermEvent, type GermSwarm, OUTSIDE_DEPTH } from './germs'
import { boxAround } from './ink'
import { OUTLINE, ellipse, fillStroke } from './sprites'

type Ctx = CanvasRenderingContext2D

interface Flight {
  kind: VeggieKind
  from: Point
  to: Point
  target: Germ
  /** When it leaves the paw (ms timestamp) and how long it flies (ms). */
  startAt: number
  dur: number
  arc: number
  /** Radians per second, either way round. */
  spin: number
  /** Hits like a stone of this strength (armor blocks part of it); without one it squishes like a tap. */
  power?: number
}

/** Splat color when each vegetable lands. */
export const VEGGIE_COLOR: Record<VeggieKind, string> = {
  carrot: '#f28a2e',
  broccoli: '#4fae45',
  tomato: '#e8382e',
  corn: '#f7c948',
  eggplant: '#6b3fa0',
  pepper: '#e8343a',
}

/**
 * Vegetables the player's character throws at germs: each one tumbles through the air in an arc,
 * follows its germ as it moves, and squishes it on landing (just like a tap used to, instantly).
 */
export class VeggieThrows {
  private flights: Flight[] = []

  /** Throws a `kind` from world point `from` at `target`, leaving the paw at `startAt` (ms). */
  launch(kind: VeggieKind, from: Point, target: Germ, germs: GermSwarm, startAt: number, power?: number) {
    const to = germs.aimPoint(target)
    if (!to) return
    const dist = Math.hypot(to.x - from.x, to.y - from.y)
    this.flights.push({
      kind,
      from,
      to,
      target,
      startAt,
      dur: Math.min(600, 220 + dist * 1.6),
      arc: 14 + dist * 0.25,
      spin: (Math.random() < 0.5 ? -1 : 1) * (9 + Math.random() * 4),
      power,
    })
  }

  /** Lands whatever arrived: the germ events of each squish, and a splat of vegetable color where it hit. */
  update(germs: GermSwarm, now: number): { events: GermEvent[]; splats: { at: Point; color: string }[] } {
    const events: GermEvent[] = []
    const splats: { at: Point; color: string }[] = []
    this.flights = this.flights.filter((f) => {
      const p = germs.aimPoint(f.target)
      if (p) f.to = p
      if (now - f.startAt < f.dur) return true
      events.push(...(f.power ? germs.arrowHit(f.target, f.power) : germs.squish(f.target)))
      splats.push({ at: f.to, color: VEGGIE_COLOR[f.kind] })
      return false
    })
    return { events, splats }
  }

  /** Vegetables in the air, for the renderer's outside pass (over everything, they're flying). */
  drawables(now: number): GermDrawable[] {
    const list: GermDrawable[] = []
    for (const f of this.flights) {
      const k = (now - f.startAt) / f.dur
      if (k < 0) continue
      const p = { x: f.from.x + (f.to.x - f.from.x) * k, y: f.from.y + (f.to.y - f.from.y) * k - Math.sin(k * Math.PI) * f.arc }
      const angle = (f.spin * (now - f.startAt)) / 1000
      list.push({ depth: OUTSIDE_DEPTH + 650, at: p, box: boxAround(p.x, p.y, 10, 10, 10), alpha: 1, draw: (c: Ctx) => drawVeggie(c, f.kind, p, angle) })
    }
    return list
  }
}

function line(c: Ctx, color: string, width: number, pts: [number, number][]) {
  c.beginPath()
  c.moveTo(pts[0][0], pts[0][1])
  for (const [x, y] of pts.slice(1)) c.lineTo(x, y)
  c.strokeStyle = color
  c.lineWidth = width
  c.lineCap = 'round'
  c.stroke()
}

function gloss(c: Ctx, x: number, y: number, rx: number, ry: number) {
  ellipse(c, x, y, rx, ry, -0.5)
  c.fillStyle = 'rgba(255,255,255,0.7)'
  c.fill()
}

/** A vegetable about 12 world units long, centered on `p` and turned by `angle`. */
function drawVeggie(c: Ctx, kind: VeggieKind, p: Point, angle: number) {
  c.save()
  c.translate(p.x, p.y)
  c.rotate(angle)
  const lw = 0.7
  switch (kind) {
    case 'carrot': {
      for (const a of [-0.55, 0, 0.55]) {
        ellipse(c, -5.2 - Math.cos(a) * 1.6, Math.sin(a) * 2.2, 2.6, 0.95, a)
        fillStroke(c, '#5fb84a', OUTLINE, lw)
      }
      c.beginPath()
      c.moveTo(7, 0)
      c.quadraticCurveTo(0.5, 3.8, -4, 2.7)
      c.quadraticCurveTo(-5.4, 0, -4, -2.7)
      c.quadraticCurveTo(0.5, -3.8, 7, 0)
      fillStroke(c, '#f28a2e', OUTLINE, lw)
      line(c, '#c9621a', 0.6, [[-1.5, -2.1], [-0.8, -1.2]])
      line(c, '#c9621a', 0.6, [[1.8, 1.9], [2.4, 1.1]])
      line(c, '#c9621a', 0.6, [[-2.5, 1.6], [-1.9, 0.9]])
      break
    }
    case 'broccoli': {
      c.beginPath()
      c.roundRect(-5.5, -1.5, 6, 3, 1.2)
      fillStroke(c, '#a6d977', OUTLINE, lw)
      for (const [x, y, r] of [[1.2, -2.6, 2.6], [1.2, 2.6, 2.6], [3.8, 0, 3], [0.4, 0, 2.4]]) {
        ellipse(c, x, y, r, r)
        fillStroke(c, '#4fae45', OUTLINE, lw)
      }
      c.fillStyle = '#3c8c36'
      for (const [x, y] of [[3.2, -1], [4.6, 0.8], [1.4, 2.2], [0.8, -2.6], [2, 0.4]]) {
        ellipse(c, x, y, 0.55, 0.55)
        c.fill()
      }
      break
    }
    case 'tomato': {
      ellipse(c, 0, 0.4, 5, 4.4)
      fillStroke(c, '#e8382e', OUTLINE, lw)
      gloss(c, 1.8, -1.2, 1.3, 0.8)
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        ellipse(c, Math.cos(a) * 1.4, -3.6 + Math.sin(a) * 1, 1.6, 0.6, a)
        fillStroke(c, '#5fb84a', OUTLINE, 0.5)
      }
      break
    }
    case 'corn': {
      for (const s of [-1, 1]) {
        ellipse(c, -3.6, s * 1.6, 4, 1.5, s * 0.45)
        fillStroke(c, '#8cc760', OUTLINE, lw)
      }
      ellipse(c, 1, 0, 6, 3)
      fillStroke(c, '#f7c948', OUTLINE, lw)
      c.fillStyle = '#ffe27a'
      for (let i = 0; i < 5; i++) {
        for (const y of [-1.4, 0, 1.4]) {
          ellipse(c, -2.4 + i * 1.7, y, 0.6, 0.55)
          c.fill()
        }
      }
      break
    }
    case 'eggplant': {
      c.beginPath()
      c.moveTo(-3.5, -2.2)
      c.quadraticCurveTo(1, -4.4, 5.5, -1.4)
      c.quadraticCurveTo(7.2, 1.6, 4, 3.2)
      c.quadraticCurveTo(0, 4.4, -3, 1.8)
      c.quadraticCurveTo(-4.4, 0, -3.5, -2.2)
      fillStroke(c, '#6b3fa0', OUTLINE, lw)
      gloss(c, 2.6, -1.8, 1.6, 0.7)
      for (const a of [-0.7, 0, 0.7]) {
        ellipse(c, -3.6 + Math.cos(a) * 1.2, Math.sin(a) * 1.8, 1.9, 0.8, a)
        fillStroke(c, '#4f9a3f', OUTLINE, 0.5)
      }
      line(c, '#3f7a32', 1.1, [[-4.6, 0], [-6.4, -0.6]])
      break
    }
    case 'pepper': {
      for (const [x, y, r] of [[-1.8, 0.6, 3.3], [1.8, 0.6, 3.3], [0, 1.4, 3.2]]) {
        ellipse(c, x, y, r * 0.9, r)
        fillStroke(c, '#e8343a', OUTLINE, lw)
      }
      gloss(c, 1.6, -0.6, 1.1, 0.6)
      ellipse(c, 0, -2.6, 2.4, 1)
      fillStroke(c, '#3f8a34', OUTLINE, 0.5)
      line(c, '#3f8a34', 1.2, [[0, -3], [0.6, -5]])
      break
    }
  }
  c.restore()
}

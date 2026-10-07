import { FURNITURE_BY_ID, ROOM_STYLES_BY_ID } from '../data/furniture'
import { furnitureFootprint, type FurniturePose } from '../systems/HomeSystem'
import type { Point, RoomStyleDef } from '../types'
import type { Box } from './ink'
import { tileToWorld } from './iso'
import { OUTLINE, blob, ellipse, fillStroke, hash, poly, shade, softFx } from './sprites'

/** The inside of the home: a cut-away iso room (two back walls) and its furniture, in room-tile coordinates. */

type Ctx = CanvasRenderingContext2D

export const WALL_H = 72
/** Thickness of the floor slab showing along the open front edges. */
export const SLAB = 10
const WALL_T = 0.16
const LW = 1.2

/** Room tile (x, y), lifted z world units off the floor. */
function P(x: number, y: number, z = 0): Point {
  const p = tileToWorld(x, y)
  return { x: p.x, y: p.y - z }
}

/** While a turned piece is painted (mirrored), light falls on its other side. */
let flipped = false

/** Upright box on footprint (x, y, w, h), from height z0 to z1. `color` must be hex. */
function box(c: Ctx, x: number, y: number, w: number, h: number, z0: number, z1: number, color: string, lw = LW) {
  poly(c, [P(x, y + h, z0), P(x + w, y + h, z0), P(x + w, y + h, z1), P(x, y + h, z1)])
  fillStroke(c, shade(color, flipped ? 0.78 : 0.9), OUTLINE, lw)
  poly(c, [P(x + w, y + h, z0), P(x + w, y, z0), P(x + w, y, z1), P(x + w, y + h, z1)])
  fillStroke(c, shade(color, flipped ? 0.9 : 0.78), OUTLINE, lw)
  poly(c, [P(x, y, z1), P(x + w, y, z1), P(x + w, y + h, z1), P(x, y + h, z1)])
  fillStroke(c, color, OUTLINE, lw)
}

/** A flat panel on a box's front face (the plane y = Y), e.g. a drawer or a book. */
function front(c: Ctx, x0: number, x1: number, Y: number, z0: number, z1: number, fill: string, lw = 0.9) {
  poly(c, [P(x0, Y, z0), P(x1, Y, z0), P(x1, Y, z1), P(x0, Y, z1)])
  fillStroke(c, fill, OUTLINE, lw)
}

/** Upright cylinder standing on room point (cx, cy). */
function cylinder(c: Ctx, cx: number, cy: number, r: number, z0: number, z1: number, color: string, lw = LW) {
  const b = P(cx, cy, z0)
  const t = P(cx, cy, z1)
  c.beginPath()
  c.moveTo(t.x - r, t.y)
  c.lineTo(b.x - r, b.y)
  c.ellipse(b.x, b.y, r, r / 2, 0, Math.PI, 0, true)
  c.lineTo(t.x + r, t.y)
  c.closePath()
  fillStroke(c, shade(color, 0.85), OUTLINE, lw)
  ellipse(c, t.x, t.y, r, r / 2)
  fillStroke(c, color, OUTLINE, lw)
}

/** A cone-ish lamp shade from radius r0 (bottom, at z0) to r1 (top, at z1). */
function lampShade(c: Ctx, cx: number, cy: number, z0: number, z1: number, r0: number, r1: number, color: string) {
  const b = P(cx, cy, z0)
  const t = P(cx, cy, z1)
  c.beginPath()
  c.moveTo(t.x - r1, t.y)
  c.lineTo(b.x - r0, b.y)
  c.ellipse(b.x, b.y, r0, r0 / 2, 0, Math.PI, 0, true)
  c.lineTo(t.x + r1, t.y)
  c.closePath()
  fillStroke(c, color, OUTLINE, LW)
  ellipse(c, t.x, t.y, r1, r1 / 2)
  fillStroke(c, shade(color, 1.35), OUTLINE, LW)
}

function stick(c: Ctx, a: Point, b: Point, color: string, width = 2) {
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(a.x, a.y)
  c.lineTo(b.x, b.y)
  c.strokeStyle = OUTLINE
  c.lineWidth = width + 1.8
  c.stroke()
  c.strokeStyle = color
  c.lineWidth = width
  c.stroke()
}

function dot(c: Ctx, p: Point, r: number, fill: string, lw = 0.8) {
  ellipse(c, p.x, p.y, r, r)
  fillStroke(c, fill, OUTLINE, lw)
}

function legs(c: Ctx, x0: number, y0: number, x1: number, y1: number, z: number, color: string, s = 0.08) {
  for (const [lx, ly] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) box(c, lx, ly, s, s, 0, z, color, 1)
}

/** Fruit heaped in a little bowl standing at p. */
function fruitBowl(c: Ctx, p: Point, color = '#4ea8de') {
  const rim = { x: p.x, y: p.y - 5 }
  ellipse(c, rim.x, rim.y, 9, 4.5)
  fillStroke(c, shade(color, 0.7), OUTLINE, 1)
  for (const [dx, dy, r, fill] of [
    [-4, -3.5, 3.4, '#e63946'],
    [3.2, -3.8, 3.4, '#f4a261'],
    [-0.4, -6.5, 3.2, '#90be6d'],
  ] as const) {
    dot(c, { x: rim.x + dx, y: rim.y + dy }, r, fill)
    ellipse(c, rim.x + dx - 1, rim.y + dy - 1.2, 0.9, 0.9)
    c.fillStyle = 'rgba(255,255,255,0.8)'
    c.fill()
  }
  c.beginPath()
  c.moveTo(rim.x - 9, rim.y)
  c.ellipse(rim.x, rim.y, 9, 7, 0, Math.PI, 0, true)
  c.ellipse(rim.x, rim.y, 9, 4.5, 0, 0, Math.PI, false)
  c.closePath()
  fillStroke(c, color, OUTLINE, 1)
}

function flower(c: Ctx, p: Point, petal: string) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    dot(c, { x: p.x + Math.cos(a) * 2.6, y: p.y + Math.sin(a) * 2.2 }, 2, petal, 0.7)
  }
  dot(c, p, 1.4, '#ffd166', 0.6)
}

// ---------- furniture painters (natural orientation; the front faces +y) ----------

type Painter = (c: Ctx, x: number, y: number) => void

const PAINTERS: Record<string, Painter> = {
  sofa: (c, x, y) => {
    box(c, x + 0.06, y + 0.06, 1.88, 0.26, 0, 26, '#6fa8dc')
    box(c, x + 0.06, y + 0.3, 1.88, 0.64, 0, 9, '#5b93c7')
    box(c, x + 0.06, y + 0.3, 0.24, 0.64, 0, 17, '#6fa8dc')
    box(c, x + 0.32, y + 0.34, 0.68, 0.58, 9, 13, '#9ccbf0')
    box(c, x + 1.0, y + 0.34, 0.68, 0.58, 9, 13, '#9ccbf0')
    box(c, x + 0.38, y + 0.34, 0.4, 0.12, 13, 22, '#ffd166')
    box(c, x + 1.7, y + 0.3, 0.24, 0.64, 0, 17, '#6fa8dc')
  },
  armchair: (c, x, y) => {
    box(c, x + 0.08, y + 0.08, 0.84, 0.26, 0, 24, '#f4a259')
    box(c, x + 0.08, y + 0.3, 0.84, 0.62, 0, 9, '#e08e45')
    box(c, x + 0.08, y + 0.3, 0.2, 0.62, 0, 16, '#f4a259')
    box(c, x + 0.3, y + 0.34, 0.42, 0.54, 9, 13, '#f9c995')
    box(c, x + 0.72, y + 0.3, 0.2, 0.62, 0, 16, '#f4a259')
  },
  coffeeTable: (c, x, y) => {
    legs(c, x + 0.17, y + 0.17, x + 0.75, y + 0.75, 9, '#8a5a35')
    box(c, x + 0.12, y + 0.12, 0.76, 0.76, 9, 12, '#b07a4a')
    box(c, x + 0.24, y + 0.42, 0.3, 0.22, 12, 14, '#e63946', 1)
    cylinder(c, x + 0.66, y + 0.4, 3, 12, 17, '#ffffff', 1)
  },
  tv: (c, x, y) => {
    box(c, x + 0.1, y + 0.2, 1.8, 0.6, 0, 12, '#9c6b4e')
    front(c, x + 0.2, x + 0.96, y + 0.8, 2.5, 9.5, '#b88262')
    front(c, x + 1.04, x + 1.8, y + 0.8, 2.5, 9.5, '#b88262')
    box(c, x + 0.9, y + 0.42, 0.2, 0.12, 12, 16, '#2d3142', 1)
    box(c, x + 0.14, y + 0.42, 1.72, 0.1, 16, 46, '#2d3142')
    front(c, x + 0.22, x + 1.78, y + 0.52, 18.5, 43.5, '#5ec8f2')
    poly(c, [P(x + 0.5, y + 0.52, 43.5), P(x + 0.8, y + 0.52, 43.5), P(x + 0.55, y + 0.52, 18.5), P(x + 0.3, y + 0.52, 18.5)])
    c.fillStyle = 'rgba(255,255,255,0.35)'
    c.fill()
  },
  bookshelf: (c, x, y) => {
    box(c, x + 0.08, y + 0.1, 0.84, 0.5, 0, 58, '#a9744f')
    const Y = y + 0.6
    const colors = ['#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#ffd166', '#9b5de5', '#f28482']
    for (let k = 0; k < 3; k++) {
      const z0 = 4 + k * 18
      front(c, x + 0.14, x + 0.86, Y, z0, z0 + 15, '#6e4a33')
      let bx = x + 0.17
      for (let i = 0; bx < x + 0.8; i++) {
        const w = 0.07 + hash(k, i, 3) * 0.06
        if (bx + w > x + 0.84) break
        front(c, bx, bx + w, Y, z0, z0 + 9 + hash(i, k, 7) * 5, colors[(i + k * 3) % colors.length], 0.7)
        bx += w + 0.012
      }
    }
  },
  floorLamp: (c, x, y) => {
    const cx = x + 0.5
    const cy = y + 0.5
    softFx(c, 'under', (g) => {
      const p = P(cx, cy, 46)
      const glow = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 46)
      glow.addColorStop(0, 'rgba(255,226,140,0.5)')
      glow.addColorStop(1, 'rgba(255,226,140,0)')
      g.fillStyle = glow
      g.fillRect(p.x - 46, p.y - 46, 92, 92)
    })
    cylinder(c, cx, cy, 8, 0, 3, '#5c4a3d')
    stick(c, P(cx, cy, 3), P(cx, cy, 44), '#c9a227')
    lampShade(c, cx, cy, 40, 56, 13, 8, '#ffe08a')
  },
  beanbag: (c, x, y) => {
    const p = P(x + 0.5, y + 0.55)
    blob(c, [[p.x - 6, p.y - 6, 8.5], [p.x + 6, p.y - 6, 8.5], [p.x, p.y - 11, 9]], '#ff8fab')
    ellipse(c, p.x - 3, p.y - 14, 3.5, 2)
    c.fillStyle = 'rgba(255,255,255,0.55)'
    c.fill()
  },
  aquarium: (c, x, y) => {
    box(c, x + 0.08, y + 0.2, 1.84, 0.6, 0, 16, '#5b4636')
    c.globalAlpha = 0.88
    box(c, x + 0.08, y + 0.2, 1.84, 0.6, 16, 42, '#a8e1f7')
    c.globalAlpha = 1
    const Y = y + 0.8
    front(c, x + 0.08, x + 1.92, Y, 16, 19.5, '#f1d18a', 0.8)
    for (const [px, h] of [[0.3, 14], [0.42, 10], [1.65, 12]]) stick(c, P(x + px, Y, 19), P(x + px + 0.04, Y, 19 + h), '#52b788', 1.6)
    for (const [px, z, col, dir] of [[0.75, 29, '#f77f00', 1], [1.3, 34, '#ffd166', -1]] as const) {
      const f = P(x + px, Y, z)
      poly(c, [{ x: f.x - dir * 4, y: f.y }, { x: f.x - dir * 8, y: f.y - 3 }, { x: f.x - dir * 8, y: f.y + 3 }])
      fillStroke(c, col, OUTLINE, 0.8)
      ellipse(c, f.x, f.y, 5, 3)
      fillStroke(c, col, OUTLINE, 0.8)
    }
    for (const [px, z] of [[1.0, 33], [1.05, 37], [0.98, 40]]) {
      const b = P(x + px, Y, z)
      ellipse(c, b.x, b.y, 1.2, 1.2)
      c.strokeStyle = '#ffffff'
      c.lineWidth = 0.8
      c.stroke()
    }
    box(c, x + 0.06, y + 0.18, 1.88, 0.64, 42, 45, '#3d405b')
  },
  bed: (c, x, y) => {
    box(c, x + 0.05, y + 0.04, 1.9, 0.16, 0, 30, '#a9744f')
    box(c, x + 0.05, y + 0.2, 1.9, 1.75, 0, 8, '#a9744f')
    box(c, x + 0.1, y + 0.22, 1.8, 1.68, 8, 13, '#fbf7ef')
    box(c, x + 0.22, y + 0.3, 0.7, 0.42, 13, 18, '#ffffff')
    box(c, x + 1.08, y + 0.3, 0.7, 0.42, 13, 18, '#ffffff')
    box(c, x + 0.07, y + 0.85, 1.86, 1.08, 12, 15.5, '#7cb7e8')
    box(c, x + 0.07, y + 0.85, 1.86, 0.18, 15.5, 16.5, '#ffffff', 1)
  },
  nightstand: (c, x, y) => {
    box(c, x + 0.18, y + 0.18, 0.64, 0.64, 0, 16, '#c98b5a')
    front(c, x + 0.24, x + 0.76, y + 0.82, 3, 13, '#dba57a')
    dot(c, P(x + 0.5, y + 0.82, 8), 1.4, '#5c3d24')
    cylinder(c, x + 0.5, y + 0.45, 3.5, 16, 18, '#f1faee', 1)
    stick(c, P(x + 0.5, y + 0.45, 18), P(x + 0.5, y + 0.45, 22), '#c9a227', 1.4)
    lampShade(c, x + 0.5, y + 0.45, 21, 28, 7, 4.5, '#ffafcc')
  },
  wardrobe: (c, x, y) => {
    box(c, x + 0.06, y + 0.12, 1.88, 0.72, 0, 62, '#d39b6a')
    const Y = y + 0.84
    front(c, x + 0.12, x + 0.98, Y, 4, 58, '#e3b48c')
    front(c, x + 1.02, x + 1.88, Y, 4, 58, '#e3b48c')
    dot(c, P(x + 0.9, Y, 32), 1.6, '#5c3d24')
    dot(c, P(x + 1.1, Y, 32), 1.6, '#5c3d24')
    box(c, x + 0.03, y + 0.09, 1.94, 0.78, 62, 65, '#b9845a', 1)
  },
  desk: (c, x, y) => {
    box(c, x + 0.08, y + 0.2, 0.16, 0.65, 0, 18, '#7f5539')
    box(c, x + 1.76, y + 0.2, 0.16, 0.65, 0, 18, '#7f5539')
    box(c, x + 0.05, y + 0.15, 1.9, 0.75, 18, 21, '#b08968')
    box(c, x + 0.7, y + 0.34, 0.6, 0.06, 22.5, 36, '#343a40', 1)
    front(c, x + 0.74, x + 1.26, y + 0.4, 24.5, 34.5, '#90e0ef', 0.7)
    box(c, x + 0.7, y + 0.4, 0.6, 0.38, 21, 22.5, '#adb5bd', 1)
    cylinder(c, x + 1.6, y + 0.45, 3, 21, 27, '#ffb703', 1)
    stick(c, P(x + 1.6, y + 0.45, 27), P(x + 1.57, y + 0.42, 32), '#e63946', 1)
  },
  teddy: (c, x, y) => {
    const p = P(x + 0.5, y + 0.55)
    blob(c, [[p.x, p.y - 8, 8], [p.x - 6.5, p.y - 2.5, 4], [p.x + 6.5, p.y - 2.5, 4]], '#c68b59')
    blob(c, [[p.x, p.y - 19, 7], [p.x - 5.5, p.y - 25, 3], [p.x + 5.5, p.y - 25, 3]], '#c68b59')
    ellipse(c, p.x, p.y - 7, 4.4, 4)
    c.fillStyle = '#e8bf95'
    c.fill()
    ellipse(c, p.x, p.y - 16.5, 3.2, 2.4)
    c.fillStyle = '#f1d3b3'
    c.fill()
    for (const dx of [-2.6, 2.6]) {
      ellipse(c, p.x + dx, p.y - 20, 1, 1.1)
      c.fillStyle = OUTLINE
      c.fill()
    }
    ellipse(c, p.x, p.y - 17.2, 1.2, 0.8)
    c.fill()
    poly(c, [{ x: p.x, y: p.y - 12.5 }, { x: p.x - 4, y: p.y - 14.5 }, { x: p.x - 4, y: p.y - 10.5 }])
    fillStroke(c, '#ff5d8f', OUTLINE, 0.7)
    poly(c, [{ x: p.x, y: p.y - 12.5 }, { x: p.x + 4, y: p.y - 14.5 }, { x: p.x + 4, y: p.y - 10.5 }])
    fillStroke(c, '#ff5d8f', OUTLINE, 0.7)
  },
  fridge: (c, x, y) => {
    box(c, x + 0.1, y + 0.1, 0.8, 0.8, 0, 58, '#eef4f6')
    const Y = y + 0.9
    stick(c, P(x + 0.1, Y, 38), P(x + 0.9, Y, 38), '#d0dadf', 0.6)
    front(c, x + 0.76, x + 0.8, Y, 42, 52, '#adb5bd', 0.7)
    front(c, x + 0.76, x + 0.8, Y, 22, 34, '#adb5bd', 0.7)
    dot(c, P(x + 0.3, Y, 47), 1.8, '#ef476f')
    dot(c, P(x + 0.46, Y, 51), 1.8, '#ffd166')
    front(c, x + 0.24, x + 0.46, Y, 24, 32, '#ffffff', 0.7)
  },
  stove: (c, x, y) => {
    box(c, x + 0.08, y + 0.08, 0.84, 0.84, 0, 24, '#f1f3f5')
    for (const [bx, by] of [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7]]) {
      const b = P(x + bx, y + by, 24)
      ellipse(c, b.x, b.y, 6, 3)
      fillStroke(c, '#343a40', OUTLINE, 0.8)
    }
    front(c, x + 0.2, x + 0.8, y + 0.92, 4.5, 15, '#495057')
    front(c, x + 0.2, x + 0.8, y + 0.92, 17, 18.5, '#adb5bd', 0.7)
    for (const kx of [0.25, 0.42, 0.58, 0.75]) dot(c, P(x + kx, y + 0.92, 21.5), 1.2, '#343a40', 0.6)
    cylinder(c, x + 0.7, y + 0.7, 6.5, 24, 31, '#e63946')
    stick(c, P(x + 0.7, y + 0.7, 31), P(x + 0.7, y + 0.7, 33), '#343a40', 1.6)
  },
  counter: (c, x, y) => {
    box(c, x + 0.06, y + 0.06, 0.88, 0.88, 0, 21, '#8ecae6')
    front(c, x + 0.12, x + 0.48, y + 0.94, 3, 18, '#a8dadc')
    front(c, x + 0.52, x + 0.88, y + 0.94, 3, 18, '#a8dadc')
    box(c, x + 0.03, y + 0.03, 0.94, 0.94, 21, 24, '#f8f9fa')
    poly(c, [P(x + 0.26, y + 0.3, 24), P(x + 0.74, y + 0.3, 24), P(x + 0.74, y + 0.78, 24), P(x + 0.26, y + 0.78, 24)])
    fillStroke(c, '#b9c4ce', OUTLINE, 1)
    poly(c, [P(x + 0.32, y + 0.36, 24), P(x + 0.68, y + 0.36, 24), P(x + 0.68, y + 0.72, 24), P(x + 0.32, y + 0.72, 24)])
    fillStroke(c, '#cfe8ff', null)
    const tap = [P(x + 0.5, y + 0.14, 24), P(x + 0.5, y + 0.14, 33), P(x + 0.5, y + 0.34, 33), P(x + 0.5, y + 0.34, 30)]
    for (let i = 1; i < tap.length; i++) stick(c, tap[i - 1], tap[i], '#ced4da', 1.8)
  },
  diningTable: (c, x, y) => {
    legs(c, x + 0.15, y + 0.2, x + 1.77, y + 0.72, 17, '#8a5a35')
    box(c, x + 0.08, y + 0.12, 1.84, 0.76, 17, 20, '#d4a373')
    poly(c, [P(x + 0.08, y + 0.38, 20), P(x + 1.92, y + 0.38, 20), P(x + 1.92, y + 0.62, 20), P(x + 0.08, y + 0.62, 20)])
    fillStroke(c, '#fdf0d5', OUTLINE, 0.7)
    fruitBowl(c, P(x + 0.7, y + 0.5, 20), '#f28482')
    const plate = P(x + 1.35, y + 0.5, 20)
    ellipse(c, plate.x, plate.y, 7, 3.5)
    fillStroke(c, '#ffffff', OUTLINE, 0.8)
    ellipse(c, plate.x, plate.y, 3.5, 1.7)
    fillStroke(c, '#90be6d', OUTLINE, 0.6)
  },
  chair: (c, x, y) => {
    legs(c, x + 0.25, y + 0.26, x + 0.69, y + 0.7, 11, '#9c6644', 0.07)
    box(c, x + 0.24, y + 0.22, 0.52, 0.07, 11, 30, '#d4a373')
    box(c, x + 0.22, y + 0.24, 0.56, 0.54, 11, 13.5, '#d4a373')
    box(c, x + 0.27, y + 0.32, 0.46, 0.42, 13.5, 15, '#e76f51', 1)
  },
  fruitBowl: (c, x, y) => {
    cylinder(c, x + 0.5, y + 0.5, 8, 0, 2, '#8a5a35', 1)
    cylinder(c, x + 0.5, y + 0.5, 2.6, 2, 18, '#8a5a35', 1)
    cylinder(c, x + 0.5, y + 0.5, 15, 18, 21, '#d4a373')
    fruitBowl(c, P(x + 0.5, y + 0.5, 21))
  },
  waterCooler: (c, x, y) => {
    box(c, x + 0.25, y + 0.25, 0.5, 0.5, 0, 30, '#f8f9fa')
    const Y = y + 0.75
    front(c, x + 0.32, x + 0.68, Y, 12, 14, '#adb5bd', 0.7)
    front(c, x + 0.34, x + 0.44, Y, 19, 23, '#e63946', 0.7)
    front(c, x + 0.56, x + 0.66, Y, 19, 23, '#4895ef', 0.7)
    c.globalAlpha = 0.9
    cylinder(c, x + 0.5, y + 0.5, 4, 30, 33, '#9ad1f5', 1)
    cylinder(c, x + 0.5, y + 0.5, 9, 33, 47, '#9ad1f5')
    c.globalAlpha = 1
    const a = P(x + 0.5, y + 0.5, 35)
    stick(c, { x: a.x - 5, y: a.y }, { x: a.x - 5, y: a.y - 9 }, 'rgba(255,255,255,0.9)', 1.4)
  },
  yogaMat: (c, x, y) => {
    poly(c, [P(x + 0.18, y + 0.12, 0.6), P(x + 0.82, y + 0.12, 0.6), P(x + 0.82, y + 1.9, 0.6), P(x + 0.18, y + 1.9, 0.6)])
    fillStroke(c, '#b388eb', OUTLINE, 1.2)
    for (const k of [0.32, 1.7]) {
      poly(c, [P(x + 0.18, y + k, 0.6), P(x + 0.82, y + k, 0.6), P(x + 0.82, y + k + 0.06, 0.6), P(x + 0.18, y + k + 0.06, 0.6)])
      fillStroke(c, '#dcc6ff', null)
    }
    box(c, x + 0.18, y + 0.1, 0.64, 0.16, 0, 5, '#9d6ce0', 1)
  },
  exerciseBike: (c, x, y) => {
    box(c, x + 0.38, y + 0.14, 0.24, 0.74, 0, 3, '#495057', 1)
    stick(c, P(x + 0.5, y + 0.36, 3), P(x + 0.5, y + 0.3, 24), '#adb5bd', 2)
    const seat = P(x + 0.5, y + 0.3, 25)
    ellipse(c, seat.x, seat.y, 5.5, 2.6)
    fillStroke(c, '#343a40', OUTLINE, 1)
    const hub = P(x + 0.5, y + 0.72, 12)
    ellipse(c, hub.x, hub.y, 5.5, 11, 0.45)
    fillStroke(c, '#ef476f', OUTLINE, 1.2)
    dot(c, hub, 2, '#343a40')
    stick(c, P(x + 0.5, y + 0.66, 10), P(x + 0.5, y + 0.64, 32), '#adb5bd', 2)
    stick(c, P(x + 0.3, y + 0.64, 32), P(x + 0.7, y + 0.64, 32), '#343a40', 2.2)
  },
  plant: (c, x, y) => {
    const p = P(x + 0.5, y + 0.5)
    cylinder(c, x + 0.5, y + 0.5, 9, 0, 13, '#d9774b')
    blob(c, [[p.x, p.y - 26, 9], [p.x - 8, p.y - 20, 7.5], [p.x + 8, p.y - 21, 7.5], [p.x - 3, p.y - 33, 6.5], [p.x + 5, p.y - 31, 6]], '#5aa35a')
    for (const [dx, dy] of [[-4, -28], [5, -24], [-8, -21]]) {
      ellipse(c, p.x + dx, p.y + dy, 2.6, 1.6, -0.5)
      c.fillStyle = '#86c98a'
      c.fill()
    }
  },
  rug: (c, x, y) => {
    const p = P(x + 1, y + 1, 0.5)
    for (const [rx, fill] of [[56, '#e07a8f'], [44, '#f7c6d0'], [28, '#e07a8f'], [11, '#ffe5ec']] as const) {
      ellipse(c, p.x, p.y, rx, rx / 2)
      fillStroke(c, fill, rx === 56 ? OUTLINE : 'rgba(43,29,14,0.25)', rx === 56 ? 1.2 : 0.8)
    }
  },
  runner: (c, x, y) => {
    poly(c, [P(x + 0.14, y + 0.08, 0.5), P(x + 0.86, y + 0.08, 0.5), P(x + 0.86, y + 1.92, 0.5), P(x + 0.14, y + 1.92, 0.5)])
    fillStroke(c, '#ffd166', OUTLINE, 1.2)
    for (let k = 0; k < 5; k++) {
      const y0 = y + 0.22 + k * 0.35
      poly(c, [P(x + 0.14, y0, 0.5), P(x + 0.86, y0, 0.5), P(x + 0.86, y0 + 0.14, 0.5), P(x + 0.14, y0 + 0.14, 0.5)])
      fillStroke(c, k % 2 ? '#118ab2' : '#ef476f', null)
    }
  },
  flowerVase: (c, x, y) => {
    const cx = x + 0.5
    const cy = y + 0.5
    cylinder(c, cx, cy, 6.5, 0, 16, '#4ea8de')
    cylinder(c, cx, cy, 3.5, 16, 20, '#4ea8de', 1)
    const base = P(cx, cy, 19)
    const heads: [number, number, string][] = [[-7, -12, '#ff8fab'], [0, -15, '#ffd166'], [7, -11, '#c77dff'], [-2, -8, '#ff8fab'], [4, -6, '#ffd166']]
    for (const [dx, dy] of heads) stick(c, base, { x: base.x + dx, y: base.y + dy }, '#52b788', 1.2)
    for (const [dx, dy, col] of heads) flower(c, { x: base.x + dx, y: base.y + dy }, col)
  },
}

/** Paints a piece where it stands. A turned piece is the natural one mirrored, which swaps its footprint. */
export function paintFurniture(c: Ctx, pose: FurniturePose) {
  const paint = PAINTERS[pose.defId]
  if (!paint) return
  if (!pose.turned) return paint(c, pose.x, pose.y)
  c.save()
  c.scale(-1, 1)
  flipped = true
  try {
    paint(c, pose.y, pose.x)
  } finally {
    flipped = false
    c.restore()
  }
}

/** World-space box that holds a piece's picture. */
export function furnitureBox(pose: FurniturePose): Box {
  const f = furnitureFootprint(pose)
  const tall = FURNITURE_BY_ID[pose.defId]?.tall ?? 30
  const top = P(f.x, f.y)
  const right = P(f.x + f.w, f.y)
  const bottom = P(f.x + f.w, f.y + f.h)
  const left = P(f.x, f.y + f.h)
  return { x: left.x - 6, y: top.y - tall - 10, w: right.x - left.x + 12, h: bottom.y - top.y + tall + 14 }
}

/** Outline of a piece on screen (its footprint pulled up to its height), for picking it with a tap. */
export function furnitureHull(pose: FurniturePose): Point[] {
  const f = furnitureFootprint(pose)
  const tall = FURNITURE_BY_ID[pose.defId]?.tall ?? 30
  return [P(f.x, f.y + f.h), P(f.x + f.w, f.y + f.h), P(f.x + f.w, f.y), P(f.x + f.w, f.y, tall), P(f.x, f.y, tall), P(f.x, f.y + f.h, tall)]
}

/** Tints the floor tiles under a footprint (placement preview). */
export function paintFootprint(c: Ctx, f: { x: number; y: number; w: number; h: number }, color: string) {
  poly(c, [P(f.x, f.y), P(f.x + f.w, f.y), P(f.x + f.w, f.y + f.h), P(f.x, f.y + f.h)])
  c.fillStyle = color
  c.fill()
  c.strokeStyle = 'rgba(255,255,255,0.95)'
  c.lineWidth = 1.6
  c.setLineDash([4, 3])
  c.stroke()
  c.setLineDash([])
}

// ---------- the room ----------

const wallPoint = (side: 'left' | 'right', t: number, z: number) => (side === 'left' ? P(0, t, z) : P(t, 0, z))

function paintWall(c: Ctx, side: 'left' | 'right', len: number, style: RoomStyleDef) {
  const W = (t: number, z: number) => wallPoint(side, t, z)
  const quad = (t0: number, t1: number, z0: number, z1: number) => poly(c, [W(t0, z0), W(t1, z0), W(t1, z1), W(t0, z1)])
  const dim = side === 'right' ? 0.93 : 1
  quad(0, len, 0, WALL_H)
  fillStroke(c, shade(style.colors[0], dim), null)
  if (style.pattern === 'stripes') {
    for (let t = 0.25; t < len; t += 0.5) {
      quad(t, Math.min(len, t + 0.22), 0, WALL_H)
      fillStroke(c, shade(style.colors[1], dim), null)
    }
  } else if (style.pattern === 'dots') {
    c.fillStyle = shade(style.colors[1], dim)
    for (let i = 0, t = 0.25; t < len; t += 0.5, i++) {
      for (let z = 12 + (i % 2) * 8; z < WALL_H - 6; z += 16) {
        const p = W(t, z)
        ellipse(c, p.x, p.y, 2.4, 2.6)
        c.fill()
      }
    }
  }
  quad(0, len, 0, 5)
  fillStroke(c, '#ffffff', OUTLINE, 1)
  quad(0, len, 0, WALL_H)
  c.strokeStyle = OUTLINE
  c.lineWidth = 1.6
  c.stroke()
}

function paintFloor(c: Ctx, w: number, h: number, style: RoomStyleDef) {
  const [c0, c1] = style.colors
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      poly(c, [P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)])
      if (style.pattern === 'tiles') fillStroke(c, (x + y) % 2 ? c0 : c1, 'rgba(0,0,0,0.14)', 1)
      else if (style.pattern === 'carpet') fillStroke(c, c0, null)
      else fillStroke(c, y % 2 ? c0 : c1, 'rgba(110,70,30,0.3)', 1)
    }
  }
  if (style.pattern === 'planks') {
    c.strokeStyle = 'rgba(110,70,30,0.3)'
    c.lineWidth = 1
    c.beginPath()
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const k = x + (y % 2 ? 0.5 : 0)
        if (k > 0 && k < w) {
          const a = P(k, y)
          const b = P(k, y + 1)
          c.moveTo(a.x, a.y)
          c.lineTo(b.x, b.y)
        }
      }
      const a = P(0, y + 0.5)
      const b = P(w, y + 0.5)
      c.moveTo(a.x, a.y)
      c.lineTo(b.x, b.y)
    }
    c.stroke()
  } else if (style.pattern === 'carpet') {
    c.fillStyle = c1
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        for (let i = 0; i < 3; i++) {
          const p = P(x + 0.15 + hash(x, y, i) * 0.7, y + 0.15 + hash(y, x, i + 4) * 0.7)
          ellipse(c, p.x, p.y, 2.2, 1.1)
          c.fill()
        }
      }
    }
  }
}

function paintWindow(c: Ctx, w: number) {
  const W = (t: number, z: number) => wallPoint('right', t, z)
  const quad = (t0: number, t1: number, z0: number, z1: number) => poly(c, [W(t0, z0), W(t1, z0), W(t1, z1), W(t0, z1)])
  const a = w / 2 - 0.8
  const b = w / 2 + 0.8
  quad(a, b, 24, 58)
  fillStroke(c, '#ffffff', OUTLINE, 1.6)
  quad(a + 0.09, b - 0.09, 27, 55)
  fillStroke(c, '#bde0fe', OUTLINE, 1)
  const cloud = W(a + 0.55, 45)
  for (const [dx, dy, r] of [[0, 0, 3.4], [4, -1.5, 4], [8, 0.5, 3]]) {
    ellipse(c, cloud.x + dx, cloud.y + dy, r, r * 0.8)
    c.fillStyle = '#ffffff'
    c.fill()
  }
  stick(c, W((a + b) / 2, 27), W((a + b) / 2, 55), '#ffffff', 1.8)
  stick(c, W(a + 0.09, 41), W(b - 0.09, 41), '#ffffff', 1.8)
  quad(a - 0.12, b + 0.12, 21, 24)
  fillStroke(c, '#ffffff', OUTLINE, 1.2)
  quad(a - 0.3, a + 0.1, 20, 62)
  fillStroke(c, '#ffafcc', OUTLINE, 1.2)
  quad(b - 0.1, b + 0.3, 20, 62)
  fillStroke(c, '#ffafcc', OUTLINE, 1.2)
}

function paintDoorAndPicture(c: Ctx, h: number) {
  const W = (t: number, z: number) => wallPoint('left', t, z)
  const quad = (t0: number, t1: number, z0: number, z1: number) => poly(c, [W(t0, z0), W(t1, z0), W(t1, z1), W(t0, z1)])
  quad(0.72, 1.98, 0, 53)
  fillStroke(c, '#ffffff', OUTLINE, 1.4)
  quad(0.8, 1.9, 0, 50)
  fillStroke(c, '#b5835a', OUTLINE, 1.2)
  quad(0.92, 1.78, 28, 45)
  fillStroke(c, '#c99a70', OUTLINE, 0.8)
  quad(0.92, 1.78, 6, 24)
  fillStroke(c, '#c99a70', OUTLINE, 0.8)
  dot(c, W(1.74, 26), 1.7, '#ffd166')

  const t0 = Math.min(h - 1.6, 3.2)
  const t1 = t0 + 1.3
  quad(t0, t1, 30, 54)
  fillStroke(c, '#ffd166', OUTLINE, 1.4)
  quad(t0 + 0.1, t1 - 0.1, 33, 51)
  fillStroke(c, '#a0e7e5', OUTLINE, 0.9)
  poly(c, [W(t0 + 0.1, 33), W(t1 - 0.1, 33), W(t1 - 0.1, 40), W(t0 + 0.75, 44), W(t0 + 0.1, 39)])
  fillStroke(c, '#80ed99', OUTLINE, 0.8)
  dot(c, W(t0 + 0.4, 46.5), 2.6, '#ffd60a', 0.7)
}

/** Floor, back walls (with a door, a window and a picture) and the open cut-away front. */
export function paintRoom(c: Ctx, w: number, h: number, wallId: string, floorId: string) {
  const wall = ROOM_STYLES_BY_ID[wallId] ?? ROOM_STYLES_BY_ID.wallCream
  const floor = ROOM_STYLES_BY_ID[floorId] ?? ROOM_STYLES_BY_ID.floorOak

  poly(c, [P(0, h), P(w, h), P(w, h, -SLAB), P(0, h, -SLAB)])
  fillStroke(c, '#d8b98e', OUTLINE, 1.6)
  poly(c, [P(w, h), P(w, 0), P(w, 0, -SLAB), P(w, h, -SLAB)])
  fillStroke(c, '#c2a073', OUTLINE, 1.6)
  paintFloor(c, w, h, floor)

  paintWall(c, 'left', h, wall)
  paintWall(c, 'right', w, wall)
  // Wall tops and the cut ends, so the walls read as solid.
  poly(c, [P(0, 0, WALL_H), P(0, h, WALL_H), P(-WALL_T, h, WALL_H), P(-WALL_T, -WALL_T, WALL_H), P(w, -WALL_T, WALL_H), P(w, 0, WALL_H)])
  fillStroke(c, '#fff8ec', OUTLINE, 1.4)
  poly(c, [P(0, h, 0), P(-WALL_T, h, 0), P(-WALL_T, h, WALL_H), P(0, h, WALL_H)])
  fillStroke(c, '#e6d6bb', OUTLINE, 1.4)
  poly(c, [P(w, 0, 0), P(w, -WALL_T, 0), P(w, -WALL_T, WALL_H), P(w, 0, WALL_H)])
  fillStroke(c, '#d9c6a6', OUTLINE, 1.4)
  paintWindow(c, w)
  paintDoorAndPicture(c, h)

  poly(c, [P(0, 0), P(w, 0), P(w, h), P(0, h)])
  c.strokeStyle = OUTLINE
  c.lineWidth = 2
  c.stroke()
}

/** World-space bounds of the whole room picture. */
export function roomBounds(w: number, h: number) {
  return { minX: -h * 32 - 14, maxX: w * 32 + 14, minY: -WALL_H - 8, maxY: (w + h) * 16 + SLAB + 6 }
}

/** Back-to-front order: rugs first, then pieces behind before pieces in front. */
export function drawOrder<T extends FurniturePose>(pieces: T[]): T[] {
  const flat = pieces.filter((p) => FURNITURE_BY_ID[p.defId]?.flat)
  const standing = pieces.filter((p) => !FURNITURE_BY_ID[p.defId]?.flat)
  standing.sort((a, b) => {
    const A = furnitureFootprint(a)
    const B = furnitureFootprint(b)
    if (A.x + A.w <= B.x) return -1
    if (B.x + B.w <= A.x) return 1
    if (A.y + A.h <= B.y) return -1
    if (B.y + B.h <= A.y) return 1
    return A.x + A.y + (A.w + A.h) / 2 - (B.x + B.y + (B.w + B.h) / 2)
  })
  return [...flat, ...standing]
}

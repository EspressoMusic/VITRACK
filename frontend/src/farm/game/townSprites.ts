import type { ObjectLook, Point } from '../types'
import { drawHeart, isoBox } from './citySprites'
import { tileCenter, tileToWorld } from './iso'
import { LW, OUTLINE, blob, drawTree, ellipse, fillStroke, groundShadow, insetCorners, lerp, poly, shade, softFx, up } from './sprites'

/** Extra things for town sold in the shop: street furniture, fruit trees, sports and health buildings. Same style as sprites.ts. */

type Ctx = CanvasRenderingContext2D

export type TownLook = Extract<
  ObjectLook,
  {
    type:
      | 'fruitTree'
      | 'hedge'
      | 'pot'
      | 'waterTap'
      | 'mailbox'
      | 'bins'
      | 'bikes'
      | 'picnic'
      | 'cart'
      | 'hoop'
      | 'trampoline'
      | 'fountain'
      | 'statue'
      | 'clinic'
      | 'gym'
      | 'tower'
      | 'pool'
      | 'pitch'
      | 'market'
  }
>

/** A point `h` world units above tile coordinate (x, y). */
const at = (x: number, y: number, h = 0): Point => up(tileToWorld(x, y), h)

/** Picture extent around the footprint's ground center: half width, height above, depth below. */
export function townBounds(look: TownLook, w: number, h: number): { half: number; rise: number; below: number } {
  const full = { half: (w + h) * 16, below: (w + h) * 8 }
  switch (look.type) {
    case 'fruitTree':
      return { half: 28, rise: 52, below: 9 }
    case 'hedge':
      return { half: 28, rise: 26, below: 15 }
    case 'pot':
      return { half: 13, rise: 34, below: 6 }
    case 'waterTap':
      return { half: 13, rise: 38, below: 5 }
    case 'mailbox':
      return { half: 16, rise: 34, below: 5 }
    case 'bins':
      return { half: 22, rise: 24, below: 9 }
    case 'bikes':
      return { half: 24, rise: 26, below: 10 }
    case 'picnic':
      return { half: 26, rise: 24, below: 14 }
    case 'cart':
      return { half: 26, rise: 42, below: 14 }
    case 'hoop':
      return { half: 20, rise: 64, below: 7 }
    case 'trampoline':
      return { half: 21, rise: 20, below: 9 }
    case 'fountain':
      return { half: 22, rise: 36, below: 10 }
    case 'statue':
      return { half: 18, rise: 58, below: 10 }
    case 'clinic':
      return { ...full, rise: clinicHeight(look.floors) + 26 }
    case 'gym':
      return { ...full, rise: GYM_H + 26 }
    case 'tower':
      return { ...full, rise: towerHeight(look.floors) + 18 }
    case 'pool':
      return { ...full, rise: 40 }
    case 'pitch':
      return { ...full, rise: 20 }
    case 'market':
      return { ...full, rise: 40 }
  }
}

export function drawTownLook(ctx: Ctx, look: TownLook, x: number, y: number, w: number, h: number, t: number) {
  switch (look.type) {
    case 'fruitTree':
      return drawFruitTree(ctx, x, y, look.leaf, look.fruit, !!look.oval, t)
    case 'hedge':
      return drawHedge(ctx, x, y, look.leaf)
    case 'pot':
      return drawPot(ctx, x, y, look.color, look.bloom)
    case 'waterTap':
      return drawWaterTap(ctx, x, y)
    case 'mailbox':
      return drawMailbox(ctx, x, y)
    case 'bins':
      return drawBins(ctx, x, y)
    case 'bikes':
      return drawBikes(ctx, x, y)
    case 'picnic':
      return drawPicnic(ctx, x, y)
    case 'cart':
      return drawCart(ctx, x, y)
    case 'hoop':
      return drawHoop(ctx, x, y)
    case 'trampoline':
      return drawTrampoline(ctx, x, y)
    case 'fountain':
      return drawFountain(ctx, x, y, t)
    case 'statue':
      return drawStatue(ctx, x, y, look.figure)
    case 'clinic':
      return drawClinic(ctx, x, y, w, h, look.floors)
    case 'gym':
      return drawGym(ctx, x, y, w, h)
    case 'tower':
      return drawTower(ctx, x, y, w, h, look.wall, look.trim, look.floors)
    case 'pool':
      return drawPool(ctx, x, y, w, h, t)
    case 'pitch':
      return drawPitch(ctx, x, y, w, h)
    case 'market':
      return drawMarket(ctx, x, y, w, h)
  }
}

// ---------- small helpers ----------

function line(ctx: Ctx, a: Point, b: Point, color: string, width: number) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
}

/** A stick with a dark edge: the ink line underneath, the color on top. */
function stick(ctx: Ctx, a: Point, b: Point, color: string, width = 1.6) {
  line(ctx, a, b, OUTLINE, width + 1.6)
  line(ctx, a, b, color, width)
}

function bloom(ctx: Ctx, cx: number, cy: number, color: string) {
  ctx.fillStyle = color
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2
    ellipse(ctx, cx + Math.cos(a) * 1.9, cy + Math.sin(a) * 1.9, 1.5, 1.5)
    ctx.fill()
  }
  ellipse(ctx, cx, cy, 1.1, 1.1)
  ctx.fillStyle = '#ffcc33'
  ctx.fill()
}

function sparkle(g: Ctx, x: number, y: number, s: number) {
  g.beginPath()
  g.moveTo(x, y - s * 1.8)
  g.lineTo(x + s * 0.4, y - s * 0.4)
  g.lineTo(x + s * 1.8, y)
  g.lineTo(x + s * 0.4, y + s * 0.4)
  g.lineTo(x, y + s * 1.8)
  g.lineTo(x - s * 0.4, y + s * 0.4)
  g.lineTo(x - s * 1.8, y)
  g.lineTo(x - s * 0.4, y - s * 0.4)
  g.closePath()
  g.fillStyle = '#fff6c2'
  g.fill()
}

/** Striped flat canopy over x0..x1 × y0..y1, sloping down a little toward the front, with a scalloped front edge. */
function canopy(ctx: Ctx, x0: number, x1: number, y0: number, y1: number, hBack: number, hFront: number, colors: [string, string]) {
  const n = 5
  const P = (s: number, front: boolean) => at(x0 + s * (x1 - x0), front ? y1 : y0, front ? hFront : hBack)
  for (let i = 0; i < n; i++) {
    poly(ctx, [P(i / n, false), P((i + 1) / n, false), P((i + 1) / n, true), P(i / n, true)])
    fillStroke(ctx, colors[i % 2], null)
  }
  poly(ctx, [P(0, false), P(1, false), P(1, true), P(0, true)])
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = LW
  ctx.stroke()
  for (let i = 0; i < n; i++) {
    const p = lerp(P(i / n, true), P((i + 1) / n, true), 0.5)
    ctx.beginPath()
    ctx.arc(p.x, p.y, 2.4, 0, Math.PI)
    fillStroke(ctx, colors[i % 2], OUTLINE, 1)
  }
}

// ---------- garden ----------

const FRUIT_SPOTS: [number, number][] = [
  [-10, -27],
  [-2, -32],
  [8, -39],
  [11, -26],
  [-7, -41],
  [3, -24],
]

function drawFruitTree(ctx: Ctx, x: number, y: number, leaf: string, fruit: string, oval: boolean, t: number) {
  drawTree(ctx, x, y, leaf, t)
  const c = tileCenter(x, y)
  // the same sway as the leaves, so the fruit hangs on
  const sway = Math.sin(t * 1.2 + x * 0.7 + y) * 0.85
  for (const [dx, dy] of FRUIT_SPOTS) {
    const p = { x: c.x + dx + sway, y: c.y + dy }
    ellipse(ctx, p.x, p.y, oval ? 2.2 : 2.7, oval ? 3 : 2.7)
    fillStroke(ctx, fruit, OUTLINE, 0.8)
    ellipse(ctx, p.x - 0.8, p.y - 0.9, 0.8, 0.8)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fill()
  }
}

function drawHedge(ctx: Ctx, x: number, y: number, leaf: string) {
  groundShadow(ctx, tileCenter(x, y), 22, 9)
  isoBox(ctx, x + 0.1, x + 0.9, y + 0.1, y + 0.9, 0, 15, shade(leaf, 1.12), leaf, shade(leaf, 0.8), 1.3)
  ctx.fillStyle = shade(leaf, 1.3)
  for (const [u, v, hh] of [
    [0.3, 0.9, 9],
    [0.62, 0.9, 4.5],
    [0.9, 0.35, 10],
    [0.9, 0.68, 4],
    [0.4, 0.5, 15],
    [0.68, 0.3, 15],
    [0.25, 0.25, 15],
  ]) {
    const p = at(x + u, y + v, hh)
    ellipse(ctx, p.x, p.y, 2, 1.3)
    ctx.fill()
  }
}

function drawPot(ctx: Ctx, x: number, y: number, color: string, flower: string) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 11, 4.5)
  poly(ctx, [
    { x: c.x - 8, y: c.y - 13 },
    { x: c.x + 8, y: c.y - 13 },
    { x: c.x + 6, y: c.y + 1 },
    { x: c.x - 6, y: c.y + 1 },
  ])
  fillStroke(ctx, color)
  ctx.beginPath()
  ctx.roundRect(c.x - 9.5, c.y - 17, 19, 5, 1.6)
  fillStroke(ctx, shade(color, 1.15), OUTLINE, 1.2)
  blob(
    ctx,
    [
      [c.x - 6, c.y - 21, 5.5],
      [c.x + 6, c.y - 21, 5.5],
      [c.x, c.y - 26, 6.5],
    ],
    '#5cb85c',
  )
  for (const [dx, dy] of [
    [-5, -22],
    [4, -27],
    [6.5, -20],
    [-1, -30],
  ]) {
    bloom(ctx, c.x + dx, c.y + dy, flower)
  }
}

// ---------- street things ----------

function drawWaterTap(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 10, 4)
  ctx.beginPath()
  ctx.roundRect(c.x - 6, c.y - 3, 12, 4, 1.5)
  fillStroke(ctx, '#c9c3b6', OUTLINE, 1.1)
  ctx.beginPath()
  ctx.roundRect(c.x - 3.5, c.y - 22, 7, 20, 2)
  fillStroke(ctx, '#5b8def', OUTLINE, 1.2)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillRect(c.x - 2.2, c.y - 20, 1.4, 16)
  // basin
  ctx.beginPath()
  ctx.moveTo(c.x - 10, c.y - 24)
  ctx.quadraticCurveTo(c.x, c.y - 13, c.x + 10, c.y - 24)
  ctx.closePath()
  fillStroke(ctx, '#e3edf5', OUTLINE, 1.2)
  ellipse(ctx, c.x, c.y - 24, 10, 3.6)
  fillStroke(ctx, '#e3edf5', OUTLINE, 1.2)
  ellipse(ctx, c.x, c.y - 24, 7.4, 2.4)
  ctx.fillStyle = '#6cc7ec'
  ctx.fill()
  // spout and its little arc of water
  ctx.beginPath()
  ctx.roundRect(c.x + 4, c.y - 31, 2.6, 7, 1)
  fillStroke(ctx, '#9aa7b3', OUTLINE, 0.9)
  softFx(ctx, 'over', (g) => {
    g.strokeStyle = 'rgba(140,215,250,0.95)'
    g.lineWidth = 1.6
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(c.x + 5.3, c.y - 31)
    g.quadraticCurveTo(c.x + 3, c.y - 38, c.x - 0.5, c.y - 25)
    g.stroke()
  })
}

function drawMailbox(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 9, 4)
  ctx.beginPath()
  ctx.roundRect(c.x - 1.7, c.y - 16, 3.4, 17, 1)
  fillStroke(ctx, '#8a5a33', OUTLINE, 1.1)
  ctx.beginPath()
  ctx.moveTo(c.x - 8, c.y - 15)
  ctx.lineTo(c.x - 8, c.y - 23)
  ctx.arc(c.x, c.y - 23, 8, Math.PI, 0)
  ctx.lineTo(c.x + 8, c.y - 15)
  ctx.closePath()
  fillStroke(ctx, '#5b8def')
  ctx.beginPath()
  ctx.roundRect(c.x - 4.5, c.y - 25, 9, 1.8, 0.9)
  ctx.fillStyle = OUTLINE
  ctx.fill()
  ellipse(ctx, c.x - 4, c.y - 28, 2, 1.2, -0.4)
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fill()
  // the red flag is up: there's mail
  ctx.beginPath()
  ctx.roundRect(c.x + 8, c.y - 30, 1.8, 11, 0.6)
  fillStroke(ctx, '#d9534a', OUTLINE, 0.8)
  ctx.beginPath()
  ctx.roundRect(c.x + 9.6, c.y - 30, 5, 3.8, 0.6)
  fillStroke(ctx, '#e8443a', OUTLINE, 0.8)
}

function drawBins(ctx: Ctx, x: number, y: number) {
  groundShadow(ctx, tileCenter(x, y), 20, 8)
  ;['#5b8def', '#7ac74f', '#ffcf4a'].forEach((color, i) => {
    const p = tileToWorld(x + 0.22 + i * 0.28, y + 0.5)
    ctx.beginPath()
    ctx.roundRect(p.x - 5.5, p.y - 14, 11, 14, 1.8)
    fillStroke(ctx, color, OUTLINE, 1.1)
    ctx.beginPath()
    ctx.roundRect(p.x - 6.5, p.y - 17.5, 13, 4, 1.4)
    fillStroke(ctx, shade(color, 0.78), OUTLINE, 1)
    // recycling mark: a small white ring of arrows, simplified to a ring
    ellipse(ctx, p.x, p.y - 7.5, 2.6, 2.6)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.2
    ctx.stroke()
  })
}

function drawBike(ctx: Ctx, p: Point, color: string) {
  const r = 5
  const rear = { x: p.x - 7, y: p.y - r }
  const front = { x: p.x + 7, y: p.y - r }
  for (const wheel of [rear, front]) {
    ellipse(ctx, wheel.x, wheel.y, r, r)
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 2.2
    ctx.stroke()
    ellipse(ctx, wheel.x, wheel.y, r - 1.6, r - 1.6)
    ctx.strokeStyle = '#c9c3b6'
    ctx.lineWidth = 0.7
    ctx.stroke()
  }
  const seat = { x: p.x - 2.5, y: p.y - 13 }
  const bar = { x: p.x + 4.5, y: p.y - 14 }
  const pedal = { x: p.x, y: p.y - r }
  for (const [w, c] of [
    [3.4, OUTLINE],
    [1.8, color],
  ] as const) {
    ctx.strokeStyle = c
    ctx.lineWidth = w
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(rear.x, rear.y)
    ctx.lineTo(seat.x, seat.y)
    ctx.lineTo(pedal.x, pedal.y)
    ctx.closePath()
    ctx.moveTo(seat.x, seat.y)
    ctx.lineTo(bar.x, bar.y)
    ctx.lineTo(front.x, front.y)
    ctx.moveTo(pedal.x, pedal.y)
    ctx.lineTo(bar.x, bar.y)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.roundRect(seat.x - 3, seat.y - 2.2, 6, 2.2, 1)
  ctx.fillStyle = OUTLINE
  ctx.fill()
  line(ctx, bar, { x: bar.x + 2.5, y: bar.y - 2.5 }, OUTLINE, 1.8)
}

function drawBikes(ctx: Ctx, x: number, y: number) {
  groundShadow(ctx, tileCenter(x, y), 20, 8)
  drawBike(ctx, tileToWorld(x + 0.5, y + 0.2), '#e8604c')
  drawBike(ctx, tileToWorld(x + 0.38, y + 0.72), '#5bc0eb')
}

function drawPicnic(ctx: Ctx, x: number, y: number) {
  groundShadow(ctx, tileCenter(x, y), 22, 9)
  const bench = (v0: number, v1: number) => isoBox(ctx, x + 0.16, x + 0.84, y + v0, y + v1, 0, 6, '#d9a35c', '#c48a4f', '#a8703f', 1.1)
  bench(0.12, 0.24)
  for (const u of [0.3, 0.7]) stick(ctx, at(x + u, y + 0.5), at(x + u, y + 0.5, 10), '#a8703f', 1.8)
  const cloth = '#e8604c'
  isoBox(ctx, x + 0.22, x + 0.78, y + 0.32, y + 0.68, 10, 12.5, cloth, shade(cloth, 0.85), shade(cloth, 0.7), 1.2)
  // checkered cloth
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  for (const u of [0.36, 0.5, 0.64]) {
    const a = at(x + u, y + 0.33, 12.5)
    const b = at(x + u, y + 0.67, 12.5)
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  }
  for (const v of [0.44, 0.56]) {
    const a = at(x + 0.23, y + v, 12.5)
    const b = at(x + 0.77, y + v, 12.5)
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  }
  ctx.stroke()
  // a bowl of fruit
  const m = at(x + 0.5, y + 0.5, 12.5)
  for (const [dx, dy, color] of [
    [-2.5, -3.2, '#e8443a'],
    [2.2, -3.6, '#7ac74f'],
    [0, -5.4, '#ffb33f'],
  ] as const) {
    ellipse(ctx, m.x + dx, m.y + dy, 2.2, 2.2)
    fillStroke(ctx, color, OUTLINE, 0.8)
  }
  ctx.beginPath()
  ctx.ellipse(m.x, m.y - 2.2, 5.5, 3, 0, 0, Math.PI)
  ctx.closePath()
  fillStroke(ctx, '#ffffff', OUTLINE, 0.9)
  bench(0.76, 0.88)
}

function drawCart(ctx: Ctx, x: number, y: number) {
  groundShadow(ctx, tileCenter(x, y), 22, 9)
  const x0 = x + 0.2
  const x1 = x + 0.8
  const y0 = y + 0.3
  const y1 = y + 0.7
  const H = 32
  stick(ctx, at(x0 + 0.03, y0 + 0.03, 15), at(x0 + 0.03, y0 + 0.03, H), '#8a5a33', 1.3)
  stick(ctx, at(x1 - 0.03, y0 + 0.03, 15), at(x1 - 0.03, y0 + 0.03, H), '#8a5a33', 1.3)
  isoBox(ctx, x0, x1, y0, y1, 6, 16, '#a8703f', '#d9a35c', '#c48a4f', 1.2)
  // handle
  stick(ctx, at(x1, y + 0.5, 13), at(x1 + 0.22, y + 0.5, 15), '#8a5a33', 1.6)
  // produce piled on top
  for (const [u, v, color, r] of [
    [0.3, 0.4, '#e8443a', 2.6],
    [0.44, 0.38, '#e8443a', 2.6],
    [0.62, 0.4, '#7ac74f', 3],
    [0.32, 0.58, '#f28c28', 2.4],
    [0.48, 0.58, '#ffcf4a', 2.6],
    [0.66, 0.6, '#f28c28', 2.4],
  ] as const) {
    const p = at(x + u, y + v, 17.5)
    ellipse(ctx, p.x, p.y, r, r * 0.9)
    fillStroke(ctx, color, OUTLINE, 0.8)
  }
  // wheel on the front side
  const w = at(x + 0.4, y1, 6)
  ellipse(ctx, w.x, w.y, 6, 6)
  fillStroke(ctx, '#8a5a33', OUTLINE, 1.2)
  ctx.strokeStyle = '#d9a35c'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI
    ctx.moveTo(w.x - Math.cos(a) * 4.4, w.y - Math.sin(a) * 4.4)
    ctx.lineTo(w.x + Math.cos(a) * 4.4, w.y + Math.sin(a) * 4.4)
  }
  ctx.stroke()
  ellipse(ctx, w.x, w.y, 1.4, 1.4)
  fillStroke(ctx, '#5a3a20', OUTLINE, 0.7)
  stick(ctx, at(x0 + 0.03, y1 - 0.03, 15), at(x0 + 0.03, y1 - 0.03, H - 2), '#8a5a33', 1.3)
  stick(ctx, at(x1 - 0.03, y1 - 0.03, 15), at(x1 - 0.03, y1 - 0.03, H - 2), '#8a5a33', 1.3)
  canopy(ctx, x0 - 0.06, x1 + 0.06, y0 - 0.04, y1 + 0.06, H, H - 3, ['#ff8fab', '#ffffff'])
}

function drawHoop(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 12, 5)
  const pole = { x: c.x + 8, y: c.y - 1 }
  ellipse(ctx, pole.x, pole.y, 6, 2.6)
  fillStroke(ctx, '#5f6b7a', OUTLINE, 1)
  ctx.beginPath()
  ctx.roundRect(pole.x - 2, pole.y - 47, 4, 47, 1.5)
  fillStroke(ctx, '#7a8494', OUTLINE, 1.1)
  ctx.beginPath()
  ctx.roundRect(pole.x - 10, pole.y - 46, 10, 3, 1)
  fillStroke(ctx, '#7a8494', OUTLINE, 1)
  // backboard
  ctx.beginPath()
  ctx.roundRect(c.x - 16, c.y - 62, 22, 16, 2)
  fillStroke(ctx, '#ffffff', OUTLINE, 1.3)
  ctx.strokeStyle = '#e8604c'
  ctx.lineWidth = 1.2
  ctx.strokeRect(c.x - 9, c.y - 55, 8, 6)
  // net under the rim
  const rim = { x: c.x - 5, y: c.y - 46 }
  ctx.beginPath()
  ctx.moveTo(rim.x - 5.5, rim.y)
  ctx.lineTo(rim.x - 3.5, rim.y + 8)
  ctx.lineTo(rim.x + 3.5, rim.y + 8)
  ctx.lineTo(rim.x + 5.5, rim.y)
  ctx.closePath()
  fillStroke(ctx, 'rgba(255,255,255,0.9)', OUTLINE, 0.9)
  ctx.strokeStyle = '#c9c3b6'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  for (const k of [-1, 0, 1]) {
    ctx.moveTo(rim.x + k * 3.5, rim.y + 0.5)
    ctx.lineTo(rim.x + k * 2.2, rim.y + 7.5)
  }
  ctx.stroke()
  ellipse(ctx, rim.x, rim.y, 6, 2)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.strokeStyle = '#e8604c'
  ctx.lineWidth = 1.6
  ctx.stroke()
  // ball resting on the ground
  const b = { x: c.x - 9, y: c.y - 2 }
  ellipse(ctx, b.x, b.y, 4.4, 4.4)
  fillStroke(ctx, '#f28c28', OUTLINE, 1)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 0.7
  ctx.beginPath()
  ctx.moveTo(b.x - 4.4, b.y)
  ctx.lineTo(b.x + 4.4, b.y)
  ctx.moveTo(b.x, b.y - 4.4)
  ctx.lineTo(b.x, b.y + 4.4)
  ctx.stroke()
}

function drawTrampoline(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 19, 8)
  const top = c.y - 9
  const rx = 18
  const ry = 8.5
  for (const dx of [-13, 0, 13]) {
    const ly = top + ry * Math.sqrt(1 - (dx / rx) ** 2)
    ctx.beginPath()
    ctx.roundRect(c.x + dx - 1.5, ly - 2, 3, 10, 1)
    fillStroke(ctx, '#5f6b7a', OUTLINE, 1)
  }
  ellipse(ctx, c.x, top, rx, ry)
  fillStroke(ctx, '#5b8def', OUTLINE, 1.4)
  ellipse(ctx, c.x, top, rx - 3.5, ry - 2)
  fillStroke(ctx, '#2f3442', OUTLINE, 0.9)
  ellipse(ctx, c.x - 4, top - 2, 6, 1.6)
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fill()
}

function drawFountain(ctx: Ctx, x: number, y: number, t: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 21, 9)
  const rx = 18
  const ry = 9
  const H = 7
  ctx.beginPath()
  ctx.moveTo(c.x - rx, c.y - H)
  ctx.lineTo(c.x - rx, c.y)
  ctx.ellipse(c.x, c.y, rx, ry, 0, Math.PI, 0, true)
  ctx.lineTo(c.x + rx, c.y - H)
  ctx.ellipse(c.x, c.y - H, rx, ry, 0, 0, Math.PI)
  ctx.closePath()
  fillStroke(ctx, '#cfcabe', OUTLINE, 1.3)
  ellipse(ctx, c.x, c.y - H, rx, ry)
  fillStroke(ctx, '#e3dfd4', OUTLINE, 1.2)
  ellipse(ctx, c.x, c.y - H + 0.5, rx - 3.5, ry - 2.2)
  ctx.fillStyle = '#6cc7ec'
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(c.x - 2.4, c.y - 26, 4.8, 20, 1.5)
  fillStroke(ctx, '#e3dfd4', OUTLINE, 1.1)
  ctx.beginPath()
  ctx.moveTo(c.x - 8, c.y - 26)
  ctx.quadraticCurveTo(c.x, c.y - 17, c.x + 8, c.y - 26)
  ctx.closePath()
  fillStroke(ctx, '#e3dfd4', OUTLINE, 1)
  ellipse(ctx, c.x, c.y - 26, 8, 3)
  fillStroke(ctx, '#e3dfd4', OUTLINE, 1)
  ellipse(ctx, c.x, c.y - 26, 5.6, 1.9)
  ctx.fillStyle = '#6cc7ec'
  ctx.fill()
  softFx(ctx, 'over', (g) => {
    ellipse(g, c.x, c.y - 30, 1.8, 3.4)
    g.fillStyle = 'rgba(160,225,250,0.95)'
    g.fill()
    for (let i = 0; i < 6; i++) {
      const side = i % 2 ? 1 : -1
      const k = (t * 0.8 + i / 6) % 1
      ellipse(g, c.x + side * (3 + k * 10), c.y - 30 + k * 23 - Math.sin(k * Math.PI) * 6, 1.5, 1.5)
      g.fillStyle = `rgba(160,225,250,${1 - k * 0.5})`
      g.fill()
    }
  })
}

function drawStatue(ctx: Ctx, x: number, y: number, figure: 'carrot' | 'heart') {
  groundShadow(ctx, tileCenter(x, y), 17, 7)
  isoBox(ctx, x + 0.24, x + 0.76, y + 0.24, y + 0.76, 0, 5, '#e3dfd4', '#cfcabe', '#b9b4a6', 1.2)
  isoBox(ctx, x + 0.32, x + 0.68, y + 0.32, y + 0.68, 5, 18, '#f3efe6', '#e3dfd4', '#cfcabe', 1.2)
  const p = at(x + 0.5, y + 0.5, 18)
  if (figure === 'carrot') {
    for (const [dx, a] of [
      [-3.2, -0.45],
      [0, 0],
      [3.2, 0.45],
    ]) {
      ellipse(ctx, p.x + dx, p.y - 33, 2.2, 6.5, a)
      fillStroke(ctx, '#c9d84a', OUTLINE, 1)
    }
    ctx.beginPath()
    ctx.moveTo(p.x - 7.5, p.y - 27)
    ctx.quadraticCurveTo(p.x, p.y - 31, p.x + 7.5, p.y - 27)
    ctx.quadraticCurveTo(p.x + 4.5, p.y - 10, p.x, p.y - 1)
    ctx.quadraticCurveTo(p.x - 4.5, p.y - 10, p.x - 7.5, p.y - 27)
    ctx.closePath()
    fillStroke(ctx, '#f5c542')
    ctx.strokeStyle = '#d99a1e'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (const [yy, half] of [
      [-20, 3],
      [-14, 2.4],
      [-8, 1.6],
    ]) {
      ctx.moveTo(p.x - half, p.y + yy)
      ctx.lineTo(p.x + half * 0.2, p.y + yy + 0.8)
    }
    ctx.stroke()
    ellipse(ctx, p.x - 3, p.y - 21, 1.2, 3.6, 0.2)
  } else {
    drawHeart(ctx, p.x, p.y - 11, 10, '#ff7aa8')
    ellipse(ctx, p.x - 4.5, p.y - 14, 1.6, 2.6, -0.6)
  }
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fill()
  softFx(ctx, 'over', (g) => {
    sparkle(g, p.x + 10, p.y - 28, 2.4)
    sparkle(g, p.x - 11, p.y - 15, 1.7)
  })
}

// ---------- buildings ----------

/** Front (street-facing) wall of a box over x0..x1 at y1, and the right wall at x1. `s` runs 0..1 along it. */
function faces(x0: number, x1: number, y0: number, y1: number) {
  return {
    F: (s: number, hh: number) => at(x0 + s * (x1 - x0), y1, hh),
    G: (s: number, hh: number) => at(x1, y1 - s * (y1 - y0), hh),
  }
}

function pane(ctx: Ctx, side: (s: number, hh: number) => Point, s0: number, s1: number, h0: number, h1: number, fill: string, lw = 1.1) {
  poly(ctx, [side(s0, h0), side(s1, h0), side(s1, h1), side(s0, h1)])
  fillStroke(ctx, fill, OUTLINE, lw)
}

const CLINIC_FLOOR = 17
const clinicHeight = (floors: number) => 10 + floors * CLINIC_FLOOR

function drawClinic(ctx: Ctx, x: number, y: number, w: number, h: number, floors: number) {
  const x0 = x + 0.12
  const x1 = x + w - 0.12
  const y0 = y + 0.12
  const y1 = y + h - 0.34
  const H = clinicHeight(floors)
  const c = tileCenter(x, y, w, h)
  groundShadow(ctx, { x: c.x + 4, y: c.y }, w * 26, h * 11)
  isoBox(ctx, x0, x1, y0, y1, 0, H, '#dfe7ee', '#ffffff', '#e3eaf1')
  const { F, G } = faces(x0, x1, y0, y1)
  // mint band under the roof
  poly(ctx, [F(0, H - 5), F(1, H - 5), F(1, H), F(0, H)])
  fillStroke(ctx, '#7fd1b9', null)
  poly(ctx, [G(0, H - 5), G(1, H - 5), G(1, H), G(0, H)])
  fillStroke(ctx, shade('#7fd1b9', 0.85), null)
  for (let f = 0; f < floors; f++) {
    const b = 6 + f * CLINIC_FLOOR
    const front: [number, number][] = f === 0 ? [[0.08, 0.26], [0.74, 0.92]] : [[0.08, 0.26], [0.41, 0.59], [0.74, 0.92]]
    for (const [a, z] of front) pane(ctx, F, a, z, b, b + 9, '#bfe6ff')
    for (const [a, z] of [[0.14, 0.4], [0.6, 0.86]]) pane(ctx, G, a, z, b, b + 9, '#a9d6f2')
  }
  // sliding glass door with a little roof
  pane(ctx, F, 0.38, 0.62, 0, 14, '#d8f0ff', 1.2)
  line(ctx, F(0.5, 0.5), F(0.5, 13.5), '#9cc7e0', 1)
  const s0 = x0 + 0.34 * (x1 - x0)
  const s1 = x0 + 0.66 * (x1 - x0)
  poly(ctx, [F(0.34, 16), F(0.66, 16), at(s1, y1 + 0.2, 16), at(s0, y1 + 0.2, 16)])
  fillStroke(ctx, '#7fd1b9', OUTLINE, 1.1)
  if (floors >= 2) {
    // helipad on the roof
    const m = at((x0 + x1) / 2, (y0 + y1) / 2, H)
    ellipse(ctx, m.x, m.y, 15, 7.5)
    fillStroke(ctx, '#9aa7b3', OUTLINE, 1)
    ellipse(ctx, m.x, m.y, 12, 6)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.2
    ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 8px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('H', m.x, m.y + 0.5)
  }
  // red cross sign standing on the roof's front edge
  const sp = F(0.5, H)
  ctx.beginPath()
  ctx.roundRect(sp.x - 9, sp.y - 20, 18, 17, 3)
  fillStroke(ctx, '#ffffff', OUTLINE, 1.4)
  ctx.fillStyle = '#e8443a'
  ctx.fillRect(sp.x - 2.3, sp.y - 17.3, 4.6, 11.6)
  ctx.fillRect(sp.x - 5.8, sp.y - 13.8, 11.6, 4.6)
}

const GYM_H = 30

function drawGym(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const x0 = x + 0.1
  const x1 = x + w - 0.1
  const y0 = y + 0.1
  const y1 = y + h - 0.4
  const H = GYM_H
  const c = tileCenter(x, y, w, h)
  groundShadow(ctx, { x: c.x + 4, y: c.y }, w * 26, h * 11)
  isoBox(ctx, x0, x1, y0, y1, 0, H, '#46526a', '#f4f7fb', '#dde4ee')
  const { F, G } = faces(x0, x1, y0, y1)
  poly(ctx, [F(0, H - 7), F(1, H - 7), F(1, H), F(0, H)])
  fillStroke(ctx, '#ff8a3d', null)
  poly(ctx, [G(0, H - 7), G(1, H - 7), G(1, H), G(0, H)])
  fillStroke(ctx, shade('#ff8a3d', 0.85), null)
  // big front window with a treadmill and a ball inside
  pane(ctx, F, 0.06, 0.6, 4, H - 10, '#bfe6ff', 1.2)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.1
  ctx.beginPath()
  for (const s of [0.24, 0.42]) {
    const a = F(s, 4.5)
    const b = F(s, H - 10.5)
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  }
  ctx.stroke()
  const ball = F(0.5, 8.5)
  ellipse(ctx, ball.x, ball.y, 3.2, 3.2)
  fillStroke(ctx, '#ff8fab', OUTLINE, 0.8)
  const tread = F(0.14, 5)
  poly(ctx, [tread, F(0.21, 5), F(0.21, 7), F(0.14, 7)])
  fillStroke(ctx, '#46526a', null)
  line(ctx, F(0.205, 7), F(0.205, 13), '#46526a', 1.2)
  // door
  pane(ctx, F, 0.7, 0.9, 0, H * 0.62, '#ff8a3d', 1.2)
  pane(ctx, F, 0.74, 0.86, H * 0.3, H * 0.54, '#d8f0ff', 0.9)
  for (const [a, z] of [[0.18, 0.42], [0.58, 0.82]]) pane(ctx, G, a, z, H * 0.3, H * 0.62, '#a9d6f2')
  // a giant dumbbell on the roof
  const m = at((x0 + x1) / 2, (y0 + y1) / 2, H)
  for (const dx of [-6, 6]) stick(ctx, { x: m.x + dx, y: m.y }, { x: m.x + dx, y: m.y - 11 }, '#9aa7b3', 1.6)
  ctx.beginPath()
  ctx.roundRect(m.x - 15, m.y - 14, 30, 3.6, 1.5)
  fillStroke(ctx, '#c9d2dc', OUTLINE, 1.1)
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.roundRect(m.x + side * 11 - 2.6, m.y - 21.5, 5.2, 17.5, 2)
    fillStroke(ctx, '#2f3442', OUTLINE, 1.1)
    ctx.beginPath()
    ctx.roundRect(m.x + side * 15.5 - 2, m.y - 18.5, 4, 11.5, 1.5)
    fillStroke(ctx, '#ff8a3d', OUTLINE, 1)
  }
}

const TOWER_FLOOR = 15
const towerHeight = (floors: number) => 6 + floors * TOWER_FLOOR

function drawTower(ctx: Ctx, x: number, y: number, w: number, h: number, wall: string, trim: string, floors: number) {
  const x0 = x + 0.16
  const x1 = x + w - 0.16
  const y0 = y + 0.16
  const y1 = y + h - 0.22
  const H = towerHeight(floors)
  const c = tileCenter(x, y, w, h)
  groundShadow(ctx, { x: c.x + 6, y: c.y + 2 }, w * 26, h * 11)
  isoBox(ctx, x0, x1, y0, y1, 0, H, shade(wall, 0.9), wall, shade(wall, 0.8))
  const { F, G } = faces(x0, x1, y0, y1)
  for (let f = 0; f < floors; f++) {
    const b = 4 + f * TOWER_FLOOR
    const front: [number, number][] = f === 0 ? [[0.08, 0.26], [0.74, 0.92]] : [[0.08, 0.26], [0.41, 0.59], [0.74, 0.92]]
    for (const [a, z] of front) pane(ctx, F, a, z, b, b + 9, '#bfe6ff')
    for (const [a, z] of [[0.14, 0.38], [0.62, 0.86]]) pane(ctx, G, a, z, b, b + 9, '#a9d6f2')
    if (f > 0) {
      // balcony with a flower box
      pane(ctx, F, 0.37, 0.63, b - 1.5, b + 3, trim, 1)
      const fl = F(0.44, b + 4)
      bloom(ctx, fl.x, fl.y, '#ff7aa8')
    }
  }
  pane(ctx, F, 0.41, 0.59, 0, 12, shade(trim, 0.8), 1.2)
  // roof rim and a water tank
  poly(ctx, [F(0, H - 3), F(1, H - 3), F(1, H), F(0, H)])
  fillStroke(ctx, trim, null)
  poly(ctx, [G(0, H - 3), G(1, H - 3), G(1, H), G(0, H)])
  fillStroke(ctx, shade(trim, 0.85), null)
  const tank = at(x0 + (x1 - x0) * 0.62, y0 + (y1 - y0) * 0.35, H)
  ctx.beginPath()
  ctx.roundRect(tank.x - 5.5, tank.y - 11, 11, 11, 2)
  fillStroke(ctx, '#c9c3b6', OUTLINE, 1.1)
  ellipse(ctx, tank.x, tank.y - 11, 5.5, 2.2)
  fillStroke(ctx, '#e3dfd4', OUTLINE, 1)
  const ant = at(x0 + (x1 - x0) * 0.3, y0 + (y1 - y0) * 0.4, H)
  line(ctx, ant, { x: ant.x, y: ant.y - 14 }, OUTLINE, 1.4)
  ellipse(ctx, ant.x, ant.y - 15, 1.6, 1.6)
  fillStroke(ctx, '#e8443a', OUTLINE, 0.7)
}

function drawPool(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  const o = insetCorners(x, y, w, h, 0.96)
  const D = 4
  poly(ctx, [o.L, o.B, up(o.B, D), up(o.L, D)])
  fillStroke(ctx, '#d9d1c0')
  poly(ctx, [o.B, o.R, up(o.R, D), up(o.B, D)])
  fillStroke(ctx, '#c4bcab')
  poly(ctx, [up(o.T, D), up(o.R, D), up(o.B, D), up(o.L, D)])
  fillStroke(ctx, '#f3efe6')
  const i = insetCorners(x, y, w, h, 0.7)
  const W = [i.T, i.R, i.B, i.L].map((p) => up(p, D))
  poly(ctx, W)
  fillStroke(ctx, '#4fb8e0', OUTLINE, 1.2)
  // the far walls of the pool, seen through the water
  poly(ctx, [W[3], W[0], W[1], lerp(W[1], up(i.mid, D), 0.14), lerp(W[0], up(i.mid, D), 0.14), lerp(W[3], up(i.mid, D), 0.14)])
  fillStroke(ctx, '#3a9cc4', null)
  // ripples
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'
  ctx.lineWidth = 1.2
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (const [u, v] of [
    [0.35, 0.45],
    [0.6, 0.6],
    [0.45, 0.72],
  ]) {
    const p = up(lerp(lerp(i.T, i.R, u), lerp(i.L, i.B, u), v), D)
    const dx = Math.sin(t * 1.4 + u * 9) * 2
    ctx.moveTo(p.x - 5 + dx, p.y)
    ctx.quadraticCurveTo(p.x + dx, p.y - 2, p.x + 5 + dx, p.y)
  }
  ctx.stroke()
  // a swim ring bobbing on the water
  const ring = up(lerp(i.mid, i.T, 0.2), D - Math.sin(t * 1.6) * 0.8)
  ellipse(ctx, ring.x, ring.y, 7, 3.4)
  fillStroke(ctx, '#ff6b6b', OUTLINE, 1)
  ellipse(ctx, ring.x, ring.y, 3.2, 1.4)
  ctx.fillStyle = '#4fb8e0'
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(ring.x - 6.4, ring.y - 1)
  ctx.lineTo(ring.x - 4.2, ring.y - 0.6)
  ctx.moveTo(ring.x + 4.2, ring.y + 0.6)
  ctx.lineTo(ring.x + 6.4, ring.y + 1)
  ctx.stroke()
  // ladder on the right edge
  const lad = up(lerp(i.B, i.R, 0.5), D)
  for (const dx of [-3, 3]) {
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 2.6
    ctx.beginPath()
    ctx.moveTo(lad.x + dx, lad.y + 2)
    ctx.lineTo(lad.x + dx, lad.y - 9)
    ctx.quadraticCurveTo(lad.x + dx, lad.y - 12, lad.x + dx + 3, lad.y - 11)
    ctx.stroke()
    ctx.strokeStyle = '#dfe6ee'
    ctx.lineWidth = 1.2
    ctx.stroke()
  }
  // umbrella and a sun lounger on the left deck
  const spot = up(lerp(i.L, o.L, 0.45), D)
  ctx.beginPath()
  ctx.roundRect(spot.x - 2, spot.y + 1, 14, 4, 1.5)
  fillStroke(ctx, '#ffcf4a', OUTLINE, 1)
  stick(ctx, spot, { x: spot.x, y: spot.y - 26 }, '#ffffff', 1.2)
  for (let k = 0; k < 4; k++) {
    const a0 = Math.PI + (k / 4) * Math.PI
    const a1 = Math.PI + ((k + 1) / 4) * Math.PI
    ctx.beginPath()
    ctx.moveTo(spot.x, spot.y - 32)
    ctx.lineTo(spot.x + Math.cos(a0) * -14, spot.y - 24 + Math.sin(a0) * -2)
    ctx.lineTo(spot.x + Math.cos(a1) * -14, spot.y - 24 + Math.sin(a1) * -2)
    ctx.closePath()
    fillStroke(ctx, k % 2 ? '#ffffff' : '#5bc0eb', OUTLINE, 1)
  }
}

function drawPitch(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const o = insetCorners(x, y, w, h, 0.97)
  poly(ctx, [o.T, o.R, o.B, o.L])
  fillStroke(ctx, '#5fb84f', OUTLINE, 1.4)
  for (let k = 0; k < 6; k += 2) {
    poly(ctx, [lerp(o.T, o.R, k / 6), lerp(o.T, o.R, (k + 1) / 6), lerp(o.L, o.B, (k + 1) / 6), lerp(o.L, o.B, k / 6)])
    fillStroke(ctx, '#6cc75a', null)
  }
  const i = insetCorners(x, y, w, h, 0.84)
  // u runs along the field (goal to goal), v across it
  const P = (u: number, v: number, hh = 0): Point => up(lerp(lerp(i.T, i.R, u), lerp(i.L, i.B, u), v), hh)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  // the touchlines, then the two goal boxes
  for (const [k, pts] of [
    [P(0, 0), P(1, 0), P(1, 1), P(0, 1)],
    [P(0, 0.3), P(0.16, 0.3), P(0.16, 0.7), P(0, 0.7)],
    [P(1, 0.3), P(0.84, 0.3), P(0.84, 0.7), P(1, 0.7)],
  ].entries()) {
    ctx.moveTo(pts[0].x, pts[0].y)
    for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y)
    if (k === 0) ctx.closePath()
  }
  const m0 = P(0.5, 0)
  const m1 = P(0.5, 1)
  ctx.moveTo(m0.x, m0.y)
  ctx.lineTo(m1.x, m1.y)
  ctx.stroke()
  ellipse(ctx, i.mid.x, i.mid.y, 11, 5.5)
  ctx.stroke()
  const goal = (u: number) => {
    const a = P(u, 0.38)
    const b = P(u, 0.62)
    poly(ctx, [a, b, up(b, 12), up(a, 12)])
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fill()
    stick(ctx, a, up(a, 12), '#ffffff', 1.6)
    stick(ctx, b, up(b, 12), '#ffffff', 1.6)
    stick(ctx, up(a, 12), up(b, 12), '#ffffff', 1.6)
  }
  goal(0)
  // the ball on the center spot
  ellipse(ctx, i.mid.x + 4, i.mid.y - 3, 3.2, 3.2)
  fillStroke(ctx, '#ffffff', OUTLINE, 1)
  ellipse(ctx, i.mid.x + 4, i.mid.y - 3, 1.1, 1.1)
  ctx.fillStyle = OUTLINE
  ctx.fill()
  goal(1)
}

function drawStall(ctx: Ctx, sx: number, sy: number, awning: [string, string], produce: string[]) {
  const x1 = sx + 0.62
  const y1 = sy + 0.42
  const H = 30
  stick(ctx, at(sx, sy, 9), at(sx, sy, H), '#8a5a33', 1.2)
  stick(ctx, at(x1, sy, 9), at(x1, sy, H), '#8a5a33', 1.2)
  isoBox(ctx, sx, x1, sy, y1, 0, 10, '#d9a35c', '#c48a4f', '#a8703f', 1.2)
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 2; b++) {
      const p = at(sx + 0.12 + a * 0.19, sy + 0.12 + b * 0.18, 11.5)
      ellipse(ctx, p.x, p.y, 2.4, 2.2)
      fillStroke(ctx, produce[(a + b) % produce.length], OUTLINE, 0.7)
    }
  }
  stick(ctx, at(sx, y1, 9), at(sx, y1, H - 3), '#8a5a33', 1.2)
  stick(ctx, at(x1, y1, 9), at(x1, y1, H - 3), '#8a5a33', 1.2)
  canopy(ctx, sx - 0.05, x1 + 0.05, sy - 0.05, y1 + 0.08, H, H - 3, awning)
}

function drawMarket(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const o = insetCorners(x, y, w, h, 0.94)
  poly(ctx, [o.T, o.R, o.B, o.L])
  fillStroke(ctx, '#efe2c2', OUTLINE, 1.3)
  ctx.strokeStyle = '#ddcca6'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (const f of [0.25, 0.5, 0.75]) {
    for (const [a, b] of [
      [lerp(o.T, o.L, f), lerp(o.R, o.B, f)],
      [lerp(o.T, o.R, f), lerp(o.L, o.B, f)],
    ]) {
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    }
  }
  ctx.stroke()
  drawStall(ctx, x + 0.2, y + 0.2, ['#e8604c', '#ffffff'], ['#e8443a', '#ffb33f', '#7ac74f'])
  drawStall(ctx, x + 1.12, y + 0.3, ['#7ac74f', '#ffffff'], ['#7ac74f', '#f28c28', '#ffe14d'])
  drawStall(ctx, x + 0.3, y + 1.18, ['#5b8def', '#ffe48a'], ['#ef3b52', '#b78cff', '#7ac74f'])
  // baskets of apples by the front stall
  for (const [u, v] of [
    [1.36, 1.3],
    [1.62, 1.5],
  ]) {
    const p = at(x + u, y + v)
    ctx.beginPath()
    ctx.moveTo(p.x - 6, p.y - 7)
    ctx.lineTo(p.x + 6, p.y - 7)
    ctx.lineTo(p.x + 4.5, p.y)
    ctx.lineTo(p.x - 4.5, p.y)
    ctx.closePath()
    fillStroke(ctx, '#c48a4f', OUTLINE, 1)
    for (const dx of [-2.8, 0, 2.8]) {
      ellipse(ctx, p.x + dx, p.y - 8, 2.2, 2.2)
      fillStroke(ctx, u > 1.5 ? '#7ac74f' : '#e8443a', OUTLINE, 0.7)
    }
  }
}

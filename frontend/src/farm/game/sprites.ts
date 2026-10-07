import type { CropDef, GrowthStage, ObjectLook, Point } from '../types'
import { drawGate, drawPark, drawPlayground, drawShop } from './citySprites'
import { ANIMATED_FEATURES, drawFeature, featureRise } from './features'
import { HALF_W, footprintCorners, tileCenter, tileToWorld } from './iso'
import { drawTownLook, townBounds } from './townSprites'
import { drawPalm } from './worlds'

/** Placeholder art: everything is drawn procedurally in world units (see iso.ts). */

type Ctx = CanvasRenderingContext2D

export const OUTLINE = '#2b1d0e'
export const LW = 1.6

// ---------- helpers ----------

export function poly(ctx: Ctx, pts: Point[]) {
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.closePath()
}

export function fillStroke(ctx: Ctx, fill: string, stroke: string | null = OUTLINE, lw = LW) {
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lw
    ctx.lineJoin = 'round'
    ctx.stroke()
  }
}

export function ellipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, rot = 0) {
  ctx.beginPath()
  ctx.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2)
}

/** f < 1 darkens, f > 1 lightens toward white. */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(f <= 1 ? c * f : c + (255 - c) * (f - 1)),
  )
  return `rgb(${ch[0]},${ch[1]},${ch[2]})`
}

export const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
export const up = (p: Point, h: number): Point => ({ x: p.x, y: p.y - h })

export function insetCorners(x: number, y: number, w: number, h: number, k: number) {
  const c = footprintCorners(x, y, w, h)
  const mid = lerp(c.top, c.bottom, 0.5)
  const pull = (p: Point) => lerp(mid, p, k)
  return { T: pull(c.top), R: pull(c.right), B: pull(c.bottom), L: pull(c.left), mid }
}

// ---------- soft effects (kept out of the ink outline, see ink.ts) ----------

export interface SoftFxLog {
  under: ((c: Ctx) => void)[]
  over: ((c: Ctx) => void)[]
}

let softFxLog: SoftFxLog | null = null

export function beginSoftFxLog() {
  softFxLog = { under: [], over: [] }
}

export function endSoftFxLog(): SoftFxLog {
  const log = softFxLog ?? { under: [], over: [] }
  softFxLog = null
  return log
}

/** Shadows, glows and smoke: drawn straight away normally, but set aside while a sprite is being inked
 *  so they don't get an outline. `under` goes beneath the sprite, `over` on top of it. */
export function softFx(ctx: Ctx, layer: 'under' | 'over', draw: (c: Ctx) => void) {
  if (softFxLog) softFxLog[layer].push(draw)
  else draw(ctx)
}

export function groundShadow(ctx: Ctx, c: Point, rx: number, ry: number) {
  softFx(ctx, 'under', (g) => {
    ellipse(g, c.x, c.y, rx, ry)
    g.fillStyle = 'rgba(30,40,10,0.18)'
    g.fill()
  })
}

/** Stable pseudo-random 0..1 per tile, so decorative details don't flicker between frames. */
export function hash(x: number, y: number, salt = 0): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453
  return s - Math.floor(s)
}

/** A cluster of circles drawn as one blob with a single outer outline. */
export function blob(ctx: Ctx, circles: [number, number, number][], fill: string) {
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = LW * 2
  for (const [cx, cy, r] of circles) {
    ellipse(ctx, cx, cy, r, r)
    ctx.stroke()
  }
  ctx.fillStyle = fill
  for (const [cx, cy, r] of circles) {
    ellipse(ctx, cx, cy, r, r)
    ctx.fill()
  }
}

// ---------- ground-level pieces ----------

/** `wet` = watered: darker, damp soil with a couple of shiny puddles. */
export function drawFieldSoil(ctx: Ctx, x: number, y: number, glow = false, wet = false) {
  const { T, R, B, L } = insetCorners(x, y, 1, 1, 0.9)
  const d = 3
  poly(ctx, [L, B, { x: B.x, y: B.y + d }, { x: L.x, y: L.y + d }])
  fillStroke(ctx, wet ? '#553419' : '#6e4526', null)
  poly(ctx, [B, R, { x: R.x, y: R.y + d }, { x: B.x, y: B.y + d }])
  fillStroke(ctx, wet ? '#472b14' : '#5d3a20', null)
  poly(ctx, [T, R, B, L])
  fillStroke(ctx, wet ? '#74462a' : '#9a6538', OUTLINE, 1.2)
  if (wet) {
    for (const [u, v, r] of [[0.32, 0.6, 4.5], [0.66, 0.36, 3.5]]) {
      const p = tileToWorld(x + u, y + v)
      ellipse(ctx, p.x, p.y, r, r / 2)
      ctx.fillStyle = 'rgba(120,190,240,0.55)'
      ctx.fill()
      ellipse(ctx, p.x - r * 0.3, p.y - r * 0.12, r * 0.35, r * 0.15)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fill()
    }
  }
  ctx.strokeStyle = wet ? '#5a3519' : '#7d4f2b'
  ctx.lineWidth = 1.5
  for (const f of [0.25, 0.5, 0.75]) {
    const a = lerp(T, L, f)
    const b = lerp(R, B, f)
    ctx.beginPath()
    ctx.moveTo(lerp(a, b, 0.08).x, lerp(a, b, 0.08).y)
    ctx.lineTo(lerp(a, b, 0.92).x, lerp(a, b, 0.92).y)
    ctx.stroke()
  }
  if (glow) {
    poly(ctx, [T, R, B, L])
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 2.5
    ctx.setLineDash([5, 4])
    ctx.stroke()
    ctx.setLineDash([])
  }
}

function drawPath(ctx: Ctx, x: number, y: number, base: string, detail: string, pattern: 'stones' | 'pavers' = 'stones') {
  const { T, R, B, L } = insetCorners(x, y, 1, 1, 0.98)
  poly(ctx, [T, R, B, L])
  fillStroke(ctx, base, null)
  if (pattern === 'pavers') {
    ctx.strokeStyle = detail
    ctx.lineWidth = 1.4
    ctx.beginPath()
    for (const f of [0.5]) {
      const a = lerp(T, L, f)
      const b = lerp(R, B, f)
      const c = lerp(T, R, f)
      const d = lerp(L, B, f)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.moveTo(c.x, c.y)
      ctx.lineTo(d.x, d.y)
    }
    ctx.stroke()
    poly(ctx, [T, R, B, L])
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = 1
    ctx.stroke()
    return
  }
  ctx.fillStyle = detail
  for (let i = 0; i < 4; i++) {
    const p = tileToWorld(x + 0.2 + hash(x, y, i) * 0.6, y + 0.2 + hash(y, x, i + 9) * 0.6)
    ellipse(ctx, p.x, p.y, 4 + hash(x, y, i + 3) * 3, 2 + hash(x, y, i + 5) * 1.5)
    ctx.fill()
  }
}

function drawPond(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  const c = tileCenter(x, y, w, h)
  const rx = (w + h) * HALF_W * 0.4
  const ry = rx / 2
  ellipse(ctx, c.x, c.y, rx + 4, ry + 3)
  fillStroke(ctx, '#b9b4a6')
  ellipse(ctx, c.x, c.y, rx - 2, ry - 2)
  fillStroke(ctx, '#4fb8e0', null)
  ellipse(ctx, c.x - rx * 0.2, c.y - ry * 0.25, rx * 0.45, ry * 0.3)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fill()
  const bob = Math.sin(t * 1.5) * 1
  ellipse(ctx, c.x + rx * 0.35, c.y + ry * 0.2 + bob, 7, 3.5)
  fillStroke(ctx, '#5fb85a', OUTLINE, 1)
}

// ---------- crops ----------

const SPOTS: [number, number][] = [
  [0.28, 0.28],
  [0.72, 0.28],
  [0.5, 0.5],
  [0.28, 0.72],
  [0.72, 0.72],
]
const STAGE_SIZE = [0, 0.42, 0.66, 0.88, 1]

export function drawCrop(ctx: Ctx, crop: CropDef, stage: GrowthStage, x: number, y: number, t: number) {
  for (const [u, v] of SPOTS) {
    const p = tileToWorld(x + u, y + v)
    if (stage === 0) {
      ctx.fillStyle = '#4a2c14'
      ellipse(ctx, p.x - 2, p.y, 1.6, 1.1)
      ctx.fill()
      ellipse(ctx, p.x + 2, p.y + 1, 1.6, 1.1)
      ctx.fill()
    } else {
      drawPlant(ctx, crop.look, stage, p, t, u * 7 + v * 3)
    }
  }
}

function drawPlant(ctx: Ctx, look: CropDef['look'], stage: GrowthStage, p: Point, t: number, phase: number) {
  const s = STAGE_SIZE[stage]
  const sway = Math.sin(t * 1.6 + phase) * 1.2 * s
  const ready = stage === 4
  const fruitAlpha = stage === 4 ? 1 : stage === 3 ? 0.55 : 0
  const leafLine = shade(look.leaf, 0.6)
  ctx.lineCap = 'round'

  switch (look.shape) {
    case 'grain': {
      const color = ready ? look.fruit : stage === 3 ? '#bcc65a' : look.leaf
      for (const dx of [-3, 0, 3]) {
        const h = 17 * s * (dx === 0 ? 1.1 : 0.95)
        ctx.strokeStyle = shade(color, 0.75)
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(p.x + dx * 0.5, p.y)
        ctx.lineTo(p.x + dx + sway, p.y - h)
        ctx.stroke()
        if (stage >= 2) {
          ellipse(ctx, p.x + dx + sway, p.y - h - 2.5 * s, 1.9, 4.2 * s)
          fillStroke(ctx, color, shade(color, 0.55), 0.8)
        }
      }
      break
    }
    case 'stalk': {
      const h = 26 * s
      ctx.strokeStyle = leafLine
      ctx.lineWidth = 3.2
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + sway, p.y - h)
      ctx.stroke()
      ctx.strokeStyle = look.leaf
      ctx.lineWidth = 2
      ctx.stroke()
      for (const dir of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(p.x + sway * 0.4, p.y - h * 0.45)
        ctx.quadraticCurveTo(p.x + dir * 8 * s, p.y - h * 0.75, p.x + dir * 9 * s + sway, p.y - h * 0.5)
        ctx.stroke()
      }
      if (fruitAlpha > 0) {
        ctx.globalAlpha = fruitAlpha
        ellipse(ctx, p.x + 3 + sway * 0.6, p.y - h * 0.62, 2.8, 5.8, 0.25)
        fillStroke(ctx, look.fruit, '#6a8f2a', 1.2)
        ctx.globalAlpha = 1
      }
      break
    }
    case 'root': {
      const h = 12 * s
      for (const a of [-0.55, 0, 0.55]) {
        ellipse(ctx, p.x + Math.sin(a) * h * 0.55 + sway * 0.5, p.y - Math.cos(a) * h * 0.55, 2.4, h * 0.55, a)
        fillStroke(ctx, look.leaf, leafLine, 0.9)
      }
      if (fruitAlpha > 0) {
        ctx.globalAlpha = fruitAlpha
        ellipse(ctx, p.x, p.y + 0.5, 3.6, 2.4)
        fillStroke(ctx, look.fruit, shade(look.fruit, 0.55), 1)
        ctx.globalAlpha = 1
      }
      break
    }
    case 'bush': {
      const r = 7.5 * s
      const cx = p.x + sway * 0.3
      const cy = p.y - r
      ellipse(ctx, cx, cy, r, r * 0.95)
      fillStroke(ctx, look.leaf, leafLine, 1)
      if (fruitAlpha > 0) {
        ctx.globalAlpha = fruitAlpha
        for (const [dx, dy] of [[-3, -1], [3, -2.5], [0.5, 2.5]]) {
          ellipse(ctx, cx + dx, cy + dy, 2.2, 2.2)
          fillStroke(ctx, look.fruit, shade(look.fruit, 0.5), 0.8)
        }
        ctx.globalAlpha = 1
      }
      break
    }
    case 'berry': {
      const r = 5.5 * s
      for (const dx of [-3.5, 3.5]) {
        ellipse(ctx, p.x + dx + sway * 0.3, p.y - r * 0.8, r, r * 0.7, dx * 0.08)
        fillStroke(ctx, look.leaf, leafLine, 0.9)
      }
      if (fruitAlpha > 0) {
        ctx.globalAlpha = fruitAlpha
        for (const dx of [-2.5, 3]) {
          ellipse(ctx, p.x + dx, p.y - 0.5, 2, 2.6)
          fillStroke(ctx, look.fruit, shade(look.fruit, 0.5), 0.8)
        }
        ctx.globalAlpha = 1
      }
      break
    }
  }
}

// ---------- standing objects ----------

function drawHouse(
  ctx: Ctx,
  look: Extract<ObjectLook, { type: 'house' }>,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  smoking: boolean,
) {
  const { T, R, B, L, mid } = insetCorners(x, y, w, h, 0.84)
  const H = look.wallHeight
  const RH = look.roofHeight
  groundShadow(ctx, { x: mid.x + 4, y: mid.y + 4 }, (R.x - L.x) * 0.55, (B.y - T.y) * 0.55)

  // walls
  poly(ctx, [L, B, up(B, H), up(L, H)])
  fillStroke(ctx, look.wall)
  poly(ctx, [B, R, up(R, H), up(B, H)])
  fillStroke(ctx, shade(look.wall, 0.78))

  // windows on the left wall
  for (const f of [0.22, 0.62]) {
    const a = lerp(L, B, f)
    const b = lerp(L, B, f + 0.18)
    poly(ctx, [up(a, H * 0.38), up(b, H * 0.38), up(b, H * 0.72), up(a, H * 0.72)])
    fillStroke(ctx, '#bfe6ff', OUTLINE, 1.2)
    ctx.strokeStyle = look.trim
    ctx.lineWidth = 1
    const m1 = lerp(a, b, 0.5)
    ctx.beginPath()
    ctx.moveTo(m1.x, m1.y - H * 0.38)
    ctx.lineTo(m1.x, m1.y - H * 0.72)
    ctx.stroke()
  }

  // door on the right wall
  const d1 = lerp(B, R, 0.36)
  const d2 = lerp(B, R, 0.64)
  const dh = H * 0.66
  poly(ctx, [d1, d2, up(d2, dh), up(d1, dh)])
  fillStroke(ctx, shade(look.trim, 0.9))
  ctx.strokeStyle = shade(look.wall, 0.6)
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(d1.x, d1.y)
  ctx.lineTo(d2.x, d2.y - dh)
  ctx.moveTo(d2.x, d2.y)
  ctx.lineTo(d1.x, d1.y - dh)
  ctx.stroke()

  // corner trims
  ctx.strokeStyle = look.trim
  ctx.lineWidth = 2.2
  ctx.beginPath()
  for (const p of [L, B, R]) {
    ctx.moveTo(p.x, p.y - 1)
    ctx.lineTo(p.x, p.y - H + 1)
  }
  ctx.stroke()

  // gable roof — ridge runs from the back-left edge to the front-right edge
  const Tt = up(T, H)
  const Rt = up(R, H)
  const Bt = up(B, H)
  const Lt = up(L, H)
  const ridgeA = up(lerp(T, L, 0.5), H + RH)
  const ridgeB = up(lerp(R, B, 0.5), H + RH)
  poly(ctx, [Tt, Rt, ridgeB, ridgeA])
  fillStroke(ctx, shade(look.roof, 0.7))

  if (look.chimney) {
    const base = lerp(lerp(ridgeA, ridgeB, 0.3), lerp(Tt, Rt, 0.3), 0.3)
    poly(ctx, [
      { x: base.x - 4.5, y: base.y + 4 },
      { x: base.x + 4.5, y: base.y + 4 },
      { x: base.x + 4.5, y: base.y - 14 },
      { x: base.x - 4.5, y: base.y - 14 },
    ])
    fillStroke(ctx, '#b5523b')
    if (smoking) {
      softFx(ctx, 'over', (g) => {
        for (let i = 0; i < 3; i++) {
          const k = (t * 0.6 + i / 3) % 1
          ellipse(g, base.x + Math.sin(k * 6 + i) * 3, base.y - 18 - k * 22, 3 + k * 5, 3 + k * 5)
          g.fillStyle = `rgba(255,255,255,${0.75 * (1 - k)})`
          g.fill()
        }
      })
    }
  }

  poly(ctx, [Bt, Rt, ridgeB])
  fillStroke(ctx, shade(look.wall, 0.78))
  const gc = { x: (Bt.x + Rt.x + ridgeB.x) / 3, y: (Bt.y + Rt.y + ridgeB.y) / 3 }
  ellipse(ctx, gc.x, gc.y, 3.2, 3.2)
  fillStroke(ctx, look.trim, OUTLINE, 1)

  poly(ctx, [Lt, Bt, ridgeB, ridgeA])
  fillStroke(ctx, look.roof)
  ctx.strokeStyle = shade(look.roof, 0.8)
  ctx.lineWidth = 1.2
  for (const f of [0.33, 0.66]) {
    const a = lerp(Lt, ridgeA, f)
    const b = lerp(Bt, ridgeB, f)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  poly(ctx, [Lt, Bt, ridgeB, ridgeA])
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = LW
  ctx.stroke()
}

function drawScaffold(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const { T, R, B, L } = insetCorners(x, y, w, h, 0.84)
  poly(ctx, [T, R, B, L])
  fillStroke(ctx, '#c99a62', null)
  const H = 26
  ctx.lineCap = 'round'
  for (const [a, b] of [
    [L, B],
    [B, R],
  ] as const) {
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(a.x, a.y - H * 0.5)
    ctx.lineTo(b.x, b.y - H * 0.5)
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y - H)
    ctx.stroke()
    ctx.strokeStyle = '#d9a35c'
    ctx.lineWidth = 2.4
    ctx.stroke()
  }
  for (const p of [T, R, B, L]) {
    poly(ctx, [
      { x: p.x - 2, y: p.y },
      { x: p.x + 2, y: p.y },
      { x: p.x + 2, y: p.y - H },
      { x: p.x - 2, y: p.y - H },
    ])
    fillStroke(ctx, '#b07a45', OUTLINE, 1.2)
  }
}

function drawBoard(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 18, 7)
  for (const dx of [-13, 13]) {
    poly(ctx, [
      { x: c.x + dx - 1.8, y: c.y + 2 },
      { x: c.x + dx + 1.8, y: c.y + 2 },
      { x: c.x + dx + 1.8, y: c.y - 30 },
      { x: c.x + dx - 1.8, y: c.y - 30 },
    ])
    fillStroke(ctx, '#8a5a33', OUTLINE, 1.2)
  }
  ctx.beginPath()
  ctx.roundRect(c.x - 19, c.y - 38, 38, 24, 3)
  fillStroke(ctx, '#c48a4f')
  const notes: [number, number, string][] = [
    [-14, -35, '#fffaf0'],
    [-3, -34, '#fff0b3'],
    [8, -35, '#ffe0e6'],
  ]
  for (const [dx, dy, color] of notes) {
    ctx.beginPath()
    ctx.roundRect(c.x + dx, c.y + dy, 8, 10, 1)
    fillStroke(ctx, color, OUTLINE, 0.8)
    ellipse(ctx, c.x + dx + 4, c.y + dy + 1, 1.2, 1.2)
    ctx.fillStyle = '#d9534a'
    ctx.fill()
  }
}

export function drawTree(ctx: Ctx, x: number, y: number, leaf: string, t: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 17, 7)
  poly(ctx, [
    { x: c.x - 3.5, y: c.y + 1 },
    { x: c.x + 3.5, y: c.y + 1 },
    { x: c.x + 3, y: c.y - 18 },
    { x: c.x - 3, y: c.y - 18 },
  ])
  fillStroke(ctx, '#8a5a33')
  const sway = Math.sin(t * 1.2 + x * 0.7 + y) * 1
  blob(
    ctx,
    [
      [c.x + sway, c.y - 36, 15],
      [c.x - 11 + sway * 0.7, c.y - 26, 11],
      [c.x + 11 + sway * 0.7, c.y - 27, 11],
    ],
    leaf,
  )
  ellipse(ctx, c.x - 5 + sway, c.y - 41, 5, 3.5, -0.4)
  ctx.fillStyle = shade(leaf, 1.3)
  ctx.fill()
}

export function drawPine(ctx: Ctx, x: number, y: number, leaf: string) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 14, 6)
  poly(ctx, [
    { x: c.x - 3, y: c.y + 1 },
    { x: c.x + 3, y: c.y + 1 },
    { x: c.x + 3, y: c.y - 10 },
    { x: c.x - 3, y: c.y - 10 },
  ])
  fillStroke(ctx, '#7a4e2c')
  for (const [w, top, bottom, f] of [
    [17, -30, -6, 0.85],
    [14, -42, -20, 1],
    [10, -54, -33, 1.12],
  ]) {
    poly(ctx, [
      { x: c.x - w, y: c.y + bottom },
      { x: c.x + w, y: c.y + bottom },
      { x: c.x, y: c.y + top },
    ])
    fillStroke(ctx, shade(leaf, f))
  }
}

export function drawBush(ctx: Ctx, x: number, y: number, leaf: string) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 16, 6)
  blob(
    ctx,
    [
      [c.x - 8, c.y - 6, 8],
      [c.x + 8, c.y - 6, 8],
      [c.x, c.y - 11, 10],
    ],
    leaf,
  )
  for (const [dx, dy] of [[-6, -9], [4, -13], [8, -5]]) {
    ellipse(ctx, c.x + dx, c.y + dy, 1.8, 1.8)
    ctx.fillStyle = '#ff6b8a'
    ctx.fill()
  }
}

export function drawFlowers(ctx: Ctx, x: number, y: number, colors: string[]) {
  for (let i = 0; i < 6; i++) {
    const p = tileToWorld(x + 0.18 + hash(x, y, i) * 0.64, y + 0.18 + hash(y, x, i + 4) * 0.64)
    ctx.strokeStyle = '#3f8f3a'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x, p.y - 6)
    ctx.stroke()
    const color = colors[i % colors.length]
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2
      ellipse(ctx, p.x + Math.cos(a) * 2.2, p.y - 7 + Math.sin(a) * 2.2, 1.8, 1.8)
      ctx.fillStyle = color
      ctx.fill()
    }
    ellipse(ctx, p.x, p.y - 7, 1.3, 1.3)
    ctx.fillStyle = '#ffcc33'
    ctx.fill()
  }
}

function drawFence(ctx: Ctx, x: number, y: number) {
  const a = tileToWorld(x + 0.05, y + 0.5)
  const b = tileToWorld(x + 0.95, y + 0.5)
  ctx.lineCap = 'round'
  for (const hgt of [11, 5]) {
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 4.2
    ctx.beginPath()
    ctx.moveTo(a.x, a.y - hgt)
    ctx.lineTo(b.x, b.y - hgt)
    ctx.stroke()
    ctx.strokeStyle = '#d9a35c'
    ctx.lineWidth = 2.6
    ctx.stroke()
  }
  for (const p of [a, lerp(a, b, 0.5), b]) {
    poly(ctx, [
      { x: p.x - 2, y: p.y + 1 },
      { x: p.x + 2, y: p.y + 1 },
      { x: p.x + 2, y: p.y - 15 },
      { x: p.x, y: p.y - 17 },
      { x: p.x - 2, y: p.y - 15 },
    ])
    fillStroke(ctx, '#c48a4f', OUTLINE, 1.1)
  }
}

function drawBox(ctx: Ctx, x: number, y: number, k: number, hgt: number, top: string, left: string, right: string) {
  const { T, R, B, L } = insetCorners(x, y, 1, 1, k)
  poly(ctx, [L, B, up(B, hgt), up(L, hgt)])
  fillStroke(ctx, left)
  poly(ctx, [B, R, up(R, hgt), up(B, hgt)])
  fillStroke(ctx, right)
  poly(ctx, [up(T, hgt), up(R, hgt), up(B, hgt), up(L, hgt)])
  fillStroke(ctx, top)
  return { T, R, B, L }
}

function drawHay(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 18, 8)
  const { L, B, R } = drawBox(ctx, x, y, 0.6, 15, '#f3d36b', '#d9b44a', '#c49d3a')
  ctx.strokeStyle = '#a0522d'
  ctx.lineWidth = 1.6
  ctx.beginPath()
  for (const f of [0.33, 0.66]) {
    const p = lerp(L, B, f)
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x, p.y - 15)
    const q = lerp(B, R, f)
    ctx.moveTo(q.x, q.y)
    ctx.lineTo(q.x, q.y - 15)
  }
  ctx.stroke()
}

export function drawBench(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 16, 6)
  const { T, R } = drawBox(ctx, x, y, 0.55, 7, '#c48a4f', '#a8703f', '#8a5a33')
  const tt = up(T, 7)
  const rr = up(R, 7)
  poly(ctx, [tt, rr, up(rr, 9), up(tt, 9)])
  fillStroke(ctx, '#b07a45')
}

export function drawLamp(ctx: Ctx, x: number, y: number, t: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 9, 4)
  const glow = 0.35 + Math.sin(t * 2) * 0.08
  softFx(ctx, 'under', (cx) => {
    const g = cx.createRadialGradient(c.x, c.y - 40, 2, c.x, c.y - 40, 22)
    g.addColorStop(0, `rgba(255,230,140,${glow})`)
    g.addColorStop(1, 'rgba(255,230,140,0)')
    cx.fillStyle = g
    cx.fillRect(c.x - 22, c.y - 62, 44, 44)
  })
  poly(ctx, [
    { x: c.x - 1.8, y: c.y + 1 },
    { x: c.x + 1.8, y: c.y + 1 },
    { x: c.x + 1.8, y: c.y - 34 },
    { x: c.x - 1.8, y: c.y - 34 },
  ])
  fillStroke(ctx, '#4a4a4a', OUTLINE, 1.1)
  ctx.beginPath()
  ctx.roundRect(c.x - 5, c.y - 46, 10, 12, 2)
  fillStroke(ctx, '#ffe48a')
  poly(ctx, [
    { x: c.x - 7, y: c.y - 46 },
    { x: c.x + 7, y: c.y - 46 },
    { x: c.x, y: c.y - 52 },
  ])
  fillStroke(ctx, '#4a4a4a', OUTLINE, 1.1)
}

function drawSign(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 9, 4)
  poly(ctx, [
    { x: c.x - 1.8, y: c.y + 1 },
    { x: c.x + 1.8, y: c.y + 1 },
    { x: c.x + 1.8, y: c.y - 22 },
    { x: c.x - 1.8, y: c.y - 22 },
  ])
  fillStroke(ctx, '#8a5a33', OUTLINE, 1.1)
  poly(ctx, [
    { x: c.x - 13, y: c.y - 30 },
    { x: c.x + 10, y: c.y - 30 },
    { x: c.x + 15, y: c.y - 24 },
    { x: c.x + 10, y: c.y - 18 },
    { x: c.x - 13, y: c.y - 18 },
  ])
  fillStroke(ctx, '#d9a35c')
  ctx.strokeStyle = '#8a5a33'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(c.x - 9, c.y - 26)
  ctx.lineTo(c.x + 6, c.y - 26)
  ctx.moveTo(c.x - 9, c.y - 22)
  ctx.lineTo(c.x + 3, c.y - 22)
  ctx.stroke()
}

/** Draws any placed object. `building` = still under construction. */
export function drawObjectSprite(
  ctx: Ctx,
  look: ObjectLook,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  opts: { underConstruction?: boolean; busy?: boolean; level?: number; health?: number } = {},
) {
  if (opts.underConstruction) return drawScaffold(ctx, x, y, w, h)
  switch (look.type) {
    case 'field':
      return drawFieldSoil(ctx, x, y)
    case 'house':
      return drawHouse(ctx, look, x, y, w, h, t, !!opts.busy)
    case 'board':
      return drawBoard(ctx, x, y)
    case 'tree':
      return drawTree(ctx, x, y, look.leaf, t)
    case 'pine':
      return drawPine(ctx, x, y, look.leaf)
    case 'bush':
      return drawBush(ctx, x, y, look.leaf)
    case 'flowers':
      return drawFlowers(ctx, x, y, look.colors)
    case 'fence':
      return drawFence(ctx, x, y)
    case 'hay':
      return drawHay(ctx, x, y)
    case 'bench':
      return drawBench(ctx, x, y)
    case 'lamp':
      return drawLamp(ctx, x, y, t)
    case 'pond':
      return drawPond(ctx, x, y, w, h, t)
    case 'sign':
      return drawSign(ctx, x, y)
    case 'path':
      return drawPath(ctx, x, y, look.base, look.detail, look.pattern)
    case 'gate':
      return drawGate(ctx, x, y, t, opts.level ?? 1, opts.health ?? 1)
    case 'shop':
      return drawShop(ctx, look, x, y, w, h, t)
    case 'park':
      return drawPark(ctx, x, y, t)
    case 'playground':
      return drawPlayground(ctx, x, y, t)
    case 'feature':
      return drawFeature(ctx, look.kind, x, y, t)
    case 'palm':
      return drawPalm(ctx, x, y)
    default:
      return drawTownLook(ctx, look, x, y, w, h, t)
  }
}

/** Looks whose picture moves (sway, flags, water…) — redrawn a few times a second instead of cached. */
const ANIMATED_LOOKS = new Set<ObjectLook['type']>(['tree', 'lamp', 'pond', 'gate', 'park', 'playground', 'fruitTree', 'fountain', 'pool'])

export function isAnimatedLook(look: ObjectLook): boolean {
  return look.type === 'feature' ? ANIMATED_FEATURES.has(look.kind) : ANIMATED_LOOKS.has(look.type)
}

/** How far a sprite rises above its footprint (world units) — used for tap hit-testing. */
export function spriteHeight(look: ObjectLook): number {
  switch (look.type) {
    case 'house':
      return look.wallHeight + look.roofHeight + 8
    case 'gate':
      return 72
    case 'shop':
      return look.wallHeight + 24
    case 'park':
      return 50
    case 'playground':
      return 34
    case 'tree':
      return 52
    case 'pine':
      return 56
    case 'lamp':
      return 52
    case 'board':
      return 40
    case 'sign':
      return 30
    case 'fence':
      return 18
    case 'hay':
    case 'bench':
      return 18
    case 'feature':
      return featureRise(look.kind) - 8
    case 'palm':
      return 60
    case 'bush':
      return 20
    case 'field':
    case 'flowers':
    case 'path':
    case 'pond':
      return 0
    default:
      return townBounds(look, 1, 1).rise - 6
  }
}

/** Visible extent around the footprint's ground center: half width, height above, depth below. */
export function spriteBounds(look: ObjectLook, w: number, h: number): { half: number; rise: number; below: number } {
  const full = { half: (w + h) * 16, below: (w + h) * 8 }
  switch (look.type) {
    case 'house':
      return { ...full, rise: look.wallHeight + look.roofHeight + 14 }
    case 'field':
      return { ...full, rise: 24 }
    case 'gate':
      return { ...full, rise: 100 }
    case 'shop':
      return { ...full, rise: look.wallHeight + 30 }
    case 'park':
      return { ...full, rise: 72 }
    case 'playground':
      return { ...full, rise: 40 }
    case 'path':
      return { ...full, rise: full.below }
    case 'pond':
      return { ...full, rise: 4 }
    case 'tree':
      return { half: 28, rise: 52, below: 9 }
    case 'pine':
      return { half: 19, rise: 56, below: 8 }
    case 'bush':
      return { half: 19, rise: 23, below: 7 }
    case 'flowers':
      return { half: 20, rise: 14, below: 9 }
    case 'fence':
      return { half: 30, rise: 19, below: 17 }
    case 'lamp':
      return { half: 16, rise: 54, below: 5 }
    case 'sign':
      return { half: 17, rise: 32, below: 5 }
    case 'board':
      return { half: 21, rise: 40, below: 8 }
    case 'feature':
      return { half: full.half + 10, rise: featureRise(look.kind), below: full.below + 6 }
    case 'palm':
      return { half: 30, rise: 66, below: 8 }
    case 'hay':
    case 'bench':
      return { half: 22, rise: 20, below: 10 }
    default:
      return townBounds(look, w, h)
  }
}

/** Whether the object lies flat on the ground (drawn beneath everything standing). */
export function isFlat(look: ObjectLook): boolean {
  return look.type === 'path' || look.type === 'pond' || look.type === 'field' || look.type === 'flowers'
}

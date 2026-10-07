import type { Point, WorldTheme } from '../types'
import { drawDeadTree, drawHeart, drawRock, drawShrooms, isoBox } from './citySprites'
import { type Box, INK_THIN, type InkWeight, inkForSize } from './ink'
import { HALF_W, footprintCorners, tileCenter, tileToWorld } from './iso'
import { OUTLINE, blob, drawBush, drawFlowers, drawPine, drawTree, ellipse, fillStroke, groundShadow, hash, insetCorners, lerp, poly, shade, softFx, up } from './sprites'

/** Art for the land around the city: each world's look (jungle, desert, snow…), its landmark and wild decor, plus plain meadow. Same style as sprites.ts. */

type Ctx = CanvasRenderingContext2D
type Rect = { x: number; y: number; w: number; h: number }

/** A world's style, or the plain meadow of the wild land between them. */
export type Biome = WorldTheme | 'meadow'

/** Night-blue wash over land that isn't open yet. */
export const LOCKED_SHADE = 'rgba(16,20,46,0.5)'

export type DecorKind =
  | 'palm'
  | 'jungleTree'
  | 'bush'
  | 'cactus'
  | 'rock'
  | 'snowPine'
  | 'snowman'
  | 'deadTree'
  | 'lava'
  | 'crater'
  | 'flag'
  | 'crystal'
  | 'shrooms'
  | 'oak'
  | 'pine'
  | 'meadowBush'
  | 'flowers'

interface Theme {
  ground: [string, string]
  /** Left and right cliff faces. */
  cliff: [string, string]
  rock: string
  /** Wild decor and how often each kind shows up (weights add up to 1). */
  decor: [DecorKind, number][]
}

export const THEMES: Record<Biome, Theme> = {
  meadow: { ground: ['#a6d176', '#9ecb6e'], cliff: ['#c08a55', '#9e6c3f'], rock: '#a39d94', decor: [['oak', 0.34], ['pine', 0.24], ['meadowBush', 0.2], ['flowers', 0.12], ['rock', 0.1]] },
  jungle: { ground: ['#5cbd5b', '#53b353'], cliff: ['#a8723f', '#865a30'], rock: '#8f9a86', decor: [['palm', 0.4], ['jungleTree', 0.35], ['bush', 0.25]] },
  desert: { ground: ['#f4d690', '#edcb7f'], cliff: ['#e0b06a', '#c4904c'], rock: '#d4a86a', decor: [['cactus', 0.55], ['rock', 0.33], ['palm', 0.12]] },
  snow: { ground: ['#f6f9fd', '#e9f0f8'], cliff: ['#b4cde4', '#8fb0cf'], rock: '#c9dbee', decor: [['snowPine', 0.62], ['snowman', 0.12], ['rock', 0.26]] },
  volcano: { ground: ['#645450', '#5b4c48'], cliff: ['#4d3f3b', '#3b302d'], rock: '#3f3836', decor: [['rock', 0.45], ['deadTree', 0.3], ['lava', 0.25]] },
  moon: { ground: ['#cdd0db', '#c2c6d2'], cliff: ['#9a9fb1', '#7c8194'], rock: '#a3a8b8', decor: [['rock', 0.5], ['crater', 0.47], ['flag', 0.03]] },
  crystal: { ground: ['#bea8e6', '#b39cdd'], cliff: ['#836ab9', '#6a529f'], rock: '#8a76c4', decor: [['crystal', 0.55], ['shrooms', 0.3], ['rock', 0.15]] },
}

/** Lie flat on the ground (drawn with it, under everything standing). */
export const FLAT = new Set<DecorKind>(['lava', 'crater'])
const TALL = new Set<DecorKind>(['palm', 'jungleTree', 'snowPine', 'deadTree', 'cactus', 'oak', 'pine'])
const TALL_INK = inkForSize(56, 60)
export const LANDMARK_INK = inkForSize(128, 100)

/** Ink weight for a piece of wild decor. */
export function decorInk(kind: DecorKind): InkWeight {
  return TALL.has(kind) ? TALL_INK : INK_THIN
}

/**
 * Paints a sprite, then washes it in the locked-land shade. On the main canvas (`main`, when the inker falls
 * back to plain drawing for a frame) a wash would darken the scene behind it, so there it's dimmed with a filter instead.
 */
export function shaded(paint: (c: Ctx) => void, box: Box, dim: boolean, main: Ctx): (c: Ctx) => void {
  if (!dim) return paint
  return (c) => {
    if (c === main) {
      c.save()
      c.filter = 'brightness(0.55)'
      paint(c)
      c.restore()
      return
    }
    paint(c)
    c.save()
    c.globalCompositeOperation = 'source-atop'
    c.fillStyle = LOCKED_SHADE
    c.fillRect(box.x - 4, box.y - 4, box.w + 8, box.h + 8)
    c.restore()
  }
}

/** Slow pale mist drifting over locked land (clipped to the land's diamond). */
export function drawFog(ctx: Ctx, r: Rect, t: number, seed: number, blobs = 5) {
  const { top, right, bottom, left } = footprintCorners(r.x, r.y, r.w, r.h)
  ctx.save()
  poly(ctx, [top, right, bottom, left])
  ctx.clip()
  for (let i = 0; i < blobs; i++) {
    const fx = r.x + r.w * (0.15 + 0.7 * hash(seed, i, 61)) + Math.sin(t * 0.13 + i * 2.1) * r.w * 0.08
    const fy = r.y + r.h * (0.15 + 0.7 * hash(seed, i, 67)) + Math.cos(t * 0.11 + i * 1.3) * r.h * 0.08
    const p = tileToWorld(fx, fy)
    const rad = (r.w + r.h) * HALF_W * (0.16 + hash(seed, i, 71) * 0.1)
    ctx.save()
    ctx.translate(p.x, p.y - 14)
    ctx.scale(1, 0.5)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad)
    const a = 0.16 + Math.sin(t * 0.4 + i) * 0.04
    g.addColorStop(0, `rgba(176,180,216,${a})`)
    g.addColorStop(1, 'rgba(176,180,216,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, rad, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

// ---------- ground ----------

/** Little ground details on one tile: grass tufts, dune ripples, lava cracks… */
export function drawSpeck(ctx: Ctx, theme: Biome, x: number, y: number, t: number) {
  const r = hash(x, y)
  const c = tileCenter(x, y)
  const gx = c.x + (hash(x, y, 2) - 0.5) * 30
  const gy = c.y + (hash(x, y, 3) - 0.5) * 12
  switch (theme) {
    case 'meadow':
      if (r < 0.28) {
        ctx.strokeStyle = '#7cb85a'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(gx - 3, gy - 3)
        ctx.lineTo(gx - 1, gy)
        ctx.lineTo(gx + 1, gy - 4)
        ctx.lineTo(gx + 2, gy)
        ctx.lineTo(gx + 4, gy - 3)
        ctx.stroke()
      } else if (r > 0.94) {
        ellipse(ctx, gx, gy, 1.8, 1.8)
        ctx.fillStyle = r > 0.97 ? '#fff6a8' : '#ffffff'
        ctx.fill()
      }
      return
    case 'jungle':
      if (r < 0.35) {
        ctx.strokeStyle = '#3f9a45'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(gx - 3, gy - 3)
        ctx.lineTo(gx - 1, gy)
        ctx.lineTo(gx + 1, gy - 4)
        ctx.lineTo(gx + 2, gy)
        ctx.lineTo(gx + 4, gy - 3)
        ctx.stroke()
      } else if (r > 0.93) {
        ellipse(ctx, gx, gy, 1.9, 1.9)
        ctx.fillStyle = r > 0.965 ? '#ffd84a' : '#ff7aa8'
        ctx.fill()
      }
      return
    case 'desert':
      if (r < 0.35) {
        ctx.strokeStyle = '#d6ae66'
        ctx.lineWidth = 1.3
        ctx.beginPath()
        ctx.moveTo(gx - 7, gy)
        ctx.quadraticCurveTo(gx - 2, gy - 3, gx + 3, gy)
        ctx.moveTo(gx - 2, gy + 3)
        ctx.quadraticCurveTo(gx + 3, gy, gx + 8, gy + 3)
        ctx.stroke()
      }
      return
    case 'snow':
      if (r < 0.3) {
        ellipse(ctx, gx, gy, 5, 2)
        ctx.fillStyle = '#d9e5f2'
        ctx.fill()
      } else if (r > 0.92) {
        ellipse(ctx, gx, gy, 1.4, 1.4)
        ctx.fillStyle = '#9fd3ff'
        ctx.fill()
      }
      return
    case 'volcano':
      if (r < 0.25) {
        ctx.strokeStyle = `rgba(255,138,58,${0.65 + Math.sin(t * 2 + x + y) * 0.25})`
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(gx - 8, gy - 1)
        ctx.lineTo(gx - 3, gy + 1.5)
        ctx.lineTo(gx + 1, gy - 1.5)
        ctx.lineTo(gx + 7, gy + 1)
        ctx.stroke()
      } else if (r > 0.9) {
        ellipse(ctx, gx, gy, 1.5, 1.5)
        ctx.fillStyle = '#ffb347'
        ctx.fill()
      }
      return
    case 'moon':
      if (r < 0.35) {
        ellipse(ctx, gx, gy, 5, 2.4)
        ctx.fillStyle = '#aeb2c0'
        ctx.fill()
        ellipse(ctx, gx + 0.8, gy + 0.6, 3.6, 1.5)
        ctx.fillStyle = '#b9bdca'
        ctx.fill()
      }
      return
    case 'crystal':
      if (r < 0.3 || r > 0.9) {
        const s = 1.6 + Math.sin(t * 3 + x * 2 + y) * 0.6
        ctx.fillStyle = r < 0.3 ? '#f6efff' : '#8fe3ff'
        ctx.beginPath()
        ctx.moveTo(gx, gy - s * 1.6)
        ctx.quadraticCurveTo(gx, gy, gx + s * 1.6, gy)
        ctx.quadraticCurveTo(gx, gy, gx, gy + s * 1.6)
        ctx.quadraticCurveTo(gx, gy, gx - s * 1.6, gy)
        ctx.quadraticCurveTo(gx, gy, gx, gy - s * 1.6)
        ctx.fill()
      }
      return
  }
}

function drawLava(ctx: Ctx, x: number, y: number, size: number, t: number) {
  const c = tileCenter(x, y)
  ellipse(ctx, c.x, c.y, 16 * size, 7 * size)
  fillStroke(ctx, '#3b2f2c', OUTLINE, 1.4)
  const pulse = 0.85 + Math.sin(t * 2.2 + x + y) * 0.15
  ellipse(ctx, c.x, c.y + 0.5, 12 * size, 4.8 * size)
  ctx.fillStyle = `rgba(255,122,47,${pulse})`
  ctx.fill()
  ellipse(ctx, c.x - 3 * size, c.y - 0.5, 4.5 * size, 1.6 * size)
  ctx.fillStyle = '#ffd04a'
  ctx.fill()
}

function drawCrater(ctx: Ctx, x: number, y: number, size: number) {
  const c = tileCenter(x, y)
  ellipse(ctx, c.x, c.y, 15 * size, 7 * size)
  fillStroke(ctx, '#b5b9c6', '#8d91a2', 1.4)
  ellipse(ctx, c.x + 1, c.y + 1, 10.5 * size, 4.6 * size)
  ctx.fillStyle = '#9ea2b1'
  ctx.fill()
  ctx.strokeStyle = '#e3e5ec'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.ellipse(c.x, c.y, 13 * size, 5.8 * size, 0, Math.PI * 1.05, Math.PI * 1.6)
  ctx.stroke()
}

/** Flat decor (lava pools, craters), drawn with the ground. */
export function drawFlatDecor(ctx: Ctx, kind: DecorKind, x: number, y: number, size: number, t: number) {
  if (kind === 'lava') drawLava(ctx, x, y, size, t)
  else drawCrater(ctx, x, y, size)
}

// ---------- wild decor ----------

/** Where each palm frond ends, from the top of the trunk: up, out to the sides, then drooping in front. */
const PALM_FRONDS: [number, number][] = [
  [-10, -13],
  [11, -12],
  [-22, 3],
  [23, 2],
  [-24, 14],
  [22, 15],
]

export function drawPalm(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 16, 6)
  const lean = (hash(x, y, 3) - 0.5) * 12
  const top = { x: c.x + lean, y: c.y - 46 }
  ctx.beginPath()
  ctx.moveTo(c.x - 3.6, c.y + 1)
  ctx.quadraticCurveTo(c.x - 3.6, c.y - 26, top.x - 2.4, top.y)
  ctx.lineTo(top.x + 2.4, top.y)
  ctx.quadraticCurveTo(c.x + 3.6, c.y - 26, c.x + 3.6, c.y + 1)
  ctx.closePath()
  fillStroke(ctx, '#c08f58')
  ctx.strokeStyle = '#8f6337'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (const k of [0.2, 0.38, 0.56, 0.74]) {
    const px = (1 - k * k) * c.x + k * k * top.x
    const py = (1 - k) * (1 - k) * c.y + 2 * (1 - k) * k * (c.y - 26) + k * k * top.y
    ctx.moveTo(px - 3, py + 0.8)
    ctx.lineTo(px + 3, py - 0.8)
  }
  ctx.stroke()
  // arching fronds, back ones first
  for (const [i, [ex, ey]] of PALM_FRONDS.entries()) {
    const end = { x: top.x + ex, y: top.y + ey }
    const ctrl = { x: top.x + ex * 0.5, y: top.y + ey * 0.5 - 10 }
    const l = Math.hypot(ex, ey)
    const nx = (-ey / l) * 5
    const ny = (ex / l) * 5
    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.quadraticCurveTo(ctrl.x + nx, ctrl.y + ny, end.x, end.y)
    ctx.quadraticCurveTo(ctrl.x - nx, ctrl.y - ny, top.x, top.y)
    fillStroke(ctx, i < 2 ? '#4fb862' : '#3fa553')
    ctx.strokeStyle = '#2e7f3e'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.quadraticCurveTo(ctrl.x, ctrl.y, end.x, end.y)
    ctx.stroke()
  }
  for (const dx of [-2.5, 2.5]) {
    ellipse(ctx, top.x + dx, top.y + 3, 2.6, 2.6)
    fillStroke(ctx, '#7a4e2c', OUTLINE, 1)
  }
}

function drawCactus(ctx: Ctx, x: number, y: number, s: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 11 * s, 4.5 * s)
  const segs: [number, number, number, number][] = [
    [0, -2, 0, -30],
    [0, -12, -9, -12],
    [-9, -12, -9, -22],
    [0, -17, 8, -17],
    [8, -17, 8, -26],
  ]
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const [w, color] of [
    [10.5, OUTLINE],
    [7.5, '#5cae5a'],
  ] as const) {
    ctx.strokeStyle = color
    ctx.lineWidth = w * s
    ctx.beginPath()
    for (const [ax, ay, bx, by] of segs) {
      ctx.moveTo(c.x + ax * s, c.y + ay * s)
      ctx.lineTo(c.x + bx * s, c.y + by * s)
    }
    ctx.stroke()
  }
  ctx.strokeStyle = '#86cf7a'
  ctx.lineWidth = 1.4 * s
  ctx.beginPath()
  ctx.moveTo(c.x - 1.3 * s, c.y - 4 * s)
  ctx.lineTo(c.x - 1.3 * s, c.y - 29 * s)
  ctx.stroke()
  if (hash(x, y, 13) < 0.4) {
    ellipse(ctx, c.x, c.y - 34 * s, 2.6, 2.6)
    fillStroke(ctx, '#ff7aa8', OUTLINE, 0.9)
  }
}

function drawSnowPine(ctx: Ctx, x: number, y: number) {
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
    fillStroke(ctx, shade('#3d8a68', f))
    // snow resting on the branches
    ctx.fillStyle = '#ffffff'
    for (const k of [-0.6, 0, 0.6]) {
      ellipse(ctx, c.x + k * w, c.y + bottom - 1.2, w * 0.24, 2.4)
      ctx.fill()
    }
  }
  ctx.beginPath()
  ctx.moveTo(c.x, c.y - 54)
  ctx.lineTo(c.x + 5, c.y - 44.5)
  ctx.quadraticCurveTo(c.x + 2, c.y - 47, c.x, c.y - 44)
  ctx.quadraticCurveTo(c.x - 2, c.y - 47, c.x - 5, c.y - 44.5)
  ctx.closePath()
  fillStroke(ctx, '#ffffff', OUTLINE, 1)
}

function drawSnowman(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 11, 4.5)
  ellipse(ctx, c.x, c.y - 8, 10, 9)
  fillStroke(ctx, '#ffffff')
  ellipse(ctx, c.x, c.y - 22, 7.5, 7)
  fillStroke(ctx, '#ffffff')
  ctx.beginPath()
  ctx.roundRect(c.x - 7, c.y - 17, 14, 3.4, 1.7)
  fillStroke(ctx, '#e8505b', OUTLINE, 1)
  ctx.fillStyle = OUTLINE
  for (const [dx, dy] of [
    [-2.5, -24],
    [2.5, -24],
    [0, -10],
    [0, -6],
  ]) {
    ellipse(ctx, c.x + dx, c.y + dy, 1.1, 1.1)
    ctx.fill()
  }
  poly(ctx, [
    { x: c.x, y: c.y - 22.5 },
    { x: c.x + 6, y: c.y - 21.5 },
    { x: c.x, y: c.y - 20.5 },
  ])
  fillStroke(ctx, '#ff9a3d', OUTLINE, 0.8)
  ctx.beginPath()
  ctx.roundRect(c.x - 5, c.y - 36, 10, 8, 1.5)
  fillStroke(ctx, '#3a3a48', OUTLINE, 1)
  ctx.beginPath()
  ctx.roundRect(c.x - 8, c.y - 29.5, 16, 2.6, 1.3)
  fillStroke(ctx, '#3a3a48', OUTLINE, 1)
}

function drawFlag(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 8, 3)
  ctx.beginPath()
  ctx.roundRect(c.x - 1.2, c.y - 34, 2.4, 35, 1)
  fillStroke(ctx, '#e9eaf0', OUTLINE, 1)
  ctx.beginPath()
  ctx.moveTo(c.x + 1.2, c.y - 33)
  ctx.quadraticCurveTo(c.x + 9, c.y - 36, c.x + 17, c.y - 32)
  ctx.lineTo(c.x + 17, c.y - 22)
  ctx.quadraticCurveTo(c.x + 9, c.y - 26, c.x + 1.2, c.y - 23)
  ctx.closePath()
  fillStroke(ctx, '#ffffff', OUTLINE, 1.1)
  drawHeart(ctx, c.x + 9, c.y - 28.5, 3.2, '#ff5d7a')
}

/** One crystal: a six-sided shard standing on `base`, lit from the left. */
export function shard(ctx: Ctx, base: Point, h: number, w: number, tilt: number, color: string) {
  const tip = { x: base.x + tilt, y: base.y - h }
  const sl = { x: base.x - w + tilt * 0.7, y: base.y - h * 0.72 }
  const sr = { x: base.x + w + tilt * 0.7, y: base.y - h * 0.72 }
  const cs = { x: base.x + tilt * 0.72, y: base.y - h * 0.72 + w * 0.4 }
  const bl = { x: base.x - w, y: base.y }
  const br = { x: base.x + w, y: base.y }
  const bm = { x: base.x, y: base.y + w * 0.4 }
  poly(ctx, [bl, sl, tip, cs, bm])
  fillStroke(ctx, color, OUTLINE, 1.1)
  poly(ctx, [bm, cs, tip, sr, br])
  fillStroke(ctx, shade(color, 0.78), OUTLINE, 1.1)
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(lerp(bl, bm, 0.45).x, lerp(bl, bm, 0.45).y - 3)
  ctx.lineTo(lerp(sl, tip, 0.5).x + 1, lerp(sl, tip, 0.5).y + 2)
  ctx.stroke()
}

const CRYSTAL_COLORS = ['#8fe3ff', '#ff9ad5', '#c9a6ff']

function drawCrystals(ctx: Ctx, x: number, y: number, s: number) {
  const c = tileCenter(x, y)
  const color = CRYSTAL_COLORS[Math.floor(hash(x, y, 5) * CRYSTAL_COLORS.length)]
  softFx(ctx, 'under', (g) => {
    ellipse(g, c.x, c.y, 16 * s, 7 * s)
    g.fillStyle = `${color}55`
    g.fill()
  })
  shard(ctx, { x: c.x - 7 * s, y: c.y }, 17 * s, 4.2 * s, -5 * s, color)
  shard(ctx, { x: c.x + 7 * s, y: c.y - 1 }, 15 * s, 4.2 * s, 5 * s, color)
  shard(ctx, { x: c.x, y: c.y + 2 }, 27 * s, 5.6 * s, 0, color)
}

// ---------- landmarks (2×2 at each world's back corner) ----------

const at = (x: number, y: number, h = 0): Point => up(tileToWorld(x, y), h)

function drawTemple(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 44, 18)
  for (const [k, h0, h1] of [
    [0.1, 0, 13],
    [0.42, 13, 25],
    [0.72, 25, 36],
  ]) {
    isoBox(ctx, x + k, x + 2 - k, y + k, y + 2 - k, h0, h1, '#b6b195', '#9a9578', '#7f7a5f', 1.4)
    // stairs up the front
    const y1 = y + 2 - k
    poly(ctx, [at(x + 0.84, y1, h0), at(x + 1.16, y1, h0), at(x + 1.16, y1, h1), at(x + 0.84, y1, h1)])
    fillStroke(ctx, '#d3cfb3', OUTLINE, 1)
    ctx.strokeStyle = '#9a9578'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let h = h0 + 3; h < h1; h += 3) {
      ctx.moveTo(at(x + 0.84, y1, h).x, at(x + 0.84, y1, h).y)
      ctx.lineTo(at(x + 1.16, y1, h).x, at(x + 1.16, y1, h).y)
    }
    ctx.stroke()
  }
  isoBox(ctx, x + 0.78, x + 1.22, y + 0.78, y + 1.22, 36, 48, '#c3be9f', '#a29d80', '#857f63', 1.2)
  poly(ctx, [at(x + 0.9, y + 1.22, 36), at(x + 1.1, y + 1.22, 36), at(x + 1.1, y + 1.22, 44), at(x + 0.9, y + 1.22, 44)])
  fillStroke(ctx, '#3b3324', OUTLINE, 1)
  for (const [px, py, h] of [
    [x + 0.1, y + 1.9, 10],
    [x + 1.9, y + 0.2, 9],
    [x + 1.55, y + 1.55, 22],
  ]) {
    const p = at(px, py, h)
    blob(ctx, [
      [p.x, p.y, 4.2],
      [p.x + 3.5, p.y + 3, 3],
      [p.x - 3, p.y + 3.5, 2.6],
    ], '#4caf50')
  }
}

function drawPyramid(ctx: Ctx, x: number, y: number) {
  const { R, B, L, mid } = insetCorners(x, y, 2, 2, 0.94)
  const apex = up(mid, 66)
  groundShadow(ctx, lerp(mid, B, 0.25), 44, 18)
  poly(ctx, [L, B, apex])
  fillStroke(ctx, '#f2d38e', OUTLINE, 1.4)
  poly(ctx, [B, R, apex])
  fillStroke(ctx, '#d4a95f', OUTLINE, 1.4)
  ctx.strokeStyle = 'rgba(150,105,45,0.45)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (const k of [0.2, 0.4, 0.6]) {
    const a = lerp(L, apex, k)
    const b = lerp(B, apex, k)
    const d = lerp(R, apex, k)
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.lineTo(d.x, d.y)
  }
  ctx.stroke()
  const k = 0.8
  poly(ctx, [lerp(L, apex, k), lerp(B, apex, k), apex])
  fillStroke(ctx, '#ffd34d', OUTLINE, 1)
  poly(ctx, [lerp(B, apex, k), lerp(R, apex, k), apex])
  fillStroke(ctx, '#e8b52f', OUTLINE, 1)
  const d0 = lerp(L, B, 0.44)
  const d1 = lerp(L, B, 0.56)
  poly(ctx, [d0, d1, up(d1, 13), up(d0, 13)])
  fillStroke(ctx, '#5a3d1e', OUTLINE, 1)
}

function drawIgloo(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 42, 17)
  const rx = 34
  const ry = 17
  const hgt = 36
  ctx.beginPath()
  ctx.ellipse(g.x, g.y, rx, hgt, 0, Math.PI, Math.PI * 2)
  ctx.ellipse(g.x, g.y, rx, ry, 0, 0, Math.PI)
  ctx.closePath()
  fillStroke(ctx, '#f7fbff', OUTLINE, 1.4)
  ctx.strokeStyle = '#b9d0e6'
  ctx.lineWidth = 1.1
  const rows = [0, 0.32, 0.62, 0.86]
  for (let i = 1; i < rows.length; i++) {
    const f = Math.sqrt(1 - rows[i] ** 2)
    ctx.beginPath()
    ctx.ellipse(g.x, g.y - rows[i] * hgt, rx * f, ry * f, 0, 0.12, Math.PI - 0.12)
    ctx.stroke()
  }
  // joints between the ice blocks, staggered row to row
  ctx.beginPath()
  for (let i = 0; i < rows.length - 1; i++) {
    const f0 = Math.sqrt(1 - rows[i] ** 2)
    const f1 = Math.sqrt(1 - rows[i + 1] ** 2)
    for (const a of i % 2 ? [0.95, 1.6, 2.25] : [0.65, 1.3, 1.95, 2.55]) {
      ctx.moveTo(g.x + Math.cos(a) * rx * f0, g.y - rows[i] * hgt + Math.sin(a) * ry * f0)
      ctx.lineTo(g.x + Math.cos(a) * rx * f1, g.y - rows[i + 1] * hgt + Math.sin(a) * ry * f1)
    }
  }
  ctx.stroke()
  const e = { x: g.x - 13, y: g.y + 11 }
  ctx.beginPath()
  ctx.ellipse(e.x, e.y, 13, 16, 0, Math.PI, Math.PI * 2)
  ctx.ellipse(e.x, e.y, 13, 6, 0, 0, Math.PI)
  ctx.closePath()
  fillStroke(ctx, '#eef5fc', OUTLINE, 1.3)
  ctx.beginPath()
  ctx.ellipse(e.x - 1, e.y + 3, 7.5, 11, 0, Math.PI, Math.PI * 2)
  ctx.closePath()
  fillStroke(ctx, '#3d4f6b', OUTLINE, 1)
}

function drawVolcano(ctx: Ctx, x: number, y: number, t: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 46, 19)
  const cone = () => {
    ctx.beginPath()
    ctx.moveTo(g.x - 40, g.y)
    ctx.lineTo(g.x - 13, g.y - 56)
    ctx.quadraticCurveTo(g.x, g.y - 52, g.x + 13, g.y - 56)
    ctx.lineTo(g.x + 40, g.y)
    ctx.ellipse(g.x, g.y, 40, 18, 0, 0, Math.PI)
    ctx.closePath()
  }
  cone()
  ctx.fillStyle = '#7d665c'
  ctx.fill()
  ctx.save()
  cone()
  ctx.clip()
  poly(ctx, [
    { x: g.x + 2, y: g.y - 70 },
    { x: g.x + 60, y: g.y - 70 },
    { x: g.x + 60, y: g.y + 30 },
    { x: g.x + 12, y: g.y + 30 },
  ])
  ctx.fillStyle = '#5f4b44'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(g.x - 9, g.y - 56)
  ctx.quadraticCurveTo(g.x - 16, g.y - 34, g.x - 10, g.y - 22)
  ctx.quadraticCurveTo(g.x - 6, g.y - 14, g.x - 12, g.y - 2)
  ctx.lineTo(g.x - 4, g.y - 1)
  ctx.quadraticCurveTo(g.x - 1, g.y - 16, g.x - 4, g.y - 26)
  ctx.quadraticCurveTo(g.x - 6, g.y - 40, g.x, g.y - 56)
  ctx.closePath()
  fillStroke(ctx, '#ff7a2f', OUTLINE, 1)
  ctx.restore()
  cone()
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1.4
  ctx.lineJoin = 'round'
  ctx.stroke()
  ellipse(ctx, g.x, g.y - 55, 13, 4.5)
  fillStroke(ctx, '#ff8a3a', OUTLINE, 1.2)
  ellipse(ctx, g.x, g.y - 55.5, 8, 2.4)
  ctx.fillStyle = '#ffd04a'
  ctx.fill()
  softFx(ctx, 'over', (c) => {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.25 + i / 3) % 1
      ellipse(c, g.x + Math.sin(k * 4 + i) * 6 + k * 10, g.y - 64 - k * 42, 6 + k * 10, 5 + k * 8)
      c.fillStyle = `rgba(120,110,112,${0.55 * (1 - k)})`
      c.fill()
    }
  })
}

function drawRocket(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 34, 14)
  ellipse(ctx, g.x, g.y, 30, 13)
  fillStroke(ctx, '#8d93a6', OUTLINE, 1.4)
  ellipse(ctx, g.x, g.y - 1.5, 24, 10)
  ctx.fillStyle = '#a7adbf'
  ctx.fill()
  for (const s of [-1, 1]) {
    poly(ctx, [
      { x: g.x + s * 10, y: g.y - 34 },
      { x: g.x + s * 23, y: g.y - 16 },
      { x: g.x + s * 23, y: g.y - 3 },
      { x: g.x + s * 10, y: g.y - 12 },
    ])
    fillStroke(ctx, '#e8505b', OUTLINE, 1.3)
  }
  const body = () => {
    ctx.beginPath()
    ctx.moveTo(g.x - 11, g.y - 6)
    ctx.lineTo(g.x - 11, g.y - 54)
    ctx.quadraticCurveTo(g.x - 11, g.y - 80, g.x, g.y - 94)
    ctx.quadraticCurveTo(g.x + 11, g.y - 80, g.x + 11, g.y - 54)
    ctx.lineTo(g.x + 11, g.y - 6)
    ctx.closePath()
  }
  body()
  ctx.fillStyle = '#f4f5fa'
  ctx.fill()
  ctx.save()
  body()
  ctx.clip()
  ctx.fillStyle = '#e8505b'
  ctx.fillRect(g.x - 12, g.y - 96, 24, 26)
  ctx.fillRect(g.x - 12, g.y - 24, 24, 5)
  ctx.fillStyle = 'rgba(40,50,90,0.13)'
  ctx.fillRect(g.x + 4, g.y - 96, 8, 92)
  ctx.restore()
  body()
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1.4
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(g.x - 11, g.y - 70)
  ctx.lineTo(g.x + 11, g.y - 70)
  ctx.moveTo(g.x - 11, g.y - 24)
  ctx.lineTo(g.x + 11, g.y - 24)
  ctx.moveTo(g.x - 11, g.y - 19)
  ctx.lineTo(g.x + 11, g.y - 19)
  ctx.lineWidth = 1
  ctx.stroke()
  ellipse(ctx, g.x, g.y - 50, 6, 6)
  fillStroke(ctx, '#6cc7ec', OUTLINE, 1.3)
  ellipse(ctx, g.x - 2, g.y - 52, 1.8, 1.4)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(g.x - 2.5, g.y - 30, 5, 28, 1.5)
  fillStroke(ctx, '#c93f4a', OUTLINE, 1.1)
}

function drawBigCrystal(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  softFx(ctx, 'under', (c) => {
    ellipse(c, g.x, g.y, 44, 19)
    c.fillStyle = 'rgba(143,227,255,0.35)'
    c.fill()
  })
  shard(ctx, { x: g.x - 21, y: g.y - 2 }, 40, 9, -11, '#c9a6ff')
  shard(ctx, { x: g.x + 21, y: g.y - 2 }, 44, 9, 11, '#c9a6ff')
  shard(ctx, { x: g.x, y: g.y }, 74, 13, 0, '#8fe3ff')
  shard(ctx, { x: g.x - 11, y: g.y + 9 }, 24, 6, -5, '#ff9ad5')
  shard(ctx, { x: g.x + 12, y: g.y + 8 }, 20, 5.5, 5, '#ff9ad5')
}

export function drawLandmark(ctx: Ctx, theme: WorldTheme, x: number, y: number, t: number) {
  switch (theme) {
    case 'jungle':
      return drawTemple(ctx, x, y)
    case 'desert':
      return drawPyramid(ctx, x, y)
    case 'snow':
      return drawIgloo(ctx, x, y)
    case 'volcano':
      return drawVolcano(ctx, x, y, t)
    case 'moon':
      return drawRocket(ctx, x, y)
    case 'crystal':
      return drawBigCrystal(ctx, x, y)
  }
}

export function drawDecor(ctx: Ctx, kind: DecorKind, x: number, y: number, size: number, biome: Biome) {
  switch (kind) {
    case 'palm':
      return drawPalm(ctx, x, y)
    case 'jungleTree':
      return drawTree(ctx, x, y, '#2f9a4a', 0)
    case 'bush':
      return drawBush(ctx, x, y, '#3c9d4c')
    case 'cactus':
      return drawCactus(ctx, x, y, size * 0.9)
    case 'rock':
      return drawRock(ctx, x, y, size, THEMES[biome].rock)
    case 'snowPine':
      return drawSnowPine(ctx, x, y)
    case 'snowman':
      return drawSnowman(ctx, x, y)
    case 'deadTree':
      return drawDeadTree(ctx, x, y)
    case 'flag':
      return drawFlag(ctx, x, y)
    case 'crystal':
      return drawCrystals(ctx, x, y, size)
    case 'shrooms':
      return drawShrooms(ctx, x, y)
    case 'oak':
      return drawTree(ctx, x, y, size > 1.05 ? '#6dbb5a' : '#5aa35a', 0)
    case 'pine':
      return drawPine(ctx, x, y, '#4f8f5e')
    case 'meadowBush':
      return drawBush(ctx, x, y, '#5cb85c')
    case 'flowers':
      return drawFlowers(ctx, x, y, size > 1 ? ['#ff7aa8', '#ffd84a', '#ffffff'] : ['#b78cff', '#ffffff', '#ffd84a'])
    case 'lava':
    case 'crater':
      return
  }
}

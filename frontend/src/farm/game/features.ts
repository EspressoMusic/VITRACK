import type { FeatureKind, Point } from '../types'
import { tileCenter } from './iso'
import { OUTLINE, blob, drawFlowers, drawTree, ellipse, fillStroke, groundShadow, hash, poly, softFx } from './sprites'
import { drawPalm, shard } from './worlds'

/** Points of interest out in the wild land between the city and the worlds: one per zone. Same style as sprites.ts. */

type Ctx = CanvasRenderingContext2D

/** Features that move (redrawn a few times a second instead of cached). */
export const ANIMATED_FEATURES = new Set<FeatureKind>(['windmill', 'balloon', 'campsite', 'hotSpring', 'beehives'])

/** How far the picture rises above its footprint, world units. */
export function featureRise(kind: FeatureKind): number {
  switch (kind) {
    case 'balloon':
      return 140
    case 'treehouse':
      return 120
    case 'windmill':
      return 100
    case 'observatory':
    case 'oasis':
      return 84
    default:
      return 64
  }
}

// ---------- the features ----------

function drawObservatory(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 36, 15)
  const rx = 26
  const ry = 12
  const wall = 24
  ctx.beginPath()
  ctx.moveTo(g.x - rx, g.y - wall)
  ctx.lineTo(g.x - rx, g.y)
  ctx.ellipse(g.x, g.y, rx, ry, 0, Math.PI, 0, true)
  ctx.lineTo(g.x + rx, g.y - wall)
  ctx.ellipse(g.x, g.y - wall, rx, ry, 0, 0, Math.PI)
  ctx.closePath()
  fillStroke(ctx, '#efe6d6', OUTLINE, 1.4)
  ctx.beginPath()
  ctx.roundRect(g.x - 11, g.y - 4, 9, 14, [4.5, 4.5, 0, 0])
  fillStroke(ctx, '#8a5a33', OUTLINE, 1.1)
  const dome = () => {
    ctx.beginPath()
    ctx.ellipse(g.x, g.y - wall, rx + 1, 28, 0, Math.PI, 0)
    ctx.ellipse(g.x, g.y - wall, rx + 1, ry + 0.5, 0, 0, Math.PI)
    ctx.closePath()
  }
  dome()
  ctx.fillStyle = '#c3cee3'
  ctx.fill()
  ctx.save()
  dome()
  ctx.clip()
  ctx.fillStyle = '#a9b6cf'
  ctx.fillRect(g.x + 8, g.y - wall - 30, 22, 46)
  ctx.fillStyle = '#2d3550'
  ctx.fillRect(g.x - 4, g.y - wall - 30, 8, 32)
  ctx.restore()
  dome()
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1.4
  ctx.stroke()
  ctx.save()
  ctx.translate(g.x, g.y - wall - 12)
  ctx.rotate(0.75)
  ctx.beginPath()
  ctx.roundRect(-3.5, -30, 7, 30, 2)
  fillStroke(ctx, '#f4f5fa', OUTLINE, 1.2)
  ctx.beginPath()
  ctx.roundRect(-4.5, -32, 9, 6, 1.5)
  fillStroke(ctx, '#e8505b', OUTLINE, 1.1)
  ctx.restore()
  softFx(ctx, 'over', (c) => {
    for (const [dx, dy, r] of [
      [-30, -70, 3.2],
      [18, -82, 2.4],
      [36, -60, 2],
    ]) {
      c.beginPath()
      c.moveTo(g.x + dx, g.y + dy - r * 1.6)
      c.quadraticCurveTo(g.x + dx, g.y + dy, g.x + dx + r * 1.6, g.y + dy)
      c.quadraticCurveTo(g.x + dx, g.y + dy, g.x + dx, g.y + dy + r * 1.6)
      c.quadraticCurveTo(g.x + dx, g.y + dy, g.x + dx - r * 1.6, g.y + dy)
      c.quadraticCurveTo(g.x + dx, g.y + dy, g.x + dx, g.y + dy - r * 1.6)
      c.fillStyle = '#fff3a0'
      c.fill()
    }
  })
}

function drawFrozenPond(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 3, 2)
  ellipse(ctx, g.x, g.y, 56, 24)
  fillStroke(ctx, '#ffffff', OUTLINE, 1.4)
  ellipse(ctx, g.x - 2, g.y + 1, 46, 18.5)
  fillStroke(ctx, '#bfe3f5', '#8fc3e0', 1.2)
  ellipse(ctx, g.x - 14, g.y - 4, 18, 5.5, -0.1)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fill()
  ctx.strokeStyle = '#8fc3e0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(g.x + 4, g.y + 3)
  ctx.lineTo(g.x + 12, g.y - 2)
  ctx.lineTo(g.x + 21, g.y)
  ctx.moveTo(g.x + 12, g.y - 2)
  ctx.lineTo(g.x + 14, g.y - 8)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.ellipse(g.x - 10, g.y + 4, 16, 6, 0.1, 0.3, Math.PI * 1.4)
  ctx.stroke()
  // a red sled on the snowy bank
  const s = { x: g.x + 32, y: g.y + 12 }
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(s.x - 11, s.y)
  ctx.lineTo(s.x + 8, s.y)
  ctx.quadraticCurveTo(s.x + 13, s.y, s.x + 12, s.y - 5)
  ctx.moveTo(s.x - 7, s.y)
  ctx.lineTo(s.x - 7, s.y - 4)
  ctx.moveTo(s.x + 4, s.y)
  ctx.lineTo(s.x + 4, s.y - 4)
  ctx.stroke()
  ctx.beginPath()
  ctx.roundRect(s.x - 11, s.y - 8, 19, 4.5, 1.5)
  fillStroke(ctx, '#e8505b', OUTLINE, 1.1)
  for (const [dx, dy, r] of [
    [-48, -2, 5],
    [-40, 12, 4],
    [44, -6, 4.5],
  ]) {
    ellipse(ctx, g.x + dx, g.y + dy - 2, r * 1.4, r)
    fillStroke(ctx, '#ffffff', OUTLINE, 1)
  }
}

function drawTreehouse(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 38, 15)
  ctx.beginPath()
  ctx.moveTo(g.x - 10, g.y + 2)
  ctx.quadraticCurveTo(g.x - 6, g.y - 30, g.x - 7, g.y - 64)
  ctx.lineTo(g.x + 7, g.y - 64)
  ctx.quadraticCurveTo(g.x + 6, g.y - 30, g.x + 10, g.y + 2)
  ctx.closePath()
  fillStroke(ctx, '#8a5a33')
  blob(ctx, [
    [g.x, g.y - 90, 26],
    [g.x - 26, g.y - 76, 19],
    [g.x + 26, g.y - 76, 19],
  ], '#2f9a4a')
  poly(ctx, [
    { x: g.x - 28, y: g.y - 48 },
    { x: g.x + 28, y: g.y - 48 },
    { x: g.x + 24, y: g.y - 42 },
    { x: g.x - 24, y: g.y - 42 },
  ])
  fillStroke(ctx, '#b07a45')
  ctx.beginPath()
  ctx.roundRect(g.x - 16, g.y - 68, 28, 20, 2)
  fillStroke(ctx, '#d9a35c')
  poly(ctx, [
    { x: g.x - 21, y: g.y - 67 },
    { x: g.x + 17, y: g.y - 67 },
    { x: g.x - 2, y: g.y - 84 },
  ])
  fillStroke(ctx, '#d9534a')
  ctx.beginPath()
  ctx.roundRect(g.x - 10, g.y - 63, 8, 7, 1.5)
  fillStroke(ctx, '#6cc7ec', OUTLINE, 1)
  ctx.beginPath()
  ctx.roundRect(g.x + 2, g.y - 62, 7, 14, [3.5, 3.5, 0, 0])
  fillStroke(ctx, '#8a5a33', OUTLINE, 1)
  blob(ctx, [
    [g.x + 22, g.y - 58, 9],
    [g.x - 24, g.y - 56, 7],
  ], '#3fa553')
  // ladder
  ctx.strokeStyle = '#7a4e2c'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (const dx of [12, 19]) {
    ctx.moveTo(g.x + dx, g.y - 43)
    ctx.lineTo(g.x + dx + 3, g.y + 4)
  }
  for (let k = 1; k < 6; k++) {
    const yy = g.y - 43 + k * 8
    const f = (k * 8) / 47
    ctx.moveTo(g.x + 12 + 3 * f, yy)
    ctx.lineTo(g.x + 19 + 3 * f, yy)
  }
  ctx.stroke()
}

function drawStoneCircle(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 3, 3)
  softFx(ctx, 'under', (c) => {
    ellipse(c, g.x, g.y, 66, 31)
    c.fillStyle = 'rgba(255,255,255,0.22)'
    c.fill()
  })
  const pieces: { y: number; draw: () => void }[] = [
    {
      y: g.y,
      draw: () => {
        ctx.beginPath()
        ctx.ellipse(g.x, g.y - 5, 15, 6.5, 0, Math.PI, 0)
        ctx.lineTo(g.x + 15, g.y)
        ctx.ellipse(g.x, g.y, 15, 6.5, 0, 0, Math.PI)
        ctx.closePath()
        fillStroke(ctx, '#aaa59a', OUTLINE, 1.3)
        ellipse(ctx, g.x, g.y - 5, 15, 6.5)
        fillStroke(ctx, '#d3cfc4', OUTLINE, 1.2)
      },
    },
  ]
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.2
    const px = g.x + Math.cos(a) * 52
    const py = g.y + Math.sin(a) * 24
    const h = 24 + hash(x + i, y, 9) * 10
    const w = 10
    pieces.push({
      y: py,
      draw: () => {
        groundShadow(ctx, { x: px, y: py }, 9, 3.5)
        ctx.beginPath()
        ctx.moveTo(px - w / 2, py + 1)
        ctx.lineTo(px - w / 2 + 1, py - h + 4)
        ctx.quadraticCurveTo(px, py - h - 2, px + w / 2 - 1, py - h + 4)
        ctx.lineTo(px + w / 2, py + 1)
        ctx.closePath()
        fillStroke(ctx, '#bdb8ac', OUTLINE, 1.3)
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(px - w / 2 + 2.5, py - 3)
        ctx.lineTo(px - w / 2 + 3, py - h + 6)
        ctx.stroke()
        if (i % 3 === 0) {
          ellipse(ctx, px + 1, py - h * 0.55, 3, 2.2)
          ctx.fillStyle = '#7fae5a'
          ctx.fill()
        }
      },
    })
  }
  pieces.sort((a, b) => a.y - b.y).forEach((p) => p.draw())
}

function drawBalloon(ctx: Ctx, x: number, y: number, t: number) {
  const c = tileCenter(x, y)
  softFx(ctx, 'under', (g) => {
    ellipse(g, c.x, c.y, 14, 5)
    g.fillStyle = 'rgba(30,40,10,0.15)'
    g.fill()
  })
  const bob = Math.sin(t * 0.9 + x) * 5
  const b = { x: c.x, y: c.y - 60 + bob }
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(b.x - 6, b.y)
  ctx.lineTo(b.x - 9, b.y - 16)
  ctx.moveTo(b.x + 6, b.y)
  ctx.lineTo(b.x + 9, b.y - 16)
  ctx.stroke()
  ctx.beginPath()
  ctx.roundRect(b.x - 7.5, b.y, 15, 11, 2)
  fillStroke(ctx, '#b07a45', OUTLINE, 1.2)
  ctx.strokeStyle = '#8a5a33'
  ctx.beginPath()
  ctx.moveTo(b.x - 7, b.y + 4)
  ctx.lineTo(b.x + 7, b.y + 4)
  ctx.stroke()
  const e = { x: b.x, y: b.y - 40 }
  const env = () => {
    ctx.beginPath()
    ctx.moveTo(e.x - 9, e.y + 23)
    ctx.bezierCurveTo(e.x - 32, e.y + 6, e.x - 30, e.y - 32, e.x, e.y - 32)
    ctx.bezierCurveTo(e.x + 30, e.y - 32, e.x + 32, e.y + 6, e.x + 9, e.y + 23)
    ctx.closePath()
  }
  env()
  ctx.fillStyle = '#ff7a7a'
  ctx.fill()
  ctx.save()
  env()
  ctx.clip()
  for (const [k, color] of [
    [-16, '#ffd84a'],
    [0, '#7fd1b9'],
    [16, '#ffd84a'],
  ] as const) {
    ellipse(ctx, e.x + k, e.y - 4, 5.5, 36)
    ctx.fillStyle = color
    ctx.fill()
  }
  ellipse(ctx, e.x - 12, e.y - 18, 6, 9, -0.4)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fill()
  ctx.restore()
  env()
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1.4
  ctx.stroke()
  ctx.beginPath()
  ctx.roundRect(e.x - 9, e.y + 21, 18, 4, 1.5)
  fillStroke(ctx, '#e8505b', OUTLINE, 1.1)
}

function drawPond(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 3, 2)
  ellipse(ctx, g.x, g.y, 52, 21)
  fillStroke(ctx, '#6cc7ec', OUTLINE, 1.4)
  ellipse(ctx, g.x + 4, g.y + 3, 38, 13)
  ctx.fillStyle = '#86d6f0'
  ctx.fill()
  ellipse(ctx, g.x - 16, g.y - 6, 14, 3.5, -0.08)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fill()
  for (const [dx, dy] of [
    [14, -6],
    [26, 4],
    [-6, 8],
  ]) {
    ellipse(ctx, g.x + dx, g.y + dy, 7, 3.4)
    fillStroke(ctx, '#5cb85c', OUTLINE, 0.9)
  }
  ellipse(ctx, g.x + 26, g.y + 2.5, 2.2, 1.6)
  ctx.fillStyle = '#ff9ad5'
  ctx.fill()
  // duck
  const d = { x: g.x - 2, y: g.y - 2 }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(d.x, d.y + 2, 11, 3.5, 0, 0, Math.PI * 2)
  ctx.stroke()
  ellipse(ctx, d.x, d.y, 7, 4.2)
  fillStroke(ctx, '#ffd84a', OUTLINE, 1)
  ellipse(ctx, d.x + 5, d.y - 5, 3.4, 3.4)
  fillStroke(ctx, '#ffd84a', OUTLINE, 1)
  poly(ctx, [
    { x: d.x + 8, y: d.y - 5.5 },
    { x: d.x + 12, y: d.y - 4.5 },
    { x: d.x + 8, y: d.y - 3.5 },
  ])
  fillStroke(ctx, '#ff9a3d', OUTLINE, 0.7)
  // reeds
  const r = { x: g.x - 44, y: g.y + 4 }
  for (const [dx, h] of [
    [-4, 22],
    [0, 27],
    [4, 19],
    [7, 24],
  ]) {
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 2.6
    ctx.beginPath()
    ctx.moveTo(r.x + dx, r.y)
    ctx.lineTo(r.x + dx, r.y - h)
    ctx.stroke()
    ctx.strokeStyle = '#4f8f5e'
    ctx.lineWidth = 1.3
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(r.x + dx - 1.8, r.y - h - 2, 3.6, 8, 1.8)
    fillStroke(ctx, '#8a5a33', OUTLINE, 0.8)
  }
}

function drawWindmill(ctx: Ctx, x: number, y: number, t: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 34, 14)
  const bw = 22
  const tw = 13
  const H = 58
  poly(ctx, [
    { x: g.x - bw, y: g.y },
    { x: g.x, y: g.y + 8 },
    { x: g.x, y: g.y - H + 6 },
    { x: g.x - tw, y: g.y - H },
  ])
  fillStroke(ctx, '#f3e6c9', OUTLINE, 1.3)
  poly(ctx, [
    { x: g.x, y: g.y + 8 },
    { x: g.x + bw, y: g.y },
    { x: g.x + tw, y: g.y - H },
    { x: g.x, y: g.y - H + 6 },
  ])
  fillStroke(ctx, '#dccaa4', OUTLINE, 1.3)
  poly(ctx, [
    { x: g.x - 14, y: g.y + 3 },
    { x: g.x - 6, y: g.y + 6 },
    { x: g.x - 6, y: g.y - 8 },
    { x: g.x - 14, y: g.y - 11 },
  ])
  fillStroke(ctx, '#8a5a33', OUTLINE, 1)
  poly(ctx, [
    { x: g.x - 12, y: g.y - 32 },
    { x: g.x - 6, y: g.y - 30 },
    { x: g.x - 6, y: g.y - 37 },
    { x: g.x - 12, y: g.y - 39 },
  ])
  fillStroke(ctx, '#6cc7ec', OUTLINE, 1)
  poly(ctx, [
    { x: g.x - tw - 4, y: g.y - H + 1 },
    { x: g.x, y: g.y - H + 9 },
    { x: g.x, y: g.y - H - 24 },
  ])
  fillStroke(ctx, '#e0625a', OUTLINE, 1.3)
  poly(ctx, [
    { x: g.x, y: g.y - H + 9 },
    { x: g.x + tw + 4, y: g.y - H + 1 },
    { x: g.x, y: g.y - H - 24 },
  ])
  fillStroke(ctx, '#c24a43', OUTLINE, 1.3)
  const hub = { x: g.x - 7, y: g.y - H + 12 }
  const a0 = t * 1.1
  for (let i = 0; i < 4; i++) {
    const a = a0 + (i * Math.PI) / 2
    const d = { x: Math.cos(a), y: Math.sin(a) }
    const n = { x: -d.y, y: d.x }
    const p = (along: number, side: number): Point => ({ x: hub.x + d.x * along + n.x * side, y: hub.y + d.y * along + n.y * side })
    poly(ctx, [p(7, 0), p(36, 0), p(36, 9), p(9, 9)])
    fillStroke(ctx, '#f6efe2', OUTLINE, 1.1)
    ctx.strokeStyle = '#c9b48f'
    ctx.lineWidth = 0.9
    ctx.beginPath()
    for (const k of [16, 26]) {
      ctx.moveTo(p(k, 0).x, p(k, 0).y)
      ctx.lineTo(p(k, 9).x, p(k, 9).y)
    }
    ctx.stroke()
    ctx.strokeStyle = '#8a5a33'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(hub.x, hub.y)
    ctx.lineTo(p(37, 0).x, p(37, 0).y)
    ctx.stroke()
  }
  ellipse(ctx, hub.x, hub.y, 3.4, 3.4)
  fillStroke(ctx, '#8a5a33', OUTLINE, 1)
}

function drawBeehives(ctx: Ctx, x: number, y: number, t: number) {
  const g = tileCenter(x, y, 2, 2)
  drawFlowers(ctx, x + 0.05, y + 1.05, ['#ff7aa8', '#ffd84a', '#ffffff'])
  drawFlowers(ctx, x + 1.05, y + 0.05, ['#b78cff', '#ffffff', '#ffd84a'])
  for (const [dx, dy] of [
    [14, -6],
    [-15, -1],
    [3, 9],
  ]) {
    const h = { x: g.x + dx, y: g.y + dy }
    groundShadow(ctx, h, 11, 4)
    ctx.beginPath()
    ctx.roundRect(h.x - 8, h.y - 10, 16, 10, 1.5)
    fillStroke(ctx, '#f2c14e', OUTLINE, 1.1)
    ctx.beginPath()
    ctx.roundRect(h.x - 7.5, h.y - 19, 15, 9, 1.5)
    fillStroke(ctx, '#f6d06a', OUTLINE, 1.1)
    poly(ctx, [
      { x: h.x - 10, y: h.y - 19 },
      { x: h.x + 10, y: h.y - 19 },
      { x: h.x + 8, y: h.y - 24 },
      { x: h.x - 8, y: h.y - 24 },
    ])
    fillStroke(ctx, '#b07a45', OUTLINE, 1.1)
    ctx.beginPath()
    ctx.roundRect(h.x - 3, h.y - 4, 6, 2, 1)
    ctx.fillStyle = '#3a2a14'
    ctx.fill()
  }
  softFx(ctx, 'over', (c) => {
    for (let i = 0; i < 4; i++) {
      const a = t * 2.6 + i * 1.6
      const bx = g.x + Math.cos(a) * (14 + i * 4)
      const by = g.y - 28 + Math.sin(a * 1.3) * 8
      ellipse(c, bx - 1, by - 2.4, 1.6, 1.1)
      c.fillStyle = 'rgba(255,255,255,0.85)'
      c.fill()
      ellipse(c, bx, by, 2, 1.5)
      c.fillStyle = '#ffd84a'
      c.fill()
      c.fillStyle = '#2b1d0e'
      c.fillRect(bx - 0.4, by - 1.5, 0.9, 3)
    }
  })
}

function drawRuins(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 36, 15)
  const column = (px: number, py: number, h: number, broken: boolean) => {
    groundShadow(ctx, { x: px, y: py }, 9, 3.5)
    ctx.beginPath()
    ctx.moveTo(px - 6, py)
    if (broken) {
      ctx.lineTo(px - 6, py - h)
      ctx.lineTo(px - 2, py - h + 4)
      ctx.lineTo(px + 1, py - h - 2)
      ctx.lineTo(px + 6, py - h + 3)
    } else {
      ctx.lineTo(px - 6, py - h)
      ctx.lineTo(px + 6, py - h)
    }
    ctx.lineTo(px + 6, py)
    ctx.ellipse(px, py, 6, 2.6, 0, 0, Math.PI)
    ctx.closePath()
    fillStroke(ctx, '#e8e2d2', OUTLINE, 1.2)
    ctx.strokeStyle = '#cfc7b3'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (const dx of [-2.5, 2]) {
      ctx.moveTo(px + dx, py + 1)
      ctx.lineTo(px + dx, py - h + 5)
    }
    ctx.stroke()
    if (!broken) {
      ctx.beginPath()
      ctx.roundRect(px - 8.5, py - h - 4, 17, 5, 1.5)
      fillStroke(ctx, '#efe9da', OUTLINE, 1.1)
    }
  }
  column(g.x - 18, g.y - 6, 46, false)
  column(g.x + 17, g.y - 8, 30, true)
  blob(ctx, [
    [g.x - 15, g.y - 50, 4.5],
    [g.x - 20, g.y - 46, 3.5],
  ], '#5cae5a')
  column(g.x - 1, g.y + 9, 18, true)
  ctx.save()
  ctx.translate(g.x + 18, g.y + 9)
  ctx.rotate(-0.4)
  ctx.beginPath()
  ctx.roundRect(-16, -5.5, 32, 11, 5)
  fillStroke(ctx, '#e2dccd', OUTLINE, 1.2)
  ellipse(ctx, 16, 0, 3, 5.5)
  fillStroke(ctx, '#d3ccb9', OUTLINE, 1)
  ctx.restore()
  for (const [dx, dy, r] of [
    [-30, 6, 3.5],
    [-24, 12, 2.6],
    [30, -2, 3],
  ]) {
    ellipse(ctx, g.x + dx, g.y + dy, r * 1.3, r)
    fillStroke(ctx, '#d3ccb9', OUTLINE, 1)
  }
}

function drawMushrooms(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  for (const [dx, dy, s] of [
    [14, -6, 0.75],
    [-14, -3, 1],
    [2, 8, 1.35],
  ]) {
    const p = { x: g.x + dx, y: g.y + dy }
    groundShadow(ctx, p, 12 * s, 5 * s)
    ctx.beginPath()
    ctx.moveTo(p.x - 4 * s, p.y)
    ctx.quadraticCurveTo(p.x - 6 * s, p.y - 14 * s, p.x - 3.5 * s, p.y - 22 * s)
    ctx.lineTo(p.x + 3.5 * s, p.y - 22 * s)
    ctx.quadraticCurveTo(p.x + 6 * s, p.y - 14 * s, p.x + 4 * s, p.y)
    ctx.closePath()
    fillStroke(ctx, '#f6efe2', OUTLINE, 1.2)
    ctx.beginPath()
    ctx.ellipse(p.x, p.y - 22 * s, 15 * s, 13 * s, 0, Math.PI, 0)
    ctx.ellipse(p.x, p.y - 22 * s, 15 * s, 4 * s, 0, 0, Math.PI)
    ctx.closePath()
    fillStroke(ctx, '#e8505b', OUTLINE, 1.3)
    ctx.fillStyle = '#ffffff'
    for (const [ox, oy, r] of [
      [-7, -27, 2.4],
      [3, -31, 2],
      [8, -25, 1.8],
      [-1, -24, 1.4],
    ]) {
      ellipse(ctx, p.x + ox * s, p.y + oy * s, r * s, r * s * 0.8)
      ctx.fill()
    }
  }
}

function drawCampsite(ctx: Ctx, x: number, y: number, t: number) {
  const g = tileCenter(x, y, 2, 2)
  const tx = g.x - 12
  const ty = g.y + 2
  groundShadow(ctx, { x: tx + 8, y: ty - 4 }, 28, 10)
  poly(ctx, [
    { x: tx + 16, y: ty },
    { x: tx + 34, y: ty - 9 },
    { x: tx + 18, y: ty - 37 },
    { x: tx, y: ty - 28 },
  ])
  fillStroke(ctx, '#d97a2f', OUTLINE, 1.3)
  poly(ctx, [
    { x: tx - 16, y: ty },
    { x: tx + 16, y: ty },
    { x: tx, y: ty - 28 },
  ])
  fillStroke(ctx, '#f08a3a', OUTLINE, 1.3)
  poly(ctx, [
    { x: tx - 6, y: ty },
    { x: tx + 6, y: ty },
    { x: tx, y: ty - 17 },
  ])
  fillStroke(ctx, '#5a3d1e', OUTLINE, 1)
  // log seat
  ctx.beginPath()
  ctx.roundRect(g.x + 2, g.y + 12, 20, 6, 3)
  fillStroke(ctx, '#a8743f', OUTLINE, 1.1)
  // campfire
  const f = { x: g.x + 18, y: g.y + 2 }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    ellipse(ctx, f.x + Math.cos(a) * 9, f.y + Math.sin(a) * 4, 2.8, 2)
    fillStroke(ctx, '#a39d94', OUTLINE, 0.9)
  }
  ctx.save()
  ctx.translate(f.x, f.y - 1)
  for (const r of [0.5, -0.5]) {
    ctx.save()
    ctx.rotate(r)
    ctx.beginPath()
    ctx.roundRect(-8, -1.8, 16, 3.6, 1.8)
    fillStroke(ctx, '#8a5a33', OUTLINE, 0.9)
    ctx.restore()
  }
  ctx.restore()
  const k = 1 + Math.sin(t * 9) * 0.12
  const flame = (w: number, h: number, color: string) => {
    ctx.beginPath()
    ctx.moveTo(f.x - w, f.y - 2)
    ctx.quadraticCurveTo(f.x - w, f.y - h * 0.6 * k, f.x + Math.sin(t * 6) * 1.5, f.y - h * k)
    ctx.quadraticCurveTo(f.x + w, f.y - h * 0.6 * k, f.x + w, f.y - 2)
    ctx.closePath()
    fillStroke(ctx, color, null)
  }
  flame(6, 16, '#ff9a3d')
  flame(3.4, 10, '#ffd84a')
  softFx(ctx, 'over', (c) => {
    for (let i = 0; i < 3; i++) {
      const s = (t * 0.35 + i / 3) % 1
      ellipse(c, f.x + Math.sin(s * 5 + i) * 4, f.y - 20 - s * 30, 3 + s * 6, 2.5 + s * 5)
      c.fillStyle = `rgba(200,200,205,${0.5 * (1 - s)})`
      c.fill()
    }
  })
}

function drawOrchard(ctx: Ctx, x: number, y: number) {
  const apples: [number, number][] = [
    [-9, -28],
    [6, -36],
    [11, -24],
    [-2, -42],
    [-13, -21],
  ]
  for (const [tx, ty] of [
    [x, y],
    [x + 1, y + 1],
    [x + 2, y],
  ]) {
    drawTree(ctx, tx, ty, '#5cb85c', 0)
    const c = tileCenter(tx, ty)
    for (const [dx, dy] of apples) {
      ellipse(ctx, c.x + dx, c.y + dy, 2.5, 2.5)
      fillStroke(ctx, '#e8505b', OUTLINE, 0.8)
    }
  }
  const b = tileCenter(x + 2, y + 1)
  ctx.beginPath()
  ctx.roundRect(b.x - 9, b.y - 9, 18, 10, 2)
  fillStroke(ctx, '#b07a45', OUTLINE, 1.1)
  for (const dx of [-4, 1, 6]) {
    ellipse(ctx, b.x + dx - 1, b.y - 10, 3, 3)
    fillStroke(ctx, '#e8505b', OUTLINE, 0.8)
  }
}

function drawWell(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 18, 7)
  ctx.beginPath()
  ctx.roundRect(c.x - 13.5, c.y - 38, 3, 28, 1)
  fillStroke(ctx, '#8a5a33', OUTLINE, 1)
  ctx.beginPath()
  ctx.roundRect(c.x + 10.5, c.y - 38, 3, 28, 1)
  fillStroke(ctx, '#8a5a33', OUTLINE, 1)
  ctx.beginPath()
  ctx.moveTo(c.x - 14, c.y - 12)
  ctx.lineTo(c.x - 14, c.y)
  ctx.ellipse(c.x, c.y, 14, 7, 0, Math.PI, 0, true)
  ctx.lineTo(c.x + 14, c.y - 12)
  ctx.ellipse(c.x, c.y - 12, 14, 7, 0, 0, Math.PI)
  ctx.closePath()
  fillStroke(ctx, '#b9b4a8', OUTLINE, 1.3)
  ctx.strokeStyle = '#9a958a'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(c.x, c.y - 6, 14, 7, 0, 0.2, Math.PI - 0.2)
  for (const dx of [-8, 0, 8]) {
    ctx.moveTo(c.x + dx, c.y - 5 + 6.5 * Math.sqrt(1 - (dx / 14) ** 2))
    ctx.lineTo(c.x + dx + 1, c.y + 6.5 * Math.sqrt(1 - (dx / 14) ** 2))
  }
  ctx.stroke()
  ellipse(ctx, c.x, c.y - 12, 14, 7)
  fillStroke(ctx, '#cfcabe', OUTLINE, 1.2)
  ellipse(ctx, c.x, c.y - 11.5, 10, 4.6)
  ctx.fillStyle = '#3d6f8f'
  ctx.fill()
  ctx.strokeStyle = '#7a4e2c'
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(c.x - 11, c.y - 30)
  ctx.lineTo(c.x + 11, c.y - 30)
  ctx.stroke()
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 0.9
  ctx.beginPath()
  ctx.moveTo(c.x + 2, c.y - 30)
  ctx.lineTo(c.x + 2, c.y - 22)
  ctx.stroke()
  ctx.beginPath()
  ctx.roundRect(c.x - 1.5, c.y - 22, 7, 6, 1)
  fillStroke(ctx, '#a8743f', OUTLINE, 0.9)
  poly(ctx, [
    { x: c.x - 19, y: c.y - 35 },
    { x: c.x + 19, y: c.y - 35 },
    { x: c.x, y: c.y - 50 },
  ])
  fillStroke(ctx, '#d9534a', OUTLINE, 1.2)
}

function drawTreasure(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  softFx(ctx, 'under', (g) => {
    ellipse(g, c.x, c.y - 10, 22, 14)
    g.fillStyle = 'rgba(255,215,80,0.25)'
    g.fill()
  })
  ellipse(ctx, c.x, c.y + 1, 18, 7)
  fillStroke(ctx, '#c9a26a', OUTLINE, 1.2)
  poly(ctx, [
    { x: c.x - 11, y: c.y - 11 },
    { x: c.x + 11, y: c.y - 11 },
    { x: c.x + 9, y: c.y - 23 },
    { x: c.x - 9, y: c.y - 23 },
  ])
  fillStroke(ctx, '#8a5a33', OUTLINE, 1.1)
  ellipse(ctx, c.x, c.y - 11, 10, 3.2)
  fillStroke(ctx, '#ffd34d', OUTLINE, 0.9)
  for (const [dx, dy] of [
    [-5, -13],
    [2, -14.5],
    [6, -12.5],
  ]) {
    ellipse(ctx, c.x + dx, c.y + dy, 2.4, 1.6)
    fillStroke(ctx, '#ffcf4a', OUTLINE, 0.7)
  }
  ctx.beginPath()
  ctx.roundRect(c.x - 11, c.y - 11, 22, 12, 2)
  fillStroke(ctx, '#a8743f', OUTLINE, 1.2)
  ctx.fillStyle = '#ffcf4a'
  ctx.fillRect(c.x - 8, c.y - 11, 2.4, 12)
  ctx.fillRect(c.x + 5.6, c.y - 11, 2.4, 12)
  ctx.beginPath()
  ctx.roundRect(c.x - 2.2, c.y - 8, 4.4, 5, 1)
  fillStroke(ctx, '#ffcf4a', OUTLINE, 0.8)
}

function drawPumpkin(ctx: Ctx, p: Point, s: number) {
  ellipse(ctx, p.x, p.y - 5 * s, 9 * s, 6.5 * s)
  fillStroke(ctx, '#f08a3a', OUTLINE, 1.1)
  ctx.strokeStyle = '#d06a1f'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(p.x, p.y - 5 * s, 4 * s, 6.2 * s, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.roundRect(p.x - 1.2 * s, p.y - 14 * s, 2.4 * s, 4 * s, 1)
  fillStroke(ctx, '#5a7a2a', OUTLINE, 0.8)
}

function drawScarecrow(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  drawPumpkin(ctx, { x: g.x + 22, y: g.y - 8 }, 0.7)
  drawPumpkin(ctx, { x: g.x - 20, y: g.y - 2 }, 1)
  const s = { x: g.x + 2, y: g.y - 2 }
  groundShadow(ctx, s, 12, 4)
  ctx.beginPath()
  ctx.roundRect(s.x - 1.5, s.y - 40, 3, 41, 1)
  fillStroke(ctx, '#8a5a33', OUTLINE, 1)
  ctx.beginPath()
  ctx.roundRect(s.x - 17, s.y - 31, 34, 3, 1)
  fillStroke(ctx, '#8a5a33', OUTLINE, 1)
  ctx.strokeStyle = '#e6c25a'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  for (const side of [-1, 1]) {
    ctx.moveTo(s.x + side * 16, s.y - 29.5)
    ctx.lineTo(s.x + side * 21, s.y - 33)
    ctx.moveTo(s.x + side * 16, s.y - 29.5)
    ctx.lineTo(s.x + side * 21, s.y - 27)
  }
  ctx.stroke()
  poly(ctx, [
    { x: s.x - 14, y: s.y - 32 },
    { x: s.x + 14, y: s.y - 32 },
    { x: s.x + 9, y: s.y - 14 },
    { x: s.x - 9, y: s.y - 14 },
  ])
  fillStroke(ctx, '#5b8fd6', OUTLINE, 1.2)
  ctx.beginPath()
  ctx.roundRect(s.x + 2, s.y - 24, 5, 5, 0.5)
  fillStroke(ctx, '#e8505b', OUTLINE, 0.8)
  ellipse(ctx, s.x, s.y - 38, 6.5, 6.5)
  fillStroke(ctx, '#e6c88e', OUTLINE, 1.1)
  ctx.fillStyle = OUTLINE
  for (const dx of [-2.4, 2.4]) {
    ellipse(ctx, s.x + dx, s.y - 39, 0.9, 0.9)
    ctx.fill()
  }
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(s.x - 2.5, s.y - 35.5)
  ctx.lineTo(s.x + 2.5, s.y - 35.5)
  ctx.stroke()
  ellipse(ctx, s.x, s.y - 43, 11, 3)
  fillStroke(ctx, '#d9b04a', OUTLINE, 1)
  ctx.beginPath()
  ctx.roundRect(s.x - 6, s.y - 52, 12, 9, 3)
  fillStroke(ctx, '#d9b04a', OUTLINE, 1)
  ctx.fillStyle = '#e8505b'
  ctx.fillRect(s.x - 6, s.y - 46, 12, 2)
  drawPumpkin(ctx, { x: g.x + 18, y: g.y + 6 }, 0.85)
  drawPumpkin(ctx, { x: g.x - 4, y: g.y + 13 }, 1.15)
}

function drawSignpost(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 11, 4)
  ctx.beginPath()
  ctx.roundRect(c.x - 2.5, c.y - 52, 5, 53, 1.5)
  fillStroke(ctx, '#a8743f', OUTLINE, 1.1)
  for (const [yy, dir, color] of [
    [-46, -1, '#c2c6d2'],
    [-36, 1, '#f4d690'],
    [-26, -1, '#7fd1b9'],
    [-16, 1, '#ff9ad5'],
  ] as const) {
    const y0 = c.y + yy
    const pts =
      dir === 1
        ? [
            { x: c.x - 5, y: y0 - 4 },
            { x: c.x + 16, y: y0 - 4 },
            { x: c.x + 21, y: y0 },
            { x: c.x + 16, y: y0 + 4 },
            { x: c.x - 5, y: y0 + 4 },
          ]
        : [
            { x: c.x + 5, y: y0 - 4 },
            { x: c.x - 16, y: y0 - 4 },
            { x: c.x - 21, y: y0 },
            { x: c.x - 16, y: y0 + 4 },
            { x: c.x + 5, y: y0 + 4 },
          ]
    poly(ctx, pts)
    fillStroke(ctx, color, OUTLINE, 1.1)
    ctx.fillStyle = 'rgba(43,29,14,0.45)'
    ctx.fillRect(c.x + dir * 4 - (dir === 1 ? 0 : 9), y0 - 0.6, 9, 1.2)
  }
  ellipse(ctx, c.x, c.y - 52, 3.4, 2)
  fillStroke(ctx, '#8a5a33', OUTLINE, 1)
}

function drawHotSpring(ctx: Ctx, x: number, y: number, t: number) {
  const g = tileCenter(x, y, 3, 2)
  const stones = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + 0.15
    return { x: g.x + Math.cos(a) * 46, y: g.y + Math.sin(a) * 19, r: 4.5 + hash(i, x, 3) * 2.5 }
  })
  const stone = (s: { x: number; y: number; r: number }) => {
    ellipse(ctx, s.x, s.y - s.r * 0.4, s.r * 1.5, s.r)
    fillStroke(ctx, '#8d8780', OUTLINE, 1.1)
  }
  stones.filter((s) => s.y < g.y).forEach(stone)
  ellipse(ctx, g.x, g.y, 42, 17)
  fillStroke(ctx, '#7fd8d0', OUTLINE, 1.3)
  ellipse(ctx, g.x + 4, g.y + 3, 30, 10)
  ctx.fillStyle = '#9be6de'
  ctx.fill()
  ellipse(ctx, g.x - 14, g.y - 5, 12, 3, -0.05)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fill()
  stones.filter((s) => s.y >= g.y).forEach(stone)
  softFx(ctx, 'over', (c) => {
    for (let i = 0; i < 4; i++) {
      const k = (t * 0.3 + i / 4) % 1
      ellipse(c, g.x - 20 + i * 13 + Math.sin(k * 4 + i) * 3, g.y - 6 - k * 36, 6 + k * 8, 4 + k * 6)
      c.fillStyle = `rgba(255,255,255,${0.55 * (1 - k)})`
      c.fill()
    }
  })
}

function drawGeode(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 2, 2)
  groundShadow(ctx, g, 36, 14)
  softFx(ctx, 'under', (c) => {
    ellipse(c, g.x, g.y - 6, 40, 22)
    c.fillStyle = 'rgba(201,166,255,0.28)'
    c.fill()
  })
  ctx.beginPath()
  ctx.moveTo(g.x - 30, g.y + 4)
  ctx.quadraticCurveTo(g.x - 36, g.y - 30, g.x - 4, g.y - 42)
  ctx.quadraticCurveTo(g.x + 32, g.y - 40, g.x + 31, g.y + 4)
  ctx.quadraticCurveTo(g.x, g.y + 14, g.x - 30, g.y + 4)
  ctx.closePath()
  fillStroke(ctx, '#6e6872', OUTLINE, 1.4)
  ellipse(ctx, g.x + 1, g.y - 16, 22, 19)
  fillStroke(ctx, '#3a2a5a', OUTLINE, 1.2)
  ellipse(ctx, g.x + 1, g.y - 16, 17, 14)
  ctx.fillStyle = '#4c3874'
  ctx.fill()
  shard(ctx, { x: g.x - 8, y: g.y - 6 }, 20, 5, -5, '#c9a6ff')
  shard(ctx, { x: g.x + 8, y: g.y - 7 }, 24, 5.5, 4, '#8fe3ff')
  shard(ctx, { x: g.x, y: g.y - 3 }, 14, 4.2, 0, '#ff9ad5')
  ellipse(ctx, g.x - 18, g.y - 30, 6, 3, -0.6)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fill()
}

function drawOasis(ctx: Ctx, x: number, y: number) {
  const g = tileCenter(x, y, 3, 3)
  ellipse(ctx, g.x, g.y, 64, 29)
  fillStroke(ctx, '#8fcf6a', OUTLINE, 1.3)
  drawPalm(ctx, x + 0.3, y + 0.3)
  ellipse(ctx, g.x + 4, g.y + 2, 44, 18)
  fillStroke(ctx, '#6cc7ec', OUTLINE, 1.3)
  ellipse(ctx, g.x - 8, g.y - 3, 16, 4.5, -0.05)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fill()
  drawPalm(ctx, x + 0.6, y + 2.2)
  drawPalm(ctx, x + 2.3, y + 0.8)
}

export function drawFeature(ctx: Ctx, kind: FeatureKind, x: number, y: number, t: number) {
  switch (kind) {
    case 'observatory':
      return drawObservatory(ctx, x, y)
    case 'frozenPond':
      return drawFrozenPond(ctx, x, y)
    case 'treehouse':
      return drawTreehouse(ctx, x, y)
    case 'stoneCircle':
      return drawStoneCircle(ctx, x, y)
    case 'balloon':
      return drawBalloon(ctx, x, y, t)
    case 'pond':
      return drawPond(ctx, x, y)
    case 'windmill':
      return drawWindmill(ctx, x, y, t)
    case 'beehives':
      return drawBeehives(ctx, x, y, t)
    case 'ruins':
      return drawRuins(ctx, x, y)
    case 'mushrooms':
      return drawMushrooms(ctx, x, y)
    case 'campsite':
      return drawCampsite(ctx, x, y, t)
    case 'orchard':
      return drawOrchard(ctx, x, y)
    case 'well':
      return drawWell(ctx, x, y)
    case 'treasure':
      return drawTreasure(ctx, x, y)
    case 'scarecrow':
      return drawScarecrow(ctx, x, y)
    case 'signpost':
      return drawSignpost(ctx, x, y)
    case 'hotSpring':
      return drawHotSpring(ctx, x, y, t)
    case 'geode':
      return drawGeode(ctx, x, y)
    case 'oasis':
      return drawOasis(ctx, x, y)
  }
}

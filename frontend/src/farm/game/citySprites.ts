import type { ObjectLook, Point } from '../types'
import { tileCenter, tileToWorld } from './iso'
import {
  LW,
  OUTLINE,
  drawFlowers,
  drawTree,
  ellipse,
  fillStroke,
  groundShadow,
  hash,
  insetCorners,
  lerp,
  poly,
  shade,
  softFx,
  up,
} from './sprites'

/** City pieces: the wall, the gate, shops, parks, and the wild land outside the gate. Same placeholder style as sprites.ts. */

type Ctx = CanvasRenderingContext2D

const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'

/** A point `h` world units above tile coordinate (x, y). */
const at = (x: number, y: number, h = 0): Point => up(tileToWorld(x, y), h)

/** Box over tiles x0..x1 × y0..y1, from height h0 up to h1. Draws the two walls facing the viewer and the top. */
export function isoBox(ctx: Ctx, x0: number, x1: number, y0: number, y1: number, h0: number, h1: number, top: string, left: string, right: string, lw = LW) {
  poly(ctx, [at(x0, y1, h0), at(x1, y1, h0), at(x1, y1, h1), at(x0, y1, h1)])
  fillStroke(ctx, left, OUTLINE, lw)
  poly(ctx, [at(x1, y1, h0), at(x1, y0, h0), at(x1, y0, h1), at(x1, y1, h1)])
  fillStroke(ctx, right, OUTLINE, lw)
  poly(ctx, [at(x0, y0, h1), at(x1, y0, h1), at(x1, y1, h1), at(x0, y1, h1)])
  fillStroke(ctx, top, OUTLINE, lw)
}

export function drawHeart(ctx: Ctx, cx: number, cy: number, size: number, color: string) {
  const s = size
  ctx.beginPath()
  ctx.moveTo(cx, cy + s * 0.9)
  ctx.bezierCurveTo(cx - s * 1.25, cy + s * 0.05, cx - s * 0.75, cy - s * 0.95, cx, cy - s * 0.35)
  ctx.bezierCurveTo(cx + s * 0.75, cy - s * 0.95, cx + s * 1.25, cy + s * 0.05, cx, cy + s * 0.9)
  ctx.closePath()
  fillStroke(ctx, color, OUTLINE, 1.1)
}

// ---------- city wall ----------

export const WALL_H = 14
const WALL = '#f3e6c9'
const WALL_CAP = '#fbf4e2'
const WALL_LINE = '#dcc8a2'
const POST_BALL = '#7fd1b9'

/** One tile-long piece of wall on the edge from (ax, ay) to (bx, by), tile coords. */
export function drawWallSegment(ctx: Ctx, ax: number, ay: number, bx: number, by: number) {
  const alongX = ay === by
  const A = tileToWorld(ax, ay)
  const B = tileToWorld(bx, by)
  poly(ctx, [A, B, up(B, WALL_H), up(A, WALL_H)])
  fillStroke(ctx, alongX ? WALL : shade(WALL, 0.84))
  const o = alongX ? tileToWorld(0, -0.14) : tileToWorld(-0.14, 0)
  const At = up(A, WALL_H)
  const Bt = up(B, WALL_H)
  poly(ctx, [At, Bt, { x: Bt.x + o.x, y: Bt.y + o.y }, { x: At.x + o.x, y: At.y + o.y }])
  fillStroke(ctx, WALL_CAP)
  // brick joints
  ctx.strokeStyle = WALL_LINE
  ctx.lineWidth = 1
  ctx.beginPath()
  const m1 = up(A, WALL_H * 0.5)
  const m2 = up(B, WALL_H * 0.5)
  ctx.moveTo(m1.x, m1.y)
  ctx.lineTo(m2.x, m2.y)
  for (const [f, h0, h1] of [
    [0.33, 2, WALL_H * 0.5],
    [0.66, 2, WALL_H * 0.5],
    [0.17, WALL_H * 0.5, WALL_H - 2],
    [0.5, WALL_H * 0.5, WALL_H - 2],
    [0.83, WALL_H * 0.5, WALL_H - 2],
  ]) {
    const p = lerp(A, B, f)
    ctx.moveTo(p.x, p.y - h0)
    ctx.lineTo(p.x, p.y - h1)
  }
  ctx.stroke()
}

/** Pillar where two wall pieces meet. */
export function drawWallPost(ctx: Ctx, vx: number, vy: number) {
  isoBox(ctx, vx - 0.09, vx + 0.09, vy - 0.09, vy + 0.09, 0, WALL_H + 5, WALL_CAP, WALL, shade(WALL, 0.84), 1.3)
  const top = at(vx, vy, WALL_H + 9)
  ellipse(ctx, top.x, top.y, 3.6, 3.6)
  fillStroke(ctx, POST_BALL, OUTLINE, 1.2)
  ellipse(ctx, top.x - 1.2, top.y - 1.2, 1.1, 1.1)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fill()
}

// ---------- city gate (3 tiles along x, 1 deep; its front faces the outside) ----------

const GATE_STYLES = [
  { stone: '#f3e6c9', cap: '#fbf4e2', door: '#b47c48', band: '#7a4e2c', tower: 50, arch: 38, doorH: 28 },
  { stone: '#e3e9f1', cap: '#f6f8fb', door: '#8a5a33', band: '#5f6b7a', tower: 57, arch: 42, doorH: 30, roof: '#5b8def', flag: '#ffcf4a' },
  { stone: '#fdfaff', cap: '#ffffff', door: '#4fb3a9', band: '#e8b23a', tower: 62, arch: 46, doorH: 32, roof: '#f2c14e', flag: '#7fd1b9' },
]

export function drawGate(ctx: Ctx, x: number, y: number, t: number, level: number, health: number) {
  const st = GATE_STYLES[Math.max(1, Math.min(GATE_STYLES.length, level)) - 1]
  const P = (s: number, d: number, h = 0) => at(x + s, y + d, h)
  const side = shade(st.stone, 0.8)
  const c = tileCenter(x, y, 3, 1)
  groundShadow(ctx, { x: c.x + 4, y: c.y + 4 }, 62, 22)

  const tower = (s0: number, s1: number) => {
    const H = st.tower
    isoBox(ctx, x + s0, x + s1, y + 0.04, y + 1, 0, H, st.cap, st.stone, side)
    const sm = (s0 + s1) / 2
    // arrow-slit windows
    poly(ctx, [P(sm - 0.09, 1, H * 0.46), P(sm + 0.09, 1, H * 0.46), P(sm + 0.09, 1, H * 0.7), P(sm - 0.09, 1, H * 0.7)])
    fillStroke(ctx, '#5a4632', OUTLINE, 1.1)
    poly(ctx, [P(s1, 0.62, H * 0.5), P(s1, 0.42, H * 0.5), P(s1, 0.42, H * 0.7), P(s1, 0.62, H * 0.7)])
    fillStroke(ctx, '#4a3828', OUTLINE, 1.1)
    // stone joints
    ctx.strokeStyle = shade(st.stone, 0.88)
    ctx.lineWidth = 1
    ctx.beginPath()
    for (const f of [0.28, 0.86]) {
      const a = P(s0, 1, H * f)
      const b = P(s1, 1, H * f)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    }
    ctx.stroke()
    if (health < 0.45) {
      ctx.strokeStyle = '#6b5a45'
      ctx.lineWidth = 1.3
      ctx.beginPath()
      const a = P(s0 + 0.2, 1, H * 0.95)
      ctx.moveTo(a.x, a.y)
      for (const [ds, f] of [[0.32, 0.8], [0.24, 0.66], [0.38, 0.54], [0.3, 0.4]]) {
        const p = P(s0 + ds, 1, H * f)
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
    // top: battlements (level 1), pointed roof (level 2) or dome (level 3)
    if (level <= 1) {
      const m = 0.26
      for (const [ms, md] of [
        [s0, 0.04],
        [s1 - m, 0.04],
        [s0, 1 - m],
        [s1 - m, 1 - m],
      ]) {
        isoBox(ctx, x + ms, x + ms + m, y + md, y + md + m, H, H + 7, st.cap, st.stone, side, 1.2)
      }
    } else if (level === 2) {
      const peak = P(sm, 0.52, H + 28)
      const o = 0.05
      poly(ctx, [P(s0 - o, 1 + o, H), P(s1 + o, 1 + o, H), peak])
      fillStroke(ctx, st.roof!)
      poly(ctx, [P(s1 + o, 1 + o, H), P(s1 + o, 0.04 - o, H), peak])
      fillStroke(ctx, shade(st.roof!, 0.75))
      flag(ctx, peak, t, st.flag!)
    } else {
      const base = P(sm, 0.52, H)
      ctx.beginPath()
      ctx.ellipse(base.x, base.y, 17, 20, 0, Math.PI, Math.PI * 2)
      ctx.ellipse(base.x, base.y, 17, 6, 0, 0, Math.PI)
      fillStroke(ctx, st.roof!)
      ellipse(ctx, base.x - 6, base.y - 11, 4, 6, -0.4)
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.fill()
      flag(ctx, { x: base.x, y: base.y - 19 }, t, st.flag!)
    }
  }

  tower(0, 0.96)

  // middle section with the doors
  const AH = st.arch
  const d = 0.95
  isoBox(ctx, x + 0.96, x + 2.04, y + 0.25, y + d, 0, AH, st.cap, st.stone, side)
  const DH = st.doorH
  const dh0 = DH - 9
  const door: Point[] = [P(1.17, d, 0), P(1.17, d, dh0)]
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI - (i / 10) * Math.PI
    door.push(P(1.5 + 0.33 * Math.cos(a), d, dh0 + 9 * Math.sin(a)))
  }
  door.push(P(1.83, d, dh0), P(1.83, d, 0))
  const broken = health < 0.01
  poly(ctx, door)
  fillStroke(ctx, broken ? shade(st.door, 0.6) : st.door, OUTLINE, 1.8)
  ctx.strokeStyle = shade(st.door, 0.7)
  ctx.lineWidth = 1.1
  ctx.beginPath()
  for (const s of [1.33, 1.5, 1.67]) {
    const a = P(s, d, 0)
    const b = P(s, d, s === 1.5 ? DH : dh0 + 6)
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  }
  ctx.stroke()
  ctx.strokeStyle = st.band
  ctx.lineWidth = 2.2
  ctx.beginPath()
  for (const h of [6, dh0 - 2]) {
    const a = P(1.19, d, h)
    const b = P(1.81, d, h)
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  }
  ctx.stroke()
  for (const s of [1.44, 1.56]) {
    const k = P(s, d, 12)
    ellipse(ctx, k.x, k.y, 1.5, 1.5)
    fillStroke(ctx, st.band, OUTLINE, 0.8)
  }
  if (broken) {
    ctx.strokeStyle = '#2b1d0e'
    ctx.lineWidth = 1.6
    ctx.beginPath()
    const a = P(1.38, d, DH - 4)
    ctx.moveTo(a.x, a.y)
    for (const [s, h] of [[1.5, DH * 0.62], [1.42, DH * 0.42], [1.58, DH * 0.2]]) {
      const p = P(s, d, h)
      ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()
  }
  if (level >= 3 && !broken) {
    // healing shield over the doorway
    const pulse = 0.25 + Math.sin(t * 2.4) * 0.08
    poly(ctx, door)
    ctx.fillStyle = `rgba(127,231,220,${pulse})`
    ctx.fill()
    ctx.strokeStyle = 'rgba(160,245,235,0.9)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
  // battlements along the arch
  if (level <= 2) {
    for (const s of [1.0, 1.39, 1.78]) isoBox(ctx, x + s, x + s + 0.22, y + 0.72, y + d, AH, AH + 6, st.cap, st.stone, side, 1.2)
  }

  tower(2.04, 3)
}

function flag(ctx: Ctx, base: Point, t: number, color: string) {
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(base.x, base.y)
  ctx.lineTo(base.x, base.y - 13)
  ctx.stroke()
  const wave = Math.sin(t * 4 + base.x) * 1.5
  poly(ctx, [
    { x: base.x, y: base.y - 13 },
    { x: base.x + 10, y: base.y - 10.5 + wave },
    { x: base.x, y: base.y - 7.5 },
  ])
  fillStroke(ctx, color, OUTLINE, 1)
}

/** Height of the flat top over the gate's doors (where the gate buddy stands). */
export function gateArchHeight(level: number): number {
  return GATE_STYLES[Math.max(1, Math.min(GATE_STYLES.length, level)) - 1].arch
}

/** Top of the gate's arch, where the defensive zap starts. */
export function gateZapPoint(x: number, y: number, level: number): Point {
  return at(x + 1.5, y + 0.95, gateArchHeight(level) + 3)
}

// ---------- shops & cafes (storefront faces the street in front-left) ----------

export function drawShop(ctx: Ctx, look: Extract<ObjectLook, { type: 'shop' }>, x: number, y: number, w: number, h: number, t: number) {
  const H = look.wallHeight
  const x0 = x + 0.1
  const x1 = x + w - 0.1
  const y0 = y + 0.1
  const y1 = y + h - (look.terrace ? 0.78 : 0.45)
  const c = tileCenter(x, y, w, h)
  groundShadow(ctx, { x: c.x + 4, y: c.y }, w * 26, h * 11)

  isoBox(ctx, x0, x1, y0, y1, 0, H, look.roof, look.wall, shade(look.wall, 0.8))
  // flat roof with a rim
  const k = 0.12
  poly(ctx, [at(x0 + k, y0 + k, H), at(x1 - k, y0 + k, H), at(x1 - k, y1 - k, H), at(x0 + k, y1 - k, H)])
  fillStroke(ctx, shade(look.roof, 0.85), null)

  const F = (s: number, hh: number) => at(x0 + s * (x1 - x0), y1, hh)
  const G = (s: number, hh: number) => at(x1, y1 - s * (y1 - y0), hh)

  // shop window with goods
  poly(ctx, [F(0.08, 4), F(0.55, 4), F(0.55, H * 0.6), F(0.08, H * 0.6)])
  fillStroke(ctx, '#bfe6ff', OUTLINE, 1.3)
  const goods = look.goods ?? (look.sign === '☕' ? ['#8a5a33', '#f6e3c0', '#8a5a33'] : ['#e8604c', '#ffb33f', '#7ac74f', '#e8604c'])
  goods.forEach((color, i) => {
    const p = F(0.14 + i * (0.36 / goods.length), 7)
    ellipse(ctx, p.x + 3, p.y - 1, 2.6, 2.6)
    fillStroke(ctx, color, OUTLINE, 0.8)
  })
  const mid = F(0.315, 4)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(mid.x, mid.y - 1)
  ctx.lineTo(mid.x, mid.y - H * 0.6 + 5)
  ctx.stroke()
  // door with a glass pane
  poly(ctx, [F(0.64, 0), F(0.88, 0), F(0.88, H * 0.66), F(0.64, H * 0.66)])
  fillStroke(ctx, shade(look.awning[0], 0.85), OUTLINE, 1.3)
  poly(ctx, [F(0.68, H * 0.36), F(0.84, H * 0.36), F(0.84, H * 0.58), F(0.68, H * 0.58)])
  fillStroke(ctx, '#d8f0ff', OUTLINE, 0.9)
  // side window
  poly(ctx, [G(0.3, H * 0.34), G(0.7, H * 0.34), G(0.7, H * 0.66), G(0.3, H * 0.66)])
  fillStroke(ctx, '#a9d6f2', OUTLINE, 1.2)

  // striped awning over the storefront
  const top = (s: number) => F(s, H * 0.82)
  const bot = (s: number) => at(x0 + s * (x1 - x0), y1 + 0.26, H * 0.6)
  const n = 7
  for (let i = 0; i < n; i++) {
    const a = 0.04 + (i * 0.92) / n
    const b = a + 0.92 / n
    poly(ctx, [top(a), top(b), bot(b), bot(a)])
    fillStroke(ctx, look.awning[i % 2], null)
  }
  poly(ctx, [top(0.04), top(0.96), bot(0.96), bot(0.04)])
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = LW
  ctx.stroke()
  for (let i = 0; i < n; i++) {
    const p = lerp(bot(0.04 + (i * 0.92) / n), bot(0.04 + ((i + 1) * 0.92) / n), 0.5)
    ctx.beginPath()
    ctx.arc(p.x, p.y, 2.6, 0, Math.PI)
    fillStroke(ctx, look.awning[i % 2], OUTLINE, 1)
  }

  // sign on the roof
  const sp = F(0.5, H)
  ctx.beginPath()
  ctx.roundRect(sp.x - 13, sp.y - 20, 26, 15, 4)
  fillStroke(ctx, '#fffdf5', OUTLINE, 1.4)
  ctx.font = `10px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(look.sign, sp.x, sp.y - 12)

  if (look.terrace) drawTerrace(ctx, look, x, y1, x0, x1, y + h, t)
  else drawCrates(ctx, x0, x1, y1)
}

function drawCrates(ctx: Ctx, x0: number, x1: number, y1: number) {
  const fruit = [['#e8604c', '#ffb33f'], ['#7ac74f', '#e8604c']]
  ;[0.08, 0.34].forEach((f, i) => {
    const cx = x0 + f * (x1 - x0)
    isoBox(ctx, cx, cx + 0.3, y1 + 0.08, y1 + 0.34, 0, 7, '#d9a35c', '#c48a4f', '#a8703f', 1.2)
    fruit[i].forEach((color, j) => {
      for (let k = 0; k < 2; k++) {
        const p = at(cx + 0.08 + k * 0.13, y1 + 0.14 + j * 0.12, 8.5)
        ellipse(ctx, p.x, p.y, 2.4, 2.1)
        fillStroke(ctx, color, OUTLINE, 0.7)
      }
    })
  })
}

function drawTerrace(ctx: Ctx, look: Extract<ObjectLook, { type: 'shop' }>, _x: number, y1: number, x0: number, x1: number, yEnd: number, t: number) {
  const ty = (y1 + yEnd) / 2 + 0.02
  for (const fx of [0.32, 0.74]) {
    const tx = x0 + fx * (x1 - x0)
    const base = at(tx, ty)
    groundShadow(ctx, base, 10, 4)
    // chairs
    for (const dx of [-0.2, 0.2]) {
      const ch = at(tx + dx, ty + 0.05, 0)
      ctx.beginPath()
      ctx.roundRect(ch.x - 2.5, ch.y - 7, 5, 7, 1.5)
      fillStroke(ctx, '#8a5a33', OUTLINE, 0.9)
    }
    // table
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(base.x, base.y)
    ctx.lineTo(base.x, base.y - 8)
    ctx.stroke()
    ellipse(ctx, base.x, base.y - 8, 6, 2.6)
    fillStroke(ctx, '#ffffff', OUTLINE, 1.1)
    // umbrella
    ctx.beginPath()
    ctx.moveTo(base.x, base.y - 8)
    ctx.lineTo(base.x, base.y - 24)
    ctx.stroke()
    const sway = Math.sin(t * 1.3 + fx * 5) * 0.6
    for (let i = 0; i < 4; i++) {
      const a0 = Math.PI + (i / 4) * Math.PI
      const a1 = Math.PI + ((i + 1) / 4) * Math.PI
      ctx.beginPath()
      ctx.moveTo(base.x + sway, base.y - 31)
      ctx.lineTo(base.x + Math.cos(a0) * -13, base.y - 22 + Math.sin(a0) * -2)
      ctx.lineTo(base.x + Math.cos(a1) * -13, base.y - 22 + Math.sin(a1) * -2)
      ctx.closePath()
      fillStroke(ctx, look.awning[i % 2], OUTLINE, 1)
    }
  }
}

// ---------- park ----------

export function drawPark(ctx: Ctx, x: number, y: number, t: number) {
  const { T, R, B, L } = insetCorners(x, y, 2, 2, 0.96)
  poly(ctx, [T, R, B, L])
  fillStroke(ctx, '#4f9a45', OUTLINE, 1.4)
  const inner = insetCorners(x, y, 2, 2, 0.84)
  poly(ctx, [inner.T, inner.R, inner.B, inner.L])
  fillStroke(ctx, '#a8de7d', null)
  // gravel paths crossing at the fountain
  ctx.strokeStyle = '#efe2c2'
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (const [a, b] of [
    [lerp(inner.T, inner.L, 0.5), lerp(inner.R, inner.B, 0.5)],
    [lerp(inner.T, inner.R, 0.5), lerp(inner.L, inner.B, 0.5)],
  ]) {
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  }
  ctx.stroke()

  drawTree(ctx, x - 0.08, y - 0.08, '#5cb85c', t)
  drawFlowers(ctx, x + 1.05, y + 0.05, ['#ff7aa8', '#ffd84a', '#ffffff'])

  // fountain
  const c = tileToWorld(x + 1, y + 1)
  ellipse(ctx, c.x, c.y + 1, 15, 7.5)
  fillStroke(ctx, '#d9d4c8')
  ellipse(ctx, c.x, c.y - 1, 12, 5.5)
  fillStroke(ctx, '#6cc7ec', null)
  ctx.beginPath()
  ctx.roundRect(c.x - 2, c.y - 12, 4, 11, 1.5)
  fillStroke(ctx, '#d9d4c8', OUTLINE, 1)
  softFx(ctx, 'over', (g) => {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.9 + i / 3) % 1
      const dir = i - 1
      ellipse(g, c.x + dir * k * 9, c.y - 13 - Math.sin(k * Math.PI) * 6 + k * 9, 1.6, 1.6)
      g.fillStyle = `rgba(160,225,250,${1 - k * 0.6})`
      g.fill()
    }
  })

  drawFlowers(ctx, x - 0.02, y + 1.02, ['#b78cff', '#ff7aa8', '#ffffff'])
}

// ---------- playground ----------

export function drawPlayground(ctx: Ctx, x: number, y: number, t: number) {
  const { T, R, B, L } = insetCorners(x, y, 2, 2, 0.94)
  poly(ctx, [T, R, B, L])
  fillStroke(ctx, '#f3cf93', OUTLINE, 1.4)
  const inner = insetCorners(x, y, 2, 2, 0.8)
  poly(ctx, [inner.T, inner.R, inner.B, inner.L])
  ctx.strokeStyle = '#e4b671'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 3])
  ctx.stroke()
  ctx.setLineDash([])

  // slide: a tower at the back with a slope coming forward
  const sx0 = x + 0.3
  const sx1 = x + 0.72
  isoBox(ctx, sx0, sx1, y + 0.25, y + 0.62, 0, 22, '#ff8fab', '#5bc0eb', shade('#5bc0eb', 0.78), 1.4)
  const roofPeak = at((sx0 + sx1) / 2, y + 0.44, 36)
  poly(ctx, [at(sx0 - 0.04, y + 0.66, 24), at(sx1 + 0.04, y + 0.66, 24), roofPeak])
  fillStroke(ctx, '#ffcf4a')
  poly(ctx, [at(sx1 + 0.04, y + 0.66, 24), at(sx1 + 0.04, y + 0.21, 24), roofPeak])
  fillStroke(ctx, shade('#ffcf4a', 0.8))
  poly(ctx, [at(sx0 + 0.04, y + 0.62, 22), at(sx1 - 0.04, y + 0.62, 22), at(sx1 - 0.04, y + 1.62, 0), at(sx0 + 0.04, y + 1.62, 0)])
  fillStroke(ctx, '#ffcf4a')
  ctx.strokeStyle = '#e09a1a'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  const r1 = at((sx0 + sx1) / 2, y + 0.62, 22)
  const r2 = at((sx0 + sx1) / 2, y + 1.62, 0)
  ctx.moveTo(r1.x, r1.y)
  ctx.lineTo(r2.x, r2.y)
  ctx.stroke()

  // swing set along the right side
  const bx = x + 1.45
  const H = 30
  ctx.lineCap = 'round'
  for (const by of [y + 0.35, y + 1.55]) {
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 3.4
    ctx.beginPath()
    for (const dx of [-0.2, 0.2]) {
      const g = at(bx + dx, by)
      const tp = at(bx, by, H)
      ctx.moveTo(g.x, g.y)
      ctx.lineTo(tp.x, tp.y)
    }
    ctx.stroke()
    ctx.strokeStyle = '#e8604c'
    ctx.lineWidth = 2
    ctx.stroke()
  }
  const b1 = at(bx, y + 0.35, H)
  const b2 = at(bx, y + 1.55, H)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 3.6
  ctx.beginPath()
  ctx.moveTo(b1.x, b1.y)
  ctx.lineTo(b2.x, b2.y)
  ctx.stroke()
  ctx.strokeStyle = '#e8604c'
  ctx.lineWidth = 2.2
  ctx.stroke()
  for (const [f, phase] of [
    [0.3, 0],
    [0.7, 2],
  ]) {
    const hang = lerp(b1, b2, f)
    const swing = Math.sin(t * 2 + phase) * 5
    const seat = { x: hang.x + swing * 0.9, y: hang.y + H - 9 - Math.abs(swing) * 0.2 }
    ctx.strokeStyle = '#6b5a45'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(hang.x - 3, hang.y)
    ctx.lineTo(seat.x - 3, seat.y)
    ctx.moveTo(hang.x + 3, hang.y)
    ctx.lineTo(seat.x + 3, seat.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(seat.x - 4.5, seat.y - 1, 9, 3, 1)
    fillStroke(ctx, '#5bc0eb', OUTLINE, 0.9)
  }
}

// ---------- outside the wall ----------

export function drawDeadTree(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 12, 5)
  ctx.lineCap = 'round'
  const branches: [number, number, number, number][] = [
    [0, 0, 0, -26],
    [0, -14, -9, -24],
    [0, -19, 8, -30],
    [-5, -21, -9, -33],
  ]
  for (const [w, color] of [
    [5, OUTLINE],
    [3, '#8f8173'],
  ] as const) {
    ctx.strokeStyle = color
    ctx.lineWidth = w
    ctx.beginPath()
    for (const [ax, ay, bx, by] of branches) {
      ctx.moveTo(c.x + ax, c.y + ay)
      ctx.lineTo(c.x + bx, c.y + by)
    }
    ctx.stroke()
  }
}

export function drawRock(ctx: Ctx, x: number, y: number, size: number, color = '#a39d94') {
  const c = tileCenter(x, y)
  groundShadow(ctx, c, 10 * size, 4 * size)
  ctx.beginPath()
  ctx.moveTo(c.x - 9 * size, c.y + 1)
  ctx.quadraticCurveTo(c.x - 8 * size, c.y - 9 * size, c.x - 1 * size, c.y - 10 * size)
  ctx.quadraticCurveTo(c.x + 8 * size, c.y - 9 * size, c.x + 9 * size, c.y + 1)
  ctx.closePath()
  fillStroke(ctx, color)
  ellipse(ctx, c.x - 3 * size, c.y - 6 * size, 2.5 * size, 1.5 * size, -0.4)
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fill()
}

export function drawGoo(ctx: Ctx, x: number, y: number, t: number) {
  const c = tileToWorld(x + 0.5, y + 0.5)
  ellipse(ctx, c.x, c.y, 14, 6)
  fillStroke(ctx, '#8fd14f', '#4f7f2a', 1.4)
  ellipse(ctx, c.x - 4, c.y - 1.5, 5, 2)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fill()
  for (let i = 0; i < 2; i++) {
    const k = (t * 0.7 + i * 0.5 + hash(x, y)) % 1
    ellipse(ctx, c.x + (i ? 5 : -3), c.y - k * 6, 1.5 + k, 1.5 + k)
    ctx.strokeStyle = `rgba(79,127,42,${1 - k})`
    ctx.lineWidth = 0.9
    ctx.stroke()
  }
}

export function drawShrooms(ctx: Ctx, x: number, y: number) {
  const c = tileCenter(x, y)
  for (const [dx, dy, s] of [
    [-6, 2, 1],
    [4, -1, 0.75],
  ]) {
    const p = { x: c.x + dx, y: c.y + dy }
    ctx.beginPath()
    ctx.roundRect(p.x - 1.6 * s, p.y - 7 * s, 3.2 * s, 7 * s, 1)
    fillStroke(ctx, '#f6efe2', OUTLINE, 1)
    ctx.beginPath()
    ctx.ellipse(p.x, p.y - 7 * s, 6 * s, 4.5 * s, 0, Math.PI, Math.PI * 2)
    ctx.closePath()
    fillStroke(ctx, '#a678d6', OUTLINE, 1.1)
    ellipse(ctx, p.x - 2 * s, p.y - 9 * s, 1.1 * s, 1.1 * s)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
}

/** Wooden signpost standing at `p`; returns the middle of its board, where the emblem goes. */
export function drawSignpost(ctx: Ctx, p: Point): Point {
  groundShadow(ctx, p, 13, 5)
  ctx.beginPath()
  ctx.roundRect(p.x - 2.6, p.y - 34, 5.2, 35, 1.5)
  fillStroke(ctx, '#a8743f')
  const board = { x: p.x, y: p.y - 44 }
  ctx.beginPath()
  ctx.roundRect(board.x - 21, board.y - 15, 42, 30, 6)
  fillStroke(ctx, '#c98b4f')
  ctx.beginPath()
  ctx.roundRect(board.x - 17.5, board.y - 11.5, 35, 23, 4)
  fillStroke(ctx, '#fff1d0', OUTLINE, 1.1)
  ctx.fillStyle = '#6b4423'
  for (const [dx, dy] of [
    [-19.2, -13.2],
    [19.2, -13.2],
    [-19.2, 13.2],
    [19.2, 13.2],
  ]) {
    ellipse(ctx, board.x + dx, board.y + dy, 1, 1)
    ctx.fill()
  }
  return board
}

/** The swamp the germs crawl out of. */
export function drawGermNest(ctx: Ctx, p: Point, t: number) {
  ellipse(ctx, p.x, p.y + 4, 40, 15)
  fillStroke(ctx, '#7fbf4a', '#4f7f2a', 1.6)
  // mound
  ctx.beginPath()
  ctx.moveTo(p.x - 34, p.y + 4)
  ctx.bezierCurveTo(p.x - 30, p.y - 30, p.x + 26, p.y - 34, p.x + 32, p.y + 4)
  ctx.closePath()
  fillStroke(ctx, '#6e5a86')
  ellipse(ctx, p.x - 12, p.y - 18, 8, 4, -0.3)
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fill()
  // cave mouth with glowing goo
  ctx.beginPath()
  ctx.ellipse(p.x, p.y + 2, 15, 15, 0, Math.PI, Math.PI * 2)
  ctx.closePath()
  fillStroke(ctx, '#2a1f38')
  const glow = 0.55 + Math.sin(t * 2.2) * 0.2
  ellipse(ctx, p.x, p.y + 1, 12, 4)
  ctx.fillStyle = `rgba(143,209,79,${glow})`
  ctx.fill()
  // eyes blinking in the dark
  const blink = Math.sin(t * 0.9) > 0.92
  for (const dx of [-5, 5]) {
    ellipse(ctx, p.x + dx, p.y - 7, 2, blink ? 0.4 : 2.4)
    ctx.fillStyle = '#d6ff8a'
    ctx.fill()
  }
  // goo bubbles
  softFx(ctx, 'over', (g) => {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.5 + i / 3) % 1
      ellipse(g, p.x - 18 + i * 18, p.y - 10 - k * 22, 2 + k * 2, 2 + k * 2)
      g.strokeStyle = `rgba(143,209,79,${1 - k})`
      g.lineWidth = 1.2
      g.stroke()
    }
  })
}

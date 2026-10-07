import { OUTLINE, beginSoftFxLog, endSoftFxLog, type SoftFxLog } from './sprites'

/**
 * Sticker-style ink outline, the same treatment the 3D character gets: a sprite is painted into a
 * scratch canvas, its silhouette is spread outward in dark ink, and the sprite goes on top.
 * Results are cached per object, so a still city costs one image draw per object per frame.
 */

type Ctx = CanvasRenderingContext2D

/** World-space box that fully contains a sprite. */
export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Ink weight for one sprite, in world units: `width` reaches outside the sprite's edge, `inset` reaches
 * inside it (so inner detail lines stop at the outline instead of crossing it).
 */
export interface InkWeight {
  width: number
  inset: number
}

/** Small items (crops, flowers, a lamp) get a thin line; big buildings a bold one. */
export const INK_THIN: InkWeight = { width: 0.32, inset: 0.14 }
export const INK_BOLD: InkWeight = { width: 1.8, inset: 1.25 }
/** Visual size (√(width × height) of the sprite, world units) where the ink starts to grow, and where it tops out. */
const SMALL_SIZE = 40
const LARGE_SIZE = 112

/** Ink for a sprite whose picture is about w × h world units, scaled smoothly between thin and bold. */
export function inkForSize(w: number, h: number): InkWeight {
  const k = Math.max(0, Math.min(1, (Math.sqrt(w * h) - SMALL_SIZE) / (LARGE_SIZE - SMALL_SIZE)))
  return {
    width: INK_THIN.width + (INK_BOLD.width - INK_THIN.width) * k,
    inset: INK_THIN.inset + (INK_BOLD.inset - INK_THIN.inset) * k,
  }
}

/** The widest ink there is — room to leave around a sprite. */
export const INK_MAX_WIDTH = INK_BOLD.width
/** Directions the silhouette is spread in: 8 already leaves gaps under a third of a pixel at the boldest ink. */
const INK_STEPS = 8
const PAD = INK_MAX_WIDTH + 1.5
const INK_MEDIUM = inkForSize(70, 70)
/** Frames the zoom must hold still before sprites are redrawn at its exact scale. */
const SETTLE_FRAMES = 8
/** Milliseconds a frame may spend inking; past it, redraws wait for the next frame so panning never stalls. */
const FRAME_BUDGET = 4
/** Device pixels of cached sprites to keep; past it the longest-unused go first. */
const CACHE_PIXELS = 16_000_000

interface Rendered {
  canvas: HTMLCanvasElement
  scale: number
  box: Box
  fx: SoftFxLog
}

interface Entry extends Rendered {
  key: string
  usedAt: number
}

function canvas(): HTMLCanvasElement {
  return document.createElement('canvas')
}

function ensureSize(c: HTMLCanvasElement, w: number, h: number) {
  if (c.width < w || c.height < h) {
    c.width = Math.max(c.width, w)
    c.height = Math.max(c.height, h)
  }
}

const shared: Record<'scratch' | 'sil' | 'inner' | 'ring', HTMLCanvasElement | null> = { scratch: null, sil: null, inner: null, ring: null }

function ctx2d(c: HTMLCanvasElement): Ctx {
  const g = c.getContext('2d')!
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.globalAlpha = 1
  g.globalCompositeOperation = 'source-over'
  return g
}

/**
 * Paints `paint` (world coordinates) at `scale` device pixels per world unit, with an ink outline:
 * a dark ring from `weight.width` outside the sprite's edge to `weight.inset` inside it, laid over the sprite.
 */
export function renderInked(target: HTMLCanvasElement, scale: number, box: Box, paint: (c: Ctx) => void, weight = INK_MEDIUM): Rendered {
  const W = Math.max(1, Math.ceil((box.w + PAD * 2) * scale))
  const H = Math.max(1, Math.ceil((box.h + PAD * 2) * scale))
  const scratch = (shared.scratch ??= canvas())
  const sil = (shared.sil ??= canvas())
  const inner = (shared.inner ??= canvas())
  const ring = (shared.ring ??= canvas())
  for (const c of [scratch, sil, inner, ring]) ensureSize(c, W, H)

  // 1. the sprite itself
  const sc = ctx2d(scratch)
  sc.clearRect(0, 0, W, H)
  sc.setTransform(scale, 0, 0, scale, (PAD - box.x) * scale, (PAD - box.y) * scale)
  sc.direction = 'ltr'
  let fx: SoftFxLog
  beginSoftFxLog()
  try {
    paint(sc)
  } finally {
    fx = endSoftFxLog()
  }

  // 2. its silhouette, in ink
  const lc = ctx2d(sil)
  lc.globalCompositeOperation = 'copy'
  lc.drawImage(scratch, 0, 0, W, H, 0, 0, W, H)
  lc.globalCompositeOperation = 'source-in'
  lc.fillStyle = OUTLINE
  lc.fillRect(0, 0, W, H)

  // 3. the silhouette shrunk by the inset (only what's covered from every direction survives)
  const ic = ctx2d(inner)
  ic.globalCompositeOperation = 'copy'
  ic.drawImage(sil, 0, 0, W, H, 0, 0, W, H)
  ic.globalCompositeOperation = 'destination-in'
  const rin = weight.inset * scale
  for (let i = 0; i < INK_STEPS; i++) {
    const a = (i / INK_STEPS) * Math.PI * 2
    ic.drawImage(sil, 0, 0, W, H, Math.cos(a) * rin, Math.sin(a) * rin, W, H)
  }

  // 4. the ring: silhouette grown by the width, minus the shrunk one
  const rc = ctx2d(ring)
  rc.clearRect(0, 0, W, H)
  // At least one device pixel, so thin ink doesn't vanish when zoomed out.
  const rout = Math.max(1, weight.width * scale)
  for (let i = 0; i < INK_STEPS; i++) {
    const a = (i / INK_STEPS) * Math.PI * 2
    rc.drawImage(sil, 0, 0, W, H, Math.cos(a) * rout, Math.sin(a) * rout, W, H)
  }
  rc.drawImage(sil, 0, 0, W, H, 0, 0, W, H)
  rc.globalCompositeOperation = 'destination-out'
  rc.drawImage(inner, 0, 0, W, H, 0, 0, W, H)

  // 5. sprite, then the ring on top so no inner line crosses the outline
  if (target.width !== W || target.height !== H) {
    target.width = W
    target.height = H
  }
  const tc = ctx2d(target)
  tc.clearRect(0, 0, W, H)
  tc.drawImage(scratch, 0, 0, W, H, 0, 0, W, H)
  tc.drawImage(ring, 0, 0, W, H, 0, 0, W, H)
  return { canvas: target, scale, box, fx }
}

/** Draws a rendered sprite (plus its shadows and glows, which stay out of the ink) into a world-space context. */
export function blitInked(ctx: Ctx, r: Rendered) {
  for (const f of r.fx.under) f(ctx)
  let x = r.box.x - PAD
  let y = r.box.y - PAD
  const m = ctx.getTransform()
  // Land on whole device pixels when drawn at its own scale, so the art stays crisp.
  if (Math.abs(m.a - r.scale) < 1e-6 && Math.abs(m.d - r.scale) < 1e-6 && !m.b && !m.c) {
    x = (Math.round(m.a * x + m.e) - m.e) / m.a
    y = (Math.round(m.d * y + m.f) - m.f) / m.d
  }
  ctx.drawImage(r.canvas, x, y, r.canvas.width / r.scale, r.canvas.height / r.scale)
  for (const f of r.fx.over) f(ctx)
}

export class Inker {
  enabled = true
  private entries = new Map<string, Entry>()
  private live: HTMLCanvasElement | null = null
  private frame = 0
  private lastScale = 0
  private still = 0
  private scale = 1
  private spent = 0

  /** Call once per frame with the context's device-pixels-per-world-unit. */
  beginFrame(scale: number) {
    this.frame++
    this.spent = 0
    if (Math.abs(scale - this.lastScale) > 1e-6) {
      this.still = 0
      this.lastScale = scale
    } else {
      this.still++
    }
    // While zooming, reuse sprites drawn at the nearest 1/8-octave step instead of redrawing all of them.
    this.scale = this.still >= SETTLE_FRAMES ? scale : Math.pow(2, Math.round(Math.log2(scale) * 8) / 8)
    if (this.frame % 120 === 0) this.evict()
  }

  /** Off-screen sprites stay cached (panning back must not redraw them all at once) unless drawn at an old zoom or over the memory cap. */
  private evict() {
    let pixels = 0
    for (const [id, e] of this.entries) {
      if (this.frame - e.usedAt > 240 && e.scale !== this.scale) this.entries.delete(id)
      else pixels += e.canvas.width * e.canvas.height
    }
    if (pixels <= CACHE_PIXELS) return
    for (const [id, e] of [...this.entries].sort((a, b) => a[1].usedAt - b[1].usedAt)) {
      if (pixels <= CACHE_PIXELS) break
      pixels -= e.canvas.width * e.canvas.height
      this.entries.delete(id)
    }
  }

  private render(target: HTMLCanvasElement, box: Box, paint: (c: Ctx) => void, weight: InkWeight): Rendered {
    const t0 = performance.now()
    const r = renderInked(target, this.scale, box, paint, weight)
    this.spent += performance.now() - t0
    return r
  }

  /** Draws a sprite with an ink outline. `key` must change whenever the picture changes. */
  draw(ctx: Ctx, id: string, key: string, box: Box, paint: (c: Ctx) => void, weight = INK_MEDIUM) {
    if (!this.enabled) return paint(ctx)
    let e = this.entries.get(id)
    if (!e || e.key !== key || e.scale !== this.scale) {
      // Over budget: the old picture (same spot) stands in, or a new sprite goes on without ink, until a later frame.
      if (this.spent > FRAME_BUDGET && this.frame > 1) {
        if (!e || !sameBox(e.box, box)) return paint(ctx)
        e.usedAt = this.frame
        return blitInked(ctx, e)
      }
      const r = this.render(e?.canvas ?? canvas(), box, paint, weight)
      e = { ...r, key, usedAt: this.frame }
      this.entries.set(id, e)
    }
    e.usedAt = this.frame
    blitInked(ctx, e)
  }

  /** For things that change every frame (germs): inked, but never cached. */
  drawLive(ctx: Ctx, box: Box, paint: (c: Ctx) => void, weight = INK_MEDIUM) {
    if (!this.enabled) return paint(ctx)
    blitInked(ctx, this.render((this.live ??= canvas()), box, paint, weight))
  }
}

function sameBox(a: Box, b: Box) {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h
}

/** Box around a point on the ground: `half` to each side, `rise` above, `below` underneath. */
export function boxAround(x: number, y: number, half: number, rise: number, below: number): Box {
  return { x: x - half, y: y - rise, w: half * 2, h: rise + below }
}

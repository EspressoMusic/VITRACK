import { CONTINENT, GERM_ROAD, GERM_SIGN, ISLAND, OUTSIDE, WORLDS, ZONES } from '../data/areas'
import { nearFoodGuardSpot } from '../data/foodGuards'
import { nearGuardSpot } from '../data/guards'
import { NEIGHBOR_SIZE, NEIGHBOR_SLOTS } from '../data/neighbors'
import type { AreaDef, FeatureKind, Point } from '../types'
import { ANIMATED_FEATURES, drawFeature, featureRise } from './features'
import { OUTSIDE_DEPTH } from './germs'
import { type Box, type Inker, boxAround, inkForSize } from './ink'
import { footprintCorners, tileCenter, tileToWorld } from './iso'
import { OUTLINE, hash, poly } from './sprites'
import {
  type Biome,
  type DecorKind,
  FLAT,
  LANDMARK_INK,
  LOCKED_SHADE,
  THEMES,
  decorInk,
  drawDecor,
  drawFlatDecor,
  drawFog,
  drawLandmark,
  drawSpeck,
  shaded,
} from './worlds'

/**
 * The continent around the city: wild land whose look drifts from city grass into each world's style the
 * closer it gets, split into zones that each hold something to find (a windmill, a stone circle, an observatory
 * near the moon…), with the worlds themselves out toward the edges. No sea in between — the sea only rings the whole thing.
 * Every zone and world starts locked (night shade and mist) until it's bought.
 */

type Ctx = CanvasRenderingContext2D
type Rect = { x: number; y: number; w: number; h: number }
export type View = { minX: number; maxX: number; minY: number; maxY: number }
type Standing = { depth: number; draw: () => void }

const CLIFF = 26
const X0 = CONTINENT.x
const Y0 = CONTINENT.y
const CW = CONTINENT.w
const CH = CONTINENT.h
const index = (x: number, y: number) => (y - Y0) * CW + (x - X0)
const inRect = (r: Rect, x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h
/** The city draws its own ground (districts and the strip outside the gate). */
const inCity = (x: number, y: number) => x >= 0 && y >= 0 && x < ISLAND.w && y < ISLAND.h

/** Back-to-front order for something on tiles x..x+w-1 × y..y+h-1. Past the wall's front line it sorts with the germs and guards outside. */
export function landDepth(x: number, y: number, w = 1, h = 1): number {
  const front = y + h - 1
  return x + w - 1 + front + x * 0.001 + (front >= OUTSIDE.y ? OUTSIDE_DEPTH : 0)
}

function worldOf(x: number, y: number): AreaDef | null {
  return WORLDS.find((a) => inRect(a.world!.island, x, y)) ?? null
}

/** The zone or world (whatever's bought as one piece) holding tile (x, y) outside the city. */
function areaOf(x: number, y: number): AreaDef | null {
  return worldOf(x, y) ?? ZONES.find((a) => inRect(a.rect, x, y)) ?? null
}

const landOf = (a: AreaDef) => a.world?.island ?? a.rect

// ---------- ground colors: each tile blends the meadow with whatever lies nearby ----------

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (c: number[]) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`

interface Source {
  rect: Rect
  color: number[]
  biome: Biome
}

/** What tints the wild land: the city's grass, the gloomy strip outside its gate, and every world. */
const SOURCES: Source[] = [
  { rect: { x: 0, y: 0, w: ISLAND.w, h: OUTSIDE.y }, color: rgb('#9fd673'), biome: 'meadow' },
  { rect: OUTSIDE, color: rgb('#b5b98c'), biome: 'meadow' },
  ...WORLDS.map((a) => ({ rect: a.world!.island, color: rgb(THEMES[a.world!.theme].ground[0]), biome: a.world!.theme })),
]
const MEADOW = rgb(THEMES.meadow.ground[0])
const MEADOW_WEIGHT = 0.25
/** Tiles over which a source fades out. */
const REACH = 11

function distToRect(px: number, py: number, r: Rect): number {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.w))
  const dy = Math.max(r.y - py, 0, py - (r.y + r.h))
  return Math.hypot(dx, dy)
}

const COLOR: string[] = new Array(CW * CH).fill('')
const BIOME: Biome[] = new Array(CW * CH).fill('meadow')

for (let y = Y0; y < Y0 + CH; y++) {
  for (let x = X0; x < X0 + CW; x++) {
    if (inCity(x, y)) continue
    const i = index(x, y)
    const world = worldOf(x, y)
    if (world) {
      COLOR[i] = THEMES[world.world!.theme].ground[(x + y) % 2]
      BIOME[i] = world.world!.theme
      continue
    }
    let sum = MEADOW_WEIGHT
    const mix = MEADOW.map((v) => v * MEADOW_WEIGHT)
    const weights = SOURCES.map((s) => {
      const w = Math.max(0, 1 - distToRect(x + 0.5, y + 0.5, s.rect) / REACH) ** 2
      sum += w
      s.color.forEach((v, k) => (mix[k] += v * w))
      return w
    })
    const checker = (x + y) % 2 ? 0.955 : 1
    // Rounded so neighboring tiles share colors and draw in one go.
    COLOR[i] = toHex(mix.map((v) => Math.round(((v / sum) * checker) / 4) * 4))
    // Which style its little details (and wild decor) take: picked at random, weighted by the same blend.
    let pick = hash(x, y, 131) * sum - MEADOW_WEIGHT
    for (const [k, w] of weights.entries()) {
      if (pick < 0) break
      pick -= w
      if (pick < 0) BIOME[i] = SOURCES[k].biome
    }
  }
}

// ---------- zones and their features ----------

interface Feature {
  kind: FeatureKind
  x: number
  y: number
  w: number
  h: number
  area: AreaDef
}

const SLOT_RECTS: Rect[] = NEIGHBOR_SLOTS.map((s) => ({ x: s.x, y: s.y, w: NEIGHBOR_SIZE, h: NEIGHBOR_SIZE }))

const FEATURES: Feature[] = ZONES.map((a) => ({ kind: a.zone!.feature, ...a.zone!.spot, area: a }))

// ---------- wild decor ----------

interface Decor {
  x: number
  y: number
  kind: DecorKind
  biome: Biome
  size: number
  /** The world it stands in, if any. */
  world: AreaDef | null
  /** The zone or world it's bought with. */
  area: AreaDef | null
  /** On a world's rim, around its buildable land — stays after the world opens. */
  rim: boolean
  /** The neighbor village spot it's in (-1 if none): hidden while a neighbor lives there. */
  slot: number
}

const nearFeature = (x: number, y: number) => FEATURES.some((f) => x >= f.x - 1 && y >= f.y - 1 && x < f.x + f.w + 1 && y < f.y + f.h + 1)
const SIGN_CLEAR = 1.8
const NEST = GERM_ROAD[0]

function pickKind(biome: Biome, r: number): DecorKind {
  const kinds = THEMES[biome].decor
  for (const [k, w] of kinds) {
    if (r < w) return k
    r -= w
  }
  return kinds[kinds.length - 1][0]
}

const STANDING: Decor[] = []
const FLAT_DECOR: Decor[] = []
for (let y = Y0; y < Y0 + CH; y++) {
  for (let x = X0; x < X0 + CW; x++) {
    if (inCity(x, y)) continue
    const world = worldOf(x, y)
    const island = world?.world!.island
    let rim = false
    if (island) {
      // the landmark's 2×2 at the back corner, plus a clear ring in front of it
      if (x < island.x + 3 && y < island.y + 3) continue
      rim = !inRect(world!.rect, x, y)
      if (hash(x, y, 83) > (rim ? 0.5 : 0.22)) continue
    } else {
      if (hash(x, y, 83) > 0.095 || nearFeature(x, y)) continue
      if (Math.hypot(x + 0.5 - GERM_SIGN.x, y + 0.5 - GERM_SIGN.y) < SIGN_CLEAR || Math.hypot(x + 0.5 - NEST.x, y + 0.5 - NEST.y) < 3) continue
      if (nearFoodGuardSpot(x + 0.5, y + 0.5) || nearGuardSpot(x + 0.5, y + 0.5)) continue
    }
    const biome = BIOME[index(x, y)]
    const kind = pickKind(biome, hash(x, y, 89))
    const slot = SLOT_RECTS.findIndex((s) => inRect(s, x, y))
    ;(FLAT.has(kind) ? FLAT_DECOR : STANDING).push({ x, y, kind, biome, size: 0.8 + hash(x, y, 97) * 0.5, world, area: areaOf(x, y), rim, slot })
  }
}

const hidden = (d: Decor, unlocked: Set<string>, villages: number) => (d.world && !d.rim && unlocked.has(d.world.id)) || (d.slot >= 0 && d.slot < villages)
const locked = (area: AreaDef | null, unlocked: Set<string>) => !!area && !unlocked.has(area.id)

/** Where each zone's lock badge sits: the most open spot in it (clear of its feature and any village), nearest its middle. */
export const LOCK_SPOTS: Record<string, Point> = Object.fromEntries(
  ZONES.map((a) => {
    const r = a.rect
    const blockers = [a.zone!.spot, ...SLOT_RECTS.filter((s) => inRect(r, s.x, s.y))]
    let best = { x: 0, y: 0, score: -Infinity }
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        const px = x + 0.5
        const py = y + 0.5
        const clear = Math.min(px - r.x, r.x + r.w - px, py - r.y, r.y + r.h - py, ...blockers.map((b) => distToRect(px, py, b)))
        const score = Math.min(clear, 3) - Math.hypot(px - r.x - r.w / 2, py - r.y - r.h / 2) * 0.01
        if (score > best.score) best = { x: px, y: py, score }
      }
    }
    return [a.id, tileToWorld(best.x, best.y)]
  }),
)

// ---------- drawing ----------

function boxInView(view: View, b: Box): boolean {
  return b.x + b.w > view.minX && b.x < view.maxX && b.y + b.h > view.minY && b.y < view.maxY
}

function rectInView(view: View, r: Rect, rise = 0): boolean {
  const c = footprintCorners(r.x, r.y, r.w, r.h)
  return c.right.x > view.minX && c.left.x < view.maxX && c.bottom.y > view.minY && c.top.y - rise < view.maxY
}

/** The continent's base: foam along the shore, cliffs on the two front edges (in each world's colors), and its outline. */
export function drawContinent(ctx: Ctx, unlocked: Set<string>, t: number, ink: boolean, view: View) {
  const { top, right, bottom, left } = footprintCorners(X0, Y0, CW, CH)
  const down = (p: { x: number; y: number }, d = CLIFF) => ({ x: p.x, y: p.y + d })
  const lw = ink ? 3.2 : 1.6

  const foam = 5 + Math.sin(t * 1.4) * 2
  poly(ctx, [
    { x: top.x, y: top.y - foam },
    { x: right.x + foam * 2, y: right.y },
    down(bottom, CLIFF + foam),
    { x: left.x - foam * 2, y: left.y },
  ])
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fill()

  // cliff faces, one tile at a time, colored by the land above them
  const face = (a: { x: number; y: number }, b: { x: number; y: number }, x: number, y: number, side: 0 | 1) => {
    if (Math.max(a.x, b.x) < view.minX || Math.min(a.x, b.x) > view.maxX || Math.max(a.y, b.y) + CLIFF < view.minY || Math.min(a.y, b.y) > view.maxY) return
    const world = worldOf(x, y)
    poly(ctx, [a, b, down(b), down(a)])
    ctx.fillStyle = THEMES[world ? world.world!.theme : 'meadow'].cliff[side]
    ctx.fill()
    if (locked(areaOf(x, y), unlocked)) {
      ctx.fillStyle = LOCKED_SHADE
      ctx.fill()
    }
  }
  for (let x = X0; x < X0 + CW; x++) face(tileToWorld(x, Y0 + CH), tileToWorld(x + 1, Y0 + CH), x, Y0 + CH - 1, 0)
  for (let y = Y0; y < Y0 + CH; y++) face(tileToWorld(X0 + CW, y + 1), tileToWorld(X0 + CW, y), X0 + CW - 1, y, 1)
  ctx.strokeStyle = 'rgba(40,25,10,0.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (const f of [0.4, 0.72]) {
    ctx.moveTo(left.x, left.y + CLIFF * f)
    ctx.lineTo(bottom.x, bottom.y + CLIFF * f)
    ctx.lineTo(right.x, right.y + CLIFF * f)
  }
  ctx.stroke()
  poly(ctx, [left, bottom, right, down(right), down(bottom), down(left)])
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = lw
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(bottom.x, bottom.y)
  ctx.lineTo(bottom.x, bottom.y + CLIFF)
  ctx.stroke()

  // base under the tiles, so seams never show water through
  poly(ctx, [top, right, bottom, left])
  ctx.fillStyle = THEMES.meadow.ground[0]
  ctx.fill()
  ctx.lineWidth = ink ? 4 : 2
  ctx.stroke()
}

/** Ground of the wild land and the worlds (everything but the city): tiles, little details, flat decor, and the locked worlds' shade. */
export function drawLandGround(ctx: Ctx, unlocked: Set<string>, t: number, view: View, zoom: number, villages: number) {
  // tile range under the view (the screen's corners, back in tile coordinates)
  const corners = [
    [view.minX, view.minY],
    [view.maxX, view.minY],
    [view.minX, view.maxY],
    [view.maxX, view.maxY],
  ].map(([wx, wy]) => ({ x: (wy / 16 + wx / 32) / 2, y: (wy / 16 - wx / 32) / 2 }))
  const tx0 = Math.max(X0, Math.floor(Math.min(...corners.map((c) => c.x))) - 1)
  const tx1 = Math.min(X0 + CW - 1, Math.ceil(Math.max(...corners.map((c) => c.x))) + 1)
  const ty0 = Math.max(Y0, Math.floor(Math.min(...corners.map((c) => c.y))) - 1)
  const ty1 = Math.min(Y0 + CH - 1, Math.ceil(Math.max(...corners.map((c) => c.y))) + 1)

  const tiles: number[] = []
  const byColor = new Map<string, number[]>()
  for (let y = ty0; y <= ty1; y++) {
    for (let x = tx0; x <= tx1; x++) {
      if (inCity(x, y)) continue
      const c = tileCenter(x, y)
      if (c.x < view.minX - 40 || c.x > view.maxX + 40 || c.y < view.minY - 20 || c.y > view.maxY + 20) continue
      tiles.push(x, y)
      const color = COLOR[index(x, y)]
      let list = byColor.get(color)
      if (!list) byColor.set(color, (list = []))
      list.push(x, y)
    }
  }
  for (const [color, list] of byColor) {
    ctx.beginPath()
    for (let k = 0; k < list.length; k += 2) {
      const a = tileToWorld(list[k], list[k + 1])
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(a.x + 32, a.y + 16)
      ctx.lineTo(a.x, a.y + 32)
      ctx.lineTo(a.x - 32, a.y + 16)
      ctx.closePath()
    }
    ctx.fillStyle = color
    ctx.fill()
  }
  // little details vanish when zoomed far out anyway
  if (zoom >= 0.6) for (let k = 0; k < tiles.length; k += 2) drawSpeck(ctx, BIOME[index(tiles[k], tiles[k + 1])], tiles[k], tiles[k + 1], t)
  for (const d of FLAT_DECOR) {
    if (hidden(d, unlocked, villages)) continue
    const c = tileCenter(d.x, d.y)
    if (c.x < view.minX || c.x > view.maxX || c.y < view.minY || c.y > view.maxY) continue
    drawFlatDecor(ctx, d.kind, d.x, d.y, d.size, t)
  }

  // locked zones and worlds sink into night shade (one fill, so no seams between neighbors), each with a faint dashed border
  const shut = [...ZONES, ...WORLDS].filter((a) => !unlocked.has(a.id) && rectInView(view, landOf(a)))
  ctx.setLineDash([6, 5])
  ctx.lineWidth = 2
  if (shut.length) {
    ctx.beginPath()
    for (const a of shut) {
      const r = landOf(a)
      const { top, right, bottom, left } = footprintCorners(r.x, r.y, r.w, r.h)
      ctx.moveTo(top.x, top.y)
      ctx.lineTo(right.x, right.y)
      ctx.lineTo(bottom.x, bottom.y)
      ctx.lineTo(left.x, left.y)
      ctx.closePath()
    }
    ctx.fillStyle = LOCKED_SHADE
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.stroke()
  }
  // where building goes in an open world
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  for (const area of WORLDS) {
    if (!unlocked.has(area.id) || !rectInView(view, area.rect)) continue
    const r = footprintCorners(area.rect.x, area.rect.y, area.rect.w, area.rect.h)
    poly(ctx, [r.top, r.right, r.bottom, r.left])
    ctx.stroke()
  }
  ctx.setLineDash([])
}

/** Landmarks, wild decor and zone features, for the renderer's back-to-front pass. Locked worlds come out in the night shade. */
export function landStanding(ctx: Ctx, inker: Inker, unlocked: Set<string>, t: number, frame: number, view: View, villages: number): Standing[] {
  const out: Standing[] = []
  for (const area of WORLDS) {
    const { theme, island } = area.world!
    const g = tileCenter(island.x, island.y, 2, 2)
    const box = boxAround(g.x, g.y, 74, 112, 28)
    if (!boxInView(view, box)) continue
    const open = unlocked.has(area.id)
    out.push({
      depth: landDepth(island.x, island.y, 2, 2),
      draw: () =>
        inker.draw(
          ctx,
          `wl${area.id}`,
          `${open},${theme === 'volcano' ? frame : 0}`,
          box,
          shaded((c) => drawLandmark(c, theme, island.x, island.y, t), box, !open && inker.enabled, ctx),
          LANDMARK_INK,
        ),
    })
  }
  for (const d of STANDING) {
    // a bought zone is cleared for building (its flat bits stay, under whatever goes up)
    if (hidden(d, unlocked, villages) || (d.area?.zone && unlocked.has(d.area.id))) continue
    const c0 = tileCenter(d.x, d.y)
    const box = boxAround(c0.x, c0.y, 34, 70, 14)
    if (!boxInView(view, box)) continue
    const dim = locked(d.area, unlocked) && inker.enabled
    out.push({
      depth: landDepth(d.x, d.y),
      draw: () => inker.draw(ctx, `wd${d.x},${d.y}`, `${dim}`, box, shaded((c) => drawDecor(c, d.kind, d.x, d.y, d.size, d.biome), box, dim, ctx), decorInk(d.kind)),
    })
  }
  for (const f of FEATURES) {
    const g = tileCenter(f.x, f.y, f.w, f.h)
    const rise = featureRise(f.kind)
    const box = boxAround(g.x, g.y, (f.w + f.h) * 16 + 18, rise + 10, (f.w + f.h) * 8 + 12)
    if (!boxInView(view, box)) continue
    const dim = locked(f.area, unlocked) && inker.enabled
    out.push({
      depth: landDepth(f.x, f.y, f.w, f.h),
      draw: () =>
        inker.draw(
          ctx,
          `ft${f.x},${f.y}`,
          `${dim},${ANIMATED_FEATURES.has(f.kind) ? frame : 0}`,
          box,
          shaded((c) => drawFeature(c, f.kind, f.x, f.y, t), box, dim, ctx),
          inkForSize((f.w + f.h) * 32, rise),
        ),
    })
  }
  return out
}

/** Mist over the locked zones and worlds, and the moon's twinkling stars (after everything standing). */
export function drawLandSky(ctx: Ctx, unlocked: Set<string>, t: number, view: View) {
  for (const [i, area] of ZONES.entries()) if (!unlocked.has(area.id) && rectInView(view, area.rect, 60)) drawFog(ctx, area.rect, t, 60 + i, 3)
  for (const [i, area] of WORLDS.entries()) {
    const island = area.world!.island
    if (!rectInView(view, island, 120)) continue
    if (!unlocked.has(area.id)) drawFog(ctx, island, t, 40 + i)
    if (area.world!.theme !== 'moon') continue
    const { top, left, right } = footprintCorners(island.x, island.y, island.w, island.h)
    for (let s = 0; s < 9; s++) {
      const x = left.x + (right.x - left.x) * (0.08 + hash(s, 1, 51) * 0.84)
      const y = top.y + (left.y - top.y) * (0.2 + hash(s, 2, 53) * 1.2) - 90
      const tw = (Math.sin(t * 2.4 + s * 1.7) + 1) / 2
      const r = 1.6 + tw * 2
      ctx.globalAlpha = 0.35 + tw * 0.65
      ctx.beginPath()
      ctx.moveTo(x, y - r * 1.6)
      ctx.quadraticCurveTo(x, y, x + r * 1.6, y)
      ctx.quadraticCurveTo(x, y, x, y + r * 1.6)
      ctx.quadraticCurveTo(x, y, x - r * 1.6, y)
      ctx.quadraticCurveTo(x, y, x, y - r * 1.6)
      ctx.fillStyle = '#fff7c2'
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}

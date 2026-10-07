import { NEIGHBOR_SIZE as N, NEIGHBOR_SLOTS } from '../data/neighbors'
import type { ObjectLook, Point } from '../types'
import { type Inker, boxAround, inkForSize } from './ink'
import { type Camera, HALF_H, HALF_W, footprintCorners, tileCenter, tileToWorld, worldToScreen } from './iso'
import { landDepth } from './land'
import { OUTLINE, drawObjectSprite, fillStroke, hash, poly, spriteBounds } from './sprites'

type Ctx = CanvasRenderingContext2D
type View = { minX: number; maxX: number; minY: number; maxY: number }

/** Another player's city, shown as a small village out in the wild land (one per slot, in order). */
export interface NeighborIsland {
  userId: string
  /** City name, and the line under it (level, or "helped today"). */
  title: string
  subtitle: string
  level: number
  helped: boolean
}

const LAWN = ['#b4e08a', '#a9d97e']
/** Roofs and walls, so neighbors don't all look alike. */
const PALETTES = [
  { wall: '#fff4e2', roof: '#5aa9e6', trim: '#ff8fab' },
  { wall: '#ffe3ea', roof: '#ef7f9b', trim: '#ffffff' },
  { wall: '#f6e3c0', roof: '#e07b39', trim: '#8a5a33' },
  { wall: '#e8f4d9', roof: '#5bb36a', trim: '#ffffff' },
  { wall: '#fdf0c4', roof: '#9b6fd6', trim: '#ffffff' },
  { wall: '#dff0fb', roof: '#d9534a', trim: '#fff6e6' },
]
const LEAVES = ['#5aa35a', '#6dbb5a', '#4f8f5e']

/** Where houses stand on the island (top corner, 2×2): back, left, right, front quadrants. */
const QUADRANTS: Point[] = [
  { x: 0.6, y: 0.6 },
  { x: 0.6, y: 3.4 },
  { x: 3.4, y: 0.6 },
  { x: 3.4, y: 3.4 },
]
const TREE_SPOTS: Point[] = [
  { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 5 }, { x: 5, y: 5 },
  { x: 2.5, y: 0 }, { x: 0, y: 2.5 }, { x: 5, y: 2.5 }, { x: 2.5, y: 5 },
  { x: 1.1, y: 1.1 }, { x: 3.9, y: 1.1 }, { x: 1.1, y: 3.9 }, { x: 3.9, y: 3.9 },
]

interface Piece {
  look: ObjectLook
  x: number
  y: number
  size: number
}

function seedOf(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h) % 9973
}

/** A bigger city shows more houses: one, then another at each district level (5, 8, 12). */
function houseCount(level: number): number {
  return 1 + Number(level >= 5) + Number(level >= 8) + Number(level >= 12)
}

const layoutCache = new Map<string, Piece[]>()

/** The island's houses and trees, back to front (stable per player). */
function layout(island: NeighborIsland, slot: Point): Piece[] {
  const key = `${island.userId},${island.level},${slot.x},${slot.y}`
  const hit = layoutCache.get(key)
  if (hit) return hit
  const seed = seedOf(island.userId)
  const count = houseCount(island.level)
  const spots = count === 1 ? [{ x: 2, y: 2 }] : QUADRANTS.slice(0, count)
  const pieces: Piece[] = spots.map((s, i) => ({
    look: { type: 'house', ...PALETTES[(seed + i * 2) % PALETTES.length], wallHeight: i ? 24 : 28, roofHeight: i ? 20 : 24, chimney: i === 0 },
    x: slot.x + s.x,
    y: slot.y + s.y,
    size: 2,
  }))
  for (const [i, t] of TREE_SPOTS.entries()) {
    if (hash(seed, i, 41) > 0.6) continue
    if (spots.some((s) => t.x < s.x + 2 && t.x + 1 > s.x && t.y < s.y + 2 && t.y + 1 > s.y)) continue
    const leaf = LEAVES[Math.floor(hash(seed, i, 43) * LEAVES.length)]
    const r = hash(seed, i, 47)
    const look: ObjectLook = r < 0.45 ? { type: 'tree', leaf } : r < 0.75 ? { type: 'pine', leaf } : { type: 'bush', leaf }
    pieces.push({ look, x: slot.x + t.x, y: slot.y + t.y, size: 1 })
  }
  pieces.sort((a, b) => a.x + a.y + a.size * 2 - (b.x + b.y + b.size * 2))
  layoutCache.set(key, pieces)
  return pieces
}

function inView(view: View, slot: Point): boolean {
  const c = footprintCorners(slot.x, slot.y, N, N)
  return c.right.x > view.minX && c.left.x < view.maxX && c.bottom.y > view.minY && c.top.y - 80 < view.maxY
}

/** A mown lawn with a stone edging — the village's yard. */
function drawPlot(ctx: Ctx, slot: Point, ink: boolean) {
  const { top, right, bottom, left } = footprintCorners(slot.x, slot.y, N, N)
  poly(ctx, [top, right, bottom, left])
  ctx.fillStyle = LAWN[0]
  ctx.fill()
  ctx.beginPath()
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if ((x + y) % 2 === 0) continue
      const a = tileToWorld(slot.x + x, slot.y + y)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(a.x + HALF_W, a.y + HALF_H)
      ctx.lineTo(a.x, a.y + HALF_H * 2)
      ctx.lineTo(a.x - HALF_W, a.y + HALF_H)
      ctx.closePath()
    }
  }
  ctx.fillStyle = LAWN[1]
  ctx.fill()
  poly(ctx, [top, right, bottom, left])
  ctx.lineJoin = 'round'
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = ink ? 6.5 : 5
  ctx.stroke()
  ctx.strokeStyle = '#e9dcc0'
  ctx.lineWidth = ink ? 3.5 : 3
  ctx.stroke()
}

/** The neighbor villages' yards (world space, with the rest of the ground). */
export function drawNeighborPlots(ctx: Ctx, islands: NeighborIsland[], view: View, ink: boolean) {
  islands.forEach((_, i) => {
    const slot = NEIGHBOR_SLOTS[i]
    if (slot && inView(view, slot)) drawPlot(ctx, slot, ink)
  })
}

/** The villages' houses and trees, for the renderer's back-to-front pass. */
export function neighborStanding(ctx: Ctx, inker: Inker, islands: NeighborIsland[], view: View): { depth: number; draw: () => void }[] {
  const out: { depth: number; draw: () => void }[] = []
  islands.forEach((island, i) => {
    const slot = NEIGHBOR_SLOTS[i]
    if (!slot || !inView(view, slot)) return
    layout(island, slot).forEach((p, j) => {
      const g = tileCenter(p.x, p.y, p.size, p.size)
      const b = spriteBounds(p.look, p.size, p.size)
      out.push({
        depth: landDepth(p.x, p.y, p.size, p.size),
        draw: () =>
          inker.draw(
            ctx,
            `nb${island.userId},${j}`,
            `${p.x},${p.y}`,
            boxAround(g.x, g.y, b.half + 8, b.rise + 16, b.below + 6),
            (c) => drawObjectSprite(c, p.look, p.x, p.y, p.size, p.size, 0),
            inkForSize(b.half * 2, b.rise + b.below),
          ),
      })
    })
  })
  return out
}

/** Where the name tag hangs, in world units: above the island's back corner. */
function tagPoint(slot: Point): Point {
  const top = tileToWorld(slot.x, slot.y)
  return { x: tileCenter(slot.x, slot.y, N, N).x, y: top.y - 58 }
}

/** Name tags over the neighbor islands — screen space, so they stay readable at any zoom. */
export function drawNeighborTags(ctx: Ctx, islands: NeighborIsland[], cam: Camera, viewW: number, viewH: number) {
  islands.forEach((island, i) => {
    const slot = NEIGHBOR_SLOTS[i]
    if (!slot) return
    const w = tagPoint(slot)
    const p = worldToScreen(cam, viewW, viewH, w.x, w.y)
    if (p.x < -120 || p.y < -60 || p.x > viewW + 120 || p.y > viewH + 60) return
    ctx.font = '800 12px Manrope, sans-serif'
    const wt = ctx.measureText(island.title).width
    ctx.font = 'bold 10px Manrope, sans-serif'
    const ws = ctx.measureText(island.subtitle).width
    const tw = Math.max(wt, ws) + 20
    const th = 34
    ctx.beginPath()
    ctx.roundRect(p.x - tw / 2, p.y - th / 2 + 2, tw, th, 12)
    ctx.fillStyle = OUTLINE
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(p.x - tw / 2, p.y - th / 2, tw, th, 12)
    fillStroke(ctx, '#fdf3d9', OUTLINE, 2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '800 12px Manrope, sans-serif'
    ctx.fillStyle = '#3a2a06'
    ctx.fillText(island.title, p.x, p.y - 6)
    ctx.font = 'bold 10px Manrope, sans-serif'
    ctx.fillStyle = island.helped ? '#2f8a3a' : '#52514e'
    ctx.fillText(island.subtitle, p.x, p.y + 8)
  })
}

/** The neighbor island under world point (wx, wy) — its ground, its houses, or its name tag. */
export function neighborAt(islands: NeighborIsland[], wx: number, wy: number): NeighborIsland | null {
  // Fractional tile under the point.
  const tx = (wy / HALF_H + wx / HALF_W) / 2
  const ty = (wy / HALF_H - wx / HALF_W) / 2
  for (const [i, island] of islands.entries()) {
    const slot = NEIGHBOR_SLOTS[i]
    if (!slot) break
    if (tx >= slot.x && ty >= slot.y && tx < slot.x + N && ty < slot.y + N) return island
    const mid = tileCenter(slot.x, slot.y, N, N)
    const top = tileToWorld(slot.x, slot.y)
    if (Math.abs(wx - mid.x) < N * HALF_W * 0.7 && wy > top.y - 100 && wy < mid.y) return island
  }
  return null
}

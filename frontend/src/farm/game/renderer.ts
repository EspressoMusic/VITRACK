import { AREAS, AREAS_BY_ID, CONTINENT, DISTRICTS, GERM_ROAD, GERM_SIGN, ISLAND, JUNK_ROAD, MAP_HEIGHT, MAP_WIDTH, OUTSIDE, ownedRect } from '../data/areas'
import { CROPS_BY_ID } from '../data/crops'
import { nearFoodGuardSpot } from '../data/foodGuards'
import { nearGuardSpot } from '../data/guards'
import { ITEMS_BY_ID } from '../data/items'
import { OBJECTS_BY_ID } from '../data/objects'
import { RECIPES_BY_ID } from '../data/recipes'
import { isBuilt, objectLevel } from '../systems/BuildingSystem'
import { cropStage, isCropReady, needsWater } from '../systems/CropSystem'
import { gateHp, gateStats } from '../systems/DefenseSystem'
import { areaAt, placementTiles } from '../systems/MapSystem'
import { jobStatus } from '../systems/ProductionSystem'
import type { GameState, PlacedObject, Point } from '../types'
import { type Camera, footprintCorners, tileCenter, tileToWorld, worldToScreen, worldToTile } from './iso'
import {
  drawDeadTree,
  drawGermNest,
  drawJunkNest,
  drawGoo,
  drawHeart,
  drawRock,
  drawShrooms,
  drawSignpost,
  drawWallPost,
  drawWallSegment,
  gateZapPoint,
} from './citySprites'
import { CAGE_RISE } from './friends'
import { type GermDrawable, type GermSwarm, OUTSIDE_DEPTH, paintGermPortrait } from './germs'
import { INK_THIN, Inker, boxAround, inkForSize } from './ink'
import { CAGE_SPOTS, drawContinent, drawLandGround, drawLandSky, landStanding, nearCage } from './land'
import { type NeighborIsland, drawNeighborPlots, drawNeighborTags, neighborStanding } from './neighbors'
import { LOCKED_SHADE, drawFog, shaded } from './worlds'
import { OUTLINE, drawCrop, drawFieldSoil, drawObjectSprite, drawPine, drawTree, fillStroke, hash, isAnimatedLook, isFlat, poly, spriteBounds, spriteHeight } from './sprites'

type Ctx = CanvasRenderingContext2D

export interface SceneUi {
  selectedUid: string | null
  placing: { defId: string; x: number; y: number; uid?: string } | null
  plantingCropId: string | null
}

/** Something standing on the map between tiles (the player's character). */
export interface SceneActor {
  /** Fractional tile coordinates of its feet. */
  x: number
  y: number
  draw: (ctx: Ctx, wx: number, wy: number) => void
}

export interface Scene {
  state: GameState
  actor: SceneActor | null
  germs?: GermSwarm | null
  /** Other live things standing outside the wall (guards at the gate). */
  extras?: GermDrawable[]
  /** Other players' cities, as islands in the sea around this one. */
  neighbors?: NeighborIsland[]
  /** Thick ink outline around every object (on unless set to false). */
  ink?: boolean
  now: number
  cam: Camera
  viewW: number
  viewH: number
  dpr: number
  ui: SceneUi
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  color: string
  size: number
  kind: 'dust' | 'bit' | 'star' | 'text'
  text?: string
}

const WATER = '#86d3e6'
const GRASS = ['#9fd673', '#96cf6a']
const GRASS_LOCKED = ['#78a85a', '#71a055']
const GRASS_OUTSIDE = ['#b5b98c', '#aeb285']
const BUILD_DUST_EVERY = 380

const INK_FPS = 12

/** Ink weight follows how big the object looks: thin for a flower bed, bold for a house or the gate. */
function objectInk(defId: string) {
  const def = OBJECTS_BY_ID[defId]
  const b = spriteBounds(def.look, def.width, def.height)
  return inkForSize(b.half * 2, b.rise + b.below)
}

const WALL_INK = inkForSize(64, 56)
const NEST_INK = inkForSize(96, 60)
const SIGN_INK = inkForSize(44, 60)

function objectBox(defId: string, x: number, y: number) {
  const def = OBJECTS_BY_ID[defId]
  const g = tileCenter(x, y, def.width, def.height)
  const b = spriteBounds(def.look, def.width, def.height)
  return boxAround(g.x, g.y, b.half + 8, b.rise + 16, b.below + 6)
}

function depthOf(o: PlacedObject): number {
  const def = OBJECTS_BY_ID[o.defId]
  const front = o.y + (def?.height ?? 1) - 1
  // built out past the wall's front line (in a bought zone), it sorts with the germs and wild land there
  return o.x + (def?.width ?? 1) - 1 + front + o.x * 0.001 + (front >= OUTSIDE.y ? OUTSIDE_DEPTH : 0)
}

/** Static wild trees covering locked land — they disappear once the area is bought. */
const WILD_TREES: { x: number; y: number; areaId: string; pine: boolean }[] = []
for (let y = 0; y < MAP_HEIGHT; y++) {
  for (let x = 0; x < MAP_WIDTH; x++) {
    const area = areaAt(x, y)
    if (area && area.cost > 0 && hash(x, y, 99) < 0.17 && !nearCage(x, y)) WILD_TREES.push({ x, y, areaId: area.id, pine: hash(x, y, 7) < 0.5 })
  }
}

/** Wave marks in the sea ringing the continent (the ones under the land are simply drawn over). */
const SEA = {
  x: (CONTINENT.x - CONTINENT.y - CONTINENT.h) * 32 - 500,
  w: (CONTINENT.w + CONTINENT.h) * 32 + 1000,
  y: (CONTINENT.x + CONTINENT.y) * 16 - 400,
  h: (CONTINENT.w + CONTINENT.h) * 16 + 800,
}
const WAVES: Point[] = Array.from({ length: 260 }, (_, i) => ({
  x: SEA.x + hash(i, 3, 1) * SEA.w,
  y: SEA.y + hash(i, 5, 2) * SEA.h,
}))

// ---------- the outside: the germs' road and swamp, the junk food's trail and candy cave, and some gloomy wild land ----------

interface Trail {
  /** Tile coordinates. */
  points: Point[]
  width: number
  fill: string
  edge: string
  /** Pebbles (or chocolate chips) along it. */
  bits: string
  seed: number
}

/** Road from the swamp into the gate's doorway. */
const GERM_TRAIL: Trail = {
  points: [...GERM_ROAD, { x: GERM_ROAD[GERM_ROAD.length - 1].x, y: OUTSIDE.y - 0.1 }],
  width: 23,
  fill: '#d6bd8f',
  edge: '#8f7550',
  bits: '#bfa274',
  seed: 4,
}

/** Chocolate-chip trail from the candy cave to where the junk food stands. */
const JUNK_TRAIL: Trail = { points: JUNK_ROAD, width: 17, fill: '#c99a6e', edge: '#7a5236', bits: '#6b3f26', seed: 9 }

const SIGN_AT = tileToWorld(GERM_SIGN.x, GERM_SIGN.y)

/** Whether a world point is on the germ library's signpost. */
export function germSignHit(wx: number, wy: number): boolean {
  return Math.abs(wx - SIGN_AT.x) < 24 && wy > SIGN_AT.y - 62 && wy < SIGN_AT.y + 6
}

function distToRoad(x: number, y: number, points: Point[]): number {
  let best = Infinity
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const len2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
    const k = len2 ? Math.max(0, Math.min(1, ((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / len2)) : 0
    best = Math.min(best, Math.hypot(x - (a.x + (b.x - a.x) * k), y - (a.y + (b.y - a.y) * k)))
  }
  return best
}

type OutsideDecor = { x: number; y: number; kind: 'deadTree' | 'rock' | 'goo' | 'shrooms'; size: number }
const OUTSIDE_DECOR: OutsideDecor[] = []
for (let y = OUTSIDE.y + 1; y < OUTSIDE.y + OUTSIDE.h; y++) {
  for (let x = OUTSIDE.x; x < OUTSIDE.x + OUTSIDE.w; x++) {
    const cx = x + 0.5
    const cy = y + 0.5
    if (distToRoad(cx, cy, GERM_TRAIL.points) < 1.6 || Math.hypot(cx - GERM_SIGN.x, cy - GERM_SIGN.y) < 1.6 || nearFoodGuardSpot(cx, cy) || nearGuardSpot(cx, cy)) continue
    if (distToRoad(cx, cy, JUNK_ROAD) < 1.6 || Math.hypot(cx - JUNK_ROAD[0].x, cy - JUNK_ROAD[0].y) < 2.2) continue
    const r = hash(x, y, 31)
    const kind = r < 0.1 ? 'deadTree' : r < 0.17 ? 'rock' : r < 0.23 ? 'goo' : r < 0.28 ? 'shrooms' : null
    if (kind) OUTSIDE_DECOR.push({ x, y, kind, size: 0.75 + hash(x, y, 5) * 0.5 })
  }
}

// ---------- city wall: follows the edge of the open districts, with a gap for the gate ----------

function drawWallPiece(c: Ctx, piece: WallPiece) {
  if (piece.post) drawWallPost(c, piece.post.x, piece.post.y)
  else drawWallSegment(c, ...piece.segment!)
}

function wallBox(piece: WallPiece) {
  if (piece.post) {
    const p = tileToWorld(piece.post.x, piece.post.y)
    return boxAround(p.x, p.y, 10, 32, 8)
  }
  const [ax, ay, bx, by] = piece.segment!
  const a = tileToWorld(ax, ay)
  const b = tileToWorld(bx, by)
  const x = Math.min(a.x, b.x) - 8
  const y = Math.min(a.y, b.y) - 26
  return { x, y, w: Math.abs(a.x - b.x) + 16, h: Math.abs(a.y - b.y) + 32 }
}

interface WallPiece {
  depth: number
  segment?: [number, number, number, number]
  post?: Point
}

/** The fence runs around all the land bought so far — districts, wild zones and worlds — growing with every purchase. */
function buildWall(state: GameState): WallPiece[] {
  const owned = new Set<string>()
  for (const id of state.unlockedAreas) {
    const area = AREAS_BY_ID[id]
    if (!area) continue
    const r = ownedRect(area)
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) owned.add(`${x},${y}`)
  }
  const open = (x: number, y: number) => owned.has(`${x},${y}`)
  const gates = state.objects
    .filter((o) => OBJECTS_BY_ID[o.defId]?.kind === 'gate')
    .map((o) => ({ x: o.x, y: o.y, w: OBJECTS_BY_ID[o.defId].width, h: OBJECTS_BY_ID[o.defId].height }))
  const inGate = (x: number, y: number) => gates.some((g) => x >= g.x && y >= g.y && x < g.x + g.w && y < g.y + g.h)
  const onGateOutline = (vx: number, vy: number) => gates.some((g) => vx >= g.x && vy >= g.y && vx <= g.x + g.w && vy <= g.y + g.h)
  const pieces: WallPiece[] = []
  const posts = new Set<string>()
  const outside = (y: number) => (y > OUTSIDE.y ? OUTSIDE_DEPTH : 0)
  const addSegment = (ax: number, ay: number, bx: number, by: number) => {
    pieces.push({ depth: (ax + bx) / 2 + (ay + by) / 2 - 1 + outside((ay + by) / 2), segment: [ax, ay, bx, by] })
    posts.add(`${ax},${ay}`)
    posts.add(`${bx},${by}`)
  }
  for (const key of owned) {
    const [x, y] = key.split(',').map(Number)
    if (inGate(x, y)) continue
    if (!open(x, y - 1)) addSegment(x, y, x + 1, y)
    if (!open(x, y + 1)) addSegment(x, y + 1, x + 1, y + 1)
    if (!open(x - 1, y)) addSegment(x, y, x, y + 1)
    if (!open(x + 1, y)) addSegment(x + 1, y, x + 1, y + 1)
  }
  for (const key of posts) {
    const [vx, vy] = key.split(',').map(Number)
    if ((vx + vy) & 1 || onGateOutline(vx, vy)) continue
    pieces.push({ depth: vx + vy - 1.02 + outside(vy), post: { x: vx, y: vy } })
  }
  return pieces
}

export class FarmRenderer {
  private particles: Particle[] = []
  private placedAt = new Map<string, number>()
  private lastDust = new Map<string, number>()
  private lastFrame = 0
  private wallCache: { areas: string[]; objects: unknown; pieces: WallPiece[] } | null = null
  private gateHitAt = -Infinity
  private zaps: { from: Point; to: Point; life: number }[] = []
  private inker = new Inker()
  private lastCam: Camera | null = null
  private inkFrame = -1

  /** A germ bit the gate: shake it and float the damage. */
  gateHit(at: Point, amount: number) {
    this.gateHitAt = performance.now()
    this.floatText(at.x, at.y, `-${amount}`, '#ff5a4f')
  }

  /** The gate's defense hits a germ. */
  zap(state: GameState, to: Point) {
    const gate = state.objects.find((o) => OBJECTS_BY_ID[o.defId]?.kind === 'gate')
    if (gate) this.zaps.push({ from: gateZapPoint(gate.x, gate.y, objectLevel(gate)), to, life: 0 })
  }

  /** A zap from anywhere (a guard's wand) to a germ, in world units. */
  zapFrom(from: Point, to: Point) {
    this.zaps.push({ from, to, life: 0 })
  }

  /** A germ popped (12 bits), or a tough one took a hit / spit splashed on the gate (fewer). */
  germPop(at: Point, color: string, count = 12) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      this.particles.push({
        x: at.x,
        y: at.y,
        vx: Math.cos(a) * (40 + Math.random() * 30),
        vy: Math.sin(a) * (30 + Math.random() * 20) - 40,
        life: 0,
        max: 0.55 + Math.random() * 0.2,
        color: i % 3 === 0 ? '#ffffff' : color,
        size: 2 + Math.random() * 1.8,
        kind: i % 4 === 0 ? 'star' : 'bit',
      })
    }
  }

  floatText(x: number, y: number, text: string, color: string) {
    this.particles.push({ x, y, vx: 0, vy: -26, life: 0, max: 1, color, size: 11, kind: 'text', text })
  }

  markPlaced(uid: string) {
    this.placedAt.set(uid, performance.now())
  }

  burst(kind: 'harvest' | 'build', tileX: number, tileY: number, color = '#f2c94c') {
    const p = tileToWorld(tileX, tileY)
    const count = kind === 'harvest' ? 12 : 14
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      if (kind === 'harvest') {
        this.particles.push({
          x: p.x,
          y: p.y - 6,
          vx: Math.cos(a) * (30 + Math.random() * 40),
          vy: -60 - Math.random() * 70,
          life: 0,
          max: 0.7 + Math.random() * 0.3,
          color: i % 3 === 0 ? '#ffffff' : color,
          size: 2 + Math.random() * 2,
          kind: i % 4 === 0 ? 'star' : 'bit',
        })
      } else {
        this.particles.push(this.dust(p.x + Math.cos(a) * 26, p.y + Math.sin(a) * 13))
      }
    }
  }

  private dust(x: number, y: number): Particle {
    return { x, y, vx: (Math.random() - 0.5) * 20, vy: -10 - Math.random() * 14, life: 0, max: 0.9, color: '#e8dcc2', size: 4 + Math.random() * 4, kind: 'dust' }
  }

  render(ctx: Ctx, s: Scene) {
    const { state, now, cam, viewW, viewH, dpr, ui } = s
    const t = now / 1000
    const dt = this.lastFrame ? Math.min(0.05, (now - this.lastFrame) / 1000) : 0
    this.lastFrame = now
    const z = cam.zoom
    const inker = this.inker
    inker.enabled = s.ink !== false
    inker.beginFrame(dpr * z)
    // While the camera moves, animated sprites hold their current picture: re-inking them every tick is what makes dragging stutter.
    const moving = !!this.lastCam && (cam.x !== this.lastCam.x || cam.y !== this.lastCam.y || cam.zoom !== this.lastCam.zoom)
    this.lastCam = cam
    if (!moving || this.inkFrame < 0) this.inkFrame = Math.floor(t * INK_FPS)
    const frame = this.inkFrame

    ctx.direction = 'ltr'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = WATER
    ctx.fillRect(0, 0, viewW, viewH)
    ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (viewW / 2 - cam.x * z), dpr * (viewH / 2 - cam.y * z))

    const view = {
      minX: cam.x - viewW / 2 / z - 70,
      maxX: cam.x + viewW / 2 / z + 70,
      minY: cam.y - viewH / 2 / z - 30,
      maxY: cam.y + viewH / 2 / z + 90,
    }
    const visible = (p: Point) => p.x > view.minX && p.x < view.maxX && p.y > view.minY && p.y < view.maxY

    this.drawWaves(ctx, t, visible)
    const unlocked = new Set(state.unlockedAreas)
    const villages = s.neighbors?.length ?? 0
    drawContinent(ctx, unlocked, t, inker.enabled, view)
    drawLandGround(ctx, unlocked, t, view, z, villages)
    if (villages) drawNeighborPlots(ctx, s.neighbors!, view, inker.enabled)
    this.drawGround(ctx, state, visible)
    this.drawRoad(ctx, GERM_TRAIL)
    this.drawRoad(ctx, JUNK_TRAIL)
    for (const d of OUTSIDE_DECOR) if (d.kind === 'goo' && visible(tileCenter(d.x, d.y))) drawGoo(ctx, d.x, d.y, t)

    const movingUid = ui.placing?.uid
    const objects = state.objects.filter((o) => o.uid !== movingUid).sort((a, b) => depthOf(a) - depthOf(b))

    // Flat pass: soil, paths, ponds, flower beds.
    for (const o of objects) {
      const def = OBJECTS_BY_ID[o.defId]
      if (!isFlat(def.look) || !visible(tileCenter(o.x, o.y, def.width, def.height))) continue
      if (def.kind === 'field') {
        const glow = !!ui.plantingCropId && !o.crop && isBuilt(o, now)
        const wet = !!o.crop?.wateredAt
        inker.draw(ctx, o.uid, `soil${o.x},${o.y},${glow},${wet}`, objectBox(o.defId, o.x, o.y), (c) => drawFieldSoil(c, o.x, o.y, glow, wet), INK_THIN)
      } else if (def.look.type === 'path') {
        this.withBounce(ctx, o, () => drawObjectSprite(ctx, def.look, o.x, o.y, def.width, def.height, t))
      } else {
        const key = `${o.defId},${o.x},${o.y},${isAnimatedLook(def.look) ? frame : 0}`
        this.withBounce(ctx, o, () =>
          inker.draw(ctx, o.uid, key, objectBox(o.defId, o.x, o.y), (c) => drawObjectSprite(c, def.look, o.x, o.y, def.width, def.height, t), objectInk(o.defId)),
        )
      }
    }
    if (inker.enabled) this.inkPaths(ctx, objects)

    // Standing pass, back to front: crops, buildings, trees, wild trees on locked land, the other worlds.
    const standing: { depth: number; draw: () => void }[] = []
    for (const o of objects) {
      const def = OBJECTS_BY_ID[o.defId]
      if (!visible(tileCenter(o.x, o.y, def.width, def.height))) continue
      if (def.kind === 'field') {
        if (o.crop) {
          const crop = CROPS_BY_ID[o.crop.cropId]
          const stage = cropStage(o.crop, now)
          const c0 = tileCenter(o.x, o.y)
          standing.push({
            depth: depthOf(o),
            draw: () =>
              inker.draw(
                ctx,
                `crop${o.uid}`,
                `${crop.id},${stage},${o.x},${o.y},${frame}`,
                boxAround(c0.x, c0.y, 36, 42, 18),
                (c) => drawCrop(c, crop, stage, o.x, o.y, t),
                INK_THIN,
              ),
          })
        }
      } else if (!isFlat(def.look)) {
        const underConstruction = !isBuilt(o, now)
        const busy = (o.queue ?? []).some((j) => jobStatus(j, now) === 'working')
        const level = objectLevel(o)
        const health = def.kind === 'gate' ? gateHp(o, now) / gateStats(o).maxHp : 1
        const shake = def.kind === 'gate' ? this.gateShake() : 0
        const moving = !underConstruction && (isAnimatedLook(def.look) || busy || (def.look.type === 'shop' && def.look.terrace))
        const look = `${health < 0.01 ? 0 : health < 0.45 ? 1 : 2}`
        const key = `${o.defId},${o.x},${o.y},${underConstruction},${busy},${level},${look},${moving ? frame : 0}`
        standing.push({
          depth: depthOf(o),
          draw: () =>
            this.withBounce(ctx, o, () => {
              if (shake) ctx.translate(shake, 0)
              inker.draw(
                ctx,
                o.uid,
                key,
                objectBox(o.defId, o.x, o.y),
                (c) => drawObjectSprite(c, def.look, o.x, o.y, def.width, def.height, t, { underConstruction, busy, level, health }),
                objectInk(o.defId),
              )
              if (shake) ctx.translate(-shake, 0)
            }),
        })
      }
    }
    for (const tree of WILD_TREES) {
      if (unlocked.has(tree.areaId) || !visible(tileCenter(tree.x, tree.y))) continue
      const c0 = tileCenter(tree.x, tree.y)
      const box = boxAround(c0.x, c0.y, 34, 66, 12)
      standing.push({
        depth: tree.x + tree.y + tree.x * 0.001,
        // Wild trees hold still (there are dozens of them), so each is inked once — in the locked land's night shade.
        draw: () =>
          inker.draw(
            ctx,
            `wild${tree.x},${tree.y}`,
            'dim',
            box,
            shaded((c) => (tree.pine ? drawPine(c, tree.x, tree.y, '#4f8f5e') : drawTree(c, tree.x, tree.y, '#5aa35a', 0)), box, true, ctx),
            objectInk(tree.pine ? 'pineTree' : 'oakTree'),
          ),
      })
    }
    standing.push(...landStanding(ctx, inker, unlocked, t, frame, view, villages))
    if (villages) standing.push(...neighborStanding(ctx, inker, s.neighbors!, view))
    for (const piece of this.wall(state)) {
      const at = piece.post ?? { x: piece.segment![0], y: piece.segment![1] }
      if (!visible(tileToWorld(at.x, at.y))) continue
      const id = piece.post ? `post${piece.post.x},${piece.post.y}` : `wall${piece.segment!.join(',')}`
      standing.push({ depth: piece.depth, draw: () => inker.draw(ctx, id, 'w', wallBox(piece), (c) => drawWallPiece(c, piece), WALL_INK) })
    }
    for (const d of OUTSIDE_DECOR) {
      if (d.kind === 'goo' || !visible(tileCenter(d.x, d.y))) continue
      const c0 = tileCenter(d.x, d.y)
      standing.push({
        depth: OUTSIDE_DEPTH + d.x + d.y,
        draw: () =>
          inker.draw(
            ctx,
            `out${d.x},${d.y}`,
            'w',
            boxAround(c0.x, c0.y, 24, 44, 10),
            (c) => (d.kind === 'deadTree' ? drawDeadTree(c, d.x, d.y) : d.kind === 'rock' ? drawRock(c, d.x, d.y, d.size) : drawShrooms(c, d.x, d.y)),
            INK_THIN,
          ),
      })
    }
    const nest = tileToWorld(GERM_ROAD[0].x, GERM_ROAD[0].y + 0.35)
    if (visible(nest)) {
      standing.push({
        depth: OUTSIDE_DEPTH + GERM_ROAD[0].x + GERM_ROAD[0].y - 0.5,
        draw: () => inker.draw(ctx, 'nest', `${frame}`, boxAround(nest.x, nest.y, 48, 42, 24), (c) => drawGermNest(c, nest, t), NEST_INK),
      })
    }
    const cave = tileToWorld(JUNK_ROAD[0].x, JUNK_ROAD[0].y + 0.35)
    if (visible(cave)) {
      standing.push({
        depth: OUTSIDE_DEPTH + JUNK_ROAD[0].x + JUNK_ROAD[0].y - 0.5,
        draw: () => inker.draw(ctx, 'candyCave', `${frame}`, boxAround(cave.x, cave.y, 50, 50, 24), (c) => drawJunkNest(c, cave, t), NEST_INK),
      })
    }
    if (visible(SIGN_AT)) {
      standing.push({
        depth: OUTSIDE_DEPTH + GERM_SIGN.x + GERM_SIGN.y - 1,
        draw: () =>
          inker.draw(
            ctx,
            'germSign',
            `${frame}`,
            boxAround(SIGN_AT.x, SIGN_AT.y, 28, 66, 8),
            (c) => {
              const board = drawSignpost(c, SIGN_AT)
              c.save()
              c.translate(board.x, board.y + 8)
              c.scale(0.78, 0.78)
              paintGermPortrait(c, 'flu', t)
              c.restore()
            },
            SIGN_INK,
          ),
      })
    }
    for (const g of [...(s.germs?.drawables(t) ?? []), ...(s.extras ?? [])]) {
      if (!visible(g.at)) continue
      standing.push({
        depth: g.depth,
        draw: () => {
          // Alpha goes on the finished sprite, so a fading germ's ink fades with it.
          ctx.globalAlpha = g.alpha
          const dx = g.shift?.x ?? 0
          const dy = (g.shift?.y ?? 0) - (g.lift ?? 0)
          if (dx || dy) ctx.translate(dx, dy)
          if (g.noInk) g.draw(ctx)
          else if (g.cache) inker.draw(ctx, g.cache.id, g.cache.key, g.box, g.draw, g.ink ?? INK_THIN)
          else inker.drawLive(ctx, g.box, g.draw, g.ink ?? INK_THIN)
          if (dx || dy) ctx.translate(-dx, -dy)
          ctx.globalAlpha = 1
        },
      })
    }
    if (s.actor) {
      const actor = s.actor
      const feet = tileToWorld(actor.x, actor.y)
      // Depth matches a 1×1 object on the tile the feet are in, nudged in front of it.
      if (visible(feet)) standing.push({ depth: actor.x + actor.y - 1 + 0.01, draw: () => actor.draw(ctx, feet.x, feet.y) })
    }
    standing.sort((a, b) => a.depth - b.depth).forEach((d) => d.draw())
    this.drawLockedFog(ctx, unlocked, t, view)
    drawLandSky(ctx, unlocked, t, view)

    if (ui.placing) this.drawGhost(ctx, state, ui.placing, now, t)
    this.drawZaps(ctx, dt)
    this.drawOverlays(ctx, objects, ui, now, t, visible)
    this.drawParticles(ctx, dt)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.drawLockBadges(ctx, state, cam, viewW, viewH)
    if (s.neighbors?.length) drawNeighborTags(ctx, s.neighbors, cam, viewW, viewH)
  }

  /** Mist drifting over the city's locked districts. */
  private drawLockedFog(ctx: Ctx, unlocked: Set<string>, t: number, view: { minX: number; maxX: number; minY: number; maxY: number }) {
    DISTRICTS.forEach((area, i) => {
      if (unlocked.has(area.id)) return
      const c = footprintCorners(area.rect.x, area.rect.y, area.rect.w, area.rect.h)
      if (c.right.x < view.minX || c.left.x > view.maxX || c.bottom.y < view.minY || c.top.y > view.maxY) return
      drawFog(ctx, area.rect, t, i)
    })
  }

  private wall(state: GameState): WallPiece[] {
    const c = this.wallCache
    if (c && c.areas === state.unlockedAreas && c.objects === state.objects) return c.pieces
    this.wallCache = { areas: state.unlockedAreas, objects: state.objects, pieces: buildWall(state) }
    return this.wallCache.pieces
  }

  private gateShake(): number {
    const k = (performance.now() - this.gateHitAt) / 260
    return k >= 1 ? 0 : Math.sin(k * 30) * 1.8 * (1 - k)
  }

  /** Ink along the outer edge of the street network (not between paving tiles). */
  private inkPaths(ctx: Ctx, objects: PlacedObject[]) {
    const paths = new Set<string>()
    for (const o of objects) if (OBJECTS_BY_ID[o.defId].look.type === 'path') paths.add(`${o.x},${o.y}`)
    if (!paths.size) return
    const has = (x: number, y: number) => paths.has(`${x},${y}`)
    ctx.beginPath()
    for (const key of paths) {
      const [x, y] = key.split(',').map(Number)
      const edge = (ax: number, ay: number, bx: number, by: number) => {
        const a = tileToWorld(ax, ay)
        const b = tileToWorld(bx, by)
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }
      if (!has(x, y - 1)) edge(x, y, x + 1, y)
      if (!has(x, y + 1)) edge(x, y + 1, x + 1, y + 1)
      if (!has(x - 1, y)) edge(x, y, x, y + 1)
      if (!has(x + 1, y)) edge(x + 1, y, x + 1, y + 1)
    }
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 2.6
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  private drawRoad(ctx: Ctx, trail: Trail) {
    const pts = trail.points.map((p) => tileToWorld(p.x, p.y))
    const path = () => {
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length - 1; i++) {
        const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 }
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mid.x, mid.y)
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    path()
    ctx.strokeStyle = this.inker.enabled ? OUTLINE : trail.edge
    ctx.lineWidth = trail.width + (this.inker.enabled ? 5 : 4)
    ctx.stroke()
    path()
    ctx.strokeStyle = trail.fill
    ctx.lineWidth = trail.width
    ctx.stroke()
    ctx.fillStyle = trail.bits
    for (let i = 0; i < 18; i++) {
      const k = i / 18
      const seg = Math.min(pts.length - 2, Math.floor(k * (pts.length - 1)))
      const f = k * (pts.length - 1) - seg
      const x = pts[seg].x + (pts[seg + 1].x - pts[seg].x) * f + (hash(i, 1, trail.seed) - 0.5) * trail.width * 0.6
      const y = pts[seg].y + (pts[seg + 1].y - pts[seg].y) * f + (hash(i, 2, trail.seed) - 0.5) * 6
      ctx.beginPath()
      ctx.ellipse(x, y, 2.6, 1.4, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawZaps(ctx: Ctx, dt: number) {
    this.zaps = this.zaps.filter((z) => (z.life += dt) < 0.18)
    for (const z of this.zaps) {
      const alpha = 1 - z.life / 0.18
      const pts: Point[] = [z.from]
      for (let i = 1; i < 5; i++) {
        const k = i / 5
        pts.push({ x: z.from.x + (z.to.x - z.from.x) * k + (Math.random() - 0.5) * 9, y: z.from.y + (z.to.y - z.from.y) * k + (Math.random() - 0.5) * 9 })
      }
      pts.push(z.to)
      for (const [w, color] of [
        [5, `rgba(127,231,220,${alpha * 0.55})`],
        [2, `rgba(255,255,255,${alpha})`],
      ] as const) {
        ctx.strokeStyle = color
        ctx.lineWidth = w
        ctx.lineCap = 'round'
        ctx.beginPath()
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        ctx.stroke()
      }
    }
  }

  private withBounce(ctx: Ctx, o: PlacedObject, draw: () => void) {
    const start = this.placedAt.get(o.uid)
    const p = start === undefined ? 1 : (performance.now() - start) / 450
    if (p >= 1) {
      if (start !== undefined) this.placedAt.delete(o.uid)
      draw()
      return
    }
    const def = OBJECTS_BY_ID[o.defId]
    const anchor = tileCenter(o.x, o.y, def.width, def.height)
    const k = 1 + Math.sin(p * Math.PI * 2) * 0.16 * (1 - p)
    ctx.save()
    ctx.translate(anchor.x, anchor.y)
    ctx.scale(1 / Math.sqrt(k), k)
    ctx.translate(-anchor.x, -anchor.y)
    draw()
    ctx.restore()
  }

  private drawWaves(ctx: Ctx, t: number, visible: (p: Point) => boolean) {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    WAVES.forEach((w, i) => {
      const x = w.x + Math.sin(t * 0.6 + i) * 8
      if (!visible({ x, y: w.y })) return
      ctx.beginPath()
      ctx.arc(x, w.y, 7, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()
    })
  }

  private drawGround(ctx: Ctx, state: GameState, visible: (p: Point) => boolean) {
    const unlocked = new Set(state.unlockedAreas)
    for (let y = 0; y < ISLAND.h; y++) {
      for (let x = 0; x < ISLAND.w; x++) {
        const c = tileCenter(x, y)
        if (!visible(c)) continue
        const area = areaAt(x, y)
        const open = !!area && unlocked.has(area.id)
        const palette = y >= OUTSIDE.y ? GRASS_OUTSIDE : open ? GRASS : GRASS_LOCKED
        const a = tileToWorld(x, y)
        poly(ctx, [a, tileToWorld(x + 1, y), tileToWorld(x + 1, y + 1), tileToWorld(x, y + 1)])
        ctx.fillStyle = palette[(x + y) % 2]
        ctx.fill()
        const r = hash(x, y)
        if (r < 0.3) {
          ctx.strokeStyle = open ? '#7cb85a' : '#5f8a48'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          const gx = c.x + (hash(x, y, 2) - 0.5) * 30
          const gy = c.y + (hash(x, y, 3) - 0.5) * 12
          ctx.moveTo(gx - 3, gy - 3)
          ctx.lineTo(gx - 1, gy)
          ctx.lineTo(gx + 1, gy - 4)
          ctx.lineTo(gx + 2, gy)
          ctx.lineTo(gx + 4, gy - 3)
          ctx.stroke()
        } else if (r > 0.95 && open) {
          ctx.fillStyle = r > 0.975 ? '#fff6a8' : '#ffffff'
          ctx.beginPath()
          ctx.arc(c.x + (hash(x, y, 4) - 0.5) * 24, c.y + (hash(x, y, 5) - 0.5) * 10, 1.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    // locked districts sink into night shade, with a faint dashed outline
    const locked = DISTRICTS.filter((area) => !unlocked.has(area.id))
    ctx.fillStyle = LOCKED_SHADE
    for (const area of locked) {
      const c = footprintCorners(area.rect.x, area.rect.y, area.rect.w, area.rect.h)
      poly(ctx, [c.top, c.right, c.bottom, c.left])
      ctx.fill()
    }
    ctx.setLineDash([6, 5])
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    for (const area of locked) {
      const c = footprintCorners(area.rect.x, area.rect.y, area.rect.w, area.rect.h)
      poly(ctx, [c.top, c.right, c.bottom, c.left])
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  private drawGhost(ctx: Ctx, state: GameState, placing: NonNullable<SceneUi['placing']>, now: number, t: number) {
    const def = OBJECTS_BY_ID[placing.defId]
    const tiles = placementTiles(state, placing.defId, placing.x, placing.y, placing.uid)
    const okAll = tiles.every((tile) => tile.free)
    for (const tile of tiles) {
      poly(ctx, [
        tileToWorld(tile.x, tile.y),
        tileToWorld(tile.x + 1, tile.y),
        tileToWorld(tile.x + 1, tile.y + 1),
        tileToWorld(tile.x, tile.y + 1),
      ])
      ctx.fillStyle = tile.free ? 'rgba(70,200,90,0.5)' : 'rgba(230,60,50,0.55)'
      ctx.fill()
    }
    const c = footprintCorners(placing.x, placing.y, def.width, def.height)
    poly(ctx, [c.top, c.right, c.bottom, c.left])
    ctx.strokeStyle = okAll ? '#2e9e44' : '#c0392b'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.globalAlpha = 0.78
    const lift = Math.sin(t * 5) * 1.5 - 3
    ctx.save()
    ctx.translate(0, lift)
    drawObjectSprite(ctx, def.look, placing.x, placing.y, def.width, def.height, t)
    // A field being moved takes its crop along.
    const crop = placing.uid ? state.objects.find((o) => o.uid === placing.uid)?.crop : null
    if (crop) drawCrop(ctx, CROPS_BY_ID[crop.cropId], cropStage(crop, now), placing.x, placing.y, t)
    ctx.restore()
    ctx.globalAlpha = 1
  }

  private drawOverlays(
    ctx: Ctx,
    objects: PlacedObject[],
    ui: SceneUi,
    now: number,
    t: number,
    visible: (p: Point) => boolean,
  ) {
    for (const o of objects) {
      const def = OBJECTS_BY_ID[o.defId]
      const c = footprintCorners(o.x, o.y, def.width, def.height)
      const ground = tileCenter(o.x, o.y, def.width, def.height)
      if (!visible(ground)) continue
      const topY = c.top.y - (isBuilt(o, now) ? spriteHeight(def.look) : 30)

      if (o.uid === ui.selectedUid) {
        poly(ctx, [c.top, c.right, c.bottom, c.left])
        ctx.strokeStyle = `rgba(255,255,255,${0.65 + Math.sin(t * 6) * 0.3})`
        ctx.lineWidth = 3
        ctx.stroke()
      }

      if (!isBuilt(o, now)) {
        const total = def.buildTime * 1000
        const progress = total > 0 ? 1 - (o.builtAt - now) / total : 1
        this.progressBar(ctx, ground.x, topY - 4, progress)
        const last = this.lastDust.get(o.uid) ?? 0
        if (now - last > BUILD_DUST_EVERY) {
          this.lastDust.set(o.uid, now)
          this.particles.push(this.dust(ground.x + (Math.random() - 0.5) * 50, ground.y + (Math.random() - 0.5) * 16))
        }
        continue
      }

      if (def.kind === 'field' && o.crop && isCropReady(o.crop, now)) {
        const tw = (Math.sin(t * 4 + o.x * 1.3 + o.y) + 1) / 2
        this.sparkle(ctx, ground.x + 12, ground.y - 22 - tw * 3, 3 + tw * 2.5, 0.5 + tw * 0.5)
      } else if (def.kind === 'field' && o.crop && needsWater(o.crop, now)) {
        // Still dry: a little drop asks for water (the character comes by with the can).
        this.waterDrop(ctx, ground.x + 13, ground.y - 21 + Math.sin(t * 3 + o.x * 1.3 + o.y) * 1.8)
      }

      if (def.kind === 'production') {
        const ready = (o.queue ?? []).filter((j) => jobStatus(j, now) === 'ready')
        if (ready.length > 0) {
          const item = ITEMS_BY_ID[RECIPES_BY_ID[ready[0].recipeId].output]
          this.bubble(ctx, ground.x, topY - 8 + Math.sin(t * 3) * 2.5, item.icon, ready.length)
        }
      }

      if (def.kind === 'gate') this.gateBar(ctx, o, ground.x, c.top.y - 88, now)

    }
  }

  private gateBar(ctx: Ctx, gate: PlacedObject, x: number, y: number, now: number) {
    const max = gateStats(gate).maxHp
    const hp = gateHp(gate, now)
    const f = hp / max
    const w = 58
    const flash = Math.max(0, 1 - (performance.now() - this.gateHitAt) / 300)
    ctx.beginPath()
    ctx.roundRect(x - w / 2 + 6, y - 6, w, 10, 5)
    fillStroke(ctx, '#3a2a14', OUTLINE, 1.3)
    ctx.beginPath()
    ctx.roundRect(x - w / 2 + 7.5, y - 4.5, Math.max(4, (w - 3) * f), 7, 3.5)
    ctx.fillStyle = flash > 0 ? '#ffffff' : f > 0.6 ? '#7ad151' : f > 0.3 ? '#ffcf4a' : '#f0645a'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x - w / 2 + 3, y - 1, 8.5, 0, Math.PI * 2)
    fillStroke(ctx, '#fffdf5', OUTLINE, 1.3)
    drawHeart(ctx, x - w / 2 + 3, y - 0.5, 4.6, hp < 1 ? '#b9a1a6' : '#ff5d7a')
    ctx.font = 'bold 7px Manrope, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`${Math.floor(hp)}/${max}`, x + 6, y - 0.5)
  }

  private progressBar(ctx: Ctx, x: number, y: number, progress: number) {
    const w = 44
    ctx.beginPath()
    ctx.roundRect(x - w / 2, y - 6, w, 8, 4)
    fillStroke(ctx, '#3a2a14', OUTLINE, 1.2)
    ctx.beginPath()
    ctx.roundRect(x - w / 2 + 1.5, y - 4.5, Math.max(4, (w - 3) * Math.min(1, Math.max(0, progress))), 5, 2.5)
    ctx.fillStyle = '#7ad151'
    ctx.fill()
  }

  private bubble(ctx: Ctx, x: number, y: number, icon: string, count: number) {
    poly(ctx, [
      { x: x - 5, y: y + 8 },
      { x: x + 5, y: y + 8 },
      { x, y: y + 15 },
    ])
    fillStroke(ctx, '#fffdf5')
    ctx.beginPath()
    ctx.arc(x, y, 12.5, 0, Math.PI * 2)
    fillStroke(ctx, '#fffdf5')
    ctx.font = '14px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icon, x, y + 1)
    if (count > 1) {
      ctx.beginPath()
      ctx.arc(x + 11, y - 9, 6.5, 0, Math.PI * 2)
      fillStroke(ctx, '#d9534a', OUTLINE, 1)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 8px Manrope, sans-serif'
      ctx.fillText(String(count), x + 11, y - 8.5)
    }
  }

  private waterDrop(ctx: Ctx, x: number, y: number) {
    ctx.beginPath()
    ctx.moveTo(x, y - 6.5)
    ctx.bezierCurveTo(x + 1.5, y - 3.5, x + 4.2, y - 1, x + 4.2, y + 1.6)
    ctx.arc(x, y + 1.6, 4.2, 0, Math.PI)
    ctx.bezierCurveTo(x - 4.2, y - 1, x - 1.5, y - 3.5, x, y - 6.5)
    fillStroke(ctx, '#5cc0ee', OUTLINE, 1.2)
    ctx.beginPath()
    ctx.ellipse(x - 1.6, y + 0.8, 0.9, 1.6, 0.3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fill()
  }

  private sparkle(ctx: Ctx, x: number, y: number, r: number, alpha: number) {
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.moveTo(x, y - r * 1.6)
    ctx.quadraticCurveTo(x, y, x + r * 1.6, y)
    ctx.quadraticCurveTo(x, y, x, y + r * 1.6)
    ctx.quadraticCurveTo(x, y, x - r * 1.6, y)
    ctx.quadraticCurveTo(x, y, x, y - r * 1.6)
    ctx.fillStyle = '#fff7c2'
    ctx.fill()
    ctx.strokeStyle = '#e0a500'
    ctx.lineWidth = 0.8
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  private drawParticles(ctx: Ctx, dt: number) {
    this.particles = this.particles.filter((p) => (p.life += dt) < p.max)
    for (const p of this.particles) {
      const k = p.life / p.max
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.kind === 'bit') p.vy += 260 * dt
      ctx.globalAlpha = 1 - k
      if (p.kind === 'dust') {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 + k * 1.5), 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      } else if (p.kind === 'text') {
        ctx.globalAlpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4
        ctx.font = `900 ${p.size}px Manrope, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.lineWidth = 3
        ctx.strokeStyle = '#2b1d0e'
        ctx.strokeText(p.text ?? '', p.x, p.y)
        ctx.fillStyle = p.color
        ctx.fillText(p.text ?? '', p.x, p.y)
      } else if (p.kind === 'star') {
        this.sparkle(ctx, p.x, p.y, p.size, 1 - k)
      } else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        fillStroke(ctx, p.color, OUTLINE, 0.8)
      }
    }
    ctx.globalAlpha = 1
  }

  /** Lock badges stay a constant on-screen size regardless of zoom. */
  private drawLockBadges(ctx: Ctx, state: GameState, cam: Camera, viewW: number, viewH: number) {
    for (const area of AREAS) {
      if (state.unlockedAreas.includes(area.id)) continue
      const r = ownedRect(area)
      const cage = CAGE_SPOTS[area.id]
      const w = cage ? tileToWorld(cage.x, cage.y) : tileCenter(r.x, r.y, r.w, r.h)
      const p = worldToScreen(cam, viewW, viewH, w.x, w.y)
      // floating over the land's cage, the price tag just clear of its top
      if (cage) p.y -= CAGE_RISE * cam.zoom + 46
      if (p.x < -60 || p.y < -60 || p.x > viewW + 60 || p.y > viewH + 60) continue
      ctx.beginPath()
      ctx.arc(p.x, p.y, 19, 0, Math.PI * 2)
      fillStroke(ctx, '#fdf3d9', '#000000', 2)
      ctx.font = '17px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🔒', p.x, p.y + 1)
      const cost = area.cost.toLocaleString('en-US')
      ctx.font = 'bold 11px Manrope, sans-serif'
      const wc = ctx.measureText(cost).width
      const tw = 11 + 3 + wc + 16
      ctx.beginPath()
      ctx.roundRect(p.x - tw / 2, p.y + 23, tw, 19, 9.5)
      fillStroke(ctx, 'rgba(40,28,12,0.82)', null)
      let x = p.x - tw / 2 + 8
      ctx.textAlign = 'left'
      ctx.beginPath()
      ctx.arc(x + 5.5, p.y + 32.5, 5.5, 0, Math.PI * 2)
      fillStroke(ctx, '#ffcf4a', '#000000', 1.2)
      x += 11 + 3
      ctx.fillStyle = '#ffffff'
      ctx.fillText(cost, x, p.y + 33)
    }
  }
}

/** Front-most object under a world point: footprint first, then the part of tall sprites above it. */
export function hitTest(state: GameState, wx: number, wy: number, now: number): PlacedObject | null {
  const tile = worldToTile(wx, wy)
  const sorted = [...state.objects].sort((a, b) => depthOf(b) - depthOf(a))
  for (const o of sorted) {
    const def = OBJECTS_BY_ID[o.defId]
    if (tile.x >= o.x && tile.x < o.x + def.width && tile.y >= o.y && tile.y < o.y + def.height) return o
    const rise = isBuilt(o, now) ? spriteHeight(def.look) : 30
    if (rise <= 0) continue
    const c = footprintCorners(o.x, o.y, def.width, def.height)
    const ground = tileCenter(o.x, o.y, def.width, def.height)
    if (wx > c.left.x + 6 && wx < c.right.x - 6 && wy > c.top.y - rise && wy < ground.y) return o
  }
  return null
}

import { useEffect, useLayoutEffect, useRef } from 'react'
import { type AvatarLook, DEFAULT_LOOK, getAvatarLook } from '../../avatar/look'
import { THROW_RELEASE } from '../../avatar/model'
import { AvatarSprite } from '../../avatar/sprite'
import { OBJECTS_BY_ID } from '../data/objects'
import { farm, getGameState, onFx } from '../store/gameStore'
import { isMovable } from '../systems/BuildingSystem'
import type { FoodGuardSpec } from '../systems/FoodGuardSystem'
import type { GameState, PlacedObject, Point } from '../types'
import { AVATAR_WORLD_SCALE, AvatarWalker, THROW_MS } from './avatarWalker'
import { drawChoreProps } from './choreFx'
import { type Chore, pendingChores } from './chores'
import { FoodGuardSquad, STONE_DUST } from './foodGuards'
import { TownFriends } from './friends'
import { GateBuddy } from './gateBuddy'
import { type GermEvent, GermSwarm } from './germs'
import { GuardSquad } from './guards'
import { type Camera, clampCamera, screenToWorld, tileToWorld, worldToScreen, worldToTile } from './iso'
import { type NeighborIsland, neighborAt } from './neighbors'
import { FarmRenderer, type SceneActor, type SceneUi, germSignHit, hitTest } from './renderer'
import { VeggieThrows } from './veggieThrow'
import { WallCrew } from './wallCrew'

/** How high above the feet the paw lets go of a thrown vegetable, in model units. */
const THROW_HAND_RISE = 1.25

export interface TapInfo {
  tile: Point
  obj: PlacedObject | null
  /** Tap position relative to the canvas. */
  screen: Point
  /** Tap position in viewport coordinates (for reward animations). */
  client: Point
}

export interface CanvasController {
  /** Tile currently at the middle of the screen. */
  centerTile(): Point
  /** Glides the camera so tile point (x, y) ends up mid-screen; returns where the point `lift` world units
   *  above it will be on screen (e.g. the top of a building, to anchor a menu). */
  focusTile(x: number, y: number, lift?: number): Point
}

interface Props {
  ui: SceneUi
  onTap: (tap: TapInfo) => void
  onGhostMove: (x: number, y: number) => void
  onPanStart: () => void
  /** The player tapped their character. */
  onAvatarTap: () => void
  /** The player pressed and held one of their own objects: it gets picked up to be dragged somewhere else. */
  onObjectHold?: (obj: PlacedObject) => void
  /** The player tapped the germ library's signpost. */
  onGermSignTap?: () => void
  controllerRef: React.RefObject<CanvasController | null>
  /** Someone else's city to show read-only (a visit) instead of the player's own; `look` is its owner's character.
   *  Give the canvas a new `key` per visited city — updates to the same city (e.g. a guard just sent) show live. */
  world?: GameState
  look?: AvatarLook
  /** This week's food guards (null while loading); `arrivals` are new ones that drop in. Ignored while visiting. */
  foodGuards?: { guards: FoodGuardSpec[]; arrivals: string[] } | null
  /** The player tapped a food guard. */
  onFoodGuardTap?: (id: string) => void
  /** Other players' cities, as islands past the shore (ignored while visiting). */
  neighbors?: NeighborIsland[]
  /** The player tapped a neighbor's island. */
  onNeighborTap?: (userId: string) => void
  /** A land was just bought and its food friend broke out of the cage (it's moving into town). */
  onFriendFreed?: (areaId: string) => void
  /** The player tapped a food friend living in town (by its land's id). */
  onFriendTap?: (areaId: string) => void
}

type Gesture =
  | { kind: 'none' }
  | { kind: 'pan'; start: Point; cam0: Camera; moved: boolean }
  | { kind: 'pinch'; dist0: number; zoom0: number; anchor: Point }
  | { kind: 'ghost'; offset: Point }

const TAP_SLOP = 7
/** How long a finger rests on an object before it gets picked up to move. */
const HOLD_MS = 420

// Kept across tab switches so coming back to the farm doesn't reset the view.
let savedCamera: Camera | null = null
let savedWalker: AvatarWalker | null = null
// Rosters whose new guards already dropped in, so a remount (tab switch, coming home from a visit) doesn't replay it.
const arrivalsPlayed = new WeakSet<object>()

function placeFoodGuards(squad: FoodGuardSquad, roster: Props['foodGuards']) {
  if (!roster) return
  squad.setRoster(roster.guards, arrivalsPlayed.has(roster) ? [] : roster.arrivals, Date.now())
  arrivalsPlayed.add(roster)
}

/** Opens on the town with the gate, the road and the germs' swamp in view, framed between the top bar and the bottom menu. */
function initialCamera(viewW: number, viewH: number): Camera {
  const zoom = Math.min(1.25, Math.max(0.75, viewW / 450))
  const focus = tileToWorld(19.7, 21.1)
  const focusScreenY = (55 + viewH - 200) / 2
  return clampCamera({ x: focus.x, y: focus.y + (viewH / 2 - focusScreenY) / zoom, zoom })
}

export function FarmCanvas({
  ui,
  onTap,
  onGhostMove,
  onPanStart,
  onAvatarTap,
  onObjectHold,
  onGermSignTap,
  controllerRef,
  world,
  look,
  foodGuards,
  onFoodGuardTap,
  neighbors,
  onNeighborTap,
  onFriendFreed,
  onFriendTap,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const uiRef = useRef(ui)
  const handlersRef = useRef({ onTap, onGhostMove, onPanStart, onAvatarTap, onObjectHold, onGermSignTap, onFoodGuardTap, onNeighborTap, onFriendFreed, onFriendTap })
  const neighborsRef = useRef(neighbors)
  const foodSquadRef = useRef<FoodGuardSquad | null>(null)
  const foodGuardsRef = useRef(foodGuards)
  const worldRef = useRef(world)
  const lookRef = useRef(look)
  const visiting = !!world

  useLayoutEffect(() => {
    uiRef.current = ui
    worldRef.current = world
    handlersRef.current = { onTap, onGhostMove, onPanStart, onAvatarTap, onObjectHold, onGermSignTap, onFoodGuardTap, onNeighborTap, onFriendFreed, onFriendTap }
    foodGuardsRef.current = foodGuards
    neighborsRef.current = neighbors
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // While visiting, nothing here touches the player's own game: germs bite a picture of the other city.
    const getState = () => worldRef.current ?? getGameState()
    const renderer = new FarmRenderer()
    const sprite = new AvatarSprite(visiting ? (lookRef.current ?? DEFAULT_LOOK) : undefined)
    const walker = visiting ? new AvatarWalker(getState()) : (savedWalker ??= new AvatarWalker(getGameState()))
    let now = Date.now()
    const actor: SceneActor = {
      x: walker.x,
      y: walker.y,
      draw: (c, wx, wy) => {
        if (walker.hidden) return
        c.beginPath()
        c.ellipse(wx, wy, 10, 5, 0, 0, Math.PI * 2)
        c.fillStyle = 'rgba(30,40,10,0.22)'
        c.fill()
        sprite.draw(c, wx, wy, walker.yaw, walker.pose(now), AVATAR_WORLD_SCALE)
        const task = walker.task
        if (task) drawChoreProps(c, task, { x: wx, y: wy }, now / 1000)
      },
    }
    // At home the character tends the fields by itself (it leaves empty ones alone while the player plants or builds).
    if (!visiting) {
      walker.chores = (state, at) => pendingChores(state, at, !uiRef.current.plantingCropId && !uiRef.current.placing)
    }
    const germs = new GermSwarm()
    const throws = new VeggieThrows()
    // Food characters on top of the wall throwing stones (any city has them, sized by its gate).
    const crew = new WallCrew()
    // The player's food friend on top of the gate (not in someone else's city).
    const buddy = visiting ? null : new GateBuddy()
    const guards = new GuardSquad()
    // Food friends: caged on the locked lands, living in town once their land is bought.
    const friends = new TownFriends()
    // The player's own food guards: not shown in someone else's city.
    const foodSquad = new FoodGuardSquad()
    if (!visiting) {
      foodSquadRef.current = foodSquad
      placeFoodGuards(foodSquad, foodGuardsRef.current)
    }
    const view = { w: 1, h: 1, dpr: 1 }
    let cam: Camera = (!visiting && savedCamera) || initialCamera(canvas.clientWidth || 400, canvas.clientHeight || 760)
    let camGoal: Camera | null = null

    const setCam = (next: Camera) => {
      cam = clampCamera(next)
      if (!visiting) savedCamera = cam
    }

    controllerRef.current = {
      centerTile: () => worldToTile(cam.x, cam.y),
      focusTile: (x, y, lift = 0) => {
        const p = tileToWorld(x, y)
        camGoal = clampCamera({ ...cam, x: p.x, y: p.y })
        return worldToScreen(camGoal, view.w, view.h, p.x, p.y - lift)
      },
    }

    /** A world point in viewport coordinates (where coin rewards fly from). */
    const toClient = (p: Point): Point => {
      const s = worldToScreen(cam, view.w, view.h, p.x, p.y)
      const r = canvas.getBoundingClientRect()
      return { x: r.left + s.x, y: r.top + s.y }
    }

    /** The character finished working a field: now it really happens in the game. */
    const finishChore = (job: Chore) => {
      const at = tileToWorld(job.x + 0.5, job.y + 0.5)
      if (job.kind === 'harvest') farm.harvest(job.uid, toClient({ x: at.x, y: at.y - 14 }), true)
      else if (job.kind === 'water') {
        if (farm.water(job.uid)) renderer.germPop(at, '#7fd3ff', 9)
      } else if (job.cropId && farm.plant(job.uid, job.cropId, true)) renderer.burst('build', job.x + 0.5, job.y + 0.5)
    }

    const handleGerms = (events: GermEvent[]) => {
      for (const e of events) {
        if (e.type === 'bite') {
          if (!visiting) farm.hitGate(e.damage)
          renderer.gateHit(e.at, e.damage)
        } else if (e.type === 'zap') {
          renderer.zap(getState(), e.at)
        } else if (e.type === 'hit') {
          renderer.germPop(e.at, e.color, 5)
        } else if (e.type === 'heal') {
          renderer.floatText(e.at.x, e.at.y - 6, '+1', '#5fd46a')
        } else if (e.type === 'splat') {
          renderer.germPop(e.at, e.color ?? '#9be15d', 7)
        } else {
          renderer.germPop(e.at, e.color)
          if (!visiting) farm.germStopped(e.germId, e.mini, toClient(e.at))
        }
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      view.w = Math.max(1, rect.width)
      view.h = Math.max(1, rect.height)
      // 2× is already sharp on phones; 3× screens would paint (and cache) over twice the pixels for no visible gain.
      view.dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(view.w * view.dpr)
      canvas.height = Math.round(view.h * view.dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    const frame = () => {
      now = Date.now()
      const state = getState()
      const finished = walker.update(state, now)
      if (finished && !visiting) finishChore(finished)
      actor.x = walker.x
      actor.y = walker.y
      for (const e of friends.update(state, { x: walker.x, y: walker.y }, now)) {
        renderer.burst('build', e.tile.x, e.tile.y)
        if (e.type === 'cageBroken') {
          renderer.germPop({ x: e.at.x, y: e.at.y - 26 }, '#a3abbd', 16)
          renderer.floatText(e.at.x, e.at.y - 58, '♥', '#ff6b8a')
          if (!visiting) handlersRef.current.onFriendFreed?.(e.areaId)
        } else {
          renderer.germPop({ x: e.at.x, y: e.at.y - 14 }, '#ffcf4a', 10)
        }
      }
      handleGerms(germs.update(state, now, crew.targets()))
      buddy?.update(state, germs, throws, now)
      const landed = throws.update(germs, now)
      handleGerms(landed.events)
      for (const s of landed.splats) renderer.germPop(s.at, s.color, 4)
      const stones = crew.update(state, germs, now)
      handleGerms(stones.events)
      for (const at of stones.puffs) renderer.germPop(at, STONE_DUST, 4)
      for (const zap of guards.update(state, now, germs)) {
        renderer.zapFrom(zap.from, zap.to)
        handleGerms(zap.events)
      }
      if (!visiting) {
        for (const e of foodSquad.update(germs, now)) {
          if (e.type !== 'guardLanded') {
            handleGerms([e])
            continue
          }
          renderer.burst('build', e.tile.x, e.tile.y)
          renderer.germPop({ x: e.at.x, y: e.at.y - 16 }, e.color, 8)
        }
      }
      if (camGoal) {
        const k = 0.18
        setCam({ zoom: cam.zoom, x: cam.x + (camGoal.x - cam.x) * k, y: cam.y + (camGoal.y - cam.y) * k })
        if (Math.hypot(camGoal.x - cam.x, camGoal.y - cam.y) < 0.5) camGoal = null
      }
      const extras = guards.drawables(state, now, now / 1000)
      if (!visiting) extras.push(...foodSquad.drawables(now))
      extras.push(...crew.drawables(now))
      extras.push(...friends.drawables(state, now))
      if (buddy) extras.push(...buddy.drawables(now))
      extras.push(...throws.drawables(now))
      const neighbors = visiting ? undefined : neighborsRef.current
      renderer.render(ctx, { state, actor, germs, extras, neighbors, now, cam, viewW: view.w, viewH: view.h, dpr: view.dpr, ui: uiRef.current })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const offFx = onFx((e) => {
      if (e.type === 'burst') renderer.burst(e.kind, e.tileX, e.tileY, e.color)
      else if (e.type === 'placed') renderer.markPlaced(e.uid)
    })

    if (!visiting) farm.tick()
    const ticker = visiting ? 0 : window.setInterval(() => farm.tick(), 1000)

    // ---------- input ----------
    const pointers = new Map<number, Point>()
    let gesture: Gesture = { kind: 'none' }
    let holdTimer = 0
    const cancelHold = () => {
      window.clearTimeout(holdTimer)
      holdTimer = 0
    }

    const local = (e: { clientX: number; clientY: number }): Point => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const tileAt = (p: Point) => {
      const w = screenToWorld(cam, view.w, view.h, p.x, p.y)
      return worldToTile(w.x, w.y)
    }
    const startPinch = () => {
      const [a, b] = [...pointers.values()]
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      gesture = {
        kind: 'pinch',
        dist0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)),
        zoom0: cam.zoom,
        anchor: screenToWorld(cam, view.w, view.h, mid.x, mid.y),
      }
    }

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId)
      camGoal = null
      const p = local(e)
      pointers.set(e.pointerId, p)
      cancelHold()
      if (pointers.size >= 2) return startPinch()
      const placing = uiRef.current.placing
      if (placing) {
        const def = OBJECTS_BY_ID[placing.defId]
        const tile = tileAt(p)
        const dx = tile.x - placing.x
        const dy = tile.y - placing.y
        if (dx >= 0 && dy >= 0 && dx < def.width && dy < def.height) {
          gesture = { kind: 'ghost', offset: { x: dx, y: dy } }
          return
        }
      }
      gesture = { kind: 'pan', start: p, cam0: cam, moved: false }
      // Press and hold on any of the player's own objects (not the gate in the wall) to pick it up and drag it.
      const w = screenToWorld(cam, view.w, view.h, p.x, p.y)
      if (visiting || placing || uiRef.current.plantingCropId || germs.germAt(w.x, w.y) || walker.hit(w.x, w.y)) return
      const held = hitTest(getState(), w.x, w.y, Date.now())
      if (!held || !isMovable(OBJECTS_BY_ID[held.defId])) return
      const press = gesture
      holdTimer = window.setTimeout(() => {
        holdTimer = 0
        if (gesture !== press || press.moved || pointers.size !== 1) return
        const tile = tileAt(press.start)
        gesture = { kind: 'ghost', offset: { x: tile.x - held.x, y: tile.y - held.y } }
        navigator.vibrate?.(15)
        handlersRef.current.onObjectHold?.(held)
      }, HOLD_MS)
    }

    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return
      const p = local(e)
      pointers.set(e.pointerId, p)
      if (gesture.kind === 'pan') {
        const dx = p.x - gesture.start.x
        const dy = p.y - gesture.start.y
        if (!gesture.moved && Math.hypot(dx, dy) > TAP_SLOP) {
          cancelHold()
          gesture.moved = true
          handlersRef.current.onPanStart()
        }
        if (gesture.moved) setCam({ ...gesture.cam0, x: gesture.cam0.x - dx / cam.zoom, y: gesture.cam0.y - dy / cam.zoom })
      } else if (gesture.kind === 'pinch' && pointers.size >= 2) {
        const [a, b] = [...pointers.values()]
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
        const zoom = clampCamera({ ...cam, zoom: (gesture.zoom0 * Math.hypot(a.x - b.x, a.y - b.y)) / gesture.dist0 }).zoom
        setCam({ zoom, x: gesture.anchor.x - (mid.x - view.w / 2) / zoom, y: gesture.anchor.y - (mid.y - view.h / 2) / zoom })
      } else if (gesture.kind === 'ghost') {
        const tile = tileAt(p)
        const placing = uiRef.current.placing
        const nx = tile.x - gesture.offset.x
        const ny = tile.y - gesture.offset.y
        if (placing && (nx !== placing.x || ny !== placing.y)) handlersRef.current.onGhostMove(nx, ny)
      }
    }

    const onUp = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return
      const p = local(e)
      pointers.delete(e.pointerId)
      cancelHold()
      if (gesture.kind === 'pan' && !gesture.moved && e.type === 'pointerup') {
        const w = screenToWorld(cam, view.w, view.h, p.x, p.y)
        const tile = worldToTile(w.x, w.y)
        const state = getState()
        const tapNow = Date.now()
        const { placing, plantingCropId } = uiRef.current
        const germ = placing ? null : germs.germAt(w.x, w.y)
        const foodGuard = visiting || placing || plantingCropId ? null : foodSquad.guardAt(w.x, w.y)
        const neighbor = visiting || placing || plantingCropId || !neighborsRef.current ? null : neighborAt(neighborsRef.current, w.x, w.y)
        const friend = placing || plantingCropId ? null : friends.friendAt(w.x, w.y)
        if (germ) {
          if (walker.hidden) {
            handleGerms(germs.squish(germ))
          } else {
            // The character throws its vegetable at the germ, which gets squished when it lands.
            walker.throwToward({ x: germ.x, y: germ.y }, tapNow)
            const feet = tileToWorld(walker.x, walker.y)
            const veggie = (visiting ? lookRef.current ?? DEFAULT_LOOK : getAvatarLook()).veggie
            const hand = { x: feet.x, y: feet.y - THROW_HAND_RISE * AVATAR_WORLD_SCALE }
            throws.launch(veggie, hand, germ, germs, tapNow + THROW_MS * THROW_RELEASE)
          }
        } else if (foodGuard) {
          foodSquad.hop(foodGuard)
          handlersRef.current.onFoodGuardTap?.(foodGuard)
        } else if (neighbor) {
          handlersRef.current.onNeighborTap?.(neighbor.userId)
        } else if (friend) {
          const at = friends.poke(friend, tapNow)
          if (at) renderer.floatText(at.x, at.y, '♥', '#ff6b8a')
          if (!visiting) handlersRef.current.onFriendTap?.(friend)
        } else if (visiting) {
          // Visiting: just looking around (germs can still be squished).
        } else if (!placing && !plantingCropId && germSignHit(w.x, w.y)) {
          handlersRef.current.onGermSignTap?.()
        } else if (!placing && !plantingCropId && walker.hit(w.x, w.y)) {
          walker.wave(tapNow)
          handlersRef.current.onAvatarTap()
        } else {
          const obj = hitTest(state, w.x, w.y, tapNow)
          // Tapping open ground sends the character there (no-op on blocked or locked land).
          if (!obj && !placing && !plantingCropId) walker.walkTo(state, tile.x, tile.y, tapNow)
          handlersRef.current.onTap({ tile, obj, screen: p, client: { x: e.clientX, y: e.clientY } })
        }
      }
      if (pointers.size === 1) {
        // Lifting one finger of a pinch continues as a pan (never a tap).
        const [rest] = [...pointers.values()]
        gesture = { kind: 'pan', start: rest, cam0: cam, moved: true }
      } else if (pointers.size === 0) {
        gesture = { kind: 'none' }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      camGoal = null
      const p = local(e)
      const anchor = screenToWorld(cam, view.w, view.h, p.x, p.y)
      const zoom = clampCamera({ ...cam, zoom: cam.zoom * Math.exp(-e.deltaY * 0.0015) }).zoom
      handlersRef.current.onPanStart()
      setCam({ zoom, x: anchor.x - (p.x - view.w / 2) / zoom, y: anchor.y - (p.y - view.h / 2) / zoom })
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(raf)
      cancelHold()
      window.clearInterval(ticker)
      ro.disconnect()
      offFx()
      sprite.dispose()
      buddy?.dispose()
      if (!visiting) walker.chores = null
      controllerRef.current = null
      if (foodSquadRef.current === foodSquad) foodSquadRef.current = null
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [controllerRef, visiting])

  useEffect(() => {
    if (foodSquadRef.current) placeFoodGuards(foodSquadRef.current, foodGuards)
  }, [foodGuards])

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ touchAction: 'none' }} />
}

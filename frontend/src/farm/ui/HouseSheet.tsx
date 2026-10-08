import { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CheckIcon, CloseIcon, LogOutIcon } from '../../components/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { HOME_STRINGS, type HomeFilter, type HomeTab } from '../../lib/i18n/home'
import { FURNITURE, FURNITURE_BY_ID, ROOM_STYLES } from '../data/furniture'
import { drawOrder, furnitureBox, furnitureHull, paintFootprint, paintFurniture, paintRoom, roomBounds } from '../game/furnitureSprites'
import { blitInked, inkForSize, renderInked } from '../game/ink'
import { farm, getGameState, useGame } from '../store/gameStore'
import { canPlaceFurniture, type FurniturePose, furnitureFootprint, interiorOf, ownsRoomStyle, roomSize } from '../systems/HomeSystem'
import { findGate, gateHp, gateStats } from '../systems/DefenseSystem'
import { findObject } from '../systems/result'
import type { FurnitureDef, GameState, HomeInterior, PlacedFurniture, PlacedObject, Point, RoomStyleDef } from '../types'
import { BROWN, CoinAmount, CREAM, FitLabel, GameButton, INK, NAV_CLEARANCE, WHEAT } from './kit'

/** A piece picked up in the editor: an existing one being moved (`pieceId`), or a new one not bought yet. */
interface Draft extends FurniturePose {
  pieceId: string | null
  turned: boolean
}

type Room = { w: number; h: number }

/** Where the furniture drawer is: kept while it's closed, so it opens back on the same shelf. */
interface Shelf {
  tab: HomeTab
  filter: HomeFilter
  page: number
}

const TABS: { id: HomeTab; icon: string }[] = [
  { id: 'living', icon: '🛋️' },
  { id: 'bedroom', icon: '🛏️' },
  { id: 'kitchen', icon: '🍳' },
  { id: 'health', icon: '💪' },
  { id: 'decor', icon: '🌿' },
  { id: 'style', icon: '🎨' },
]
const FILTERS: HomeFilter[] = ['all', 'mine', 'shop']
const DRAFT_ID = '__draft'
/** Drawer tiles: three across, and as many rows as fit the screen — the drawer pages instead of scrolling. */
const COLS = 3
const CARD_H = 94
const GAP = 6
const OWNED_BG = '#eaf8df'
const EXIT_RED = '#e5393a'

function clampPose<T extends FurniturePose>(room: Room, pose: T): T {
  const f = furnitureFootprint(pose)
  return { ...pose, x: Math.max(0, Math.min(room.w - f.w, pose.x)), y: Math.max(0, Math.min(room.h - f.h, pose.y)) }
}

/** Free spot closest to the middle of the room, trying both ways round. */
function findSpot(room: Room, interior: HomeInterior, defId: string): Draft | null {
  const spots: Draft[] = []
  for (const turned of [false, true]) {
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) spots.push({ pieceId: null, defId, x, y, turned })
  }
  const mid = (d: Draft) => {
    const f = furnitureFootprint(d)
    return Math.hypot(f.x + f.w / 2 - room.w / 2, f.y + f.h / 2 - room.h / 2) + (d.turned ? 0.01 : 0)
  }
  spots.sort((a, b) => mid(a) - mid(b))
  return spots.find((s) => canPlaceFurniture(room, interior, s)) ?? null
}

/** Gate health under which a broken gate counts as fixed again (a share of its max), so the fire doesn't flicker on and off
 *  while it heals a point and germs knock it straight back down. */
const BREACH_CLEARS_AT = 0.1

/** True while the city's gate is broken and germs are pouring in. Checks the live game, or a visited city's snapshot. */
function useGateBreach(world?: GameState): boolean {
  const worldRef = useRef(world)
  worldRef.current = world
  const check = (was: boolean) => {
    const gate = findGate(worldRef.current ?? getGameState())
    if (!gate) return false
    const hp = gateHp(gate, Date.now())
    return was ? hp < gateStats(gate).maxHp * BREACH_CLEARS_AT : hp < 1
  }
  const [breached, setBreached] = useState(() => check(false))
  useEffect(() => {
    const timer = window.setInterval(() => setBreached((was) => check(was)), 1000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `check` only reads refs
  }, [])
  return breached
}

/** Inside the player's home: just the room on screen, decorated Sims style from the furniture drawer on the side. */
export function HouseSheet({ uid, onClose }: { uid: string; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = HOME_STRINGS[lang]
  const obj = useGame((s) => s.objects.find((o) => o.uid === uid))
  const coins = useGame((s) => s.player.coins)
  const interior = useMemo(() => (obj ? interiorOf(obj) : null), [obj])
  const room = obj ? roomSize(obj) : null
  const [draft, setDraft] = useState<Draft | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [shelf, setShelf] = useState<Shelf>({ tab: 'living', filter: 'all', page: 0 })
  const burning = useGateBreach()

  if (!obj || !interior || !room) return null

  const valid = draft ? canPlaceFurniture(room, interior, draft, draft.pieceId ?? undefined) : true

  /** Saves a moved/turned existing piece right away when it fits. */
  const settle = (pose: Draft) => {
    if (!pose.pieceId) return
    const home = findObject(getGameState(), uid)
    const fresh = home && interiorOf(home)
    const saved = fresh?.furniture.find((f) => f.id === pose.pieceId)
    if (!fresh || !saved || (saved.x === pose.x && saved.y === pose.y && !!saved.turned === pose.turned)) return
    if (canPlaceFurniture(room, fresh, pose, pose.pieceId)) farm.moveFurniture(uid, pose.pieceId, pose.x, pose.y, pose.turned)
  }

  const pickNew = (def: FurnitureDef) => {
    setDrawer(false)
    setDraft(findSpot(room, interior, def.id) ?? clampPose(room, { pieceId: null, defId: def.id, x: 0, y: 0, turned: false }))
  }

  const turn = () => {
    if (!draft) return
    const next = clampPose(room, { ...draft, turned: !draft.turned })
    setDraft(next)
    settle(next)
  }

  const place = () => {
    if (draft && !draft.pieceId && farm.placeFurniture(uid, draft)) setDraft(null)
  }

  const newPrice = draft && !draft.pieceId && !(interior.stored[draft.defId] > 0) ? FURNITURE_BY_ID[draft.defId]?.cost : null

  return (
    <HouseFrame
      title={t.title}
      onExit={onClose}
      end={
        <span
          className="flex items-center rounded-full px-2.5 py-1 text-sm"
          style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}`, color: '#3a2a06' }}
        >
          <CoinAmount value={coins} />
        </span>
      }
    >
      <div className="relative min-h-0 flex-1">
        <RoomView interior={interior} room={room} draft={draft} valid={valid} burning={burning} onDraft={setDraft} onRelease={settle} />

        {draft && (
          <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-center px-4">
            <span
              className="farm-pop rounded-full px-3 py-1 text-center text-[0.68rem] font-extrabold"
              style={{ backgroundColor: valid ? CREAM : '#fff1ec', color: valid ? '#3a2a06' : '#7a1d12', border: `2px solid ${INK}` }}
            >
              {valid ? t.movingHint : t.noRoom}
            </span>
          </div>
        )}

        {draft ? (
          <div className="absolute inset-x-0 bottom-3 flex justify-center px-3">
            <div
              className="farm-pop flex items-center gap-2 rounded-2xl p-1.5"
              style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 3px 0 ${INK}` }}
            >
              <ActionButton icon="🔄" label={t.turn} onClick={turn} />
              {draft.pieceId ? (
                <>
                  <ActionButton
                    icon="📦"
                    label={t.putAway}
                    onClick={() => {
                      if (draft.pieceId && farm.storeFurniture(uid, draft.pieceId)) setDraft(null)
                    }}
                  />
                  <GameButton color="green" className="h-10 px-4" onClick={() => setDraft(null)}>
                    {t.done} ✓
                  </GameButton>
                </>
              ) : (
                <>
                  <ActionButton icon="✖️" label={t.cancel} onClick={() => setDraft(null)} />
                  <GameButton color="green" className="h-10 px-3" disabled={!valid} onClick={place}>
                    <span>{t.place} ✓</span>
                    {newPrice != null && <CoinAmount value={newPrice} className={coins < newPrice ? 'text-[#b3261e]' : ''} />}
                  </GameButton>
                </>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label={t.furniture}
            className="farm-pop absolute bottom-4 start-3 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full active:translate-y-0.5 active:shadow-none"
            style={{ backgroundColor: '#ffcf4a', border: `3px solid ${INK}`, boxShadow: `0 3px 0 ${INK}` }}
          >
            <span className="text-2xl leading-none" aria-hidden>
              🛋️
            </span>
          </button>
        )}
      </div>

      {drawer && (
        <FurnitureDrawer
          interior={interior}
          coins={coins}
          shelf={shelf}
          onShelf={setShelf}
          onFurniture={pickNew}
          onStyle={(style) => {
            if (farm.roomStyle(uid, style.id)) setDrawer(false)
          }}
          onClose={() => setDrawer(false)}
        />
      )}
    </HouseFrame>
  )
}

/** Someone else's home, while visiting their city: look around, nothing to move or buy. */
export function VisitHouseSheet({ home, city, name, onClose }: { home: PlacedObject; city: GameState; name: string; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = HOME_STRINGS[lang]
  const interior = useMemo(() => interiorOf(home), [home])
  const burning = useGateBreach(city)

  return (
    <HouseFrame title={name} subtitle={t.visiting} onExit={onClose}>
      <div className="relative min-h-0 flex-1">
        <RoomView interior={interior} room={roomSize(home)} burning={burning} />
      </div>
    </HouseFrame>
  )
}

// ---------- frame ----------

function HouseFrame({
  title,
  subtitle,
  end,
  onExit,
  children,
}: {
  title: string
  subtitle?: string
  end?: ReactNode
  onExit: () => void
  children: ReactNode
}) {
  const { lang, dir } = useLanguage()
  const t = HOME_STRINGS[lang]

  return (
    <div
      className="modal-backdrop-enter absolute inset-x-0 top-0 z-[45] flex flex-col overflow-hidden"
      style={{ bottom: NAV_CLEARANCE, background: 'radial-gradient(120% 75% at 50% 50%, #fff9ee 0%, #ffe8c8 55%, #f6cb96 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(rgba(107,68,35,0.1) 1.6px, transparent 2.1px) 0 0 / 20px 20px' }}
        aria-hidden
      />

      <div className="relative grid shrink-0 grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 px-3 pb-1 pt-3">
        <button
          type="button"
          onClick={onExit}
          className="flex h-7 items-center gap-1 justify-self-start rounded-full pe-2.5 ps-2 text-xs font-extrabold active:translate-y-0.5 active:shadow-none"
          style={{ backgroundColor: EXIT_RED, color: '#ffffff', border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}` }}
        >
          {/* The arrow points out of the screen edge the button sits on. */}
          <span className="flex" style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : undefined }}>
            <LogOutIcon className="h-3.5 w-3.5" />
          </span>
          {t.exit}
        </button>
        <div className="flex min-w-0 flex-col items-center text-center">
          <h2 className="max-w-full truncate text-base font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
            {title}
          </h2>
          {subtitle && (
            <span className="text-[0.62rem] font-bold leading-tight" style={{ color: '#7a5a3a' }}>
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex justify-self-end">{end}</div>
      </div>

      {children}
    </div>
  )
}

// ---------- furniture drawer ----------

function FurnitureDrawer({
  interior,
  coins,
  shelf,
  onShelf,
  onFurniture,
  onStyle,
  onClose,
}: {
  interior: HomeInterior
  coins: number
  shelf: Shelf
  onShelf: (s: Shelf) => void
  onFurniture: (def: FurnitureDef) => void
  onStyle: (style: RoomStyleDef) => void
  onClose: () => void
}) {
  const { lang, dir } = useLanguage()
  const t = HOME_STRINGS[lang]
  const ft = FARM_STRINGS[lang]
  const level = useGame((s) => s.player.level)
  const gridRef = useRef<HTMLDivElement>(null)
  const [rows, setRows] = useState(3)

  useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return
    const fit = () => setRows(Math.max(1, Math.floor((el.clientHeight + GAP) / (CARD_H + GAP))))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const ownedCount = (id: string) => interior.furniture.filter((f) => f.defId === id).length + (interior.stored[id] ?? 0)
  const owns = (item: FurnitureDef | RoomStyleDef) => ('kind' in item ? ownsRoomStyle(interior, item.id) : ownedCount(item.id) > 0)
  const all: (FurnitureDef | RoomStyleDef)[] = shelf.tab === 'style' ? ROOM_STYLES : FURNITURE.filter((f) => f.category === shelf.tab)
  const items = shelf.filter === 'all' ? all : all.filter((item) => owns(item) === (shelf.filter === 'mine'))
  const perPage = rows * COLS
  const pages = Math.max(1, Math.ceil(items.length / perPage))
  const page = Math.min(shelf.page, pages - 1)
  const shown = items.slice(page * perPage, page * perPage + perPage)

  return (
    <>
      <div className="modal-backdrop-enter absolute inset-0 z-10" style={{ backgroundColor: 'rgba(20,14,4,0.35)' }} onPointerDown={onClose} />
      <div
        className="house-drawer absolute inset-y-0 start-0 z-10 flex w-[min(20rem,88%)] flex-col overflow-hidden rounded-e-2xl"
        style={
          {
            backgroundColor: CREAM,
            borderInlineEnd: `3px solid ${INK}`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 6px 18px rgba(20,14,4,0.25)',
            '--drawer-from': dir === 'rtl' ? '100%' : '-100%',
          } as CSSProperties
        }
      >
        <div className="flex shrink-0 items-center gap-2 px-3 py-2" style={{ backgroundColor: BROWN }}>
          <h2 className="min-w-0 flex-1 truncate text-sm font-extrabold" style={{ color: WHEAT }}>
            {t.furniture} 🛋️
          </h2>
          <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, color: '#3a2a06' }}>
            <CoinAmount value={coins} />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ color: WHEAT }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
          <div className="flex shrink-0 gap-0.5 rounded-full p-0.5" style={{ backgroundColor: 'rgba(107,68,35,0.12)', border: `2px solid ${INK}` }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onShelf({ ...shelf, filter: f, page: 0 })}
                aria-pressed={shelf.filter === f}
                className="h-8 flex-1 rounded-full text-xs font-extrabold"
                style={shelf.filter === f ? { backgroundColor: BROWN, color: WHEAT } : { color: '#3a2a06' }}
              >
                {t.filters[f]}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 justify-between gap-1">
            {TABS.map(({ id, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onShelf({ ...shelf, tab: id, page: 0 })}
                aria-label={t.tabs[id]}
                aria-pressed={shelf.tab === id}
                className="flex h-9 flex-1 items-center justify-center rounded-full text-lg leading-none"
                style={{ backgroundColor: shelf.tab === id ? BROWN : '#ffffff', border: `2px solid ${INK}` }}
              >
                <span aria-hidden>{icon}</span>
              </button>
            ))}
          </div>

          <div className="flex min-h-6 shrink-0 items-center justify-between gap-2 px-0.5">
            <span className="text-xs font-extrabold" style={{ color: '#3a2a06' }}>
              {t.tabs[shelf.tab]}
            </span>
            {pages > 1 && (
              <div className="flex items-center gap-1.5">
                {/* ‹ › are mirrored by the browser in right-to-left text, so they always point the right way. */}
                <PageButton label={t.prevPage} glyph="‹" disabled={page === 0} onClick={() => onShelf({ ...shelf, page: page - 1 })} />
                <span className="text-[0.62rem] font-extrabold tabular-nums" style={{ color: '#52514e' }} dir="ltr">
                  {page + 1}/{pages}
                </span>
                <PageButton label={t.nextPage} glyph="›" disabled={page >= pages - 1} onClick={() => onShelf({ ...shelf, page: page + 1 })} />
              </div>
            )}
          </div>

          <div
            ref={gridRef}
            className="grid min-h-0 flex-1 content-start overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gridAutoRows: CARD_H, gap: GAP }}
          >
            {shown.length === 0 && (
              <p className="col-span-3 px-2 py-6 text-center text-xs font-bold leading-snug" style={{ color: '#52514e' }}>
                {shelf.filter === 'mine' ? t.emptyMine : t.emptyShop}
              </p>
            )}
            {shown.map((item) =>
              'kind' in item ? (
                <StyleCard
                  key={item.id}
                  style={item}
                  name={item.name[lang]}
                  owned={ownsRoomStyle(interior, item.id)}
                  status={
                    interior[item.kind] === item.id
                      ? { text: t.inUse, color: '#2e7d32' }
                      : level < item.requiredLevel
                        ? { text: `${ft.levelShort(item.requiredLevel)} 🔒`, color: '#7a1d12' }
                        : ownsRoomStyle(interior, item.id)
                          ? { text: t.owned, color: '#2e7d32' }
                          : null
                  }
                  kindLabel={item.kind === 'wall' ? t.wall : t.floor}
                  disabled={level < item.requiredLevel}
                  onClick={() => onStyle(item)}
                />
              ) : (
                <FurnitureCard
                  key={item.id}
                  def={item}
                  name={item.name[lang]}
                  owned={ownedCount(item.id)}
                  locked={level < item.requiredLevel}
                  lockedLabel={`${ft.levelShort(item.requiredLevel)} 🔒`}
                  storedLabel={interior.stored[item.id] > 0 ? t.inStorage(interior.stored[item.id]) : null}
                  onClick={() => onFurniture(item)}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ---------- the room canvas ----------

function insidePolygon(p: Point, pts: Point[]): boolean {
  let hit = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]
    const b = pts[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit
  }
  return hit
}

/** How far the room zooms in (1 = the whole room fits on screen). */
const MAX_ROOM_ZOOM = 3
/** A press that moves less than this is a tap, not a drag. */
const TAP_SLOP = 6

/** Room camera: zoom, and the room point (world units) in the middle of the view. */
interface RoomCam {
  zoom: number
  x: number
  y: number
}

type Size = { w: number; h: number }

type Gesture =
  | { kind: 'none' }
  | { kind: 'piece'; pointer: number; grab: Point; pose: Draft }
  | { kind: 'pan'; start: Point; cam0: RoomCam; moved: boolean }
  | { kind: 'pinch'; dist0: number; zoom0: number; anchor: Point }

/** Scale at zoom 1: the whole room with a little air round it. */
function fitScale(size: Size, room: Room): number {
  const b = roomBounds(room.w, room.h)
  return Math.min((size.w - 20) / (b.maxX - b.minX), (size.h - 56) / (b.maxY - b.minY))
}

/** Keeps the zoom in range and the room on screen: zoomed out it sits in the middle, zoomed in it can't be dragged away. */
function clampCam(cam: RoomCam, size: Size, room: Room): RoomCam {
  if (!size.w || !size.h) return cam
  const b = roomBounds(room.w, room.h)
  const zoom = Math.min(MAX_ROOM_ZOOM, Math.max(1, cam.zoom))
  const scale = fitScale(size, room) * zoom
  const axis = (v: number, min: number, max: number, half: number) =>
    max - min <= half * 2 ? (min + max) / 2 : Math.min(max - half, Math.max(min + half, v))
  return { zoom, x: axis(cam.x, b.minX, b.maxX, size.w / 2 / scale), y: axis(cam.y, b.minY, b.maxY, size.h / 2 / scale) }
}

/** Camera at `zoom` that keeps the room point `anchor` under the screen point `at`. */
function camAround(anchor: Point, at: Point, zoom: number, size: Size, room: Room): RoomCam {
  const scale = fitScale(size, room) * Math.min(MAX_ROOM_ZOOM, Math.max(1, zoom))
  return clampCam({ zoom, x: anchor.x - (at.x - size.w / 2) / scale, y: anchor.y - (at.y - size.h / 2) / scale }, size, room)
}

/** The cut-away room: pinch or scroll to zoom and drag to look around, like the city map. Without `onDraft` it's look-only (a visited home).
 *  While `burning` (germs got through the gate) the window shows the city on fire, animated. */
function RoomView({
  interior,
  room,
  draft = null,
  valid = true,
  burning = false,
  onDraft,
  onRelease,
}: {
  interior: HomeInterior
  room: Room
  draft?: Draft | null
  valid?: boolean
  burning?: boolean
  onDraft?: (d: Draft) => void
  onRelease?: (d: Draft) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState<Size>({ w: 0, h: 0 })
  const [cam, setCam] = useState<RoomCam>(() => {
    const b = roomBounds(room.w, room.h)
    return { zoom: 1, x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 }
  })
  const view = useRef({ scale: 1, ox: 0, oy: 0 })
  const cache = useRef(new Map<string, ReturnType<typeof renderInked>>())
  /** Draws the current scene at a given time (seconds) — the fire animation calls it every frame. */
  const paint = useRef<(time: number) => void>(() => {})
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture>({ kind: 'none' })
  const latest = useRef({ interior, room, draft, onDraft, onRelease, size, cam })
  latest.current = { interior, room, draft, onDraft, onRelease, size, cam }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = Math.round(size.w * dpr)
    canvas.height = Math.round(size.h * dpr)
    const c = clampCam(cam, size, room)
    const scale = fitScale(size, room) * c.zoom
    const ox = size.w / 2 - c.x * scale
    const oy = size.h / 2 - c.y * scale
    view.current = { scale, ox, oy }
    const px = dpr * scale
    if (cache.current.size > 160) cache.current.clear()
    const pieces = drawOrder(piecesWithDraft(interior, draft))

    paint.current = (time) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy)
      paintRoom(ctx, room.w, room.h, interior.wall, interior.floor, burning ? time : undefined)
      if (draft) paintFootprint(ctx, furnitureFootprint(draft), valid ? 'rgba(122,199,79,0.5)' : 'rgba(240,100,90,0.55)')
      for (const p of pieces) {
        const key = `${p.defId}|${p.x}|${p.y}|${p.turned ? 1 : 0}|${px.toFixed(4)}`
        let inked = cache.current.get(key)
        if (!inked) {
          const box = furnitureBox(p)
          inked = renderInked(document.createElement('canvas'), px, box, (c) => paintFurniture(c, p), inkForSize(box.w - 12, box.h - 24))
          cache.current.set(key, inked)
        }
        blitInked(ctx, inked)
      }
    }
    paint.current(performance.now() / 1000)
  }, [size, cam, interior, room, draft, valid, burning])

  // The fire outside flickers: redraw about 30 times a second while it burns (a still frame for reduced motion).
  useEffect(() => {
    if (!burning || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let last = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      paint.current(now / 1000)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [burning])

  // Mouse wheel / trackpad pinch zooms around the pointer.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const { size, room, cam } = latest.current
      const r = canvas.getBoundingClientRect()
      const at = { x: e.clientX - r.left, y: e.clientY - r.top }
      const v = view.current
      const anchor = { x: (at.x - v.ox) / v.scale, y: (at.y - v.oy) / v.scale }
      setCam(camAround(anchor, at, clampCam(cam, size, room).zoom * Math.exp(-e.deltaY * 0.0015), size, room))
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [])

  const local = (e: { clientX: number; clientY: number }): Point => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const toWorld = (p: Point): Point => {
    const v = view.current
    return { x: (p.x - v.ox) / v.scale, y: (p.y - v.oy) / v.scale }
  }
  const toTile = (p: Point): Point => ({ x: (p.y / 16 + p.x / 32) / 2, y: (p.y / 16 - p.x / 32) / 2 })
  const camNow = () => clampCam(latest.current.cam, latest.current.size, latest.current.room)

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()]
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    gesture.current = { kind: 'pinch', dist0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), zoom0: camNow().zoom, anchor: toWorld(mid) }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    const g = gesture.current
    if (pointers.current.size >= 2) {
      // A second finger turns a furniture drag into a zoom; the piece stays where it got to.
      if (g.kind === 'piece') latest.current.onRelease?.(g.pose)
      return startPinch()
    }
    const { interior, draft, onDraft } = latest.current
    const w = toWorld(p)
    const hit = onDraft ? [...drawOrder(piecesWithDraft(interior, draft))].reverse().find((f) => insidePolygon(w, furnitureHull(f))) : undefined
    if (onDraft && hit) {
      const pose: Draft = hit.id === DRAFT_ID && draft ? draft : { pieceId: hit.id, defId: hit.defId, x: hit.x, y: hit.y, turned: !!hit.turned }
      if (pose !== draft) onDraft(pose)
      const tile = toTile(w)
      gesture.current = { kind: 'piece', pointer: e.pointerId, grab: { x: tile.x - pose.x, y: tile.y - pose.y }, pose }
      return
    }
    gesture.current = { kind: 'pan', start: p, cam0: camNow(), moved: false }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointers.current.has(e.pointerId)) return
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    const g = gesture.current
    const { size, room } = latest.current
    if (g.kind === 'piece' && g.pointer === e.pointerId) {
      const tile = toTile(toWorld(p))
      const next = clampPose(room, { ...g.pose, x: Math.round(tile.x - g.grab.x), y: Math.round(tile.y - g.grab.y) })
      if (next.x === g.pose.x && next.y === g.pose.y) return
      g.pose = next
      latest.current.onDraft?.(next)
    } else if (g.kind === 'pan') {
      const dx = p.x - g.start.x
      const dy = p.y - g.start.y
      if (!g.moved && Math.hypot(dx, dy) > TAP_SLOP) g.moved = true
      if (!g.moved) return
      const scale = fitScale(size, room) * g.cam0.zoom
      setCam(clampCam({ ...g.cam0, x: g.cam0.x - dx / scale, y: g.cam0.y - dy / scale }, size, room))
    } else if (g.kind === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      setCam(camAround(g.anchor, mid, (g.zoom0 * Math.hypot(a.x - b.x, a.y - b.y)) / g.dist0, size, room))
    }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.delete(e.pointerId)
    const g = gesture.current
    if (g.kind === 'piece' && g.pointer === e.pointerId) {
      latest.current.onRelease?.(g.pose)
    } else if (g.kind === 'pan' && !g.moved && e.type === 'pointerup') {
      // Tapping the floor while holding a piece sends it there.
      const { draft, room, onDraft, onRelease } = latest.current
      if (draft && onDraft) {
        const tile = toTile(toWorld(local(e)))
        const f = furnitureFootprint(draft)
        const next = clampPose(room, { ...draft, x: Math.floor(tile.x - f.w / 2 + 0.5), y: Math.floor(tile.y - f.h / 2 + 0.5) })
        onDraft(next)
        onRelease?.(next)
      }
    }
    if (pointers.current.size === 1) {
      // Lifting one finger of a pinch carries on as a drag.
      const [rest] = [...pointers.current.values()]
      gesture.current = { kind: 'pan', start: rest, cam0: camNow(), moved: true }
    } else if (pointers.current.size === 0) {
      gesture.current = { kind: 'none' }
    }
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        style={{ filter: 'drop-shadow(0 8px 0 rgba(107,68,35,0.2))' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-hidden
      />
    </div>
  )
}

function piecesWithDraft(interior: HomeInterior, draft: Draft | null): PlacedFurniture[] {
  const pieces = interior.furniture.filter((f) => f.id !== draft?.pieceId)
  return draft ? [...pieces, { id: DRAFT_ID, defId: draft.defId, x: draft.x, y: draft.y, turned: draft.turned }] : pieces
}

// ---------- catalog ----------

function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 shrink-0 flex-col items-center justify-center rounded-xl px-2 active:translate-y-0.5"
      style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}`, color: '#3a2a06' }}
    >
      <span className="text-sm leading-none" aria-hidden>
        {icon}
      </span>
      <span className="whitespace-nowrap text-[0.58rem] font-extrabold leading-tight">{label}</span>
    </button>
  )
}

function PageButton({ label, glyph, disabled, onClick }: { label: string; glyph: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded-full text-base font-black leading-none disabled:opacity-35"
      style={{ backgroundColor: BROWN, color: WHEAT, border: `2px solid ${INK}` }}
    >
      {glyph}
    </button>
  )
}

const CARD = 'relative flex h-full min-w-0 flex-col items-center justify-between rounded-xl px-1 py-1 transition active:translate-y-0.5 disabled:opacity-55'

/** Green tick in the corner of anything the player already has (with how many, when more than one). */
function OwnedBadge({ count }: { count?: number }) {
  return (
    <span
      className="absolute end-1 top-1 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center gap-px rounded-full px-0.5 text-[0.55rem] font-black leading-none text-white"
      style={{ backgroundColor: '#2f8a3a', border: `1.5px solid ${INK}` }}
    >
      <CheckIcon className="h-2.5 w-2.5" />
      {count != null && count > 1 && <span dir="ltr">{count}</span>}
    </span>
  )
}

function FurnitureCard({
  def,
  name,
  owned,
  locked,
  lockedLabel,
  storedLabel,
  onClick,
}: {
  def: FurnitureDef
  name: string
  owned: number
  locked: boolean
  lockedLabel: string
  storedLabel: string | null
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={CARD}
      style={{
        backgroundColor: locked ? '#e8e2d2' : owned > 0 ? OWNED_BG : '#ffffff',
        border: `2px solid ${INK}`,
        boxShadow: locked ? 'none' : `0 2px 0 ${INK}`,
      }}
    >
      {owned > 0 && <OwnedBadge count={owned} />}
      <FurniturePreview defId={def.id} />
      <FitLabel className="text-[0.6rem] font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
        {name}
      </FitLabel>
      {locked ? (
        <span className="text-[0.58rem] font-bold leading-tight" style={{ color: '#7a1d12' }}>
          {lockedLabel}
        </span>
      ) : storedLabel ? (
        <span className="text-[0.58rem] font-bold leading-tight" style={{ color: '#2e7d32' }}>
          {storedLabel}
        </span>
      ) : (
        <span className="text-[0.62rem] leading-tight" style={{ color: '#3a2a06' }}>
          <CoinAmount value={def.cost} />
        </span>
      )}
    </button>
  )
}

function StyleCard({
  style,
  name,
  owned,
  status,
  kindLabel,
  disabled,
  onClick,
}: {
  style: RoomStyleDef
  name: string
  owned: boolean
  status: { text: string; color: string } | null
  kindLabel: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={CARD}
      style={{
        backgroundColor: disabled ? '#e8e2d2' : owned ? OWNED_BG : '#ffffff',
        border: `2px solid ${INK}`,
        boxShadow: disabled ? 'none' : `0 2px 0 ${INK}`,
      }}
      aria-label={`${kindLabel}: ${name}`}
    >
      {owned && <OwnedBadge />}
      <Swatch style={style} />
      <FitLabel className="text-[0.6rem] font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
        {name}
      </FitLabel>
      {status ? (
        <span className="text-[0.58rem] font-bold leading-tight" style={{ color: status.color }}>
          {status.text}
        </span>
      ) : (
        <span className="text-[0.62rem] leading-tight" style={{ color: '#3a2a06' }}>
          <CoinAmount value={style.cost} />
        </span>
      )}
    </button>
  )
}

/** Wallpaper as an upright tile, floors as a little diamond. */
function Swatch({ style }: { style: RoomStyleDef }) {
  const [a, b] = style.colors
  const fill: Record<RoomStyleDef['pattern'], string> = {
    plain: a,
    stripes: `repeating-linear-gradient(90deg, ${a} 0 6px, ${b} 6px 10px)`,
    dots: `radial-gradient(${b} 1.8px, transparent 2.2px) 0 0 / 8px 8px, ${a}`,
    planks: `repeating-linear-gradient(0deg, ${a} 0 6px, ${b} 6px 12px)`,
    tiles: `conic-gradient(${a} 25%, ${b} 0 50%, ${a} 0 75%, ${b} 0) 0 0 / 12px 12px`,
    carpet: `radial-gradient(${b} 1.2px, transparent 1.6px) 0 0 / 6px 6px, ${a}`,
  }
  if (style.kind === 'wall') {
    return <span className="block h-9 w-8 shrink-0 rounded-md" style={{ background: fill[style.pattern], border: `2px solid ${INK}` }} aria-hidden />
  }
  return (
    <span className="flex h-9 w-10 shrink-0 items-center justify-center" aria-hidden>
      <span className="block" style={{ transform: 'scaleY(0.58)' }}>
        <span className="block h-7 w-7 rotate-45 rounded-sm" style={{ background: fill[style.pattern], border: `2px solid ${INK}` }} />
      </span>
    </span>
  )
}

/** The piece's own art, small, with the same ink outline. */
function FurniturePreview({ defId, size = 40 }: { defId: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !FURNITURE_BY_ID[defId]) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const pose = { defId, x: 0, y: 0 }
    const box = furnitureBox(pose)
    const scale = size / Math.max(box.w, box.h)
    const ox = (size - box.w * scale) / 2 - box.x * scale
    const oy = (size - box.h * scale) / 2 - box.y * scale
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy)
    const inked = renderInked(document.createElement('canvas'), dpr * scale, box, (c) => paintFurniture(c, pose), inkForSize(box.w - 12, box.h - 24))
    blitInked(ctx, inked)
  }, [defId, size])

  return <canvas ref={ref} style={{ width: size, height: size }} className="shrink-0" aria-hidden />
}

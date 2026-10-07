import { useEffect, useMemo, useRef, useState } from 'react'
import { CloseIcon } from '../../components/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { HOME_STRINGS, type HomeTab } from '../../lib/i18n/home'
import { FURNITURE, FURNITURE_BY_ID, ROOM_STYLES } from '../data/furniture'
import { drawOrder, furnitureBox, furnitureHull, paintFootprint, paintFurniture, paintRoom, roomBounds } from '../game/furnitureSprites'
import { blitInked, inkForSize, renderInked } from '../game/ink'
import { farm, getGameState, useGame } from '../store/gameStore'
import { canPlaceFurniture, type FurniturePose, furnitureFootprint, interiorOf, ownsRoomStyle, roomSize } from '../systems/HomeSystem'
import { findObject } from '../systems/result'
import type { FurnitureDef, HomeInterior, PlacedFurniture, Point, RoomStyleDef } from '../types'
import { BROWN, CoinAmount, CREAM, FitLabel, GameButton, INK, NAV_CLEARANCE, WHEAT } from './kit'

/** A piece picked up in the editor: an existing one being moved (`pieceId`), or a new one not bought yet. */
interface Draft extends FurniturePose {
  pieceId: string | null
  turned: boolean
}

type Room = { w: number; h: number }

const TABS: { id: HomeTab; icon: string }[] = [
  { id: 'living', icon: '🛋️' },
  { id: 'bedroom', icon: '🛏️' },
  { id: 'kitchen', icon: '🍳' },
  { id: 'health', icon: '💪' },
  { id: 'decor', icon: '🌿' },
  { id: 'style', icon: '🎨' },
]
const PER_PAGE = 4
const DRAFT_ID = '__draft'

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

/** Inside the player's home: a cut-away room to decorate with furniture, wallpaper and floors, Sims style. */
export function HouseSheet({ uid, onClose }: { uid: string; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = HOME_STRINGS[lang]
  const ft = FARM_STRINGS[lang]
  const obj = useGame((s) => s.objects.find((o) => o.uid === uid))
  const coins = useGame((s) => s.player.coins)
  const level = useGame((s) => s.player.level)
  const interior = useMemo(() => (obj ? interiorOf(obj) : null), [obj])
  const room = obj ? roomSize(obj) : null
  const [tab, setTab] = useState<HomeTab>('living')
  const [page, setPage] = useState(0)
  const [draft, setDraft] = useState<Draft | null>(null)

  if (!obj || !interior || !room) return null

  const valid = draft ? canPlaceFurniture(room, interior, draft, draft.pieceId ?? undefined) : true
  const items: (FurnitureDef | RoomStyleDef)[] = tab === 'style' ? ROOM_STYLES : FURNITURE.filter((f) => f.category === tab)
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE))
  const shown = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

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
    <div
      className="modal-backdrop-enter absolute inset-x-0 top-0 z-[45] flex flex-col"
      style={{ bottom: NAV_CLEARANCE, background: 'linear-gradient(180deg, #ffe3bf 0%, #fff4e0 70%)' }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:translate-y-0.5"
          style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}`, color: '#3a2a06' }}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <h2 className="text-base font-extrabold" style={{ color: '#3a2a06' }}>
          {t.title}
        </h2>
        <div
          className="flex shrink-0 items-center rounded-full px-2.5 py-1 text-sm"
          style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 2px 0 ${INK}`, color: '#3a2a06' }}
        >
          <CoinAmount value={coins} />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <RoomView
          interior={interior}
          room={room}
          draft={draft}
          valid={valid}
          onDraft={setDraft}
          onRelease={settle}
        />
        {draft && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-6">
            <span
              className="rounded-full px-3 py-1 text-center text-[0.68rem] font-extrabold"
              style={{
                backgroundColor: valid ? CREAM : '#fff1ec',
                color: valid ? '#3a2a06' : '#7a1d12',
                border: `2px solid ${INK}`,
              }}
            >
              {valid ? t.movingHint : t.noRoom}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-h-12 shrink-0 items-center justify-center gap-2 px-3 py-1">
        {draft ? (
          <>
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
          </>
        ) : (
          <p className="text-center text-[0.68rem] font-bold leading-snug" style={{ color: '#52514e' }}>
            {t.hint}
          </p>
        )}
      </div>

      <div
        className="mx-3 mb-3 flex shrink-0 flex-col gap-1.5 rounded-2xl p-2"
        style={{ backgroundColor: CREAM, border: `3px solid ${INK}`, boxShadow: '0 4px 0 #c9a463' }}
      >
        <div className="flex justify-between gap-1">
          {TABS.map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id)
                setPage(0)
              }}
              aria-label={t.tabs[id]}
              aria-pressed={tab === id}
              className="flex h-9 flex-1 items-center justify-center rounded-full text-lg leading-none"
              style={{ backgroundColor: tab === id ? BROWN : '#ffffff', border: `2px solid ${INK}` }}
            >
              <span aria-hidden>{icon}</span>
            </button>
          ))}
        </div>

        <div className="flex min-h-6 items-center justify-between gap-2 px-0.5">
          <span className="text-xs font-extrabold" style={{ color: '#3a2a06' }}>
            {t.tabs[tab]}
          </span>
          {pages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* ‹ › are mirrored by the browser in right-to-left text, so they always point the right way. */}
              <PageButton label={t.prevPage} glyph="‹" disabled={page === 0} onClick={() => setPage(page - 1)} />
              <span className="text-[0.62rem] font-extrabold tabular-nums" style={{ color: '#52514e' }} dir="ltr">
                {page + 1}/{pages}
              </span>
              <PageButton label={t.nextPage} glyph="›" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {shown.map((item) =>
            'kind' in item ? (
              <StyleCard
                key={item.id}
                style={item}
                name={item.name[lang]}
                status={
                  interior[item.kind] === item.id
                    ? { text: t.inUse, color: '#2e7d32' }
                    : level < item.requiredLevel
                      ? { text: `${ft.levelShort(item.requiredLevel)} 🔒`, color: '#7a1d12' }
                      : ownsRoomStyle(interior, item.id)
                        ? { text: t.owned, color: '#52514e' }
                        : null
                }
                kindLabel={item.kind === 'wall' ? t.wall : t.floor}
                disabled={level < item.requiredLevel}
                onClick={() => farm.roomStyle(uid, item.id)}
              />
            ) : (
              <FurnitureCard
                key={item.id}
                def={item}
                name={item.name[lang]}
                locked={level < item.requiredLevel}
                lockedLabel={`${ft.levelShort(item.requiredLevel)} 🔒`}
                storedLabel={interior.stored[item.id] > 0 ? t.inStorage(interior.stored[item.id]) : null}
                selected={draft?.pieceId === null && draft.defId === item.id}
                onClick={() => pickNew(item)}
              />
            ),
          )}
          {Array.from({ length: PER_PAGE - shown.length }, (_, i) => (
            <span key={`pad${i}`} aria-hidden />
          ))}
        </div>
      </div>
    </div>
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

function RoomView({
  interior,
  room,
  draft,
  valid,
  onDraft,
  onRelease,
}: {
  interior: HomeInterior
  room: Room
  draft: Draft | null
  valid: boolean
  onDraft: (d: Draft) => void
  onRelease: (d: Draft) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const view = useRef({ scale: 1, ox: 0, oy: 0 })
  const cache = useRef(new Map<string, ReturnType<typeof renderInked>>())
  const drag = useRef<{ pointer: number; grab: Point; pose: Draft } | null>(null)
  const latest = useRef({ interior, room, draft, onDraft, onRelease })
  latest.current = { interior, room, draft, onDraft, onRelease }

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
    const b = roomBounds(room.w, room.h)
    const scale = Math.min(size.w / (b.maxX - b.minX), size.h / (b.maxY - b.minY))
    const ox = (size.w - (b.maxX - b.minX) * scale) / 2 - b.minX * scale
    const oy = (size.h - (b.maxY - b.minY) * scale) / 2 - b.minY * scale
    view.current = { scale, ox, oy }

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy)
    paintRoom(ctx, room.w, room.h, interior.wall, interior.floor)
    if (draft) paintFootprint(ctx, furnitureFootprint(draft), valid ? 'rgba(122,199,79,0.5)' : 'rgba(240,100,90,0.55)')

    const px = dpr * scale
    if (cache.current.size > 160) cache.current.clear()
    for (const p of drawOrder(piecesWithDraft(interior, draft))) {
      const key = `${p.defId}|${p.x}|${p.y}|${p.turned ? 1 : 0}|${px.toFixed(4)}`
      let inked = cache.current.get(key)
      if (!inked) {
        const box = furnitureBox(p)
        inked = renderInked(document.createElement('canvas'), px, box, (c) => paintFurniture(c, p), inkForSize(box.w - 12, box.h - 24))
        cache.current.set(key, inked)
      }
      blitInked(ctx, inked)
    }
  }, [size, interior, room, draft, valid])

  const toWorld = (e: React.PointerEvent): Point => {
    const r = canvasRef.current!.getBoundingClientRect()
    const v = view.current
    return { x: (e.clientX - r.left - v.ox) / v.scale, y: (e.clientY - r.top - v.oy) / v.scale }
  }
  const toTile = (p: Point): Point => ({ x: (p.y / 16 + p.x / 32) / 2, y: (p.y / 16 - p.x / 32) / 2 })

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { interior, room, draft, onDraft } = latest.current
    const w = toWorld(e)
    const tile = toTile(w)
    const hit = [...drawOrder(piecesWithDraft(interior, draft))].reverse().find((p) => insidePolygon(w, furnitureHull(p)))
    let pose: Draft | null = null
    if (hit && hit.id === DRAFT_ID) pose = draft
    else if (hit) pose = { pieceId: hit.id, defId: hit.defId, x: hit.x, y: hit.y, turned: !!hit.turned }
    else if (draft) {
      const f = furnitureFootprint(draft)
      pose = clampPose(room, { ...draft, x: Math.floor(tile.x - f.w / 2 + 0.5), y: Math.floor(tile.y - f.h / 2 + 0.5) })
    }
    if (!pose) return
    if (pose !== draft) onDraft(pose)
    drag.current = { pointer: e.pointerId, grab: { x: tile.x - pose.x, y: tile.y - pose.y }, pose }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current
    if (!d || d.pointer !== e.pointerId) return
    const tile = toTile(toWorld(e))
    const next = clampPose(latest.current.room, { ...d.pose, x: Math.round(tile.x - d.grab.x), y: Math.round(tile.y - d.grab.y) })
    if (next.x === d.pose.x && next.y === d.pose.y) return
    d.pose = next
    latest.current.onDraft(next)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current
    if (!d || d.pointer !== e.pointerId) return
    drag.current = null
    latest.current.onRelease(d.pose)
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
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

const CARD = 'flex h-[5.9rem] min-w-0 flex-col items-center justify-between rounded-xl px-1 py-1 transition active:translate-y-0.5 disabled:opacity-55'

function FurnitureCard({
  def,
  name,
  locked,
  lockedLabel,
  storedLabel,
  selected,
  onClick,
}: {
  def: FurnitureDef
  name: string
  locked: boolean
  lockedLabel: string
  storedLabel: string | null
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={CARD}
      style={{
        backgroundColor: locked ? '#e8e2d2' : '#ffffff',
        border: `2px solid ${INK}`,
        boxShadow: selected ? '0 0 0 3px #ffcf4a' : locked ? 'none' : `0 2px 0 ${INK}`,
      }}
    >
      <FurniturePreview defId={def.id} />
      <FitLabel className="text-[0.58rem] font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
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
  status,
  kindLabel,
  disabled,
  onClick,
}: {
  style: RoomStyleDef
  name: string
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
      style={{ backgroundColor: disabled ? '#e8e2d2' : '#ffffff', border: `2px solid ${INK}`, boxShadow: disabled ? 'none' : `0 2px 0 ${INK}` }}
      aria-label={`${kindLabel}: ${name}`}
    >
      <Swatch style={style} />
      <FitLabel className="text-[0.58rem] font-extrabold leading-tight" style={{ color: '#3a2a06' }}>
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

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FARM_STRINGS } from '../../lib/i18n/farmPanel'
import { AREAS_BY_ID } from '../data/areas'
import { FRIENDS_BY_AREA } from '../data/friends'
import { CROPS_BY_ID } from '../data/crops'
import { OBJECTS_BY_ID } from '../data/objects'
import { useNow } from '../hooks/useNow'
import { farm, useGame } from '../store/gameStore'
import { isBuilt, isMovable, isRemovable, nextUpgrade, objectLevel } from '../systems/BuildingSystem'
import { cropProgress, needsWater } from '../systems/CropSystem'
import { gateHp, gateStats, repairCost } from '../systems/DefenseSystem'
import { canUnlockArea } from '../systems/MapSystem'
import type { Point } from '../types'
import { formatDuration } from '../utils/format'
import type { FarmSheet } from './BottomMenu'
import { CoinAmount, CREAM, GameButton, INK, ProgressBar } from './kit'
import { SpritePreview } from './SpritePreview'

export type Selection = { kind: 'object'; uid: string; at: Point } | { kind: 'area'; areaId: string; at: Point }

interface Props {
  selection: Selection
  onMove: (uid: string) => void
  onRemove: (uid: string) => void
  onOpen: (sheet: FarmSheet | 'production' | 'house', uid?: string) => void
  onUnlock: (areaId: string) => void
}

const GAP = 14
const EDGE = 8
const TOP_SAFE = 56

/** Small popup anchored to the tapped spot. */
export function ContextMenu(props: Props) {
  const { selection } = props
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean } | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.offsetParent as HTMLElement | null
    if (!el || !parent) return
    const w = el.offsetWidth
    const h = el.offsetHeight
    const { x, y } = selection.at
    const below = y - GAP - h < TOP_SAFE
    setPos({
      left: Math.min(parent.clientWidth - w - EDGE, Math.max(EDGE, x - w / 2)),
      top: below ? Math.min(parent.clientHeight - h - EDGE, y + GAP) : y - GAP - h,
      below,
    })
  }, [selection])

  return (
    <div
      ref={ref}
      className="farm-pop absolute z-30 w-max max-w-[15rem] rounded-2xl p-2"
      style={{
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        visibility: pos ? 'visible' : 'hidden',
        backgroundColor: CREAM,
        border: `2px solid ${INK}`,
        boxShadow: `0 3px 0 ${INK}`,
        transformOrigin: pos?.below ? 'top center' : 'bottom center',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {selection.kind === 'area' ? <AreaMenu areaId={selection.areaId} onUnlock={props.onUnlock} /> : <ObjectMenu {...props} uid={selection.uid} />}
    </div>
  )
}

function Title({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-1 px-1 text-center text-xs font-extrabold" style={{ color: '#3a2a06' }}>
      <span>{children}</span>
      {icon && <span aria-hidden>{icon}</span>}
    </div>
  )
}

function ObjectMenu({ uid, onMove, onRemove, onOpen }: Props & { uid: string }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const state = useGame((s) => s)
  const now = useNow(250)
  const obj = state.objects.find((o) => o.uid === uid)
  if (!obj) return null
  const def = OBJECTS_BY_ID[obj.defId]
  const name = def.name[lang]

  if (!isBuilt(obj, now)) {
    const total = def.buildTime * 1000
    return (
      <div className="flex w-40 flex-col gap-1.5">
        <Title icon={<SpritePreview defId={def.id} size={26} />}>{name}</Title>
        <ProgressBar fraction={total > 0 ? 1 - (obj.builtAt - now) / total : 1} color="#ffcf4a" />
        <p className="text-center text-[0.65rem] font-bold tabular-nums" style={{ color: '#52514e' }}>
          {t.building(formatDuration(obj.builtAt - now))}
        </p>
        <div className="flex justify-center gap-1.5">
          {isMovable(def) && (
            <GameButton color="cream" onClick={() => onMove(uid)}>
              {t.move}
            </GameButton>
          )}
          {isRemovable(def) && <RemoveButton key={uid} onRemove={() => onRemove(uid)} />}
        </div>
      </div>
    )
  }

  if (def.kind === 'field' && obj.crop) {
    const crop = CROPS_BY_ID[obj.crop.cropId]
    return (
      <div className="flex w-40 flex-col gap-1.5">
        <Title icon={crop.icon}>{crop.name[lang]}</Title>
        <ProgressBar fraction={cropProgress(obj.crop, now)} />
        <p className="text-center text-[0.65rem] font-bold tabular-nums" style={{ color: '#52514e' }}>
          {now >= obj.crop.readyAt ? t.ready : t.readyIn(formatDuration(obj.crop.readyAt - now))}
        </p>
        {now < obj.crop.readyAt && (
          <p className="text-center text-[0.6rem] font-bold" style={{ color: needsWater(obj.crop, now) ? '#b0631f' : '#2b7fae' }}>
            {needsWater(obj.crop, now) ? t.thirsty : t.watered}
          </p>
        )}
        <div className="flex justify-center gap-1.5">
          <GameButton color="cream" onClick={() => onMove(uid)}>
            {t.move}
          </GameButton>
          {isRemovable(def) && <RemoveButton key={uid} onRemove={() => onRemove(uid)} />}
        </div>
      </div>
    )
  }

  if (def.kind === 'gate') return <GateMenu uid={uid} />

  const primary =
    def.kind === 'production'
      ? { label: t.produce, run: () => onOpen('production', uid) }
      : def.kind === 'home'
        ? { label: t.enterHouse, run: () => onOpen('house', uid) }
        : null

  return (
    <div className="flex min-w-36 flex-col gap-1.5">
      <Title icon={<SpritePreview defId={def.id} size={26} />}>{name}</Title>
      <div className="flex justify-center gap-1.5">
        {primary && <GameButton onClick={primary.run}>{primary.label}</GameButton>}
        {isMovable(def) && (
          <GameButton color="cream" onClick={() => onMove(uid)}>
            {t.move}
          </GameButton>
        )}
        {isRemovable(def) && <RemoveButton key={uid} onRemove={() => onRemove(uid)} />}
      </div>
    </div>
  )
}

/** Asks for a second tap before removing — there's no undo or refund. */
function RemoveButton({ onRemove }: { onRemove: () => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const [confirming, setConfirming] = useState(false)
  return (
    <GameButton color="red" onClick={() => (confirming ? onRemove() : setConfirming(true))}>
      {confirming ? t.removeConfirm : t.remove}
    </GameButton>
  )
}

/** The city gate: its health, defense and level, with Upgrade and Repair. */
function GateMenu({ uid }: { uid: string }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const state = useGame((s) => s)
  const now = useNow(500)
  const gate = state.objects.find((o) => o.uid === uid)
  if (!gate) return null
  const def = OBJECTS_BY_ID[gate.defId]
  const stats = gateStats(gate)
  const hp = gateHp(gate, now)
  const step = nextUpgrade(def, gate)
  const repair = repairCost(gate, now)
  const levelOk = !step || state.player.level >= step.requiredLevel
  return (
    <div className="flex w-48 flex-col gap-1.5">
      <Title icon={<SpritePreview defId={def.id} size={28} level={objectLevel(gate)} />}>
        {def.name[lang]} · {t.levelShort(objectLevel(gate))}
      </Title>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between text-[0.62rem] font-extrabold" style={{ color: '#3a2a06' }}>
          <span>{t.gateHealth}</span>
          <span className="tabular-nums" dir="ltr">
            {Math.floor(hp)}/{stats.maxHp}
          </span>
        </div>
        <ProgressBar fraction={hp / stats.maxHp} color={hp / stats.maxHp > 0.6 ? '#7ad151' : hp / stats.maxHp > 0.3 ? '#ffcf4a' : '#f0645a'} height={8} />
      </div>
      <div className="flex justify-between text-[0.6rem] font-bold" style={{ color: '#52514e' }}>
        <span>{t.defense(stats.defense)}</span>
        <span>{t.germsStopped(state.stats.germsStopped ?? 0)}</span>
      </div>
      {hp < 1 && (
        <p className="text-center text-[0.62rem] font-extrabold" style={{ color: '#b3261e' }}>
          {t.gateBroken}
        </p>
      )}
      <div className="flex justify-center gap-1.5">
        {step ? (
          <GameButton onClick={() => farm.upgrade(uid)} disabled={!levelOk}>
            {t.upgrade}
            {levelOk ? <CoinAmount value={step.cost} /> : <span>· {t.levelShort(step.requiredLevel)}</span>}
          </GameButton>
        ) : (
          <span className="self-center text-[0.62rem] font-extrabold" style={{ color: '#2e7d32' }}>
            {t.maxLevel} ⭐
          </span>
        )}
        {repair > 0 && (
          <GameButton color="amber" onClick={() => farm.repairGate()}>
            {t.repair}
            <CoinAmount value={repair} />
          </GameButton>
        )}
      </div>
    </div>
  )
}

function AreaMenu({ areaId, onUnlock }: { areaId: string; onUnlock: (areaId: string) => void }) {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const state = useGame((s) => s)
  const area = AREAS_BY_ID[areaId]
  if (!area) return null
  const friend = FRIENDS_BY_AREA[areaId]
  const levelOk = state.player.level >= area.requiredLevel
  const coinsOk = state.player.coins >= area.cost
  return (
    <div className="flex min-w-40 flex-col items-center gap-1.5">
      <Title icon="🔒">{area.name[lang]}</Title>
      <p className="text-[0.65rem] font-bold" style={{ color: '#52514e' }}>
        {t.lockedLand}
      </p>
      {friend && (
        <p className="max-w-44 text-center text-[0.65rem] font-extrabold" style={{ color: '#b04a2a' }}>
          {t.friendCaged(friend.name[lang])}
        </p>
      )}
      <div className="flex items-center gap-2 text-xs font-extrabold">
        <span style={{ color: levelOk ? '#2e7d32' : '#b3261e' }}>⭐ {t.levelShort(area.requiredLevel)}</span>
        <CoinAmount value={area.cost} className={coinsOk ? 'text-green-800' : 'text-red-700'} />
      </div>
      <GameButton disabled={!canUnlockArea(state, area)} onClick={() => onUnlock(areaId)}>
        {t.unlock}
      </GameButton>
    </div>
  )
}

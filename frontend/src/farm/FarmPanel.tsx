import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { WardrobeModal } from '../avatar/WardrobeModal'
import { useLanguage } from '../contexts/LanguageContext'
import { FARM_STRINGS } from '../lib/i18n/farmPanel'
import { CROPS_BY_ID } from './data/crops'
import { FOOD_GUARD_SPOTS } from './data/foodGuards'
import { FRIENDS_BY_AREA } from './data/friends'
import { GUARD } from './data/guards'
import { OBJECTS_BY_ID } from './data/objects'
import { type CanvasController, FarmCanvas, type TapInfo } from './game/FarmCanvas'
import type { NeighborIsland } from './game/neighbors'
import { useNeighbors } from './hooks/useNeighbors'
import { useWeekFoodGuards } from './hooks/useWeekFoodGuards'
import type { SceneUi } from './game/renderer'
import { type CityCard, type VisitedCity, cityCode, claimGuards, fetchCity, sendGuard, startCitySync } from './online/cityCloud'
import { farm, flushSave, getGameState, onFx, useGame } from './store/gameStore'
import { buyBlocker, isBuilt, priceOf } from './systems/BuildingSystem'
import { addGuards } from './systems/GuardSystem'
import { isCropReady } from './systems/CropSystem'
import { areaAt, canPlace, findFreeSpot, worldAt } from './systems/MapSystem'
import { readyJobCount } from './systems/ProductionSystem'
import { BottomMenu, type FarmSheet } from './ui/BottomMenu'
import { CalendarSheet } from './ui/CalendarSheet'
import { CoinsSheet } from './ui/CoinsSheet'
import { ContextMenu, type Selection } from './ui/ContextMenu'
import { type FoodGuardNote, FoodGuardToast } from './ui/FoodGuardToast'
import { FxLayer } from './ui/FxLayer'
import { GermFoundToast } from './ui/GermFoundToast'
import { GermLibrarySheet } from './ui/GermLibrarySheet'
import { HouseSheet, VisitHouseSheet } from './ui/HouseSheet'
import { CoinAmount, GameButton } from './ui/kit'
import { LevelUpModal } from './ui/LevelUpModal'
import { ModeBar, RoundAction } from './ui/ModeBar'
import { ProductionSheet } from './ui/ProductionSheet'
import { ShopSheet } from './ui/ShopSheet'
import { TopBar } from './ui/TopBar'
import { type Notice, NoticePill, VisitBar } from './ui/VisitBar'
import './farm.css'

type Placing = NonNullable<SceneUi['placing']>

/** How often to check for guards other players sent. */
const GUARD_CHECK_MS = 90_000
let noticeId = 1

export function FarmPanel() {
  const { lang } = useLanguage()
  const t = FARM_STRINGS[lang]
  const controllerRef = useRef<CanvasController | null>(null)
  const state = useGame((s) => s)

  const [selection, setSelection] = useState<Selection | null>(null)
  const [sheet, setSheet] = useState<FarmSheet | null>(null)
  const [productionUid, setProductionUid] = useState<string | null>(null)
  const [houseUid, setHouseUid] = useState<string | null>(null)
  const [placing, setPlacing] = useState<Placing | null>(null)
  const [plantingCropId, setPlantingCropId] = useState<string | null>(null)
  const [levelUp, setLevelUp] = useState<{ from: number; to: number } | null>(null)
  /** Germ the library opens on (the one just met, when opened from its toast). */
  const [libraryGerm, setLibraryGerm] = useState<string | null>(null)
  /** Someone else's city on screen (read-only), and whether this player already sent it a guard today. */
  const [visit, setVisit] = useState<(VisitedCity & { sent: boolean }) | null>(null)
  const [sending, setSending] = useState(false)
  /** The visited player's home, while looking around inside it. */
  const [visitHouseUid, setVisitHouseUid] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  /** Food guards from this week's meals, and the note about them on screen (new arrivals, or the one just tapped). */
  const foodGuards = useWeekFoodGuards()
  const [guardNote, setGuardNote] = useState<FoodGuardNote | null>(null)
  /** Other players' cities, as islands past the shore: pan to the edge of the map and tap one to visit. */
  const { neighbors, markHelped } = useNeighbors()
  const tRef = useRef(t)
  useLayoutEffect(() => {
    tRef.current = t
  })

  const say = (text: string, tone: Notice['tone'], sticky?: boolean) => setNotice({ id: noticeId++, text, tone, sticky })
  const cityName = (c: { name: string | null; userId: string }) => c.name ?? t.cityNumber(cityCode(c.userId))

  // Online: keep this city published for visitors, and pick up guards others sent.
  useEffect(() => startCitySync(), [])
  useEffect(() => {
    const check = () =>
      claimGuards().then((gifts) =>
        farm.receiveGuards(gifts.map((g) => ({ id: g.id, from: g.fromName ?? tRef.current.cityNumber(cityCode(g.fromUser)) }))),
      )
    void check()
    const timer = window.setInterval(check, GUARD_CHECK_MS)
    const off = onFx((e) => {
      if (e.type === 'guardsArrived') say(tRef.current.guardsArrived(e.from), 'good')
    })
    return () => {
      window.clearInterval(timer)
      off()
    }
  }, [])
  useEffect(() => {
    if (!notice || notice.sticky) return
    const timer = setTimeout(() => setNotice(null), 3600)
    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const first = foodGuards?.guards.find((g) => g.id === foodGuards.arrivals[0])
    if (first) setGuardNote({ key: Date.now(), kind: 'arrived', guard: first, count: foodGuards!.arrivals.length })
  }, [foodGuards])

  useEffect(
    () =>
      onFx((e) => {
        if (e.type === 'levelUp') setLevelUp((prev) => ({ from: prev?.from ?? e.from, to: e.to }))
      }),
    [],
  )

  // Saves are debounced; make sure the latest state lands before the app goes to the background.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushSave()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flushSave)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flushSave)
      flushSave()
    }
  }, [])

  const islands = useMemo<NeighborIsland[] | undefined>(
    () =>
      neighbors?.map((n) => ({
        userId: n.userId,
        title: n.name ?? t.cityNumber(cityCode(n.userId)),
        subtitle: n.helped ? `${t.helpedToday} 💂` : t.levelShort(n.level),
        level: n.level,
        helped: n.helped,
      })),
    [neighbors, t],
  )

  const ui = useMemo<SceneUi>(
    () => ({ selectedUid: selection?.kind === 'object' ? selection.uid : null, placing, plantingCropId }),
    [selection, placing, plantingCropId],
  )

  const resetModes = () => {
    setSelection(null)
    setSheet(null)
    setProductionUid(null)
    setHouseUid(null)
    setVisitHouseUid(null)
    setPlantingCropId(null)
  }

  const startPlacing = (defId: string, uid?: string) => {
    const current = getGameState()
    const def = OBJECTS_BY_ID[defId]
    const moving = uid ? current.objects.find((o) => o.uid === uid) : undefined
    const center = controllerRef.current?.centerTile() ?? { x: 6, y: 6 }
    const spot = moving
      ? { x: moving.x, y: moving.y }
      : findFreeSpot(current, defId, center.x - Math.floor((def.width - 1) / 2), center.y - Math.floor((def.height - 1) / 2))
    resetModes()
    if (!spot) return farm.notify('blocked')
    setPlacing({ defId, x: spot.x, y: spot.y, uid })
  }

  const confirmPlacing = () => {
    if (!placing) return
    const done = placing.uid ? farm.move(placing.uid, placing.x, placing.y) : farm.buy(placing.defId, placing.x, placing.y)
    if (!done) return
    const def = OBJECTS_BY_ID[placing.defId]
    const after = getGameState()
    // Fields are usually bought in batches — keep the ghost going at the next free spot.
    const next = !placing.uid && def.kind === 'field' && !buyBlocker(after, def) ? findFreeSpot(after, def.id, placing.x + 1, placing.y) : null
    setPlacing(next ? { ...placing, ...next } : null)
  }

  const handleTap = ({ tile, obj, screen, client }: TapInfo) => {
    const now = Date.now()

    // Someone else's city is look-only — except their home, which visitors can step into.
    if (visit) {
      if (obj && OBJECTS_BY_ID[obj.defId].kind === 'home') setVisitHouseUid(obj.uid)
      return
    }

    if (placing) {
      const def = OBJECTS_BY_ID[placing.defId]
      setPlacing({ ...placing, x: tile.x - Math.floor((def.width - 1) / 2), y: tile.y - Math.floor((def.height - 1) / 2) })
      return
    }

    const field = obj && OBJECTS_BY_ID[obj.defId].kind === 'field' && isBuilt(obj, now) ? obj : null

    if (plantingCropId) {
      if (field && !field.crop) farm.plant(field.uid, plantingCropId)
      else if (field?.crop && isCropReady(field.crop, now)) farm.harvest(field.uid, client)
      else if (!field) setPlantingCropId(null)
      return
    }

    if (!obj) {
      const area = areaAt(tile.x, tile.y) ?? worldAt(tile.x, tile.y)
      setSelection(area && !state.unlockedAreas.includes(area.id) ? { kind: 'area', areaId: area.id, at: screen } : null)
      return
    }

    if (OBJECTS_BY_ID[obj.defId].kind === 'calendarBoard') {
      resetModes()
      setSheet('calendar')
      return
    }
    if (field?.crop && isCropReady(field.crop, now)) {
      setSelection(null)
      farm.harvest(field.uid, client)
      return
    }
    if (OBJECTS_BY_ID[obj.defId].kind === 'production' && isBuilt(obj, now) && readyJobCount(obj, now) > 0) {
      setSelection(null)
      farm.collect(obj.uid, client)
      return
    }
    setSelection(selection?.kind === 'object' && selection.uid === obj.uid ? null : { kind: 'object', uid: obj.uid, at: screen })
  }

  const openCity = async (card: CityCard, helped: boolean) => {
    resetModes()
    setPlacing(null)
    say(t.openingCity, 'info', true)
    const city = await fetchCity(card.userId)
    if (!city) return say(t.cityFailed, 'bad')
    setNotice(null)
    setVisit({ ...city, sent: helped })
  }

  const sendGuardToVisit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!visit || sending) return
    const at = { x: e.clientX, y: e.clientY }
    const target = visit.userId
    setSending(true)
    const result = await sendGuard(target)
    setSending(false)
    const markSent = (withGuard: boolean) => {
      markHelped(target)
      setVisit((v) =>
        v?.userId === target ? { ...v, sent: true, state: withGuard ? addGuards(v.state, [{ id: 'sent', from: '' }], Date.now()) : v.state } : v,
      )
    }
    if (result === 'sent') {
      farm.guardSent(at)
      say(t.guardOnTheWay(cityName(visit)), 'good')
      // The guard shows up at their gate right away; the owner gets it the next time their game checks.
      markSent(true)
    } else if (result === 'already') {
      markSent(false)
    } else {
      say(result === 'limit' ? t.guardLimit(GUARD.sendsPerDay) : t.offline, 'bad')
    }
  }

  const placingDef = placing ? OBJECTS_BY_ID[placing.defId] : null
  const placingValid = placing ? canPlace(state, placing.defId, placing.x, placing.y, placing.uid) : false
  const plantingCrop = plantingCropId ? CROPS_BY_ID[plantingCropId] : null
  const visitHome = visit?.state.objects.find((o) => OBJECTS_BY_ID[o.defId].kind === 'home')
  const visitHouse = visitHouseUid ? visit?.state.objects.find((o) => o.uid === visitHouseUid) : undefined

  return (
    <div className="relative h-full w-full select-none overflow-hidden" style={{ backgroundColor: '#86d3e6' }}>
      <FarmCanvas
        key={visit?.userId ?? 'home'}
        world={visit?.state}
        look={visit?.look}
        ui={ui}
        controllerRef={controllerRef}
        onTap={handleTap}
        onPanStart={() => setSelection(null)}
        onObjectHold={(obj) => startPlacing(obj.defId, obj.uid)}
        onGhostMove={(x, y) => setPlacing((p) => (p ? { ...p, x, y } : p))}
        onAvatarTap={() => {
          resetModes()
          setSheet('wardrobe')
        }}
        onGermSignTap={() => {
          resetModes()
          setLibraryGerm(null)
          setSheet('germs')
        }}
        foodGuards={visit ? null : foodGuards}
        onFoodGuardTap={(id) => {
          const guard = foodGuards?.guards.find((g) => g.id === id)
          if (guard) setGuardNote({ key: Date.now(), kind: 'info', guard })
        }}
        neighbors={islands}
        onNeighborTap={(userId) => {
          const city = neighbors?.find((n) => n.userId === userId)
          if (city) void openCity(city, city.helped)
        }}
        onFriendFreed={(areaId) => {
          const friend = FRIENDS_BY_AREA[areaId]
          if (friend) say(tRef.current.friendFreed(friend.name[lang]), 'good')
        }}
        onFriendTap={(areaId) => {
          const friend = FRIENDS_BY_AREA[areaId]
          if (friend) say(tRef.current.friendHello(friend.name[lang]), 'info')
        }}
      />

      <TopBar
        onCoins={() => {
          resetModes()
          setPlacing(null)
          setSheet('coins')
        }}
      />

      {visit ? (
        <VisitBar
          name={cityName(visit)}
          level={visit.level}
          sent={visit.sent}
          busy={sending}
          onSend={(e) => void sendGuardToVisit(e)}
          onHouse={visitHome ? () => setVisitHouseUid(visitHome.uid) : undefined}
          onHome={() => {
            setVisitHouseUid(null)
            setVisit(null)
          }}
        />
      ) : placing && placingDef ? (
        <ModeBar>
          <RoundAction kind="cancel" label={t.cancel} onClick={() => setPlacing(null)} />
          <div className="flex min-w-0 flex-1 flex-col items-center text-center">
            <span className="flex items-center gap-1 text-xs font-extrabold" style={{ color: '#3a2a06' }}>
              <span className="break-words">{placingDef.name[lang]}</span>
              {!placing.uid && <CoinAmount value={priceOf(state, placingDef)} />}
            </span>
            <span className="text-[0.6rem] font-bold" style={{ color: '#52514e' }}>
              {t.placingHint}
            </span>
          </div>
          <RoundAction kind="ok" label={t.place} disabled={!placingValid} onClick={confirmPlacing} />
        </ModeBar>
      ) : plantingCrop ? (
        <ModeBar>
          <span className="ps-1 text-2xl" aria-hidden>
            {plantingCrop.icon}
          </span>
          <span className="min-w-0 flex-1 text-xs font-bold leading-snug" style={{ color: '#3a2a06' }}>
            {t.plantingHint(plantingCrop.name[lang])}
          </span>
          <GameButton onClick={() => setPlantingCropId(null)} className="py-2">
            {t.done}
          </GameButton>
        </ModeBar>
      ) : (
        <BottomMenu
          onOpen={(next) => {
            setSelection(null)
            setLibraryGerm(null)
            setSheet(next)
          }}
        />
      )}

      {selection && !visit && (
        <ContextMenu
          selection={selection}
          onMove={(uid) => {
            const obj = getGameState().objects.find((o) => o.uid === uid)
            if (obj) startPlacing(obj.defId, uid)
          }}
          onRemove={(uid) => {
            if (farm.remove(uid)) setSelection(null)
          }}
          onOpen={(next, uid) => {
            setSelection(null)
            if (next === 'production') setProductionUid(uid ?? null)
            else if (next === 'house') setHouseUid(uid ?? null)
            else setSheet(next)
          }}
          onUnlock={(areaId) => {
            if (farm.unlockArea(areaId)) setSelection(null)
          }}
        />
      )}

      {sheet === 'shop' && (
        <ShopSheet
          onClose={() => setSheet(null)}
          onBuy={(defId) => startPlacing(defId)}
        />
      )}
      {sheet === 'coins' && <CoinsSheet onClose={() => setSheet(null)} />}
      {sheet === 'wardrobe' && <WardrobeModal onClose={() => setSheet(null)} />}
      {sheet === 'calendar' && <CalendarSheet onClose={() => setSheet(null)} />}
      {sheet === 'germs' && <GermLibrarySheet initialId={libraryGerm} onClose={() => setSheet(null)} />}
      {productionUid && <ProductionSheet uid={productionUid} onClose={() => setProductionUid(null)} />}
      {houseUid && <HouseSheet uid={houseUid} onClose={() => setHouseUid(null)} />}
      {visit && visitHouse && <VisitHouseSheet home={visitHouse} city={visit.state} name={cityName(visit)} onClose={() => setVisitHouseUid(null)} />}

      {guardNote && !sheet && !placing && !visit && (
        <FoodGuardToast
          note={guardNote}
          onOpen={() => {
            // A new guard: glide over to where it stands.
            const i = guardNote.kind === 'arrived' ? (foodGuards?.guards.indexOf(guardNote.guard) ?? -1) : -1
            const spot = FOOD_GUARD_SPOTS[i]
            if (spot) controllerRef.current?.focusTile(spot.x, spot.y)
            setGuardNote(null)
          }}
          onDone={() => setGuardNote(null)}
        />
      )}

      {!sheet && !placing && !visit && !guardNote && (
        <GermFoundToast
          onOpen={(germId) => {
            resetModes()
            setLibraryGerm(germId)
            setSheet('germs')
          }}
        />
      )}

      <FxLayer quietBackground={!!houseUid || !!visitHouse} />
      {notice && <NoticePill key={notice.id} notice={notice} />}

      {levelUp && <LevelUpModal from={levelUp.from} to={levelUp.to} onClose={() => setLevelUp(null)} />}
    </div>
  )
}

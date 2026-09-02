import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { MealEntry, NutrientAmounts, NutrientId } from '../types'
import { analyzeFoodImage, analyzeFoodText, AnalyzeError, type AnalyzeResult, type FoodIdentification } from '../lib/api'
import { addMeal } from '../lib/db'
import { todayKey } from '../lib/date'
import { NutrientBar } from './NutrientBar'
import { NutrientFillBar } from './NutrientFillBar'
import { NutrientDetailModal } from './NutrientDetailModal'
import { ConfettiBurst } from './ConfettiBurst'
import { CustomNutritionForm } from './CustomNutritionForm'
import { EMPTY_NUTRIENTS, getVisibleNutrients, hasRespectableAmount, percentOfMealTarget } from '../lib/nutrients'
import { EMPTY_MACROS, isMacroTrackingEnabled } from '../lib/macros'
import { MacroSummaryRow } from './MacroSummaryRow'
import { searchFoodNames } from '../lib/foodSuggestions'
import { MANUAL_ENTRY_PHOTO, isManualEntryPhoto } from '../lib/mealPhoto'
import {
  findCustomFood,
  searchCustomFoods,
  saveCustomFood,
  scaleCustomFood,
  onCustomFoodsChange,
} from '../lib/customFoods'
import {
  detectFood,
  foodEmoji,
  getDetectorStatus,
  onDetectorStatusChange,
  preloadFoodDetector,
  type DetectorStatus,
  type FoodDetection,
} from '../lib/foodDetector'
import { decodeBarcodeFromFrame, lookupProductByBarcode } from '../lib/barcode'
import { useLanguage } from '../contexts/LanguageContext'
import { CAMERA_PANEL_STRINGS, type CameraPanelStrings } from '../lib/i18n/cameraPanel'

type Stage = 'camera' | 'identifying' | 'confirm' | 'quantity' | 'manual' | 'custom' | 'analyzing' | 'result'

const MAX_DIMENSION = 900
const JPEG_QUALITY = 0.82
const DETECTION_INTERVAL_MS = 400

function devLog(tag: string, message: string) {
  if (import.meta.env.DEV) console.log(`[${tag}] ${message}`)
}

function capitalize(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// GPT already interprets free-text quantities in the existing nutrition lookup, so no special
// parsing is needed on our end for either of these.
const ONE_WHOLE = '1 whole'
const HALF = 'half'

/** Three flat quantity options in one row — 1, ½, and an on-demand exact-grams field. */
function QuantityPicker({
  quantity,
  onQuantityChange,
  t,
}: {
  quantity: string
  onQuantityChange: (v: string) => void
  t: CameraPanelStrings
}) {
  const isPreset = quantity === ONE_WHOLE || quantity === HALF
  const [gramsMode, setGramsMode] = useState(!isPreset && quantity.trim() !== '')
  const gramsInputRef = useRef<HTMLInputElement>(null)

  function selectPreset(value: string) {
    setGramsMode(false)
    onQuantityChange(value)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-nowrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => selectPreset(ONE_WHOLE)}
          className="rounded-full px-2.5 py-1 text-xs font-medium transition-transform active:translate-y-1 active:shadow-none"
          style={{
            backgroundColor: !gramsMode && quantity === ONE_WHOLE ? 'var(--accent)' : 'var(--surface-2)',
            color: !gramsMode && quantity === ONE_WHOLE ? '#ffffff' : 'var(--text-primary)',
            border: '2px solid #000000', boxShadow: '0 2px 0 #000000',
          }}
        >
          1
        </button>
        <button
          type="button"
          onClick={() => selectPreset(HALF)}
          className="rounded-full px-2.5 py-1 text-xs font-medium transition-transform active:translate-y-1 active:shadow-none"
          style={{
            backgroundColor: !gramsMode && quantity === HALF ? 'var(--accent)' : 'var(--surface-2)',
            color: !gramsMode && quantity === HALF ? '#ffffff' : 'var(--text-primary)',
            border: '2px solid #000000', boxShadow: '0 2px 0 #000000',
          }}
        >
          ½
        </button>
        {gramsMode ? (
          <input
            ref={gramsInputRef}
            type="text"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            placeholder={t.quantity.gramsPlaceholder}
            className="w-20 rounded-full px-2.5 py-1 text-center text-xs font-medium"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff', border: '2px solid #000000' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setGramsMode(true)
              onQuantityChange('')
              requestAnimationFrame(() => gramsInputRef.current?.focus())
            }}
            className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-transform active:translate-y-1 active:shadow-none"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '2px solid #000000', boxShadow: '0 2px 0 #000000' }}
          >
            {t.quantity.exactGrams}
          </button>
        )}
      </div>
    </div>
  )
}

function FoodAutocomplete({
  name,
  quantity,
  confirmed,
  onNameChange,
  onQuantityChange,
  onConfirm,
  showQuantity = true,
  t,
}: {
  name: string
  quantity: string
  confirmed: boolean
  onNameChange: (v: string) => void
  onQuantityChange: (v: string) => void
  onConfirm: (name: string) => void
  /** Lets a caller render the QuantityPicker itself elsewhere in the layout instead. */
  showQuantity?: boolean
  t: CameraPanelStrings
}) {
  // Custom foods finish loading from IndexedDB asynchronously; re-render once they land so
  // a food someone just saved shows up in search without needing to retype.
  const [, forceUpdate] = useState(0)
  useEffect(() => onCustomFoodsChange(() => forceUpdate((n) => n + 1)), [])

  const customMatches = !confirmed ? searchCustomFoods(name).map((f) => f.name) : []
  const builtInMatches = !confirmed ? searchFoodNames(name) : []
  const suggestions = !confirmed
    ? [...customMatches, ...builtInMatches.filter((n) => !customMatches.some((c) => c.toLowerCase() === n.toLowerCase()))].slice(0, 6)
    : []
  return (
    <div className="flex flex-col gap-2">
      <div className="relative mx-auto w-2/3">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.autocomplete.namePlaceholder}
          className="w-full rounded-xl py-2.5 ps-3 text-base"
          style={{
            backgroundColor: 'var(--surface-2)',
            border: '3px solid #000000',
            color: 'var(--text-primary)',
            paddingInlineEnd: confirmed ? '2.25rem' : '0.75rem',
          }}
        />
        {confirmed && (
          <button
            type="button"
            onClick={() => onNameChange('')}
            aria-label={t.autocomplete.clearNameAriaLabel}
            className="absolute end-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
          >
            ×
          </button>
        )}
        {suggestions.length > 0 && (
          <div
            className="absolute inset-x-0 top-full z-10 mt-1 flex flex-col overflow-hidden rounded-xl"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-strong)' }}
          >
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onConfirm(s)}
                className="px-3 py-2 text-start text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      {confirmed && showQuantity && (
        <div className="mx-auto w-2/3">
          <QuantityPicker quantity={quantity} onQuantityChange={onQuantityChange} t={t} />
        </div>
      )}
    </div>
  )
}

function downscaleToDataUrl(source: CanvasImageSource, width: number, height: number): string {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

const FOCUS_COLOR = '#f4c542'

function drawFocusCorner(ctx: CanvasRenderingContext2D, cx: number, cy: number, dx: number, dy: number, len: number) {
  ctx.beginPath()
  ctx.moveTo(cx, cy + dy * len)
  ctx.lineTo(cx, cy)
  ctx.lineTo(cx + dx * len, cy)
  ctx.stroke()
}

/** Draws a pill whose BOTTOM edge sits at `bottomY`, i.e. anchored just above a bounding box. */
function drawFoodLabel(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, cx: number, bottomY: number, text: string) {
  const fontSize = Math.max(13, Math.round(canvas.width * 0.038))
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  const paddingX = 9
  const paddingY = 5
  const pillWidth = ctx.measureText(text).width + paddingX * 2
  const pillHeight = fontSize + paddingY * 2
  const pillX = Math.min(Math.max(0, cx - pillWidth / 2), canvas.width - pillWidth)
  const pillY = Math.max(0, Math.min(bottomY - pillHeight, canvas.height - pillHeight))
  const radius = pillHeight / 2

  ctx.beginPath()
  ctx.moveTo(pillX + radius, pillY)
  ctx.arcTo(pillX + pillWidth, pillY, pillX + pillWidth, pillY + pillHeight, radius)
  ctx.arcTo(pillX + pillWidth, pillY + pillHeight, pillX, pillY + pillHeight, radius)
  ctx.arcTo(pillX, pillY + pillHeight, pillX, pillY, radius)
  ctx.arcTo(pillX, pillY, pillX + pillWidth, pillY, radius)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = FOCUS_COLOR
  ctx.stroke()

  ctx.fillStyle = '#2c1a04'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, pillX + pillWidth / 2, pillY + pillHeight / 2 + 1)
}

function drawDetections(canvas: HTMLCanvasElement, detections: FoodDetection[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const d of detections) {
    const [x, y, w, h] = d.bbox
    const cornerLen = Math.max(14, Math.min(w, h) * 0.22)

    ctx.strokeStyle = FOCUS_COLOR
    ctx.lineWidth = Math.max(3, Math.round(canvas.width * 0.007))
    ctx.lineCap = 'round'
    drawFocusCorner(ctx, x, y, 1, 1, cornerLen)
    drawFocusCorner(ctx, x + w, y, -1, 1, cornerLen)
    drawFocusCorner(ctx, x, y + h, 1, -1, cornerLen)
    drawFocusCorner(ctx, x + w, y + h, -1, -1, cornerLen)

    const label = `${foodEmoji(d.normalizedName)} ${d.normalizedName}`
    drawFoodLabel(ctx, canvas, x + w / 2, y - 6, label)
  }
}

export function CameraPanel({ onLogged }: { onLogged: () => void }) {
  const { lang, dir } = useLanguage()
  const t = CAMERA_PANEL_STRINGS[lang]
  const [stage, setStage] = useState<Stage>('camera')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null)
  const [analyzeErrorMsg, setAnalyzeErrorMsg] = useState<string | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [identification, setIdentification] = useState<FoodIdentification | null>(null)
  const [confirmedFoodName, setConfirmedFoodName] = useState('')
  const [confirmQuantity, setConfirmQuantity] = useState('')
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [manualName, setManualName] = useState('')
  const [manualConfirmed, setManualConfirmed] = useState(false)
  const [manualQuantity, setManualQuantity] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customValues, setCustomValues] = useState<NutrientAmounts>(EMPTY_NUTRIENTS)
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientId | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  const resultNutrients = result
    ? getVisibleNutrients().filter((n) => hasRespectableAmount(n.id, result.nutrients[n.id]))
    : []
  const overallNutrientPercent = resultNutrients.length
    ? Math.round(
        resultNutrients.reduce((sum, n) => sum + percentOfMealTarget(n.id, result!.nutrients[n.id]), 0) /
          resultNutrients.length
      )
    : 0
  // Matches the last row's rise-particle timing (riseDelayMs + second-particle offset + rise duration)
  // so the fill bar only starts filling once every rising particle has reached it.
  const nutrientRiseTotalMs = resultNutrients.length ? (resultNutrients.length - 1) * 90 + 140 + 1100 : 0
  // Picked once per result, not on every re-render, so it doesn't change while the screen is up.
  const junkFoodLine = useMemo(
    () => t.junkFood[Math.floor(Math.random() * t.junkFood.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result]
  )

  const [, setDetectorStatus] = useState<DetectorStatus>(getDetectorStatus)
  const [detections, setDetections] = useState<FoodDetection[]>([])
  // Whether the live camera stream is attached and producing frames. Scan Food is gated on
  // this alone — NOT on COCO-SSD finding anything, since COCO only knows ~10 food classes and
  // must never block the user from sending a real photo to OpenAI Vision for identification.
  const [cameraReady, setCameraReady] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectingRef = useRef(false)
  const barcodeDetectingRef = useRef(false)
  const barcodeAttemptedRef = useRef<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultScrollRef = useRef<HTMLDivElement>(null)

  // Slowly auto-scrolls the nutrient list downward so the user can see everything without
  // manually scrolling, pausing at the bottom before looping back to the top.
  useEffect(() => {
    if (stage !== 'result') return
    const el = resultScrollRef.current
    if (!el) return

    let frameId: number
    let pauseTimeout: ReturnType<typeof setTimeout> | undefined
    const SPEED = 15 // px per second

    let lastTime = performance.now()
    function step(time: number) {
      const dt = (time - lastTime) / 1000
      lastTime = time
      if (el) {
        const maxScroll = el.scrollHeight - el.clientHeight
        if (maxScroll > 0) {
          if (el.scrollTop >= maxScroll - 0.5) {
            el.scrollTop = maxScroll
            pauseTimeout = setTimeout(() => {
              if (el) el.scrollTop = 0
              lastTime = performance.now()
              frameId = requestAnimationFrame(step)
            }, 1500)
            return
          }
          el.scrollTop = Math.min(maxScroll, el.scrollTop + SPEED * dt)
        }
      }
      frameId = requestAnimationFrame(step)
    }
    frameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frameId)
      if (pauseTimeout) clearTimeout(pauseTimeout)
    }
  }, [stage, result])

  useEffect(() => {
    preloadFoodDetector()
    return onDetectorStatusChange((s) => {
      setDetectorStatus(s)
      devLog('detector', `status: ${s}`)
    })
  }, [])

  useEffect(() => {
    if (stage !== 'camera') return
    setDetections([])
    setCameraReady(false)
    barcodeAttemptedRef.current = new Set()
    let cancelled = false
    let intervalId: number | undefined
    let barcodeIntervalId: number | undefined

    function handleLoadedData() {
      if (!cancelled) setCameraReady(true)
    }

    // Runs alongside COCO-SSD on the same live frame. A matched product skips straight to the
    // same confirm/quantity flow as a photo scan; a barcode that reads fine but isn't in Open
    // Food Facts' database (common for smaller/regional brands) falls back to the normal AI-vision
    // identification on that same frame rather than leaving the user with silent, dead feedback.
    async function runBarcodeDetection() {
      const video = videoRef.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) return
      if (barcodeDetectingRef.current) return
      barcodeDetectingRef.current = true
      try {
        const code = await decodeBarcodeFromFrame(video)
        if (!code || cancelled || barcodeAttemptedRef.current.has(code)) return
        barcodeAttemptedRef.current.add(code)
        devLog('barcode', `Detected: ${code}`)

        let dataUrl: string
        try {
          dataUrl = downscaleToDataUrl(video, video.videoWidth, video.videoHeight)
        } catch (err) {
          devLog('barcode', 'Frame capture for barcode hit failed.')
          return
        }

        const product = await lookupProductByBarcode(code, lang)
        if (cancelled) return

        if (product) {
          devLog('barcode', `Product matched: ${product.name}`)
          setPhoto(dataUrl)
          setIdentification({
            food: product.name.toLowerCase(),
            displayName: product.name,
            emoji: '🛒',
            confidence: 1,
            alternatives: [],
          })
          setConfirmQuantity('')
          setStage('confirm')
          return
        }

        devLog('barcode', 'No product match — falling back to AI identification.')
        await analyzeCapturedPhoto(dataUrl)
      } catch (err) {
        devLog('barcode', 'Detection or lookup failed.')
      } finally {
        barcodeDetectingRef.current = false
      }
    }

    async function runDetection() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) return
      // A single inference pass can take longer than the tick interval on real phone hardware.
      // Without this guard, ticks pile up and the model can wedge itself into failing forever.
      if (detectingRef.current) return
      detectingRef.current = true
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
      try {
        const found = await detectFood(video)
        if (!cancelled) {
          drawDetections(canvas, found)
          setDetections(found)
        }
      } catch (err) {
        console.error('Food detection tick failed:', err)
      } finally {
        detectingRef.current = false
      }
    }

    async function startCamera() {
      setCameraError(null)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        devLog('camera', 'Stream started.')
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.addEventListener('loadeddata', handleLoadedData)
        }
        intervalId = window.setInterval(runDetection, DETECTION_INTERVAL_MS)
        barcodeIntervalId = window.setInterval(runBarcodeDetection, DETECTION_INTERVAL_MS)
      } catch (err) {
        devLog('camera', 'getUserMedia failed.')
        if (!cancelled) setCameraError(t.cameraUnavailable)
      }
    }

    startCamera()
    return () => {
      cancelled = true
      if (intervalId !== undefined) window.clearInterval(intervalId)
      if (barcodeIntervalId !== undefined) window.clearInterval(barcodeIntervalId)
      videoRef.current?.removeEventListener('loadeddata', handleLoadedData)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    // Camera setup/teardown is tied to `stage` only — it must not restart (and briefly drop
    // the live stream) just because the user switches language mid-scan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // COCO-SSD is a hint layer only (bounding box + optional label) — it must never gate
  // whether the user is allowed to send a frame to OpenAI Vision, since it only recognizes
  // ~10 food classes and would otherwise block real foods it doesn't happen to know.
  const stableDetection = detections.find((d) => d.stable) ?? null

  function resetManualFields() {
    setManualName('')
    setManualConfirmed(false)
    setManualQuantity('')
  }

  function resetCustomFields() {
    setCustomName('')
    setCustomValues(EMPTY_NUTRIENTS)
  }

  function handleCustomValueChange(id: NutrientId, v: number) {
    setCustomValues((prev) => ({ ...prev, [id]: v }))
  }

  function handleManualNameChange(v: string) {
    setManualName(v)
    setManualConfirmed(false)
  }

  function handleManualConfirm(name: string) {
    setManualName(name)
    setManualConfirmed(true)
  }

  function retake() {
    setPhoto(null)
    setResult(null)
    setIdentification(null)
    setConfirmQuantity('')
    resetManualFields()
    resetCustomFields()
    setAnalyzeErrorMsg(null)
    setScanErrorMsg(null)
    setStage('camera')
  }

  /** Identifies every distinct food in a captured/uploaded photo and estimates their combined
   *  nutrition in one call, skipping straight to the results screen — no per-item confirm step. */
  async function analyzeCapturedPhoto(dataUrl: string) {
    setPhoto(dataUrl)
    setScanErrorMsg(null)
    setStage('identifying')

    try {
      const res = await analyzeFoodImage(dataUrl)
      devLog('vision-api', `Identified ${res.foods.length} food item(s).`)

      if (res.foods.length === 0) {
        devLog('vision-api', 'No food detected — falling back to manual entry.')
        resetManualFields()
        setAnalyzeErrorMsg(t.identify.notRecognized)
        setStage('manual')
        return
      }

      setResult(res)
      setStage('result')
    } catch (err) {
      devLog('vision-api', 'Photo analysis failed.')
      setScanErrorMsg(
        err instanceof AnalyzeError
          ? err.message
          : t.identify.serviceUnreachable
      )
      setStage('camera')
    }
  }

  async function scanFood() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) {
      devLog('capture', 'No video frame available.')
      setScanErrorMsg(t.scanErrors.noFrame)
      return
    }

    let dataUrl: string
    try {
      dataUrl = downscaleToDataUrl(video, video.videoWidth, video.videoHeight)
    } catch (err) {
      devLog('capture', 'Frame capture failed.')
      setScanErrorMsg(t.scanErrors.captureFailed)
      return
    }

    devLog('capture', 'Frame captured for scanning.')
    await analyzeCapturedPhoto(dataUrl)
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let dataUrl: string
      try {
        dataUrl = downscaleToDataUrl(img, img.naturalWidth, img.naturalHeight)
      } catch (err) {
        devLog('capture', 'Uploaded image processing failed.')
        setScanErrorMsg(t.scanErrors.readFailed)
        return
      }
      devLog('capture', 'Uploaded photo ready for scanning.')
      analyzeCapturedPhoto(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setScanErrorMsg(t.scanErrors.readFailed)
    }
    img.src = objectUrl
  }

  async function confirmFood(name: string, quantity: string) {
    setStage('analyzing')
    setAnalyzeErrorMsg(null)
    const normalized = name.trim().toLowerCase()
    devLog('nutrition', `Looking up: ${normalized} (${quantity.trim() || 'a typical serving'})`)
    try {
      const res = await analyzeFoodText(normalized, quantity)
      devLog('nutrition', 'Lookup succeeded.')
      setResult(res)
      setStage('result')
    } catch (err) {
      devLog('nutrition', 'Lookup failed.')
      setAnalyzeErrorMsg(
        err instanceof AnalyzeError ? err.message : t.analyzeUnreachable
      )
      setStage('quantity')
    }
  }

  async function runManualAnalysis() {
    if (!manualConfirmed || !manualQuantity.trim()) return
    // Keep a real captured/uploaded photo if one exists (e.g. scan fell back to manual entry);
    // only use the placeholder when the user opened manual entry with no photo at all.
    setPhoto((prev) => prev ?? MANUAL_ENTRY_PHOTO)
    setAnalyzeErrorMsg(null)

    // A previously-saved custom food already has known nutrients for its own portion, so scale
    // those directly instead of re-asking the AI estimator every time it's logged again — but
    // only when it actually has real macro data. The custom-entry form (for supplements/labels)
    // never collects calories/macros, so entries saved that way default to all-zero macros; using
    // that shortcut for those would permanently show 0 kcal for foods that clearly have calories.
    const customFood = findCustomFood(manualName)
    const customFoodHasMacros = customFood?.macros && Object.values(customFood.macros).some((v) => v > 0)
    if (customFood && customFoodHasMacros) {
      const scaled = scaleCustomFood(customFood, manualQuantity, t.scaledFromCustomNote)
      if (scaled) {
        devLog('nutrition', `Scaled from saved custom entry: ${customFood.name}`)
        setResult(scaled)
        setStage('result')
        return
      }
    }

    setStage('analyzing')
    devLog('nutrition', `Looking up: ${manualName.trim().toLowerCase()}`)
    try {
      const res = await analyzeFoodText(manualName, manualQuantity)
      setResult(res)
      setStage('result')
    } catch (err) {
      setAnalyzeErrorMsg(
        err instanceof AnalyzeError ? err.message : t.analyzeUnreachable
      )
      setStage('manual')
    }
  }

  async function submitCustomEntry() {
    if (!customName.trim()) return
    setPhoto((prev) => prev ?? MANUAL_ENTRY_PHOTO)
    await saveCustomFood(customName, '1', customValues, EMPTY_MACROS)
    setResult({
      foods: [{ name: customName.trim(), portion: '1' }],
      nutrients: customValues,
      macros: EMPTY_MACROS,
      confidence: 'high',
      note: t.customEntryNote,
    })
    setStage('result')
  }

  async function runManualFixup() {
    if (!manualConfirmed || !manualQuantity.trim()) return
    setManualLoading(true)
    setAnalyzeErrorMsg(null)
    try {
      const res = await analyzeFoodText(manualName, manualQuantity)
      setResult(res)
    } catch (err) {
      setAnalyzeErrorMsg(
        err instanceof AnalyzeError ? err.message : t.analyzeUnreachable
      )
    } finally {
      setManualLoading(false)
    }
  }

  async function saveEntry() {
    if (!photo || !result || justSaved) return
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      date: todayKey(),
      createdAt: new Date().toISOString(),
      imageDataUrl: photo,
      foods: result.foods,
      nutrients: result.nutrients,
      macros: result.macros ?? EMPTY_MACROS,
      confidence: result.confidence,
      analysisNote: result.note,
      isJunkFood: result.isJunkFood,
    }
    await addMeal(entry)
    onLogged()
    // Keep the result panel (percent bar + vitamin list) on screen for a beat with a "Saved!"
    // confirmation, instead of instantly dumping the user back at the camera — long enough to
    // actually read it, not just flash by.
    setJustSaved(true)
    setTimeout(() => {
      logAnother()
      setJustSaved(false)
    }, 1800)
  }

  function logAnother() {
    setPhoto(null)
    setResult(null)
    setIdentification(null)
    setConfirmedFoodName('')
    setConfirmQuantity('')
    setScanErrorMsg(null)
    setAnalyzeErrorMsg(null)
    resetManualFields()
    resetCustomFields()
    setStage('camera')
  }

  return (
    <div className="relative mx-auto flex h-full max-w-md flex-col justify-center gap-3 px-4 pb-3 pt-5">
      {stage === 'camera' && scanErrorMsg && (
        <p
          className="absolute inset-x-4 top-3 z-20 rounded-lg px-3 py-2 text-center text-xs font-medium"
          style={{ backgroundColor: 'var(--status-critical-soft)', color: 'var(--status-critical)' }}
        >
          {scanErrorMsg}
        </p>
      )}
      {stage !== 'manual' && stage !== 'custom' && stage !== 'result' && (
        <div
          className={`relative mx-auto flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-2xl ${stage === 'quantity' ? 'w-[38%]' : 'w-[70%]'}`}
          style={{ backgroundColor: 'var(--surface-2)', border: '4px solid #000000' }}
        >
          {stage === 'camera' && !cameraError && (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
            </>
          )}
          {stage === 'camera' && cameraError && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="rounded-2xl px-4 py-3 text-center text-sm shadow-lg"
                style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                {cameraError}
              </div>
            </div>
          )}
          {(stage === 'identifying' ||
            stage === 'confirm' ||
            stage === 'quantity' ||
            stage === 'analyzing') &&
            photo &&
            (isManualEntryPhoto(photo) ? (
              <div className="flex h-full w-full items-center justify-center px-4 text-center" style={{ backgroundColor: '#e5c184' }}>
                <span
                  className="text-xl font-bold capitalize"
                  style={{ color: '#fffaf0', textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
                >
                  {result?.foods[0]?.name || t.result.mealFallbackName}
                </span>
              </div>
            ) : (
              <img src={photo} alt={t.capturedMealAlt} className="h-full w-full object-cover" />
            ))}
          {(stage === 'identifying' || stage === 'analyzing') && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="text-sm font-medium text-white">
                {stage === 'identifying' ? t.overlay.identifying : t.overlay.gettingNutrients}
              </span>
            </div>
          )}
        </div>
      )}

      {stage === 'camera' && (
        <div className="mx-auto flex w-[80%] flex-col items-center gap-3">
          {stableDetection && !cameraError && (
            <p className="text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {foodEmoji(stableDetection.normalizedName)} {t.detectedSuffix(stableDetection.normalizedName)}
            </p>
          )}
          <button
            onClick={scanFood}
            disabled={!!cameraError || !cameraReady}
            className="w-3/4 rounded-full py-2 text-sm font-semibold text-white transition-transform active:translate-y-1 active:shadow-none disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)', border: '4px solid #000000', boxShadow: '0 4px 0 #000000' }}
          >
            {t.actions.scanFood}
          </button>
          <button
            onClick={handleUploadClick}
            className="w-3/4 rounded-full py-2 text-center text-sm font-medium transition-transform active:translate-y-1 active:shadow-none"
            style={{ border: '4px solid #1a1a19', color: '#ffffff', backgroundColor: '#e8863a', boxShadow: '0 4px 0 #1a1a19' }}
          >
            {t.actions.uploadPhoto}
          </button>
          <button
            onClick={() => setStage('manual')}
            className="w-3/4 rounded-full py-2 text-center text-sm font-medium transition-transform active:translate-y-1 active:shadow-none"
            style={{ border: '4px solid #1a1a19', color: 'var(--text-primary)', backgroundColor: '#fbedc3', boxShadow: '0 4px 0 #1a1a19' }}
          >
            {t.actions.logManually}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>
      )}

      {stage === 'confirm' && identification && (
        <div className="flex flex-col items-center gap-3 py-1">
          <div className="flex flex-col items-center gap-1">
            <div className="text-5xl leading-none">{identification.emoji}</div>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {identification.displayName || capitalize(identification.food)}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t.confirm.isCorrect}
            </p>
          </div>

          <div className="flex w-full gap-2">
            <button
              onClick={() => {
                setConfirmedFoodName(identification.displayName || identification.food)
                setStage('quantity')
              }}
              className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: '#e8863a', border: '2px solid #1a1a19', boxShadow: '0 2px 0 #1a1a19' }}
            >
              {t.confirm.confirm}
            </button>
            <button
              onClick={retake}
              className="flex-1 rounded-full py-2.5 text-sm font-medium transition-transform active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: '#f6e4bb', border: '2px solid #222', boxShadow: '0 2px 0 #222', color: 'var(--text-primary)' }}
            >
              {t.confirm.retakePhoto}
            </button>
          </div>
        </div>
      )}

      {stage === 'quantity' && (
        <div className="relative flex min-h-0 flex-1 flex-col items-center gap-2 py-1">
          {analyzeErrorMsg && (
            <p
              className="absolute inset-x-0 top-1 z-20 rounded-lg px-3 py-2 text-center text-xs font-medium"
              style={{ backgroundColor: 'var(--status-critical-soft)', color: 'var(--status-critical)' }}
            >
              {analyzeErrorMsg}
            </p>
          )}
          <p className="shrink-0 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {capitalize(confirmedFoodName)}
          </p>
          <div className="thin-scroll flex w-full max-h-[40vh] flex-col gap-1.5 overflow-y-auto px-1 pb-2">
            <p className="text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {t.quantityStage.howMuch}
            </p>
            <QuantityPicker quantity={confirmQuantity} onQuantityChange={setConfirmQuantity} t={t} />
          </div>

          <div className="mt-2 flex w-full shrink-0 gap-2">
            <button
              onClick={() => confirmFood(confirmedFoodName, confirmQuantity)}
              disabled={!confirmQuantity.trim()}
              className="flex-[2] rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-transform active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: 'var(--accent)', border: '2px solid #1a1a19', boxShadow: '0 2px 0 #1a1a19' }}
            >
              {t.quantityStage.calculate}
            </button>
            <button
              onClick={() => setStage('confirm')}
              className="flex-1 rounded-full py-2.5 text-sm font-medium transition-transform active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: '#f6e4bb', border: '2px solid #222', boxShadow: '0 2px 0 #222', color: 'var(--text-primary)' }}
            >
              {t.quantityStage.back}
            </button>
          </div>
        </div>
      )}

      {stage === 'manual' && (
        <div className="relative flex min-h-0 flex-1 flex-col gap-3">
          {analyzeErrorMsg && (
            <p
              className="absolute inset-x-0 top-0 z-20 rounded-lg px-3 py-2 text-xs"
              style={{ backgroundColor: 'var(--status-critical-soft)', color: 'var(--status-critical)' }}
            >
              {analyzeErrorMsg}
            </p>
          )}
          {manualConfirmed && (
            <div className="mt-2">
              <FoodAutocomplete
                name={manualName}
                quantity={manualQuantity}
                confirmed={manualConfirmed}
                onNameChange={handleManualNameChange}
                onQuantityChange={setManualQuantity}
                onConfirm={handleManualConfirm}
                showQuantity={false}
                t={t}
              />
            </div>
          )}
          <div className={`flex flex-1 flex-col items-center gap-3 ${manualConfirmed ? 'justify-evenly' : 'justify-center'}`}>
            {!manualConfirmed && (
              <FoodAutocomplete
                name={manualName}
                quantity={manualQuantity}
                confirmed={manualConfirmed}
                onNameChange={handleManualNameChange}
                onQuantityChange={setManualQuantity}
                onConfirm={handleManualConfirm}
                t={t}
              />
            )}
            {manualConfirmed && (
              <div className="w-2/3">
                <QuantityPicker quantity={manualQuantity} onQuantityChange={setManualQuantity} t={t} />
              </div>
            )}
            <div className="mx-auto flex w-2/3 flex-col gap-2">
              <button
                onClick={runManualAnalysis}
                disabled={!manualConfirmed || !manualQuantity.trim()}
                className="flex w-full items-center justify-center whitespace-nowrap rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-transform active:translate-y-1 active:shadow-none"
                style={{ backgroundColor: 'var(--accent)', border: '3px solid #222', boxShadow: '0 3px 0 #222' }}
              >
                {t.quantityStage.calculate}
              </button>
              <button
                onClick={() => {
                  resetManualFields()
                  setAnalyzeErrorMsg(null)
                  setStage('camera')
                }}
                className="flex w-full items-center justify-center whitespace-nowrap rounded-xl py-2.5 text-sm font-medium transition-transform active:translate-y-1 active:shadow-none"
                style={{ backgroundColor: '#f6e4bb', border: '3px solid #222', boxShadow: '0 3px 0 #222', color: 'var(--text-primary)' }}
              >
                {t.manual.cancel}
              </button>
            </div>
          </div>
          <div className="flex justify-center pb-1">
            <button
              onClick={() => setStage('custom')}
              className="rounded-full px-4 py-2 text-xs font-semibold transition-transform active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: '#fbedc3', border: '2px solid #1a1a19', boxShadow: '0 2px 0 #1a1a19', color: 'var(--text-primary)' }}
            >
              {t.manual.addCustomFood} {dir === 'rtl' ? '←' : '→'}
            </button>
          </div>
        </div>
      )}

      {stage === 'custom' && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <CustomNutritionForm
            name={customName}
            onNameChange={setCustomName}
            values={customValues}
            onValueChange={handleCustomValueChange}
          />
          <div className="mx-auto flex w-[70%] items-stretch gap-2">
            <button
              onClick={submitCustomEntry}
              disabled={!customName.trim()}
              className="flex flex-1 items-center justify-center whitespace-nowrap rounded-xl px-3 py-1.5 text-center text-xs font-semibold text-white disabled:opacity-40 transition-transform active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: 'var(--accent)', border: '2px solid #222', boxShadow: '0 2px 0 #222' }}
            >
              {t.custom.useTheseValues}
            </button>
            <button
              onClick={() => {
                resetCustomFields()
                setStage('manual')
              }}
              aria-label={t.custom.backAriaLabel}
              className="flex shrink-0 items-center justify-center rounded-xl px-3 py-1.5 text-base font-medium transition-transform active:translate-y-1 active:shadow-none"
              style={{ backgroundColor: '#f6e4bb', border: '2px solid #222', boxShadow: '0 2px 0 #222', color: 'var(--text-primary)' }}
            >
              {dir === 'rtl' ? '›' : '‹'}
            </button>
          </div>
        </div>
      )}

      {stage === 'result' && result && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <ConfettiBurst count={70} />

          {resultNutrients.length > 0 && !result.isJunkFood && (
            <NutrientFillBar percent={overallNutrientPercent} startDelayMs={nutrientRiseTotalMs} />
          )}

          <div className="flex flex-col items-center justify-center gap-1 px-2 text-center">
            {result.foods.length === 0 ? (
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {t.result.noFoodRecognized}
              </span>
            ) : (
              result.foods.map((f, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-2xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {f.name}
                  </span>
                  <span className="text-base font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
                    {f.portion}
                  </span>
                </div>
              ))
            )}
          </div>

          {result.foods.length > 0 && isMacroTrackingEnabled() && <MacroSummaryRow macros={result.macros ?? EMPTY_MACROS} />}

          <div
            ref={resultScrollRef}
            className="thin-scroll mx-auto flex max-h-[48vh] min-h-0 w-[88%] flex-1 flex-col gap-1.5 overflow-y-auto rounded-3xl p-2"
            style={{ backgroundColor: '#e5c184', border: '4px solid #000000', boxShadow: '0 10px 26px rgba(11,11,11,0.16)' }}
          >
            {result.foods.length === 0 ? (
              <div className="flex flex-col gap-2">
                <FoodAutocomplete
                  name={manualName}
                  quantity={manualQuantity}
                  confirmed={manualConfirmed}
                  onNameChange={handleManualNameChange}
                  onQuantityChange={setManualQuantity}
                  onConfirm={handleManualConfirm}
                  t={t}
                />
                <button
                  onClick={runManualFixup}
                  disabled={!manualConfirmed || !manualQuantity.trim() || manualLoading}
                  className="rounded-full py-2 text-xs font-semibold text-white disabled:opacity-40 transition-transform active:translate-y-1 active:shadow-none"
                  style={{ backgroundColor: 'var(--accent)', border: '1px solid #1a1a19', boxShadow: '0 1px 0 #1a1a19' }}
                >
                  {manualLoading ? t.result.calculating : t.result.getNutrients}
                </button>
              </div>
            ) : result.isJunkFood ? (
              <p className="px-3 py-4 text-center text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {junkFoodLine}
              </p>
            ) : resultNutrients.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t.result.noStandoutNutrients}
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {resultNutrients.map((n, i) => (
                  <NutrientBar
                    key={n.id}
                    id={n.id}
                    amount={result.nutrients[n.id]}
                    onClick={() => setSelectedNutrient(n.id)}
                    riseDelayMs={i * 90}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mx-auto mb-2 mt-3 flex w-[88%] shrink-0 justify-center">
            <button
              onClick={saveEntry}
              disabled={justSaved}
              className="rounded-full px-12 py-3 text-base font-semibold text-white transition-transform active:translate-y-1 active:shadow-none"
              style={{
                backgroundColor: justSaved ? 'var(--status-good)' : 'var(--accent)',
                border: '4px solid #1a1a19',
                boxShadow: '0 4px 0 #1a1a19',
              }}
            >
              {justSaved ? t.result.saved : t.result.save}
            </button>
          </div>
        </div>
      )}

      {selectedNutrient && result && (
        <NutrientDetailModal
          id={selectedNutrient}
          amount={result.nutrients[selectedNutrient]}
          perMeal
          onClose={() => setSelectedNutrient(null)}
        />
      )}
    </div>
  )
}

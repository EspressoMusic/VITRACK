import { useEffect, useRef, useState } from 'react'
import type { MealEntry } from '../types'
import { analyzeFoodImage, AnalyzeError, type AnalyzeResult } from '../lib/api'
import { addMeal } from '../lib/db'
import { todayKey } from '../lib/date'
import { NutrientBar } from './NutrientBar'
import { NUTRIENTS } from '../lib/nutrients'
import { detectFood, preloadFoodDetector, type FoodDetection } from '../lib/foodDetector'

type Stage = 'camera' | 'captured' | 'analyzing' | 'result' | 'saved'

const MAX_DIMENSION = 900
const JPEG_QUALITY = 0.82
const DETECTION_INTERVAL_MS = 450

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

function drawDetections(canvas: HTMLCanvasElement, detections: FoodDetection[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const fontSize = Math.max(16, Math.round(canvas.width * 0.035))
  ctx.lineWidth = Math.max(2, Math.round(canvas.width * 0.006))
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  ctx.textBaseline = 'bottom'
  for (const d of detections) {
    const [x, y, w, h] = d.bbox
    ctx.strokeStyle = '#2a78d6'
    ctx.strokeRect(x, y, w, h)

    const label = `${d.label} ${Math.round(d.score * 100)}%`
    const paddingX = 6
    const labelHeight = fontSize + 6
    const textWidth = ctx.measureText(label).width
    const labelY = Math.max(0, y - labelHeight)

    ctx.fillStyle = '#2a78d6'
    ctx.fillRect(x, labelY, textWidth + paddingX * 2, labelHeight)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, x + paddingX, labelY + labelHeight - 4)
  }
}

export function CameraPanel({ onLogged }: { onLogged: () => void }) {
  const [stage, setStage] = useState<Stage>('camera')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [analyzeErrorMsg, setAnalyzeErrorMsg] = useState<string | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    preloadFoodDetector()
  }, [])

  useEffect(() => {
    if (stage !== 'camera') return
    let cancelled = false
    let intervalId: number | undefined

    async function runDetection() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) return
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
      try {
        const detections = await detectFood(video)
        if (!cancelled) drawDetections(canvas, detections)
      } catch {
        // Detection model failed to load or run — the live overlay is a nice-to-have,
        // so fail silently and let the user still capture/upload normally.
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
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        intervalId = window.setInterval(runDetection, DETECTION_INTERVAL_MS)
      } catch {
        if (!cancelled) setCameraError('Camera unavailable or permission denied — use "Upload a photo" instead.')
      }
    }

    startCamera()
    return () => {
      cancelled = true
      if (intervalId !== undefined) window.clearInterval(intervalId)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [stage])

  function capturePhoto() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return
    const dataUrl = downscaleToDataUrl(video, video.videoWidth, video.videoHeight)
    setPhoto(dataUrl)
    setStage('captured')
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const dataUrl = downscaleToDataUrl(img, img.naturalWidth, img.naturalHeight)
      setPhoto(dataUrl)
      setStage('captured')
    }
    img.src = URL.createObjectURL(file)
  }

  function retake() {
    setPhoto(null)
    setResult(null)
    setAnalyzeErrorMsg(null)
    setStage('camera')
  }

  async function runAnalysis() {
    if (!photo) return
    setStage('analyzing')
    setAnalyzeErrorMsg(null)
    try {
      const res = await analyzeFoodImage(photo)
      setResult(res)
      setStage('result')
    } catch (err) {
      setAnalyzeErrorMsg(
        err instanceof AnalyzeError ? err.message : 'Could not reach the analysis server. Is the backend running?'
      )
      setStage('captured')
    }
  }

  async function saveEntry() {
    if (!photo || !result) return
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      date: todayKey(),
      createdAt: new Date().toISOString(),
      imageDataUrl: photo,
      foods: result.foods,
      nutrients: result.nutrients,
      confidence: result.confidence,
      analysisNote: result.note,
    }
    await addMeal(entry)
    setStage('saved')
    onLogged()
  }

  function logAnother() {
    setPhoto(null)
    setResult(null)
    setStage('camera')
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-6 pt-20">
      <div
        className="relative mx-auto flex aspect-square w-[70%] items-center justify-center overflow-hidden rounded-2xl"
        style={{ backgroundColor: 'var(--surface-2)', border: '5px solid #d9a441' }}
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
        {(stage === 'captured' || stage === 'analyzing' || stage === 'result' || stage === 'saved') && photo && (
          <img src={photo} alt="Captured meal" className="h-full w-full object-cover" />
        )}
        {stage === 'analyzing' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-sm font-medium text-white">Analyzing meal…</span>
          </div>
        )}
      </div>

      {stage === 'camera' && (
        <div className="mx-auto flex w-[80%] flex-col gap-2">
          <button
            onClick={capturePhoto}
            disabled={!!cameraError}
            className="rounded-full py-2.5 text-base font-semibold text-white transition disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)', border: '4px solid #b8842a' }}
          >
            Capture photo
          </button>
          <label
            className="cursor-pointer rounded-full py-2.5 text-center text-base font-medium"
            style={{ border: '4px solid #1a1a19', color: 'var(--text-primary)', backgroundColor: '#fbedc3' }}
          >
            Upload a photo
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {stage === 'captured' && (
        <div className="flex flex-col gap-2">
          {analyzeErrorMsg && (
            <p
              className="rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--status-critical-soft)', color: 'var(--status-critical)' }}
            >
              {analyzeErrorMsg}
            </p>
          )}
          <button
            onClick={runAnalysis}
            className="rounded-full py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Analyze this meal
          </button>
          <button
            onClick={retake}
            className="rounded-full py-3 text-sm font-medium"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
          >
            Retake
          </button>
        </div>
      )}

      {stage === 'result' && result && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {result.foods.length === 0 ? (
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No food recognized in this photo.
              </span>
            ) : (
              result.foods.map((f, i) => (
                <span
                  key={i}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)' }}
                >
                  {f.name} <span style={{ color: 'var(--text-muted)' }}>· {f.portion}</span>
                </span>
              ))
            )}
          </div>

          {result.note && (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
              {result.note} (confidence: {result.confidence})
            </p>
          )}

          <div className="flex flex-col gap-3">
            {NUTRIENTS.map((n) => (
              <NutrientBar key={n.id} id={n.id} amount={result.nutrients[n.id]} />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={saveEntry}
              className="rounded-full py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--status-good)' }}
            >
              Save to today's log
            </button>
            <button
              onClick={retake}
              className="rounded-full py-3 text-sm font-medium"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
            >
              Discard & retake
            </button>
          </div>
        </div>
      )}

      {stage === 'saved' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xl text-white"
            style={{ backgroundColor: 'var(--status-good)' }}
          >
            ✓
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Meal logged for today.
          </p>
          <button
            onClick={logAnother}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Log another meal
          </button>
        </div>
      )}
    </div>
  )
}

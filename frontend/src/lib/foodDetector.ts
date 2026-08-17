import type { NutrientAmounts } from '../types'
import { CocoSsdBackend } from './detection/cocoSsdBackend'
import type { DetectionBackend, RawDetection } from './detection/types'
import { lookupNutrition, normalizeFoodName } from './foodNutrition'

const FOOD_EMOJI: Record<string, string> = {
  Banana: '🍌',
  Apple: '🍎',
  Sandwich: '🥪',
  Orange: '🍊',
  Broccoli: '🥦',
  Carrot: '🥕',
  'Hot Dog': '🌭',
  Pizza: '🍕',
  Donut: '🍩',
  Cake: '🍰',
}

const FOOD_CLASSES = new Set(['banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake'])

/** Detections below this confidence are ignored entirely. Kept as a named, exported config value. */
export const MIN_SCORE = 0.6

/** A tracked box needs this many consecutive matched ticks before it's considered "stable"
 * enough for the UI to let the user act on it (e.g. enable a scan/capture button). */
export const STABLE_HIT_STREAK = 3

export function foodEmoji(normalizedName: string): string {
  return FOOD_EMOJI[normalizedName] ?? '🍽️'
}

export type FoodDetection = {
  bbox: [number, number, number, number]
  /** Raw detector class name, e.g. "hot dog". */
  label: string
  /** Canonical display name after normalization, e.g. "Hot Dog". */
  normalizedName: string
  score: number
  /** Rough nutrient estimate from the normalized name, or null if not in the lookup table. */
  nutrients: NutrientAmounts | null
  /** True once this same food has been matched for STABLE_HIT_STREAK consecutive ticks —
   * i.e. it's not just a one-frame flicker, and the UI can treat it as scan-ready. */
  stable: boolean
}

// --- Backend (swap CocoSsdBackend for a custom food-detection model later) ---

const backend: DetectionBackend = new CocoSsdBackend()

export type DetectorStatus = 'loading' | 'ready' | 'error'

let status: DetectorStatus = 'loading'
const statusListeners = new Set<(s: DetectorStatus) => void>()

function setStatus(next: DetectorStatus) {
  status = next
  statusListeners.forEach((l) => l(next))
}

export function getDetectorStatus(): DetectorStatus {
  return status
}

export function onDetectorStatusChange(listener: (s: DetectorStatus) => void): () => void {
  statusListeners.add(listener)
  return () => statusListeners.delete(listener)
}

let loadPromise: Promise<void> | null = null

function ensureLoaded(): Promise<void> {
  if (!loadPromise) {
    loadPromise = backend
      .load()
      .then(() => setStatus('ready'))
      .catch((err) => {
        console.error('Food detector failed to load:', err)
        setStatus('error')
        throw err
      })
  }
  return loadPromise
}

export function preloadFoodDetector() {
  ensureLoaded().catch(() => {})
}

// --- Temporal smoothing/tracking, so boxes don't jitter or flicker tick-to-tick ---

interface Track {
  id: number
  className: string
  bbox: [number, number, number, number]
  score: number
  missedTicks: number
  /** Consecutive ticks this track has been matched to a new detection, without resetting on a
   * single missed tick (see MAX_MISSED_TICKS grace period below). */
  hitStreak: number
}

const MAX_MISSED_TICKS = 2
const MIN_MATCH_IOU = 0.15
const SMOOTHING = 0.5

let nextTrackId = 0
let tracks: Track[] = []

function iou(a: [number, number, number, number], b: [number, number, number, number]): number {
  const [ax, ay, aw, ah] = a
  const [bx, by, bw, bh] = b
  const x1 = Math.max(ax, bx)
  const y1 = Math.max(ay, by)
  const x2 = Math.min(ax + aw, bx + bw)
  const y2 = Math.min(ay + ah, by + bh)
  const overlap = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  if (overlap <= 0) return 0
  const union = aw * ah + bw * bh - overlap
  return union > 0 ? overlap / union : 0
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

function updateTracks(raw: RawDetection[]): Track[] {
  const unmatched = new Set(tracks.map((_, i) => i))
  const next: Track[] = []

  for (const det of raw) {
    let bestIdx = -1
    let bestIou = MIN_MATCH_IOU
    for (const i of unmatched) {
      const t = tracks[i]
      if (t.className !== det.className) continue
      const overlap = iou(t.bbox, det.bbox)
      if (overlap > bestIou) {
        bestIou = overlap
        bestIdx = i
      }
    }

    if (bestIdx >= 0) {
      const t = tracks[bestIdx]
      unmatched.delete(bestIdx)
      next.push({
        id: t.id,
        className: det.className,
        score: det.score,
        missedTicks: 0,
        hitStreak: t.hitStreak + 1,
        bbox: [
          lerp(t.bbox[0], det.bbox[0], SMOOTHING),
          lerp(t.bbox[1], det.bbox[1], SMOOTHING),
          lerp(t.bbox[2], det.bbox[2], SMOOTHING),
          lerp(t.bbox[3], det.bbox[3], SMOOTHING),
        ],
      })
    } else {
      next.push({ id: nextTrackId++, className: det.className, bbox: det.bbox, score: det.score, missedTicks: 0, hitStreak: 1 })
    }
  }

  // Keep briefly-lost tracks alive for a couple of ticks instead of dropping them instantly,
  // so a single missed frame doesn't read as a flicker.
  for (const i of unmatched) {
    const t = tracks[i]
    if (t.missedTicks < MAX_MISSED_TICKS) {
      next.push({ ...t, missedTicks: t.missedTicks + 1 })
    }
  }

  tracks = next
  return tracks
}

function toFoodDetection(t: Track): FoodDetection {
  const normalizedName = normalizeFoodName(t.className)
  return {
    bbox: t.bbox,
    label: t.className,
    normalizedName,
    score: t.score,
    nutrients: lookupNutrition(normalizedName),
    stable: t.hitStreak >= STABLE_HIT_STREAK,
  }
}

export async function detectFood(video: HTMLVideoElement): Promise<FoodDetection[]> {
  await ensureLoaded()
  const raw = await backend.detect(video)
  const foodOnly = raw.filter((p) => FOOD_CLASSES.has(p.className) && p.score >= MIN_SCORE)
  const smoothed = updateTracks(foodOnly)
  return smoothed.map(toFoodDetection)
}

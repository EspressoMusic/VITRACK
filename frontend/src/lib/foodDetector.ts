import '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

const FOOD_CLASSES = new Set([
  'banana', 'apple', 'sandwich', 'orange', 'broccoli',
  'carrot', 'hot dog', 'pizza', 'donut', 'cake',
])

const MIN_SCORE = 0.55

export type FoodDetection = { bbox: [number, number, number, number]; label: string; score: number }

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null

function getModel() {
  if (!modelPromise) {
    modelPromise = cocoSsd.load({ base: 'lite_mobilenet_v2' })
  }
  return modelPromise
}

export function preloadFoodDetector() {
  getModel().catch(() => {})
}

export async function detectFood(video: HTMLVideoElement): Promise<FoodDetection[]> {
  const model = await getModel()
  const predictions = await model.detect(video)
  return predictions
    .filter((p) => FOOD_CLASSES.has(p.class) && p.score >= MIN_SCORE)
    .map((p) => ({ bbox: p.bbox as [number, number, number, number], label: p.class, score: p.score }))
}

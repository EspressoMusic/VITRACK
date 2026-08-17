import '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import type { DetectionBackend, RawDetection } from './types'

/** First-cut detection backend. General-purpose COCO-SSD only knows 10 food-ish classes —
 * swap this out for a custom food-trained YOLO backend later via the same DetectionBackend interface. */
export class CocoSsdBackend implements DetectionBackend {
  private model: cocoSsd.ObjectDetection | null = null

  async load(): Promise<void> {
    // 'mobilenet_v2' trades some load time for meaningfully better real-world accuracy than
    // 'lite_mobilenet_v2' — worth it since inference time, not this choice, is the real speed limit.
    this.model = await cocoSsd.load({ base: 'mobilenet_v2' })
  }

  async detect(video: HTMLVideoElement): Promise<RawDetection[]> {
    if (!this.model) throw new Error('Detection model is not loaded yet.')
    const predictions = await this.model.detect(video)
    return predictions.map((p) => ({
      bbox: p.bbox as [number, number, number, number],
      className: p.class,
      score: p.score,
    }))
  }
}

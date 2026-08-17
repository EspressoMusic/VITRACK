/** A single detection straight from a detection backend, in raw video-pixel coordinates. */
export interface RawDetection {
  bbox: [number, number, number, number]
  className: string
  score: number
}

/**
 * Swappable object-detection backend. CameraPanel and foodDetector.ts only depend on this
 * interface — swapping COCO-SSD for a custom YOLO food model later means writing a new
 * class that implements it and pointing `lib/foodDetector.ts` at it, with no UI changes.
 */
export interface DetectionBackend {
  load(): Promise<void>
  detect(video: HTMLVideoElement): Promise<RawDetection[]>
}

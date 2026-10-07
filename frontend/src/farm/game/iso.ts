import { CONTINENT } from '../data/areas'
import type { Point } from '../types'

/** World units: one tile is a 64×32 diamond. Tile (0,0) sits at the top of the map. */
export const HALF_W = 32
export const HALF_H = 16

export const MIN_ZOOM = 0.45
export const MAX_ZOOM = 2.2

export interface Camera {
  /** World point at the center of the screen. */
  x: number
  y: number
  zoom: number
}

/** Top corner of tile (tx, ty). Fractional values land inside the tile. */
export function tileToWorld(tx: number, ty: number): Point {
  return { x: (tx - ty) * HALF_W, y: (tx + ty) * HALF_H }
}

export function tileCenter(tx: number, ty: number, w = 1, h = 1): Point {
  return tileToWorld(tx + w / 2, ty + h / 2)
}

export function worldToTile(wx: number, wy: number): Point {
  return {
    x: Math.floor((wy / HALF_H + wx / HALF_W) / 2),
    y: Math.floor((wy / HALF_H - wx / HALF_W) / 2),
  }
}

export function screenToWorld(cam: Camera, viewW: number, viewH: number, sx: number, sy: number): Point {
  return { x: cam.x + (sx - viewW / 2) / cam.zoom, y: cam.y + (sy - viewH / 2) / cam.zoom }
}

export function worldToScreen(cam: Camera, viewW: number, viewH: number, wx: number, wy: number): Point {
  return { x: (wx - cam.x) * cam.zoom + viewW / 2, y: (wy - cam.y) * cam.zoom + viewH / 2 }
}

/** How far the camera may roam: over the continent, with a little sea showing at its edges. */
const LAND = {
  top: tileToWorld(CONTINENT.x, CONTINENT.y),
  right: tileToWorld(CONTINENT.x + CONTINENT.w, CONTINENT.y),
  bottom: tileToWorld(CONTINENT.x + CONTINENT.w, CONTINENT.y + CONTINENT.h),
  left: tileToWorld(CONTINENT.x, CONTINENT.y + CONTINENT.h),
}
const BOUNDS = {
  minX: LAND.left.x + 260,
  maxX: LAND.right.x - 260,
  minY: LAND.top.y + 140,
  maxY: LAND.bottom.y - 80,
}

/** Keeps the camera over the land. */
export function clampCamera(cam: Camera): Camera {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cam.zoom))
  return {
    zoom,
    x: Math.min(BOUNDS.maxX, Math.max(BOUNDS.minX, cam.x)),
    y: Math.min(BOUNDS.maxY, Math.max(BOUNDS.minY, cam.y)),
  }
}

/** Corners of a w×h footprint: top, right, bottom, left. */
export function footprintCorners(x: number, y: number, w: number, h: number) {
  return {
    top: tileToWorld(x, y),
    right: tileToWorld(x + w, y),
    bottom: tileToWorld(x + w, y + h),
    left: tileToWorld(x, y + h),
  }
}

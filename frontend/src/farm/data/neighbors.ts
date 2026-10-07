import type { Point } from '../types'

/** Other players' cities show up as small villages (size × size tiles each) in the wild land around this one. */
export const NEIGHBOR_SIZE = 6

/** Top corner of each neighbor village, in this city's tile grid — one per wild zone next to the city, nearest the opening view first. */
export const NEIGHBOR_SLOTS: Point[] = [
  { x: 27, y: 19 },
  { x: 15, y: 33 },
  { x: 27, y: 4 },
  { x: 3, y: 33 },
  { x: -9, y: 19 },
  { x: 15, y: -9 },
  { x: 27, y: 33 },
  { x: 3, y: -9 },
]

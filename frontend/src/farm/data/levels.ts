/** XP needed to finish each level (index 0 = level 1 → 2). */
const XP_TO_NEXT = [40, 100, 180, 300, 450, 650, 900, 1200, 1550, 1950, 2400, 2900, 3450, 4050, 4700]

export const MAX_LEVEL = 50

export function xpToNextLevel(level: number): number {
  if (level - 1 < XP_TO_NEXT.length) return XP_TO_NEXT[level - 1]
  const last = XP_TO_NEXT[XP_TO_NEXT.length - 1]
  return last + (level - XP_TO_NEXT.length) * 700
}

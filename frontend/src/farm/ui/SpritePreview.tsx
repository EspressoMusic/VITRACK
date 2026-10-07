import { useEffect, useRef } from 'react'
import { CROPS_BY_ID } from '../data/crops'
import { OBJECTS_BY_ID } from '../data/objects'
import { INK_MAX_WIDTH, INK_THIN, blitInked, inkForSize, renderInked } from '../game/ink'
import { tileCenter } from '../game/iso'
import { drawCrop, drawFieldSoil, drawObjectSprite, spriteBounds } from '../game/sprites'

/** The object's actual in-game art, drawn small with the same ink outline — used in the shop and menus. */
export function SpritePreview({ defId, size = 36, level = 1 }: { defId: string; size?: number; level?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    const def = OBJECTS_BY_ID[defId]
    if (!canvas || !ctx || !def) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const ground = tileCenter(0, 0, def.width, def.height)
    const b = spriteBounds(def.look, def.width, def.height)
    const margin = INK_MAX_WIDTH + 1
    const boxW = b.half * 2 + margin * 2
    const boxH = b.rise + b.below + margin * 2
    const scale = size / Math.max(boxW, boxH)
    const ox = size / 2 - ground.x * scale
    const oy = (size - boxH * scale) / 2 + (b.rise + margin - ground.y) * scale
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy)
    const box = { x: ground.x - b.half, y: ground.y - b.rise, w: b.half * 2, h: b.rise + b.below }
    const weight = def.kind === 'field' ? INK_THIN : inkForSize(b.half * 2, b.rise + b.below)
    const paint = (c: CanvasRenderingContext2D) => {
      if (def.kind === 'field') {
        drawFieldSoil(c, 0, 0)
        drawCrop(c, CROPS_BY_ID.wheat, 4, 0, 0, 0)
      } else {
        drawObjectSprite(c, def.look, 0, 0, def.width, def.height, 0, { level })
      }
    }
    const inked = renderInked(document.createElement('canvas'), dpr * scale, box, paint, weight)
    blitInked(ctx, inked)
  }, [defId, size, level])

  return <canvas ref={ref} style={{ width: size, height: size }} className="shrink-0" aria-hidden />
}

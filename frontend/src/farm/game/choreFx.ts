import { CROPS_BY_ID } from '../data/crops'
import type { Point } from '../types'
import type { Chore } from './chores'
import { tileToWorld } from './iso'
import { OUTLINE, ellipse, fillStroke, hash, poly } from './sprites'

type Ctx = CanvasRenderingContext2D

const PROP_LW = 1.4
const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'

/** What the character holds while tending a field (drawn over it), and a thought bubble on the way there.
 *  `feet` is the character's feet in world units; `t` is seconds. */
export function drawChoreProps(ctx: Ctx, task: { job: Chore; working: boolean }, feet: Point, t: number) {
  const { job, working } = task
  if (!working) {
    const icon = job.kind === 'water' ? '💧' : job.kind === 'plant' ? '🌱' : (CROPS_BY_ID[job.cropId ?? '']?.icon ?? '🧺')
    thoughtBubble(ctx, feet.x + 13, feet.y - 63 + Math.sin(t * 3) * 1.5, icon)
    return
  }
  const field = tileToWorld(job.x + 0.5, job.y + 0.5)
  const dx = field.x - feet.x
  const dy = field.y - feet.y
  const len = Math.hypot(dx, dy) || 1
  const dir = { x: dx / len, y: dy / len }
  // Facing left or right on screen decides which way the props point.
  const side = dir.x >= 0 ? 1 : -1
  if (job.kind === 'water') wateringCan(ctx, feet, field, dir, side, t)
  else if (job.kind === 'plant') sowing(ctx, feet, field, dir, side, t)
  else basket(ctx, { x: feet.x + dir.x * 13 + side * 4, y: feet.y + dir.y * 13 + 2 })
}

function thoughtBubble(ctx: Ctx, x: number, y: number, icon: string) {
  ctx.beginPath()
  ctx.arc(x - 9, y + 13, 2.2, 0, Math.PI * 2)
  fillStroke(ctx, '#fffdf5', OUTLINE, 1.1)
  ctx.beginPath()
  ctx.arc(x - 5, y + 8.5, 3.2, 0, Math.PI * 2)
  fillStroke(ctx, '#fffdf5', OUTLINE, 1.2)
  ctx.beginPath()
  ctx.arc(x, y, 9.5, 0, Math.PI * 2)
  fillStroke(ctx, '#fffdf5', OUTLINE, PROP_LW)
  ctx.font = `11px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(icon, x, y + 0.8)
}

/** A blue can held out toward the field, tipped so a stream of drops patters onto the soil. */
function wateringCan(ctx: Ctx, feet: Point, field: Point, dir: Point, side: number, t: number) {
  const hand = { x: feet.x + dir.x * 14, y: feet.y + dir.y * 14 - 15 }
  const tilt = 0.5 + Math.sin(t * 2.6) * 0.06
  ctx.save()
  ctx.translate(hand.x, hand.y)
  ctx.scale(side, 1)
  ctx.rotate(tilt)
  // Spout (behind the body), then the body, its top band and the handle.
  poly(ctx, [
    { x: 3, y: -1 },
    { x: 13, y: -6.5 },
    { x: 14.5, y: -4.5 },
    { x: 4, y: 3 },
  ])
  fillStroke(ctx, '#3f97c9', OUTLINE, PROP_LW)
  ellipse(ctx, 14.6, -6.2, 2.4, 1.6, -0.5)
  fillStroke(ctx, '#2f7fae', OUTLINE, 1.1)
  ctx.beginPath()
  ctx.roundRect(-7, -5, 12, 10, 2.5)
  fillStroke(ctx, '#5cc0ee', OUTLINE, PROP_LW)
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillRect(-5.2, -3.4, 2, 6.5)
  ctx.beginPath()
  ctx.moveTo(-5.5, -5)
  ctx.quadraticCurveTo(-1, -12.5, 3.5, -5)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 3.4
  ctx.stroke()
  ctx.strokeStyle = '#3f97c9'
  ctx.lineWidth = 1.6
  ctx.stroke()
  ctx.restore()

  // Where the spout tip ended up after the tip and the flip.
  const c = Math.cos(tilt)
  const s = Math.sin(tilt)
  const spout = { x: hand.x + side * (14.6 * c + 6.2 * s), y: hand.y + 14.6 * s - 6.2 * c }
  const drops = 7
  for (let i = 0; i < drops; i++) {
    const u = (t * 1.7 + i / drops) % 1
    const land = { x: field.x + (hash(i, 3) - 0.5) * 22, y: field.y + (hash(i, 7) - 0.5) * 9 }
    const x = spout.x + (land.x - spout.x) * u
    const y = spout.y + (land.y - spout.y) * u * u
    if (u > 0.88) {
      // Splash ring on the soil.
      const k = (u - 0.88) / 0.12
      ctx.globalAlpha = 1 - k
      ellipse(ctx, land.x, land.y, 2 + k * 4, 1 + k * 2)
      ctx.strokeStyle = '#bfe9ff'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.globalAlpha = 1
      continue
    }
    ellipse(ctx, x, y, 1.3, 1.9)
    ctx.fillStyle = '#7fd3ff'
    ctx.fill()
  }
}

/** A little seed pouch tipped over the soil, seeds dropping out onto the field. */
function sowing(ctx: Ctx, feet: Point, field: Point, dir: Point, side: number, t: number) {
  const hand = { x: feet.x + dir.x * 13, y: feet.y + dir.y * 13 - 13 }
  const shake = Math.sin(t * 14) * 0.12
  ctx.save()
  ctx.translate(hand.x, hand.y)
  ctx.scale(side, 1)
  ctx.rotate(0.7 + shake)
  ctx.beginPath()
  ctx.moveTo(-4, -4)
  ctx.quadraticCurveTo(-7, 4, -2, 6)
  ctx.lineTo(4, 6)
  ctx.quadraticCurveTo(8, 3, 4, -4)
  ctx.closePath()
  fillStroke(ctx, '#d9b27c', OUTLINE, PROP_LW)
  ctx.beginPath()
  ctx.roundRect(-5, -6.5, 10, 3, 1.5)
  fillStroke(ctx, '#a8743f', OUTLINE, 1.1)
  ctx.restore()

  const mouth = { x: hand.x + side * 5, y: hand.y + 3 }
  const seeds = 5
  for (let i = 0; i < seeds; i++) {
    const u = (t * 1.3 + i / seeds) % 1
    const land = { x: field.x + (hash(i, 11) - 0.5) * 24, y: field.y + (hash(i, 13) - 0.5) * 10 }
    const x = mouth.x + (land.x - mouth.x) * u
    const y = mouth.y + (land.y - mouth.y) * u * u
    ellipse(ctx, x, y, 1.4, 1.1)
    ctx.fillStyle = u > 0.9 ? '#4a2c14' : '#c99a52'
    ctx.fill()
  }
}

/** A wicker basket set down beside the field while picking. */
function basket(ctx: Ctx, at: Point) {
  const { x, y } = at
  ctx.beginPath()
  ctx.ellipse(x, y + 1, 9, 3.5, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(30,40,10,0.2)'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x - 7, y - 13)
  ctx.quadraticCurveTo(x, y - 25, x + 7, y - 13)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 3.6
  ctx.stroke()
  ctx.strokeStyle = '#b07a3c'
  ctx.lineWidth = 1.8
  ctx.stroke()
  poly(ctx, [
    { x: x - 9, y: y - 12 },
    { x: x + 9, y: y - 12 },
    { x: x + 6.5, y },
    { x: x - 6.5, y },
  ])
  fillStroke(ctx, '#d79a52', OUTLINE, PROP_LW)
  ctx.strokeStyle = '#a8703a'
  ctx.lineWidth = 1
  for (const f of [0.35, 0.68]) {
    ctx.beginPath()
    ctx.moveTo(x - 9 + 2.5 * f + 0.6, y - 12 + 12 * f)
    ctx.lineTo(x + 9 - 2.5 * f - 0.6, y - 12 + 12 * f)
    ctx.stroke()
  }
  ellipse(ctx, x, y - 12, 9, 2.6)
  fillStroke(ctx, '#e7b26a', OUTLINE, PROP_LW)
}

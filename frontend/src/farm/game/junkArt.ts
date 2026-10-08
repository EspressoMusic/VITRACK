import type { JunkShape } from '../data/junkFoods'
import type { Point } from '../types'
import type { GermLook, ShapeArt } from './germs'
import { OUTLINE, ellipse, fillStroke, shade } from './sprites'

/** Junk food art (see data/junkFoods.ts), drawn like the germs: body around (0, 0), about 8 units out each way.
 *  drawGerm (./germs) fills the body in the food's color and does the hopping, squashing and flashing. */

type Ctx = CanvasRenderingContext2D

function line(c: Ctx, width: number, color: string, draw: () => void) {
  c.strokeStyle = color
  c.lineWidth = width
  c.lineCap = 'round'
  c.beginPath()
  draw()
  c.stroke()
}

function shine(c: Ctx, x: number, y: number, rx: number, ry: number) {
  ellipse(c, x, y, rx, ry, -0.5)
  c.fillStyle = 'rgba(255,255,255,0.5)'
  c.fill()
}

const SPRINKLE_COLORS = ['#ffffff', '#7fd6e8', '#ffe066', '#8fd14f', '#b98cff']

/** Little sugar sprinkles: [x, y, angle] each. */
function sprinkles(c: Ctx, list: [number, number, number][]) {
  list.forEach(([x, y, a], i) =>
    line(c, 1.1, SPRINKLE_COLORS[i % SPRINKLE_COLORS.length], () => {
      c.moveTo(x - Math.cos(a) * 1.1, y - Math.sin(a) * 1.1)
      c.lineTo(x + Math.cos(a) * 1.1, y + Math.sin(a) * 1.1)
    }),
  )
}

/** A cheeky face: frowning brows and a toothy grin that opens wide as it throws. */
function cheekyFace(c: Ctx, g: GermLook, x: number, y: number) {
  for (const ex of [-2.7, 2.7]) {
    ellipse(c, x + ex, y, 2, 2.3)
    fillStroke(c, '#ffffff', OUTLINE, 0.9)
    ellipse(c, x + ex + 0.4, y + 0.3, 1, 1.15)
    c.fillStyle = OUTLINE
    c.fill()
  }
  line(c, 1.3, OUTLINE, () => {
    c.moveTo(x - 4.6, y - 3.4)
    c.lineTo(x - 1.2, y - 2.3)
    c.moveTo(x + 4.6, y - 3.4)
    c.lineTo(x + 1.2, y - 2.3)
  })
  const open = g.state === 'attack' && g.timer < 0.35 ? 1.8 : 0
  c.beginPath()
  c.moveTo(x - 2.8, y + 3)
  c.quadraticCurveTo(x, y + 6.2 + open, x + 2.8, y + 3)
  c.closePath()
  fillStroke(c, '#7a1f3d', OUTLINE, 1)
  c.fillStyle = '#ffffff'
  c.fillRect(x - 1.5, y + 3.1, 1.2, 1)
  c.fillRect(x + 0.3, y + 3.1, 1.2, 1)
}

export const JUNK_ART: Record<JunkShape, ShapeArt> = {
  chocolate: {
    // a bar with a bite out of its corner, half out of its wrapper
    body: (c) => {
      c.beginPath()
      c.moveTo(-6.6, -6.2)
      c.quadraticCurveTo(-6.6, -8.8, -4, -8.8)
      c.lineTo(2.6, -8.8)
      c.arc(6.6, -8.8, 4, Math.PI, Math.PI / 2, true)
      c.lineTo(6.6, 6.2)
      c.quadraticCurveTo(6.6, 8.8, 4, 8.8)
      c.lineTo(-4, 8.8)
      c.quadraticCurveTo(-6.6, 8.8, -6.6, 6.2)
      c.closePath()
    },
    front: (c, g) => {
      line(c, 0.9, shade(g.def.color, 0.68), () => {
        c.moveTo(-6.2, -6)
        c.lineTo(3.4, -6)
        c.moveTo(-1.6, -8.5)
        c.lineTo(-1.6, -6)
      })
      shine(c, -4.4, -7.4, 1.3, 0.7)
      // the wrapper: silver foil peeking out over the torn red paper
      const wrapper = (lift: number) => {
        c.beginPath()
        c.moveTo(-7.2, 9.4)
        c.lineTo(-7.2, 4.4 - lift)
        for (let i = 1; i <= 6; i++) c.lineTo(-7.2 + i * 2.4, (i % 2 ? 3 : 4.4) - lift)
        c.lineTo(7.2, 9.4)
        c.closePath()
      }
      wrapper(1.1)
      fillStroke(c, '#dfe5ec', OUTLINE, 1)
      wrapper(0)
      fillStroke(c, '#e8423f', OUTLINE, 1.1)
      c.fillStyle = '#ffcf4a'
      c.fillRect(-6.6, 6.2, 13.2, 1.5)
      cheekyFace(c, g, -0.6, -2)
    },
  },
  cake: {
    // a birthday cake with its candle burning
    back: (c, g, t) => {
      c.beginPath()
      c.roundRect(-1.2, -11.8, 2.4, 7.6, 0.8)
      fillStroke(c, '#7fd6e8', OUTLINE, 1)
      line(c, 0.8, '#ffffff', () => {
        c.moveTo(-1, -9.6)
        c.lineTo(1, -10.6)
        c.moveTo(-1, -7.2)
        c.lineTo(1, -8.2)
      })
      const f = Math.sin(t * 12 + g.phase) * 0.5
      c.beginPath()
      c.moveTo(0, -17.4 - f)
      c.quadraticCurveTo(2.5, -13.6, 0, -12.3)
      c.quadraticCurveTo(-2.5, -13.6, 0, -17.4 - f)
      fillStroke(c, '#ffb547', OUTLINE, 0.9)
      ellipse(c, 0, -13.8, 0.8, 1.2)
      c.fillStyle = '#fff3b0'
      c.fill()
    },
    body: (c) => {
      c.beginPath()
      c.roundRect(-9.4, -5, 18.8, 13.6, 3)
    },
    front: (c, g) => {
      // pink frosting over the top, dripping down the sides
      const dips = [1.4, 3.2, 0.9, 2.6, 1.1, 3]
      c.beginPath()
      c.moveTo(-9.4, -1)
      c.lineTo(-9.4, -2)
      c.quadraticCurveTo(-9.4, -5, -6.4, -5)
      c.lineTo(6.4, -5)
      c.quadraticCurveTo(9.4, -5, 9.4, -2)
      c.lineTo(9.4, -1)
      for (let i = 0; i < dips.length; i++) {
        const x0 = 9.4 - (i * 18.8) / dips.length
        const x1 = 9.4 - ((i + 1) * 18.8) / dips.length
        c.quadraticCurveTo((x0 + x1) / 2, -1 + dips[i] * 1.6, x1, -1)
      }
      c.closePath()
      fillStroke(c, '#ff9fc0', OUTLINE, 1)
      shine(c, -5.8, -3.4, 1.8, 0.7)
      sprinkles(c, [
        [-3.4, -3.6, 0.5],
        [3.6, -3.4, -0.6],
        [6.6, -2.4, 0.9],
        [0.4, -3.9, -0.2],
        [-7, -2, -0.8],
      ])
      // piped cream around the bottom
      for (let x = -7.6; x <= 7.7; x += 3.8) {
        ellipse(c, x, 8.2, 1.7, 1.2)
        fillStroke(c, '#fff6ea', OUTLINE, 0.8)
      }
      shine(c, -7, 2.4, 0.7, 1.6)
      cheekyFace(c, g, 0, 1.6)
    },
  },
  donut: {
    body: (c) => ellipse(c, 0, 0.4, 8.8, 7.8),
    front: (c, g) => {
      // pink glaze, a little drippy
      c.beginPath()
      for (let i = 0; i <= 36; i++) {
        const a = (i / 36) * Math.PI * 2
        const drip = Math.max(0, Math.sin(a)) * Math.max(0, Math.cos(a * 4 + 0.6)) ** 4 * 1.8
        const r = 6.9 + Math.sin(a * 6) * 0.35
        const x = Math.cos(a) * r * 1.02
        const y = -0.2 + Math.sin(a) * r * 0.86 + drip
        if (i) c.lineTo(x, y)
        else c.moveTo(x, y)
      }
      c.closePath()
      fillStroke(c, '#ff8fb8', OUTLINE, 1)
      ellipse(c, 0, -4.2, 2.4, 1.4)
      fillStroke(c, shade(g.def.color, 0.75), OUTLINE, 1)
      shine(c, -4.8, -3.4, 1.5, 0.8)
      sprinkles(c, [
        [-5.8, -1.6, 0.6],
        [5.6, -1.8, -0.5],
        [-3.6, -5.2, -0.3],
        [3.6, -5.3, 0.9],
        [-6.2, 2.6, 1.2],
        [6.1, 2.2, -0.9],
      ])
      cheekyFace(c, g, 0, 1.2)
    },
  },
}

/** The bit a junk food throws (about 6 units across), centered on `p` and turned by `angle`. */
export function drawTreat(c: Ctx, shape: JunkShape, p: Point, angle: number) {
  c.save()
  c.translate(p.x, p.y)
  c.rotate(angle)
  switch (shape) {
    case 'chocolate':
      c.beginPath()
      c.roundRect(-3, -3, 6, 6, 1.2)
      fillStroke(c, '#6b3f26', OUTLINE, 1)
      c.beginPath()
      c.roundRect(-1.7, -1.7, 3.4, 3.4, 0.7)
      c.strokeStyle = '#4a2a17'
      c.lineWidth = 0.7
      c.stroke()
      shine(c, -1.6, -1.8, 0.9, 0.5)
      break
    case 'cake':
      // a dollop of cream with a cherry
      c.beginPath()
      for (const [x, y, r] of [
        [-1.8, 0.8, 2.3],
        [1.8, 0.8, 2.3],
        [0, -0.8, 2.6],
      ]) {
        c.moveTo(x + r, y)
        c.arc(x, y, r, 0, Math.PI * 2)
      }
      c.strokeStyle = OUTLINE
      c.lineWidth = 2
      c.stroke()
      c.fillStyle = '#fff6ea'
      c.fill()
      ellipse(c, 0.6, -2.8, 1.3, 1.3)
      fillStroke(c, '#e8232f', OUTLINE, 0.7)
      break
    case 'donut':
      ellipse(c, 0, 0, 3.6, 3)
      fillStroke(c, '#ff8fb8', OUTLINE, 1)
      ellipse(c, 0, 0, 1.2, 0.9)
      fillStroke(c, '#c98a4a', OUTLINE, 0.7)
      break
  }
  c.restore()
}

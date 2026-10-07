import { THROW_RELEASE, buildTomatoBuddy } from '../../avatar/model'
import { AvatarSprite } from '../../avatar/sprite'
import { GATE_BUDDY } from '../data/city'
import { objectLevel } from '../systems/BuildingSystem'
import { findGate } from '../systems/DefenseSystem'
import type { GameState, Point } from '../types'
import { THROW_MS } from './avatarWalker'
import { gateArchHeight } from './citySprites'
import type { GermDrawable, GermSwarm } from './germs'
import { boxAround } from './ink'
import { tileToWorld } from './iso'
import { up } from './sprites'
import type { VeggieThrows } from './veggieThrow'

/** The food friend standing on top of the gate (see GATE_BUDDY): a 3D character drawn and posed just like the
 *  player's own, throwing its food at germs on the road. */

type Ctx = CanvasRenderingContext2D

/** Farm world units per model unit: a bit smaller than the player's character, so it fits on the gate. */
const SCALE = 17
/** Where it stands on top of the gate, from the gate's corner (tiles): a little left of the middle, clear of the right tower. */
const SPOT = { x: 1.2, y: 0.6 }
/** Model yaw facing the viewer — out of the city, toward the germs' road. */
const FACE_OUT = Math.PI / 4
/** How high above the feet the tomato leaves the hand, in model units. */
const HAND_RISE = 1.05
/** How long it keeps looking where it threw before turning back out. */
const LOOK_MS = 1500

export class GateBuddy {
  private sprite = new AvatarSprite(buildTomatoBuddy)
  /** Its feet in world units (on top of the gate); null without a gate. */
  private feet: Point | null = null
  private depth = 0
  private yaw = FACE_OUT
  private targetYaw = FACE_OUT
  private throwAt = -Infinity
  private nextAt = 0
  private last = 0

  /** Throws a tomato at the germ closest to the gate whenever it's ready and one is in reach. */
  update(state: GameState, germs: GermSwarm, throws: VeggieThrows, now: number) {
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0
    this.last = now
    const gate = findGate(state)
    if (!gate) {
      this.feet = null
      return
    }
    const spot = { x: gate.x + SPOT.x, y: gate.y + SPOT.y }
    const feet = (this.feet = up(tileToWorld(spot.x, spot.y), gateArchHeight(objectLevel(gate))))
    // Just in front of the gate itself (a 3×1 object, see the renderer's depthOf).
    this.depth = gate.x + gate.y + 2.05

    if (now >= this.nextAt) {
      const target = germs.aimAt(spot, GATE_BUDDY.range)
      if (target) {
        this.throwAt = now
        this.nextAt = now + GATE_BUDDY.reload * 1000
        this.targetYaw = this.yaw = Math.atan2(target.x - spot.x, target.y - spot.y)
        const hand = { x: feet.x, y: feet.y - HAND_RISE * SCALE }
        throws.launch('tomato', hand, target, germs, now + THROW_MS * THROW_RELEASE, GATE_BUDDY.power)
      } else {
        this.nextAt = now + 300
      }
    }
    if (now - this.throwAt > LOOK_MS) this.targetYaw = FACE_OUT
    const turn = Math.atan2(Math.sin(this.targetYaw - this.yaw), Math.cos(this.targetYaw - this.yaw))
    this.yaw += turn * Math.min(1, dt * 8)
  }

  drawables(now: number): GermDrawable[] {
    const feet = this.feet
    if (!feet) return []
    const pose = { t: now / 1000, throw: (now - this.throwAt) / THROW_MS }
    return [
      {
        depth: this.depth,
        at: feet,
        box: boxAround(feet.x, feet.y, 16, 28, 4),
        alpha: 1,
        // The sprite brings its own ink outline.
        noInk: true,
        draw: (c: Ctx) => {
          c.beginPath()
          c.ellipse(feet.x, feet.y, 9, 4, 0, 0, Math.PI * 2)
          c.fillStyle = 'rgba(30,40,10,0.22)'
          c.fill()
          this.sprite.draw(c, feet.x, feet.y, this.yaw, pose, SCALE)
        },
      },
    ]
  }

  dispose() {
    this.sprite.dispose()
  }
}

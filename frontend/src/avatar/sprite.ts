import { DirectionalLight, HemisphereLight, OrthographicCamera, Scene, WebGLRenderer } from 'three'
import { type AvatarLook, getAvatarLook, subscribeAvatarLook } from './look'
import { type AvatarPose, type AvatarRig, buildAvatar, poseAvatar } from './model'

/** Sprite pixels per model unit. */
const PPU = 100
/** Wide enough for the round heroes seen corner-on, plus their outline. */
const W = 320
const H = 330
/** Where the feet land in the sprite — leaves room above for bunny ears. */
const FOOT_X = W / 2
const FOOT_Y = 270
/** Outline thickness in sprite pixels, to match the farm's inked art. */
const OUTLINE_PX = 8
const OUTLINE_COLOR = '#2b1d0e'
const OUTLINE_STEPS = 16

/**
 * Renders the 3D character offscreen from the farm's isometric angle (30° elevation, 45° turn),
 * so a model yaw of atan2(dx, dy) faces along tile direction (dx, dy). The result gets an ink
 * outline so it sits with the hand-drawn farm sprites.
 */
export class AvatarSprite {
  private gl: WebGLRenderer | null = null
  private scene = new Scene()
  private camera = new OrthographicCamera(-FOOT_X / PPU, (W - FOOT_X) / PPU, FOOT_Y / PPU, -(H - FOOT_Y) / PPU, 0.1, 40)
  private rig: AvatarRig
  private offLook: () => void
  private silhouette = document.createElement('canvas')
  private out = document.createElement('canvas')

  /** With a `look`, draws that character (e.g. another player's) instead of following the player's own outfit;
   *  with a builder, draws the rig it makes (e.g. a food buddy). */
  constructor(look?: AvatarLook | (() => AvatarRig)) {
    try {
      const canvas = document.createElement('canvas')
      this.gl = new WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true })
      this.gl.setPixelRatio(1)
      this.gl.setSize(W, H, false)
      this.gl.setClearColor(0x000000, 0)
    } catch {
      this.gl = null
    }
    this.silhouette.width = this.out.width = W
    this.silhouette.height = this.out.height = H

    this.scene.add(new HemisphereLight('#fff6e8', '#7a6a4a', 2.1))
    // Farm art is lit from the left.
    const key = new DirectionalLight('#ffffff', 2.3)
    key.position.set(-1.5, 4.5, 4.8)
    this.scene.add(key)

    const d = 12
    this.camera.position.set(d * Math.cos(Math.PI / 6) * Math.SQRT1_2, d * 0.5, d * Math.cos(Math.PI / 6) * Math.SQRT1_2)
    this.camera.lookAt(0, 0, 0)

    this.rig = typeof look === 'function' ? look() : buildAvatar(look ?? getAvatarLook())
    this.scene.add(this.rig.root)
    this.offLook = look ? () => {} : subscribeAvatarLook(() => {
      this.scene.remove(this.rig.root)
      this.rig.dispose()
      this.rig = buildAvatar(getAvatarLook())
      this.scene.add(this.rig.root)
    })
  }

  /**
   * Draws the character with its feet at world point (x, y). `worldPerUnit` sets how many farm
   * world units one model unit spans.
   */
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, yaw: number, pose: AvatarPose, worldPerUnit: number) {
    if (!this.gl) return
    this.rig.root.rotation.y = yaw
    poseAvatar(this.rig, pose)
    this.gl.render(this.scene, this.camera)
    const src = this.gl.domElement

    const sil = this.silhouette.getContext('2d')!
    sil.globalCompositeOperation = 'copy'
    sil.drawImage(src, 0, 0)
    sil.globalCompositeOperation = 'source-in'
    sil.fillStyle = OUTLINE_COLOR
    sil.fillRect(0, 0, W, H)

    const out = this.out.getContext('2d')!
    out.clearRect(0, 0, W, H)
    for (let i = 0; i < OUTLINE_STEPS; i++) {
      const a = (i / OUTLINE_STEPS) * Math.PI * 2
      out.drawImage(this.silhouette, Math.cos(a) * OUTLINE_PX, Math.sin(a) * OUTLINE_PX)
    }
    out.drawImage(src, 0, 0)

    const s = worldPerUnit / PPU
    ctx.drawImage(this.out, x - FOOT_X * s, y - FOOT_Y * s, W * s, H * s)
  }

  dispose() {
    this.offLook()
    this.rig.dispose()
    this.gl?.dispose()
    this.gl?.forceContextLoss()
    this.gl = null
  }
}

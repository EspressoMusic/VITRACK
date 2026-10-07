import {
  type BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  FrontSide,
  Group,
  LatheGeometry,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  type Object3D,
  Shape,
  SphereGeometry,
  type Texture,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three'
import { heroTemplate, loadHero } from './hero'
import { type AvatarLook, type HeroKind, isHero } from './look'

/**
 * The player's chibi animal (bunny, kitten, puppy or bear), built from primitives so every piece of
 * clothing is just a different mesh or color. Units: the character stands on y=0 and is about 2.2
 * tall (bunny ears reach ≈2.55), facing +Z. Toy proportions: the head is over half the height, the
 * body a short bean on stubby legs.
 */

const DEG = Math.PI / 180
const HIP_Y = 0.46
/** Head pivot on the chest, and the head center above it. */
const NECK_Y = 0.5
const HEAD_Y = 0.48
/** Ears, hats and face are modeled on a 0.5 head and scaled up as one. */
const HEAD_SCALE = 1.14
const ARM_REST = 0.22
const Y_AXIS = new Vector3(0, 1, 0)
const Z_AXIS = new Vector3(0, 0, 1)

export interface AvatarRig {
  root: Group
  body: Group
  head: Group
  armL: Group
  armR: Group
  legL: Group
  legR: Group
  /** Squashed vertically to blink. */
  eyes: Object3D[]
  /** Ear groups that flick; `userData.side` is ±1. */
  ears: Object3D[]
  /** Swings side to side at `wagSpeed` radians per second. */
  tail: Object3D
  wagSpeed: number
  /** The vegetable in the right paw; hidden while one is in flight. */
  held: Object3D
  /** Only on the solid heroes, which have no limbs to move: stretched and squashed to breathe and bounce. */
  squash?: Object3D
  dispose(): void
}

export interface AvatarPose {
  /** Seconds — drives breathing, blinking and idle sway. */
  t: number
  /** 0..1 blend from idle into the walk cycle. */
  walk?: number
  walkPhase?: number
  /** 0..1 progress of a wave; omitted or ≥1 when not waving. */
  wave?: number
  /** 0..1 progress of a little hop; omitted or ≥1 when not hopping. */
  hop?: number
  /** 0..1 progress of throwing the held vegetable; it leaves the paw at THROW_RELEASE. */
  throw?: number
  /** 0..1 blend into tending a field: leaning over the soil with both paws working (the vegetable put away). */
  work?: number
}

/** Point in a throw (0..1) where the vegetable leaves the paw. */
export const THROW_RELEASE = 0.3

/** `fur` makes a soft plush material with a velvety sheen at the edges. */
type MatOpts = { rough?: number; metal?: number; basic?: boolean; opacity?: number; double?: boolean; fur?: boolean }

/** f < 1 darkens, f > 1 lightens toward white. */
function tint(hex: string, f: number): string {
  const c = new Color(hex)
  if (f < 1) c.multiplyScalar(f)
  else c.lerp(new Color('#ffffff'), Math.min(1, f - 1))
  return `#${c.getHexString()}`
}

function isLight(hex: string): boolean {
  const c = new Color(hex)
  return c.r * 0.3 + c.g * 0.59 + c.b * 0.11 > 0.6
}

/** Owns every material and geometry of one build, so swapping outfits never leaks GPU memory. */
class Parts {
  private mats = new Map<string, Material>()
  private geos = new Map<string, BufferGeometry>()
  private texs: Texture[] = []
  private grain: Texture | null = null

  /** Soft speckled grain shared by every fur material as a bump map, so fur reads as plush fabric. */
  private furGrain(): Texture {
    if (!this.grain) {
      const size = 64
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')!
      const img = ctx.createImageData(size, size)
      // Seeded, so every rebuild of the character has the same grain.
      let seed = 7
      for (let i = 0; i < size * size; i++) {
        seed = (seed * 16807) % 2147483647
        const v = 96 + (seed % 64)
        img.data.set([v, v, v, 255], i * 4)
      }
      ctx.putImageData(img, 0, 0)
      this.grain = new CanvasTexture(canvas)
      this.grain.wrapS = this.grain.wrapT = RepeatWrapping
      this.grain.repeat.set(10, 5)
      this.texs.push(this.grain)
    }
    return this.grain
  }

  geo<T extends BufferGeometry>(key: string, make: () => T): T {
    let g = this.geos.get(key)
    if (!g) {
      g = make()
      this.geos.set(key, g)
    }
    return g as T
  }

  mat(color: string, o: MatOpts = {}): Material {
    const key = `${color}|${o.rough}|${o.metal}|${o.basic}|${o.opacity}|${o.double}|${o.fur}`
    let m = this.mats.get(key)
    if (!m) {
      const common = {
        color,
        side: o.double ? DoubleSide : FrontSide,
        transparent: o.opacity !== undefined,
        opacity: o.opacity ?? 1,
        depthWrite: o.opacity === undefined,
      }
      m = o.basic
        ? new MeshBasicMaterial(common)
        : o.fur
          ? new MeshPhysicalMaterial({
              ...common,
              roughness: 0.9,
              sheen: 1,
              sheenRoughness: 0.45,
              sheenColor: tint(color, 1.5),
              bumpMap: this.furGrain(),
              bumpScale: 1.2,
            })
          : new MeshStandardMaterial({ ...common, roughness: o.rough ?? 0.74, metalness: o.metal ?? 0 })
      this.mats.set(key, m)
    }
    return m
  }

  mesh(geo: BufferGeometry, color: string, o?: MatOpts): Mesh {
    return new Mesh(geo, this.mat(color, o))
  }

  /** Unit sphere scaled into an ellipsoid. */
  ball(color: string, sx: number, sy = sx, sz = sx, o?: MatOpts): Mesh {
    const m = this.mesh(this.geo('ball', () => new SphereGeometry(1, 32, 24)), color, o)
    m.scale.set(sx, sy, sz)
    return m
  }

  capsule(color: string, r: number, len: number, o?: MatOpts): Mesh {
    return this.mesh(this.geo(`cap${r}|${len}`, () => new CapsuleGeometry(r, len, 8, 18)), color, o)
  }

  /** A soft pink cheek: a flat oval fading out at the edges, facing +Z. */
  blush(w: number, h: number): Mesh {
    let m = this.mats.get('blush')
    if (!m) {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 64
      const ctx = canvas.getContext('2d')!
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      g.addColorStop(0, 'rgba(255,120,150,0.75)')
      g.addColorStop(0.55, 'rgba(255,135,160,0.45)')
      g.addColorStop(1, 'rgba(255,150,170,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 64, 64)
      const map = new CanvasTexture(canvas)
      this.texs.push(map)
      m = new MeshBasicMaterial({ map, transparent: true, depthWrite: false })
      this.mats.set('blush', m)
    }
    const mesh = new Mesh(this.geo('disc', () => new CircleGeometry(1, 28)), m)
    mesh.scale.set(w, h, 1)
    return mesh
  }

  dispose() {
    this.mats.forEach((m) => m.dispose())
    this.geos.forEach((g) => g.dispose())
    this.texs.forEach((t) => t.dispose())
  }
}

function at<T extends Object3D>(obj: T, x: number, y: number, z: number): T {
  obj.position.set(x, y, z)
  return obj
}

function rot<T extends Object3D>(obj: T, x: number, y: number, z: number): T {
  obj.rotation.set(x, y, z)
  return obj
}

/** Unit direction from the head center: polar from straight up, azimuth from the face (+Z) toward +X. */
function headDir(polarDeg: number, azDeg: number): Vector3 {
  const p = polarDeg * DEG
  const a = azDeg * DEG
  return new Vector3(Math.sin(p) * Math.sin(a), Math.cos(p), Math.sin(p) * Math.cos(a))
}

/** Places obj on the head surface with its local `axis` pointing outward. */
function onHead<T extends Object3D>(obj: T, polar: number, az: number, r: number, axis = Z_AXIS): T {
  const dir = headDir(polar, az)
  obj.position.copy(dir).multiplyScalar(r)
  obj.quaternion.setFromUnitVectors(axis, dir)
  return obj
}

/** Stretches a Y-aligned capsule between two points. */
function between(obj: Object3D, from: Vector3, to: Vector3): Object3D {
  obj.position.copy(from).add(to).multiplyScalar(0.5)
  obj.quaternion.setFromUnitVectors(Y_AXIS, to.clone().sub(from).normalize())
  return obj
}

// ---------- outfits ----------

type Top = 'none' | 'tee' | 'hoodie' | 'jacket' | 'tank'
type Bottom = 'none' | 'pants' | 'shorts'

/** A look resolved into the pieces the builder draws: every outfit, hat and shoe has its own fixed colors. */
interface Dress {
  animal: AvatarLook['animal']
  fur: string
  eyes: string
  top: Top
  topColor: string
  bottom: Bottom
  bottomColor: string
  /** Superhero cape color, or null for none. */
  cape: string | null
  shoes: AvatarLook['shoes']
  shoeColor: string
  hat: AvatarLook['hat']
  hatColor: string
  veggie: AvatarLook['veggie']
}

type OutfitPieces = Pick<Dress, 'top' | 'topColor' | 'bottom' | 'bottomColor' | 'cape'>
const BARE: OutfitPieces = { top: 'none', topColor: '', bottom: 'none', bottomColor: '', cape: null }
const OUTFITS: Record<AvatarLook['outfit'], OutfitPieces> = {
  none: BARE,
  cape: { ...BARE, cape: '#e8463c' },
  hoodie: { top: 'hoodie', topColor: '#5b8fe0', bottom: 'pants', bottomColor: '#3a3a4a', cape: null },
  sport: { top: 'tee', topColor: '#f05a4a', bottom: 'shorts', bottomColor: '#2f4f8f', cape: null },
  raincoat: { ...BARE, top: 'jacket', topColor: '#f7cf3c' },
  summer: { top: 'tank', topColor: '#4fb3a9', bottom: 'shorts', bottomColor: '#e8c27a', cape: null },
}
const SHOE_COLOR: Record<AvatarLook['shoes'], string> = { none: '', sneakers: '#f05a4a', boots: '#f7cf3c' }
const HAT_COLOR: Record<AvatarLook['hat'], string> = { none: '', straw: '#e8604c', cap: '#5b8fe0', beanie: '#f28cb8', crown: '#e8463c', flower: '#f28cb8' }
const EYE_COLOR: Record<AvatarLook['animal'], string> = { bunny: '#3a2216', kitten: '#3c8c4a', puppy: '#3a2216', bear: '#5a3a22', cucumber: '#3a2216', onion: '#3a2216', panda: '#3a2216', bellpepper: '#3a2216', agent: '#3a2216' }

function dress(look: AvatarLook): Dress {
  return {
    animal: look.animal,
    fur: look.fur,
    eyes: EYE_COLOR[look.animal],
    ...OUTFITS[look.outfit],
    shoes: look.shoes,
    shoeColor: SHOE_COLOR[look.shoes],
    hat: look.hat,
    hatColor: HAT_COLOR[look.hat],
    veggie: look.veggie,
  }
}

// ---------- head ----------

const HEAD_A = 0.52
const HEAD_B = 0.46
const HEAD_C = 0.48
const PINK = '#ffb3c6'
const FUR: MatOpts = { fur: true }

/** Paler fur for muzzles, bellies and pompom tails; very light fur just goes white. */
function paleFur(fur: string): string {
  return tint(fur, isLight(fur) ? 1.7 : 1.45)
}

/** Fur markings (stripes, ear backs): a shade darker, or lighter on very dark fur. */
function markFur(fur: string): string {
  return new Color(fur).getHSL({ h: 0, s: 0, l: 0 }).l < 0.3 ? tint(fur, 1.3) : tint(fur, 0.78)
}

/**
 * Places obj on the front (or with `back`, the back) of the head ellipsoid at (x, y), its local Z
 * along the surface normal.
 */
function onFace<T extends Object3D>(obj: T, x: number, y: number, lift = 0, back = false): T {
  const z = (back ? -1 : 1) * HEAD_C * Math.sqrt(Math.max(0, 1 - (x / HEAD_A) ** 2 - (y / HEAD_B) ** 2))
  const n = new Vector3(x / HEAD_A ** 2, y / HEAD_B ** 2, z / HEAD_C ** 2).normalize()
  obj.position.set(x, y, z).addScaledVector(n, lift)
  obj.quaternion.setFromUnitVectors(Z_AXIS, n)
  return obj
}

/** A soft rounded triangle, point down, about 1 unit wide — the nose. */
function noseGeometry(): BufferGeometry {
  const shape = new Shape()
  shape.moveTo(-0.5, 0.22)
  shape.quadraticCurveTo(0, 0.4, 0.5, 0.22)
  shape.quadraticCurveTo(0.56, 0.08, 0.12, -0.3)
  shape.quadraticCurveTo(0, -0.4, -0.12, -0.3)
  shape.quadraticCurveTo(-0.56, 0.08, -0.5, 0.22)
  const g = new ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.12, bevelSegments: 5, curveSegments: 12 })
  g.center()
  return g
}

/** A brighter, more saturated take on the eye color for the glow at the bottom of the iris. */
function irisGlow(color: string): string {
  const hsl = new Color(color).getHSL({ h: 0, s: 0, l: 0 })
  return `#${new Color().setHSL(hsl.h, Math.max(hsl.s, 0.55), 0.6).getHexString()}`
}

/**
 * Big kawaii eye on the side `s` (±1): dark rim, colored iris with a glowing lower crescent, pupil,
 * sparkles (lit from the upper right on both eyes), an eyeliner arc and two lashes at the outer corner.
 */
function buildEye(P: Parts, color: string, s: number): Group {
  const eye = new Group()
  const gloss = { rough: 0.12 }
  const ink = '#24150f'
  eye.add(P.ball(tint(color, 0.4), 0.08, 0.104, 0.03, gloss))
  eye.add(at(P.ball(color, 0.066, 0.088, 0.03, gloss), 0, -0.008, 0.003))
  eye.add(at(P.ball('#140b08', 0.042, 0.058, 0.03, gloss), 0, 0.008, 0.006))
  eye.add(at(P.ball(irisGlow(color), 0.03, 0.013, 0.02, { basic: true, opacity: 0.55 }), 0, -0.07, 0.016))
  eye.add(at(P.ball('#ffffff', 0.03, 0.03, 0.01, { basic: true }), 0.026, 0.04, 0.03))
  eye.add(at(P.ball('#ffffff', 0.014, 0.014, 0.006, { basic: true }), -0.028, -0.034, 0.031))
  eye.add(at(P.ball('#ffffff', 0.007, 0.007, 0.004, { basic: true }), 0.046, -0.006, 0.031))

  // Eyeliner hugging the top edge, running a little longer toward the outer corner, with two lashes there.
  const liner = P.mesh(P.geo('liner', () => new TorusGeometry(1, 0.13, 6, 28, 0.72 * Math.PI)), ink)
  liner.scale.set(0.079, 0.102, 0.1)
  liner.rotation.z = s > 0 ? 0.1 * Math.PI : 0.18 * Math.PI
  eye.add(at(liner, 0, 0, 0.016))
  const lashes: [Vector3, Vector3][] = [
    [new Vector3(s * 0.065, 0.058, 0.014), new Vector3(s * 0.087, 0.082, 0.004)],
    [new Vector3(s * 0.076, 0.024, 0.014), new Vector3(s * 0.104, 0.033, 0.004)],
  ]
  for (const [base, tip] of lashes) eye.add(between(P.capsule(ink, 0.0085, base.distanceTo(tip) - 0.006), base, tip))
  return eye
}

/**
 * Toy animal face: a soft mochi head, big sparkly eyes set low, gradient blush, a little nose over
 * an ω mouth, plus each animal's own touches (whiskers and stripes, a muzzle, a tongue).
 */
function buildFace(P: Parts, look: Dress, center: Group, eyes: Object3D[], bareHead: boolean) {
  const fur = look.fur
  // Puppies and bears get a pale muzzle that the nose and mouth sit on.
  const snout = look.animal === 'puppy' || look.animal === 'bear'
  center.add(P.ball(fur, HEAD_A, HEAD_B, HEAD_C, FUR))

  if (look.animal === 'puppy') {
    // A darker patch around one eye and pale dot eyebrows.
    center.add(onFace(P.ball(markFur(fur), 0.135, 0.15, 0.02, FUR), 0.2, -0.04, -0.004))
    for (const s of [1, -1]) center.add(onFace(P.ball(paleFur(fur), 0.042, 0.028, 0.012, FUR), s * 0.165, 0.115, 0.002))
  }

  for (const s of [1, -1]) {
    const eye = onFace(buildEye(P, look.eyes, s), s * 0.19, -0.06)
    center.add(eye)
    eyes.push(eye)
    center.add(onFace(P.blush(0.1, 0.065), s * 0.32, -0.2, 0.012))
  }

  if (snout) center.add(onFace(P.ball(paleFur(fur), 0.17, 0.12, 0.09, FUR), 0, -0.2, -0.025))
  const lift = snout ? 0.058 : 0.004
  const nose = P.mesh(P.geo('nose', noseGeometry), snout ? '#3a2420' : '#ff86a2', { rough: 0.25 })
  nose.scale.setScalar(snout ? 0.1 : 0.07)
  center.add(onFace(nose, 0, snout ? -0.15 : -0.145, lift + 0.008))
  center.add(onFace(P.ball('#ffffff', 0.012, 0.008, 0.004, { basic: true, opacity: 0.85 }), -0.012, snout ? -0.138 : -0.138, lift + 0.022))

  // ω mouth hanging from a short line under the nose.
  const mouthY = snout ? -0.225 : -0.2
  const ink = '#5a2a22'
  const arc = P.geo('mouthArc', () => new TorusGeometry(0.024, 0.008, 8, 16, Math.PI))
  for (const s of [1, -1]) {
    const half = onFace(new Group(), s * 0.024, mouthY, lift)
    half.add(rot(P.mesh(arc, ink), 0, 0, Math.PI))
    center.add(half)
  }
  center.add(onFace(P.capsule(ink, 0.007, 0.02), 0, mouthY + 0.016, lift))
  if (look.animal === 'puppy') center.add(onFace(P.ball('#ff7d96', 0.028, 0.032, 0.014, { rough: 0.4 }), 0.016, mouthY - 0.034, lift - 0.004))
  if (look.animal === 'bunny') {
    // Two little buck teeth peeking under the mouth.
    const tooth = P.geo('tooth', () => new CapsuleGeometry(0.009, 0.012, 4, 10))
    for (const s of [1, -1]) center.add(onFace(P.mesh(tooth, '#ffffff', { rough: 0.3 }), s * 0.0115, mouthY - 0.033, lift + 0.002))
  }

  if (look.animal === 'kitten') {
    const whisker = isLight(fur) ? tint(fur, 0.55) : tint(fur, 1.6)
    for (const s of [1, -1]) {
      const whiskers = onFace(new Group(), s * 0.36, -0.15, 0.008)
      for (const k of [-1, 0, 1]) {
        whiskers.add(between(P.capsule(whisker, 0.006, 0.11), new Vector3(0, k * 0.02, 0), new Vector3(s * 0.12, k * 0.05, -0.02)))
      }
      center.add(whiskers)
    }
    // Tabby stripes on the forehead and around the back of the head.
    if (bareHead) {
      for (const [x, y, len] of [[0, 0.3, 0.07], [-0.075, 0.28, 0.05], [0.075, 0.28, 0.05]]) {
        const stripe = onFace(P.capsule(markFur(fur), 0.018, len, FUR), x, y, -0.006)
        stripe.scale.z = 0.5
        center.add(stripe)
      }
    }
    for (const [y, w] of [[0.24, 0.12], [0.1, 0.16], [-0.04, 0.17], [-0.18, 0.14]]) {
      center.add(onFace(P.ball(markFur(fur), w, 0.026, 0.012, FUR), 0, y, -0.002, true))
    }
    // Fluffy cheek tufts.
    const tuft = P.geo('tuft', () => new LatheGeometry(TUFT.map(([r, y]) => new Vector2(r, y)), 18))
    for (const s of [1, -1]) {
      for (const [polar, az, k] of [[104, 76, 1], [118, 70, 0.8]]) {
        const fluff = P.mesh(tuft, fur, FUR)
        fluff.scale.set(0.07 * k, 0.17 * k, 0.07 * k)
        const dir = headDir(polar, s * az)
        fluff.position.copy(dir).multiplyScalar(0.42)
        fluff.quaternion.setFromUnitVectors(Y_AXIS, headDir(polar + 12, s * (az + 14)))
        center.add(fluff)
      }
    }
  }

  // A soft fluff of fur between the bunny's ears, hidden under hats.
  if (bareHead && look.animal === 'bunny') {
    const tuft = P.geo('tuft', () => new LatheGeometry(TUFT.map(([r, y]) => new Vector2(r, y)), 18))
    for (const [polar, az, k] of [[12, 0, 1], [20, 28, 0.75], [20, -28, 0.75]]) {
      const fluff = P.mesh(tuft, fur, FUR)
      fluff.scale.set(0.08 * k, 0.12 * k, 0.08 * k)
      fluff.position.copy(headDir(polar, az)).multiplyScalar(0.42)
      fluff.quaternion.setFromUnitVectors(Y_AXIS, headDir(polar + 40, az))
      center.add(fluff)
    }
  }
}

/** A soft teardrop, round at the base and tapering to a gentle point; unit radius and height. */
const TUFT = [[0, 0], [0.6, 0.03], [0.95, 0.12], [1, 0.22], [0.82, 0.42], [0.55, 0.62], [0.28, 0.8], [0.08, 0.95], [0, 1]]

/** How far ears move out from the head to poke through each hat that covers the crown. */
const EAR_LIFT: Partial<Record<AvatarLook['hat'], number>> = { straw: 0.24, cap: 0.1, beanie: 0.16 }

/**
 * The animal's ears. Each ear's inner group goes in `ears` (tagged with its side) so the pose can
 * flick it. Under a hat that covers the crown they sit higher, poking out through it.
 */
function buildEars(P: Parts, look: Dress, center: Group, ears: Object3D[]) {
  const fur = look.fur
  const hatLift = EAR_LIFT[look.hat] ?? 0
  for (const s of [1, -1]) {
    const mount = new Group()
    const flick = new Group()
    flick.userData.side = s
    mount.add(flick)
    switch (look.animal) {
      case 'bunny': {
        // Two segments, so one ear can flop over at the middle.
        // Long enough to clear any hat with just a nudge.
        mount.position.copy(headDir(24, s * 40)).multiplyScalar(0.42 + hatLift * 0.4)
        mount.rotation.set(-0.15, 0, -s * 0.22)
        flick.add(at(P.ball(fur, 0.115, 0.17, 0.07, FUR), 0, 0.15, 0))
        flick.add(at(P.ball(PINK, 0.065, 0.13, 0.03), 0, 0.16, 0.045))
        flick.add(at(P.ball('#ff9cb6', 0.032, 0.09, 0.02), 0, 0.14, 0.06))
        const tip = at(new Group(), 0, 0.29, 0)
        if (s < 0) tip.rotation.set(0.35, 0, -s * 0.85)
        tip.add(at(P.ball(fur, 0.108, 0.17, 0.066, FUR), 0, 0.12, 0))
        tip.add(at(P.ball(PINK, 0.06, 0.13, 0.03), 0, 0.1, 0.042))
        tip.add(at(P.ball('#ff9cb6', 0.03, 0.09, 0.02), 0, 0.08, 0.056))
        flick.add(tip)
        break
      }
      case 'kitten': {
        const dir = headDir(36, s * 46)
        mount.position.copy(dir).multiplyScalar(0.42 + hatLift)
        mount.quaternion.setFromUnitVectors(Y_AXIS, dir)
        const tuft = P.geo('tuft', () => new LatheGeometry(TUFT.map(([r, y]) => new Vector2(r, y)), 18))
        const outer = P.mesh(tuft, fur, FUR)
        outer.scale.set(0.19, 0.34, 0.11)
        const inner = at(P.mesh(tuft, PINK), 0, 0.03, 0.07)
        inner.scale.set(0.11, 0.24, 0.05)
        flick.add(outer, inner)
        break
      }
      case 'bear': {
        // Short round ears need a bigger push to clear a hat.
        mount.position.copy(headDir(32, s * 52)).multiplyScalar(0.46 + (hatLift && hatLift + 0.07))
        flick.add(P.ball(fur, 0.15, 0.14, 0.08, FUR))
        flick.add(at(P.ball(isLight(fur) ? PINK : paleFur(fur), 0.085, 0.08, 0.03), 0, -0.01, 0.06))
        break
      }
      case 'puppy': {
        // Floppy ears hanging from the top of the head, flaring out a little at the bottom.
        mount.position.set(s * 0.42, 0.3, -0.02)
        mount.rotation.z = s * 0.35
        flick.add(at(P.ball(markFur(fur), 0.075, 0.27, 0.15, FUR), 0, -0.22, 0))
        break
      }
    }
    center.add(mount)
    ears.push(flick)
  }
}

/** The animal's tail on the back of the hips; returns the group that wags. */
function buildTail(P: Parts, look: Dress, hips: Group): Object3D {
  const fur = look.fur
  const wag = at(new Group(), 0, 0.02, -0.21)
  switch (look.animal) {
    case 'bunny': {
      // A cloud of fluff balls rather than one smooth sphere.
      const puff = at(new Group(), 0, 0, -0.09)
      const pale = paleFur(fur)
      puff.add(P.ball(pale, 0.1, 0.1, 0.09, FUR))
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3
        puff.add(at(P.ball(pale, 0.062, 0.062, 0.062, FUR), Math.cos(a) * 0.075, Math.sin(a) * 0.075, -0.025))
      }
      wag.add(puff)
      break
    }
    case 'bear':
      wag.add(at(P.ball(fur, 0.075, 0.075, 0.07, FUR), 0, 0, -0.05))
      break
    case 'puppy': {
      const tilt = rot(new Group(), -0.75, 0, 0)
      tilt.add(at(P.capsule(fur, 0.045, 0.16, FUR), 0, 0.12, 0))
      tilt.add(at(P.ball(paleFur(fur), 0.052, 0.052, 0.052, FUR), 0, 0.22, 0))
      wag.add(tilt)
      break
    }
    case 'kitten': {
      const curve = new CatmullRomCurve3(
        [[0, 0, 0], [0, -0.02, -0.16], [0, 0.12, -0.3], [0.04, 0.34, -0.32], [0.1, 0.48, -0.24], [0.16, 0.52, -0.14]].map(([x, y, z]) => new Vector3(x, y, z)),
      )
      wag.add(P.mesh(P.geo('catTail', () => new TubeGeometry(curve, 40, 0.045, 10, false)), fur, FUR))
      // Tabby rings down the tail.
      const ring = P.geo('tailRing', () => new TorusGeometry(0.045, 0.013, 8, 20))
      for (const u of [0.38, 0.58, 0.78]) {
        const band = P.mesh(ring, markFur(fur), FUR)
        band.position.copy(curve.getPointAt(u))
        band.quaternion.setFromUnitVectors(Z_AXIS, curve.getTangentAt(u))
        wag.add(band)
      }
      wag.add(at(P.ball(paleFur(fur), 0.048, 0.048, 0.048, FUR), 0.16, 0.52, -0.14))
      break
    }
  }
  hips.add(wag)
  return wag
}

function buildHat(P: Parts, look: Dress, center: Group) {
  const color = look.hatColor
  switch (look.hat) {
    case 'straw': {
      const straw = '#ecc874'
      const hat = rot(at(new Group(), 0, 0.3, 0), -0.12, 0, 0.05)
      hat.add(P.mesh(P.geo('brim', () => new CylinderGeometry(0.88, 0.9, 0.035, 44)), straw, { rough: 0.85 }))
      hat.add(at(P.mesh(P.geo('crown', () => new CylinderGeometry(0.4, 0.47, 0.33, 36)), straw, { rough: 0.85 }), 0, 0.17, 0))
      hat.add(at(P.mesh(P.geo('band', () => new CylinderGeometry(0.468, 0.472, 0.09, 36)), color), 0, 0.07, 0))
      center.add(hat)
      break
    }
    case 'cap': {
      const hat = rot(at(new Group(), 0, 0.16, -0.02), -0.1, 0, 0)
      const dome = P.mesh(P.geo('capDome', () => new SphereGeometry(0.56, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2)), color, { double: true })
      dome.scale.y = 0.8
      hat.add(dome)
      const brim = P.mesh(P.geo('capBrim', () => new CylinderGeometry(0.36, 0.36, 0.04, 28, 1, false, -Math.PI / 2, Math.PI)), tint(color, 0.85))
      hat.add(rot(at(brim, 0, 0.0, 0.47), 0.2, 0, 0))
      hat.add(at(P.ball(tint(color, 0.85), 0.05), 0, 0.45, 0))
      center.add(hat)
      break
    }
    case 'beanie': {
      const hat = rot(at(new Group(), 0, 0.2, -0.02), -0.1, 0, 0)
      const dome = P.mesh(P.geo('capDome575', () => new SphereGeometry(0.575, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2)), color, { double: true, rough: 0.9 })
      dome.scale.y = 0.82
      hat.add(dome)
      const fold = P.mesh(P.geo('beanieFold', () => new TorusGeometry(0.565, 0.068, 12, 44)), tint(color, 0.85), { rough: 0.9 })
      hat.add(rot(fold, Math.PI / 2, 0, 0))
      hat.add(at(P.ball('#fffaf0', 0.12, 0.12, 0.12, { rough: 1 }), 0, 0.5, 0))
      center.add(hat)
      break
    }
    case 'crown': {
      const gold = { rough: 0.35, metal: 0.25 }
      const hat = rot(at(new Group(), 0, 0.4, 0), -0.04, 0, 0.1)
      hat.add(P.mesh(P.geo('crownBand', () => new CylinderGeometry(0.32, 0.3, 0.14, 40, 1, true)), '#f6c445', { ...gold, double: true }))
      const point = P.geo('crownPoint', () => new ConeGeometry(0.08, 0.17, 16))
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        hat.add(at(P.mesh(point, '#f6c445', gold), Math.sin(a) * 0.31, 0.15, Math.cos(a) * 0.31))
        hat.add(at(P.ball('#f6c445', 0.034, 0.034, 0.034, gold), Math.sin(a) * 0.31, 0.25, Math.cos(a) * 0.31))
      }
      hat.add(at(P.ball(color, 0.045, 0.045, 0.02, { rough: 0.15 }), 0, 0, 0.31))
      center.add(hat)
      break
    }
    case 'flower': {
      // Low on the side of the head, at the base of the ear.
      const flower = onHead(new Group(), 52, 64, 0.53)
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        flower.add(at(P.ball(color, 0.075, 0.075, 0.035), Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0))
      }
      flower.add(at(P.ball('#ffd84a', 0.055, 0.055, 0.04), 0, 0, 0.02))
      center.add(flower)
      break
    }
    case 'none':
      break
  }
}

// ---------- body ----------

function buildTorso(P: Parts, look: Dress, chest: Group) {
  const bare = look.top === 'none'
  const color = bare ? look.fur : look.topColor
  const profile = [
    [0.001, -0.06], [0.19, -0.05], [0.27, 0.02], [0.29, 0.13], [0.27, 0.28], [0.22, 0.41], [0.13, 0.5], [0.001, 0.53],
  ].map(([r, y]) => new Vector2(r, y))
  const torso = P.mesh(P.geo('torso', () => new LatheGeometry(profile, 32)), color, bare ? FUR : undefined)
  torso.scale.z = 0.86
  chest.add(torso)
  // Bare fur shows a soft pale tummy and a fluffy ruff under the chin.
  if (bare) {
    const pale = paleFur(look.fur)
    chest.add(at(P.ball(pale, 0.19, 0.22, 0.09, FUR), 0, 0.15, 0.175))
    // The puppy's darker spot on its back.
    if (look.animal === 'puppy') chest.add(rot(at(P.ball(markFur(look.fur), 0.15, 0.13, 0.06, FUR), 0.07, 0.24, -0.2), 0.2, 0, 0.3))
    const tuft = P.geo('tuft', () => new LatheGeometry(TUFT.map(([r, y]) => new Vector2(r, y)), 18))
    for (const x of [-0.1, -0.05, 0, 0.05, 0.1]) {
      const fluff = P.mesh(tuft, pale, FUR)
      const k = 1 - Math.abs(x) * 2.5
      fluff.scale.set(0.05, 0.13 * k, 0.04)
      fluff.position.set(x, 0.45, 0.2 - Math.abs(x) * 0.5)
      fluff.quaternion.setFromUnitVectors(Y_AXIS, new Vector3(x * 1.5, -1, 0.55).normalize())
      chest.add(fluff)
    }
  }

  switch (look.top) {
    case 'hoodie': {
      const hood = P.mesh(P.geo('hood', () => new TorusGeometry(0.22, 0.09, 12, 28)), tint(color, 0.88))
      chest.add(rot(at(hood, 0, 0.48, -0.1), Math.PI / 2 + 0.5, 0, 0))
      chest.add(at(P.ball(tint(color, 0.88), 0.23, 0.16, 0.11), 0, 0.52, -0.28))
      chest.add(at(P.ball(tint(color, 0.88), 0.16, 0.08, 0.05), 0, 0.1, 0.24))
      for (const s of [1, -1]) chest.add(at(P.capsule('#fffaf0', 0.013, 0.08), s * 0.06, 0.36, 0.23))
      break
    }
    case 'jacket': {
      // Just a zip line and a soft collar, a shade off the jacket color.
      const trim = tint(color, isLight(color) ? 0.82 : 1.25)
      chest.add(at(P.capsule(trim, 0.011, 0.3), 0, 0.2, 0.248))
      for (const s of [1, -1]) chest.add(rot(at(P.ball(trim, 0.1, 0.05, 0.045), s * 0.1, 0.46, 0.16), 0, 0, s * 0.5))
      break
    }
    case 'tee':
      chest.add(at(P.ball(tint(color, 1.45), 0.045, 0.045, 0.016), 0.11, 0.28, 0.242))
      break
    case 'tank':
      break
  }

  if (look.cape) {
    // A little superhero cape hanging from the shoulders, flaring out behind, with gold clasps.
    const cape = P.mesh(
      P.geo('cape', () => new CylinderGeometry(0.2, 0.42, 0.66, 30, 4, true, Math.PI / 2 - 0.3, Math.PI + 0.6)),
      look.cape,
      { double: true, rough: 0.55 },
    )
    cape.scale.z = 0.92
    chest.add(rot(at(cape, 0, 0.17, -0.03), 0.16, 0, 0))
    const collar = P.mesh(P.geo('capeCollar', () => new TorusGeometry(0.2, 0.035, 8, 28, Math.PI + 0.6)), tint(look.cape, 0.8), { rough: 0.55 })
    chest.add(rot(at(collar, 0, 0.49, -0.03), Math.PI / 2, 0, Math.PI / 2 - 0.3))
    for (const x of [-1, 1]) chest.add(at(P.ball('#f6c445', 0.034, 0.034, 0.02, { rough: 0.3, metal: 0.3 }), x * 0.14, 0.45, 0.12))
  }
}

function buildArm(P: Parts, look: Dress, side: 1 | -1): Group {
  const arm = at(new Group(), side * 0.27, 0.42, 0)
  const fur = look.fur
  const color = look.topColor
  switch (look.top) {
    case 'hoodie':
    case 'jacket':
      arm.add(at(P.capsule(color, 0.082, 0.14), 0, -0.12, 0))
      arm.add(at(P.capsule(tint(color, 0.85), 0.086, 0.01), 0, -0.23, 0))
      break
    case 'tee':
      arm.add(at(P.capsule(color, 0.098, 0.04), 0, -0.05, 0))
      arm.add(at(P.capsule(fur, 0.072, 0.1, FUR), 0, -0.18, 0))
      break
    case 'tank':
    case 'none':
      arm.add(at(P.capsule(fur, 0.074, 0.16, FUR), 0, -0.15, 0))
      break
  }
  arm.add(at(P.ball(fur, 0.092, 0.092, 0.092, FUR), 0, -0.3, 0))
  // Pink paw beans on the front of the paw: one pad and three toes.
  const bean = '#ff9bb3'
  arm.add(at(P.ball(bean, 0.036, 0.03, 0.014, { rough: 0.45 }), 0, -0.322, 0.084))
  for (const x of [-0.034, 0, 0.034]) {
    arm.add(at(P.ball(bean, 0.013, 0.013, 0.008, { rough: 0.45 }), x, -0.27 - Math.abs(x) * 0.4, 0.079 - Math.abs(x) * 0.25))
  }
  return arm
}

function buildLeg(P: Parts, look: Dress, side: 1 | -1): Group {
  const leg = at(new Group(), side * 0.12, 0, 0)
  const fur = look.fur
  const color = look.bottomColor
  if (look.bottom === 'pants') {
    leg.add(at(P.capsule(color, 0.11, 0.16), 0, -0.2, 0))
  } else if (look.bottom === 'shorts') {
    leg.add(at(P.capsule(color, 0.12, 0.02), 0, -0.08, 0))
    leg.add(at(P.capsule(fur, 0.078, 0.1, FUR), 0, -0.26, 0))
  } else {
    leg.add(at(P.capsule(fur, 0.078, 0.2, FUR), 0, -0.22, 0))
  }

  const shoes = look.shoeColor
  const foot = at(new Group(), 0, -0.38, 0.03)
  if (look.shoes === 'boots') {
    foot.add(at(P.mesh(P.geo('bootShaft', () => new CylinderGeometry(0.122, 0.122, 0.2, 22)), shoes), 0, 0.1, -0.01))
    foot.add(at(P.ball(shoes, 0.135, 0.1, 0.19), 0, 0.02, 0.02))
    foot.add(at(P.ball(tint(shoes, 0.7), 0.14, 0.04, 0.195), 0, -0.05, 0.02))
    const cuff = P.mesh(P.geo('bootCuff', () => new TorusGeometry(0.122, 0.03, 8, 24)), tint(shoes, 1.25))
    foot.add(rot(at(cuff, 0, 0.2, -0.01), Math.PI / 2, 0, 0))
  } else if (look.shoes === 'sneakers') {
    foot.add(at(P.ball(shoes, 0.13, 0.1, 0.18), 0, 0.02, 0))
    foot.add(at(P.ball('#fffaf0', 0.135, 0.04, 0.185), 0, -0.05, 0))
  } else {
    // Bare paw with three little toes along the front.
    foot.add(at(P.ball(fur, 0.125, 0.095, 0.17, FUR), 0, 0.01, 0.01))
    for (const x of [-0.06, 0, 0.06]) foot.add(at(P.ball(fur, 0.048, 0.044, 0.05, FUR), x, -0.005, 0.14 - Math.abs(x) * 0.4))
  }
  leg.add(foot)
  return leg
}

function buildHips(P: Parts, look: Dress, hips: Group) {
  const color = look.bottom === 'none' ? look.fur : look.bottomColor
  hips.add(P.ball(color, 0.27, 0.15, 0.23, look.bottom === 'none' ? FUR : undefined))
}

// ---------- vegetables ----------

const CARROT = [[0, -0.2], [0.014, -0.17], [0.034, -0.08], [0.054, 0.03], [0.066, 0.12], [0.06, 0.16], [0.032, 0.182], [0, 0.186]]

/** The vegetable held in the paw, built around the grip and pointing up its local Y. */
function buildVeggie(P: Parts, kind: AvatarLook['veggie']): Group {
  const veg = new Group()
  const glossy = { rough: 0.3 }
  const leaf = '#5fb84a'
  const shine = (x: number, y: number, z: number, r = 0.018) => at(P.ball('#ffffff', r, r * 1.4, r * 0.5, { basic: true, opacity: 0.7 }), x, y, z)
  switch (kind) {
    case 'carrot': {
      veg.add(P.mesh(P.geo('carrot', () => new LatheGeometry(CARROT.map(([r, y]) => new Vector2(r, y)), 20)), '#f28a2e', { rough: 0.6 }))
      // Little creases across the front.
      const crease = P.geo('carrotCrease', () => new TorusGeometry(1, 0.12, 4, 12, 1.4))
      for (const [y, r] of [[-0.09, 0.034], [0.0, 0.05], [0.08, 0.063]]) {
        const c = P.mesh(crease, '#d4691c', { rough: 0.6 })
        c.scale.set(r, r, r * 0.4)
        veg.add(rot(at(c, 0, y, 0), Math.PI / 2, 0, Math.PI / 2 - 0.7))
      }
      for (const [x, z, h] of [[0, 0, 0.15], [0.05, 0.01, 0.12], [-0.05, 0.01, 0.12], [0, -0.04, 0.11]]) {
        veg.add(between(P.capsule(leaf, 0.017, h - 0.02), new Vector3(0, 0.17, 0), new Vector3(x, 0.17 + h, z)))
      }
      break
    }
    case 'broccoli': {
      veg.add(at(P.capsule('#a6d977', 0.036, 0.13), 0, -0.07, 0))
      for (const x of [-1, 1]) veg.add(between(P.capsule('#a6d977', 0.022, 0.06), new Vector3(0, -0.02, 0), new Vector3(x * 0.06, 0.06, 0)))
      const greens = ['#3f9a3a', '#4fae45', '#46a23f']
      veg.add(at(P.ball(greens[0], 0.075), 0, 0.11, 0))
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2
        veg.add(at(P.ball(greens[(i % 2) + 1], 0.056), Math.cos(a) * 0.075, 0.07 + (i % 2) * 0.02, Math.sin(a) * 0.075))
      }
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.5
        veg.add(at(P.ball(greens[1], 0.048), Math.cos(a) * 0.04, 0.16, Math.sin(a) * 0.04))
      }
      break
    }
    case 'tomato': {
      veg.add(P.ball('#e8382e', 0.1, 0.088, 0.1, glossy))
      veg.add(shine(0.04, 0.03, 0.085))
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        const sepal = rot(at(P.ball(leaf, 0.042, 0.012, 0.016), Math.cos(a) * 0.035, 0.088, Math.sin(a) * 0.035), 0, -a, -0.25)
        veg.add(sepal)
      }
      veg.add(at(P.capsule('#3f8a34', 0.012, 0.035), 0, 0.11, 0))
      break
    }
    case 'corn': {
      veg.add(at(P.capsule('#f7c948', 0.058, 0.2), 0, 0.04, 0))
      // Rows of plump kernels.
      const kernel = P.geo('kernel', () => new SphereGeometry(1, 10, 8))
      for (let row = 0; row < 6; row++) {
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2 + (row % 2) * 0.35
          const k = P.mesh(kernel, '#ffe066', { rough: 0.4 })
          k.scale.set(0.022, 0.024, 0.02)
          k.position.set(Math.cos(a) * 0.056, -0.05 + row * 0.036, Math.sin(a) * 0.056)
          veg.add(k)
        }
      }
      // Husk leaves peeled back around the base.
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.4
        const husk = at(P.ball('#8cc760', 0.05, 0.15, 0.018), Math.cos(a) * 0.06, -0.07, Math.sin(a) * 0.06)
        husk.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35)
        veg.add(husk)
      }
      break
    }
    case 'eggplant': {
      const purple = '#6b3fa0'
      veg.add(at(P.ball(purple, 0.085, 0.11, 0.085, glossy), 0, -0.05, 0))
      veg.add(at(P.ball(purple, 0.062, 0.08, 0.062, glossy), 0.012, 0.06, 0))
      veg.add(shine(0.035, -0.02, 0.075))
      veg.add(at(P.mesh(P.geo('eggCap', () => new ConeGeometry(0.06, 0.07, 14)), '#4f9a3f'), 0.014, 0.13, 0))
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2
        veg.add(rot(at(P.ball('#4f9a3f', 0.03, 0.05, 0.012), 0.014 + Math.cos(a) * 0.045, 0.1, Math.sin(a) * 0.045), Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5))
      }
      veg.add(at(P.capsule('#3f7a32', 0.013, 0.05), 0.014, 0.18, 0))
      break
    }
    case 'pepper': {
      const red = '#e8343a'
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        veg.add(at(P.ball(red, 0.062, 0.095, 0.062, glossy), Math.cos(a) * 0.036, 0, Math.sin(a) * 0.036))
      }
      veg.add(shine(0.05, 0.03, 0.07))
      veg.add(at(P.ball('#3f8a34', 0.045, 0.016, 0.045), 0, 0.09, 0))
      veg.add(at(P.capsule('#3f8a34', 0.015, 0.05), 0, 0.12, 0))
      break
    }
  }
  return veg
}

/** Right fist of the hero models, where they hold their vegetable. */
const FIST = new Vector3(-0.43, 0.8, 0.42)

/**
 * A hero is one sculpted model (cape, mask or suit included), so it wears no outfit and moves
 * as one body: `head` tips the whole thing from its base and `squash` stretches it. The limb groups
 * are empty stand-ins so the shared posing code runs unchanged.
 */
function buildHero(kind: HeroKind): AvatarRig {
  const P = new Parts()
  const root = new Group()
  const body = new Group()
  const head = new Group()
  const squash = new Group()
  root.add(body)
  body.add(head)
  head.add(squash)

  // The model loads once; until then the first build stands empty and fills in when it arrives.
  let alive = true
  const place = (model: Group) => {
    if (alive) squash.add(model.clone())
  }
  const ready = heroTemplate(kind)
  if (ready) place(ready)
  else loadHero(kind).then(place, () => {})

  // Empty-handed: the fist holds nothing, but the throw pose still drives `held`.
  const held = rot(at(new Group(), FIST.x, FIST.y, FIST.z), 0.75, 0, 0.2)
  squash.add(held)

  const stub = () => new Group()
  return {
    root,
    body,
    head,
    armL: stub(),
    armR: stub(),
    legL: stub(),
    legR: stub(),
    eyes: [],
    ears: [],
    tail: stub(),
    wagSpeed: 0,
    held,
    squash,
    dispose: () => {
      alive = false
      P.dispose()
    },
  }
}

// ---------- food buddies ----------

/** The tomato buddy's round body: center height and radii (across, up, front to back). */
const TOMATO = { y: 0.6, a: 0.62, b: 0.54, c: 0.58 }

/** Places obj on the front of the tomato's body at (x, y) from its center, facing out, `lift` off the skin. */
function onTomato<T extends Object3D>(obj: T, x: number, y: number, lift = 0): T {
  const { a, b, c } = TOMATO
  const z = c * Math.sqrt(Math.max(0, 1 - (x / a) ** 2 - (y / b) ** 2))
  const n = new Vector3(x / (a * a), y / (b * b), z / (c * c)).normalize()
  obj.position.set(x, TOMATO.y + y, z).addScaledVector(n, lift)
  obj.quaternion.setFromUnitVectors(Z_AXIS, n)
  return obj
}

/**
 * A cheerful tomato with a leafy cap, little vine arms and feet, holding a cherry tomato to throw.
 * It moves like a hero (one body that tips, breathes and bounces) but has a real right arm for the
 * throw. Stands on y=0 facing +Z, about 1.3 tall.
 */
export function buildTomatoBuddy(): AvatarRig {
  const P = new Parts()
  const root = new Group()
  const body = new Group()
  const head = new Group()
  const squash = new Group()
  root.add(body)
  body.add(head)
  head.add(squash)
  const red = '#e8382e'
  const glossy = { rough: 0.32 }
  const leaf = '#5fb84a'
  const vine = '#4f9a3f'
  const eyes: Object3D[] = []

  const legL = at(new Group(), 0.2, 0, 0)
  const legR = at(new Group(), -0.2, 0, 0)
  for (const leg of [legL, legR]) leg.add(at(P.ball(vine, 0.13, 0.08, 0.17), 0, 0.07, 0.06))
  squash.add(legL, legR)

  squash.add(at(P.ball(red, TOMATO.a, TOMATO.b, TOMATO.c, glossy), 0, TOMATO.y, 0))
  // Soft lobes around the shoulders, with a dip at the front like a real tomato.
  for (let i = 0; i < 5; i++) {
    const az = (i / 5) * Math.PI * 2 + Math.PI / 5
    squash.add(at(P.ball(red, 0.28, 0.22, 0.28, glossy), Math.sin(az) * 0.28, TOMATO.y + 0.26, Math.cos(az) * 0.27))
  }
  squash.add(rot(onTomato(P.ball('#ffffff', 0.12, 0.065, 0.02, { basic: true, opacity: 0.55 }), -0.3, 0.26, 0.01), 0, 0, 0.5))

  // Leafy cap and stem.
  const cap = at(new Group(), 0, TOMATO.y + TOMATO.b - 0.02, 0)
  for (let i = 0; i < 5; i++) {
    const spoke = rot(new Group(), 0, (i / 5) * Math.PI * 2 + 0.3, 0)
    spoke.add(rot(at(P.ball(leaf, 0.2, 0.035, 0.075), 0.15, -0.02, 0), 0, 0, -0.25))
    cap.add(spoke)
  }
  cap.add(rot(at(P.capsule('#3f7a32', 0.04, 0.1), 0.01, 0.08, 0), 0, 0, -0.2))
  squash.add(cap)

  // Face: big sparkly eyes, rosy cheeks and an open smile.
  for (const s of [1, -1]) {
    const eye = onTomato(buildEye(P, '#3a2216', s), s * 0.19, 0.02)
    eye.scale.setScalar(1.15)
    squash.add(eye)
    eyes.push(eye)
    squash.add(onTomato(P.blush(0.1, 0.06), s * 0.35, -0.12, 0.012))
  }
  const mouth = onTomato(new Group(), 0, -0.13, 0.008)
  const smile = P.mesh(P.geo('smile', () => new CircleGeometry(1, 20, Math.PI, Math.PI)), '#5a1a14', { rough: 0.5 })
  smile.scale.set(0.075, 0.065, 1)
  mouth.add(smile)
  mouth.add(at(P.ball('#ff7d8a', 0.035, 0.02, 0.008), 0, -0.042, 0.002))
  squash.add(mouth)

  const arm = (side: 1 | -1) => {
    const g = at(new Group(), side * 0.6, TOMATO.y + 0.02, 0.04)
    g.add(at(P.capsule(vine, 0.045, 0.14), 0, -0.1, 0))
    g.add(at(P.ball(vine, 0.075), 0, -0.21, 0))
    return g
  }
  const armL = arm(1)
  const armR = arm(-1)
  squash.add(armL, armR)
  const held = rot(at(new Group(), 0, -0.24, 0.06), 0.75, 0, 0.2)
  const veggie = buildVeggie(P, 'tomato')
  veggie.scale.setScalar(1.3)
  held.add(veggie)
  armR.add(held)

  const stub = () => new Group()
  return { root, body, head, armL, armR, legL, legR, eyes, ears: [], tail: stub(), wagSpeed: 0, held, squash, dispose: () => P.dispose() }
}

export function buildAvatar(choice: AvatarLook): AvatarRig {
  if (isHero(choice.animal)) return buildHero(choice.animal)
  const look = dress(choice)
  const P = new Parts()
  const eyes: Object3D[] = []
  const ears: Object3D[] = []

  const root = new Group()
  const body = new Group()
  root.add(body)

  const hips = at(new Group(), 0, HIP_Y, 0)
  const chest = at(new Group(), 0, HIP_Y, 0)
  body.add(hips, chest)

  buildHips(P, look, hips)
  const tail = buildTail(P, look, hips)
  const legL = buildLeg(P, look, 1)
  const legR = buildLeg(P, look, -1)
  hips.add(legL, legR)

  buildTorso(P, look, chest)
  const armL = buildArm(P, look, 1)
  const armR = buildArm(P, look, -1)
  chest.add(armL, armR)
  // Held up and a little forward in the paw.
  const held = rot(at(new Group(), 0, -0.34, 0.08), 0.75, 0, 0.2)
  // A bit oversized, toy-style, so it reads at a glance.
  const veggie = buildVeggie(P, look.veggie)
  veggie.scale.setScalar(1.35)
  held.add(veggie)
  armR.add(held)

  const head = at(new Group(), 0, NECK_Y, 0)
  const center = at(new Group(), 0, HEAD_Y, 0)
  center.scale.setScalar(HEAD_SCALE)
  head.add(center)
  chest.add(head)

  buildFace(P, look, center, eyes, look.hat === 'none' || look.hat === 'flower')
  buildEars(P, look, center, ears)
  buildHat(P, look, center)

  return { root, body, head, armL, armR, legL, legR, eyes, ears, tail, wagSpeed: WAG_SPEED[look.animal], held, dispose: () => P.dispose() }
}

const WAG_SPEED: Record<AvatarLook['animal'], number> = { bunny: 7, kitten: 1.8, puppy: 10, bear: 4, cucumber: 0, onion: 0, panda: 0, bellpepper: 0, agent: 0 }

const lerp = (a: number, b: number, k: number) => a + (b - a) * k

export function poseAvatar(rig: AvatarRig, p: AvatarPose) {
  const t = p.t
  const walk = p.walk ?? 0
  const phase = p.walkPhase ?? 0
  const idle = 1 - walk
  const stride = Math.sin(phase)
  const breathe = Math.sin(t * 2.1)

  rig.legL.rotation.x = -0.6 * stride * walk
  rig.legR.rotation.x = 0.6 * stride * walk
  rig.armL.rotation.set(0.5 * stride * walk, 0, ARM_REST + breathe * 0.035 * idle)
  rig.armR.rotation.set(-0.5 * stride * walk, 0, -ARM_REST - breathe * 0.035 * idle)

  let y = breathe * 0.012 * idle + Math.abs(Math.cos(phase)) * 0.06 * walk
  rig.body.rotation.set(0.07 * walk, 0, stride * 0.04 * walk)
  rig.head.rotation.set(Math.sin(t * 0.7) * 0.03 * idle, Math.sin(t * 0.55) * 0.12 * idle, Math.sin(t * 0.9) * 0.05 * idle)

  const hop = p.hop !== undefined && p.hop >= 0 && p.hop < 1 ? Math.sin(p.hop * Math.PI) : 0
  y += hop * 0.26

  let excited = 0
  if (p.wave !== undefined && p.wave >= 0 && p.wave < 1) {
    const k = p.wave
    excited = Math.max(0, Math.min(1, k / 0.1, (1 - k) / 0.3))
    const b = Math.max(0, Math.min(1, k / 0.15, (1 - k) / 0.2))
    rig.armR.rotation.z = lerp(rig.armR.rotation.z, -2.5 + Math.sin(t * 15) * 0.35, b)
    rig.armR.rotation.x = lerp(rig.armR.rotation.x, 0, b)
    rig.head.rotation.z += 0.12 * b
    // No arm to wave, so a hero wiggles instead.
    if (rig.squash) rig.head.rotation.z += Math.sin(t * 15) * 0.07 * b
    if (k < 0.35) y += Math.sin((k / 0.35) * Math.PI) * 0.22
  }

  // Throw: wind the paw up behind the head, fling it forward, then settle back down. The vegetable
  // leaves at the fling and a fresh one pops into the paw near the end.
  const k = p.throw ?? -1
  if (k >= 0 && k < 1) {
    const back = 2.6
    const front = -1.4
    const swing = k < 0.2 ? lerp(0, back, k / 0.2) : k < 0.4 ? lerp(back, front, (k - 0.2) / 0.2) : lerp(front, 0, (k - 0.4) / 0.6)
    const b = Math.min(1, k / 0.1, (1 - k) / 0.3)
    rig.armR.rotation.x = swing
    rig.armR.rotation.z = lerp(rig.armR.rotation.z, -0.35, b)
    rig.body.rotation.y = Math.sin(Math.min(1, k / 0.5) * Math.PI) * -0.3
    rig.head.rotation.x -= 0.1 * b
    // A hero throws with its whole body: leans back on the wind-up, lunges on the fling.
    if (rig.squash) rig.head.rotation.x -= swing * 0.08
  }
  // Tending a field: leans over the soil, paws reaching down and busy, with a little working bob.
  const work = p.work ?? 0
  if (work > 0.001) {
    const dig = Math.sin(t * 9)
    rig.body.rotation.x += (rig.squash ? 0.12 : 0.24) * work
    rig.head.rotation.x += (rig.squash ? 0.04 : 0.12) * work
    rig.armR.rotation.x = lerp(rig.armR.rotation.x, -1.05 + dig * 0.22, work)
    rig.armL.rotation.x = lerp(rig.armL.rotation.x, -0.85 - dig * 0.18, work)
    y += (Math.abs(dig) * 0.02 - 0.04) * work
  }
  rig.held.visible = !(k >= THROW_RELEASE && k < 0.8) && work < 0.5
  rig.held.scale.setScalar(k >= 0.8 && k < 1 ? Math.min(1, ((k - 0.8) / 0.2) * 1.2) : 1)
  rig.body.position.y = y
  if (rig.squash) {
    // Stretches up when it breathes or leaves the ground, squats as each walking bounce lands, keeping its volume.
    const sy = 1 + breathe * 0.015 * idle + hop * 0.06 + (Math.abs(Math.cos(phase)) - 0.6) * 0.1 * walk
    rig.squash.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))
    rig.body.rotation.z += stride * 0.08 * walk
  }

  const c = (t + 0.7) % 3.6
  const open = c < 0.14 ? Math.abs(c / 0.07 - 1) : 1
  for (const e of rig.eyes) e.scale.y = Math.max(0.12, open)

  // Ears drift, and every few seconds one gives a quick flick; they lag back on a hop.
  const f = (t + 1.9) % 4.7
  const flick = f < 0.32 ? Math.sin((f / 0.32) * Math.PI) : 0
  for (const e of rig.ears) {
    const side = e.userData.side as number
    e.rotation.z = side * (Math.sin(t * 1.6 + side) * 0.04 + (side > 0 ? flick * 0.3 : 0)) + stride * 0.1 * walk
    e.rotation.x = -hop * 0.35
  }
  // The tail sways, and wags hard when tapped (blended, so the speed change never jumps).
  const sway = lerp(Math.sin(t * rig.wagSpeed) * 0.18, Math.sin(t * rig.wagSpeed * 2.5) * 0.45, excited)
  rig.tail.rotation.z = sway + stride * 0.2 * walk
}

/** Soft round contact shadow for the standalone views (the farm draws its own in 2D). */
export function makeShadow(): { mesh: Mesh; dispose(): void } {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(60,40,20,0.38)')
  g.addColorStop(0.6, 'rgba(60,40,20,0.16)')
  g.addColorStop(1, 'rgba(60,40,20,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const texture = new CanvasTexture(canvas)
  const geo = new CircleGeometry(0.7, 32)
  const mat = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  const mesh = new Mesh(geo, mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.002
  return {
    mesh,
    dispose: () => {
      texture.dispose()
      geo.dispose()
      mat.dispose()
    },
  }
}

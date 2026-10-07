import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { heroMidY, loadHero } from './hero'
import { type AnimalKind, DEFAULT_LOOK, isHero } from './look'
import { buildAvatar, poseAvatar } from './model'

const W = 180
const H = 240
const FRAME_BOTTOM = -0.12
const FRAME_TOP = 2.62
const FOV = 20

const cache = new Map<AnimalKind, Promise<string>>()
let queue: Promise<unknown> = Promise.resolve()
let pending = 0

/** A still, front-on picture of a character in its default look (data URL), for the character picker. */
export function avatarThumb(kind: AnimalKind): Promise<string> {
  let url = cache.get(kind)
  if (!url) {
    pending++
    // One offscreen renderer for the whole batch, so a row of thumbnails doesn't eat GL contexts.
    url = queue.then(() => render(kind)).finally(() => pending--)
    queue = url.catch(() => {})
    url.catch(() => cache.delete(kind))
    cache.set(kind, url)
  }
  return url
}

let gl: WebGLRenderer | null = null

async function render(kind: AnimalKind): Promise<string> {
  if (isHero(kind)) await loadHero(kind)
  if (!gl) {
    gl = new WebGLRenderer({ canvas: document.createElement('canvas'), alpha: true, antialias: true, preserveDrawingBuffer: true })
    gl.setPixelRatio(1)
    gl.setSize(W, H, false)
    gl.setClearColor(0x000000, 0)
  }

  const scene = new Scene()
  scene.add(new HemisphereLight('#fff6e8', '#9a7a5a', 2.2))
  const key = new DirectionalLight('#ffffff', 2.2)
  key.position.set(2.5, 4, 5)
  scene.add(key)

  const camera = new PerspectiveCamera(FOV, W / H, 0.1, 60)
  const midY = isHero(kind) ? heroMidY(kind) : (FRAME_TOP + FRAME_BOTTOM) / 2
  const tan = Math.tan((FOV / 2) * (Math.PI / 180))
  const dist = Math.max((FRAME_TOP - FRAME_BOTTOM) / 2 / tan, 1.15 / camera.aspect / tan)
  camera.position.set(0, midY + dist * 0.06, dist)
  camera.lookAt(0, midY, 0)

  const rig = buildAvatar({ ...DEFAULT_LOOK, animal: kind })
  rig.root.rotation.y = 0.25
  poseAvatar(rig, { t: 0, wave: Infinity, hop: Infinity })
  scene.add(rig.root)
  gl.render(scene, camera)
  const url = gl.domElement.toDataURL('image/png')
  rig.dispose()

  if (pending <= 1) {
    gl.dispose()
    gl.forceContextLoss()
    gl = null
  }
  return url
}

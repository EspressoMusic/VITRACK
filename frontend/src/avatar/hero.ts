import { Box3, Group, type Mesh, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import type { HeroKind } from './look'

/** Each sculpted hero's model in public/character, and its standing height in avatar units (an animal's head-top is about 2.2). */
const HEROES: Record<HeroKind, { file: string; height: number }> = {
  cucumber: { file: 'mascot.glb', height: 2.2 },
  // Round and wide, so a little shorter to take up about as much room as the cucumber.
  onion: { file: 'onion.glb', height: 1.9 },
  panda: { file: 'panda.glb', height: 2.1 },
  // Broad shoulders and a wide cape, so a little shorter like the onion.
  bellpepper: { file: 'bellpepper.glb', height: 2.0 },
  // Slim, so a little taller to take up about as much room.
  agent: { file: 'agent.glb', height: 2.35 },
}

/** Halfway up a hero, where the camera aims so a short one isn't left low in its frame. */
export const heroMidY = (kind: HeroKind) => HEROES[kind].height / 2

const templates: Partial<Record<HeroKind, Group>> = {}
const loading: Partial<Record<HeroKind, Promise<Group>>> = {}

/** The hero once it has loaded, or null before that. Clones share its geometry and textures. */
export function heroTemplate(kind: HeroKind): Group | null {
  return templates[kind] ?? null
}

/**
 * Loads a sculpted hero once, scaled to stand on y=0 centered and facing +Z like the animals.
 * A failed load is forgotten so the next build retries.
 */
export function loadHero(kind: HeroKind): Promise<Group> {
  const { file, height } = HEROES[kind]
  loading[kind] ??= new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync(`${import.meta.env.BASE_URL}character/${file}`)
    .then((gltf) => {
      const model = gltf.scene
      model.traverse((o) => {
        const mesh = o as Mesh
        if (!mesh.isMesh) return
        // The normals kept from the full-detail sculpt streak the simplified mesh; fresh ones are smooth.
        mesh.geometry.deleteAttribute('normal')
        mesh.geometry.computeVertexNormals()
      })
      model.updateMatrixWorld(true)
      const box = new Box3().setFromObject(model)
      const size = box.getSize(new Vector3())
      const center = box.getCenter(new Vector3())
      const s = height / size.y
      model.scale.setScalar(s)
      model.position.set(-center.x * s, -box.min.y * s, -center.z * s)
      const template = new Group()
      template.add(model)
      templates[kind] = template
      return template
    })
    .catch((err: unknown) => {
      delete loading[kind]
      throw err
    })
  return loading[kind]
}

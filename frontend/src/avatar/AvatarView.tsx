import { useEffect, useRef } from 'react'
import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { heroMidY } from './hero'
import { type AnimalKind, getAvatarLook, isHero, subscribeAvatarLook } from './look'
import { type AvatarRig, buildAvatar, makeShadow, poseAvatar } from './model'

const WAVE_MS = 1300
const HOP_MS = 420
// Vertical slice of the character the camera frames, in model units (feet at 0, bunny ear tips ≈ 2.55).
const FRAME_BOTTOM = -0.12
const FRAME_TOP = 2.62
const FOV = 20

/**
 * The player's 3D character on a transparent canvas. It idles (breathes, blinks, looks around),
 * hops when the outfit changes, and waves when tapped. With `spinnable`, dragging sideways
 * turns it around — used by the wardrobe preview so you can see the back of the outfit.
 */
export function AvatarView({ spinnable = false, onTap, className = '' }: { spinnable?: boolean; onTap?: () => void; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onTapRef = useRef(onTap)

  useEffect(() => {
    onTapRef.current = onTap
  })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    // A fresh canvas per mount: a canvas whose GL context was released can't be reused.
    const canvas = document.createElement('canvas')
    canvas.className = 'block h-full w-full'
    canvas.style.touchAction = spinnable ? 'none' : 'manipulation'
    canvas.style.cursor = 'pointer'
    host.appendChild(canvas)

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      // No WebGL (very old device) — leave the stage empty rather than crash the screen.
      canvas.remove()
      return
    }
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    const scene = new Scene()
    scene.add(new HemisphereLight('#fff6e8', '#9a7a5a', 2.2))
    const key = new DirectionalLight('#ffffff', 2.2)
    key.position.set(2.5, 4, 5)
    const rim = new DirectionalLight('#ffe7c2', 1.2)
    rim.position.set(-3, 3, -4)
    scene.add(key, rim)

    const shadow = makeShadow()
    scene.add(shadow.mesh)

    const camera = new PerspectiveCamera(FOV, 1, 0.1, 60)
    const frameH = FRAME_TOP - FRAME_BOTTOM
    // Heroes are shorter than the bunny's ears, so the camera aims at their own middle instead.
    const aimY = (animal: AnimalKind) => (isHero(animal) ? heroMidY(animal) : (FRAME_TOP + FRAME_BOTTOM) / 2)
    let midY = aimY(getAvatarLook().animal)

    let rig: AvatarRig = buildAvatar(getAvatarLook())
    scene.add(rig.root)
    let hopAt = -Infinity
    let waveAt = -Infinity

    const offLook = subscribeAvatarLook(() => {
      scene.remove(rig.root)
      rig.dispose()
      rig = buildAvatar(getAvatarLook())
      scene.add(rig.root)
      midY = aimY(getAvatarLook().animal)
      w = 0 // re-aim the camera on the next frame
      hopAt = performance.now()
    })

    // ---- drag to spin / tap to wave ----
    let spin = 0
    let spinVel = 0
    let drag: { id: number; x: number; lastX: number; moved: boolean } | null = null
    const onDown = (e: PointerEvent) => {
      drag = { id: e.pointerId, x: e.clientX, lastX: e.clientX, moved: false }
      if (spinnable) canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId || !spinnable) return
      if (Math.abs(e.clientX - drag.x) > 6) drag.moved = true
      const dx = e.clientX - drag.lastX
      drag.lastX = e.clientX
      spin += dx * 0.014
      spinVel = dx * 0.014
    }
    const onUp = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return
      const tapped = !drag.moved
      drag = null
      if (!tapped) return
      waveAt = performance.now()
      onTapRef.current?.()
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', () => (drag = null))

    let w = 0
    let h = 0
    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      // Measured every frame: a parent CSS transform (FitToBox scale) changes the on-screen size
      // without firing a resize, and the buffer should match real pixels to stay sharp.
      const rect = canvas.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      if (Math.abs(rect.width - w) > 0.5 || Math.abs(rect.height - h) > 0.5) {
        w = rect.width
        h = rect.height
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        // Fit the frame's height, or its width (~1 unit wide) on very narrow canvases.
        const fitH = frameH / 2 / Math.tan((FOV / 2) * (Math.PI / 180))
        const fitW = 1.15 / camera.aspect / Math.tan((FOV / 2) * (Math.PI / 180))
        const dist = Math.max(fitH, fitW)
        camera.position.set(0, midY + dist * 0.06, dist)
        camera.lookAt(0, midY, 0)
        camera.updateProjectionMatrix()
      }

      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!drag) {
        spinVel *= Math.pow(0.04, dt)
        spin += spinVel
      }

      const t = now / 1000
      rig.root.rotation.y = spin + Math.sin(t * 0.4) * 0.22
      poseAvatar(rig, { t, wave: (now - waveAt) / WAVE_MS, hop: (now - hopAt) / HOP_MS })
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      offLook()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      rig.dispose()
      shadow.dispose()
      renderer.dispose()
      // Free the GL context now instead of waiting for GC — tab switches remount this view.
      renderer.forceContextLoss()
      canvas.remove()
    }
  }, [spinnable])

  return <div ref={hostRef} className={`h-full w-full ${className}`} />
}

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, startAt: number, duration: number, volume: number) {
  const audio = getContext()
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  const t0 = audio.currentTime + startAt
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/** Soft, short tap — for picking a choice or an option. */
export function playTapSound(): void {
  tone(680, 0, 0.08, 0.05)
}

/** A slightly richer two-note chime — for advancing to the next step. */
export function playConfirmSound(): void {
  tone(560, 0, 0.09, 0.05)
  tone(840, 0.06, 0.14, 0.05)
}

/**
 * Plays a tap sound on every button press app-wide, without each component wiring it up
 * individually. Uses the capture phase so it still fires even when a handler calls
 * stopPropagation() (e.g. a remove button nested inside a card). Elements marked
 * `data-sound="off"` are skipped — for buttons that already trigger their own distinct sound.
 */
export function installButtonClickSounds(): () => void {
  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    const el = target?.closest('button, [role="button"]') as HTMLElement | null
    if (!el) return
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return
    if (el.dataset.sound === 'off') return
    playTapSound()
  }
  document.addEventListener('click', handler, true)
  return () => document.removeEventListener('click', handler, true)
}

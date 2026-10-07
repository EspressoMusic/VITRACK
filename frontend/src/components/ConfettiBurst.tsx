import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const CONFETTI_COLORS = ['#f5b942', '#e8952c', '#ffd166', '#f28c28', '#ffcb69', '#d9a441']

/** `short` = quick ~1.5s pop; `inline` = render in place (absolute) so a modal can layer it
 *  between its backdrop and its card instead of over everything. */
export function ConfettiBurst({ count = 28, short = false, inline = false }: { count?: number; short?: boolean; inline?: boolean } = {}) {
  const [visible, setVisible] = useState(true)
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * (short ? 0.15 : 0.4),
        duration: short ? 1.1 + Math.random() * 0.6 : 2.2 + Math.random() * 1.3,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        width: 5 + Math.random() * 5,
        height: 8 + Math.random() * 6,
      })),
    [count, short]
  )

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), short ? 1900 : 3800)
    return () => clearTimeout(t)
  }, [short])

  if (!visible) return null
  const layer = (
    <div className={`confetti-layer pointer-events-none ${inline ? 'absolute' : 'fixed z-50'} inset-0 overflow-hidden`}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
  if (inline) return layer
  // Portaled straight to <body> so this "fixed" layer is positioned against the real viewport,
  // not against whichever ancestor panel happens to have an active CSS transform (e.g. the
  // .panel-enter entrance animation), which would otherwise make it fall from mid-screen instead
  // of the very top.
  return createPortal(layer, document.body)
}

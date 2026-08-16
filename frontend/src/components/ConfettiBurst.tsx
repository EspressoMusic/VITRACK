import { useEffect, useMemo, useState } from 'react'

const CONFETTI_COLORS = ['#f5b942', '#e8952c', '#ffd166', '#f28c28', '#ffcb69', '#d9a441']

export function ConfettiBurst() {
  const [visible, setVisible] = useState(true)
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 2.2 + Math.random() * 1.3,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        width: 5 + Math.random() * 5,
        height: 8 + Math.random() * 6,
      })),
    []
  )

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3800)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null
  return (
    <div className="confetti-layer pointer-events-none fixed inset-0 z-50 overflow-hidden">
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
}

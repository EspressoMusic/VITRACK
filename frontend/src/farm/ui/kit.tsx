import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { CloseIcon } from '../../components/icons'

export const INK = '#000000'
export const CREAM = 'var(--surface-cream)'
export const BROWN = '#6b4423'
export const WHEAT = '#f5deb3'

/** Height of the app's bottom nav bar, which overlays the bottom of every panel. */
export const NAV_CLEARANCE = 'calc(4.25rem + 2px)'

/** Narrow tile label that never splits a word mid-way: a word too long for the tile shrinks the font until it fits. */
export function FitLabel({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = ''
      let size = parseFloat(getComputedStyle(el).fontSize)
      while (el.scrollWidth > el.clientWidth && size > 6) {
        size -= 0.5
        el.style.fontSize = `${size}px`
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children])
  return (
    <span ref={ref} className={`block w-full break-normal text-center ${className}`} style={style}>
      {children}
    </span>
  )
}

const BUTTON_COLORS = {
  green: { bg: '#7ac74f', fg: '#14320a' },
  amber: { bg: '#ffcf4a', fg: '#3a2a06' },
  cream: { bg: '#fdf3d9', fg: '#3a2a06' },
  red: { bg: '#f08a7e', fg: '#3d0d08' },
  brown: { bg: BROWN, fg: WHEAT },
}

export function GameButton({
  children,
  onClick,
  color = 'green',
  disabled,
  className = '',
  style,
  ariaLabel,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  color?: keyof typeof BUTTON_COLORS
  disabled?: boolean
  className?: string
  style?: CSSProperties
  ariaLabel?: string
}) {
  const c = BUTTON_COLORS[color]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-1 text-xs font-extrabold leading-tight transition active:translate-y-0.5 active:shadow-none disabled:opacity-45 ${className}`}
      style={{ backgroundColor: c.bg, color: c.fg, border: `2px solid ${INK}`, boxShadow: disabled ? 'none' : `0 2px 0 ${INK}`, ...style }}
    >
      {children}
    </button>
  )
}

/** Modal card that sits inside the farm panel. Sized to fit without scrolling. */
export function Sheet({ title, onClose, children, closeLabel }: { title: ReactNode; onClose: () => void; children: ReactNode; closeLabel: string }) {
  return (
    <div
      className="modal-backdrop-enter absolute inset-x-0 top-0 z-40 flex items-end justify-center px-3 pt-14"
      style={{ bottom: NAV_CLEARANCE, backgroundColor: 'rgba(20,14,4,0.35)' }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal-card-enter mb-3 flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl"
        style={{ border: `3px solid ${INK}`, boxShadow: '0 5px 0 #c9a463', backgroundColor: CREAM }}
      >
        <div className="relative flex shrink-0 items-center justify-center px-10 py-2" style={{ backgroundColor: BROWN }}>
          <h2 className="text-sm font-extrabold" style={{ color: WHEAT }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full"
            style={{ color: WHEAT }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex min-h-0 flex-col gap-2 p-2.5">{children}</div>
      </div>
    </div>
  )
}

/** Drawn coin — the 🪙 emoji is missing from older emoji fonts (e.g. Windows 10). */
export function CoinIcon({ className = 'h-[1.05em] w-[1.05em]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`inline-block shrink-0 ${className}`} aria-hidden>
      <circle cx="10" cy="10" r="8.6" fill="#ffcf4a" stroke="#000" strokeWidth="1.8" />
      <circle cx="10" cy="10" r="5.2" fill="none" stroke="#d99a1e" strokeWidth="1.6" />
      <path d="M7.2 7.4a3.4 3.4 0 0 1 2.6-1.7" fill="none" stroke="#fff6c9" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function CoinAmount({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 font-extrabold tabular-nums ${className}`} dir="ltr">
      <CoinIcon />
      {value.toLocaleString('en-US')}
    </span>
  )
}

export function ProgressBar({ fraction, color = '#7ac74f', height = 6 }: { fraction: number; color?: string; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ height, backgroundColor: 'rgba(0,0,0,0.15)', border: `1.5px solid ${INK}` }}>
      <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${Math.round(Math.min(1, Math.max(0, fraction)) * 100)}%`, backgroundColor: color }} />
    </div>
  )
}

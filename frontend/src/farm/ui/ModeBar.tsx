import type { ReactNode } from 'react'
import { CloseIcon } from '../../components/icons'
import { CREAM, INK, NAV_CLEARANCE } from './kit'

/** Bar shown at the bottom while placing a building or planting — replaces the bottom menu. */
export function ModeBar({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 z-20 flex justify-center" style={{ bottom: `calc(${NAV_CLEARANCE} + 0.75rem)` }}>
      <div
        className="farm-pop pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-2xl p-1.5"
        style={{ backgroundColor: CREAM, border: `2px solid ${INK}`, boxShadow: `0 3px 0 ${INK}` }}
      >
        {children}
      </div>
    </div>
  )
}

export function RoundAction({
  kind,
  onClick,
  disabled,
  label,
}: {
  kind: 'ok' | 'cancel'
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black transition active:translate-y-0.5 disabled:opacity-40"
      style={{
        backgroundColor: kind === 'ok' ? '#7ac74f' : '#f08a7e',
        border: `2px solid ${INK}`,
        boxShadow: disabled ? 'none' : `0 2px 0 ${INK}`,
        color: kind === 'ok' ? '#14320a' : '#3d0d08',
      }}
    >
      {kind === 'ok' ? '✓' : <CloseIcon className="h-5 w-5" />}
    </button>
  )
}

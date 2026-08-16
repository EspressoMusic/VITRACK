import type { CoverageStatus } from '../lib/nutrients'
import { STATUS_LABEL } from '../lib/nutrients'

const STATUS_VAR: Record<CoverageStatus, string> = {
  good: 'var(--status-good)',
  warning: 'var(--status-warning)',
  serious: 'var(--status-serious)',
  critical: 'var(--status-critical)',
}

const STATUS_SOFT_VAR: Record<CoverageStatus, string> = {
  good: 'var(--status-good-soft)',
  warning: 'var(--status-warning-soft)',
  serious: 'var(--status-serious-soft)',
  critical: 'var(--status-critical-soft)',
}

export function StatusDot({ status, showLabel = false }: { status: CoverageStatus; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: STATUS_VAR[status] }}
        aria-hidden
      />
      {showLabel && (
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {STATUS_LABEL[status]}
        </span>
      )}
    </span>
  )
}

export { STATUS_VAR, STATUS_SOFT_VAR }

export interface BodyFillBand {
  id: string
  color: string
  label: string
  /** 0-100+, how close today's intake is to this nutrient's personal daily target. */
  percent: number
}

/** A simple bust silhouette used as the liquid's container — easier to read at small sizes
 *  than a full standing figure, and all we need to sell "a body filling up." */
const BODY_PATH =
  'M50 4 C59 4 66 11 66 20 C66 26 63.5 31 60 34.5 C71 39 80 49 80 62 L80 118 C80 124.5 74.5 130 68 130 L32 130 C25.5 130 20 124.5 20 118 L20 62 C20 49 29 39 40 34.5 C36.5 31 34 26 34 20 C34 11 41 4 50 4 Z'

const TORSO_TOP = 34.5
const TORSO_BOTTOM = 130
const VIEW_W = 100
const VIEW_H = 132

/**
 * Body-shaped gauge where each nutrient gets its own horizontal liquid band, stacked inside
 * the silhouette, each band's fill (left-to-right) driven independently by that nutrient's own
 * percent of its personal daily target — "each vitamin/macro is a different liquid."
 */
export function BodyFillGauge({ bands }: { bands: BodyFillBand[] }) {
  const bandHeight = (TORSO_BOTTOM - TORSO_TOP) / bands.length
  const clipId = 'body-fill-clip'

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="mx-auto h-full max-h-full w-auto" role="img" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      <path d={BODY_PATH} fill="var(--surface-2)" />

      <g clipPath={`url(#${clipId})`}>
        {bands.map((band, i) => {
          const y = TORSO_TOP + i * bandHeight
          const fillWidth = Math.max(0, Math.min(100, band.percent)) * (VIEW_W / 100)
          return (
            <g key={band.id}>
              <rect x={0} y={y} width={VIEW_W} height={bandHeight + 0.5} fill="rgba(255,255,255,0.35)" />
              <rect x={0} y={y} width={fillWidth} height={bandHeight + 0.5} fill={band.color} />
              <rect x={0} y={y} width={VIEW_W} height={0.6} fill="rgba(0,0,0,0.12)" />
            </g>
          )
        })}
      </g>

      <path d={BODY_PATH} fill="none" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}
